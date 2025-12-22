import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getCampaignById, getRequirementItems, getRoundTypes } from "../../../service/api";
import BatchManagement from "./BatchManagement";
import { formatDate } from "../../../config/formatDate";

const Section = ({ title, children }) => (
  <div className="p-5 bg-white border border-gray-200 rounded-xl">
    <div className="mb-3 text-sm font-semibold text-gray-900">{title}</div>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start">
    <div className="text-sm text-gray-500 shrink-0 mr-3">{label}:</div>
    <div className="text-sm text-gray-900">{value}</div>
  </div>
);

// Component để hiển thị Campaign Type với màu sắc
const CampaignTypeBadge = ({ type }) => {
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

  const displayType = type || 'Undetermined';
  const colorClass = getCampaignTypeColor(type);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {displayType}
    </span>
  );
};

// Component để hiển thị Position với màu sắc
const PositionBadge = ({ position }) => {
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

  const displayPosition = position || 'Undetermined';
  const colorClass = getPositionColor(position);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {displayPosition}
    </span>
  );
};

const renderStatusBadge = (statusRaw) => {
  const status = String(statusRaw || '').toLowerCase();
  const mapping = {
    pending: {
      text: 'Pending',
      cls: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    pending_approval: {
      text: 'Pending approval',
      cls: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    ongoing: {
      text: 'Ongoing',
      cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    approved: {
      text: 'Approved',
      cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    rejected: {
      text: 'Rejected',
      cls: 'bg-rose-50 text-rose-700 border border-rose-200',
    },
  };

  const preset = mapping[status] || {
    text: statusRaw || 'N/A',
    cls: 'bg-slate-50 text-slate-700 border border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${preset.cls}`}>
      {preset.text}
    </span>
  );
};

const DetailInfo = ({ campaign, onCreateBatch }) => {
  const { id } = useParams();
  const { state } = useLocation();
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requirementItems, setRequirementItems] = useState([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [roundTypes, setRoundTypes] = useState([]);
  const [isLoadingRoundTypes, setIsLoadingRoundTypes] = useState(false);

  useEffect(() => {
    const fetchCampaignData = async () => {
      // Ưu tiên sử dụng campaign từ props hoặc state
      if (campaign || state?.campaign) {
        const campaignFromProps = campaign || state?.campaign;

        // Log campaign từ props/state
        console.log(
          "DetailInfo - Campaign from props/state:",
          campaignFromProps
        );
        console.log("DetailInfo - Has rounds:", !!campaignFromProps?.rounds);

        // Đảm bảo rounds là array (nếu có) - tạo copy mới để tránh mutate
        let normalizedCampaign = campaignFromProps;
        if (
          campaignFromProps &&
          !Array.isArray(campaignFromProps.rounds) &&
          campaignFromProps.rounds !== null &&
          campaignFromProps.rounds !== undefined
        ) {
          console.warn(
            "DetailInfo - Rounds from props/state is not an array, converting:",
            campaignFromProps.rounds
          );
          normalizedCampaign = {
            ...campaignFromProps,
            rounds: [campaignFromProps.rounds],
          };
        }

        setCampaignData(normalizedCampaign);

        // Nếu rounds đang trống, tiếp tục gọi API theo id để lấy rounds chuẩn theo Swagger
        const effectiveId =
          normalizedCampaign?.campaignId || normalizedCampaign?.id || id;
        if (
          effectiveId &&
          (!Array.isArray(normalizedCampaign.rounds) ||
            normalizedCampaign.rounds.length === 0)
        ) {
          try {
            console.log(
              "DetailInfo - Rounds empty, fetching by id to hydrate:",
              effectiveId
            );
            const result = await getCampaignById(effectiveId);
            if (result.success) {
              let apiData = result.data;
              // Đảm bảo rounds là array
              if (apiData && !Array.isArray(apiData.rounds) && apiData.rounds) {
                apiData = { ...apiData, rounds: [apiData.rounds] };
              }
              // Trộn dữ liệu: giữ thông tin hiện có, ưu tiên rounds từ API
              const merged = {
                ...normalizedCampaign,
                ...apiData,
                rounds: Array.isArray(apiData?.rounds) ? apiData.rounds : [],
              };
              setCampaignData(merged);
            }
          } catch (err) {
            console.warn(
              "DetailInfo - Unable to hydrate rounds from API:",
              err
            );
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
        return;
      }

      // Nếu không có campaign từ props/state, fetch từ API bằng ID
      if (id) {
        try {
          setLoading(true);
          const result = await getCampaignById(id);
          if (result.success) {
            const apiData = result.data;

            // Log API response để debug
            console.log("DetailInfo - API Response:", apiData);
            console.log(
              "DetailInfo - API Response has rounds:",
              !!apiData?.rounds
            );
            if (apiData?.rounds) {
              console.log("DetailInfo - API Rounds:", apiData.rounds);
            }

            // Đảm bảo rounds là array (nếu có) - tạo copy mới để tránh mutate
            let normalizedApiData = apiData;
            if (
              apiData &&
              !Array.isArray(apiData.rounds) &&
              apiData.rounds !== null &&
              apiData.rounds !== undefined
            ) {
              console.warn(
                "DetailInfo - Rounds from API is not an array, converting:",
                apiData.rounds
              );
              normalizedApiData = {
                ...apiData,
                rounds: [apiData.rounds],
              };
            }

            setCampaignData(normalizedApiData);
            setError(null);
          } else {
            setError(result.error || "Unable to load campaign information");
          }
        } catch (err) {
          console.error("DetailInfo - Error fetching campaign:", err);
          setError(err.message || "An error occurred while loading campaign information");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("Campaign ID not found");
      }
    };

    fetchCampaignData();
  }, [id, campaign, state?.campaign]);

  // Debug: Log data để kiểm tra (chỉ log một lần khi data thay đổi)
  useEffect(() => {
    if (campaignData) {
      console.log("DetailInfo - Campaign Data:", campaignData);
      console.log("DetailInfo - All keys:", Object.keys(campaignData));
      console.log("DetailInfo - campaignType:", campaignData.campaignType);
      console.log("DetailInfo - targetQuantity:", campaignData.targetQuantity);

      // Log rounds data specifically
      if (campaignData.rounds) {
        console.log("DetailInfo - Rounds found:", campaignData.rounds);
        console.log(
          "DetailInfo - Rounds type:",
          Array.isArray(campaignData.rounds)
            ? "Array"
            : typeof campaignData.rounds
        );
        console.log(
          "DetailInfo - Rounds length:",
          Array.isArray(campaignData.rounds)
            ? campaignData.rounds.length
            : "N/A"
        );
        if (
          Array.isArray(campaignData.rounds) &&
          campaignData.rounds.length > 0
        ) {
          console.log(
            "DetailInfo - First round structure:",
            campaignData.rounds[0]
          );
          console.log(
            "DetailInfo - First round keys:",
            Object.keys(campaignData.rounds[0])
          );
        }
      } else {
        console.log("DetailInfo - No rounds found in campaign data");
      }

      console.log(
        "DetailInfo - Full data structure:",
        JSON.stringify(campaignData, null, 2)
      );
    }
  }, [campaignData]);

  // Fetch requirement items based on campaignType
  useEffect(() => {
    const fetchRequirementItems = async () => {
      if (!campaignData?.campaignType) return;

      // Map campaignType string to number: "Recruitment" = 1, "Promotion" = 2
      const campaignTypeStr = String(campaignData.campaignType).trim();
      let requirementId = null;

      if (campaignTypeStr.toLowerCase() === 'recruitment') {
        requirementId = 1;
      } else if (campaignTypeStr.toLowerCase() === 'promotion') {
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
        console.log('DetailInfo - Requirement Items Response:', response);
        console.log('DetailInfo - Campaign Type:', campaignTypeStr, 'Requirement ID:', requirementId);

        if (response.success && response.data) {
          // Handle different response structures
          let items = [];

          // Case 1: response.data là array
          if (Array.isArray(response.data)) {
            if (response.data.length > 0) {
              const firstItem = response.data[0];
              if (firstItem.requirementItems && Array.isArray(firstItem.requirementItems)) {
                // It's array of objects like [{ requirementId, requirementItems }]
                items = response.data.flatMap(item =>
                  Array.isArray(item.requirementItems) ? item.requirementItems : []
                );
              } else if (firstItem.requirementItemId || firstItem.title) {
                // It's array of requirement items directly
                items = response.data;
              }
            }
          }
          // Case 2: response.data là object có requirementItems
          else if (
            response.data.requirementItems &&
            Array.isArray(response.data.requirementItems)
          ) {
            items = response.data.requirementItems;
          }
          // Case 3: response.data.data có requirementItems (nested structure)
          else if (
            response.data.data &&
            response.data.data.requirementItems &&
            Array.isArray(response.data.data.requirementItems)
          ) {
            items = response.data.data.requirementItems;
          }
          // Case 4: response.data.data là array
          else if (response.data.data && Array.isArray(response.data.data)) {
            items = response.data.data;
          }

          console.log('DetailInfo - Extracted Requirement Items:', items);
          console.log('DetailInfo - Items count:', items.length);
          setRequirementItems(items || []);
        } else {
          console.log('DetailInfo - No requirement items found or API failed:', response);
          setRequirementItems([]);
        }
      } catch (error) {
        console.error('DetailInfo - Error fetching requirement items:', error);
        setRequirementItems([]);
      } finally {
        setIsLoadingRequirements(false);
      }
    };

    fetchRequirementItems();
  }, [campaignData?.campaignType]);

  // Fetch round types based on campaignType
  useEffect(() => {
    const fetchRoundTypes = async () => {
      if (!campaignData?.campaignType) return;

      // Map campaignType string to number: "Recruitment" = 1, "Promotion" = 2
      const campaignTypeStr = String(campaignData.campaignType).trim();
      let type = null;

      if (campaignTypeStr.toLowerCase() === 'recruitment') {
        type = 1;
      } else if (campaignTypeStr.toLowerCase() === 'promotion') {
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
        console.log('DetailInfo - Round Types Response:', response);

        if (response.success && response.data) {
          // Handle different response structures
          let types = [];

          if (Array.isArray(response.data)) {
            types = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            types = response.data.data;
          }

          console.log('DetailInfo - Extracted Round Types:', types);
          setRoundTypes(types);
        } else {
          console.log('DetailInfo - No round types found or API failed:', response);
          setRoundTypes([]);
        }
      } catch (error) {
        console.error('DetailInfo - Error fetching round types:', error);
        setRoundTypes([]);
      } finally {
        setIsLoadingRoundTypes(false);
      }
    };

    fetchRoundTypes();
  }, [campaignData?.campaignType]);

  if (loading) {
    return (
      <div className="w-full h-full">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600">Loading campaign information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-gray-500">No campaign data available</div>
      </div>
    );
  }

  // Normalize và validate rounds data từ API
  const normalizeRoundsData = (campaign) => {
    if (!campaign) return campaign;

    // Nếu đã có rounds và là array, giữ nguyên
    if (campaign.rounds && Array.isArray(campaign.rounds)) {
      // Validate và normalize từng round
      const normalizedRounds = campaign.rounds.map((round, index) => {
        return {
          campaignRoundId: round.campaignRoundId || round.id || index + 1,
          roundName: round.roundName || round.name || `Batch ${index + 1}`,
          description: round.description || "",
          targetQuantity: round.targetQuantity || round.target || 0,
          actualQuantity: round.actualQuantity || round.actualQuantiy || 0, // Handle typo in API
          status: round.status || "Draft",
          startDate: round.startDate || "",
          endDate: round.endDate || "",
          location: round.location || "",
          method: round.method || "Direct",
          owner: round.owner || "",
          totalApplicants: round.totalApplicants || 0,
        };
      });

      return {
        ...campaign,
        rounds: normalizedRounds,
      };
    }

    // Nếu không có rounds, trả về campaign với rounds là empty array
    if (!campaign.rounds) {
      return {
        ...campaign,
        rounds: [],
      };
    }

    return campaign;
  };

  const data = normalizeRoundsData(campaignData);

  // Format date từ API (có thể là "11/12/2025 00:00" hoặc ISO string)
  const formatDateFromAPI = (dateString) => {
    if (!dateString) return "";
    // Nếu đã là format "dd/mm/yyyy HH:mm", chỉ lấy phần date
    if (dateString.includes("/")) {
      return dateString.split(" ")[0];
    }
    return formatDate(dateString);
  };

  // Format campaignType để hiển thị - kiểm tra nhiều field name
  const formatCampaignType = (type) => {
    if (!type) return "";
    const typeMap = {
      Promotion: "Promotion",
      Recruitment: "Recruitment",
      Replacement: "Replacement",
    };
    return typeMap[type] || type;
  };

  // Format targetQuantity để hiển thị - kiểm tra nhiều field name
  const formatTargetQuantity = (quantity) => {
    if (quantity === null || quantity === undefined || quantity === "")
      return "";
    const num = Number(quantity);
    if (isNaN(num)) return String(quantity);
    return num.toLocaleString("en-US") + " people";
  };

  // Lấy campaignType từ nhiều field name có thể
  // Lưu ý: data từ props/state đã được transform (campaignType → position)
  //        data từ API có format gốc (campaignType)
  const getCampaignType = () => {
    if (!data) return "";

    // Kiểm tra tất cả các field name có thể (bao gồm cả format đã transform)
    const type =
      data.campaignType || // Format gốc từ API
      data.position || // Format đã transform từ Campaign.jsx
      data.campaign_type ||
      data.type ||
      data.campaignTypeName ||
      "";

    return type;
  };

  // Lấy targetQuantity từ nhiều field name có thể
  // Lưu ý: data từ props/state đã được transform (targetQuantity → targetHires)
  //        data từ API có format gốc (targetQuantity)
  const getTargetQuantity = () => {
    if (!data) return "";

    // Kiểm tra tất cả các field name có thể (bao gồm cả format đã transform)
    const quantity =
      data.targetQuantity || // Format gốc từ API
      data.targetHires || // Format đã transform từ Campaign.jsx
      data.target_quantity ||
      data.quantity ||
      data.target ||
      data.targetQty ||
      "";

    return quantity;
  };

  // Lấy position từ nhiều field name có thể
  const getPosition = () => {
    if (!data) return "";

    const position =
      data.position ||
      data.role ||
      data.positionName ||
      "";

    return position;
  };

  // Helper function to render HTML content safely
  const renderHTML = (htmlString) => {
    if (!htmlString) return null;
    return { __html: htmlString };
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 gap-5">
        <Section title="Campaign Information">
          <div className="space-y-4">
            <div className="font-medium text-gray-900">
              {data.campaignName || data.name || ""}
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InfoRow label="Description" value={data.description || "Undetermined"} />
              <div className="flex items-start">
                <div className="text-sm text-gray-500 shrink-0 mr-1">Position:</div>
                <div className="text-sm text-gray-900">
                  <PositionBadge position={getPosition()} />
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-sm text-gray-500 shrink-0 mr-1">Campaign Type:</div>
                <div className="text-sm text-gray-900">
                  <CampaignTypeBadge type={formatCampaignType(getCampaignType())} />
                </div>
              </div>
              <InfoRow label="Status" value={renderStatusBadge(data.status)} />
              <InfoRow
                label="Target Quantity"
                value={formatTargetQuantity(getTargetQuantity()) || "Undetermined"}
              />
              <InfoRow
                label="Start Date"
                value={formatDateFromAPI(data.startDate) || "Undetermined"}
              />
              <InfoRow
                label="End Date"
                value={formatDateFromAPI(data.endDate) || "Undetermined"}
              />
            </div>

            {/* Job Requirements */}
            {requirementItems.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 text-sm font-semibold text-gray-900">📝 Requirements</div>
                <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                  <ul className="space-y-2">
                    {requirementItems.map((item) => (
                      <li key={item.requirementItemId} className="flex items-start">
                        <span className="mr-2 text-blue-600">•</span>
                        <span className="text-sm text-gray-700">
                          <span className="font-medium">{item.title}</span>
                          {item.description && (
                            <span className="text-gray-600">
                              {' : '}
                              {item.description}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Recruitment/Promotion Process - Dynamic from API (getRoundTypes) */}
            <div className="mt-6">
              <div className="mb-3 text-sm font-semibold text-gray-900">
                🔄{' '}
                {(() => {
                  const campaignTypeStr = String(data.campaignType || '')
                    .trim()
                    .toLowerCase();
                  if (campaignTypeStr === 'recruitment') {
                    return 'Recruitment';
                  } else if (campaignTypeStr === 'promotion') {
                    return 'Promotion';
                  } else {
                    const parsed = Number(data.campaignType);
                    if (parsed === 1) return 'Recruitment';
                    if (parsed === 2) return 'Promotion';
                    return '';
                  }
                })()}{' '}
                process
              </div>
              <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
                {roundTypes.length > 0 ? (
                  <div className="space-y-3">
                    {roundTypes.map((roundType, index) => (
                      <div
                        key={roundType.roundTypeId}
                        className="flex items-center p-3 transition-shadow bg-white border rounded-lg shadow-sm border-gray-200 hover:shadow-md"
                      >
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">
                            {roundType.roundTypeName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Loading Process...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Batch Management Section */}
          <div className="mt-6">
            {(() => {
              // Log data being passed to BatchManagement
              console.log("DetailInfo - Passing to BatchManagement:", {
                campaignId: data.campaignId || data.id,
                campaignName: data.campaignName || data.name,
                hasRounds: !!data.rounds,
                roundsCount: Array.isArray(data.rounds)
                  ? data.rounds.length
                  : 0,
                rounds: data.rounds,
              });
              return (
                <BatchManagement
                  campaign={data}
                  onCreateBatch={onCreateBatch}
                />
              );
            })()}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default DetailInfo;
