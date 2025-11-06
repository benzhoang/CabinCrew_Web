
import { useLocation } from 'react-router-dom'


const formatDate = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return isoString
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

const mockRequest = {
    id: 0,
    code: 'REQ-XXXX',
    title: 'Yêu cầu tuyển dụng',
    proposer: 'Người đề xuất',
    position: 'Vị trí',
    department: 'Phòng ban',
    unit: 'Đơn vị',
    quantity: 0,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    description: 'Mô tả yêu cầu tuyển dụng'
}

const Section = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-sm font-semibold text-gray-900 mb-3">{title}</div>
        {children}
    </div>
)

const InfoRow = ({ label, value }) => (
    <div className="flex items-start gap-3">
        <div className="w-36 shrink-0 text-gray-500 text-sm">{label}</div>
        <div className="text-gray-900 text-sm">{value}</div>
    </div>
)

const RequestCampInfo = () => {
    const { state } = useLocation()
    const data = state?.request || mockRequest

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">{data.title || 'Chi tiết Yêu cầu tuyển dụng'}</h2>
                        <p className="text-slate-600">Mã yêu cầu: <span className="font-medium">{data.code}</span></p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-5">
                <Section title="Thông tin yêu cầu">
                    <div className="text-gray-900 font-medium">{data.proposer}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                        <InfoRow label="Vị trí tuyển" value={data.position} />
                        <InfoRow label="Phòng ban" value={data.department} />
                        <InfoRow label="Đơn vị" value={data.unit} />
                        <InfoRow label="Số lượng tuyển" value={data.quantity} />
                        <InfoRow label="Ngày bắt đầu" value={formatDate(data.startDate)} />
                        <InfoRow label="Ngày kết thúc" value={formatDate(data.endDate)} />
                    </div>

                    {/* Job Description */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">📋 Mô tả công việc / Job Description</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-800 mb-2">🇻🇳 Tiếng Việt:</h4>
                                    <ul className="text-sm text-slate-700 space-y-1 ml-4">
                                        <li>• Đảm bảo an toàn và an ninh cho hành khách trong suốt chuyến bay;</li>
                                        <li>• Thực hiện tất cả các nhiệm vụ và dịch vụ trong suốt chuyến bay;</li>
                                        <li>• Sử dụng kiến thức sơ cứu để hỗ trợ hành khách khi cần thiết;</li>
                                        <li>• Các nhiệm vụ được giao khác.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-800 mb-2">🇺🇸 English:</h4>
                                    <ul className="text-sm text-slate-700 space-y-1 ml-4">
                                        <li>• Ensure the safety and security of passengers during the flight;</li>
                                        <li>• Perform all duties and services during the flight;</li>
                                        <li>• Utilize first aid knowledge to assist passengers when needed;</li>
                                        <li>• Other assigned tasks.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Requirements */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">📝 Yêu cầu công việc / Job Requirements</h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="font-medium text-slate-800 min-w-[120px]">Trình độ học vấn:</span>
                                    <span className="text-slate-700">Tốt nghiệp tối thiểu Trung học phổ thông trở lên</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium text-slate-800 min-w-[120px]">Tuổi:</span>
                                    <span className="text-slate-700">18 – 28 tuổi</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium text-slate-800 min-w-[120px]">Chiều cao & BMI:</span>
                                    <div className="text-slate-700">
                                        <div>• Nữ: 160cm (chân trần); BMI từ 18,5 đến 22</div>
                                        <div>• Nam: 170cm (chân trần); BMI từ 20 đến 25</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium text-slate-800 min-w-[120px]">Kỹ năng giao tiếp:</span>
                                    <span className="text-slate-700">Giao tiếp và thuyết trình tiếng Anh tốt</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium text-slate-800 min-w-[120px]">Chứng chỉ tiếng Anh:</span>
                                    <div className="text-slate-700">
                                        <div>TOEIC 500 điểm trở lên hoặc tương đương</div>
                                        <div className="text-xs text-slate-600 mt-1">
                                            (IELTS 4.0/TOEFL iBT 40/TOEFL ITP 450 hoặc Tốt nghiệp Đại học chuyên ngành tiếng Anh)
                                        </div>
                                        <div className="text-xs text-red-600 mt-1">
                                            * Không chấp nhận TOEFL iBT home edition và các chứng chỉ không hậu kiểm được tại Việt Nam
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium text-slate-800 min-w-[120px]">Sức khỏe:</span>
                                    <span className="text-slate-700">Đảm bảo sức khỏe đáp ứng quy định của Cục Hàng không Việt Nam</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium text-slate-800 min-w-[120px]">Mắt:</span>
                                    <span className="text-slate-700">Cân đối, không cận quá 3 độ, không lé, màu mắt hai bên đồng đều</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium text-slate-800 min-w-[120px]">Răng:</span>
                                    <span className="text-slate-700">Không được niềng răng</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium text-slate-800 min-w-[120px]">Trang điểm:</span>
                                    <span className="text-slate-700">Không sử dụng các loại bột, thạch hoặc các hình thức trang điểm khác để che các vết sẹo / hình xăm trong quá trình ứng tuyển</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium text-slate-800 min-w-[120px]">Đào tạo:</span>
                                    <span className="text-slate-700">Sau khi vượt qua vòng phỏng vấn và được CabinCrew lựa chọn, học viên tiếp viên phải hoàn thành khóa đào tạo ban đầu</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recruitment Process */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">🔄 Quy trình tuyển dụng / Recruitment Process</h3>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-slate-800">🇻🇳 Tiếng Việt:</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                                <span className="text-slate-700">Kiểm tra hồ sơ: Ứng viên chuẩn bị CCCD để đối chiếu và lấy số báo danh</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                                <span className="text-slate-700">Kiểm tra ngoại hình AI</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                                <span className="text-slate-700">Cân đo chiều cao và BMI</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                                <span className="text-slate-700">Thi Catwalk - Phỏng vấn AI</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                                                <span className="text-slate-700">Thi Tài năng (theo nhóm)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                                                <span className="text-slate-700">Phỏng vấn Hội đồng</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-slate-800">🇺🇸 English:</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                                <span className="text-slate-700">Document Check: candidates bring the ID Card (Passport for expat) for verification and candidate's number</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                                <span className="text-slate-700">AI Grooming Check</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                                <span className="text-slate-700">Height and BMI Check</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                                <span className="text-slate-700">Catwalk - AI Interview</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                                                <span className="text-slate-700">Talent Show (in groups)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                                                <span className="text-slate-700">Panel Interview</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </Section>

            </div>
            <div className="mt-4 flex justify-end gap-3">
                <button
                    onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) {
                            console.log('Yêu cầu đã được duyệt')
                        }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                    Duyệt
                </button>
                <button
                    onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
                            console.log('Yêu cầu đã bị từ chối')
                        }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                    Từ chối
                </button>
            </div>
        </div>
    )
}

export default RequestCampInfo