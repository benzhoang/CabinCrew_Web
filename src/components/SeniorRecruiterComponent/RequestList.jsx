import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCampaignRequestList } from "../../service/api2.js";

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status?.toLowerCase() || "";
    switch (normalizedStatus) {
      case "approved":
        return {
          className: "bg-green-100 text-green-700 border-green-200",
          text: "Approved",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-600 border-gray-200",
          text: status || "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`${config.className} inline-block rounded-full border px-2 py-0.5 text-xs font-medium`}
    >
      {config.text}
    </span>
  );
};

const getRequestTypeLabel = (requestType) => {
  // Normalize requestType to lowercase for comparison
  const normalizedType = requestType?.toLowerCase() || "";
  switch (normalizedType) {
    case "recruitment":
      return "Recruitment";
    case "promotion":
      return "Promotion";
    default:
      return requestType || "Unknown";
  }
};

const RequestTypeBadge = ({ type }) => {
  const normalizedType = type?.toLowerCase() || "";
  const label = getRequestTypeLabel(type);
  const className =
    normalizedType === "promotion"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : normalizedType === "recruitment"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <span
      className={`${className} inline-block rounded-full border px-2 py-0.5 text-xs font-medium`}
    >
      {label}
    </span>
  );
};

// Hàm lấy màu cho Position (Purser và Cabin Crew với màu khác, không trùng với Type)
const getPositionColor = (position) => {
  if (!position) return "bg-gray-100 text-gray-800 border-gray-300";

  const pos = position.toLowerCase();
  if (pos.includes("purser")) {
    return "bg-orange-100 text-orange-800 border-orange-300";
  } else if (pos.includes("cabin crew")) {
    return "bg-teal-100 text-teal-800 border-teal-300";
  }
  return "bg-gray-100 text-gray-800 border-gray-300";
};

const CampaignCard = ({ request }) => {
  const navigate = useNavigate();

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {request.campaignName}
            </h3>
          </div>
          <div className="grid grid-cols-1 mt-2 text-sm text-gray-700 md:grid-cols-3 gap-x-8 gap-y-2">
            <div>
              <span className="text-gray-500">Partner:</span>{" "}
              <span className="bg-gray-100 text-gray-700 border-gray-300 inline-block rounded-full border px-2 py-0.5 text-xs font-medium">
                {request.partnerName || "No partner"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Request type:</span>{" "}
              <RequestTypeBadge type={request.requestType} />
            </div>
            <div>
              <span className="text-gray-500">Status:</span>{" "}
              <StatusBadge status={request.status} />
            </div>
            {(request.requestType?.toLowerCase() === "promotion" ||
              request.requestType?.toLowerCase() === "recruitment") &&
              request.position && (
                <div>
                  <span className="text-gray-500">Position:</span>{" "}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(
                      request.position
                    )}`}
                  >
                    {request.position || "No position"}
                  </span>
                </div>
              )}
            <div>
              <span className="text-gray-500">Target Quantity:</span>{" "}
              {request.targetQuantity}
            </div>
            <div>
              <span className="text-gray-500">Due date:</span>{" "}
              {request.dueDate || "No due date"}
            </div>
          </div>
          <div className="mt-4">{request.description || "No description"}</div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() =>
              navigate(`/senior-recruiter/requests/${request.requestId}`)
            }
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestList = ({ search = "", campaignTypeFilter = "all" }) => {
  const [allApprovedRequests, setAllApprovedRequests] = useState([]); // Lưu tất cả approved requests
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Fetch data from API - fetch tất cả data để filter approved
  const fetchRequests = async (showLoading = false) => {
    try {
      // Chỉ hiển thị loading nếu là lần đầu hoặc được yêu cầu
      if (showLoading || isInitialLoad) {
        setLoading(true);
      }
      setError(null);

      // Map campaignTypeFilter to API format
      const requestTypeMap = {
        all: undefined,
        Recruitment: "Recruitment",
        Promotion: "Promotion",
      };

      // Fetch tất cả data - fetch với pageSize lớn để lấy hết
      const params = {
        page: 1,
        pageSize: 1000, // Fetch nhiều để lấy hết data
        searchTerm: search || undefined,
        status: undefined,
        requestType: requestTypeMap[campaignTypeFilter],
      };

      const result = await getCampaignRequestList(params);

      if (result.success) {
        const allItems = result.data.items || [];

        // Normalize status function
        const normalizeStatus = (status) => {
          if (!status) return "not_approved";
          if (typeof status === "number") {
            if (status === 2) return "approved";
            return "not_approved";
          }
          const statusLower = String(status).toLowerCase().trim();
          if (statusLower === "approved" || statusLower === "approve") {
            return "approved";
          }
          return "not_approved";
        };

        // Filter approved items
        const approvedItems = allItems.filter((request) => {
          const normalizedStatus = normalizeStatus(request.status);
          if (normalizedStatus !== "approved") return false;

          // Filter by requestType
          if (campaignTypeFilter !== "all") {
            const normalizedRequestType =
              request.requestType?.toLowerCase() || "";
            const normalizedCampaignTypeFilter =
              campaignTypeFilter?.toLowerCase() || "";
            if (normalizedRequestType !== normalizedCampaignTypeFilter) {
              return false;
            }
          }

          // Filter by search
          if (search) {
            const searchLower = search.toLowerCase();
            const matchesSearch =
              (request.campaignName &&
                request.campaignName.toLowerCase().includes(searchLower)) ||
              (request.description &&
                request.description.toLowerCase().includes(searchLower)) ||
              (request.requestType &&
                request.requestType.toLowerCase().includes(searchLower));
            if (!matchesSearch) {
              return false;
            }
          }

          return true;
        });

        setAllApprovedRequests(approvedItems);

        // Tính toán pagination dựa trên số lượng approved items
        const totalRecords = approvedItems.length;
        const totalPages = Math.ceil(totalRecords / 5);
        const currentPage =
          pagination.currentPage > totalPages ? 1 : pagination.currentPage;

        setPagination((prev) => ({
          ...prev,
          currentPage: currentPage,
          totalRecords: totalRecords,
          totalPages: totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        }));
      } else {
        setError(result.error || "Error when fetching request list");
        setAllApprovedRequests([]);
      }
    } catch (err) {
      setError(err.message || "Error when fetching request list");
      setAllApprovedRequests([]);
    } finally {
      if (showLoading || isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  };

  // Initial load - chỉ chạy một lần khi component mount
  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchRequests(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch lại khi filter thay đổi (không hiển thị loading)
  useEffect(() => {
    if (!isInitialLoad) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchRequests(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, campaignTypeFilter]);

  const handlePageChange = (page) => {
    if (page === pagination.currentPage) return;
    if (page < 1) return;
    if (pagination.totalPages && page > pagination.totalPages) return;

    // Cập nhật currentPage và hasNextPage/hasPreviousPage
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
      hasNextPage: page < prev.totalPages,
      hasPreviousPage: page > 1,
    }));
  };

  // Phân trang client-side: mỗi page 5 items
  const currentPage = pagination.currentPage;
  const pageSize = 5;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const filtered = allApprovedRequests.slice(startIndex, endIndex);

  // Kiểm tra nếu page hiện tại không đủ 5 items thì disable nút "Sau"
  const isCurrentPageIncomplete = filtered.length < 5;
  const shouldDisableNext = !pagination.hasNextPage || isCurrentPageIncomplete;

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="mb-6 text-xl font-bold text-gray-800">Request list</h2>
        <div className="py-12 text-center">
          <p className="text-slate-500">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="mb-6 text-xl font-bold text-gray-800">
        Request list ({pagination.totalRecords || allApprovedRequests.length})
      </h2>
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No data</div>
      ) : (
        <>
          {filtered.map((c) => (
            <CampaignCard key={c.requestId} request={c} />
          ))}
        </>
      )}

      {/* Phân trang */}
      {allApprovedRequests.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200 rounded-b-xl">
          <div className="text-sm text-slate-600">
            Page <span className="font-semibold">{pagination.currentPage}</span>
            {pagination.totalPages ? (
              <>
                {" "}
                / <span className="font-semibold">{pagination.totalPages}</span>
              </>
            ) : null}
            {typeof pagination.totalRecords === "number" && (
              <span className="ml-2">({pagination.totalRecords} records)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
              className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                pagination.hasPreviousPage
                  ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              }`}
            >
              Previous
            </button>

            <span className="text-sm text-slate-600">
              {pagination.currentPage}
            </span>

            <button
              type="button"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={shouldDisableNext}
              className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                !shouldDisableNext
                  ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestList;
