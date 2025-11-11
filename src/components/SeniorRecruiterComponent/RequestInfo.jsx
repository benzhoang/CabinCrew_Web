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

const Section = ({ title, children }) => (
  <div className="p-5 bg-white border border-gray-200 rounded-xl">
    <div className="mb-3 text-sm font-semibold text-gray-900">{title}</div>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-sm text-gray-500 w-36 shrink-0">{label}</div>
    <div className="text-sm text-gray-900">{value}</div>
  </div>
);

const RequestInfo = () => {
  const { state } = useLocation();
  const data = state?.request || mockCampaign;

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 gap-5">
        <Section title="Thông tin đề xuất">
          <div className="font-medium text-gray-900">{data.proposer}</div>
          <div className="grid grid-cols-1 gap-5 mt-4 md:grid-cols-2">
            <>
              <InfoRow label="Vị trí tuyển" value={data.position} />
              <InfoRow label="Phòng ban" value={data.department} />
              <InfoRow label="Đơn vị" value={data.unit} />
              <InfoRow label="Số lượng tuyển" value={data.quantity} />
            </>
          </div>

          {/* Job Description */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              📋 Mô tả công việc / Job Description
            </h3>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium text-slate-800">
                    🇻🇳 Tiếng Việt:
                  </h4>
                  <ul className="ml-4 space-y-1 text-sm text-slate-700">
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
                  <h4 className="mb-2 font-medium text-slate-800">
                    🇺🇸 English:
                  </h4>
                  <ul className="ml-4 space-y-1 text-sm text-slate-700">
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
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              📝 Yêu cầu công việc / Job Requirements
            </h3>
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
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
                    <div className="mt-1 text-xs text-slate-600">
                      (IELTS 4.0/TOEFL iBT 40/TOEFL ITP 450 hoặc Tốt nghiệp Đại
                      học chuyên ngành tiếng Anh)
                    </div>
                    <div className="mt-1 text-xs text-red-600">
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
        </Section>
      </div>
    </div>
  );
};

export default RequestInfo;
