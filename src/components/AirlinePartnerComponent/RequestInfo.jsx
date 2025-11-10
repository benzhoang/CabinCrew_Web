import { useState } from "react";
import { useLocation } from "react-router-dom";

const mockCampaign = {
  id: 101,
  code: "REQ-2024-001",
  title: "Yêu cầu tuyển dụng - Cabin Crew (MRF)",
  proposer: "Đặng Bích Thu Thùy",
  position: "Cabin Crew",
  department: "Cabin Crew",
  unit: "Cabin Crew - Tiếp viên hàng không",
  quantity: 20,
  status: "pending",
  startDate: "2024-10-01",
  endDate: "2024-12-31",
  description:
    "Bổ sung nhân sự Cabin Crew do biến động nghỉ việc và mở rộng đội bay",
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-36 shrink-0 text-gray-500 text-sm">{label}</div>
    <div className="text-gray-900 text-sm">{value}</div>
  </div>
);

const RequestInfo = () => {
  const { state } = useLocation();
  const data = state?.request || mockCampaign;

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editData, setEditData] = useState({
    position: data?.position || "Flight Attendant",
    department: data?.department || "Cabin Crew",
    unit: "Cabin Crew - Tiếp viên hàng không",
    targetHires: data?.targetHires ?? 20,
    startDate: data?.startDate || "2024-01-15",
    endDate: data?.endDate || "2024-03-15",
    description:
      data?.description ||
      "Nhu cầu tuyển dụng theo kế hoạch khai thác năm 2024 và bổ sung nhân sự thay thế.",
    requirements:
      data?.requirements || "Tiếng Anh tốt, kỹ năng giao tiếp, sức khỏe tốt.",
  });

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
    setEditData({
      position: data?.position || "Flight Attendant",
      department: data?.department || "Cabin Crew",
      unit: data?.unit || "Cabin Crew - Tiếp viên hàng không",
      targetHires: data?.quantity || 20,
      description:
        data?.description ||
        "Nhu cầu tuyển dụng theo kế hoạch khai thác năm 2024 và bổ sung nhân sự thay thế.",
    });
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const EditableInfo = ({ label, value, onChange, type = "text" }) => (
    <div>
      <div className="text-sm text-slate-600 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm font-semibold text-gray-900 mb-3">
            Thông tin đề xuất
            <button
              onClick={handleEditInfo}
              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
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

          <div className="text-gray-900 font-medium">{data.proposer}</div>
          {isEditingInfo ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="text-sm text-slate-600 mb-1">Mô tả nhu cầu</div>
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>

              <div>
                <div className="text-sm text-slate-600 mb-1">Yêu cầu</div>
                <textarea
                  value={editData.requirements}
                  onChange={(e) =>
                    handleInputChange("requirements", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveInfo}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <>
                <InfoRow label="Vị trí tuyển" value={data.position} />
                <InfoRow label="Phòng ban" value={data.department} />
                <InfoRow label="Đơn vị" value={data.unit} />
                <InfoRow label="Số lượng tuyển" value={data.quantity} />
                <InfoRow label="Mô tả" value={data.description} />
              </>
            </div>
          )}
          {/* Job Description */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              📋 Mô tả công việc / Job Description
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">
                    🇻🇳 Tiếng Việt:
                  </h4>
                  <ul className="text-sm text-slate-700 space-y-1 ml-4">
                    <li>
                      • Đảm bảo an toàn và an ninh cho hành khách trong suốt
                      chuyến bay;
                    </li>
                    <li>
                      • Thực hiện tất cả các nhiệm vụ và dịch vụ trong suốt
                      chuyến bay;
                    </li>
                    <li>
                      • Sử dụng kiến thức sơ cứu để hỗ trợ hành khách khi cần
                      thiết;
                    </li>
                    <li>• Các nhiệm vụ được giao khác.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">
                    🇺🇸 English:
                  </h4>
                  <ul className="text-sm text-slate-700 space-y-1 ml-4">
                    <li>
                      • Ensure the safety and security of passengers during the
                      flight;
                    </li>
                    <li>
                      • Perform all duties and services during the flight;
                    </li>
                    <li>
                      • Utilize first aid knowledge to assist passengers when
                      needed;
                    </li>
                    <li>• Other assigned tasks.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Job Requirements */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              📝 Yêu cầu công việc / Job Requirements
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-800 min-w-[120px]">
                    Trình độ học vấn:
                  </span>
                  <span className="text-slate-700">
                    Tốt nghiệp tối thiểu Trung học phổ thông trở lên
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-800 min-w-[120px]">
                    Tuổi:
                  </span>
                  <span className="text-slate-700">18 – 28 tuổi</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-800 min-w-[120px]">
                    Chiều cao & BMI:
                  </span>
                  <div className="text-slate-700">
                    <div>• Nữ: 160cm (chân trần); BMI từ 18,5 đến 22</div>
                    <div>• Nam: 170cm (chân trần); BMI từ 20 đến 25</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-800 min-w-[120px]">
                    Kỹ năng giao tiếp:
                  </span>
                  <span className="text-slate-700">
                    Giao tiếp và thuyết trình tiếng Anh tốt
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-800 min-w-[120px]">
                    Chứng chỉ tiếng Anh:
                  </span>
                  <div className="text-slate-700">
                    <div>TOEIC 500 điểm trở lên hoặc tương đương</div>
                    <div className="text-xs text-slate-600 mt-1">
                      (IELTS 4.0/TOEFL iBT 40/TOEFL ITP 450 hoặc Tốt nghiệp Đại
                      học chuyên ngành tiếng Anh)
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      * Không chấp nhận TOEFL iBT home edition và các chứng chỉ
                      không hậu kiểm được tại Việt Nam
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-800 min-w-[120px]">
                    Sức khỏe:
                  </span>
                  <span className="text-slate-700">
                    Đảm bảo sức khỏe đáp ứng quy định của Cục Hàng không Việt
                    Nam
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-800 min-w-[120px]">
                    Mắt:
                  </span>
                  <span className="text-slate-700">
                    Cân đối, không cận quá 3 độ, không lé, màu mắt hai bên đồng
                    đều
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-800 min-w-[120px]">
                    Răng:
                  </span>
                  <span className="text-slate-700">Không được niềng răng</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-800 min-w-[120px]">
                    Trang điểm:
                  </span>
                  <span className="text-slate-700">
                    Không sử dụng các loại bột, thạch hoặc các hình thức trang
                    điểm khác để che các vết sẹo / hình xăm trong quá trình ứng
                    tuyển
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-800 min-w-[120px]">
                    Đào tạo:
                  </span>
                  <span className="text-slate-700">
                    Sau khi vượt qua vòng phỏng vấn và được CabinCrew lựa chọn,
                    học viên tiếp viên phải hoàn thành khóa đào tạo ban đầu
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recruitment Process */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              🔄 Quy trình tuyển dụng / Recruitment Process
            </h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-800">
                      🇻🇳 Tiếng Việt:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        <span className="text-slate-700">
                          Kiểm tra hồ sơ: Ứng viên chuẩn bị CCCD để đối chiếu và
                          lấy số báo danh
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        <span className="text-slate-700">
                          Kiểm tra ngoại hình AI
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                        <span className="text-slate-700">
                          Cân đo chiều cao và BMI
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          4
                        </span>
                        <span className="text-slate-700">
                          Thi Catwalk - Phỏng vấn AI
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          5
                        </span>
                        <span className="text-slate-700">
                          Thi Tài năng (theo nhóm)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
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
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        <span className="text-slate-700">
                          Document Check: candidates bring the ID Card (Passport
                          for expat) for verification and candidate's number
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        <span className="text-slate-700">
                          AI Grooming Check
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                        <span className="text-slate-700">
                          Height and BMI Check
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          4
                        </span>
                        <span className="text-slate-700">
                          Catwalk - AI Interview
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          5
                        </span>
                        <span className="text-slate-700">
                          Talent Show (in groups)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
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
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              📅 Lịch tuyển dụng / Recruitment Schedule
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                <div className="bg-blue-100 border border-blue-300 rounded p-3 mt-3">
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
