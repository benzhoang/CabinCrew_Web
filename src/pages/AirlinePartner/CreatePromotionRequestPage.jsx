import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import { createCampaignRequest } from "../../service/api2";
import ModalConfirm from "../../components/AirlinePartnerComponent/ModalConfirm";

const CreatePromotionRequestPage = () => {
  const [formData, setFormData] = useState({
    campaignName: "",
    targetQuantity: 0,
    description: "",
    jobDescription: "",
    jobRequirement: "",
    requestType: 2,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();
  const employeeData = JSON.parse(localStorage.getItem("employee") || "{}");
  const displayName = employeeData?.displayName;

  const airlineDisplayNames = {
    vietjet: "Vietjet Air",
    vietnamairlines: "Vietnam Airlines",
    bambooairways: "Bamboo Airways",
    sunphuquoc: "SunPhuQuoc Airways",
  };

  const normalizedDisplayName =
    typeof displayName === "string" ? displayName.toLowerCase() : "";
  const formattedDisplayName =
    airlineDisplayNames[normalizedDisplayName] || displayName;

  const requestTypeLabels = {
    2: "Thăng bậc",
  };

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

  const handleEditorChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.campaignName.trim()) {
      newErrors.campaignName = "Tên chiến dịch là bắt buộc";
    }
    if (!formData.targetQuantity || parseInt(formData.targetQuantity) <= 0) {
      newErrors.targetQuantity = "Số lượng mục tiêu phải lớn hơn 0";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả chung là bắt buộc";
    }
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Mô tả công việc là bắt buộc";
    }
    if (!formData.jobRequirement.trim()) {
      newErrors.jobRequirement = "Yêu cầu công việc là bắt buộc";
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
    };

    try {
      const response = await createCampaignRequest(payload);
      console.log("Creating campaign:", payload);

      if (response.success) {
        toast.success(response.message || "Tạo yêu cầu thành công!");
        navigate("/airline-partner/requests");
      } else {
        throw new Error(response.error || "Tạo yêu cầu thất bại");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate(-1);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 mr-50">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Tiêu đề *
            </label>
            <input
              type="text"
              name="campaignName"
              value={formData.campaignName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.campaignName ? "border-red-300" : "border-slate-300"
              }`}
              placeholder="Nhập tiêu đề yêu cầu nâng bậc"
            />
            {errors.campaignName && (
              <p className="mt-1 text-sm text-red-600">{errors.campaignName}</p>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Đăng công khai nâng bậc - Cabin Crew
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Quay lại
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
                    Thông tin đề xuất
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
                      Số lượng tuyển *
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
                      placeholder="Nhập số lượng cần tuyển"
                    />
                    {errors.targetQuantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.targetQuantity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Loại yêu cầu
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
                </div>

                <div className="mt-6">
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Mô tả chung *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? "border-red-300" : "border-slate-300"
                    }`}
                    placeholder="Mô tả chung về chiến dịch..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Mô tả công việc *
                  </label>
                  <div
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
                      config={{ placeholder: "Mô tả chi tiết về công việc..." }}
                    />
                  </div>
                  {errors.jobDescription && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.jobDescription}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Yêu cầu công việc *
                  </label>
                  <div
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
                        placeholder: "Liệt kê các yêu cầu cho ứng viên...",
                      }}
                    />
                  </div>
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
                  Hủy
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
                  {isSubmitting ? "Đang tạo..." : "Tạo yêu cầu"}
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
        title="Xác nhận hủy"
        message="Bạn có chắc chắn muốn hủy? Tất cả thông tin sẽ bị mất."
        confirmText="Hủy"
        cancelText="Quay lại"
      />
    </div>
  );
};

export default CreatePromotionRequestPage;
