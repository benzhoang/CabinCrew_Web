import React, { useState, useMemo } from "react";
import { FaTasks } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddTaskModal from "./AddTaskModal";
import { formatDateOnly } from "../../../config/formatDate";

const BatchCard = ({ batch, statusCfg, percent }) => {
  const [openStats, setOpenStats] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra xem đợt có đang "sắp diễn ra" không
  const isUpcoming = batch.status === "upcoming";

  const handleViewApplicants = () => {
    // Không cho phép xem danh sách ứng viên nếu đợt đang "sắp diễn ra"
    if (isUpcoming) {
      return;
    }

    navigate("/recruiter/applications");
  };

  return (
    <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {batch.name}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.color}`}>
          {statusCfg.text}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
          <InfoMini
            label="Thời gian bắt đầu"
            value={formatDateOnly(batch.startDate)}
          />
          <InfoMini
            label="Thời gian kết thúc"
            value={formatDateOnly(batch.endDate)}
          />
          <InfoMini label="Địa điểm" value={batch.location || "—"} />
          <InfoMini label="Hình thức" value={batch.method || "—"} />
          <InfoMini label="Phụ trách" value={batch.owner || "—"} />
          {batch.target !== undefined && (
            <InfoMini
              label="Chỉ tiêu"
              value={`${batch.current ?? 0}/${batch.target}`}
            />
          )}
          {batch.note && <InfoMini label="Ghi chú" value={batch.note} />}
        </div>

        {/* Applicant Statistics Dropdown */}
        {(batch.totalApplicants !== undefined ||
          batch.appliedCandidates !== undefined) && (
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => setOpenStats(!openStats)}
              className="flex items-center justify-between w-full text-xs font-medium transition text-slate-700 hover:text-blue-600"
            >
              <span>Thống kê ứng viên</span>
              <span>{openStats ? "▲" : "▼"}</span>
            </button>
            {openStats && (
              <div className="mt-3">
                <div className="grid grid-cols-2 gap-3">
                  {batch.totalApplicants !== undefined && (
                    <div className="p-3 rounded-lg bg-blue-50">
                      <div className="mb-1 text-xs text-blue-600">
                        Lượt quan tâm
                      </div>
                      <div className="text-lg font-bold text-blue-700">
                        {batch.totalApplicants}
                      </div>
                    </div>
                  )}
                  {batch.appliedCandidates !== undefined && (
                    <div className="p-3 rounded-lg bg-green-50">
                      <div className="mb-1 text-xs text-green-600">
                        Đã ứng tuyển
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
        )}

        {/* Recruitment Progress */}
        {batch.target !== undefined && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1 text-xs text-slate-600">
              <span>Tiến độ tuyển dụng</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200">
              <div
                className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* View Applicants Button */}
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
                ? "Chưa thể xem danh sách ứng viên vì đợt chưa bắt đầu"
                : "Xem danh sách ứng viên"
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
            {isUpcoming ? "Chưa thể xem danh sách" : "Xem danh sách ứng viên"}
          </button>
        </div>
      </div>
    </div>
  );
};

const BatchManagement = ({ campaign, onCreateBatch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map rounds from API to batch format
  const mapRoundToBatch = (round) => {
    const statusMap = {
      Ongoing: "ongoing",
      Completed: "completed",
      Planned: "planned",
      Upcoming: "upcoming",
      Paused: "paused",
      Cancelled: "cancelled",
    };

    return {
      id: round.campaignRoundId,
      name: round.roundName || `Round ${round.campaignRoundId}`,
      startDate: round.startDate,
      endDate: round.endDate,
      time:
        round.startDate && round.endDate
          ? `${round.startDate} - ${round.endDate}`
          : undefined,
      location: round.location || "—",
      method: round.method || "Trực tiếp",
      owner: round.owner || "—",
      status:
        statusMap[round.status] || round.status?.toLowerCase() || "planned",
      current: round.actualQuantiy || round.actualQuantity || 0,
      target: round.targetQuantity || 0,
      totalApplicants: round.totalApplicants || 0,
      appliedCandidates: round.appliedCandidates || 0,
      note: round.description || round.note || "",
    };
  };

  const currentBatches = useMemo(() => {
    // If campaign has rounds from API, use them
    if (Array.isArray(campaign?.rounds) && campaign.rounds.length > 0) {
      return campaign.rounds.map(mapRoundToBatch);
    }

    // Fallback to campaign.batches if exists
    if (Array.isArray(campaign?.batches) && campaign.batches.length) {
      return campaign.batches;
    }

    // Default empty array
    return [];
  }, [campaign]);

  const getStatus = (status) => {
    const map = {
      ongoing: { text: "Đang diễn ra", color: "bg-green-100 text-green-700" },
      completed: { text: "Hoàn thành", color: "bg-blue-100 text-blue-700" },
      planned: {
        text: "Đã lên kế hoạch",
        color: "bg-slate-100 text-slate-700",
      },
      upcoming: { text: "Sắp diễn ra", color: "bg-yellow-100 text-yellow-800" },
      paused: { text: "Tạm dừng", color: "bg-orange-100 text-orange-700" },
      cancelled: { text: "Hủy", color: "bg-red-100 text-red-700" },
    };
    return map[status] || map.planned;
  };

  const percent = (current, target) => {
    if (!target || target <= 0) return 0;
    const p = Math.round((Number(current || 0) / Number(target)) * 100);
    return Math.max(0, Math.min(100, p));
  };

  const handleCreateBatch = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleTaskSubmit = (payload) => {
    console.log("Assignments submitted:", payload);
    if (onCreateBatch && typeof onCreateBatch === "function") {
      onCreateBatch(payload);
    }
  };

  // Check if campaign status is pending
  const isPending = campaign?.status?.toLowerCase() === "pending";

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-600">Kế hoạch các đợt tuyển</div>
        {!isPending && (
          <button
            onClick={handleCreateBatch}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 transform rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <FaTasks className="w-4 h-4" />
            Giao việc
          </button>
        )}
      </div>
      {currentBatches.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          Chưa có đợt tuyển dụng nào
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
                campaignId={campaign?.campaignId || campaign?.id || 1}
              />
            );
          })}
        </div>
      )}

      {/* Assign Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleTaskSubmit}
        campaign={campaign}
      />
    </div>
  );
};

const InfoMini = ({ label, value }) => (
  <div>
    <div className="text-slate-500">{label}</div>
    <div className="font-medium text-slate-800">{value}</div>
  </div>
);

export default BatchManagement;
