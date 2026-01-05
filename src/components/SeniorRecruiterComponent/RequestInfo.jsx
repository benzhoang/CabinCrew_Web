import { useState, useEffect } from "react";
import { formatDate, formatDateFromAPI } from "../../config/formatDate.js";
import { getRequirementItems, getRoundTypes } from "../../service/api2";
import ProcessTimeline from "../../components/ProcessTimelineLogic";

const InfoRow = ({ label, value }) => (
  <div className="flex items-start">
    <div className="mr-3 text-sm text-gray-500 shrink-0">{label}:</div>
    <div className="text-sm text-gray-900">{value}</div>
  </div>
);

// PartnerBadge component - matching DetailInfo.jsx
const PartnerBadge = ({ partnerName }) => {
  const getPartnerColor = (partnerName) => {
    if (!partnerName) return "bg-gray-100 text-gray-800 border-gray-300";

    const partner = partnerName.toLowerCase();
    if (
      partner.includes("vietnam airlines") ||
      partner.includes("vietnamairlines")
    ) {
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    } else if (partner.includes("vietjet") || partner.includes("viet jet")) {
      return "bg-red-100 text-red-800 border-red-300";
    } else if (
      partner.includes("bamboo") ||
      partner.includes("bamboo airways")
    ) {
      return "bg-green-100 text-green-800 border-green-300";
    } else if (partner.includes("jetstar") || partner.includes("sun phuquoc")) {
      return "bg-indigo-100 text-indigo-800 border-indigo-300";
    }
    return "bg-cyan-100 text-cyan-800 border-cyan-300";
  };

  return (
    <span
      className={`${getPartnerColor(
        partnerName
      )} inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap`}
    >
      {partnerName || "No partner"}
    </span>
  );
};

const RequestInfo = ({ data }) => {
  const [requirementItems, setRequirementItems] = useState([]);
  const [roundTypes, setRoundTypes] = useState([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [isLoadingRoundTypes, setIsLoadingRoundTypes] = useState(false);

  // Extract requestType to avoid linting warning
  const requestType = data?.requestType;

  // Fetch requirement items based on requestType
  useEffect(() => {
    const fetchRequirementItems = async () => {
      if (!requestType) {
        console.warn("No requestType found in data:", data);
        return;
      }

      console.log("Fetching requirement items for requestType:", requestType);

      // Map requestType string to number: "Recruitment" = 1, "Promotion" = 2
      const requestTypeStr = String(requestType).trim();
      let requirementId = null;

      if (requestTypeStr.toLowerCase() === "recruitment") {
        requirementId = 1;
      } else if (requestTypeStr.toLowerCase() === "promotion") {
        requirementId = 2;
      } else {
        // Try to parse as number for backward compatibility
        const parsed = Number(requestTypeStr);
        if (parsed === 1 || parsed === 2) {
          requirementId = parsed;
        } else {
          console.warn("Invalid requestType:", requestType);
          return; // Invalid requestType
        }
      }

      setIsLoadingRequirements(true);
      try {
        const response = await getRequirementItems(requirementId);
        if (response.success && response.data) {
          let items = [];
          if (Array.isArray(response.data)) {
            items = response.data;
          } else if (
            response.data.requirementItems &&
            Array.isArray(response.data.requirementItems)
          ) {
            items = response.data.requirementItems;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            items = response.data.data;
          }
          setRequirementItems(items);
        } else {
          setRequirementItems([]);
        }
      } catch (error) {
        console.error("Error fetching requirement items:", error);
        setRequirementItems([]);
      } finally {
        setIsLoadingRequirements(false);
      }
    };

    fetchRequirementItems();
  }, [requestType, data]);

  // Fetch round types based on requestType
  useEffect(() => {
    const fetchRoundTypes = async () => {
      if (!requestType) {
        console.warn("No requestType found in data:", data);
        return;
      }

      console.log("Fetching round types for requestType:", requestType);

      // Map requestType string to number: "Recruitment" = 1, "Promotion" = 2
      const requestTypeStr = String(requestType).trim();
      let type = null;

      if (requestTypeStr.toLowerCase() === "recruitment") {
        type = 1;
      } else if (requestTypeStr.toLowerCase() === "promotion") {
        type = 2;
      } else {
        // Try to parse as number for backward compatibility
        const parsed = Number(requestTypeStr);
        if (parsed === 1 || parsed === 2) {
          type = parsed;
        } else {
          console.warn("Invalid requestType:", requestType);
          return; // Invalid requestType
        }
      }

      setIsLoadingRoundTypes(true);
      try {
        const response = await getRoundTypes(type);
        if (response.success && response.data) {
          let types = [];
          if (Array.isArray(response.data)) {
            types = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            types = response.data.data;
          }
          setRoundTypes(types);
        } else {
          setRoundTypes([]);
        }
      } catch (error) {
        console.error("Error fetching round types:", error);
        setRoundTypes([]);
      } finally {
        setIsLoadingRoundTypes(false);
      }
    };

    fetchRoundTypes();
  }, [requestType, data]);

  if (!data) {
    return null;
  }

  // Helper function to get request type label
  const getRequestTypeLabel = (requestType) => {
    if (!requestType) return "";
    const type = String(requestType).toLowerCase().trim();
    if (type === "recruitment") return "Recruitment";
    if (type === "promotion") return "Promotion";
    return requestType;
  };

  // Helper function to get request type badge color
  const getRequestTypeColor = (requestType) => {
    if (!requestType) return "bg-gray-100 text-gray-800 border-gray-300";
    const type = String(requestType).toLowerCase().trim();
    if (type === "promotion") {
      return "bg-purple-100 text-purple-800 border-purple-300";
    } else if (type === "recruitment") {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    if (!status) return "Pending";
    const statusLower = String(status).toLowerCase().trim();
    if (statusLower === "approved" || statusLower === "approve") {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-full bg-emerald-50 text-emerald-700 border-emerald-200">
          Approved
        </span>
      );
    }
    if (statusLower === "rejected" || statusLower === "reject") {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-full bg-rose-50 text-rose-700 border-rose-200">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-full bg-amber-50 text-amber-700 border-amber-200">
        Pending
      </span>
    );
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 gap-5">
        <div className="p-5 bg-white border border-gray-200 rounded-xl">
          <div className="mb-3 text-sm font-semibold text-gray-900">
            Request information
          </div>

          <div className="grid grid-cols-1 gap-5 mt-4 md:grid-cols-2">
            <InfoRow
              label="Request type"
              value={
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRequestTypeColor(
                    data.requestType
                  )}`}
                >
                  {getRequestTypeLabel(data.requestType) || "No request type"}
                </span>
              }
            />
            <InfoRow
              label="Partner"
              value={<PartnerBadge partnerName={data.partnerName} />}
            />
            <InfoRow
              label="Target applicants"
              value={(data.targetQuantity || 0) + " applicants"}
            />
            <InfoRow label="Status" value={getStatusBadge(data.status)} />
            <InfoRow
              label="Created date"
              value={
                data.createdAt
                  ? formatDate(data.createdAt) ||
                    formatDateFromAPI(data.createdAt) ||
                    "No created date"
                  : "No created date"
              }
            />
            <InfoRow
              label="Due date"
              value={
                data.dueDate
                  ? formatDateFromAPI(data.dueDate) || "No due date"
                  : "No due date"
              }
            />
            <InfoRow
              label="Description"
              value={data.description || "No description"}
            />
          </div>

          {/* Job Requirements - Dynamic from API (getRequirementItems) */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              📝 Requirements
            </h3>
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              {isLoadingRequirements ? (
                <div className="text-sm text-slate-500">
                  Loading requirements...
                </div>
              ) : requirementItems.length > 0 ? (
                <ul className="space-y-2">
                  {requirementItems.map((item) => (
                    <li
                      key={item.requirementItemId}
                      className="flex items-start"
                    >
                      <span className="mr-2 text-blue-600">•</span>
                      <span className="text-sm text-slate-700">
                        <span className="font-medium">{item.title}</span>
                        {item.description && (
                          <span className="text-slate-600">
                            {" : "}
                            {item.description}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500">
                  No requirements available
                </div>
              )}
            </div>
          </div>

          {/* Recruitment/Promotion Process - Dynamic from API (getRoundTypes) */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              🔄{" "}
              {(() => {
                const requestTypeStr = String(data.requestType || "")
                  .trim()
                  .toLowerCase();
                if (requestTypeStr === "recruitment") {
                  return "Recruitment";
                } else if (requestTypeStr === "promotion") {
                  return "Promotion";
                } else {
                  const parsed = Number(data.requestType);
                  if (parsed === 1) return "Recruitment";
                  if (parsed === 2) return "Promotion";
                  return "";
                }
              })()}{" "}
              processes
            </h3>
            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
              <ProcessTimeline
                campaignType={data.requestType}
                roundTypes={roundTypes}
                isLoading={isLoadingRoundTypes}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestInfo;
