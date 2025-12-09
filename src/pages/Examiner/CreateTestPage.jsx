import { useState } from "react";
import { FaFileUpload, FaCloudUploadAlt, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { createTest } from "../../service/api2";
import { toast } from "react-toastify";
import ModalConfirm from "../../components/AirlinePartnerComponent/ModalConfirm";

const testTypeOptions = [
  { value: 0, label: "Chọn loại đề thi" },
  { value: 1, label: "English Listening" },
  { value: 2, label: "English Speaking" },
  { value: 3, label: "Practical" },
];

const durationOptions = [
  { value: 0, label: "Chọn thời gian" },
  { value: 60, label: "60 phút" },
  { value: 90, label: "90 phút" },
  { value: 120, label: "120 phút" },
];

const CreateTestPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    testName: "",
    purpose: "",
    testType: "0",
    maxScore: 0,
    durationInMinutes: "0",
    audioFile: null,
  });
  const [previewFile, setPreviewFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleChange = (field) => (event) => {
    const value =
      field === "audioFile"
        ? event.target.files?.[0] ?? null
        : event.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "audioFile") {
      const file = event.target.files?.[0];
      setPreviewFile(
        file
          ? {
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2),
            type: file.type || "Unknown type",
          }
          : null
      );
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate("/examiner/testing");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // Validation testName
      if (!formData.testName || !formData.testName.trim()) {
        setErrorMessage("Tên đề thi là bắt buộc");
        setIsSubmitting(false);
        return;
      }

      // Validation purpose
      if (!formData.purpose || !formData.purpose.trim()) {
        setErrorMessage("Mô tả là bắt buộc");
        setIsSubmitting(false);
        return;
      }

      const testType = parseInt(formData.testType);
      const durationInMinutes = parseInt(formData.durationInMinutes);
      //const maxScore = parseInt(formData.maxScore);

      // Validate TestType
      if (!testType || testType === 0) {
        setErrorMessage("Vui lòng chọn loại đề thi");
        setIsSubmitting(false);
        return;
      }

      // Validate DurationInMinutes
      if (
        !durationInMinutes ||
        durationInMinutes === 0 ||
        ![60, 90, 120].includes(durationInMinutes)
      ) {
        setErrorMessage("Vui lòng chọn thời gian: 60, 90 hoặc 120 phút");
        setIsSubmitting(false);
        return;
      }

      // Validate MaxScore
      if (!formData.maxScore || !formData.maxScore > 0) {
        setErrorMessage("Điểm tối đa phải lớn hơn 0");
        setIsSubmitting(false);
        return;
      }

      // Validate AudioFile for EnglishListening (TestType = 1)
      if (testType === 1 && !formData.audioFile) {
        setErrorMessage(
          "Audio file là bắt buộc đối với loại bài kiểm tra nghe tiếng Anh"
        );
        setIsSubmitting(false);
        return;
      }

      // Validate audio file format và size
      if (formData.audioFile) {
        const file = formData.audioFile;
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (fileExtension !== "mp3" && fileExtension !== "wav") {
          setErrorMessage("File audio phải có định dạng .mp3 hoặc .wav");
          setIsSubmitting(false);
          return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 50) {
          setErrorMessage("File audio không được vượt quá 50 MB");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data to call API
      const testData = {
        TestName: formData.testName,
        Purpose: formData.purpose,
        TestType: testType,
        MaxScore: formData.maxScore,
        DurationInMinutes: durationInMinutes,
      };

      // Call API createTest
      const result = await createTest(testData, formData.audioFile);
      console.log("Creating test:", testData);

      if (result.success) {
        toast.success("Tạo đề thi thành công!");
        navigate("/examiner/testing");
      } else {
        toast.error("Tạo đề thi thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error creating test:", error);
      setErrorMessage("Đã xảy ra lỗi khi tạo đề thi. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Tạo đề thi</h1>
          <p className="max-w-3xl text-slate-600">
            Nhập thông tin đề thi và upload file audio đáp ứng yêu cầu định
            dạng.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/examiner/testing")}
          className="inline-flex items-center self-start gap-2 px-4 py-2 text-sm font-medium transition border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          Quay lại
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
            <div className="flex items-start gap-3">
              <span className="p-2 mt-1 text-indigo-600 rounded-full bg-indigo-50">
                <FaInfoCircle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Yêu cầu upload audio
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Định dạng cho phép: .mp3 hoặc .wav</li>
                  <li>• Dung lượng tối đa: 50&nbsp;MB</li>
                </ul>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="p-6 space-y-4 bg-white border shadow-sm rounded-2xl border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Thông tin nhắc nhanh
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <span className="font-medium text-slate-800">
                    English Listening Test
                  </span>{" "}
                  yêu cầu bắt buộc upload audio; hệ thống sẽ kiểm tra khi gửi
                  form.
                </li>
                <li>
                  <span className="font-medium text-slate-800">
                    English Speaking Test và Practical Test
                  </span>{" "}
                  có thể bỏ qua file audio nếu không cần.
                </li>
                <li>
                  Nên đặt tên file theo cấu trúc:{" "}
                  <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">
                    testcode_level.mp3
                  </span>
                  .
                </li>
                <li>
                  Sau khi tạo đề thi, bạn có thể quản lý câu hỏi tại trang chi
                  tiết đề thi.
                </li>
              </ul>
            </div>

            <div className="p-6 space-y-3 text-sm text-indigo-700 border border-indigo-100 rounded-2xl bg-indigo-50">
              <h4 className="text-base font-semibold text-indigo-800">
                Gợi ý bảo mật
              </h4>
              <p>
                Không chia sẻ join code công khai. Gửi cho ứng viên qua các kênh
                nội bộ hoặc email do hệ thống hỗ trợ.
              </p>
              <p>
                Nếu cần cập nhật audio, hãy chỉnh sửa đề thi và upload phiên bản
                mới thay vì xóa đề.
              </p>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 bg-white border shadow-sm rounded-2xl border-slate-200"
          >
            {errorMessage && (
              <div className="p-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="testName"
                  className="text-sm font-medium text-slate-700"
                >
                  Tên đề thi
                </label>
                <input
                  id="testName"
                  type="text"
                  placeholder="Nhập tên đề thi..."
                  value={formData.testName}
                  onChange={handleChange("testName")}
                  className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span className="text-xs text-slate-500">
                  Tên hiển thị cho đề thi, ví dụ "English Level Test".
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="purpose"
                  className="text-sm font-medium text-slate-700"
                >
                  Mục đích
                </label>
                <input
                  id="purpose"
                  type="text"
                  placeholder="Mục đích đề thi..."
                  value={formData.purpose}
                  onChange={handleChange("purpose")}
                  className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span className="text-xs text-slate-500">
                  Ghi chú ngắn giúp xác định mục đích sử dụng đề thi.
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="testType"
                  className="text-sm font-medium text-slate-700"
                >
                  Loại đề thi
                </label>
                <select
                  id="testType"
                  value={formData.testType}
                  onChange={handleChange("testType")}
                  className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {testTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">
                  Chọn loại đề thi để áp dụng yêu cầu upload audio tương ứng.
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="maxScore"
                  className="text-sm font-medium text-slate-700"
                >
                  Điểm tối đa
                </label>
                <input
                  id="maxScore"
                  type="number"
                  value={formData.maxScore}
                  onChange={handleChange("maxScore")}
                  className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span className="text-xs text-slate-500">
                  Điểm tối đa cho đề thi (ví dụ 100).
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="durationInMinutes"
                  className="text-sm font-medium text-slate-700"
                >
                  Thời gian
                </label>
                <select
                  id="durationInMinutes"
                  value={formData.durationInMinutes}
                  onChange={handleChange("durationInMinutes")}
                  className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">
                  Chọn thời gian làm bài: 60, 90 hoặc 120 phút.
                </span>
              </div>
            </div>

            {formData.testType !== "2" && formData.testType !== "3" && (
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-slate-700">
                  File audio
                </label>
                <div className="flex flex-col gap-4 p-6 text-center text-indigo-700 border border-indigo-300 border-dashed rounded-xl bg-indigo-50/60">
                  <FaCloudUploadAlt className="w-10 h-10 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      Kéo thả file vào đây hoặc bấm chọn tệp
                    </p>
                    <p className="text-xs text-indigo-600/80">
                      Hỗ trợ .mp3, .wav · Tối đa 50&nbsp;MB
                    </p>
                  </div>
                  <label
                    htmlFor="audioFile"
                    className="inline-flex items-center gap-2 px-4 py-2 mx-auto text-sm font-medium text-white transition bg-indigo-600 rounded-lg shadow-sm cursor-pointer hover:bg-indigo-700"
                  >
                    <FaFileUpload className="w-4 h-4" />
                    Chọn tệp từ thiết bị
                    <input
                      id="audioFile"
                      type="file"
                      accept=".mp3,.wav"
                      onChange={handleChange("audioFile")}
                      className="hidden"
                    />
                  </label>
                </div>
                {previewFile && (
                  <div className="p-4 text-sm bg-white border rounded-lg border-slate-200 text-slate-700">
                    <p className="font-medium">{previewFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {previewFile.type} · {previewFile.size} MB
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium transition border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-semibold text-white transition bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang xử lý..." : "Lưu đề thi"}
              </button>
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
      </section>
    </div>
  );
};

export default CreateTestPage;
