import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCampaigns } from "../../service/api2";

const ExaminerCampaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();

  const parseDateValue = useCallback((value) => {
    if (!value) return null;

    const native = new Date(value);
    if (!Number.isNaN(native.getTime())) return native;

    const match = value.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/
    );
    if (match) {
      const [, day, month, year, hour = "0", minute = "0"] = match;
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute)
      );
    }

    return null;
  }, []);

  const formatDateValue = useCallback(
    (value) => {
      const date = parseDateValue(value);
      if (!date) return value || "Không xác định";
      return date.toLocaleDateString("vi-VN");
    },
    [parseDateValue]
  );

  const mapStatusValue = useCallback((status) => {
    const normalized = (status || "").toString().trim().toLowerCase();
    if (
      ["ongoing", "inprogress", "in_progress", "active", "approved"].includes(
        normalized
      )
    )
      return "ongoing";
    if (
      ["pending", "draft", "scheduled", "waiting", "reviewing"].includes(
        normalized
      )
    )
      return "pending";
    if (["completed", "done", "finished", "closed"].includes(normalized))
      return "completed";
    return "ongoing";
  }, []);

  const transformCampaignData = useCallback(
    (item) => {
      const targetQuantity = item.targetHires ?? item.targetQuantity ?? 0;
      const currentQuantity = item.currentHires ?? item.currentQuantity ?? 0;

      return {
        id: item.campaignId,
        name: item.campaignName || "Campaign name not available",
        type: item.campaignType || "Campaign type not available",
        partner: item.partnerName || "Partner name not available",
        status: mapStatusValue(item.status),
        startDate: formatDateValue(item.startDate),
        endDate: formatDateValue(item.endDate),
        rawStartDate: item.startDate,
        rawEndDate: item.endDate,
        targetHires: targetQuantity,
        currentHires: currentQuantity,
        description: item.description || "No description available",
        position: item.position || "Position not available",
      };
    },
    [formatDateValue, mapStatusValue]
  );

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMyCampaigns();
        if (response.success && Array.isArray(response.data)) {
          const normalizedCampaigns = response.data.map(transformCampaignData);
          setCampaigns(normalizedCampaigns);
          setFilteredCampaigns(normalizedCampaigns);
        } else {
          setCampaigns([]);
          setFilteredCampaigns([]);
          setError(response.error || "Cannot get the list of campaigns");
        }
      } catch (err) {
        setCampaigns([]);
        setFilteredCampaigns([]);
        setError(err.message || "Cannot get the list of campaigns");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [transformCampaignData]);

  const normalizeString = useCallback(
    (value) => (value || "").toString().toLowerCase(),
    []
  );
  const normalizeStatus = useCallback(
    (value) => normalizeString(value),
    [normalizeString]
  );

  useEffect(() => {
    let filtered = campaigns;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (campaign) =>
          normalizeString(campaign.name).includes(term) ||
          normalizeString(campaign.type).includes(term) ||
          normalizeString(campaign.partner).includes(term)
      );
    }

    // Filter by campaign type
    if (typeFilter !== "All") {
      filtered = filtered.filter((campaign) => campaign.type === typeFilter);
    }

    setFilteredCampaigns(filtered);
    setCurrentPage(1);
  }, [campaigns, searchTerm, typeFilter, normalizeString]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredCampaigns.length / pageSize)
    );
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredCampaigns, currentPage, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCampaigns.length / pageSize)
  );
  const startIndex = (currentPage - 1) * pageSize;
  const displayedCampaigns = filteredCampaigns.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleViewDetails = (campaign) => {
    navigate(`/examiner/campaigns/${campaign.id}`, { state: { campaign } });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ongoing: { color: "bg-green-100 text-green-800", text: "Ongoing" },
      completed: { color: "bg-blue-100 text-blue-800", text: "Completed" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
    };
    const config =
      statusConfig[normalizeStatus(status)] || statusConfig.ongoing;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  // Hàm lấy màu cho Campaign type (Promotion = tím, Recruitment = xanh)
  const getCampaignTypeColor = (campaignType) => {
    if (!campaignType) return "bg-gray-100 text-gray-800 border-gray-300";

    const type = campaignType.toLowerCase();
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">
              Campaign Management
            </h2>
            <p className="text-slate-600">
              Manage recruitment campaigns and workforce plans
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
              placeholder="Search by name, campaign type, partner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Campaign Type Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Campaign type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All campaign types</option>
              <option value="Recruitment">Recruitment</option>
              <option value="Promotion">Promotion</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Campaign List ({filteredCampaigns.length})
            </h3>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {isLoading && (
            <div className="py-8 text-center">
              <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-600">
                Loading campaign list...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="p-6 text-center text-red-500">{error}</div>
          )}

          {!isLoading && !error && displayedCampaigns.length === 0 && (
            <div className="p-6 text-center text-slate-500">
              No campaigns found
            </div>
          )}

          {displayedCampaigns.map((campaign) => (
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

                  <div className="grid grid-cols-1 gap-4 mb-3 md:grid-cols-3 lg:grid-cols-6">
                    <div>
                      <span className="text-sm text-slate-600">Position:</span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(
                            campaign.position
                          )}`}
                        >
                          {campaign.position || "Undetermined"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Type:</span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCampaignTypeColor(
                            campaign.type
                          )}`}
                        >
                          {campaign.type || "Undetermined"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Partner:</span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPartnerColor(
                            campaign.partner
                          )}`}
                        >
                          {campaign.partner || "Undetermined"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Status:</span>
                      <div className="mt-1">
                        {getStatusBadge(campaign.status)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">
                        Start Date:
                      </span>
                      <p className="font-medium text-slate-800">
                        {campaign.startDate}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">End Date:</span>
                      <p className="font-medium text-slate-800">
                        {campaign.endDate}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600">
                    {campaign.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(campaign)}
                    className="px-3 py-1 text-sm text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && !error && filteredCampaigns.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border ${
                currentPage === 1
                  ? "text-slate-400 border-slate-200 cursor-not-allowed"
                  : "text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              ←
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNumber = idx + 1;
              const isActive = pageNumber === currentPage;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 rounded-md border text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md border ${
                currentPage === totalPages
                  ? "text-slate-400 border-slate-200 cursor-not-allowed"
                  : "text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExaminerCampaign;
