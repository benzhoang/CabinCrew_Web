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
      case "pending_approval":
      case "pending approval":
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
                  {request.partnerName || "No partner name"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Due Date:</span>
              <p className="mt-1 font-medium text-slate-800">
                {formatDate(request.dueDate) || "No due date"}
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
  const [requests, setRequests] = useState([]); // Store requests from current page
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
      // Fetch data when page changes from URL
      fetchRequests(pageFromUrl, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFromUrl, pageFromUrl]);

  // Cập nhật URL query params khi selectedStatus hoặc pagination.currentPage thay đổi
  useEffect(() => {
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
  }, [selectedStatus, pagination.currentPage, setSearchParams]);

  const fetchRequests = async (page = 1, showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const pageSize = 5; // 5 requests per page

      // Map status filter to API format
      const statusNumber =
        selectedStatus !== "all"
          ? mapStatusToStatusNumber(selectedStatus)
          : undefined;

      const baseParams = {
        page: page,
        pageSize: pageSize,
        searchTerm: search || undefined,
        status: statusNumber,
      };

      const result = await getCampaignRequestList(baseParams);

      if (!result.success) {
        console.error("Error fetching requests:", result.error);
        setRequests([]);
        setError(result.error || "Unable to fetch requests");
        return;
      }

      // Handle different response structures
      let items = [];
      if (Array.isArray(result.data)) {
        items = result.data;
      } else if (result.data?.items && Array.isArray(result.data.items)) {
        items = result.data.items;
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

      // Helper function to map API requestType to component requestType (normalize to lowercase)
      const mapRequestType = (requestType) => {
        if (!requestType) return "";
        const typeMap = {
          Recruitment: "recruitment",
          Promotion: "promotion",
        };
        return typeMap[requestType] || requestType.toLowerCase();
      };

      // Map API data to component structure
      const mappedRequests = items.map((item) => ({
        requestId: item.requestId || item.id || item.requestID || item.Id,
        campaignName:
          item.campaignName || item.name || "Request name not available",
        description: item.description || "No description",
        targetQuantity: item.targetQuantity || 0,
        requestType: mapRequestType(item.requestType),
        status: normalizeStatus(item.status),
        rejectReason: item.rejectReason || "No reject reason",
        approvedAt: item.approvedAt || "No approved at",
        rejectedAt: item.rejectedAt || "No rejected at",
        partnerName: item.partnerName || item.partnerUsername || null,
        partnerUsername: item.partnerUsername || item.partnerName || null,
        dueDate: item.dueDate || "No due date",
        position:
          item.position || item.role || item.requestType || "No position",
      }));

      // Filter campaigns by airline name if available (client-side filter)
      let filteredRequests = mappedRequests;
      if (airlineName) {
        filteredRequests = mappedRequests.filter((request) => {
          // Match by partnerName or partnerUsername (case-insensitive, exact match)
          const requestPartnerName = (request.partnerName || "").trim();
          const requestPartnerUsername = (request.partnerUsername || "").trim();

          // Exact match with airline name (case-insensitive)
          return (
            requestPartnerName.toLowerCase() === airlineName.toLowerCase() ||
            requestPartnerUsername.toLowerCase() === airlineName.toLowerCase()
          );
        });
      }

      // Filter by campaignTypeFilter (client-side)
      let finalRequests = filteredRequests;
      if (campaignTypeFilter !== "all") {
        finalRequests = filteredRequests.filter(
          (r) => r.requestType === campaignTypeFilter
        );
      }

      setRequests(finalRequests);

      // Save pagination info from API if provided
      const paginationInfo = result.data?.pagination || result.pagination;
      if (paginationInfo) {
        setPagination((prev) => ({
          ...prev,
          ...paginationInfo,
          pageSize: pageSize,
        }));
      } else {
        // Fallback pagination when API does not return it
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          pageSize: pageSize,
          totalRecords: finalRequests.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
      setError(
        error.message || "An error occurred while loading the request list"
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setIsInitialLoad(false);
    }
  };

  // Initial load - fetch page from URL or page 1 when component mounts
  useEffect(() => {
    fetchRequests(pageFromUrl || 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch lại khi filter thay đổi - reset về page 1 (không hiển thị loading)
  useEffect(() => {
    if (!isInitialLoad) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchRequests(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, campaignTypeFilter, selectedStatus]);

  const handlePageChange = (page) => {
    if (page === pagination.currentPage) return;
    if (page < 1) return;
    if (pagination.totalPages && page > pagination.totalPages) return;

    setPagination((prev) => ({
      ...prev,
      currentPage: page,
      hasNextPage: page < prev.totalPages,
      hasPreviousPage: page > 1,
    }));
    fetchRequests(page, false);
  };

  // Chỉ hiển thị full loading screen khi là lần đầu load
  if (isInitialLoad && loading) {
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
        Request List ({pagination.totalRecords || requests.length})
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
      {requests.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No data found</div>
      ) : (
        <>
          {requests.map((c) => (
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
