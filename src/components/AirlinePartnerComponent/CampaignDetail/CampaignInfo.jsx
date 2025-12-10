import React from "react";
import { formatDate2 } from "../../../config/formatDate";

const CampaignInfo = ({ campaign }) => {
  if (!campaign) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="text-sm text-slate-500">Proposal information</div>
          <div className="font-semibold text-slate-800">
            {campaign?.partnerName || "N/A"}
          </div>
        </div>
        <div className="text-xs text-right text-slate-500">
          Campaign ID: {campaign?.campaignId || campaign?.id || "N/A"}
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(campaign?.campaignType?.toLowerCase() === "promotion" ||
              campaign?.campaignType === "Promotion") && (
              <Info label="Position" value="Chief Flight Attendant" />
            )}
            {(campaign?.campaignType?.toLowerCase() === "recruitment" ||
              campaign?.campaignType === "Recruitment") && (
              <Info label="Position" value="Flight Attendant" />
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

          {campaign?.jobDescription && (
            <div className="mt-6">
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                📋 Job description
              </h3>
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div
                  className="text-sm prose-sm prose job-description-content text-slate-700 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: campaign.jobDescription || "N/A",
                  }}
                />
              </div>
            </div>
          )}

          {campaign?.jobRequirement && (
            <div className="mt-6">
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                📝 Job requirement
              </h3>
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div
                  className="text-sm prose-sm prose job-requirement-content text-slate-700 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: campaign.jobRequirement || "N/A",
                  }}
                />
              </div>
            </div>
          )}
          {/* Recruitment Process
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              🔄 Recruitment process
            </h3>
            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        1
                      </span>
                      <span className="text-slate-700">
                        Kiểm tra hồ sơ: Ứng viên chuẩn bị CCCD để đối chiếu và
                        lấy số báo danh
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        2
                      </span>
                      <span className="text-slate-700">
                        Kiểm tra ngoại hình AI
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        3
                      </span>
                      <span className="text-slate-700">
                        Cân đo chiều cao và BMI
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        4
                      </span>
                      <span className="text-slate-700">
                        Thi Catwalk - Phỏng vấn AI
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        5
                      </span>
                      <span className="text-slate-700">
                        Thi Tài năng (theo nhóm)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        6
                      </span>
                      <span className="text-slate-700">Phỏng vấn Hội đồng</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
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

export default CampaignInfo;
