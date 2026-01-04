import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onLangChange } from "../../i18n";
import { getMyCampaigns } from "../../service/api";
import { formatDateFromAPI } from "../../config/formatDate.js";

const Campaign = () => {
  const [allCampaigns, setAllCampaigns] = useState([]); // Store all campaigns from API
  const [filteredCampaigns, setFilteredCampaigns] = useState([]); // Campaigns after filtering/sorting
  const [displayedCampaigns, setDisplayedCampaigns] = useState([]); // Campaigns displayed on current page (5 items)
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("startDateDesc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [, setLangVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5, // 5 campaigns per page
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

  const parseDateValue = (value) => {
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
  };

  const formatDateValue = (value) => {
    if (!value) return null;
    // Sử dụng formatDateFromAPI để loại bỏ phần giờ và format đúng định dạng DD/MM/YYYY
    return formatDateFromAPI(value) || value || null;
  };

  const mapStatusValue = (status) => {
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
  };

  const transformCampaignData = (item) => {
    const targetQuantity = item.targetHires ?? item.targetQuantity ?? 0;
    const currentQuantity = item.currentHires ?? item.currentQuantity ?? 0;

    return {
      id: item.id ?? item.campaignId ?? item.campaignID ?? item.Id,
      name: item.name ?? item.campaignName ?? "Unnamed Campaign",
      position: item.position ?? item.role ?? "Undetermined",
      campaignType: item.campaignType ?? "Undetermined",
      department:
        item.department ??
        item.campaignDepartment ??
        item.departmentName ??
        "Undetermined",
      partnerName:
        item.partnerName ?? item.partner ?? item.airline ?? "Undetermined",
      status: mapStatusValue(item.status),
      startDate: formatDateValue(item.startDate),
      endDate: formatDateValue(item.endDate),
      rawStartDate: item.startDate,
      rawEndDate: item.endDate,
      targetHires: targetQuantity,
      currentHires: currentQuantity,
      description: item.description ?? "",
      requirements: item.requirements ?? item.requirement ?? "",
    };
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get all campaigns from API (no server-side pagination)
        const response = await getMyCampaigns({});
        if (response.success && Array.isArray(response.data)) {
          const normalizedCampaigns = response.data.map(transformCampaignData);
          setAllCampaigns(normalizedCampaigns);

          // Calculate pagination based on total number of campaigns
          const pageSize = 5;
          const totalRecords = normalizedCampaigns.length;
          const totalPages = Math.ceil(totalRecords / pageSize) || 1;

          setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            pageSize: pageSize,
            totalRecords: totalRecords,
            totalPages: totalPages,
            hasNextPage: totalPages > 1,
            hasPreviousPage: false,
          }));
        } else {
          setAllCampaigns([]);
          setFilteredCampaigns([]);
          setDisplayedCampaigns([]);
          setError(response.error || "Unable to fetch campaign list");
        }
      } catch (err) {
        setAllCampaigns([]);
        setFilteredCampaigns([]);
        setDisplayedCampaigns([]);
        setError(err.message || "Unable to fetch campaign list");
      } finally {
        setIsLoading(false);
      }
    };

    // First load will get all campaigns
    fetchCampaigns();
  }, []);

  const normalizeString = (value) => (value || "").toString().toLowerCase();
  const normalizeStatus = (value) => normalizeString(value);

  // Filter and sort campaigns
  useEffect(() => {
    let filtered = allCampaigns;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (campaign) =>
          normalizeString(campaign.name).includes(term) ||
          normalizeString(campaign.position).includes(term)
      );
    }

    // Filter by timeline status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (campaign) => getTimelineStatus(campaign) === statusFilter
      );
    }

    // Sort campaigns
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "startDateDesc": {
          const dateA = parseDateValue(a.rawStartDate) || 0;
          const dateB = parseDateValue(b.rawStartDate) || 0;
          return dateB - dateA; // newest first
        }
        case "startDateAsc": {
          const dateA = parseDateValue(a.rawStartDate) || 0;
          const dateB = parseDateValue(b.rawStartDate) || 0;
          return dateA - dateB; // oldest first
        }
        default:
          return 0;
      }
    });

    setFilteredCampaigns(sorted);

    // Update pagination based on number of filtered campaigns
    // Reset to page 1 when filter/search/sort changes
    const pageSize = 5;
    const totalRecords = sorted.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;

    setPagination((prev) => ({
      ...prev,
      currentPage: 1, // Reset to page 1 when filter changes
      totalRecords: totalRecords,
      totalPages: totalPages,
      hasNextPage: totalPages > 1,
      hasPreviousPage: false,
    }));
  }, [allCampaigns, searchTerm, sortBy, statusFilter]);

  // Apply client-side pagination on filteredCampaigns
  useEffect(() => {
    const pageSize = pagination.pageSize || 5;
    const currentPage = pagination.currentPage || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);
    setDisplayedCampaigns(paginatedCampaigns);
  }, [filteredCampaigns, pagination.currentPage, pagination.pageSize]);

  const handleViewDetails = (campaign) => {
    navigate(`/recruiter/campaigns/${campaign.id}`, { state: { campaign } });
  };

  // const handleDelete = (id) => {
  //     if (window.confirm('Are you sure you want to delete this campaign?')) {
  //         setAllCampaigns(allCampaigns.filter(campaign => campaign.id !== id))
  //     }
  // }

  const handlePageChange = (page) => {
    if (page === pagination.currentPage) return;
    if (page < 1) return;
    if (pagination.totalPages && page > pagination.totalPages) return;

    // Only update current page (client-side pagination)
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
      hasNextPage: page < prev.totalPages,
      hasPreviousPage: page > 1,
    }));
  };

  // Function to calculate page numbers to display
  const getPageNumbers = () => {
    const currentPage = pagination.currentPage || 1;
    const totalPages = pagination.totalPages || 1;

    if (totalPages <= 0) {
      return [];
    }

    const pageNumbers = [];

    if (totalPages <= 7) {
      // If total pages <= 7, display all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // If total pages > 7, display smartly
      if (currentPage <= 4) {
        // Near start: 1, 2, 3, 4, 5, ..., totalPages
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near end: 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // In middle: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
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

  const getProgressPercentage = (current, target) => {
    const numericCurrent = Number(current) || 0;
    const numericTarget = Number(target) || 0;
    if (numericTarget <= 0) return 0;
    return Math.round((numericCurrent / numericTarget) * 100);
  };

  const hasProgressData = (campaign) => {
    return Number(campaign.targetHires) > 0;
  };

  // Phân loại trạng thái theo mốc thời gian để phục vụ filter
  const getTimelineStatus = (campaign) => {
    const now = new Date();
    const start = parseDateValue(campaign.rawStartDate);
    const end = parseDateValue(campaign.rawEndDate);

    if (end && end < now) return "ended";
    if (start && start > now) return "upcoming";
    return "ongoing";
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
              Manage recruitment campaigns and human resource plans
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
              placeholder="Search by name, position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Sort by assigned date
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="startDateDesc">Newest first</option>
              <option value="startDateAsc">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Campaign List ({filteredCampaigns.length})
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
              onClick={() => setStatusFilter("ongoing")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === "ongoing"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-green-50"
                }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setStatusFilter("upcoming")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === "upcoming"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-blue-50"
                }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setStatusFilter("ended")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === "ended"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-red-50"
                }`}
            >
              Ended
            </button>
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
                            campaign.campaignType
                          )}`}
                        >
                          {campaign.campaignType || "Undetermined"}
                        </span>
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
                          {campaign.partnerName || "Undetermined"}
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
                        {campaign.startDate && campaign.startDate !== 'Undetermined' ? campaign.startDate : 'No start date'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">End Date:</span>
                      <p className="font-medium text-slate-800">
                        {campaign.endDate && campaign.endDate !== 'Undetermined' ? campaign.endDate : 'No end date'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {hasProgressData(campaign) && (
                    <div className="mb-3">
                      <div className="flex justify-between mb-1 text-sm text-slate-600">
                        <span>Recruitment Progress</span>
                        <span>
                          {campaign.currentHires}/{campaign.targetHires} (
                          {getProgressPercentage(
                            campaign.currentHires,
                            campaign.targetHires
                          )}
                          %)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                          style={{
                            width: `${getProgressPercentage(
                              campaign.currentHires,
                              campaign.targetHires
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

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

          {/* Pagination */}
          {(pagination.totalPages > 0 || pagination.totalPages === undefined) &&
            getPageNumbers().length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Page{" "}
                  <span className="font-semibold">
                    {pagination.currentPage || 1}
                  </span>
                  {pagination.totalPages ? (
                    <>
                      {" "}
                      /{" "}
                      <span className="font-semibold">
                        {pagination.totalPages}
                      </span>
                    </>
                  ) : null}
                  {typeof pagination.totalRecords === "number" &&
                    pagination.totalRecords > 0 && (
                      <span className="ml-2">
                        ({pagination.totalRecords} records)
                      </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange((pagination.currentPage || 1) - 1)
                    }
                    disabled={
                      !pagination.hasPreviousPage ||
                      (pagination.currentPage || 1) === 1
                    }
                    className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasPreviousPage &&
                      (pagination.currentPage || 1) > 1
                      ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((pageNum, index) => {
                    if (pageNum === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-slate-400"
                        >
                          ...
                        </span>
                      );
                    }

                    const isActive = pageNum === (pagination.currentPage || 1);
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${isActive
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange((pagination.currentPage || 1) + 1)
                    }
                    disabled={
                      !pagination.hasNextPage ||
                      (pagination.currentPage || 1) >=
                      (pagination.totalPages || 1)
                    }
                    className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasNextPage &&
                      (pagination.currentPage || 1) <
                      (pagination.totalPages || 1)
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
      </div>

      {/* Details Modal */}
      {showModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-800">
                  Campaign Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-lg font-semibold text-slate-800">
                    {selectedCampaign.name}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-sm text-slate-600">Position:</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(
                          selectedCampaign.position
                        )}`}
                      >
                        {selectedCampaign.position || "Undetermined"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Type:</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCampaignTypeColor(
                          selectedCampaign.campaignType
                        )}`}
                      >
                        {selectedCampaign.campaignType || "Undetermined"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Partner:</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPartnerColor(
                          selectedCampaign.partnerName
                        )}`}
                      >
                        {selectedCampaign.partnerName || "Undetermined"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Status:</span>
                    <div className="mt-1">
                      {getStatusBadge(selectedCampaign.status)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Start Date:</span>
                    <p className="font-medium text-slate-800">
                      {selectedCampaign.startDate && selectedCampaign.startDate !== 'Undetermined' ? selectedCampaign.startDate : 'No start date'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">End Date:</span>
                    <p className="font-medium text-slate-800">
                      {selectedCampaign.endDate && selectedCampaign.endDate !== 'Undetermined' ? selectedCampaign.endDate : 'No end date'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">
                      Recruitment Target:
                    </span>
                    <p className="font-medium text-slate-800">
                      {selectedCampaign.targetHires} people
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Hired:</span>
                    <p className="font-medium text-slate-800">
                      {selectedCampaign.currentHires} people
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-slate-600">Description:</span>
                  <p className="mt-1 text-slate-800">
                    {selectedCampaign.description || "No description"}
                  </p>
                </div>

                {selectedCampaign.requirements && (
                  <div>
                    <span className="text-sm text-slate-600">
                      Requirements:
                    </span>
                    <p className="mt-1 text-slate-800">
                      {selectedCampaign.requirements}
                    </p>
                  </div>
                )}

                {/* Progress Bar */}
                {hasProgressData(selectedCampaign) && (
                  <div>
                    <span className="text-sm text-slate-600">
                      Recruitment Progress:
                    </span>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1 text-sm text-slate-600">
                        <span>
                          {selectedCampaign.currentHires}/
                          {selectedCampaign.targetHires} people
                        </span>
                        <span>
                          {getProgressPercentage(
                            selectedCampaign.currentHires,
                            selectedCampaign.targetHires
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-200">
                        <div
                          className="h-3 transition-all duration-300 bg-blue-600 rounded-full"
                          style={{
                            width: `${getProgressPercentage(
                              selectedCampaign.currentHires,
                              selectedCampaign.targetHires
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-white transition-colors rounded-md bg-slate-600 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaign;
