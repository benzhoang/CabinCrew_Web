import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCampaignList } from "../../service/api2";
import {
  convertDateFormat,
  formatDateFromAPI,
} from "../../config/formatDate.js";
import SeniorPagination from "./SeniorPagination";

// Helper function to map API status to component status
const mapStatus = (status) => {
  const statusMap = {
    Draft: "draft",
    Pending: "pending",
    Approved: "approved",
    Rejected: "rejected",
    Ongoing: "ongoing",
    Ended: "ended",
    Cancelled: "cancelled",
    Upcoming: "upcoming",
  };
  return statusMap[status] || status.toLowerCase();
};

// Helper function to map API campaignType to component campaignType
const mapCampaignType = (campaignType) => {
  const typeMap = {
    Recruitment: "recruitment",
    Promotion: "promotion",
  };
  return typeMap[campaignType] || campaignType.toLowerCase();
};

// Helper function to map status to campaignStatus number for API
// campaignStatus: integer (0: Draft, 1: Pending, 2: Approved, 3: Rejected, 4: Cancelled, 5: Ongoing, 6: Upcoming, 7: Ended)
const mapStatusToCampaignStatus = (status) => {
  const statusMap = {
    draft: 0,
    pending: 1,
    approved: 2,
    rejected: 3,
    cancelled: 4,
    ongoing: 5,
    upcoming: 6,
    ended: 7,
  };
  return statusMap[status?.toLowerCase()] ?? undefined;
};

// Helper function to map campaignStatus number to status string
const mapCampaignStatusToStatus = (campaignStatus) => {
  const statusMap = {
    0: "draft",
    1: "pending",
    2: "approved",
    3: "rejected",
    4: "cancelled",
    5: "ongoing",
    6: "upcoming",
    7: "ended",
  };
  return statusMap[campaignStatus] ?? "draft";
};

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const normalized = (status || "").toString().trim();
    // Keep case-sensitive to match API exactly
    switch (normalized) {
      case "Ongoing":
        return {
          className: "bg-green-100 text-green-800 border-green-300",
          text: "Ongoing",
        };
      case "Pending":
        return {
          className: "bg-yellow-100 text-yellow-700 border-yellow-200",
          text: "Pending",
        };
      case "Approved":
        return {
          className: "bg-emerald-100 text-emerald-700 border-emerald-200",
          text: "Approved",
        };
      case "Rejected":
        return {
          className: "bg-red-100 text-red-700 border-red-200",
          text: "Rejected",
        };
      case "Upcoming":
        return {
          className: "bg-purple-100 text-purple-700 border-purple-200",
          text: "Upcoming",
        };
      case "Ended":
        return {
          className: "bg-gray-100 text-gray-700 border-gray-200",
          text: "Ended",
        };
      case "Draft":
        return {
          className: "bg-slate-100 text-slate-600 border-slate-200",
          text: "Planning",
        };
      case "Canceled":
        return {
          className: "bg-orange-100 text-orange-700 border-orange-200",
          text: "Canceled",
        };
      // Backward compatibility for legacy lowercase values
      case "ongoing":
      case "active":
        return {
          className: "bg-green-100 text-green-800 border-green-300",
          text: "Ongoing",
        };
      case "pending":
        return {
          className: "bg-yellow-100 text-yellow-700 border-yellow-200",
          text: "Pending",
        };
      case "approved":
        return {
          className: "bg-emerald-100 text-emerald-700 border-emerald-200",
          text: "Approved",
        };
      case "rejected":
        return {
          className: "bg-red-100 text-red-700 border-red-200",
          text: "Rejected",
        };
      case "completed":
      case "ended":
        return {
          className: "bg-gray-100 text-gray-700 border-gray-200",
          text: "Ended",
        };
      case "draft":
        return {
          className: "bg-slate-100 text-slate-600 border-slate-200",
          text: "Planning",
        };
      case "canceled":
      case "cancelled":
        return {
          className: "bg-orange-100 text-orange-700 border-orange-200",
          text: "Canceled",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-600 border-gray-200",
          text: normalized || "Unknown",
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

const getCampaignTypeLabel = (campaignType) => {
  switch (campaignType) {
    case "recruitment":
      return "Recruitment";
    case "promotion":
      return "Promotion";
    default:
      return "Unknown";
  }
};

const CampaignTypeBadge = ({ type }) => {
  const label = getCampaignTypeLabel(type);
  const className =
    type === "promotion"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : type === "recruitment"
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

const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 transition-colors hover:bg-slate-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-2">
            <h4 className="text-lg font-semibold text-slate-800">
              {campaign.title}
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-3 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <span className="text-sm text-slate-600">Position:</span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(
                    campaign.position
                  )}`}
                >
                  {campaign.position || "No position"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-600">Type:</span>
              <div className="mt-1">
                <CampaignTypeBadge type={campaign.campaignType} />
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-600">Partner:</span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPartnerColor(
                    campaign.partnerName
                  )}`}
                >
                  {campaign.partnerName || "No partner"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-600">Status:</span>
              <div className="mt-1">
                <StatusBadge status={campaign.status} />
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-600">Start Date:</span>
              <p className="font-medium text-slate-800">
                {formatDateFromAPI(campaign.startDate) || "No start date"}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">End Date:</span>
              <p className="font-medium text-slate-800">
                {formatDateFromAPI(campaign.endDate) || "No end date"}
              </p>
            </div>
          </div>

          {campaign.description && (
            <p className="text-sm text-slate-600">{campaign.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {campaign.status === "draft" ? (
            <button
              onClick={() =>
                navigate(`/senior-recruiter/campaigns/${campaign.id}/create`)
              }
              className="px-3 py-1 text-sm text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
            >
              Create plan
            </button>
          ) : (
            <button
              className="px-3 py-1 text-sm text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
              onClick={() =>
                navigate(`/senior-recruiter/campaigns/${campaign.id}`)
              }
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CampaignList = ({
  search = "",
  partnerFilter = "all",
  airlinePartners = [],
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc campaignStatus và page từ URL query params
  const campaignStatusFromUrl = searchParams.get("campaignStatus");
  const statusFromUrl = campaignStatusFromUrl
    ? mapCampaignStatusToStatus(parseInt(campaignStatusFromUrl, 10))
    : searchParams.get("status") || "draft"; // Fallback to status for backward compatibility
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

  const [selectedStatus, setSelectedStatus] = useState(statusFromUrl);
  const [campaigns, setCampaigns] = useState([]); // Store campaigns from current page
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: pageFromUrl,
    pageSize: 5, // Mỗi trang 5 campaign
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

  // Cập nhật selectedStatus và pagination khi URL thay đổi
  useEffect(() => {
    if (statusFromUrl !== selectedStatus) {
      setSelectedStatus(statusFromUrl);
    }
    if (pageFromUrl !== pagination.currentPage) {
      setPagination((prev) => ({
        ...prev,
        currentPage: pageFromUrl,
      }));
      // Fetch data when page changes from URL
      fetchCampaigns(pageFromUrl, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFromUrl, pageFromUrl]);

  // Cập nhật URL query params khi selectedStatus hoặc pagination.currentPage thay đổi
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (selectedStatus && selectedStatus !== "draft") {
      const campaignStatus = mapStatusToCampaignStatus(selectedStatus);
      if (campaignStatus !== undefined) {
        newSearchParams.set("campaignStatus", String(campaignStatus));
      }
    }
    if (pagination.currentPage > 1) {
      newSearchParams.set("page", String(pagination.currentPage));
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [selectedStatus, pagination.currentPage, setSearchParams]);

  const fetchCampaigns = async (page = 1, showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const pageSize = 5; // 5 campaigns per page

      // Base params for fetching
      const partnerId = getPartnerIdFromName(partnerFilter);
      const baseParams = {
        page: page,
        pageSize: pageSize,
        searchTerm: search || undefined,
      };

      // Gửi status filter lên server
      const campaignStatus = mapStatusToCampaignStatus(selectedStatus);
      if (campaignStatus !== undefined) {
        baseParams.campaignStatus = campaignStatus;
      }

      // Gửi partnerId filter lên server
      if (partnerId) {
        baseParams.partnerId = partnerId;
      }

      const result = await getCampaignList(baseParams);

      if (!result.success) {
        console.error("Error fetching campaigns:", result.error);
        setCampaigns([]);
        setError(result.error || "Unable to fetch campaigns");
        return;
      }

      // Handle different response structures
      let items = [];
      if (Array.isArray(result.data)) {
        items = result.data;
      } else if (result.data?.items && Array.isArray(result.data.items)) {
        items = result.data.items;
      }

      // Map API data to component structure
      const mappedCampaigns = items.map((item) => ({
        id: item.campaignId || item.id || item.campaignID || item.Id,
        title: item.campaignName || item.name || "Campaign name not available",
        description: item.description || "No description",
        startDate: convertDateFormat(item.startDate),
        endDate: convertDateFormat(item.endDate),
        status: mapStatus(item.status),
        campaignType: mapCampaignType(item.campaignType),
        position: item.position || "No position",
        partnerName:
          item.partnerName ||
          item.airline ||
          item.airlineName ||
          "No partner name",
        progress: { current: 0, total: item.targetQuantity || 0 },
      }));

      setCampaigns(mappedCampaigns);

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
          totalRecords: mappedCampaigns.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
      setError(
        error.message || "An error occurred while loading the campaign list"
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
    fetchCampaigns(pageFromUrl || 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch lại khi filter thay đổi - reset về page 1 (không hiển thị loading)
  useEffect(() => {
    if (!isInitialLoad) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchCampaigns(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedStatus, partnerFilter, getPartnerIdFromName]);

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
    fetchCampaigns(page, false);
  };

  // Chỉ hiển thị full loading screen khi là lần đầu load
  if (isInitialLoad && loading) {
    return (
      <div className="bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="mb-3 text-lg font-semibold text-slate-800">
            Campaign List
          </h3>
        </div>
        <div className="py-12 text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">Loading campaign list...</p>
        </div>
      </div>
    );
  }

  if (error && !isInitialLoad) {
    return (
      <div className="bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="mb-3 text-lg font-semibold text-slate-800">
            Campaign List
          </h3>
        </div>
        <div className="py-8 text-center">
          <div className="mb-2 text-red-600">{error}</div>
          <button
            onClick={() => {
              fetchCampaigns(pagination.currentPage || 1);
            }}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">
          Campaign List ({campaigns.length})
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSelectedStatus("draft")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
              selectedStatus === "draft"
                ? "bg-slate-600 text-white border-slate-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Planning
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
              selectedStatus === "pending"
                ? "bg-yellow-600 text-white border-yellow-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("approved")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
              selectedStatus === "approved"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Approved
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("ongoing")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
              selectedStatus === "ongoing"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Ongoing
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("upcoming")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
              selectedStatus === "upcoming"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-blue-50"
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("ended")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
              selectedStatus === "ended"
                ? "bg-slate-200 text-slate-700 border-slate-300"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Ended
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("rejected")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
              selectedStatus === "rejected"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-red-50"
            }`}
          >
            Rejected
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("cancelled")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
              selectedStatus === "cancelled"
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Canceled
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {loading && (
          <div className="py-8 text-center">
            <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-600">
              Loading campaign list...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="p-6 text-center text-red-500">{error}</div>
        )}

        {!loading && !error && campaigns.length === 0 && (
          <div className="p-6 text-center text-slate-500">
            No campaigns found
          </div>
        )}

        {!loading &&
          !error &&
          campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
      </div>

      {/* Pagination */}
      <SeniorPagination
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CampaignList;
