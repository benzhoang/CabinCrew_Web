import { useMemo, useState, useEffect } from "react";
import { FaEye, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { getCampaignList } from "../../service/api2";
import Loading from "../Loading";
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";

// Helper function to map API status to component status
const mapStatus = (status) => {
  const statusMap = {
    Draft: "draft",
    Pending: "pending",
    Approved: "approved",
    Rejected: "rejected",
    Ongoing: "ongoing",
    Ended: "ended",
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
          text: "Draft",
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
}) => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
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

      const params = {
        page: page,
        pageSize: 5,
        searchTerm: search || undefined,
      };

      // Add status filter
      if (statusFilter !== "all") {
        const campaignStatus = mapStatusToCampaignStatus(statusFilter);
        if (campaignStatus !== undefined) {
          params.campaignStatus = campaignStatus;
        }
      }

      // Note: campaignType filter is handled client-side, not sent to server

      const result = await getCampaignList(params);

      if (result.success && result.data && Array.isArray(result.data)) {
        // Map API data to component structure
        const mappedCampaigns = result.data.map((item) => ({
          id: item.campaignId || item.id || item.campaignID || item.Id,
          campaignName:
            item.campaignName || item.name || "Chiến dịch chưa có tên",
          targetQuantity: item.targetQuantity || 0,
          campaignType: mapCampaignType(item.campaignType),
          status: mapStatus(item.status),
        }));

        setCampaigns(mappedCampaigns);

        // Update pagination
        if (result.pagination) {
          setPagination({
            currentPage: result.pagination.currentPage || page,
            pageSize: result.pagination.pageSize || 5,
            totalItems:
              result.pagination.totalRecords || mappedCampaigns.length,
            totalPages: result.pagination.totalPages || 1,
          });
        } else {
          setPagination({
            currentPage: page,
            pageSize: 5,
            totalItems: mappedCampaigns.length,
            totalPages: 1,
          });
        }
      } else {
        setCampaigns([]);
        setError(result.error || "Error when fetching campaign list");
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
      setError(error.message || "Error when fetching campaign list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, campaignTypeFilter, statusFilter]);

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

  // Filter campaigns by campaignType (client-side)
  const filteredCampaigns = useMemo(() => {
    if (campaignTypeFilter === "all") return campaigns;
    return campaigns.filter((c) => c.campaignType === campaignTypeFilter);
  }, [campaigns, campaignTypeFilter]);

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

  const handlePageChange = (page) => {
    if (
      page > 0 &&
      page <= pagination.totalPages &&
      page !== pagination.currentPage
    ) {
      fetchCampaigns(page);
    }
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
        <div className="py-8 text-center text-gray-600">Loading data...</div>
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
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
        <table className="min-w-full border-collapse table-fixed">
          <thead>
            <tr className="text-sm text-left text-gray-600 bg-gray-50">
              <th className="w-16 px-5 py-3 font-semibold">No.</th>
              <th className="px-5 py-3 font-semibold w-52">
                <SortButton
                  field="campaignName"
                  label="Campaign Name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-5 py-3 font-semibold w-28">
                <SortButton
                  field="targetQuantity"
                  label="Quantity"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-5 py-3 font-semibold w-36">
                <SortButton
                  field="campaignType"
                  label="Campaign Type"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-5 py-3 font-semibold w-36">
                <SortButton
                  field="status"
                  label="Status"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="w-24 px-5 py-3 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCampaigns.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              sortedCampaigns.map((c, idx) => (
                <tr
                  key={c.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {(pagination.currentPage - 1) * pagination.pageSize +
                      idx +
                      1}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-800 truncate">
                    {c.campaignName}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {c.targetQuantity}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    <CampaignTypeBadge type={c.campaignType} />
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3">
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
