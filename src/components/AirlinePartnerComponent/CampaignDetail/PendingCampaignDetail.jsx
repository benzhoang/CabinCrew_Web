import React from "react";
import { useNavigate } from "react-router-dom";

const PendingCampaignDetail = ({ campaign }) => {
  const navigate = useNavigate();

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
      <div className="mb-6">
        <div className="w-full p-6 bg-white border rounded-lg shadow-sm border-slate-200">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Thông tin Chiến dịch
          </h2>

          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="text-sm text-slate-600">Vị trí:</span>
              <p className="font-medium text-slate-800">{campaign.position}</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Phòng ban:</span>
              <p className="font-medium text-slate-800">
                {campaign.department}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Ngày bắt đầu:</span>
              <p className="font-medium text-slate-800">{campaign.startDate}</p>
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
    </div>
  );
};

export default PendingCampaignDetail;
