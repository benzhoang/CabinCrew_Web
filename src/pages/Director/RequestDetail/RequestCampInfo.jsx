import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  getCampaignRequestById,
  approveOrRejectCampaignRequest,
} from "../../../service/api";
import RejectRequestModal from "./RejectRequestModal";
import { toast } from "react-toastify";

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
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="text-sm font-semibold text-gray-900 mb-3">{title}</div>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-36 shrink-0 text-gray-500 text-sm">{label}</div>
    <div className="text-gray-900 text-sm whitespace-pre-wrap">{value}</div>
  </div>
);

const RequestCampInfo = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(state?.campaign || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  // Fetch API
  useEffect(() => {
    const fetchRequestDetail = async () => {
      if (id) {
        setLoading(true);
        try {
          const result = await getCampaignRequestById(id);
          if (result.success) {
            const apiData = result.data;
            setData({
              id: apiData.requestId || apiData.id,
              code: apiData.code || `REQ-${apiData.requestId || apiData.id}`,
              title:
                apiData.campaignName || apiData.title || "Recruitment request",
              proposer: apiData.proposerName || apiData.proposer || "N/A",
              position: apiData.requestType || apiData.position || "N/A",
              department: apiData.partnerName || apiData.department || "N/A",
              unit: apiData.unit || "N/A",
              quantity: apiData.targetQuantity || apiData.quantity || 0,
              startDate: apiData.startDate || "",
              endDate: apiData.endDate || "",
              description: apiData.description || "",
              jobDescription: apiData.jobDescription || "",
              jobRequirement: apiData.jobRequirement || "",
              requestType: apiData.requestType || "",
              status: apiData.status || "pending_approval",
              partnerName: apiData.partnerName || "",
              directorName: apiData.directorName || "",
              createdAt: apiData.createdAt || "",
              rejectReason: apiData.rejectReason || "",
              approvedAt: apiData.approvedAt || "",
              rejectedAt: apiData.rejectedAt || "",
            });
          } else {
            setError("Unable to load request details");
          }
        } catch (err) {
          console.error(err);
          setError("An error occurred while loading data");
        } finally {
          setLoading(false);
        }
      } else {
        if (state?.campaign) {
          setData(state.campaign);
        } else {
          setError("Request ID not found");
        }
        setLoading(false);
      }
    };

    fetchRequestDetail();
  }, [id, state]);

  if (loading) {
    return (
      <div className="p-6 h-64 flex justify-center items-center">
        <p className="text-slate-600">Loading data...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 h-64 flex justify-center items-center">
        <p className="text-slate-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{data.title}</h2>
        <p className="text-slate-600">
          Request code: <span className="font-medium">{data.code}</span>
        </p>
      </div>

      {/* SECTION */}
      <div className="grid grid-cols-1 gap-5">
        <Section title="Request information">
          <div className="text-gray-900 font-medium">{data.proposer}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <InfoRow label="Request type" value={data.requestType} />
            <InfoRow label="Partner" value={data.partnerName} />
            <InfoRow label="Director" value={data.directorName || "N/A"} />
            <InfoRow label="Target quantity" value={data.quantity} />
            <InfoRow label="Created at" value={formatDate(data.createdAt)} />
            <InfoRow label="Status" value={data.status} />
          </div>

          {data.description && (
            <div className="mt-4">
              <InfoRow label="Description" value={data.description} />
            </div>
          )}

          {/* JOB DESCRIPTION */}
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              Job description
            </h3>
            {data.jobDescription ? (
              <div className="p-4 text-sm whitespace-pre-wrap border border-blue-200 rounded-lg bg-blue-50 text-slate-700">
                <div
                  className="job-description-content text-sm prose-sm prose text-slate-700 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: data.jobDescription || "N/A",
                  }}
                />
              </div>
            ) : (
              <p className="text-sm italic text-slate-500">
                No job description yet
              </p>
            )}
          </div>

          {/* JOB REQUIREMENT */}
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              Job requirements
            </h3>
            {data.jobRequirement ? (
              <div className="p-4 text-sm whitespace-pre-wrap border border-green-200 rounded-lg bg-green-50 text-slate-700">
                <div
                  className="job-requirement-content text-sm prose-sm prose text-slate-700 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: data.jobRequirement || "N/A",
                  }}
                />
              </div>
            ) : (
              <p className="text-sm italic text-slate-500">
                No job requirements yet
              </p>
            )}
          </div>
        </Section>
      </div>

      {/* ACTION BUTTONS - only show when status is Pending */}
      {(data.status === "Pending" ||
        data.status === "pending_approval" ||
        data.status?.toLowerCase() === "pending") && (
          <div className="mt-6 flex justify-end gap-4">
            {/* Reject button */}
            <button
              onClick={() => setIsRejectModalOpen(true)}
              disabled={isRejecting || isApproving}
              className={`flex items-center gap-2 px-6 py-3 text-sm text-white rounded-lg transition-all duration-200 
                            font-medium shadow-md transform
                            ${isRejecting || isApproving
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

            {/* Approve button */}
            <button
              onClick={() => setIsApproveModalOpen(true)}
              disabled={isApproving || isRejecting}
              className={`flex items-center gap-2 px-6 py-3 text-sm text-white rounded-lg transition-all duration-200 
                            font-medium shadow-md transform
                            ${isApproving || isRejecting
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

      {/* Reject modal */}
      <RejectRequestModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={async (reason) => {
          setIsRejecting(true);
          try {
            const result = await approveOrRejectCampaignRequest(
              data.id,
              3,
              reason
            );
            if (result.success) {
              toast.success("Request rejected successfully");
              setIsRejectModalOpen(false);
              // Reload data to update status
              const refreshResult = await getCampaignRequestById(data.id);
              if (refreshResult.success) {
                const apiData = refreshResult.data;
                setData({
                  ...data,
                  status: apiData.status || "rejected",
                  rejectReason: apiData.rejectReason || reason,
                  rejectedAt: apiData.rejectedAt || "",
                });
              }
            } else {
              toast.error("Unable to reject request");
            }
          } catch (err) {
            console.error("Error rejecting request:", err);
            toast.error("An error occurred while rejecting the request");
          } finally {
            setIsRejecting(false);
          }
        }}
        requestTitle={data.title}
        requestId={data.id}
      />

      {/* Approve confirmation modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Approve request</h3>
              <p className="mt-1 text-sm text-slate-600">
                Are you sure you want to approve this request?
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
                onClick={async () => {
                  setIsApproving(true);
                  try {
                    const result = await approveOrRejectCampaignRequest(data.id, 2);
                    if (result.success) {
                      toast.success("Request approved successfully");
                      const refreshResult = await getCampaignRequestById(data.id);
                      if (refreshResult.success) {
                        const apiData = refreshResult.data;
                        setData({
                          ...data,
                          status: apiData.status || "approved",
                          approvedAt: apiData.approvedAt || "",
                        });
                      }
                      navigate("/director/requirements");
                    } else {
                      toast.error("Unable to approve request");
                    }
                  } catch (err) {
                    console.error("Error approving request:", err);
                    toast.error("An error occurred while approving the request");
                  } finally {
                    setIsApproving(false);
                    setIsApproveModalOpen(false);
                  }
                }}
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

export default RequestCampInfo;
