import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCampaignRequestList } from "../../service/api2.js";
import { formatDate } from "../../config/formatDate.js";

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
      case "pending":
        return {
          className: "bg-yellow-100 text-yellow-700 border-yellow-200",
          text: "Pending",
        };
      case "rejected":
        return {
          className: "bg-red-100 text-red-600 border-red-200",
          text: "Rejected",
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
            <div className="text-xs text-slate-500">
              Request ID:{" "}
              <span className="font-medium">{request.requestId}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 mt-2 text-sm text-gray-700 md:grid-cols-3 gap-x-8 gap-y-2">
            <div>
              <span className="text-gray-500">Partner:</span>{" "}
              <span className="bg-gray-100 text-gray-700 border-gray-300 inline-block rounded-full border px-2 py-0.5 text-xs font-medium">
                {request.partnerName || "No partner"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Request Type:</span>{" "}
              <RequestTypeBadge type={request.requestType} />
            </div>
            <div>
              <span className="text-gray-500">Status:</span>{" "}
              <StatusBadge status={request.status} />
            </div>
            <div>
              <span className="text-gray-500">Target Quantity:</span>{" "}
              {request.targetQuantity}
            </div>
            <div>
              <span className="text-gray-500">Due date:</span>{" "}
              {request.dueDate ? formatDate(request.dueDate) : "N/A"}
            </div>
          </div>
          <div className="mt-4">{request.description || "No description"}</div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() =>
              navigate(`/airline-partner/requests/${request.requestId}`)
            }
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestList = ({ search = "", campaignTypeFilter = "all" }) => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [allFilteredRequests, setAllFilteredRequests] = useState([]); // Lưu tất cả filtered requests
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

  // Fetch data from API - fetch tất cả data để filter và phân trang client-side
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
          if (!status) return "pending_approval";
          if (typeof status === "number") {
            if (status === 2) return "approved";
            if (status === 3) return "rejected";
            return "pending_approval";
          }
          const statusLower = String(status).toLowerCase().trim();
          if (statusLower === "approved" || statusLower === "approve")
            return "approved";
          if (statusLower === "rejected" || statusLower === "reject")
            return "rejected";
          if (
            statusLower === "pending" ||
            statusLower === "pending_approval" ||
            statusLower === "pending approval"
          )
            return "pending_approval";
          return "pending_approval";
        };

        // Map status filter từ UI sang format normalized
        const getNormalizedStatusFilter = () => {
          if (selectedStatus === "all") return null;
          const statusMap = {
            Approved: "approved",
            Pending: "pending_approval",
            Rejected: "rejected",
          };
          return statusMap[selectedStatus] || null;
        };

        // Filter items
        const filteredItems = allItems.filter((request) => {
          const normalizedStatus = normalizeStatus(request.status);
          const statusFilter = getNormalizedStatusFilter();

          // Filter by status
          if (statusFilter && normalizedStatus !== statusFilter) {
            return false;
          }

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

        setAllFilteredRequests(filteredItems);

        // Tính toán pagination dựa trên số lượng filtered items
        const totalRecords = filteredItems.length;
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
        setError(result.error || "Error loading request list");
        setAllFilteredRequests([]);
      }
    } catch (err) {
      setError(err.message || "Error loading request list");
      setAllFilteredRequests([]);
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
  }, [search, campaignTypeFilter, selectedStatus]);

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
  const filtered = allFilteredRequests.slice(startIndex, endIndex);

  // Kiểm tra nếu page hiện tại không đủ 5 items thì disable nút "Sau"
  const isCurrentPageIncomplete = filtered.length < 5;
  const shouldDisableNext = !pagination.hasNextPage || isCurrentPageIncomplete;

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="mb-6 text-xl font-bold text-gray-800">Request List</h2>
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
        Request List ({pagination.totalRecords || allFilteredRequests.length})
      </h2>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "all"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("Approved")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "Approved"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Approved
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("Pending")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "Pending"
                ? "bg-yellow-600 text-white border-yellow-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("Rejected")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "Rejected"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No data found</div>
      ) : (
        <>
          {filtered.map((c) => (
            <CampaignCard key={c.requestId} request={c} />
          ))}
        </>
      )}

      {/* Phân trang */}
      {allFilteredRequests.length > 0 && (
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
