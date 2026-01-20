import { useMemo, useState, useEffect } from "react";
import { FaEye, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { getCampaignList } from "../../service/api2";
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";
import { formatDateFromAPI } from "../../config/formatDate";

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
  return statusMap[status] || status?.toLowerCase() || "unknown";
};

// Helper function to map API campaignType to component campaignType
const mapCampaignType = (campaignType) => {
  const typeMap = {
    Recruitment: "recruitment",
    Promotion: "promotion",
  };
  return typeMap[campaignType] || campaignType?.toLowerCase() || "unknown";
};

// Helper function to map status to campaignStatus number for API
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

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "ongoing":
        return {
          className: "bg-cyan-100 text-cyan-700 border-cyan-200",
          text: "Ongoing",
        };
      case "pending":
        return {
          className: "bg-yellow-100 text-yellow-700 border-yellow-200",
          text: "Pending",
        };
      case "ended":
        return {
          className: "bg-green-100 text-green-700 border-green-200",
          text: "Ended",
        };
      case "draft":
        return {
          className: "bg-gray-100 text-gray-600 border-gray-200",
          text: "Planning",
        };
      case "rejected":
        return {
          className: "bg-red-100 text-red-600 border-red-200",
          text: "Rejected",
        };
      case "approved":
        return {
          className: "bg-emerald-100 text-emerald-700 border-emerald-200",
          text: "Approved",
        };
      case "upcoming":
        return {
          className: "bg-sky-100 text-sky-700 border-sky-200",
          text: "Upcoming",
        };
      case "cancelled":
        return {
          className: "bg-slate-200 text-slate-700 border-slate-300",
          text: "Cancelled",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-600 border-gray-200",
          text: "Unknown",
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

const CampaignTypeBadge = ({ type }) => {
  const getCampaignTypeLabel = (campaignType) => {
    switch (campaignType) {
      case "recruitment":
        return "Recruitment";
      case "promotion":
        return "Promotion";
      default:
        return campaignType || "Unknown";
    }
  };

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

const PartnerBadge = ({ partnerName }) => {
  return (
    <span
      className={`${getPartnerColor(
        partnerName
      )} inline-block rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap`}
    >
      {partnerName || "—"}
    </span>
  );
};

const SortButton = ({ field, label, sortField, sortDirection, onSort }) => {
  const getIcon = () => {
    if (sortField !== field || !sortDirection)
      return <FaSort className="text-gray-400 ms-1" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="text-blue-600 ms-1" />
    ) : (
      <FaSortDown className="text-blue-600 ms-1" />
    );
  };
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="flex items-center hover:text-gray-900"
    >
      {label} {getIcon()}
    </button>
  );
};

const CampaignList = ({
  search = "",
  campaignTypeFilter = "all",
  statusFilter = "all",
  partnerId = null,
}) => {
  const navigate = useNavigate();
  const [allCampaigns, setAllCampaigns] = useState([]); // Store all campaigns from server
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  });

  const fetchCampaigns = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch only the current page
      const currentPageValue = page || pagination.currentPage || 1;
      const pageSizeValue = pagination.pageSize || 5;

      // Base params for fetching (keep all filters)
      const baseParams = {
        page: currentPageValue,
        pageSize: pageSizeValue,
        searchTerm: search || undefined,
        partnerId: partnerId ?? undefined,
      };

      // Add status filter
      if (statusFilter !== "all") {
        const campaignStatus = mapStatusToCampaignStatus(statusFilter);
        if (campaignStatus !== undefined) {
          baseParams.campaignStatus = campaignStatus;
        }
      }

      // Add campaignType filter
      // API campaignType: integer (1: Recruitment, 2: Promotion)
      if (campaignTypeFilter !== "all") {
        const campaignTypeMap = {
          recruitment: 1, // Recruitment
          promotion: 2, // Promotion
        };
        const apiCampaignType = campaignTypeMap[campaignTypeFilter];
        if (apiCampaignType !== undefined) {
          baseParams.campaignType = apiCampaignType;
        }
      }

      const result = await getCampaignList(baseParams);

      if (!result.success) {
        console.error("Error fetching campaigns:", result.error);
        setAllCampaigns([]);
        setPagination((prev) => ({
          ...prev,
          totalItems: 0,
          totalPages: 0,
        }));
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
        campaignName: item.campaignName || item.name || "No campaign name",
        description: item.description || "No description",
        approvedAt: item.approvedAt || "No approved date",
        targetQuantity: item.targetQuantity || 0,
        partnerName: item.partnerName || null,
        campaignType: mapCampaignType(item.campaignType),
        status: mapStatus(item.status),
      }));

      // Store campaigns for current page
      setAllCampaigns(mappedCampaigns);

      // Update pagination from API response
      if (result.pagination) {
        setPagination((prev) => ({
          ...prev,
          currentPage: result.pagination.currentPage ?? currentPageValue,
          pageSize: result.pagination.pageSize ?? pageSizeValue,
          totalItems: result.pagination.totalRecords ?? 0,
          totalPages: result.pagination.totalPages ?? 0,
        }));
      } else {
        // Fallback if no pagination info
        setPagination((prev) => ({
          ...prev,
          currentPage: currentPageValue,
          pageSize: pageSizeValue,
          totalItems: mappedCampaigns.length,
          totalPages: 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setAllCampaigns([]);
      setError(error.message || "Error when fetching campaign list");
      setPagination((prev) => ({
        ...prev,
        totalItems: 0,
        totalPages: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchCampaigns(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, campaignTypeFilter, statusFilter, partnerId]);

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Note: partner filter is now handled server-side via partnerId
  const filteredCampaigns = useMemo(() => {
    return allCampaigns;
  }, [allCampaigns]);

  // Client-side sorting (fallback if server-side sorting is not available)
  const sortedCampaigns = useMemo(() => {
    if (!sortField || !sortDirection) return filteredCampaigns;
    const copy = [...filteredCampaigns];
    const getValue = (c) => {
      const v = c?.[sortField];
      if (v == null) return "";
      if (typeof v === "string") return v.toLowerCase();
      return v;
    };
    copy.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sortDirection === "asc" ? -1 : 1;
      if (va > vb) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filteredCampaigns, sortField, sortDirection]);

  // No need for client-side pagination since server handles it
  // allCampaigns already contains only the current page's data
  const paginatedCampaigns = sortedCampaigns;

  const handlePageChange = (page) => {
    if (
      page > 0 &&
      page <= pagination.totalPages &&
      page !== pagination.currentPage
    ) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
      // Fetch the new page
      fetchCampaigns(page);
    }
  };

  if (loading && allCampaigns.length === 0) {
    return (
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
        <div className="py-8 text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">Loading campaign list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <div className="mb-2 text-red-600">{error}</div>
        <button
          onClick={() => fetchCampaigns(pagination.currentPage)}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 overflow-x-auto bg-white border border-gray-200 rounded-xl">
        <table className="min-w-full border-collapse table-fixed" style={{ minWidth: '1072px' }}>
          <thead>
            <tr className="text-sm text-left text-gray-600 bg-gray-50">
              <th className="w-16 px-2 py-3 font-semibold whitespace-nowrap">No.</th>
              <th className="w-40 px-2 py-3 font-semibold whitespace-nowrap">
                <SortButton
                  field="campaignName"
                  label="Campaign Name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-2 py-3 font-semibold w-72">Description</th>
              <th className="w-20 px-2 py-3 font-semibold whitespace-nowrap">
                <SortButton
                  field="targetQuantity"
                  label="Applicants"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="w-32 px-2 py-3 font-semibold whitespace-nowrap">Partner</th>
              <th className="px-2 py-3 font-semibold w-28 whitespace-nowrap">Campaign Type</th>
              <th className="w-24 px-2 py-3 font-semibold whitespace-nowrap">Status</th>
              <th className="px-2 py-3 font-semibold w-28 whitespace-nowrap">Approved date</th>
              <th className="w-24 px-2 py-3 font-semibold text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCampaigns.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-2 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedCampaigns.map((c, idx) => (
                <tr
                  key={c.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-2 py-3 text-sm text-center text-gray-700 whitespace-nowrap">
                    {/* Calculate index based on current page and position in filtered/sorted list */}
                    {(pagination.currentPage - 1) * pagination.pageSize +
                      idx +
                      1}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-800 truncate">
                    {c.campaignName}
                  </td>
                  <td className="px-2 py-3 overflow-hidden text-sm text-gray-700">
                    <div className="break-words line-clamp-4" title={c.description || "No description"}>
                      {c.description || "No description"}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-sm text-center text-gray-700 whitespace-nowrap">
                    {c.targetQuantity}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    <PartnerBadge partnerName={c.partnerName} />
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    <CampaignTypeBadge type={c.campaignType} />
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {c.approvedAt ? formatDateFromAPI(c.approvedAt) : "—"}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/campaigns/${c.id}`)}
                        aria-label="View detail"
                        className="p-2 text-blue-400 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-blue-300"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 0 && (
        <div className="pt-4">
          <Pagination
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.pageSize}
            currentPage={pagination.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default CampaignList;
