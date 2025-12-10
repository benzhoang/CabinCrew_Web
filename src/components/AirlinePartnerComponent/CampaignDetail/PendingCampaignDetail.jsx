import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDate2 } from "../../../config/formatDate";
import BatchInfo from "./BatchInfo";

const PendingCampaignDetail = ({ campaign }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/airline-partner/campaigns")}
            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
            title="Back"
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
              {campaign?.campaignName || "N/A"}
            </h1>
            <p className="text-slate-600">Campaign is pending approval</p>
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
                Campaign is pending approval
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Campaign needs to be approved before recruitment can begin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Information */}
      <div className="bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="text-sm text-slate-500">Proposal information</div>
            <div className="font-semibold text-slate-800">
              {campaign?.partnerName || "N/A"}
            </div>
          </div>
          <div className="text-xs text-right text-slate-500">
            Campaign ID: {campaign?.campaignId || "N/A"}
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(campaign?.campaignType?.toLowerCase() === "promotion" ||
                campaign?.campaignType === "Promotion") && (
                <Info label="Position" value={"Chief Flight Attendant"} />
              )}
              {(campaign?.campaignType?.toLowerCase() === "recruitment" ||
                campaign?.campaignType === "Recruitment") && (
                <Info label="Position" value={"Flight Attendant"} />
              )}
              <Info
                label="Target quantity"
                value={`${campaign?.targetQuantity || 0}`}
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

            {/* Job Description */}
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

            {/* Job Requirements */}
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

            <BatchInfo campaign={campaign} />
          </div>
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

export default PendingCampaignDetail;
