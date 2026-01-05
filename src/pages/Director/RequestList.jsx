import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { t, onLangChange } from "../../i18n";
import { getCampaignRequests, getAirlinePartners } from "../../service/api";
import { convertDateFormat } from "../../config/formatDate";

// Helper function to format date display
const formatDateDisplay = (value) => {
  if (!value) return "—";

  // If already in DD/MM/YYYY format, return as is
  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }

  // Try to parse as Date
  const tryParse = (dateString) => {
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  // Try direct parse
  const directDate = tryParse(value);
  if (directDate) {
    const day = String(directDate.getDate()).padStart(2, "0");
    const month = String(directDate.getMonth() + 1).padStart(2, "0");
    const year = directDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Try convert from DD/MM/YYYY format
  const converted = convertDateFormat(value);
  if (converted) {
    const convertedDate = tryParse(converted);
    if (convertedDate) {
      const day = String(convertedDate.getDate()).padStart(2, "0");
      const month = String(convertedDate.getMonth() + 1).padStart(2, "0");
      const year = convertedDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  // If all parsing fails, return original value
  return value;
};

const RequestList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending_approval");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [airlinePartners, setAirlinePartners] = useState([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);
  const [langVersion, setLangVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5, // 5 requests per page
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  // Fetch airline partners
  const fetchAirlinePartners = useCallback(async () => {
    setIsLoadingPartners(true);
    try {
      const res = await getAirlinePartners();
      if (res.success && Array.isArray(res.data)) {
        // Chỉ lấy partnerId và partnerName
        const partners = res.data
          .map((partner) => ({
            partnerId: partner?.partnerId ?? partner?.id ?? null,
            partnerName: partner?.partnerName || partner?.name || "",
          }))
          .filter((p) => p.partnerId && p.partnerName);
        setAirlinePartners(partners);
      } else {
        console.error("Failed to fetch airline partners:", res.error);
        setAirlinePartners([]);
      }
    } catch (err) {
      console.error("Error fetching airline partners:", err);
      setAirlinePartners([]);
    } finally {
      setIsLoadingPartners(false);
    }
  }, []);

  // Load airline partners on mount
  useEffect(() => {
    fetchAirlinePartners();
  }, [fetchAirlinePartners]);

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

  useEffect(() => {
    const fetchCampaigns = async (page = 1, partnerIdFilter = null) => {
      setLoading(true);
      setError(null);
      try {
        const partnerId = getPartnerIdFromName(partnerFilter);
        const additionalParams = partnerId ? { partnerId } : {};
        const result = await getCampaignRequests(page, pagination.pageSize, additionalParams);
        if (result.success) {
          // Normalize status from API
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

          // Map API response data to component format
          const mappedCampaigns = (result.data || []).map((item) => ({
            id: item.requestId,
            name: item.campaignName || "N/A",
            description: item.description || "",
            targetQuantity: item.targetQuantity || 0,
            requestType: item.requestType || "",
            status: normalizeStatus(item.status), // Normalize status from API
            rejectReason: item.rejectReason || "",
            approvedAt: item.approvedAt || "",
            rejectedAt: item.rejectedAt || "",
            partnerName: item.partnerName || "",
            directorName: item.directorName || "",
            dueDate: item.dueDate || "",
            // Map position từ API, fallback về requestType nếu không có
            position: item.position || item.role || item.requestType || "",
            // Map legacy fields for compatibility
            department: item.partnerName || "",
          }));
          setCampaigns(mappedCampaigns);

          // Save pagination info from API if provided
          if (result.pagination) {
            setPagination((prev) => ({
              ...prev,
              ...result.pagination,
              pageSize: pagination.pageSize || 5,
            }));
          } else {
            // Fallback when API does not return pagination
            setPagination((prev) => ({
              ...prev,
              currentPage: page,
              pageSize: pagination.pageSize || 5,
              totalRecords: mappedCampaigns.length,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            }));
          }
        } else {
          setError(result.error || "Unable to load campaign list");
          setCampaigns([]);
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError(
          "An error occurred while loading data: " +
          (err.message || "Unknown error")
        );
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    // First load will be page 1
    const partnerId = getPartnerIdFromName(partnerFilter);
    fetchCampaigns(1, partnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerFilter, getPartnerIdFromName]);

  useEffect(() => {
    let filtered = campaigns;
    if (searchTerm) {
      filtered = filtered.filter(
        (campaign) =>
          (campaign.name &&
            campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (campaign.requestType &&
            campaign.requestType
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (campaign.partnerName &&
            campaign.partnerName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (campaign.directorName &&
            campaign.directorName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (campaign.description &&
            campaign.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (campaign) => campaign.status === statusFilter
      );
    }
    setFilteredCampaigns(filtered);
  }, [campaigns, searchTerm, statusFilter]);

  const handleViewDetails = (campaign) => {
    navigate(`/director/requirements/${campaign.id}`, { state: { campaign } });
  };

  const handlePageChange = (page) => {
    if (page === pagination.currentPage) return;
    if (page < 1) return;
    if (pagination.totalPages && page > pagination.totalPages) return;
    // Only allow switching when previous/next exists
    if (page > pagination.currentPage && !pagination.hasNextPage) return;
    if (page < pagination.currentPage && !pagination.hasPreviousPage) return;

    // Fetch new page
    const fetchNewPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const partnerId = getPartnerIdFromName(partnerFilter);
        const additionalParams = partnerId ? { partnerId } : {};
        const result = await getCampaignRequests(page, pagination.pageSize, additionalParams);
        if (result.success) {
          const mappedCampaigns = (result.data || []).map((item) => ({
            id: item.requestId,
            name: item.campaignName || "N/A",
            description: item.description || "",
            targetQuantity: item.targetQuantity || 0,
            requestType: item.requestType || "",
            status: normalizeStatus(item.status),
            rejectReason: item.rejectReason || "",
            approvedAt: item.approvedAt || "",
            rejectedAt: item.rejectedAt || "",
            partnerName: item.partnerName || "",
            directorName: item.directorName || "",
            dueDate: item.dueDate || "",
            // Map position từ API, fallback về requestType nếu không có
            position: item.position || item.role || item.requestType || "",
            department: item.partnerName || "",
          }));
          setCampaigns(mappedCampaigns);

          if (result.pagination) {
            setPagination((prev) => ({
              ...prev,
              ...result.pagination,
              pageSize: pagination.pageSize || 5,
            }));
          } else {
            setPagination((prev) => ({
              ...prev,
              currentPage: page,
              pageSize: pagination.pageSize || 5,
              totalRecords: mappedCampaigns.length,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            }));
          }
        } else {
          setError(result.error || "Unable to load campaign list");
          setCampaigns([]);
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError(
          "An error occurred while loading data: " +
          (err.message || "Unknown error")
        );
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewPage();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      // TODO: Implement delete API call when available
      setCampaigns(campaigns.filter((campaign) => campaign.id !== id));
    }
  };

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

  const getStatusBadge = (status) => {
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
    } else if (
      partner.includes("bamboo") ||
      partner.includes("bamboo airways")
    ) {
      return "bg-green-100 text-green-800 border-green-300";
    } else if (partner.includes("jetstar") || partner.includes("sun phuquoc")) {
      return "bg-indigo-100 text-indigo-800 border-indigo-300";
    }
    // Màu mặc định cho các partner khác
    return "bg-cyan-100 text-cyan-800 border-cyan-300";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="py-12 text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">
            {t("loading_data") || "Loading data..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">
              Request Management
            </h2>
            <p className="text-slate-600">
              Manage and monitor recruitment campaigns across the system
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-6 mb-6 bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Search Bar */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, request type, partner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Airline Partner Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Airline Partner
            </label>
            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              disabled={isLoadingPartners}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Partners</option>
              {airlinePartners.map((partner) => (
                <option key={partner.partnerId} value={partner.partnerName}>
                  {partner.partnerName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Request List ({filteredCampaigns.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === "all"
                ? "bg-slate-600 text-white border-slate-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("pending_approval")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === "pending_approval"
                ? "bg-yellow-600 text-white border-yellow-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-yellow-50"
                }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === "rejected"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-red-50"
                }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === "approved"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-green-50"
                }`}
            >
              Approved
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="p-6 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2">
                    <h4 className="text-lg font-semibold text-slate-800">
                      {campaign.name}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mb-2 md:grid-cols-2 lg:grid-cols-6">
                    <div>
                      <span className="text-sm text-slate-600">Position:</span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPositionColor(
                            campaign.position
                          )}`}
                        >
                          {campaign.position || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">
                        Request type:
                      </span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCampaignTypeColor(
                            campaign.requestType
                          )}`}
                        >
                          {campaign.requestType || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">
                        Target quantity:
                      </span>
                      <p className="font-medium text-slate-800">
                        {campaign.targetQuantity || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Status:</span>
                      <div className="mt-1">
                        {getStatusBadge(campaign.status)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Partner:</span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPartnerColor(
                            campaign.partnerName
                          )}`}
                        >
                          {campaign.partnerName || "—"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Due Date:</span>
                      <p className="font-medium text-slate-800">
                        {formatDateDisplay(campaign.dueDate)}
                      </p>
                    </div>
                  </div>

                  {campaign.description && (
                    <p className="text-sm leading-relaxed text-slate-600">
                      {campaign.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(campaign)}
                    className="px-3 py-1 text-sm text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-500">No campaigns found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
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
              className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasPreviousPage
                ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                }`}
            >
              Prev
            </button>

            <span className="text-sm text-slate-600">
              {pagination.currentPage}
            </span>

            <button
              type="button"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasNextPage
                ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestList;
