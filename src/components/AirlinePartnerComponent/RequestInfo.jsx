import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCampaignRequestDetail } from "../../service/api2.js";
import { convertDateFormat } from "../../config/formatDate.js";
import Loading from "../Loading.jsx";

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-sm text-gray-500 w-36 shrink-0">{label}</div>
    <div className="text-sm text-gray-900">{value}</div>
  </div>
);

const RequestInfo = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editData, setEditData] = useState({
    position: "Flight Attendant",
    department: "Cabin Crew",
    unit: "Cabin Crew - Tiếp viên hàng không",
    targetHires: 20,
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    description:
      "Nhu cầu tuyển dụng theo kế hoạch khai thác năm 2024 và bổ sung nhân sự thay thế.",
    requirements: "Tiếng Anh tốt, kỹ năng giao tiếp, sức khỏe tốt.",
  });

  // Fetch request detail from API
  useEffect(() => {
    const fetchRequestDetail = async () => {
      if (!id) {
        setError("Không tìm thấy ID yêu cầu");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getCampaignRequestDetail(id);

        if (result.success && result.data) {
          setData(result.data);
          // Update editData with fetched data
          setEditData({
            position: "Flight Attendant",
            department: "Cabin Crew",
            unit: "Cabin Crew - Tiếp viên hàng không",
            targetHires: result.data.targetQuantity || 20,
            startDate: "2024-01-15",
            endDate: "2024-03-15",
            description: result.data.description || "",
            requirements: result.data.jobRequirement || "",
          });
        } else {
          setError(result.error || "Lỗi khi tải chi tiết yêu cầu");
        }
      } catch (err) {
        setError(err.message || "Lỗi khi tải chi tiết yêu cầu");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetail();
  }, [id]);

  const handleEditInfo = () => {
    setIsEditingInfo(true);
  };

  const handleSaveInfo = () => {
    // TODO: Implement save logic
    console.log("Saving data info:", editData);
    setIsEditingInfo(false);
    alert("Đã cập nhật thông tin data!");
  };

  const handleCancelEdit = () => {
    setIsEditingInfo(false);
    // Reset to original data
    if (data) {
      setEditData({
        position: "Flight Attendant",
        department: "Cabin Crew",
        unit: "Cabin Crew - Tiếp viên hàng không",
        targetHires: data.targetQuantity || 20,
        startDate: "2024-01-15",
        endDate: "2024-03-15",
        description: data.description || "",
        requirements: data.jobRequirement || "",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const EditableInfo = ({ label, value, onChange, type = "text" }) => (
    <div>
      <div className="mb-1 text-sm text-slate-600">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-red-600">Lỗi: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-gray-500">Không tìm thấy dữ liệu</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 gap-5">
        <div className="p-5 bg-white border border-gray-200 rounded-xl">
          <div className="mb-3 text-sm font-semibold text-gray-900">
            Thông tin đề xuất
            <button
              onClick={handleEditInfo}
              className="p-1 text-blue-600 rounded hover:text-blue-800 hover:bg-blue-50"
              title="Chỉnh sửa thông tin"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>

          <div className="font-medium text-gray-900">
            {data.partnerName || "N/A"}
          </div>
          {isEditingInfo ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <EditableInfo
                  label="Vị trí tuyển"
                  value={editData.position}
                  onChange={(value) => handleInputChange("position", value)}
                />
                <EditableInfo
                  label="Phòng ban"
                  value={editData.department}
                  onChange={(value) => handleInputChange("department", value)}
                />
                <EditableInfo
                  label="Đơn vị"
                  value={editData.unit}
                  onChange={(value) => handleInputChange("unit", value)}
                />
                <EditableInfo
                  label="Số lượng tuyển"
                  value={editData.targetHires.toString()}
                  onChange={(value) =>
                    handleInputChange("targetHires", parseInt(value) || 0)
                  }
                  type="number"
                />
                <EditableInfo
                  label="Ngày bắt đầu"
                  value={editData.startDate}
                  onChange={(value) => handleInputChange("startDate", value)}
                  type="date"
                />
                <EditableInfo
                  label="Ngày kết thúc"
                  value={editData.endDate}
                  onChange={(value) => handleInputChange("endDate", value)}
                  type="date"
                />
              </div>

              <div>
                <div className="mb-1 text-sm text-slate-600">Mô tả nhu cầu</div>
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>

              <div>
                <div className="mb-1 text-sm text-slate-600">Yêu cầu</div>
                <textarea
                  value={editData.requirements}
                  onChange={(e) =>
                    handleInputChange("requirements", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveInfo}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 mt-4 md:grid-cols-2">
              <>
                <InfoRow
                  label="Tên chiến dịch"
                  value={data.campaignName || "N/A"}
                />
                <InfoRow label="Đối tác" value={data.partnerName || "N/A"} />
                <InfoRow
                  label="Ngày tạo"
                  value={convertDateFormat(data.createdAt) || "N/A"}
                />
                <InfoRow
                  label="Số lượng tuyển"
                  value={data.targetQuantity || "N/A"}
                />
                <InfoRow label="Mô tả" value={data.description || "N/A"} />
              </>
            </div>
          )}
          {/* Job Description */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              📋 Mô tả công việc / Job Description
            </h3>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="text-sm whitespace-pre-wrap text-slate-700">
                {data.jobDescription || "N/A"}
              </div>
            </div>
          </div>

          {/* Job Requirements */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              📝 Yêu cầu công việc / Job Requirements
            </h3>
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="text-sm whitespace-pre-wrap text-slate-700">
                {data.jobRequirement || "N/A"}
              </div>
            </div>
          </div>

          {/* Recruitment Process */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              🔄 Quy trình tuyển dụng / Recruitment Process
            </h3>
            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-800">
                      🇻🇳 Tiếng Việt:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                          1
                        </span>
                        <span className="text-slate-700">
                          Kiểm tra hồ sơ: Ứng viên chuẩn bị CCCD để đối chiếu và
                          lấy số báo danh
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                          2
                        </span>
                        <span className="text-slate-700">
                          Kiểm tra ngoại hình AI
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                          3
                        </span>
                        <span className="text-slate-700">
                          Cân đo chiều cao và BMI
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                          4
                        </span>
                        <span className="text-slate-700">
                          Thi Catwalk - Phỏng vấn AI
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                          5
                        </span>
                        <span className="text-slate-700">
                          Thi Tài năng (theo nhóm)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                          6
                        </span>
                        <span className="text-slate-700">
                          Phỏng vấn Hội đồng
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-800">🇺🇸 English:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-green-500 rounded-full">
                          1
                        </span>
                        <span className="text-slate-700">
                          Document Check: candidates bring the ID Card (Passport
                          for expat) for verification and candidate's number
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-green-500 rounded-full">
                          2
                        </span>
                        <span className="text-slate-700">
                          AI Grooming Check
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-green-500 rounded-full">
                          3
                        </span>
                        <span className="text-slate-700">
                          Height and BMI Check
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-green-500 rounded-full">
                          4
                        </span>
                        <span className="text-slate-700">
                          Catwalk - AI Interview
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-green-500 rounded-full">
                          5
                        </span>
                        <span className="text-slate-700">
                          Talent Show (in groups)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-green-500 rounded-full">
                          6
                        </span>
                        <span className="text-slate-700">Panel Interview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recruitment Schedule */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              📅 Lịch tuyển dụng / Recruitment Schedule
            </h3>
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <div className="font-medium text-slate-800">
                      CabinCrew áp dụng công nghệ AI
                    </div>
                    <div className="text-slate-600">
                      Tăng hiệu quả, cải thiện trải nghiệm ứng viên, số hóa dữ
                      liệu, không giấy tờ và bảo vệ môi trường 🍃
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📌</span>
                  <div>
                    <div className="font-medium text-slate-800">
                      Địa điểm: TP. Hồ Chí Minh
                    </div>
                    <div className="text-slate-600">
                      Học viện Hàng không CabinCrew
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <div className="font-medium text-slate-800">
                      Thời gian: 8:00 AM | Thứ Bảy, 01/11/2025
                    </div>
                    <div className="text-slate-600">
                      Saturday, November 1, 2025
                    </div>
                  </div>
                </div>
                <div className="p-3 mt-3 bg-blue-100 border border-blue-300 rounded">
                  <div className="text-xs text-blue-800">
                    <strong>Lưu ý:</strong> Lịch tuyển dụng có thể thay đổi
                    trong một số trường hợp cụ thể. Ứng viên vui lòng thường
                    xuyên kiểm tra website chính thức CabinCrew Careers để cập
                    nhật thông tin mới nhất.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestInfo;
