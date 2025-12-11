import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import {
  createCampaignRequest,
  getRequirementItems,
  getRoundTypes,
} from "../../service/api2";
import ModalConfirm from "../../components/AirlinePartnerComponent/ModalConfirm";

const CreatePromotionRequestPage = () => {
  const [formData, setFormData] = useState({
    campaignName: "",
    targetQuantity: 0,
    description: "",
    jobDescription: "",
    jobRequirement: "",
    requestType: 2,
    dueDate: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [requirementItems, setRequirementItems] = useState([]);
  const [roundTypes, setRoundTypes] = useState([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [isLoadingRoundTypes, setIsLoadingRoundTypes] = useState(false);
  const navigate = useNavigate();
  const employeeData = JSON.parse(localStorage.getItem("employee") || "{}");
  const displayName = employeeData?.displayName;

  const airlineDisplayNames = {
    vietjet: "Vietjet Air",
    vietnamairlines: "Vietnam Airlines",
    bambooairways: "Bamboo Airways",
    sunphuquoc: "Sun PhuQuoc Airways",
  };

  const normalizedDisplayName =
    typeof displayName === "string" ? displayName.toLowerCase() : "";
  const formattedDisplayName =
    airlineDisplayNames[normalizedDisplayName] || displayName;

  const requestTypeLabels = {
    2: "Promotion",
  };

  // Fetch requirement items based on requestType
  useEffect(() => {
    const fetchRequirementItems = async () => {
      if (!formData.requestType) return;

      setIsLoadingRequirements(true);
      try {
        const response = await getRequirementItems(formData.requestType);
        if (response.success && response.data) {
          // Handle different response structures
          if (
            response.data.requirementItems &&
            Array.isArray(response.data.requirementItems)
          ) {
            setRequirementItems(response.data.requirementItems);
          } else if (Array.isArray(response.data)) {
            setRequirementItems(response.data);
          } else {
            setRequirementItems([]);
          }
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
  }, [formData.requestType]);

  // Fetch round types based on requestType
  useEffect(() => {
    const fetchRoundTypes = async () => {
      if (!formData.requestType) return;

      setIsLoadingRoundTypes(true);
      try {
        const response = await getRoundTypes(formData.requestType);
        if (response.success && response.data) {
          // Handle different response structures
          if (Array.isArray(response.data)) {
            setRoundTypes(response.data);
          } else {
            setRoundTypes([]);
          }
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
  }, [formData.requestType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // const handleEditorChange = (field, value) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));

  //   if (errors[field]) {
  //     setErrors((prev) => ({
  //       ...prev,
  //       [field]: "",
  //     }));
  //   }
  // };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.campaignName.trim()) {
      newErrors.campaignName = "Campaign name is required";
    }
    if (!formData.targetQuantity || parseInt(formData.targetQuantity) <= 0) {
      newErrors.targetQuantity = "Target quantity must be greater than 0";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required";
    }
    if (!formData.jobRequirement.trim()) {
      newErrors.jobRequirement = "Job requirement is required";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.dueDate = "Due date must be in the future";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const parsedQuantity = Number.parseInt(
      `${formData.targetQuantity}`.trim(),
      10
    );

    const payload = {
      campaignName: formData.campaignName,
      description: formData.description,
      jobDescription: formData.jobDescription,
      jobRequirement: formData.jobRequirement,
      targetQuantity: Number.isNaN(parsedQuantity) ? 0 : parsedQuantity,
      requestType: Number(formData.requestType),
      dueDate: formData.dueDate,
    };

    try {
      const response = await createCampaignRequest(payload);
      console.log("Creating campaign:", payload);

      if (response.success) {
        toast.success("Create promotion request successfully!");
        navigate("/airline-partner/requests");
      } else {
        throw new Error("Create promotion request failed");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("An error occurred while creating promotion request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate("/airline-partner/requests");
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-full lg:w-2/3">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Campaign Name *
            </label>
            <input
              type="text"
              name="campaignName"
              value={formData.campaignName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.campaignName ? "border-red-300" : "border-slate-300"
              }`}
              placeholder="Enter campaign name"
            />
            {errors.campaignName && (
              <p className="mt-1 text-sm text-red-600">{errors.campaignName}</p>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Public promotion campaign - Cabin Crew
          </p>
        </div>
        <button
          onClick={() => navigate("/airline-partner/requests")}
          className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Thông tin cơ bản */}
            <div className="bg-white border rounded-lg shadow-sm border-slate-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500">
                    Proposal information
                  </div>
                  <div className="font-semibold text-slate-800">
                    {formattedDisplayName}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Target quantity *
                    </label>
                    <input
                      type="number"
                      name="targetQuantity"
                      value={formData.targetQuantity}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.targetQuantity
                          ? "border-red-300"
                          : "border-slate-300"
                      }`}
                      placeholder="Enter target quantity"
                    />
                    {errors.targetQuantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.targetQuantity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Request type
                    </label>
                    <input
                      type="text"
                      name="requestType"
                      value={
                        requestTypeLabels[formData.requestType] ||
                        formData.requestType
                      }
                      disabled
                      className="w-full px-3 py-2 border rounded-md border-slate-300 bg-slate-50 text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Due date *
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.dueDate ? "border-red-300" : "border-slate-300"
                      }`}
                    />
                    {errors.dueDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? "border-red-300" : "border-slate-300"
                    }`}
                    placeholder="Enter description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Requirements *
                  </label>
                  {/* <div
                    className={`rounded-md border ${
                      errors.jobDescription
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
                  >
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.jobDescription}
                      onChange={(_, editor) =>
                        handleEditorChange("jobDescription", editor.getData())
                      }
                      config={{ placeholder: "Enter job description" }}
                    />
                  </div>
                  {errors.jobDescription && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.jobDescription}
                    </p>
                  )} */}
                  <div
                    className={`rounded-md border p-4 bg-slate-50 ${
                      errors.jobDescription
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
                  >
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
                  <p className="mt-2 text-xs text-slate-500 italic">
                    If you want to change this content, please contact the
                    admin.
                  </p>
                  {errors.jobDescription && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.jobDescription}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Promotion process *
                  </label>
                  {/* <div
                    className={`rounded-md border ${
                      errors.jobRequirement
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
                  >
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.jobRequirement}
                      onChange={(_, editor) =>
                        handleEditorChange("jobRequirement", editor.getData())
                      }
                      config={{
                        placeholder: "Enter job requirement",
                      }}
                    />
                  </div>
                  {errors.jobRequirement && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.jobRequirement}
                    </p>
                  )} */}
                  <div
                    className={`rounded-md border p-4 bg-slate-50 ${
                      errors.jobRequirement
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
                  >
                    {isLoadingRoundTypes ? (
                      <div className="text-sm text-slate-500">
                        Loading promotion process...
                      </div>
                    ) : roundTypes.length > 0 ? (
                      <div className="space-y-3">
                        {roundTypes.map((roundType, index) => (
                          <div
                            key={roundType.roundTypeId}
                            className="flex items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm mr-3 flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-800">
                                {roundType.roundTypeName}
                              </div>
                            </div>
                            <div className="ml-2 text-slate-400">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">
                        No promotion process available
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500 italic">
                    If you want to change this content, please contact the
                    admin.
                  </p>
                  {errors.jobRequirement && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.jobRequirement}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="p-5 bg-white border rounded-lg shadow-sm border-slate-200">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full px-4 py-2 font-medium transition-colors border rounded-md border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                    isSubmitting
                      ? "bg-slate-400 cursor-not-allowed text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isSubmitting ? "Creating..." : "Create request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      <ModalConfirm
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="Confirm cancel"
        message="Are you sure you want to cancel? All information will be lost."
        confirmText="Cancel"
        cancelText="Back"
      />
    </div>
  );
};

export default CreatePromotionRequestPage;
