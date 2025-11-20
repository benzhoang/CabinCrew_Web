import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'
import { getCampaigns } from '../../service/api'
import { convertDateFormat } from '../../config/formatDate'

const formatDateDisplay = value => {
    if (!value) return '—'

    const tryParse = dateString => {
        const date = new Date(dateString)
        return Number.isNaN(date.getTime()) ? null : date
    }

    const directDate = tryParse(value)
    if (directDate) {
        return directDate.toLocaleDateString('vi-VN')
    }

    const converted = convertDateFormat(value)
    if (converted) {
        const convertedDate = tryParse(converted)
        if (convertedDate) {
            return convertedDate.toLocaleDateString('vi-VN')
        }
    }

    return value
}

const normalizeRequirements = requirements => {
    if (!requirements) return []
    if (Array.isArray(requirements)) {
        return requirements.filter(Boolean)
    }
    if (typeof requirements === 'string') {
        return requirements
            .split(/[\n,;•]/)
            .map(item => item.trim())
            .filter(Boolean)
    }
    return []
}

const mapStatusForCandidate = status => {
    const normalized = (status || '').toString().trim().toLowerCase()
    if (['ongoing', 'active', 'approved', 'upcoming', 'inprogress', 'in_progress', 'scheduled'].includes(normalized)) {
        return 'active'
    }
    return 'inactive'
}

const transformCampaign = campaign => {
    if (!campaign) return null
    const id = campaign.id ?? campaign.campaignId ?? campaign.campaignID ?? campaign.Id
    if (!id) return null

    return {
        id,
        name: campaign.name ?? campaign.campaignName ?? 'Chiến dịch tuyển dụng',
        airline: campaign.partnerName ?? campaign.airline ?? campaign.airlineName ?? 'Đối tác chưa cập nhật',
        position: campaign.position ?? campaign.role ?? campaign.campaignType ?? 'Vị trí chưa cập nhật',
        location: campaign.location ?? campaign.city ?? campaign.address ?? campaign.locationName ?? 'Chưa cập nhật',
        status: mapStatusForCandidate(campaign.status),
        rawStatus: campaign.status ?? '',
        startDate: formatDateDisplay(campaign.startDate),
        endDate: formatDateDisplay(campaign.endDate),
        description: campaign.description ?? '',
        requirements: normalizeRequirements(campaign.requirements ?? campaign.requirement),
        targetHires: campaign.targetQuantity ?? campaign.targetHires ?? campaign.targetParticipants ?? campaign.targetNumber ?? 0,
        batches: campaign.batches ?? []
    }
}

const Recruiment = () => {
    const [search, setSearch] = useState('')
    const [airline, setAirline] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all') // all | active
    const [langVersion, setLangVersion] = useState(0)
    const [campaigns, setCampaigns] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const off = onLangChange(() => setLangVersion(v => v + 1))
        return () => off()
    }, [])

    const fetchCampaigns = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await getCampaigns({ pageSize: 100 })
            if (response.success && Array.isArray(response.data)) {
                const normalized = response.data.map(transformCampaign).filter(Boolean)
                setCampaigns(normalized)
            } else {
                setCampaigns([])
                setError(response.error || 'Không thể lấy danh sách chiến dịch')
            }
        } catch (err) {
            setCampaigns([])
            setError(err.message || 'Không thể lấy danh sách chiến dịch')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCampaigns()
    }, [fetchCampaigns])

    const baseCampaigns = useMemo(
        () => (statusFilter === 'active' ? campaigns.filter(c => c.status === 'active') : campaigns),
        [statusFilter, campaigns]
    )

    const filtered = useMemo(() => {
        let data = baseCampaigns
        if (airline !== 'all') data = data.filter(c => c.airline === airline)
        if (search) {
            const q = search.toLowerCase()
            data = data.filter(c =>
                (c.name || '').toLowerCase().includes(q) ||
                (c.position || '').toLowerCase().includes(q) ||
                (c.location || '').toLowerCase().includes(q) ||
                (c.airline || '').toLowerCase().includes(q)
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
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Tất cả</option>
                                <option value="active">Đang diễn ra</option>
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <span>{error}</span>
                        <button
                            onClick={fetchCampaigns}
                            className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading && (
                        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-12 text-center text-slate-500">
                            Đang tải danh sách chiến dịch...
                        </div>
                    )}
                    {!isLoading && filtered.map(c => (
                        <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800">{c.name}</h3>
                                        <p className="text-sm text-slate-600 mt-1">
                                            {c.airline}
                                            {c.location && c.location !== 'Chưa cập nhật' && ` • ${c.location}`}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-1 ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {c.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}
                                    </span>
                                </div>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-500">Vị trí</span>
                                        <p className="font-medium text-slate-800">{c.position}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Ngày bắt đầu</span>
                                        <p className="font-medium text-slate-800">{c.startDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Ngày kết thúc</span>
                                        <p className="font-medium text-slate-800">{c.endDate}</p>
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

                {!isLoading && filtered.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-slate-500">
                        Không có chiến dịch phù hợp.
                    </div>
                )}
            </div>
        </div>
    )
}

export default Recruiment

