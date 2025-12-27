import React, { useState, useEffect } from "react";
import { formatDate2 } from "../../../config/formatDate";
import BatchManagement from "./BatchManagement";
import { getRequirementItems, getRoundTypes } from "../../../service/api2";
import ProcessTimeline from "../../../components/ProcessTimelineLogic";

const DetailInfo = ({ campaign, onCreateBatch }) => {
  const [requirementItems, setRequirementItems] = useState([]);
  const [roundTypes, setRoundTypes] = useState([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [isLoadingRoundTypes, setIsLoadingRoundTypes] = useState(false);
  const showBatchStatus = ["ongoing", "upcoming", "ended"].includes(
    String(campaign?.status || "")
      .trim()
      .toLowerCase()
  );

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

  return (
    <div className="bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="text-sm text-slate-500">Proposal information</div>
          <div className="font-semibold text-slate-800">
            {campaign?.partnerName || "N/A"}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(campaign?.campaignType?.toLowerCase() === "promotion" ||
              campaign?.campaignType === "Promotion") && (
              <div>
                <div className="mb-1 text-sm text-slate-600">Position</div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(
                      campaign?.position
                    )}`}
                  >
                    {campaign?.position || "N/A"}
                  </span>
                </div>
              </div>
            )}
            {(campaign?.campaignType?.toLowerCase() === "recruitment" ||
              campaign?.campaignType === "Recruitment") && (
              <div>
                <div className="mb-1 text-sm text-slate-600">Position</div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(
                      campaign?.position
                    )}`}
                  >
                    {campaign?.position || "N/A"}
                  </span>
                </div>
              </div>
            )}
            <Info
              label="Target quantity"
              value={`${
                campaign?.targetQuantity || campaign?.targetHires || 0
              }`}
            />
            <Info
              label="Start date"
              value={formatDate2(campaign?.startDate) || "N/A"}
            />
            <Info
              label="End date"
              value={formatDate2(campaign?.endDate) || "N/A"}
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

          <BatchManagement
            campaign={campaign}
            onCreateBatch={onCreateBatch}
            showBatchStatus={showBatchStatus}
          />
        </div>
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

export default DetailInfo;
