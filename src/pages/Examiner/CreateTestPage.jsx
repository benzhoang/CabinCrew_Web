import React, { useState } from "react";
import { FiUploadCloud, FiFile, FiInfo, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { createTest } from "../../service/api2";
import { toast } from "react-toastify";

const testTypeOptions = [
  { value: 1, label: "English Listening" },
  { value: 2, label: "English Speaking" },
  { value: 3, label: "Practical" },
];

const CreateTestPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    testName: "",
    purpose: "",
    testType: "1",
    maxScore: "",
    durationInMinutes: "",
    audioFile: null,
  });
  const [previewFile, setPreviewFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    navigate(-1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // Validation cho tên đề thi
      if (!formData.testName || !formData.testName.trim()) {
        setErrorMessage("Tên đề thi là bắt buộc");
        setIsSubmitting(false);
        return;
      }

      // Validation cho mô tả
      if (!formData.purpose || !formData.purpose.trim()) {
        setErrorMessage("Mô tả là bắt buộc");
        setIsSubmitting(false);
        return;
      }

      // Validation theo điều kiện từ hình 2
      const testType = parseInt(formData.testType);
      const durationInMinutes = parseInt(formData.durationInMinutes);
      const maxScore = parseInt(formData.maxScore);

      // Validate DurationInMinutes: > 0
      if (!durationInMinutes || durationInMinutes <= 0) {
        setErrorMessage("Thời gian phải lớn hơn 0");
        setIsSubmitting(false);
        return;
      }

      // Validate MaxScore
      if (!maxScore || maxScore <= 0) {
        setErrorMessage("Điểm tối đa phải lớn hơn 0");
        setIsSubmitting(false);
        return;
      }

      // Validate AudioFile cho EnglishListening (TestType = 1)
      if (testType === 1 && !formData.audioFile) {
        setErrorMessage(
          "Audio file là bắt buộc đối với loại bài kiểm tra nghe tiếng Anh"
        );
        setIsSubmitting(false);
        return;
      }

      // Validate audio file format và size nếu có
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

      // Chuẩn bị dữ liệu để gửi API
      const testData = {
        TestName: formData.testName,
        Purpose: formData.purpose,
        TestType: testType,
        MaxScore: maxScore,
        DurationInMinutes: durationInMinutes,
      };

      // Gọi API createTest
      const result = await createTest(testData, formData.audioFile);
      console.log("Creating test:", testData);

      if (result.success) {
        toast.success(result.message || "Tạo đề thi thành công!");
        // Có thể navigate đến trang chi tiết test hoặc danh sách test
        navigate(-1);
      } else {
        toast.error(result.error || "Tạo đề thi thất bại. Vui lòng thử lại.");
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
          <p className="text-slate-600 max-w-3xl">
            Nhập thông tin đề thi và upload file audio đáp ứng yêu cầu định
            dạng.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Quay lại
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex items-start gap-3">
              <span className="mt-1 rounded-full bg-indigo-50 p-2 text-indigo-600">
                <FiInfo className="h-5 w-5" />
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
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Thông tin nhắc nhanh
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <span className="font-medium text-slate-800">
                    English Test
                  </span>{" "}
                  yêu cầu bắt buộc upload audio; hệ thống sẽ kiểm tra khi gửi
                  form.
                </li>
                <li>
                  <span className="font-medium text-slate-800">
                    Practical Test
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

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 text-sm text-indigo-700 space-y-3">
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
            className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-6"
          >
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                  min="0"
                  placeholder="Điểm tối đa"
                  value={formData.maxScore}
                  onChange={handleChange("maxScore")}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                <input
                  id="durationInMinutes"
                  type="number"
                  min="1"
                  max="480"
                  placeholder="Thời gian (phút)"
                  value={formData.durationInMinutes}
                  onChange={handleChange("durationInMinutes")}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span className="text-xs text-slate-500">
                  Thời gian làm bài từ 1 đến 480 phút (khuyến nghị: 30-180
                  phút).
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-slate-700">
                File audio
              </label>
              <div className="flex flex-col gap-4 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 p-6 text-center text-indigo-700">
                <FiUploadCloud className="mx-auto h-10 w-10" />
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
                  className="mx-auto inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <FiFile className="h-4 w-4" />
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
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <p className="font-medium">{previewFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {previewFile.type} · {previewFile.size} MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang xử lý..." : "Lưu đề thi"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CreateTestPage;
