import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onLangChange } from '../../i18n'

// Mock promotion campaigns - hiển thị cho Cabin Crew, các chiến dịch nâng bậc nội bộ
const mockCampaigns = [
    {
        id: 1,
        name: 'Chiến dịch nâng bậc Senior Flight Attendant 2025',
        airline: 'Vietnam Airlines',
        currentPosition: 'Flight Attendant',
        targetPosition: 'Senior Flight Attendant',
        location: 'Hà Nội, TP.HCM',
        status: 'active',
        startDate: '2025-09-01',
        endDate: '2025-10-31',
        description: 'Cơ hội thăng tiến lên vị trí Senior Flight Attendant cho các tiếp viên có kinh nghiệm.',
        requirements: ['Kinh nghiệm tối thiểu 3 năm', 'Đánh giá xuất sắc', 'Chứng chỉ an toàn bay'],
        promotionCriteria: ['Thời gian làm việc: 3+ năm', 'Điểm đánh giá: 4.5/5', 'Hoàn thành khóa đào tạo nâng cao'],
        benefits: ['Tăng lương 20%', 'Phụ cấp trách nhiệm', 'Cơ hội đào tạo quốc tế']
    },
    {
        id: 2,
        name: 'Chương trình nâng bậc Purser',
        airline: 'Bamboo Airways',
        currentPosition: 'Senior Flight Attendant',
        targetPosition: 'Purser',
        location: 'Đà Nẵng, TP.HCM',
        status: 'active',
        startDate: '2025-09-15',
        endDate: '2025-11-15',
        description: 'Thăng tiến lên vị trí Purser - trưởng nhóm tiếp viên trên chuyến bay.',
        requirements: ['Kinh nghiệm Senior FA 2+ năm', 'Kỹ năng lãnh đạo', 'Tiếng Anh lưu loát'],
        promotionCriteria: ['Kinh nghiệm Senior FA: 2+ năm', 'Đánh giá lãnh đạo: Xuất sắc', 'Chứng chỉ quản lý'],
        benefits: ['Tăng lương 30%', 'Phụ cấp trưởng nhóm', 'Quyền lợi đặc biệt']
    },
    {
        id: 3,
        name: 'Nâng bậc Chief Purser',
        airline: 'VietJet Air',
        currentPosition: 'Purser',
        targetPosition: 'Chief Purser',
        location: 'TP.HCM',
        status: 'completed',
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        description: 'Chương trình nâng bậc Chief Purser đã kết thúc.',
        requirements: ['Kinh nghiệm Purser 3+ năm', 'Bằng cấp quản lý', 'Thành tích xuất sắc'],
        promotionCriteria: ['Kinh nghiệm Purser: 3+ năm', 'Bằng quản lý hàng không', 'Đánh giá xuất sắc'],
        benefits: ['Tăng lương 40%', 'Quyền lợi quản lý', 'Cơ hội phát triển nghề nghiệp']
    },
    {
        id: 4,
        name: 'Chương trình nâng bậc Inflight Supervisor',
        airline: 'Pacific Airlines',
        currentPosition: 'Senior Flight Attendant',
        targetPosition: 'Inflight Supervisor',
        location: 'Hà Nội',
        status: 'active',
        startDate: '2025-09-20',
        endDate: '2025-11-30',
        description: 'Thăng tiến lên vị trí giám sát dịch vụ trên không.',
        requirements: ['Kinh nghiệm 5+ năm', 'Kỹ năng giám sát', 'Chứng chỉ đào tạo'],
        promotionCriteria: ['Kinh nghiệm: 5+ năm', 'Kỹ năng giám sát: Tốt', 'Hoàn thành khóa quản lý'],
        benefits: ['Tăng lương 25%', 'Phụ cấp giám sát', 'Cơ hội đào tạo chuyên sâu']
    }
]

const PromotionPage = () => {
    const [search, setSearch] = useState('')
    const [airline, setAirline] = useState('all')
    const [status, setStatus] = useState('all') // all | active
    const [, setLangVersion] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        const off = onLangChange(() => setLangVersion(v => v + 1))
        return () => off()
    }, [])

    const baseCampaigns = useMemo(
        () => (status === 'active' ? mockCampaigns.filter(c => c.status === 'active') : mockCampaigns),
        [status]
    )

    const filtered = useMemo(() => {
        let data = baseCampaigns
        if (airline !== 'all') data = data.filter(c => c.airline === airline)
        if (search) {
            const q = search.toLowerCase()
            data = data.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.currentPosition.toLowerCase().includes(q) ||
                c.targetPosition.toLowerCase().includes(q) ||
                c.location.toLowerCase().includes(q) ||
                c.airline.toLowerCase().includes(q)
            )
        }
        return data
    }, [baseCampaigns, airline, search])

    const airlines = useMemo(() => {
        const set = new Set(baseCampaigns.map(c => c.airline))
        return ['all', ...Array.from(set)]
    }, [baseCampaigns])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Chiến dịch nâng bậc</h1>
                    <p className="text-slate-600 mt-1">Khám phá các cơ hội thăng tiến nghề nghiệp</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm</label>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm theo tên chiến dịch, vị trí hiện tại, vị trí mục tiêu, hãng bay"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Hãng hàng không</label>
                            <select
                                value={airline}
                                onChange={e => setAirline(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {airlines.map(a => (
                                    <option key={a} value={a}>{a === 'all' ? 'Tất cả' : a}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Tất cả</option>
                                <option value="active">Đang diễn ra</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(c => (
                        <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800">{c.name}</h3>
                                        <p className="text-sm text-slate-600 mt-1">{c.airline} • {c.location}</p>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-1 ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {c.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}
                                    </span>
                                </div>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-500">Vị trí hiện tại</span>
                                        <p className="font-medium text-slate-800">{c.currentPosition}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Vị trí mục tiêu</span>
                                        <p className="font-medium text-blue-600">{c.targetPosition}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Thời gian</span>
                                        <p className="font-medium text-slate-800">{c.startDate} - {c.endDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Hãng hàng không</span>
                                        <p className="font-medium text-slate-800">{c.airline}</p>
                                    </div>
                                </div>
                                <p className="text-slate-700 text-sm mt-4">{c.description}</p>
                                
                                {c.requirements?.length > 0 && (
                                    <div className="mt-3">
                                        <span className="text-sm font-medium text-slate-600">Yêu cầu:</span>
                                        <ul className="mt-1 flex flex-wrap gap-2">
                                            {c.requirements.map((r, idx) => (
                                                <li key={idx} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">{r}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {c.promotionCriteria?.length > 0 && (
                                    <div className="mt-3">
                                        <span className="text-sm font-medium text-slate-600">Tiêu chí nâng bậc:</span>
                                        <ul className="mt-1 flex flex-wrap gap-2">
                                            {c.promotionCriteria.map((criteria, idx) => (
                                                <li key={idx} className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-1">{criteria}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {c.benefits?.length > 0 && (
                                    <div className="mt-3">
                                        <span className="text-sm font-medium text-slate-600">Quyền lợi:</span>
                                        <ul className="mt-1 flex flex-wrap gap-2">
                                            {c.benefits.map((benefit, idx) => (
                                                <li key={idx} className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-1">{benefit}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="mt-5 flex items-center gap-3">
                                    <button
                                        onClick={() => navigate('/cabin-crew/promotion/apply', { state: { campaign: c } })}
                                        className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                                    >
                                       Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-slate-500">
                        Không có chiến dịch nâng bậc phù hợp.
                    </div>
                )}
            </div>
        </div>
    )
}

export default PromotionPage;

