import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCampaignRequestList } from "../../service/api2.js";

const StatusBadge = ({ status }) => {
  // Normalize status from API (number or string) to UI format
  const normalizeStatus = (status) => {
    if (!status) return "pending_approval";

    // If numeric
    if (typeof status === "number") {
      if (status === 2) return "approved";
      if (status === 3) return "rejected";
      return "pending_approval"; // 1 or other values
    }

    // If string, lowercase then handle
    const statusLower = String(status).toLowerCase().trim();

    // Handle various formats
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

    // Default
    return "pending_approval";
  };

  const normalizedStatus = normalizeStatus(status);
  const statusConfig = {
    pending_approval: {
      color: "bg-yellow-100 text-yellow-800",
      text: "Pending",
    },
    rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
    approved: { color: "bg-green-100 text-green-800", text: "Approved" },
  };
  const config =
    statusConfig[normalizedStatus] || statusConfig.pending_approval;
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  );
};

// Hàm lấy màu cho Request type
const getCampaignTypeColor = (requestType) => {
  if (!requestType) return "bg-gray-100 text-gray-800 border-gray-300";

  const type = requestType.toLowerCase();
  if (type.includes("promotion")) {
    return "bg-purple-100 text-purple-800 border-purple-300";
  } else if (type.includes("recruitment")) {
    return "bg-blue-100 text-blue-800 border-blue-300";
  }
  return "bg-gray-100 text-gray-800 border-gray-300";
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
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCampaignTypeColor(
                    request.requestType
                  )}`}
                >
                  {request.requestType || "N/A"}
                </span>
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
            onClick={() =>
              navigate(`/senior-recruiter/requests/${request.requestId}`)
            }
            className="px-3 py-1 text-sm text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
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

const RequestList = ({
  search = "",
  campaignTypeFilter = "all",
  partnerFilter = "all",
  airlinePartners = [],
}) => {
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

  // Tìm partnerId từ partner name được chọn
  const getPartnerIdFromName = useCallback(
    (partnerName) => {
      if (partnerName === "all" || !partnerName) return null;
      const partner = airlinePartners.find(
        (p) => p.partnerName === partnerName
      );
      return partner?.partnerId || null;
    },
    [airlinePartners]
  );

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

      // Base params for fetching (keep all filters)
      const partnerId = getPartnerIdFromName(partnerFilter);
      const baseParams = {
        page: 1, // Always fetch from page 1
        pageSize: 5, // Fetch with pageSize 5
        searchTerm: search || undefined,
        status: 2, // Filter approved requests (status 2 = Approved)
        requestType: requestTypeMap[campaignTypeFilter],
      };
      if (partnerId) {
        baseParams.partnerId = partnerId;
      }

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

      // Since API already filters by status=2 (Approved), all items are approved
      // But we still filter by requestType and search client-side if needed
      let approvedItems = aggregatedItems;

      // Filter by requestType (if campaignTypeFilter is not "all")
      if (campaignTypeFilter !== "all") {
        approvedItems = approvedItems.filter((request) => {
          const normalizedRequestType =
            request.requestType?.toLowerCase() || "";
          const normalizedCampaignTypeFilter =
            campaignTypeFilter?.toLowerCase() || "";
          return normalizedRequestType === normalizedCampaignTypeFilter;
        });
      }

      // Filter by search (if search term is provided)
      if (search) {
        const searchLower = search.toLowerCase();
        approvedItems = approvedItems.filter((request) => {
          return (
            (request.campaignName &&
              request.campaignName.toLowerCase().includes(searchLower)) ||
            (request.description &&
              request.description.toLowerCase().includes(searchLower)) ||
            (request.requestType &&
              request.requestType.toLowerCase().includes(searchLower))
          );
        });
      }

      setAllApprovedRequests(approvedItems);

      // Tính toán pagination
      // Nếu có pagination info từ API và đã fetch tất cả pages, sử dụng totalRecords từ API
      // (vì API đã filter approved với status=2, nên totalRecords từ API = số lượng approved items)
      // Nếu chưa fetch hết (do MAX_PAGES_TO_FETCH), tính dựa trên số lượng items đã fetch
      let totalRecords = approvedItems.length;
      let calculatedTotalPages = Math.ceil(totalRecords / 5);

      // Nếu đã fetch tất cả pages và có pagination info, sử dụng totalRecords từ API
      if (lastPagination && !lastPagination.hasNextPage) {
        // Use totalRecords from API since it already filters approved requests
        totalRecords = lastPagination.totalRecords || approvedItems.length;
        calculatedTotalPages =
          lastPagination.totalPages || calculatedTotalPages;
      }

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
  }, [search, campaignTypeFilter, partnerFilter, getPartnerIdFromName]);

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

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="mb-6 text-xl font-bold text-gray-800">Request list</h2>
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
        Request list ({pagination.totalRecords || allApprovedRequests.length})
      </h2>
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
