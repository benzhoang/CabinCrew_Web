import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../Candidate/Footer'

const Apply = () => {
    const navigate = useNavigate()
    const { state } = useLocation()
    const campaign = state?.campaign

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
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

                                {/* Description */}
                                <div className="mt-6">
                                    <div className="text-sm text-slate-600 mb-1">Mô tả</div>
                                    <div className="text-slate-800 text-sm bg-slate-50 rounded-md p-3 border border-slate-200">
                                        {campaign.description || '—'}
                                    </div>
                                </div>

                                {/* Requirements */}
                                {Array.isArray(campaign.requirements) && campaign.requirements.length > 0 && (
                                    <div className="mt-4">
                                        <div className="text-sm text-slate-600 mb-1">Yêu cầu</div>
                                        <ul className="mt-2 flex flex-wrap gap-2">
                                            {campaign.requirements.map((r, idx) => (
                                                <li key={idx} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">{r}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

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
                                                        <button className="px-5 py-2.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-semibold">
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
            <Footer />
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

export default Apply

