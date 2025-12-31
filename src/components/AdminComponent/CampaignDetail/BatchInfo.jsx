import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate2 } from "../../../config/formatDate";

const BatchCard = ({ batch, statusCfg, onViewApplicants, showStatus }) => {
  const isUpcoming = batch.status === "upcoming";

  const handleViewApplicants = () => {
    if (isUpcoming) return;
    onViewApplicants(batch);
  };

  return (
    <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {batch.name}
        </div>
        {showStatus && batch.status?.toLowerCase() !== "pending" && (
          <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.color}`}>
            {statusCfg.text}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
          <InfoMini label="Start time" value={formatDate2(batch.startDate)} />
          <InfoMini label="End time" value={formatDate2(batch.endDate)} />
          {batch.target !== undefined && batch.target !== null && (
            <InfoMini
              label="Target applicants"
              value={batch.target.toString() + " applicants"}
            />
          )}
          {batch.current !== undefined && batch.current !== null && (
            <InfoMini
              label="Passed applicants"
              value={(batch.current ?? 0).toString() + " applicants"}
            />
          )}
          {batch.note && <InfoMini label="Description" value={batch.note} />}
        </div>

        {/* {(batch.totalApplicants !== undefined ||
          batch.appliedCandidates !== undefined) && (
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => setOpenStats(!openStats)}
              className="flex items-center justify-between w-full text-xs font-medium transition text-slate-700 hover:text-blue-600"
            >
              <span>Applicant statistics</span>
              <span>{openStats ? "▲" : "▼"}</span>
            </button>
            {openStats && (
              <div className="mt-3">
                <div className="grid grid-cols-2 gap-3">
                  {batch.totalApplicants !== undefined && (
                    <div className="p-3 rounded-lg bg-blue-50">
                      <div className="mb-1 text-xs text-blue-600">
                        Interested
                      </div>
                      <div className="text-lg font-bold text-blue-700">
                        {batch.totalApplicants}
                      </div>
                    </div>
                  )}
                  {batch.appliedCandidates !== undefined && (
                    <div className="p-3 rounded-lg bg-green-50">
                      <div className="mb-1 text-xs text-green-600">Applied</div>
                      <div className="text-lg font-bold text-green-700">
                        {batch.appliedCandidates}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {batch.target !== undefined && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1 text-xs text-slate-600">
              <span>Recruitment progress</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200">
              <div
                className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        )} */}

        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={handleViewApplicants}
            disabled={isUpcoming}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-md transition-colors duration-200 font-medium ${
              isUpcoming
                ? "bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800"
            }`}
            title={
              isUpcoming
                ? "Cannot view applicant list because the round has not started"
                : "View applicant list"
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
            {isUpcoming ? "Cannot view applicant list" : "View applicant list"}
          </button>
        </div>
      </div>
    </div>
  );
};

const BatchInfo = ({ campaign, showBatchStatus = false }) => {
  const navigate = useNavigate();

  // Check if campaign status is one of: upcoming, ongoing, ended
  const shouldShowBatchStatus =
    showBatchStatus &&
    ["ongoing", "upcoming", "ended"].includes(
      String(campaign?.status || "")
        .trim()
        .toLowerCase()
    );

  const mapRoundToBatch = (round) => {
    const statusMap = {
      Ongoing: "ongoing",
      Completed: "completed",
      Upcoming: "upcoming",
      Ended: "ended",
    };

    return {
      id: round.campaignRoundId || round.id,
      name: round.roundName || round.name || `Round ${round.campaignRoundId}`,
      startDate: round.startDate,
      endDate: round.endDate,
      status:
        statusMap[round.status] || round.status?.toLowerCase() || "planned",
      current:
        round.actualQuantiy || round.actualQuantity || round.current || 0,
      target: round.targetQuantity || round.target || 0,
      appliedCandidates: round.actualQuantity || round.actualQuantiy || 0, // Fix: use actualQuantity like BatchManagement
      note: round.description || round.note || "No note",
    };
  };

  const currentBatches = useMemo(() => {
    if (Array.isArray(campaign?.rounds) && campaign.rounds.length > 0) {
      return campaign.rounds.map(mapRoundToBatch);
    }

    if (Array.isArray(campaign?.batches) && campaign.batches.length) {
      return campaign.batches;
    }

    return [];
  }, [campaign]);

  const getStatus = (status) => {
    const map = {
      ongoing: { text: "Ongoing", color: "bg-green-100 text-green-700" },
      completed: { text: "Completed", color: "bg-blue-100 text-blue-700" },
      ended: { text: "Ended", color: "bg-slate-100 text-slate-700" },
      upcoming: { text: "Upcoming", color: "bg-yellow-100 text-yellow-800" },
    };
    return map[status] || map.ended;
  };

  const percent = (current, target) => {
    if (!target || target <= 0) return 0;
    const p = Math.round((Number(current || 0) / Number(target)) * 100);
    return Math.max(0, Math.min(100, p));
  };

  const handleViewCandidates = (batch) => {
    const campaignRoundId = batch?.campaignRoundId || batch?.id;
    const campaignId = campaign?.campaignId || campaign?.id;
    if (!campaignRoundId || !campaignId) return;

    navigate(`/admin/campaigns/${campaignId}/applications/${campaignRoundId}`, {
      state: {
        campaignRoundId,
        roundName: batch.name,
        round: batch,
        campaign,
      },
    });
  };

  // Get campaign type label for display
  const getCampaignTypeLabel = () => {
    const campaignTypeStr = String(campaign?.campaignType || "")
      .trim()
      .toLowerCase();

    if (campaignTypeStr === "recruitment") {
      return "Recruitment plan";
    } else if (campaignTypeStr === "promotion") {
      return "Promotion plan";
    } else {
      // Try to parse as number for backward compatibility
      const parsed = Number(campaign?.campaignType);
      if (parsed === 1) return "Recruitment plan";
      if (parsed === 2) return "Promotion plan";
      return "Recruitment plan"; // Fallback
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div className="text-sm font-semibold text-slate-800">
          {getCampaignTypeLabel()}
        </div>
      </div>

      <div className="p-5">
        {currentBatches.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            No recruitment round
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {currentBatches.map((batch) => {
              const statusCfg = getStatus(batch.status);
              const progressPercent = percent(batch.current, batch.target);
              return (
                <BatchCard
                  key={batch.id || batch.name}
                  batch={batch}
                  statusCfg={statusCfg}
                  percent={progressPercent}
                  onViewApplicants={handleViewCandidates}
                  showStatus={shouldShowBatchStatus}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoMini = ({ label, value }) => (
  <div>
    <div className="text-slate-500">{label}</div>
    <div className="font-medium text-slate-800">{value}</div>
  </div>
);

export default BatchInfo;
