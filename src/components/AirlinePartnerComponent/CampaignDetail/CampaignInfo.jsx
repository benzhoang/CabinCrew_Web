import React, { useState, useEffect } from "react";
import { formatDate2 } from "../../../config/formatDate";
import { getRequirementItems, getRoundTypes } from "../../../service/api2";
import ProcessTimeline from "../../../components/ProcessTimelineLogic";

const CampaignInfo = ({ campaign }) => {
  const [requirementItems, setRequirementItems] = useState([]);
  const [roundTypes, setRoundTypes] = useState([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [isLoadingRoundTypes, setIsLoadingRoundTypes] = useState(false);

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
        if (response.success && response.data) {
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
        if (response.success && response.data) {
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

  // StatusBadge component - matching CampaignList.jsx
  const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      const normalized = (status || "").toString().trim();
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
        case "Cancelled":
          return {
            className: "bg-orange-100 text-orange-700 border-orange-200",
            text: "Canceled",
          };
        case "ongoing":
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
        case "ended":
          return {
            className: "bg-gray-100 text-gray-700 border-gray-200",
            text: "Ended",
          };
        case "canceled":
        case "cancelled":
          return {
            className: "bg-orange-100 text-orange-700 border-orange-200",
            text: "Canceled",
          };
        case "upcoming":
          return {
            className: "bg-purple-100 text-purple-700 border-purple-200",
            text: "Upcoming",
          };
        case "draft":
          return {
            className: "bg-slate-100 text-slate-600 border-slate-200",
            text: "Planning",
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

  // CampaignTypeBadge component - matching CampaignList.jsx
  const CampaignTypeBadge = ({ type }) => {
    const getCampaignTypeLabel = (campaignType) => {
      switch (campaignType?.toLowerCase()) {
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
      type?.toLowerCase() === "promotion"
        ? "bg-purple-100 text-purple-700 border-purple-200"
        : type?.toLowerCase() === "recruitment"
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

  // PartnerBadge component - matching CampaignList.jsx
  const PartnerBadge = ({ partnerName }) => {
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
      } else if (
        partner.includes("bamboo") ||
        partner.includes("bamboo airways")
      ) {
        return "bg-green-100 text-green-800 border-green-300";
      } else if (
        partner.includes("jetstar") ||
        partner.includes("sun phuquoc")
      ) {
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      }
      return "bg-cyan-100 text-cyan-800 border-cyan-300";
    };

    return (
      <span
        className={`${getPartnerColor(
          partnerName
        )} inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap`}
      >
        {partnerName || "No partner"}
      </span>
    );
  };

  if (!campaign) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="px-5 py-4">
        <div className="font-semibold text-gray-900">Campaign information</div>
      </div>

      <div className="p-5">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow
              label="Description"
              value={campaign?.description || "No description"}
            />
            <InfoRow
              label="Campaign Type"
              value={<CampaignTypeBadge type={campaign?.campaignType} />}
            />
            <InfoRow
              label="Status"
              value={<StatusBadge status={campaign?.status} />}
            />
            <InfoRow
              label="Partner"
              value={<PartnerBadge partnerName={campaign?.partnerName} />}
            />
            {(campaign?.campaignType?.toLowerCase() === "promotion" ||
              campaign?.campaignType === "Promotion") && (
              <InfoRow
                label="Position"
                value={
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(
                      campaign?.position
                    )}`}
                  >
                    {campaign?.position || "No position"}
                  </span>
                }
              />
            )}
            {(campaign?.campaignType?.toLowerCase() === "recruitment" ||
              campaign?.campaignType === "Recruitment") && (
              <InfoRow
                label="Position"
                value={
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(
                      campaign?.position
                    )}`}
                  >
                    {campaign?.position || "No position"}
                  </span>
                }
              />
            )}
            <InfoRow
              label="Target applicants"
              value={`${
                campaign?.targetQuantity || campaign?.targetHires || 0
              } applicants`}
            />
            <InfoRow
              label="Start date"
              value={formatDate2(campaign?.startDate) || "No start date"}
            />
            <InfoRow
              label="End date"
              value={formatDate2(campaign?.endDate) || "No end date"}
            />
          </div>

          {/* Job Requirements - Dynamic from API (getRequirementItems) */}
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              📝 Requirements
            </h3>
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              {isLoadingRequirements ? (
                <div className="text-sm text-slate-500">
                  Loading requirements...
                </div>
              ) : requirementItems.length > 0 ? (
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
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              🔄{" "}
              {(() => {
                const campaignTypeStr = String(campaign.campaignType || "")
                  .trim()
                  .toLowerCase();
                if (campaignTypeStr === "recruitment") {
                  return "Recruitment";
                } else if (campaignTypeStr === "promotion") {
                  return "Promotion";
                } else {
                  const parsed = Number(campaign.campaignType);
                  if (parsed === 1) return "Recruitment";
                  if (parsed === 2) return "Promotion";
                  return "";
                }
              })()}{" "}
              processes
            </h3>
            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
              <ProcessTimeline
                campaignType={campaign.campaignType}
                roundTypes={roundTypes}
                isLoading={isLoadingRoundTypes}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start">
    <div className="mr-3 text-sm text-slate-600 shrink-0">{label}:</div>
    <div className="text-sm text-slate-800">{value}</div>
  </div>
);

export default CampaignInfo;
