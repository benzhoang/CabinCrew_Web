import React, { useState } from "react";
import { FaEdit, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddTaskModal from "./AddTaskModal";

const PendingCampaignDetail = ({ campaign }) => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState({
    submitted: false,
    totalApprovers: 0,
    approvedCount: 0,
    approvers: [],
  });
  const navigate = useNavigate();

  const handleApprovalSubmit = (approvalData) => {
    console.log("Approval submitted:", approvalData);

    // Cập nhật trạng thái phê duyệt
    setApprovalStatus({
      submitted: true,
      totalApprovers: approvalData.approvers.length,
      approvedCount: 0, // Chưa có ai phê duyệt
      approvers: approvalData.approvers,
    });

    alert(
      `Đã gửi phê duyệt cho ${approvalData.approvers.length} người. Chiến dịch đang chờ phê duyệt.`
    );

    // Có thể chuyển hướng hoặc cập nhật trạng thái campaign
    // navigate('/recruiter/campaigns')
  };

  const getProgressPercentage = (current, target) => {
    return Math.round((current / target) * 100);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/senior-recruiter/campaigns")}
            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
            title="Quay lại"
          >
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {campaign.name}
            </h1>
            <p className="text-slate-600">Chiến dịch đang chờ phê duyệt</p>
          </div>
        </div>

        {/* Status Banner */}
        <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-800">
                Chiến dịch đang chờ phê duyệt
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Chiến dịch này cần được phê duyệt trước khi có thể bắt đầu tuyển
                dụng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Information */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Thông tin Chiến dịch
            </h2>

            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
              <div>
                <span className="text-sm text-slate-600">Vị trí:</span>
                <p className="font-medium text-slate-800">
                  {campaign.position}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Phòng ban:</span>
                <p className="font-medium text-slate-800">
                  {campaign.department}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Ngày bắt đầu:</span>
                <p className="font-medium text-slate-800">
                  {campaign.startDate}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Ngày kết thúc:</span>
                <p className="font-medium text-slate-800">{campaign.endDate}</p>
              </div>
              <div>
                <span className="text-sm text-slate-600">
                  Mục tiêu tuyển dụng:
                </span>
                <p className="font-medium text-slate-800">
                  {campaign.targetHires} người
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Đã tuyển:</span>
                <p className="font-medium text-slate-800">
                  {campaign.currentHires} người
                </p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-sm text-slate-600">Mô tả:</span>
              <p className="mt-1 text-slate-800">{campaign.description}</p>
            </div>

            <div>
              <span className="text-sm text-slate-600">Yêu cầu:</span>
              <p className="mt-1 text-slate-800">{campaign.requirements}</p>
            </div>
          </div>
        </div>

        {/* Progress & Actions */}
        <div className="space-y-6">
          {/* Approval Status */}
          <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              Trạng thái Phê duyệt
            </h3>

            {!approvalStatus.submitted ? (
              <div className="mb-4">
                <div className="flex justify-between mb-1 text-sm text-slate-600">
                  <span>Phê duyệt</span>
                  <span>Chưa gửi</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 transition-all duration-300 rounded-full bg-slate-300"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex justify-between mb-1 text-sm text-slate-600">
                  <span>Phê duyệt</span>
                  <span>
                    {approvalStatus.approvedCount}/
                    {approvalStatus.totalApprovers} (
                    {getProgressPercentage(
                      approvalStatus.approvedCount,
                      approvalStatus.totalApprovers
                    )}
                    %)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      approvalStatus.approvedCount ===
                      approvalStatus.totalApprovers
                        ? "bg-green-600"
                        : approvalStatus.approvedCount > 0
                        ? "bg-yellow-600"
                        : "bg-slate-300"
                    }`}
                    style={{
                      width: `${getProgressPercentage(
                        approvalStatus.approvedCount,
                        approvalStatus.totalApprovers
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div className="text-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  !approvalStatus.submitted
                    ? "bg-yellow-100 text-yellow-800"
                    : approvalStatus.approvedCount ===
                      approvalStatus.totalApprovers
                    ? "bg-green-100 text-green-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {!approvalStatus.submitted ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : approvalStatus.approvedCount ===
                    approvalStatus.totalApprovers ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
                {!approvalStatus.submitted
                  ? "Chờ gửi phê duyệt"
                  : approvalStatus.approvedCount ===
                    approvalStatus.totalApprovers
                  ? "Đã phê duyệt hoàn tất"
                  : "Đang chờ phê duyệt"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              Hành động
            </h3>

            <div className="space-y-3">
              {!approvalStatus.submitted && (
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-white transition-all duration-200 transform rounded-lg shadow-md bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Phê duyệt
                </button>
              )}

              {approvalStatus.submitted && (
                <div className="p-4 text-center rounded-lg bg-slate-50">
                  <p className="mb-2 text-sm text-slate-600">
                    Đã gửi phê duyệt cho:
                  </p>
                  <div className="space-y-1">
                    {approvalStatus.approvers.map((approver, index) => (
                      <div key={index} className="text-xs text-slate-700">
                        • {approver.name} - {approver.position}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() =>
                  alert("Chức năng chọn hội đồng đang được phát triển")
                }
                className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium transition-all duration-200 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800"
              >
                <FaPlus />
                Chọn hội đồng
              </button>

              <button
                onClick={() =>
                  alert("Chức năng chỉnh sửa đang được phát triển")
                }
                className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium transition-all duration-200 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800"
              >
                <FaEdit />
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <AddTaskModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onSubmit={handleApprovalSubmit}
        campaign={campaign}
      />
    </div>
  );
};

export default PendingCampaignDetail;
