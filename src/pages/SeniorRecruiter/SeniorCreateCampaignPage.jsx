import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import {
  getCampaignDetail,
  updateCampaignAndCreateRounds,
} from "../../service/api2";
import Loading from "../../components/Loading";

const SeniorCreateCampaignPage = () => {
  const { id: campaignId } = useParams();
  const todayString = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    campaignName: "",
    targetQuantity: "",
    startDate: "",
    endDate: "",
    description: "",
    requirements: "",
    jobDescription: "",
    jobRequirement: "",
    batches: [
      {
        name: "Đợt 1",
        startTime: "",
        endTime: "",
        location: "",
        method: "Trực tiếp",
        owner: "",
        target: "",
        note: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [detailError, setDetailError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const isRequestDataLocked = Boolean(campaignDetail);

  const locations = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ"];

  const recruitmentMethods = ["Trực tiếp", "Trực tuyến", "Hybrid"];

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
            jobDescription: detailData.jobDescription || "",
            jobRequirement: detailData.jobRequirement || "",
          }));
        } else {
          setDetailError(result.error || "Không thể tải chi tiết yêu cầu");
        }
      } catch (error) {
        if (!isMounted) return;
        setDetailError(error.message || "Không thể tải chi tiết yêu cầu");
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

  const handleBatchChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      batches: prev.batches.map((batch, i) =>
        i === index ? { ...batch, [field]: value } : batch
      ),
    }));
  };

  const addBatch = () => {
    if (formData.batches.length >= 3) return;
    setFormData((prev) => ({
      ...prev,
      batches: [
        ...prev.batches,
        {
          name: `Đợt ${prev.batches.length + 1}`,
          startTime: "",
          endTime: "",
          location: "",
          method: "Trực tiếp",
          owner: "",
          target: "",
          note: "",
        },
      ],
    }));
  };

  const removeBatch = (index) => {
    if (formData.batches.length > 1) {
      setFormData((prev) => ({
        ...prev,
        batches: prev.batches.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }
    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả nhu cầu là bắt buộc";
    }
    if (!formData.requirements.trim()) {
      newErrors.requirements = "Yêu cầu là bắt buộc";
    }

    formData.batches.forEach((batch, index) => {
      if (!batch.startTime) {
        newErrors[`batches.${index}.startTime`] =
          "Thời gian bắt đầu là bắt buộc";
      }
      if (!batch.endTime) {
        newErrors[`batches.${index}.endTime`] =
          "Thời gian kết thúc là bắt buộc";
      }
      if (
        batch.startTime &&
        batch.endTime &&
        batch.startTime >= batch.endTime
      ) {
        newErrors[`batches.${index}.endTime`] =
          "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
      if (!batch.location.trim()) {
        newErrors[`batches.${index}.location`] =
          "Địa điểm đợt tuyển là bắt buộc";
      }
      if (!batch.owner.trim()) {
        newErrors[`batches.${index}.owner`] = "Người phụ trách là bắt buộc";
      }
      if (!batch.target || parseInt(batch.target, 10) <= 0) {
        newErrors[`batches.${index}.target`] =
          "Chỉ tiêu phải lớn hơn 0 cho mỗi đợt";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapBatchesToPayload = () => {
    return formData.batches.map((batch, index) => ({
      roundName: batch.name || `Round ${index + 1}`,
      description: batch.note || "",
      targetQuantity: parseInt(batch.target, 10) || 0,
      roundStartDate: batch.startTime ? `${batch.startTime}T00:00:00Z` : null,
      roundEndDate: batch.endTime ? `${batch.endTime}T23:59:59Z` : null,
      location: batch.location,
      method: batch.method,
      owner: batch.owner,
    }));
  };

  const validateBatchTargets = () => {
    const campaignTarget = parseInt(formData.targetQuantity, 10) || 0;
    if (campaignTarget <= 0) {
      toast.error("Vui lòng nhập chỉ tiêu campaign hợp lệ.");
      return false;
    }

    const batches = formData.batches;
    if (batches.length === 0) {
      toast.error("Cần ít nhất một đợt tuyển.");
      return false;
    }

    // Round 1 must be 60-70% of campaign target
    const firstTarget = parseInt(batches[0].target, 10) || 0;
    if (
      firstTarget < campaignTarget * 0.6 ||
      firstTarget > campaignTarget * 0.7
    ) {
      toast.error(
        "Đợt 1 phải có chỉ tiêu 60% - 70% tổng chỉ tiêu của campaign."
      );
      return false;
    }

    // Remaining target after round 1
    let remaining = campaignTarget - firstTarget;

    // Middle rounds (excluding first and last if there are >=2 rounds)
    if (batches.length > 2) {
      for (let i = 1; i < batches.length - 1; i += 1) {
        const roundTarget = parseInt(batches[i].target, 10) || 0;
        if (roundTarget < remaining * 0.6 || roundTarget > remaining * 0.7) {
          toast.error(
            `Đợt ${
              i + 1
            } phải có chỉ tiêu 60% - 70% của số lượng còn lại sau các đợt trước.`
          );
          return false;
        }
        remaining -= roundTarget;
      }
    }

    // Last round must be >=80% of remaining
    if (batches.length > 1) {
      const lastTarget = parseInt(batches[batches.length - 1].target, 10) || 0;
      if (lastTarget < remaining * 0.8) {
        toast.error(
          "Đợt cuối phải có chỉ tiêu tối thiểu 80% số lượng còn lại."
        );
        return false;
      }
    } else {
      // If only one round, remaining was campaignTarget - firstTarget; ensure nothing left
      if (remaining > 0) {
        toast.error("Tổng chỉ tiêu các đợt chưa đạt 100% campaign target.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const incompleteBatchIndex = formData.batches.findIndex((batch, index) => {
      if (!batch.startTime || !batch.endTime) return true;
      if (!batch.location.trim()) return true;
      if (index !== 0 && !batch.owner.trim()) return true;
      if (!batch.target || parseInt(batch.target, 10) <= 0) return true;
      return false;
    });

    if (incompleteBatchIndex !== -1) {
      const batchName =
        formData.batches[incompleteBatchIndex].name ||
        `Đợt ${incompleteBatchIndex + 1}`;
      toast.error(`Vui lòng nhập đầy đủ thông tin cho ${batchName}.`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!validateBatchTargets()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        startDate: formData.startDate
          ? `${formData.startDate}T00:00:00Z`
          : null,
        endDate: formData.endDate ? `${formData.endDate}T23:59:59Z` : null,
        rounds: mapBatchesToPayload(),
      };

      const response = await updateCampaignAndCreateRounds(campaignId, payload);
      console.log("Updating campaign:", payload);

      if (response.success) {
        toast.success(response.message || "Cập nhật campaign thành công!");
        navigate("/senior-recruiter/campaigns");
      } else {
        toast.error(response.error || "Cập nhật campaign thất bại");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Có lỗi xảy ra khi tạo campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm("Bạn có chắc chắn muốn hủy? Tất cả thông tin sẽ bị mất.")
    ) {
      navigate("/senior-recruiter/campaigns");
    }
  };

  return (
    <div className="relative p-6">
      {isLoadingDetail && <Loading message="Đang tải thông tin yêu cầu..." />}
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
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-300 ${
                isRequestDataLocked ? "bg-slate-100 cursor-not-allowed" : ""
              }`}
              placeholder="Nhập tiêu đề yêu cầu tuyển dụng"
              disabled={isRequestDataLocked}
            />
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Đăng công khai tuyển dụng - Cabin Crew
          </p>
        </div>
        <button
          onClick={() => navigate("/senior-recruiter/campaigns")}
          className="flex-shrink-0 px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Quay lại
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
                    Thông tin đề xuất
                  </div>
                  <div className="font-semibold text-slate-800">
                    {campaignDetail?.partnerName
                      ? campaignDetail.partnerName
                      : isLoadingDetail
                      ? "Đang tải..."
                      : "Chưa có thông tin đối tác"}
                  </div>
                </div>
                <div className="text-xs text-right text-slate-500">
                  <div>
                    Ngày tạo:{" "}
                    {campaignDetail?.createdAt
                      ? new Date(campaignDetail.createdAt).toLocaleString(
                          "vi-VN"
                        )
                      : isLoadingDetail
                      ? "Đang tải..."
                      : "Chưa xác định"}
                  </div>
                  <div>
                    Mã số:{" "}
                    {campaignDetail?.campaignId ||
                      campaignId ||
                      (isLoadingDetail ? "Đang tải..." : "—")}
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
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-300 ${
                        isRequestDataLocked
                          ? "bg-slate-100 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="Nhập số lượng cần tuyển"
                      disabled={isRequestDataLocked}
                    />
                    {errors.targetQuantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.targetQuantity}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Ngày bắt đầu *
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
                      Ngày kết thúc *
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
                    Mô tả chung *
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
                  <div className={`rounded-md border border-slate-300`}>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.jobDescription}
                      onChange={(_, editor) =>
                        handleEditorChange("jobDescription", editor.getData())
                      }
                      config={{ placeholder: "Mô tả chi tiết về công việc..." }}
                      disabled={isRequestDataLocked}
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
                  <div className={`rounded-md border border-slate-300`}>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.jobRequirement}
                      onChange={(_, editor) =>
                        handleEditorChange("jobRequirement", editor.getData())
                      }
                      config={{
                        placeholder: "Liệt kê các yêu cầu cho ứng viên...",
                      }}
                      disabled={isRequestDataLocked}
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

            {/* Kế hoạch các đợt tuyển */}
            <div className="bg-white border rounded-lg shadow-sm border-slate-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                <div className="font-semibold text-slate-800">
                  Kế hoạch các đợt tuyển
                </div>
                <button
                  type="button"
                  onClick={addBatch}
                  disabled={formData.batches.length >= 3}
                  className={`px-3 py-1 text-sm text-white rounded-md ${
                    formData.batches.length >= 3
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  + Thêm đợt
                </button>
              </div>

              <div className="p-5">
                <div className="space-y-4">
                  {formData.batches.map((batch, index) => (
                    <div
                      key={index}
                      className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-800">
                            {batch.name}
                          </span>
                          {formData.batches.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBatch(index)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              ✕ Xóa
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                              Thời gian bắt đầu *
                            </label>
                            <input
                              type="date"
                              value={batch.startTime}
                              onChange={(e) =>
                                handleBatchChange(
                                  index,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1 text-xs border rounded ${
                                errors[`batches.${index}.startTime`]
                                  ? "border-red-300"
                                  : "border-slate-300"
                              }`}
                              min={todayString}
                            />
                            {errors[`batches.${index}.startTime`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`batches.${index}.startTime`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                              Thời gian kết thúc *
                            </label>
                            <input
                              type="date"
                              value={batch.endTime}
                              onChange={(e) =>
                                handleBatchChange(
                                  index,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1 text-xs border rounded ${
                                errors[`batches.${index}.endTime`]
                                  ? "border-red-300"
                                  : "border-slate-300"
                              }`}
                              min={batch.startTime || todayString}
                            />
                            {errors[`batches.${index}.endTime`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`batches.${index}.endTime`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                              Địa điểm *
                            </label>
                            <select
                              value={batch.location}
                              onChange={(e) =>
                                handleBatchChange(
                                  index,
                                  "location",
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1 text-xs border rounded ${
                                errors[`batches.${index}.location`]
                                  ? "border-red-300"
                                  : "border-slate-300"
                              }`}
                            >
                              <option value="">-- Chọn địa điểm --</option>
                              {locations.map((location) => (
                                <option key={location} value={location}>
                                  {location}
                                </option>
                              ))}
                            </select>
                            {errors[`batches.${index}.location`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`batches.${index}.location`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                              Hình thức
                            </label>
                            <select
                              value={batch.method}
                              onChange={(e) =>
                                handleBatchChange(
                                  index,
                                  "method",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 text-xs border rounded border-slate-300"
                            >
                              {recruitmentMethods.map((method) => (
                                <option key={method} value={method}>
                                  {method}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Ẩn input phụ trách cho đợt 1 (index 0) */}
                          {index !== 0 && (
                            <div>
                              <label className="block mb-1 text-sm font-medium text-slate-700">
                                Phụ trách *
                              </label>
                              <input
                                type="text"
                                value={batch.owner}
                                onChange={(e) =>
                                  handleBatchChange(
                                    index,
                                    "owner",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-2 py-1 text-xs border rounded ${
                                  errors[`batches.${index}.owner`]
                                    ? "border-red-300"
                                    : "border-slate-300"
                                }`}
                                placeholder="Nguyễn Văn A"
                              />
                              {errors[`batches.${index}.owner`] && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors[`batches.${index}.owner`]}
                                </p>
                              )}
                            </div>
                          )}

                          <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                              Chỉ tiêu *
                            </label>
                            <input
                              type="number"
                              value={batch.target}
                              onChange={(e) =>
                                handleBatchChange(
                                  index,
                                  "target",
                                  e.target.value
                                )
                              }
                              min="0"
                              step="10"
                              className={`w-full px-2 py-1 text-xs border rounded ${
                                errors[`batches.${index}.target`]
                                  ? "border-red-300"
                                  : "border-slate-300"
                              }`}
                            />
                            {errors[`batches.${index}.target`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`batches.${index}.target`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                              Ghi chú
                            </label>
                            <input
                              type="text"
                              value={batch.note}
                              onChange={(e) =>
                                handleBatchChange(index, "note", e.target.value)
                              }
                              className="w-full px-2 py-1 text-xs border rounded border-slate-300"
                              placeholder="Phỏng vấn vòng 1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thông tin tổng kết */}
            <div className="bg-white border rounded-lg shadow-sm border-slate-200">
              <div className="px-5 py-4 font-semibold border-b border-slate-200 text-slate-800">
                Tổng quan Campaign
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tổng đợt tuyển:</span>
                  <span className="font-medium text-slate-800">
                    {formData.batches.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Chỉ tiêu các đợt:</span>
                  <span className="font-medium text-slate-800">
                    {formData.batches.reduce(
                      (sum, batch) => sum + (parseInt(batch.target, 10) || 0),
                      0
                    )}{" "}
                    người
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Thời gian dự kiến:</span>
                  <span className="font-medium text-slate-800">
                    {formData.startDate && formData.endDate
                      ? (() => {
                          const start = new Date(formData.startDate);
                          const end = new Date(formData.endDate);
                          const diffTime = Math.abs(end - start);
                          const diffDays =
                            Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 để bao gồm cả ngày bắt đầu và kết thúc
                          return `${diffDays} ngày`;
                        })()
                      : "Chưa xác định"}
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
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật Campaign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SeniorCreateCampaignPage;
