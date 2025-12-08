import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import {
  getCampaignDetail,
  updateCampaignAndCreateRounds,
} from "../../service/api2";
import Loading from "../../components/Loading";
import CreateRound from "../../components/SeniorRecruiterComponent/CreateCampaign/CreateRound";

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
    rounds: [
      {
        roundName: "Đợt 1",
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
            jobDescription: detailData.jobDescription || "",
            jobRequirement: detailData.jobRequirement || "",
          }));
        } else {
          setDetailError(result.error || "Không thể tải chi tiết yêu cầu");
        }
      } catch (err) {
        if (!isMounted) return;
        setDetailError(err.message || "Không thể tải chi tiết yêu cầu");
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

  const handleRoundsChange = (newRounds) => {
    setFormData((prev) => ({
      ...prev,
      rounds: newRounds,
    }));
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
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
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
          "Không có đợt tuyển hợp lệ để lưu. Vui lòng kiểm tra lại thông tin."
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
        toast.success(response.message || "Cập nhật campaign thành công!");

        setTimeout(() => {
          navigate(`/senior-recruiter/campaigns`);
        }, 2000);
      } else {
        // Nếu API trả về error, không lưu rounds
        toast.error(response.error || "Cập nhật campaign thất bại");
        console.error("API Error - Rounds were not saved:", response);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Có lỗi xảy ra khi tạo campaign. Rounds không được lưu.");
      // Không lưu rounds khi có exception
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
                      : "N/A"}
                  </div>
                </div>
                <div className="text-xs text-right text-slate-500">
                  Mã số:{" "}
                  {campaignDetail?.campaignId ||
                    campaignId ||
                    (isLoadingDetail ? "Đang tải..." : "—")}
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
            />
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
                    {formData.rounds.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Chỉ tiêu các đợt:</span>
                  <span className="font-medium text-slate-800">
                    {formData.rounds.reduce(
                      (sum, round) =>
                        sum + (parseInt(round.targetQuantity, 10) || 0),
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
                  onClick={handleSubmit}
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
