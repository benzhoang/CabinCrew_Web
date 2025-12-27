import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  getCampaignRequestById,
  approveOrRejectCampaignRequest,
  getRequirementItems,
  getRoundTypes,
} from "../../../service/api";
import RejectRequestModal from "./RejectRequestModal";
import ProcessTimeline from "../../../components/ProcessTimelineLogic";
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
  <div className="flex items-start">
    <div className="text-sm text-gray-500 shrink-0 mr-3">{label}:</div>
    <div className="text-sm text-gray-900">{value}</div>
  </div>
);

const renderStatusBadge = (statusRaw) => {
  const status = String(statusRaw || '').toLowerCase();
  const mapping = {
    pending: {
      text: 'Pending',
      cls: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    pending_approval: {
      text: 'Pending approval',
      cls: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    approved: {
      text: 'Approved',
      cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    rejected: {
      text: 'Rejected',
      cls: 'bg-rose-50 text-rose-700 border border-rose-200',
    },
  };

  const preset = mapping[status] || {
    text: statusRaw || 'N/A',
    cls: 'bg-slate-50 text-slate-700 border border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${preset.cls}`}>
      {preset.text}
    </span>
  );
};

const renderRequestTypeBadge = (requestTypeRaw) => {
  if (!requestTypeRaw) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
        N/A
      </span>
    );
  }

  const requestTypeStr = String(requestTypeRaw).trim().toLowerCase();
  let type = null;

  // Map string to number
  if (requestTypeStr === 'recruitment') {
    type = 1;
  } else if (requestTypeStr === 'promotion') {
    type = 2;
  } else {
    // Try to parse as number
    const parsed = Number(requestTypeStr);
    if (parsed === 1 || parsed === 2) {
      type = parsed;
    }
  }

  const mapping = {
    1: {
      text: 'Recruitment',
      cls: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    2: {
      text: 'Promotion',
      cls: 'bg-purple-50 text-purple-700 border border-purple-200',
    },
  };

  const preset = mapping[type] || {
    text: requestTypeRaw,
    cls: 'bg-slate-50 text-slate-700 border border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${preset.cls}`}>
      {preset.text}
    </span>
  );
};

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
  const [requirementItems, setRequirementItems] = useState([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [roundTypes, setRoundTypes] = useState([]);
  const [isLoadingRoundTypes, setIsLoadingRoundTypes] = useState(false);

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
              proposer: apiData.proposerName || apiData.proposer || "",
              position: apiData.requestType || apiData.position || "",
              department: apiData.partnerName || apiData.department || "",
              unit: apiData.unit || "",
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

  // Fetch requirement items based on requestType
  useEffect(() => {
    const fetchRequirementItems = async () => {
      if (!data?.requestType) return;

      // Map requestType string to number: "Recruitment" = 1, "Promotion" = 2
      const requestTypeStr = String(data.requestType).trim();
      let requirementId = null;

      if (requestTypeStr.toLowerCase() === 'recruitment') {
        requirementId = 1;
      } else if (requestTypeStr.toLowerCase() === 'promotion') {
        requirementId = 2;
      } else {
        // Try to parse as number for backward compatibility
        const parsed = Number(requestTypeStr);
        if (parsed === 1 || parsed === 2) {
          requirementId = parsed;
        } else {
          return; // Invalid requestType
        }
      }

      setIsLoadingRequirements(true);
      try {
        const response = await getRequirementItems(requirementId);
        console.log('RequestCampInfo - Requirement Items Response:', response);
        console.log('RequestCampInfo - Request Type:', requestTypeStr, 'Requirement ID:', requirementId);

        if (response.success && response.data) {
          // Handle different response structures
          let items = [];

          // Case 1: response.data là array
          if (Array.isArray(response.data)) {
            if (response.data.length > 0) {
              const firstItem = response.data[0];
              if (firstItem.requirementItems && Array.isArray(firstItem.requirementItems)) {
                // It's array of objects like [{ requirementId, requirementItems }]
                items = response.data.flatMap(item =>
                  Array.isArray(item.requirementItems) ? item.requirementItems : []
                );
              } else if (firstItem.requirementItemId || firstItem.title) {
                // It's array of requirement items directly
                items = response.data;
              }
            }
          }
          // Case 2: response.data là object có requirementItems
          else if (
            response.data.requirementItems &&
            Array.isArray(response.data.requirementItems)
          ) {
            items = response.data.requirementItems;
          }
          // Case 3: response.data.data có requirementItems (nested structure)
          else if (
            response.data.data &&
            response.data.data.requirementItems &&
            Array.isArray(response.data.data.requirementItems)
          ) {
            items = response.data.data.requirementItems;
          }
          // Case 4: response.data.data là array
          else if (response.data.data && Array.isArray(response.data.data)) {
            items = response.data.data;
          }

          console.log('RequestCampInfo - Extracted Requirement Items:', items);
          console.log('RequestCampInfo - Items count:', items.length);
          setRequirementItems(items || []);
        } else {
          console.log('RequestCampInfo - No requirement items found or API failed:', response);
          setRequirementItems([]);
        }
      } catch (error) {
        console.error('RequestCampInfo - Error fetching requirement items:', error);
        setRequirementItems([]);
      } finally {
        setIsLoadingRequirements(false);
      }
    };

    fetchRequirementItems();
  }, [data?.requestType]);

  // Fetch round types based on requestType
  useEffect(() => {
    const fetchRoundTypes = async () => {
      if (!data?.requestType) return;

      // Map requestType string to number: "Recruitment" = 1, "Promotion" = 2
      const requestTypeStr = String(data.requestType).trim();
      let type = null;

      if (requestTypeStr.toLowerCase() === 'recruitment') {
        type = 1;
      } else if (requestTypeStr.toLowerCase() === 'promotion') {
        type = 2;
      } else {
        // Try to parse as number for backward compatibility
        const parsed = Number(requestTypeStr);
        if (parsed === 1 || parsed === 2) {
          type = parsed;
        } else {
          return; // Invalid requestType
        }
      }

      setIsLoadingRoundTypes(true);
      try {
        const response = await getRoundTypes(type);
        console.log('RequestCampInfo - Round Types Response:', response);

        if (response.success && response.data) {
          // Handle different response structures
          let types = [];

          if (Array.isArray(response.data)) {
            types = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            types = response.data.data;
          }

          console.log('RequestCampInfo - Extracted Round Types:', types);
          setRoundTypes(types);
        } else {
          console.log('RequestCampInfo - No round types found or API failed:', response);
          setRoundTypes([]);
        }
      } catch (error) {
        console.error('RequestCampInfo - Error fetching round types:', error);
        setRoundTypes([]);
      } finally {
        setIsLoadingRoundTypes(false);
      }
    };

    fetchRoundTypes();
  }, [data?.requestType]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600">Loading data...</p>
        </div>
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
            <InfoRow label="Request type" value={renderRequestTypeBadge(data.requestType)} />
            <InfoRow label="Partner" value={data.partnerName} />
            <InfoRow label="Target quantity" value={data.quantity} />
            <InfoRow label="Created at" value={formatDate(data.createdAt)} />
            <InfoRow label="Status" value={renderStatusBadge(data.status)} />
          </div>

          {data.description && (
            <div className="mt-4">
              <InfoRow label="Description" value={data.description} />
            </div>
          )}

          {/* Job Requirements */}
          {requirementItems.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 text-sm font-semibold text-gray-900">📝 Requirements</div>
              <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                <ul className="space-y-2">
                  {requirementItems.map((item) => (
                    <li key={item.requirementItemId} className="flex items-start">
                      <span className="mr-2 text-blue-600">•</span>
                      <span className="text-sm text-gray-700">
                        <span className="font-medium">{item.title}</span>
                        {item.description && (
                          <span className="text-gray-600">
                            {' : '}
                            {item.description}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Recruitment/Promotion Process - Dynamic from API (getRoundTypes) */}
          <div className="mt-6">
            <div className="mb-3 text-sm font-semibold text-gray-900">
              🔄{' '}
              {(() => {
                const requestTypeStr = String(data.requestType || '')
                  .trim()
                  .toLowerCase();
                if (requestTypeStr === 'recruitment') {
                  return 'Recruitment';
                } else if (requestTypeStr === 'promotion') {
                  return 'Promotion';
                } else {
                  const parsed = Number(data.requestType);
                  if (parsed === 1) return 'Recruitment';
                  if (parsed === 2) return 'Promotion';
                  return '';
                }
              })()}{' '}
              process
            </div>
            <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
              <ProcessTimeline
                campaignType={data.requestType}
                roundTypes={roundTypes}
                isLoading={isLoadingRoundTypes}
              />
            </div>
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
