import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getCampaignDetail,
  updateCampaignAndCreateRounds,
  getRoundTypes,
  getRequirementItems,
} from "../../service/api2";
import CreateRound from "../../components/SeniorRecruiterComponent/CreateCampaign/CreateRound";
import ModalConfirm from "../../components/SeniorRecruiterComponent/ModalConfirm";

const SeniorCreateCampaignPage = () => {
  const { id: campaignId } = useParams();
  const todayString = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    campaignName: "",
    targetQuantity: "",
    startDate: "",
    endDate: "",
    description: "",
    rounds: [
      {
        roundName: "Round 1",
        roundStartDate: "",
        roundEndDate: "",
        targetQuantity: "",
        description: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [detailError, setDetailError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roundsData, setRoundsData] = useState([]); // State để lưu rounds data cho UI mới
  const [roundTypes, setRoundTypes] = useState([]); // State để lưu round types từ API
  const [requirementItems, setRequirementItems] = useState([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();
  const isRequestDataLocked = Boolean(campaignDetail);
  const createRoundRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCampaignDetail = async () => {
      if (!campaignId) {
        setIsLoadingDetail(false);
        return;
      }

      setIsLoadingDetail(true);
      setDetailError(null);

      try {
        const result = await getCampaignDetail(campaignId);

        if (!isMounted) return;

        if (result.success && result.data) {
          const detailData = result.data;
          setCampaignDetail(detailData);
          setFormData((prev) => ({
            ...prev,
            campaignName: detailData.campaignName || "",
            targetQuantity:
              detailData.targetQuantity !== undefined &&
              detailData.targetQuantity !== null
                ? String(detailData.targetQuantity)
                : "",
            description: detailData.description || "",
          }));

          // Fetch requirement items based on campaign type
          const campaignType = detailData.campaignType;
          // Map campaignType string to number: "Recruitment" = 1, "Promotion" = 2
          const campaignTypeStr = String(campaignType || "").trim();
          let requirementId = null;

          if (campaignTypeStr.toLowerCase() === "recruitment") {
            requirementId = 1;
          } else if (campaignTypeStr.toLowerCase() === "promotion") {
            requirementId = 2;
          } else {
            // Try to parse as number for backward compatibility
            const parsed = Number(campaignTypeStr);
            if (parsed === 1 || parsed === 2) {
              requirementId = parsed;
            }
          }

          if (requirementId) {
            setIsLoadingRequirements(true);
            try {
              const requirementItemsResult = await getRequirementItems(
                requirementId
              );
              if (
                requirementItemsResult.success &&
                requirementItemsResult.data
              ) {
                let items = [];
                if (Array.isArray(requirementItemsResult.data)) {
                  items = requirementItemsResult.data;
                } else if (
                  requirementItemsResult.data.requirementItems &&
                  Array.isArray(requirementItemsResult.data.requirementItems)
                ) {
                  items = requirementItemsResult.data.requirementItems;
                } else if (
                  requirementItemsResult.data.data &&
                  Array.isArray(requirementItemsResult.data.data)
                ) {
                  items = requirementItemsResult.data.data;
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
          } else {
            // If campaignType exists but requirementId couldn't be determined, still set loading to false
            setIsLoadingRequirements(false);
            setRequirementItems([]);
          }

          // Fetch round types based on campaign type
          let type = requirementId;
          if (type) {
            const roundTypesResult = await getRoundTypes(type);
            if (roundTypesResult.success && roundTypesResult.data) {
              let types = [];
              if (Array.isArray(roundTypesResult.data)) {
                types = roundTypesResult.data;
              } else if (
                roundTypesResult.data.data &&
                Array.isArray(roundTypesResult.data.data)
              ) {
                types = roundTypesResult.data.data;
              }
              setRoundTypes(types);
            }
          }
        } else {
          setDetailError(result.error || "Cannot load campaign detail");
        }
      } catch (err) {
        if (!isMounted) return;
        setDetailError(err.message || "Cannot load campaign detail");
      } finally {
        if (isMounted) {
          setIsLoadingDetail(false);
        }
      }
    };

    fetchCampaignDetail();

    return () => {
      isMounted = false;
    };
  }, [campaignId]);

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

  const handleRoundsChange = (newRounds) => {
    setFormData((prev) => ({
      ...prev,
      rounds: newRounds,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    // Validate rounds using CreateRound component
    if (createRoundRef.current) {
      const roundErrors = createRoundRef.current.validateRounds(
        formData.rounds,
        errors,
        formData.startDate,
        formData.endDate
      );
      Object.assign(newErrors, roundErrors);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form trước
    if (!validateForm()) {
      toast.error("Please fill in all required information.");
      return;
    }

    // Validate chỉ tiêu các đợt
    if (!createRoundRef.current?.validateRoundTargets()) {
      return;
    }

    // Kiểm tra roundDates trực tiếp từ roundsData TRƯỚC KHI map
    // Chặn việc lưu dữ liệu nếu có lỗi ở roundDates
    if (!createRoundRef.current?.validateRoundDatesBeforeSave()) {
      return; // Chặn việc lưu dữ liệu khi có lỗi
    }

    setIsSubmitting(true);

    try {
      // Map rounds và kiểm tra có rounds hợp lệ không
      const validRounds =
        createRoundRef.current?.mapRoundsToPayload(formData.rounds, errors) ||
        [];

      // Nếu không có rounds hợp lệ, không gửi request
      if (validRounds.length === 0) {
        toast.error(
          "No valid rounds to save. Please check the information again."
        );
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra roundDates có hợp lệ không (startDate phải < endDate) - kiểm tra lại sau khi map
      if (!createRoundRef.current?.validateRoundDates(validRounds)) {
        setIsSubmitting(false);
        return; // Chặn việc lưu dữ liệu khi có lỗi
      }

      const payload = {
        startDate: formData.startDate
          ? `${formData.startDate}T00:00:00Z`
          : null,
        endDate: formData.endDate ? `${formData.endDate}T23:59:59Z` : null,
        rounds: validRounds,
      };

      const response = await updateCampaignAndCreateRounds(campaignId, payload);
      console.log("Updating campaign:", payload);
      console.log("API Response:", response);

      if (response.success) {
        toast.success("Create campaign successfully!");

        setTimeout(() => {
          navigate(`/senior-recruiter/campaigns`);
        }, 2000);
      } else {
        // Nếu API trả về error, không lưu rounds
        toast.error("Create campaign failed");
        console.error("API Error - Rounds were not saved:", response);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error(
        "An error occurred while creating campaign. Rounds were not saved."
      );
      // Không lưu rounds khi có exception
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate("/senior-recruiter/campaigns");
  };

  // Show full-page loading when fetching campaign detail
  if (isLoadingDetail) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-gray-500">Loading campaign information...</div>
      </div>
    );
  }

  return (
    <div className="relative p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 mr-50">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Campaign Name *
            </label>
            <input
              type="text"
              name="campaignName"
              value={formData.campaignName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-300 ${
                isRequestDataLocked ? "bg-slate-100 cursor-not-allowed" : ""
              }`}
              placeholder="Enter campaign name"
              disabled={isRequestDataLocked}
            />
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Public recruitment - Cabin Crew
          </p>
        </div>
        <button
          onClick={() => navigate("/senior-recruiter/campaigns")}
          className="flex-shrink-0 px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Back
        </button>
      </div>

      {detailError && (
        <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded bg-red-50">
          {detailError}
        </div>
      )}

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
                    {campaignDetail?.partnerName
                      ? campaignDetail.partnerName
                      : isLoadingDetail
                      ? "Loading..."
                      : "N/A"}
                  </div>
                </div>
                <div className="text-xs text-right text-slate-500">
                  Campaign ID:{" "}
                  {campaignDetail?.campaignId ||
                    campaignId ||
                    (isLoadingDetail ? "Loading..." : "—")}
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
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-300 ${
                        isRequestDataLocked
                          ? "bg-slate-100 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="Nhập số lượng cần tuyển"
                      disabled={isRequestDataLocked}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Start date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.startDate ? "border-red-300" : "border-slate-300"
                      }`}
                      min={todayString}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      End date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.endDate ? "border-red-300" : "border-slate-300"
                      }`}
                      min={formData.startDate || todayString}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.endDate}
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
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-300 ${
                      isRequestDataLocked
                        ? "bg-slate-100 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="Mô tả chung về chiến dịch..."
                    disabled={isRequestDataLocked}
                  />
                </div>

                {/* Job Requirements - Dynamic from API (getRequirementItems) */}
                <div className="mt-6">
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Requirements *
                  </label>
                  <div
                    className={`rounded-md border p-4 bg-green-50 border-green-300`}
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
                </div>
              </div>
            </div>

            {/* Kế hoạch các đợt tuyển */}
            <CreateRound
              ref={createRoundRef}
              rounds={formData.rounds}
              errors={errors}
              campaignDetail={campaignDetail}
              roundsData={roundsData}
              setRoundsData={setRoundsData}
              onRoundsChange={handleRoundsChange}
              onErrorChange={setErrors}
              startDate={formData.startDate}
              endDate={formData.endDate}
              todayString={todayString}
              campaignTarget={parseInt(formData.targetQuantity, 10) || 0}
              roundTypes={roundTypes}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thông tin tổng kết */}
            <div className="bg-white border rounded-lg shadow-sm border-slate-200">
              <div className="px-5 py-4 font-semibold border-b border-slate-200 text-slate-800">
                Overview Campaign
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total rounds:</span>
                  <span className="font-medium text-slate-800">
                    {formData.rounds.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Target quantity of each round:
                  </span>
                  <span className="font-medium text-slate-800">
                    {formData.rounds.reduce(
                      (sum, round) =>
                        sum + (parseInt(round.targetQuantity, 10) || 0),
                      0
                    )}{" "}
                    people
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Expected time:</span>
                  <span className="font-medium text-slate-800">
                    {formData.startDate && formData.endDate
                      ? (() => {
                          const start = new Date(formData.startDate);
                          const end = new Date(formData.endDate);
                          const diffTime = Math.abs(end - start);
                          const diffDays =
                            Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 để bao gồm cả ngày bắt đầu và kết thúc
                          return `${diffDays} days`;
                        })()
                      : "Not determined"}
                  </span>
                </div>
              </div>
            </div>

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
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                    isSubmitting
                      ? "bg-slate-400 cursor-not-allowed text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Update Campaign"}
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

export default SeniorCreateCampaignPage;
