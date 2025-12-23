import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getCampaignDetail,
  getRequirementItems,
  getRoundTypes,
} from "../../service/api2";
import { formatDate2, formatDate } from "../../config/formatDate";

const getRoundTime = (start, end) => {
  const startLabel = formatDate2(start);
  const endLabel = formatDate2(end);
  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`;
  }
  return startLabel || endLabel || "";
};

const mapStatus = (status) => {
  if (!status) return "inactive";
  const normalized = status.toLowerCase();
  if (
    normalized === "approved" ||
    normalized === "active" ||
    normalized === "ongoing"
  ) {
    return "active";
  }
  if (
    normalized === "rejected" ||
    normalized === "ended" ||
    normalized === "completed"
  ) {
    return "inactive";
  }
  return normalized;
};

const mapRoundStatus = (status) => {
  if (!status) return "upcoming";
  const normalized = status.toLowerCase();
  if (normalized === "ended" || normalized === "completed") {
    return "completed";
  }
  if (
    normalized === "ongoing" ||
    normalized === "active" ||
    normalized === "inprogress"
  ) {
    return "ongoing";
  }
  return "upcoming";
};

const mapCampaignData = (apiData = {}, fallbackId) => {
  const rounds = apiData.rounds || apiData.campaignRounds || [];
  return {
    id: apiData.campaignId || apiData.id || fallbackId,
    campaignId: apiData.campaignId || apiData.id || fallbackId,
    name: apiData.campaignName || apiData.name || "",
    airline: apiData.partnerName || apiData.airline || "",
    partnerName: apiData.partnerName || "",
    location: apiData.location || "",
    position: apiData.position || apiData.campaignType || apiData.type || "",
    startDate: apiData.startDate || "",
    endDate: apiData.endDate || "",
    targetHires: apiData.targetQuantity ?? apiData.targetHires ?? 0,
    targetQuantity: apiData.targetQuantity ?? 0,
    status: mapStatus(apiData.status),
    campaignType: apiData.campaignType || "",
    jobDescription: apiData.jobDescription,
    jobRequirement: apiData.jobRequirement,
    batches: Array.isArray(rounds)
      ? rounds.map((round, index) => ({
        campaignRoundId:
          round.campaignRoundId || round.id || round.roundId || index,
        name:
          round.roundName || round.name || round.round || `Đợt ${index + 1}`,
        roundName: round.roundName || round.name || "",
        time: getRoundTime(round.startDate, round.endDate),
        location: round.location || "",
        method: round.method || "Trực tiếp",
        status: mapRoundStatus(round.status),
        owner: round.owner || "",
        description: round.description || "",
        slots: round.targetQuantity || round.slots || 0,
        targetQuantity: round.targetQuantity || 0,
        applied:
          round.actualQuantiy !== undefined
            ? round.actualQuantiy
            : round.applied || 0,
        actualQuantiy: round.actualQuantiy || 0,
        startDate: round.startDate || "",
        endDate: round.endDate || "",
        hasApplied: round.hasApplied || false,
      }))
      : [],
    ...apiData,
  };
};

const isCampaignActive = (data) => {
  if (!data) return false;
  const status = data.status?.toLowerCase();
  if (status === "active" || status === "ongoing" || status === "approved") {
    return true;
  }
  if (
    status === "inactive" ||
    status === "ended" ||
    status === "completed" ||
    status === "rejected"
  ) {
    return false;
  }
  if (Array.isArray(data.batches) && data.batches.length > 0) {
    const hasOngoingRound = data.batches.some((batch) => {
      const batchStatus = batch.status?.toLowerCase();
      return batchStatus === "ongoing" || batchStatus === "active";
    });
    if (hasOngoingRound) {
      return true;
    }
  }
  if (data.startDate && data.endDate) {
    const now = new Date();
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (now >= startDate && now <= endDate) {
      return true;
    }
  }
  return false;
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
  } else if (partner.includes("bamboo") || partner.includes("bamboo airways")) {
    return "bg-green-100 text-green-800 border-green-300";
  } else if (partner.includes("jetstar") || partner.includes("sun phuquoc")) {
    return "bg-indigo-100 text-indigo-800 border-indigo-300";
  }
  // Màu mặc định cho các partner khác
  return "bg-cyan-100 text-cyan-800 border-cyan-300";
};

const PromotionApplyPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const [campaign, setCampaign] = useState(state?.campaign || null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [requirementItems, setRequirementItems] = useState([]);
  const [roundTypes, setRoundTypes] = useState([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [isLoadingRoundTypes, setIsLoadingRoundTypes] = useState(false);
  const [isPurser, setIsPurser] = useState(false);

  useEffect(() => {
    if (state?.campaign) {
      setCampaign(state.campaign);
    }
  }, [state]);

  // Đọc role từ localStorage.user để kiểm tra purser
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) {
        setIsPurser(false);
        return;
      }
      const user = JSON.parse(rawUser);
      const role = (user?.role || "").toString().toLowerCase().replace(/\s+/g, "");
      setIsPurser(role === "purser");
    } catch {
      setIsPurser(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCampaignDetail(id);
        if (response.success) {
          setCampaign(mapCampaignData(response.data, id));
        } else {
          setError(
            response.error ||
            "Cannot load campaign information, please try again."
          );
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while loading campaign information."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  // Fetch requirement items based on campaignType
  useEffect(() => {
    const fetchRequirementItems = async () => {
      if (!campaign?.campaignType) return;

      // Map campaignType string to number: "Recruitment" = 1, "Promotion" = 2
      const campaignTypeStr = String(campaign.campaignType).trim();
      let requirementId = null;

      if (campaignTypeStr.toLowerCase() === "recruitment") {
        requirementId = 1;
      } else if (campaignTypeStr.toLowerCase() === "promotion") {
        requirementId = 2;
      } else {
        // Try to parse as number for backward compatibility
        const parsed = Number(campaignTypeStr);
        if (parsed === 1 || parsed === 2) {
          requirementId = parsed;
        } else {
          return; // Invalid campaignType
        }
      }

      setIsLoadingRequirements(true);
      try {
        const response = await getRequirementItems(requirementId);
        console.log("Requirement Items Response:", response);

        if (response.success && response.data) {
          // Handle different response structures
          // API có thể trả về: { code: 0, data: {...} } với data.requirementItems hoặc array trực tiếp
          let items = [];

          if (Array.isArray(response.data)) {
            items = response.data;
          } else if (
            response.data.requirementItems &&
            Array.isArray(response.data.requirementItems)
          ) {
            items = response.data.requirementItems;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            items = response.data.data;
          }

          setRequirementItems(items);
        } else {
          setRequirementItems([]);
        }
      } catch (error) {
        console.error("Error fetching requirement items:", error);
        setRequirementItems([]);
      } finally {
        setIsLoadingRequirements(false);
      }
    };

    fetchRequirementItems();
  }, [campaign?.campaignType]);

  // Fetch round types based on campaignType
  useEffect(() => {
    const fetchRoundTypes = async () => {
      if (!campaign?.campaignType) return;

      // Map campaignType string to number: "Recruitment" = 1, "Promotion" = 2
      const campaignTypeStr = String(campaign.campaignType).trim();
      let type = null;

      if (campaignTypeStr.toLowerCase() === "recruitment") {
        type = 1;
      } else if (campaignTypeStr.toLowerCase() === "promotion") {
        type = 2;
      } else {
        // Try to parse as number for backward compatibility
        const parsed = Number(campaignTypeStr);
        if (parsed === 1 || parsed === 2) {
          type = parsed;
        } else {
          return; // Invalid campaignType
        }
      }

      setIsLoadingRoundTypes(true);
      try {
        const response = await getRoundTypes(type);
        console.log("Round Types Response:", response);

        if (response.success && response.data) {
          // Handle different response structures
          // API có thể trả về: { code: 0, data: [...] } hoặc array trực tiếp
          let types = [];

          if (Array.isArray(response.data)) {
            types = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            types = response.data.data;
          }

          setRoundTypes(types);
        } else {
          setRoundTypes([]);
        }
      } catch (error) {
        console.error("Error fetching round types:", error);
        setRoundTypes([]);
      } finally {
        setIsLoadingRoundTypes(false);
      }
    };

    fetchRoundTypes();
  }, [campaign?.campaignType]);

  const formatDateLabel = (value) => formatDate2(value) || "—";

  // Show full-page loading when fetching campaign data, requirements, or round types
  if (isLoading || isLoadingRequirements || isLoadingRoundTypes) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl px-4 py-8 mx-auto">
          <div className="p-10 text-center bg-white border border-gray-200 rounded-xl">
            <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-600">
              Loading campaign information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl px-4 py-8 mx-auto">
        {error ? (
          <div className="p-10 text-center bg-white border border-gray-200 rounded-xl">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={() => navigate("/cabin-crew/promotion")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Back
            </button>
          </div>
        ) : !campaign ? (
          <div className="p-10 text-center bg-white border border-gray-200 rounded-xl">
            <p className="mb-4 text-gray-600">
              Cannot find campaign information.
            </p>
            <button
              onClick={() => navigate("/cabin-crew/promotion")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/cabin-crew/promotion")}
                className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Back
              </button>
            </div>
            <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-200">
                <div>
                  <h1 className="text-2xl font-extrabold md:text-3xl text-slate-800">
                    {campaign.name}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    {campaign.airline || "—"}
                    {campaign.location && ` • ${campaign.location}`}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-1 ${isCampaignActive(campaign)
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                    }`}
                >
                  {isCampaignActive(campaign) ? "Ongoing" : "Ended"}
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                  <div>
                    <span className="text-sm text-slate-600">Position:</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(
                          campaign.position
                        )}`}
                      >
                        {campaign.position || "N/A"}
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
                        {campaign.campaignType || "—"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Airline:</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPartnerColor(
                          campaign.airline
                        )}`}
                      >
                        {campaign.airline || "—"}
                      </span>
                    </div>
                  </div>
                  <Info
                    label="Start Date"
                    value={formatDateLabel(campaign.startDate)}
                  />
                  <Info
                    label="End Date"
                    value={formatDateLabel(campaign.endDate)}
                  />
                  <Info
                    label="Target quantity"
                    value={`${campaign.targetHires ?? "—"}`}
                  />
                </div>

                {/* Job Requirements */}
                <div className="mt-6">
                  <h3 className="mb-4 text-lg font-semibold text-slate-800">
                    📝 Requirements
                  </h3>
                  <div className="p-4 border border-green-300 rounded-lg bg-green-50">
                    {requirementItems.length > 0 ? (
                      <ul className="space-y-2">
                        {requirementItems.map((item) => (
                          <li
                            key={item.requirementItemId}
                            className="flex items-start"
                          >
                            <span className="mr-2 text-blue-600">•</span>
                            <span className="text-sm text-slate-700">
                              <span className="font-medium">{item.title}</span>
                              {item.description && (
                                <span className="text-slate-600">
                                  {" : "}
                                  {item.description}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-500">
                        No requirements available
                      </div>
                    )}
                  </div>
                </div>

                {/* Recruitment/Promotion Process - Dynamic from API (getRoundTypes) */}
                <div className="mt-6">
                  <h3 className="mb-4 text-lg font-semibold text-slate-800">
                    🔄{" "}
                    {(() => {
                      const campaignTypeStr = String(
                        campaign.campaignType || ""
                      )
                        .trim()
                        .toLowerCase();
                      if (campaignTypeStr === "recruitment") {
                        return "Recruitment";
                      } else if (campaignTypeStr === "promotion") {
                        return "Promotion";
                      } else {
                        // Try to parse as number for backward compatibility
                        const parsed = Number(campaign.campaignType);
                        if (parsed === 1) return "Recruitment";
                        if (parsed === 2) return "Promotion";
                        return "";
                      }
                    })()}{" "}
                    processes
                  </h3>
                  <div className="p-4 border border-purple-300 rounded-lg bg-purple-50">
                    {roundTypes.length > 0 ? (
                      <div className="space-y-3">
                        {roundTypes.map((roundType, index) => (
                          <div
                            key={roundType.roundTypeId}
                            className="flex items-center p-3 transition-shadow bg-white border rounded-lg shadow-sm border-slate-200 hover:shadow-md"
                          >
                            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-800">
                                {roundType.roundTypeName}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">
                        No processes information available
                      </div>
                    )}
                  </div>
                </div>

                {/* Batches (đợt tuyển) - dùng fallback nếu không có */}
                <div className="mt-6">
                  <div className="mb-2 text-sm text-slate-600">
                    Promotion schedule
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Array.isArray(campaign.batches) &&
                      campaign.batches.length > 0 ? (
                      campaign.batches.map((b, i) => (
                        <div
                          key={i}
                          className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200"
                        >
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                            <div className="text-sm font-semibold text-slate-800">
                              {b.name}
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${b.status === "completed"
                                ? "bg-red-100 text-red-700"
                                : b.status === "ongoing"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                              {b.status === "completed"
                                ? "Completed"
                                : b.status === "ongoing"
                                  ? "Ongoing"
                                  : "Upcoming"}
                            </span>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                              <InfoMini
                                label="Start Date"
                                value={
                                  b.startDate ? formatDate(b.startDate) : "—"
                                }
                              />
                              <InfoMini
                                label="End Date"
                                value={b.endDate ? formatDate(b.endDate) : "—"}
                              />
                              {b.owner && (
                                <InfoMini label="Owner" value={b.owner} />
                              )}
                              {b.slots && (
                                <InfoMini
                                  label="Promotion quota"
                                  value={`${b.slots} people`}
                                />
                              )}
                              {b.applied !== undefined && (
                                <InfoMini
                                  label="Applied"
                                  value={`${b.applied} people`}
                                />
                              )}
                              {b.description && (
                                <InfoMini
                                  label="Description"
                                  value={b.description}
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-end px-4 pt-0 pb-4">
                            {b.status === "ongoing" && (
                              <button
                                onClick={() =>
                                  !b.hasApplied &&
                                  !isPurser &&
                                  navigate(
                                    `/cabin-crew/application-form/${b.campaignRoundId || b.id || ""
                                    }`,
                                    {
                                      state: { campaign: campaign, batch: b },
                                    }
                                  )
                                }
                                disabled={b.hasApplied || isPurser}
                                className={`px-5 py-2.5 rounded-md text-white text-sm font-semibold ${b.hasApplied || isPurser
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-green-600 hover:bg-green-700 cursor-pointer"
                                  }`}
                              >
                                {b.hasApplied
                                  ? "Already applied"
                                  : "Apply now"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-center bg-white border rounded-lg col-span-full text-slate-500 border-slate-200">
                        No promotion schedule available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <div className="text-sm text-slate-600">{label}</div>
    <div className="font-medium text-slate-800">{value}</div>
  </div>
);

const InfoMini = ({ label, value }) => (
  <div>
    <div className="text-slate-500">{label}</div>
    <div className="font-medium text-slate-800">{value}</div>
  </div>
);

export default PromotionApplyPage;
