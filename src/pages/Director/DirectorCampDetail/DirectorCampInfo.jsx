import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getCampaignById } from "../../../service/api";
import DirectorBatchInfo from "./DirectorBatchInfo";

const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const Section = ({ title, children }) => (
  <div className="p-5 bg-white border border-gray-200 rounded-xl">
    <div className="mb-3 text-sm font-semibold text-gray-900">{title}</div>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-sm text-gray-500 w-36 shrink-0">{label}</div>
    <div className="text-sm text-gray-900">{value}</div>
  </div>
);

const DirectorCampInfo = ({ campaign, onCreateBatch }) => {
  const { id } = useParams();
  const { state } = useLocation();
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaignData = async () => {
      // Prefer campaign from props or state first
      if (campaign || state?.campaign) {
        const campaignFromProps = campaign || state?.campaign;

        // Log campaign from props/state
        console.log(
          "DetailInfo - Campaign from props/state:",
          campaignFromProps
        );
        console.log("DetailInfo - Has rounds:", !!campaignFromProps?.rounds);

        // Ensure rounds is an array (if exists) - create a copy to avoid mutate
        // Ensure rounds is an array (if exists) - create a copy to avoid mutate
        // Ensure rounds is an array (if exists) - create a copy to avoid mutate
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

        // If rounds are empty, fetch by id to hydrate rounds from API
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
              // Ensure rounds is an array
              if (apiData && !Array.isArray(apiData.rounds) && apiData.rounds) {
                apiData = { ...apiData, rounds: [apiData.rounds] };
              }
              // Merge data: keep existing info, prefer rounds from API
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

      // If no campaign from props/state, fetch by ID from API
      if (id) {
        try {
          setLoading(true);
          const result = await getCampaignById(id);
          if (result.success) {
            const apiData = result.data;

            // Log API response for debugging
            console.log("DetailInfo - API Response:", apiData);
            console.log(
              "DetailInfo - API Response has rounds:",
              !!apiData?.rounds
            );
            if (apiData?.rounds) {
              console.log("DetailInfo - API Rounds:", apiData.rounds);
            }

            // Ensure rounds is an array (if present) - create copy to avoid mutate
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

  // Debug: log data when it changes (once per change)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-gray-500">Loading campaign information...</div>
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
        <div className="text-gray-500">No campaign data</div>
      </div>
    );
  }

  // Normalize and validate rounds data from API
  const normalizeRoundsData = (campaign) => {
    if (!campaign) return campaign;

    // If rounds already exist and are array, keep them
    if (campaign.rounds && Array.isArray(campaign.rounds)) {
      // Validate and normalize each round
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
          method: round.method || "In-person",
          owner: round.owner || "",
          totalApplicants: round.totalApplicants || 0,
        };
      });

      return {
        ...campaign,
        rounds: normalizedRounds,
      };
    }

    // If no rounds, return campaign with empty rounds array
    if (!campaign.rounds) {
      return {
        ...campaign,
        rounds: [],
      };
    }

    return campaign;
  };

  const data = normalizeRoundsData(campaignData);

  // Format date from API (e.g. "11/12/2025 00:00" or ISO string)
  const formatDateFromAPI = (dateString) => {
    if (!dateString) return "";
    // If already "dd/mm/yyyy HH:mm", only keep date part
    if (dateString.includes("/")) {
      return dateString.split(" ")[0];
    }
    return formatDate(dateString);
  };

  // Format campaignType for display - check multiple field names
  const formatCampaignType = (type) => {
    if (!type) return "";
    const typeMap = {
      Promotion: "Promotion",
      Recruitment: "Recruitment",
      Replacement: "Replacement",
    };
    return typeMap[type] || type;
  };

  // Format targetQuantity for display - check multiple field names
  const formatTargetQuantity = (quantity) => {
    if (quantity === null || quantity === undefined || quantity === "")
      return "";
    const num = Number(quantity);
    if (isNaN(num)) return String(quantity);
    return num.toLocaleString("en-US") + " people";
  };

  // Get campaignType from multiple possible field names
  // Note: props/state data might be transformed (campaignType -> position)
  //       API data keeps original format (campaignType)
  const getCampaignType = () => {
    if (!data) return "";

    // Check all possible field names (including transformed ones)
    const type =
      data.campaignType || // Original from API
      data.position || // Transformed from Campaign.jsx
      data.campaign_type ||
      data.type ||
      data.campaignTypeName ||
      "";

    return type;
  };

  // Get targetQuantity from multiple possible field names
  // Note: props/state data might be transformed (targetQuantity -> targetHires)
  //       API data keeps original format (targetQuantity)
  const getTargetQuantity = () => {
    if (!data) return "";

    // Check all possible field names (including transformed ones)
    const quantity =
      data.targetQuantity || // Original from API
      data.targetHires || // Transformed from Campaign.jsx
      data.target_quantity ||
      data.quantity ||
      data.target ||
      data.targetQty ||
      "";

    return quantity;
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 gap-5">
        <Section title="Proposal information">
          <div className="space-y-4">
            <div className="font-medium text-gray-900">
              {data.campaignName || data.name || ""}
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InfoRow label="Description" value={data.description || ""} />
              <InfoRow
                label="Campaign type"
                value={formatCampaignType(getCampaignType())}
              />
              <InfoRow label="Status" value={data.status || ""} />
              <InfoRow
                label="Target quantity"
                value={formatTargetQuantity(getTargetQuantity())}
              />
              <InfoRow
                label="Start date"
                value={formatDateFromAPI(data.startDate) || ""}
              />
              <InfoRow
                label="End date"
                value={formatDateFromAPI(data.endDate) || ""}
              />
            </div>
          </div>

          {/* Job Description */}
          {data.jobDescription && (
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                Job Description
              </h3>
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div
                  className="job-description-content text-sm prose-sm prose text-slate-700 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: data.jobDescription || "N/A",
                  }}
                />
              </div>
            </div>
          )}

          {/* Job Requirements */}
          {data.jobRequirement && (
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                Job Requirements
              </h3>
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div
                  className="job-description-content text-sm prose-sm prose text-slate-700 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: data.jobDescription || "N/A",
                  }}
                />
              </div>
            </div>
          )}
          {/* Batch Management Section */}
          <div className="mt-6">
            {(() => {
              // Log data being passed to DirectorBatchInfo
              console.log("DetailInfo - Passing to DirectorBatchInfo:", {
                campaignId: data.campaignId || data.id,
                campaignName: data.campaignName || data.name,
                hasRounds: !!data.rounds,
                roundsCount: Array.isArray(data.rounds)
                  ? data.rounds.length
                  : 0,
                rounds: data.rounds,
              });
              return <DirectorBatchInfo campaign={data} />;
            })()}
          </div>
        </Section>
      </div>
    </div>
  );
};
export default DirectorCampInfo;
