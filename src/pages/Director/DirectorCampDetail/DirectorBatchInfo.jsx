import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateCampaignStatus } from "../../../service/api";
import RejectCampaignModal from "./RejectCampaignModal";
import { toast } from "react-toastify";
import { formatDateFromAPI } from "../../../config/formatDate";

// Helper function to format date for display
const formatDateForDisplay = (
  dateString,
  fallbackTime = null,
  isEndDate = false
) => {
  if (!dateString) {
    if (fallbackTime) {
      if (fallbackTime.includes(" - ")) {
        const datePart = isEndDate
          ? fallbackTime.split(" - ")[1]
          : fallbackTime.split(" - ")[0];
        // Format the date part to DD/MM/YYYY
        return formatDateFromAPI(datePart);
      }
      return formatDateFromAPI(fallbackTime);
    }
    return "-";
  }

  // Use formatDateFromAPI to ensure DD/MM/YYYY format
  return formatDateFromAPI(dateString) || "-";
};

const BatchCard = ({ batch, statusCfg, percent, campaignId, showStatus }) => {
  const [openStats, setOpenStats] = useState(false);
  const navigate = useNavigate();

  // Check if batch is upcoming
  const isUpcoming = batch.status === "upcoming";

  const handleViewApplicants = () => {
    // Block viewing applicants if batch is upcoming
    if (isUpcoming) {
      return;
    }

    const campaignRoundId = batch.id || batch.campaignRoundId;
    navigate(`/director/applications/${campaignRoundId}`, {
      state: {
        campaignId,
        batchName: batch.name,
        batch: batch,
      },
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="text-sm font-semibold text-slate-800">{batch.name}</div>
        {showStatus && (
          <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.color}`}>
            {statusCfg.text}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <InfoMini
            label="Start date"
            value={formatDateForDisplay(batch.startDate, batch.time, false)}
          />
          <InfoMini
            label="End date"
            value={formatDateForDisplay(batch.endDate, batch.time, true)}
          />
          {batch.target !== undefined && batch.target !== null && (
            <InfoMini label="Target" value={batch.target.toString()} />
          )}
          {batch.appliedCandidates !== undefined &&
            batch.appliedCandidates !== null && (
              <InfoMini
                label="Actual"
                value={batch.appliedCandidates?.toString() || "0"}
              />
            )}
          {batch.note && <InfoMini label="Description" value={batch.note} />}
        </div>

        {/* Applicant Statistics Dropdown
        {(batch.totalApplicants !== undefined ||
          batch.appliedCandidates !== undefined) && (
            <div className="border-t border-slate-100 pt-3">
              <button
                onClick={() => setOpenStats(!openStats)}
                className="w-full flex items-center justify-between text-xs text-slate-700 font-medium hover:text-blue-600 transition"
              >
                <span>Applicant stats</span>
                <span>{openStats ? "^" : "v"}</span>
              </button>
              {openStats && (
                <div className="mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    {batch.totalApplicants !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-600 mb-1">
                          Interested
                        </div>
                        <div className="text-lg font-bold text-blue-700">
                          {batch.totalApplicants}
                        </div>
                      </div>
                    )}
                    {batch.appliedCandidates !== undefined && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-xs text-green-600 mb-1">
                          Applied
                        </div>
                        <div className="text-lg font-bold text-green-700">
                          {batch.appliedCandidates}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )} */}

        {/* Recruitment Progress
        {batch.target !== undefined && (
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Recruitment progress</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        )} */}

        {/* View Applicants Button */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <button
            onClick={handleViewApplicants}
            disabled={isUpcoming}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-md transition-colors duration-200 font-medium ${isUpcoming
              ? "bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800"
              }`}
            title={
              isUpcoming
                ? "Cannot view applicants because the batch has not started"
                : "View applicants"
            }
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            {isUpcoming ? "Cannot view list" : "View Applicant List"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Format date from API (e.g. "13/11/2025 00:00" or ISO) to YYYY-MM-DD format for internal use
const convertDateToISOFormat = (dateString) => {
  if (!dateString) return "";
  if (typeof dateString !== "string") return "";

  // If already "dd/mm/yyyy HH:mm"
  if (dateString.includes("/")) {
    // Convert "13/11/2025 00:00" to "2025-11-13"
    const parts = dateString.split(" ")[0].split("/");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }

  // If ISO string, keep date part
  if (dateString.includes("T") || dateString.includes("-")) {
    return dateString.split("T")[0];
  }

  return dateString;
};

// Convert rounds from API to component format
const convertRoundsToBatches = (rounds) => {
  if (!Array.isArray(rounds) || rounds.length === 0) {
    console.log("convertRoundsToBatches: No rounds data or empty array");
    return [];
  }

  console.log("convertRoundsToBatches: Converting rounds:", rounds);

  return rounds.map((round, index) => {
    // Map API status to component status
    const statusMap = {
      Upcoming: "upcoming",
      Ongoing: "ongoing",
      Completed: "completed",
      Draft: "planned",
      Cancelled: "cancelled",
      Paused: "paused",
    };

    const mappedStatus =
      statusMap[round.status] || round.status?.toLowerCase() || "planned";

    // Format dates (convert to ISO format for internal use)
    const startDate = convertDateToISOFormat(round.startDate);
    const endDate = convertDateToISOFormat(round.endDate);

    // Format time string for display
    const timeString =
      round.startDate && round.endDate
        ? `${round.startDate.split(" ")[0]} - ${round.endDate.split(" ")[0]}`
        : "";

    const batchData = {
      id: round.campaignRoundId || round.id || index,
      name: round.roundName || round.name || `Batch ${index + 1}`,
      startDate: startDate,
      endDate: endDate,
      time: timeString,
      location: round.location || "",
      method: round.method || "In-person",
      owner: round.owner || "",
      status: mappedStatus,
      target: round.targetQuantity || round.target || 0,
      totalApplicants: round.totalApplicants || 0,
      appliedCandidates: round.actualQuantity || round.actualQuantiy || 0, // Fix: actualQuantity is correct spelling
      note: round.description || round.note || "",
      description: round.description || "",
    };

    console.log(`convertRoundsToBatches: Round ${index} converted:`, batchData);
    return batchData;
  });
};

const DirectorBatchInfo = ({ campaign, showBatchStatus = false }) => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const navigate = useNavigate();

  const [currentBatches, setCurrentBatches] = useState(() => {
    console.log("DirectorBatchInfo: Initializing with campaign:", campaign);
    // Prefer rounds from campaign data
    if (
      campaign?.rounds &&
      Array.isArray(campaign.rounds) &&
      campaign.rounds.length > 0
    ) {
      console.log(
        "DirectorBatchInfo: Found rounds in campaign:",
        campaign.rounds
      );
      return convertRoundsToBatches(campaign.rounds);
    }
    // Fallback: use batches if available
    if (Array.isArray(campaign?.batches) && campaign.batches.length > 0) {
      console.log(
        "DirectorBatchInfo: Found batches in campaign:",
        campaign.batches
      );
      return campaign.batches;
    }
    // No data, return empty array
    console.log("DirectorBatchInfo: No rounds or batches found");
    return [];
  });

  // Update when campaign data changes
  useEffect(() => {
    console.log("DirectorBatchInfo: Campaign data changed:", campaign);
    if (campaign?.rounds && Array.isArray(campaign.rounds)) {
      console.log(
        "DirectorBatchInfo: Updating batches from rounds:",
        campaign.rounds
      );
      const convertedBatches = convertRoundsToBatches(campaign.rounds);
      console.log("DirectorBatchInfo: Converted batches:", convertedBatches);
      setCurrentBatches(convertedBatches);
    } else if (
      Array.isArray(campaign?.batches) &&
      campaign.batches.length > 0
    ) {
      console.log(
        "DirectorBatchInfo: Updating batches from batches array:",
        campaign.batches
      );
      setCurrentBatches(campaign.batches);
    } else {
      console.log("DirectorBatchInfo: No rounds or batches, clearing batches");
      setCurrentBatches([]);
    }
  }, [campaign]);

  const getStatus = (status) => {
    const map = {
      ongoing: { text: "Ongoing", color: "bg-green-100 text-green-700" },
      completed: { text: "Completed", color: "bg-blue-100 text-blue-700" },
      planned: {
        text: "Planned",
        color: "bg-slate-100 text-slate-700",
      },
      upcoming: { text: "Upcoming", color: "bg-yellow-100 text-yellow-800" },
      paused: { text: "Paused", color: "bg-orange-100 text-orange-700" },
      cancelled: { text: "Cancelled", color: "bg-red-100 text-red-700" },
    };
    return map[status] || map.planned;
  };

  const percent = (current, target) => {
    if (!target || target <= 0) return 0;
    const p = Math.round((Number(current || 0) / Number(target)) * 100);
    return Math.max(0, Math.min(100, p));
  };

  // Lấy campaignType từ campaign object (tương tự như trong BatchManagement)
  const getCampaignType = () => {
    if (!campaign) return "";
    const type =
      campaign.campaignType ||
      campaign.position ||
      campaign.campaign_type ||
      campaign.type ||
      campaign.campaignTypeName ||
      "";
    return String(type).trim();
  };

  // Format campaignType để xác định loại batch plan
  const getBatchPlanLabel = () => {
    const campaignType = getCampaignType().toLowerCase();
    if (campaignType.includes("promotion")) {
      return "Promotion Batch Plan";
    } else if (campaignType.includes("recruitment")) {
      return "Recruitment Batch Plan";
    }
    // Default fallback
    return "Batch Plan";
  };

  const batchPlanLabel = getBatchPlanLabel();

  // Check if campaign is pending approval
  const isPendingApproval = () => {
    if (!campaign?.status) return false;

    const statusLower = String(campaign.status).toLowerCase().trim();

    // Check various representations of pending approval
    return (
      statusLower === "pending" ||
      statusLower === "pending_approval" ||
      statusLower === "pending approval" ||
      statusLower === "waiting for approval" ||
      statusLower === "waiting"
    );
  };

  const handleApproveConfirm = async () => {
    if (currentBatches.length === 0) {
      toast.error("No batch to approve yet!");
      return;
    }

    const campaignId = campaign?.campaignId || campaign?.id;
    if (!campaignId) {
      toast.error("Campaign ID not found!");
      return;
    }

    setIsApproving(true);

    try {
      const result = await updateCampaignStatus(campaignId, 2);

      if (result.success) {
        toast.success("Campaign approved successfully!");
        setIsApproveModalOpen(false);
        navigate("/director/campaigns/");
      } else {
        toast.error("Failed to approve campaign");
      }
    } catch (error) {
      console.error("Error approving campaign:", error);
      toast.error("Error while approving campaign");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (rejectReason) => {
    // Get campaign ID
    const campaignId = campaign?.campaignId || campaign?.id;
    if (!campaignId) {
      toast.error("Campaign ID not found!");
      setIsRejectModalOpen(false);
      return;
    }

    // Validate rejectReason
    if (!rejectReason || !rejectReason.trim()) {
      toast.error("Please enter a rejection reason!");
      return;
    }

    setIsRejecting(true);

    try {
      // Call API to reject campaign (status = 3 = Rejected)
      const result = await updateCampaignStatus(
        campaignId,
        3,
        rejectReason.trim()
      );

      if (result.success) {
        toast.success("Campaign rejected successfully!");
        setIsRejectModalOpen(false);
        // Reload page to refresh data
        window.location.reload();
      } else {
        toast.error("Failed to reject campaign");
      }
    } catch (error) {
      console.error("Error rejecting campaign:", error);
      toast.error("Error while rejecting campaign");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-2">
        <div className="text-sm text-slate-600">{batchPlanLabel}</div>
      </div>
      {currentBatches.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-slate-500 text-sm">
          No batches yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentBatches.map((batch, index) => {
            const statusCfg = getStatus(batch.status);
            const progressPercent = percent(
              batch.appliedCandidates || 0,
              batch.target
            );
            return (
              <BatchCard
                key={batch.id || index}
                batch={batch}
                statusCfg={statusCfg}
                percent={progressPercent}
                campaignId={campaign?.campaignId || campaign?.id || 1}
                showStatus={showBatchStatus}
              />
            );
          })}
        </div>
      )}

      {/* Action Buttons at the bottom - only show when campaign is pending approval */}
      {isPendingApproval() && (
        <div className="mt-6 flex gap-4 justify-end">
          <button
            onClick={handleReject}
            disabled={isRejecting || isApproving}
            className={`flex items-center gap-2 px-6 py-3 text-sm text-white rounded-lg transition-all duration-200 font-medium shadow-md transform ${isRejecting || isApproving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-105 active:scale-95"
              }`}
          >
            {isRejecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Rejecting...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Reject
              </>
            )}
          </button>
          <button
            onClick={() => setIsApproveModalOpen(true)}
            disabled={isApproving || isRejecting}
            className={`flex items-center gap-2 px-6 py-3 text-sm text-white rounded-lg transition-all duration-200 font-medium shadow-md transform ${isApproving || isRejecting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-105 active:scale-95"
              }`}
          >
            {isApproving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Approving...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Approve
              </>
            )}
          </button>
        </div>
      )}

      {/* Reject Campaign Modal */}
      <RejectCampaignModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={handleRejectSubmit}
        campaignTitle={campaign?.campaignName || campaign?.name || "Campaign"}
      />

      {/* Approve confirmation modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Approve campaign
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Are you sure you want to approve this campaign?
              </p>
            </div>
            <div className="px-6 py-4 flex justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={handleApproveConfirm}
                className={`px-4 py-2 text-sm font-medium rounded-md text-white ${isApproving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {isApproving ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoMini = ({ label, value }) => (
  <div>
    <div className="text-slate-500">{label}</div>
    <div className="text-slate-800 font-medium">{value}</div>
  </div>
);

export default DirectorBatchInfo;
