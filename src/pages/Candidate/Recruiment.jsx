import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'

// Mock campaigns - hiển thị cho Candidate, chỉ các chiến dịch đang diễn ra
const mockCampaigns = [
    {
        id: 1,
        name: 'Tuyển dụng Tiếp viên Hàng không 2025',
        airline: 'Vietnam Airlines',
        position: 'Flight Attendant',
        location: 'Hà Nội, TP.HCM',
        status: 'active',
        startDate: '2025-09-01',
        endDate: '2025-10-31',
        description: 'Cơ hội trở thành tiếp viên hàng không chuyên nghiệp.',
        requirements: ['Tiếng Anh tốt', 'Ngoại hình ưa nhìn', 'Sức khỏe tốt']
    },
    {
        id: 2,
        name: 'Ground Staff Intake',
        airline: 'Bamboo Airways',
        position: 'Ground Staff',
        location: 'Đà Nẵng',
        status: 'active',
        startDate: '2025-09-15',
        endDate: '2025-11-15',
        description: 'Tuyển dụng nhân viên mặt đất phụ trách làm thủ tục.',
        requirements: ['Giao tiếp tốt', 'Ca kíp linh hoạt']
    },
    {
        id: 3,
        name: 'Pilot Cadet Program',
        airline: 'VietJet Air',
        position: 'Pilot Cadet',
        location: 'TP.HCM',
        status: 'completed',
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        description: 'Chương trình học viên phi công đã kết thúc.',
        requirements: []
    },
    {
        id: 4,
        name: 'Customer Service Expansion',
        airline: 'Pacific Airlines',
        position: 'Customer Service Agent',
        location: 'Hà Nội',
        status: 'active',
        startDate: '2025-09-20',
        endDate: '2025-11-30',
        description: 'Mở rộng đội ngũ chăm sóc khách hàng tại sân bay Nội Bài.',
        requirements: ['Kỹ năng giao tiếp', 'Tiếng Anh tốt', 'Xử lý tình huống']
    }
]

const Recruiment = () => {
    const [search, setSearch] = useState('')
    const [airline, setAirline] = useState('all')
    const [status, setStatus] = useState('all') // all | active
    const [langVersion, setLangVersion] = useState(0)
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
                c.position.toLowerCase().includes(q) ||
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
                    <h1 className="text-3xl font-bold text-slate-800">{t('recruitment')}</h1>
                    <p className="text-slate-600 mt-1">Khám phá các chiến dịch tuyển dụng đang diễn ra</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm</label>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm theo tên, vị trí, hãng bay, địa điểm"
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
                                        <span className="text-slate-500">Vị trí</span>
                                        <p className="font-medium text-slate-800">{c.position}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Thời gian</span>
                                        <p className="font-medium text-slate-800">{c.startDate} - {c.endDate}</p>
                                    </div>
                                </div>
                                <p className="text-slate-700 text-sm mt-4">{c.description}</p>
                                {c.requirements?.length > 0 && (
                                    <ul className="mt-3 flex flex-wrap gap-2">
                                        {c.requirements.map((r, idx) => (
                                            <li key={idx} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">{r}</li>
                                        ))}
                                    </ul>
                                )}
                                <div className="mt-5 flex items-center gap-3">
                                    <button
                                        onClick={() => navigate('/apply', { state: { campaign: c } })}
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
                        Không có chiến dịch phù hợp.
                    </div>
                )}
            </div>
        </div>
    )
}

export default Recruiment

