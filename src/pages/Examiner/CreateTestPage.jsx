import React, { useState } from "react";
import { FiUploadCloud, FiFile, FiInfo, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const testTypeOptions = [
  { value: 1, label: "English" },
  { value: 2, label: "Practical" },
];

const CreateTestPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    testName: "",
    purpose: "",
    testType: "1",
    maxScore: "",
    audioFile: null,
  });
  const [previewFile, setPreviewFile] = useState(null);

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

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: hook API tạo đề thi (multipart/form-data)
    alert("Tính năng đang phát triển. Vui lòng kiểm tra lại sau.");
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="testName"
                  className="text-sm font-medium text-slate-700"
                >
                  TestName
                </label>
                <input
                  id="testName"
                  type="text"
                  placeholder="Nhập tên đề thi..."
                  value={formData.testName}
                  onChange={handleChange("testName")}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
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
                  Purpose
                </label>
                <input
                  id="purpose"
                  type="text"
                  placeholder="Mục tiêu đề thi..."
                  value={formData.purpose}
                  onChange={handleChange("purpose")}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
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
                  TestType
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
                  MaxScore
                </label>
                <input
                  id="maxScore"
                  type="number"
                  min="0"
                  placeholder="Điểm tối đa"
                  value={formData.maxScore}
                  onChange={handleChange("maxScore")}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
                <span className="text-xs text-slate-500">
                  Điểm tối đa cho đề thi (ví dụ 100).
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-slate-700">
                AudioFile
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
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Lưu đề thi
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CreateTestPage;
