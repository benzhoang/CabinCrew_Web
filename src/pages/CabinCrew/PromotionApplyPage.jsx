import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../Candidate/Footer'

const PromotionApplyPage = () => {
    const navigate = useNavigate()
    const { state } = useLocation()
    const campaign = state?.campaign

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {!campaign ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <p className="text-gray-600 mb-4">Không tìm thấy thông tin chiến dịch.</p>
                        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">Quay lại</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">Quay lại</button>
                        </div>
                        {/* Header */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">{campaign.name}</h1>
                                    <p className="text-sm text-slate-600 mt-1">{campaign.airline || '—'} • {campaign.location || '—'}</p>
                                </div>
                                <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-1 ${campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {campaign.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}
                                </span>
                            </div>
                            <div className="p-6">
                                {/* Overview grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <Info label="Vị trí" value={campaign.position || '—'} />
                                    <Info label="Hãng hàng không" value={campaign.airline || '—'} />
                                    <Info label="Địa điểm" value={campaign.location || '—'} />
                                    <Info label="Ngày bắt đầu" value={campaign.startDate || '—'} />
                                    <Info label="Ngày kết thúc" value={campaign.endDate || '—'} />
                                    <Info label="Chỉ tiêu" value={`${campaign.targetHires ?? '—'}`} />
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

                                {/* Recruitment Schedule */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">📅 Lịch tuyển dụng / Recruitment Schedule</h3>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">🤖</span>
                                                <div>
                                                    <div className="font-medium text-slate-800">CabinCrew áp dụng công nghệ AI</div>
                                                    <div className="text-slate-600">Tăng hiệu quả, cải thiện trải nghiệm ứng viên, số hóa dữ liệu, không giấy tờ và bảo vệ môi trường 🍃</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">📌</span>
                                                <div>
                                                    <div className="font-medium text-slate-800">Địa điểm: TP. Hồ Chí Minh</div>
                                                    <div className="text-slate-600">Học viện Hàng không CabinCrew</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">⏰</span>
                                                <div>
                                                    <div className="font-medium text-slate-800">Thời gian: 8:00 AM | Thứ Bảy, 01/11/2025</div>
                                                    <div className="text-slate-600">Saturday, November 1, 2025</div>
                                                </div>
                                            </div>
                                            <div className="bg-blue-100 border border-blue-300 rounded p-3 mt-3">
                                                <div className="text-xs text-blue-800">
                                                    <strong>Lưu ý:</strong> Lịch tuyển dụng có thể thay đổi trong một số trường hợp cụ thể.
                                                    Ứng viên vui lòng thường xuyên kiểm tra website chính thức CabinCrew Careers để cập nhật thông tin mới nhất.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Batches (đợt tuyển) - dùng fallback nếu không có */}
                                <div className="mt-6">
                                    <div className="text-sm text-slate-600 mb-2">Kế hoạch các đợt tuyển</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(Array.isArray(campaign.batches) && campaign.batches.length ? campaign.batches : [
                                            {
                                                name: 'Đợt 1',
                                                time: `${campaign.startDate || '2025-10-01'} - ${campaign.endDate || '2025-10-15'}`,
                                                location: campaign.location || 'Hà Nội',
                                                method: 'Trực tiếp',
                                                status: 'completed',
                                                owner: 'HR Team A',
                                                description: 'Tuyển dụng trực tiếp tại văn phòng Hà Nội',
                                                slots: 50,
                                                applied: 45
                                            },
                                            {
                                                name: 'Đợt 2',
                                                time: '2025-11-01 - 2025-11-20',
                                                location: 'TP.HCM',
                                                method: 'Trực tiếp + Online',
                                                status: 'ongoing',
                                                owner: 'HR Team B',
                                                description: 'Tuyển dụng kết hợp trực tiếp và online tại TP.HCM',
                                                slots: 80,
                                                applied: 32
                                            },
                                            {
                                                name: 'Đợt 3',
                                                time: '2025-12-01 - 2025-12-15',
                                                location: 'Đà Nẵng',
                                                method: 'Online',
                                                status: 'upcoming',
                                                owner: 'HR Team C',
                                                description: 'Tuyển dụng online cho khu vực miền Trung',
                                                slots: 30,
                                                applied: 0
                                            }
                                        ]).map((b, i) => (
                                            <div key={i} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                                                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                                    <div className="text-sm font-semibold text-slate-800">{b.name}</div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'completed' ? 'bg-red-100 text-red-700' :
                                                        b.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {b.status === 'completed' ? 'Đã hoàn thành' :
                                                            b.status === 'ongoing' ? 'Đang diễn ra' :
                                                                'Sắp diễn ra'}
                                                    </span>
                                                </div>
                                                <div className="p-4 space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                        <InfoMini label="Thời gian" value={b.time || '—'} />
                                                        <InfoMini label="Địa điểm" value={b.location || '—'} />
                                                        <InfoMini label="Hình thức" value={b.method || '—'} />
                                                        {b.owner && <InfoMini label="Phụ trách" value={b.owner} />}
                                                        {b.slots && <InfoMini label="Số lượng tuyển" value={`${b.slots} người`} />}
                                                        {b.applied !== undefined && <InfoMini label="Đã ứng tuyển" value={`${b.applied} người`} />}
                                                    </div>
                                                    {b.description && (
                                                        <div className="text-xs">
                                                            <div className="text-slate-500 mb-1">Mô tả</div>
                                                            <div className="text-slate-700 bg-slate-50 p-2 rounded border">{b.description}</div>
                                                        </div>
                                                    )}
                                                    {b.slots && b.applied !== undefined && (
                                                        <div className="text-xs">
                                                            <div className="text-slate-500 mb-1">Tiến độ ứng tuyển</div>
                                                            <div className="bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${Math.min((b.applied / b.slots) * 100, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="text-slate-600 mt-1">{b.applied}/{b.slots} ({Math.round((b.applied / b.slots) * 100)}%)</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="px-4 pb-4 pt-0 flex items-center justify-end">
                                                    {b.status === 'ongoing' && (
                                                        <button
                                                            onClick={() => navigate('/application-form', { state: { campaign: campaign, batch: b } })}
                                                            className="px-5 py-2.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
                                                        >
                                                            Ứng tuyển ngay
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const Info = ({ label, value }) => (
    <div>
        <div className="text-sm text-slate-600">{label}</div>
        <div className="font-medium text-slate-800">{value}</div>
    </div>
)

const InfoMini = ({ label, value }) => (
    <div>
        <div className="text-slate-500">{label}</div>
        <div className="text-slate-800 font-medium">{value}</div>
    </div>
)

export default PromotionApplyPage

