import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { convertDateFormat, formatDate } from "../../../config/formatDate.js";
import { getRequirementItems, getRoundTypes } from "../../../service/api2";

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-sm text-gray-500 w-36 shrink-0">{label}</div>
    <div className="text-sm text-gray-900">{value}</div>
  </div>
);

const PendingRequestDetail = ({ request }) => {
  const navigate = useNavigate();
  const [requirementItems, setRequirementItems] = useState([]);
  const [roundTypes, setRoundTypes] = useState([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [isLoadingRoundTypes, setIsLoadingRoundTypes] = useState(false);

  // Extract requestType to avoid linting warning
  const requestType = request?.requestType;

  // Fetch requirement items based on requestType
  useEffect(() => {
    const fetchRequirementItems = async () => {
      if (!requestType) {
        console.warn("No requestType found in request:", request);
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
  }, [requestType, request]);

  // Fetch round types based on requestType
  useEffect(() => {
    const fetchRoundTypes = async () => {
      if (!requestType) {
        console.warn("No requestType found in request:", request);
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
  }, [requestType, request]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/airline-partner/requests")}
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
              {request?.campaignName || "N/A"}
            </h1>
            <p className="text-slate-600">Request is pending approval</p>
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
                Request is pending approval
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Request needs to be approved before recruitment can begin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Information */}
      <div className="bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="text-sm text-slate-500">Proposal information</div>
            <div className="font-semibold text-slate-800">
              {request?.partnerName || "N/A"}
            </div>
          </div>
          <div className="text-xs text-right text-slate-500">
            Request ID: {request?.requestId || "N/A"}
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 mt-4 md:grid-cols-2">
              <InfoRow label="Partner" value={request?.partnerName || "N/A"} />
              <InfoRow
                label="Created date"
                value={convertDateFormat(request?.createdAt) || "N/A"}
              />
              <InfoRow
                label="Target quantity"
                value={request?.targetQuantity || "N/A"}
              />
              <InfoRow
                label="Due date"
                value={formatDate(request?.dueDate) || "N/A"}
              />
              <InfoRow
                label="Description"
                value={request?.description || "N/A"}
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
                  const requestTypeStr = String(request?.requestType || "")
                    .trim()
                    .toLowerCase();
                  if (requestTypeStr === "recruitment") {
                    return "Recruitment";
                  } else if (requestTypeStr === "promotion") {
                    return "Promotion";
                  } else {
                    const parsed = Number(request?.requestType);
                    if (parsed === 1) return "Recruitment";
                    if (parsed === 2) return "Promotion";
                    return "";
                  }
                })()}{" "}
                process
              </h3>
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                {isLoadingRoundTypes ? (
                  <div className="text-sm text-slate-500">
                    Loading process...
                  </div>
                ) : roundTypes.length > 0 ? (
                  <div className="space-y-3">
                    {roundTypes.map((roundType, index) => (
                      <div
                        key={roundType.roundTypeId}
                        className="flex items-center p-3 transition-shadow bg-white border rounded-lg shadow-sm border-slate-200 hover:shadow-md"
                      >
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-800">
                            {roundType.roundTypeName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    No process information available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingRequestDetail;
