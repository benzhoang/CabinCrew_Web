import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
      case "cancelled":
        return {
          className: "bg-slate-200 text-slate-700 border-slate-300",
          text: "Cancelled",
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

// Hàm lấy màu cho Partner (các airline khác nhau với màu khác nhau)
const getPartnerColor = (partnerName) => {
  if (!partnerName) return "bg-gray-100 text-gray-800 border-gray-300";

  const partner = partnerName.toLowerCase();
  // Có thể thêm các airline cụ thể với màu riêng
  if (
    partner.includes("vietnam airlines") ||
    partner.includes("vietnamairlines")
  ) {
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  } else if (partner.includes("vietjet") || partner.includes("viet jet")) {
    return "bg-red-100 text-red-800 border-red-300";
  } else if (partner.includes("bamboo") || partner.includes("bamboo airways")) {
    return "bg-green-100 text-green-800 border-green-300";
  } else if (partner.includes("jetstar") || partner.includes("sun phuquoc")) {
    return "bg-indigo-100 text-indigo-800 border-indigo-300";
  }
  // Màu mặc định cho các partner khác
  return "bg-cyan-100 text-cyan-800 border-cyan-300";
};

// Helper function to format date safely
const formatDate = (dateString) => {
  if (!dateString) return null;

  try {
    // If it's already a formatted date string (like "22/01/2026"), return it
    if (
      typeof dateString === "string" &&
      /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)
    ) {
      return dateString;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If date is invalid, return the original string
      return dateString;
    }

    // Format as DD/MM/YYYY to match the design
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    // If parsing fails, return the original string
    return dateString;
  }
};

const CampaignCard = ({ request }) => {
  const navigate = useNavigate();

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {request.campaignName}
          </h3>

          <div className="grid grid-cols-1 mt-2 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-6 gap-x-6 gap-y-1">
            <div>
              <span className="text-gray-500">Position:</span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(
                    request.position
                  )}`}
                >
                  {request.position || "No position"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Request type:</span>
              <div className="mt-1">
                <RequestTypeBadge type={request.requestType} />
              </div>
            </div>
            <div>
              <span className="text-gray-500">Target quantity:</span>
              <p className="mt-1 font-medium text-slate-800">
                {request.targetQuantity || 0}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <div className="mt-1">
                <StatusBadge status={request.status} />
              </div>
            </div>
            <div>
              <span className="text-gray-500">Partner:</span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPartnerColor(
                    request.partnerName
                  )}`}
                >
                  {request.partnerName || "—"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Due Date:</span>
              <p className="mt-1 font-medium text-slate-800">
                {formatDate(request.dueDate) || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            className="px-3 py-1 text-sm text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() =>
              navigate(`/airline-partner/requests/${request.requestId}`)
            }
          >
            View details
          </button>
        </div>
      </div>

      {request.description && (
        <p className="mt-3 text-sm text-gray-600">{request.description}</p>
      )}
    </div>
  );
};

// Helper function to map status number to status string for RequestList
// status: integer (1: Pending, 2: Approved, 3: Rejected, 4: Cancelled)
const mapStatusNumberToStatus = (statusNumber) => {
  const statusMap = {
    1: "Pending",
    2: "Approved",
    3: "Rejected",
    4: "Cancelled",
  };
  return statusMap[statusNumber] || "all";
};

// Helper function to map status string to status number for API
const mapStatusToStatusNumber = (status) => {
  const statusMap = {
    Pending: 1,
    Approved: 2,
    Rejected: 3,
    Cancelled: 4,
  };
  return statusMap[status] ?? undefined;
};

const RequestList = ({ search = "", campaignTypeFilter = "all" }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc status và page từ URL query params
  const statusFromUrl = searchParams.get("status");
  const statusFromUrlNumber = statusFromUrl
    ? mapStatusNumberToStatus(parseInt(statusFromUrl, 10))
    : "all";
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

  const [selectedStatus, setSelectedStatus] = useState(statusFromUrlNumber);
  const [allFilteredRequests, setAllFilteredRequests] = useState([]); // Lưu tất cả filtered requests
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: pageFromUrl,
    pageSize: 5,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Get username from localStorage
  const getPartnerUsername = () => {
    try {
      const employeeData = JSON.parse(localStorage.getItem("employee") || "{}");
      return employeeData?.username || null;
    } catch (error) {
      console.error("Error reading employee data from localStorage:", error);
      return null;
    }
  };

  // Map username to official airline name
  // Mapping: username (from localStorage) → Official Airline Name (from API)
  const getAirlineNameFromUsername = (username) => {
    if (!username) return null;

    const usernameLower = username.toLowerCase().trim();
    const usernameToAirlineMap = {
      vietjet: "VietJet Air",
      vietnamairlines: "Vietnam Airlines",
      bambooairways: "Bamboo Airways",
      sunphuquoc: "Sun PhuQuoc Airways",
    };

    return usernameToAirlineMap[usernameLower] || null;
  };

  // Cập nhật selectedStatus và pagination khi URL thay đổi
  useEffect(() => {
    if (statusFromUrlNumber !== selectedStatus) {
      setSelectedStatus(statusFromUrlNumber);
    }
    if (pageFromUrl !== pagination.currentPage) {
      setPagination((prev) => ({
        ...prev,
        currentPage: pageFromUrl,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFromUrl, pageFromUrl]);

  // Cập nhật URL query params khi selectedStatus hoặc pagination.currentPage thay đổi (trừ lần đầu load từ URL)
  useEffect(() => {
    if (isInitialLoad) return; // Bỏ qua lần đầu load từ URL

    const newSearchParams = new URLSearchParams();
    if (selectedStatus && selectedStatus !== "all") {
      const statusNumber = mapStatusToStatusNumber(selectedStatus);
      if (statusNumber !== undefined) {
        newSearchParams.set("status", String(statusNumber));
      }
    }
    if (pagination.currentPage > 1) {
      newSearchParams.set("page", String(pagination.currentPage));
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [selectedStatus, pagination.currentPage, isInitialLoad, setSearchParams]);

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

      // Base params for fetching (keep all filters)
      const baseParams = {
        page: 1, // Always fetch from page 1
        pageSize: 5, // Fetch with pageSize 5
        searchTerm: search || undefined,
        status: undefined,
        requestType: requestTypeMap[campaignTypeFilter],
      };

      let aggregatedItems = [];
      let lastPagination = null;

      // Fetch all pages if needed (limit to reasonable number to avoid too many requests)
      const MAX_PAGES_TO_FETCH = 10;
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages && currentPage <= MAX_PAGES_TO_FETCH) {
        const result = await getCampaignRequestList({
          ...baseParams,
          page: currentPage,
        });

        if (!result.success) {
          console.error("Error fetching requests:", result.error);
          aggregatedItems = [];
          break;
        }

        // Handle different response structures
        let items = [];
        if (Array.isArray(result.data)) {
          items = result.data;
        } else if (result.data?.items && Array.isArray(result.data.items)) {
          items = result.data.items;
        }

        aggregatedItems = aggregatedItems.concat(items);
        // Pagination info is in result.data.pagination, not result.pagination
        lastPagination = result.data?.pagination || result.pagination;

        // Update totalPages from pagination info
        if (lastPagination) {
          const nextTotalPages = lastPagination.totalPages ?? totalPages;
          totalPages = Math.max(totalPages, nextTotalPages);

          // Check if there's a next page
          if (
            !lastPagination.hasNextPage ||
            currentPage >= MAX_PAGES_TO_FETCH
          ) {
            break;
          }
        } else {
          // If no pagination info and we got items, assume there might be more
          // But if we got fewer items than pageSize, we're done
          if (items.length < baseParams.pageSize) {
            break;
          }
          // If we got full pageSize items but no pagination info, continue to next page
          // but limit to MAX_PAGES_TO_FETCH
          if (currentPage >= MAX_PAGES_TO_FETCH) {
            break;
          }
        }

        currentPage += 1;
      }

      // Get partner username from localStorage and map to official airline name
      const partnerUsername = getPartnerUsername();
      const airlineName = getAirlineNameFromUsername(partnerUsername);

      // Normalize status function
      const normalizeStatus = (status) => {
        if (!status) return "pending_approval";
        if (typeof status === "number") {
          if (status === 2) return "approved";
          if (status === 3) return "rejected";
          if (status === 4) return "cancelled";
          return "pending_approval";
        }
        const statusLower = String(status).toLowerCase().trim();
        if (statusLower === "approved" || statusLower === "approve")
          return "approved";
        if (statusLower === "rejected" || statusLower === "reject")
          return "rejected";
        if (statusLower === "cancelled" || statusLower === "cancel")
          return "cancelled";
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
          Cancelled: "cancelled",
        };
        return statusMap[selectedStatus] || null;
      };

      // Filter items
      const filteredItems = aggregatedItems.filter((request) => {
        // Filter by airline name if available
        if (airlineName) {
          const requestPartnerName = (request.partnerName || "").trim();
          const requestPartnerUsername = (request.partnerUsername || "").trim();

          // Exact match with airline name (case-insensitive)
          const matchesAirline =
            requestPartnerName.toLowerCase() === airlineName.toLowerCase() ||
            requestPartnerUsername.toLowerCase() === airlineName.toLowerCase();

          if (!matchesAirline) {
            return false;
          }
        }

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
      // Nếu có pagination info từ API và đã fetch tất cả pages, có thể sử dụng totalRecords từ API
      // Nhưng vì có filter client-side (airline name, status, etc.), nên tính dựa trên filtered items
      const totalRecords = filteredItems.length;
      const calculatedTotalPages = Math.ceil(totalRecords / 5);
      const calculatedCurrentPage =
        pagination.currentPage > calculatedTotalPages
          ? 1
          : pagination.currentPage;

      setPagination((prev) => ({
        ...prev,
        currentPage: calculatedCurrentPage,
        totalRecords: totalRecords,
        totalPages: calculatedTotalPages,
        hasNextPage: calculatedCurrentPage < calculatedTotalPages,
        hasPreviousPage: calculatedCurrentPage > 1,
      }));
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

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="mb-6 text-xl font-bold text-gray-800">Request List</h2>
        <div className="py-12 text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">Loading data...</p>
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
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedStatus("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
            selectedStatus === "all"
              ? "bg-slate-600 text-white border-slate-600"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedStatus("Pending")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
            selectedStatus === "Pending"
              ? "bg-yellow-600 text-white border-yellow-600"
              : "bg-white text-slate-700 border-slate-300 hover:bg-yellow-50"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setSelectedStatus("Approved")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
            selectedStatus === "Approved"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-slate-700 border-slate-300 hover:bg-green-50"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setSelectedStatus("Rejected")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
            selectedStatus === "Rejected"
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-slate-700 border-slate-300 hover:bg-red-50"
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setSelectedStatus("Cancelled")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
            selectedStatus === "Cancelled"
              ? "bg-slate-200 text-slate-700 border-slate-300"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          Cancelled
        </button>
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

      {/* Phân trang - hiển thị khi có data */}
      {pagination.totalRecords > 0 && (
        <div className="flex items-center justify-between px-6 py-4 mt-6 bg-white border rounded-lg border-slate-200">
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
              disabled={!pagination.hasNextPage}
              className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                pagination.hasNextPage
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
