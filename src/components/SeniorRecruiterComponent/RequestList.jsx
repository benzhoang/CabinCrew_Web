import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCampaignRequestList } from "../../service/api2.js";
import Loading from "../Loading.jsx";

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status?.toLowerCase() || "";
    switch (normalizedStatus) {
      case "approved":
        return {
          className: "bg-green-100 text-green-700 border-green-200",
          text: "Đã được duyệt",
        };
      case "pending":
        return {
          className: "bg-yellow-100 text-yellow-700 border-yellow-200",
          text: "Đang chờ duyệt",
        };
      case "rejected":
        return {
          className: "bg-red-100 text-red-600 border-red-200",
          text: "Bị từ chối",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-600 border-gray-200",
          text: status || "Không xác định",
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
      return "Tuyển dụng";
    case "promotion":
      return "Thăng bậc";
    default:
      return requestType || "Không xác định";
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
              Mã yêu cầu:{" "}
              <span className="font-medium">{request.requestId}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 mt-2 text-sm text-gray-700 md:grid-cols-3 gap-x-8 gap-y-2">
            <div>
              <span className="text-gray-500">Số lượng mục tiêu:</span>{" "}
              {request.targetQuantity}
            </div>
            <div>
              <span className="text-gray-500">Loại yêu cầu:</span>{" "}
              <RequestTypeBadge type={request.requestType} />
            </div>
            <div>
              <span className="text-gray-500">Trạng thái:</span>{" "}
              <StatusBadge status={request.status} />
            </div>
            <div>
              <span className="text-gray-500">Đối tác:</span>{" "}
              <span className="bg-gray-100 text-gray-700 border-gray-300 inline-block rounded-full border px-2 py-0.5 text-xs font-medium">
                {request.partnerName || "Không có đối tác"}
              </span>
            </div>
          </div>
          <div className="mt-4">{request.description || "Không có mô tả"}</div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() =>
              navigate(`/airline-partner/requests/${request.requestId}`)
            }
          >
            Xem chi tiết
          </button>
          <button className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestList = ({ search = "", campaignTypeFilter = "all" }) => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Fetch data from API
  const fetchRequests = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Map campaignTypeFilter to API format
      const requestTypeMap = {
        all: undefined,
        Recruitment: "Recruitment",
        Promotion: "Promotion",
      };

      // Không gửi status filter lên API, sẽ filter ở client-side giống Director
      const params = {
        page: page,
        pageSize: pagination.pageSize,
        searchTerm: search || undefined,
        // Không gửi status filter lên API
        status: undefined,
        requestType: requestTypeMap[campaignTypeFilter],
      };

      const result = await getCampaignRequestList(params);

      if (result.success) {
        setRequests(result.data.items || []);

        // Update pagination from API response
        if (result.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...result.data.pagination,
            pageSize: prev.pageSize || 5,
          }));
        } else {
          // Fallback if API doesn't return pagination
          setPagination((prev) => ({
            ...prev,
            currentPage: page,
            totalRecords: result.data.items?.length || 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }));
        }
      } else {
        setError(result.error || "Lỗi khi tải danh sách yêu cầu");
        setRequests([]);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh sách yêu cầu");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when search or filters change
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchRequests(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, campaignTypeFilter, selectedStatus]);

  const handlePageChange = (page) => {
    if (page === pagination.currentPage) return;
    if (page < 1) return;
    if (pagination.totalPages && page > pagination.totalPages) return;
    // Chỉ cho phép đổi trang nếu có previous/next tương ứng
    if (page > pagination.currentPage && !pagination.hasNextPage) return;
    if (page < pagination.currentPage && !pagination.hasPreviousPage) return;

    fetchRequests(page);
  };

  // Normalize status function giống Director
  const normalizeStatus = (status) => {
    if (!status) return "pending_approval";

    // Nếu là số
    if (typeof status === "number") {
      if (status === 2) return "approved";
      if (status === 3) return "rejected";
      return "pending_approval"; // 1 hoặc các giá trị khác
    }

    // Nếu là string, chuyển về chữ thường và xử lý
    const statusLower = String(status).toLowerCase().trim();

    // Xử lý các format khác nhau
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

    // Mặc định
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

  // Filter ở client-side giống Director
  const filtered = requests.filter((request) => {
    // Normalize status từ API
    const normalizedStatus = normalizeStatus(request.status);
    const statusFilter = getNormalizedStatusFilter();

    // Filter by status
    if (statusFilter && normalizedStatus !== statusFilter) {
      return false;
    }

    // Filter by requestType (campaignTypeFilter)
    if (campaignTypeFilter !== "all") {
      const normalizedRequestType = request.requestType?.toLowerCase() || "";
      const normalizedCampaignTypeFilter =
        campaignTypeFilter?.toLowerCase() || "";
      if (normalizedRequestType !== normalizedCampaignTypeFilter) {
        return false;
      }
    }

    // Filter by search (API đã xử lý searchTerm, nhưng có thể filter thêm ở đây nếu cần)
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

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-red-600">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="mb-6 text-xl font-bold text-gray-800">
        Danh sách yêu cầu ({pagination.totalRecords || filtered.length})
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
            Tất cả
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
            Đã được duyệt
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
            Đang chờ duyệt
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
            Bị từ chối
          </button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Không có dữ liệu</div>
      ) : (
        <>
          {filtered.map((c) => (
            <CampaignCard key={c.requestId} request={c} />
          ))}
        </>
      )}

      {/* Phân trang */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200 rounded-b-xl">
          <div className="text-sm text-slate-600">
            Trang{" "}
            <span className="font-semibold">{pagination.currentPage}</span>
            {pagination.totalPages ? (
              <>
                {" "}
                / <span className="font-semibold">{pagination.totalPages}</span>
              </>
            ) : null}
            {typeof pagination.totalRecords === "number" && (
              <span className="ml-2">({pagination.totalRecords} bản ghi)</span>
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
              Trước
            </button>

            <span className="text-sm text-slate-600">
              {pagination.currentPage}
            </span>

            <button
              type="button"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                pagination.hasNextPage
                  ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              }`}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestList;
