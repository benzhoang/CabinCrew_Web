import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCampaigns } from "../../service/api2";

const ExaminerCampaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  const getRequestTypeLabel = (requestType) => {
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

  const getProgressPercentage = (current, target) => {
    const numericCurrent = Number(current) || 0;
    const numericTarget = Number(target) || 0;
    if (numericTarget <= 0) return 0;
    return Math.round((numericCurrent / numericTarget) * 100);
  };

  const hasProgressData = (campaign) => {
    return Number(campaign.targetHires) > 0;
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
              Campaign list ({filteredCampaigns.length})
            </h3>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {isLoading && (
            <div className="p-12 text-center">
              <p className="text-slate-600">Loading campaign list...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="p-6 text-center text-red-500">{error}</div>
          )}

          {!isLoading &&
            !error &&
            displayedCampaigns.map((campaign) => (
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

                    <div className="grid grid-cols-1 gap-4 mb-3 md:grid-cols-3">
                      <div>
                        <span className="text-sm text-slate-600">
                          Campaign type:
                        </span>
                        <div className="mt-1">
                          <RequestTypeBadge type={campaign.type} />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Partner:</span>
                        <div className="mt-1">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">
                            {campaign.partner || "Partner name not available"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Status:</span>
                        <div className="mt-1">
                          {getStatusBadge(campaign.status)}
                        </div>
                      </div>
                      {(campaign.type?.toLowerCase() === "promotion" ||
                        campaign.type?.toLowerCase() === "recruitment") &&
                        campaign.position && (
                          <div>
                            <span className="text-sm text-slate-600">
                              Position:
                            </span>
                            <div className="mt-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(
                                  campaign.position
                                )}`}
                              >
                                {campaign.position}
                              </span>
                            </div>
                          </div>
                        )}
                      <div>
                        <span className="text-sm text-slate-600">
                          Start date:
                        </span>
                        <p className="font-medium text-slate-800">
                          {campaign.startDate}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">
                          End date:
                        </span>
                        <p className="font-medium text-slate-800">
                          {campaign.endDate}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {hasProgressData(campaign) && (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1 text-sm text-slate-600">
                          <span>Tiến độ tuyển dụng</span>
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
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {!isLoading && !error && filteredCampaigns.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-500">No data</p>
          </div>
        )}

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

      {/* Modal Chi tiết */}
      {showModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-800">
                  Chi tiết Chiến dịch
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
                    <span className="text-sm text-slate-600">
                      Loại chiến dịch:
                    </span>
                    <div className="mt-1">
                      <RequestTypeBadge type={selectedCampaign.type} />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Đối tác:</span>
                    <div className="mt-1">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">
                        {selectedCampaign.partner || "Không xác định"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Trạng thái:</span>
                    <div className="mt-1">
                      {getStatusBadge(selectedCampaign.status)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">
                      Ngày bắt đầu:
                    </span>
                    <p className="font-medium text-slate-800">
                      {selectedCampaign.startDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">
                      Ngày kết thúc:
                    </span>
                    <p className="font-medium text-slate-800">
                      {selectedCampaign.endDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">
                      Mục tiêu tuyển dụng:
                    </span>
                    <p className="font-medium text-slate-800">
                      {selectedCampaign.targetHires} người
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Đã tuyển:</span>
                    <p className="font-medium text-slate-800">
                      {selectedCampaign.currentHires} người
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-slate-600">Mô tả:</span>
                  <p className="mt-1 text-slate-800">
                    {selectedCampaign.description || "Không có mô tả"}
                  </p>
                </div>

                {/* Progress Bar */}
                {hasProgressData(selectedCampaign) && (
                  <div>
                    <span className="text-sm text-slate-600">
                      Tiến độ tuyển dụng:
                    </span>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1 text-sm text-slate-600">
                        <span>
                          {selectedCampaign.currentHires}/
                          {selectedCampaign.targetHires} người
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
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminerCampaign;
