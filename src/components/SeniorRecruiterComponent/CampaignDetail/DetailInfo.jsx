import React from "react";
import {
  formatDate,
  convertDateFormat,
  formatDateOnly,
} from "../../../config/formatDate";
import BatchManagement from "./BatchManagement";

const DetailInfo = ({ campaign, onCreateBatch }) => {
  return (
    <div className="bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="text-sm text-slate-500">Thông tin đề xuất</div>
          <div className="font-semibold text-slate-800">
            {campaign?.partnerName || "N/A"}
          </div>
        </div>
        <div className="text-xs text-right text-slate-500">
          <div>
            Ngày tạo:{" "}
            {formatDate(convertDateFormat(campaign?.createdAt)) || "N/A"}
          </div>
          <div>Mã số: {campaign?.campaignId || campaign?.id || "N/A"}</div>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(campaign?.campaignType?.toLowerCase() === "promotion" ||
              campaign?.campaignType === "Promotion") && (
              <Info label="Vị trí" value={"Chief Flight Attendant"} />
            )}
            <Info
              label="Số lượng tuyển"
              value={`${
                campaign?.targetQuantity || campaign?.targetHires || 0
              }`}
            />
            <Info
              label="Số lượng tuyển"
              value={`${
                campaign?.targetQuantity || campaign?.targetHires || 0
              }`}
            />
            <Info
              label="Ngày bắt đầu"
              value={formatDateOnly(campaign?.startDate) || "N/A"}
            />
            <Info
              label="Ngày kết thúc"
              value={formatDateOnly(campaign?.endDate) || "N/A"}
            />
          </div>

          {/* Job Description */}
          {campaign?.jobDescription && (
            <div className="mt-6">
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                📋 Mô tả công việc / Job Description
              </h3>
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div
                  className="text-sm prose-sm prose text-slate-700 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: campaign.jobDescription || "N/A",
                  }}
                />
              </div>
            </div>
          )}

          {/* Job Requirements */}
          {campaign?.jobRequirement && (
            <div className="mt-6">
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                📝 Yêu cầu công việc / Job Requirements
              </h3>
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div
                  className="text-sm prose-sm prose text-slate-700 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: campaign.jobRequirement || "N/A",
                  }}
                />
              </div>
            </div>
          )}

          <BatchManagement campaign={campaign} onCreateBatch={onCreateBatch} />
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
