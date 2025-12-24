import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'
import { getCampaigns, getAirlinePartners } from '../../service/api'
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

const getAirlineBadgeClass = (airline) => {
    if (!airline) return "bg-gray-100 text-gray-700 border-gray-200";

    const airlineLower = airline.toLowerCase().trim();

    if (airlineLower.includes("vietjet")) {
        return "bg-red-100 text-red-700 border-red-200";
    }
    if (airlineLower.includes("vietnam airlines")) {
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
    if (airlineLower.includes("bamboo")) {
        return "bg-cyan-100 text-cyan-700 border-cyan-200";
    }
    if (
        airlineLower.includes("sun phuquoc") ||
        airlineLower.includes("sunphuquoc")
    ) {
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
};

const getPositionBadgeClass = (position) => {
    if (!position) return "bg-gray-100 text-gray-700 border-gray-200";

    const positionLower = position.toLowerCase().trim();

    if (positionLower.includes("purser")) {
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
    if (positionLower.includes("cabin crew") || positionLower.includes("cabincrew")) {
        return "bg-teal-100 text-teal-700 border-teal-200";
    }
    if (positionLower.includes("flight attendant") || positionLower.includes("flightattendant")) {
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
    if (positionLower.includes("pilot") || positionLower.includes("captain")) {
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
};

const transformCampaign = campaign => {
    if (!campaign) return null
    const id = campaign.id ?? campaign.campaignId ?? campaign.campaignID ?? campaign.Id
    if (!id) return null

    return {
        id,
        name: campaign.name ?? campaign.campaignName ?? 'Chiến dịch tuyển dụng',
        airline: campaign.partnerName ?? campaign.airline ?? campaign.airlineName ?? 'Đối tác chưa cập nhật',
        position: campaign.position ?? campaign.role ?? campaign.campaignType ?? 'Loại chưa cập nhật',
        location: campaign.location ?? campaign.city ?? campaign.address ?? campaign.locationName ?? 'Chưa cập nhật',
        status: mapStatusForCandidate(campaign.status),
        rawStatus: campaign.status ?? '',
        campaignType: campaign.campaignType ?? '',
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
    const [langVersion, setLangVersion] = useState(0)
    const [campaigns, setCampaigns] = useState([])
    const [airlinePartners, setAirlinePartners] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingPartners, setIsLoadingPartners] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 4,
        totalRecords: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
    })
    const navigate = useNavigate()

    useEffect(() => {
        const off = onLangChange(() => setLangVersion(v => v + 1))
        return () => off()
    }, [])

    // Fetch airline partners
    const fetchAirlinePartners = useCallback(async () => {
        setIsLoadingPartners(true)
        try {
            const res = await getAirlinePartners()
            if (res.success && Array.isArray(res.data)) {
                // Chỉ lấy partnerId và partnerName
                const partners = res.data.map(partner => ({
                    partnerId: partner?.partnerId ?? partner?.id ?? null,
                    partnerName: partner?.partnerName || partner?.name || ''
                })).filter(p => p.partnerId && p.partnerName)
                setAirlinePartners(partners)
            } else {
                console.error('Failed to fetch airline partners:', res.error)
                setAirlinePartners([])
            }
        } catch (err) {
            console.error('Error fetching airline partners:', err)
            setAirlinePartners([])
        } finally {
            setIsLoadingPartners(false)
        }
    }, [])

    // Load airline partners on mount
    useEffect(() => {
        fetchAirlinePartners()
    }, [fetchAirlinePartners])

    const fetchCampaigns = useCallback(async (page = 1, searchTerm = '') => {
        setIsLoading(true)
        setError(null)
        try {
            // Chuẩn bị params theo format API yêu cầu:
            // campaignType: integer (1: Recruitment, 2: Promotion)
            // campaignStatus: integer (0: Draft, 1: Pending, 2: Approved, 3: Rejected, 4: Cancelled, 5: Ongoing, 6: Upcoming, 7: Ended)
            const params = {
                page: page,
                pageSize: pagination.pageSize,
                campaignType: 1, // 1 = Recruitment
                campaignStatus: 5, // 5 = Ongoing
            }

            // Thêm searchTerm nếu có
            if (searchTerm && searchTerm.trim()) {
                params.searchTerm = searchTerm.trim()
            }

            // Gọi API với params đúng format
            const response = await getCampaigns(params)

            // Xử lý response theo cấu trúc: {code: 0, message: "string", data: {items: [...], pagination: {...}}}
            if (response.success && Array.isArray(response.data)) {
                // Transform data
                const normalized = response.data
                    .map(transformCampaign)
                    .filter(Boolean)
                setCampaigns(normalized)

                // Cập nhật pagination nếu có
                if (response.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        currentPage: response.pagination.currentPage || page,
                        pageSize: response.pagination.pageSize || prev.pageSize,
                        totalRecords: response.pagination.totalRecords || 0,
                        totalPages: response.pagination.totalPages || 0,
                        hasNextPage: response.pagination.hasNextPage !== undefined ? response.pagination.hasNextPage : false,
                        hasPreviousPage: response.pagination.hasPreviousPage !== undefined ? response.pagination.hasPreviousPage : false
                    }))
                } else {
                    // Nếu không có pagination từ API, tính toán dựa trên số lượng items
                    const totalItems = normalized.length
                    setPagination(prev => ({
                        ...prev,
                        currentPage: page,
                        totalRecords: totalItems,
                        totalPages: Math.ceil(totalItems / prev.pageSize),
                        hasNextPage: page * prev.pageSize < totalItems,
                        hasPreviousPage: page > 1
                    }))
                }
            } else {
                setCampaigns([])
                setError(response.error || response.message || 'Không thể lấy danh sách chiến dịch')
                setPagination(prev => ({
                    ...prev,
                    currentPage: 1,
                    totalRecords: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false
                }))
            }
        } catch (err) {
            setCampaigns([])
            // Xử lý lỗi từ API response
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.errorMessage ||
                err.message ||
                'Không thể lấy danh sách chiến dịch'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [pagination.pageSize])

    // Gọi API khi component mount
    useEffect(() => {
        fetchCampaigns(1, '')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Chỉ gọi một lần khi mount

    // Debounce search để tránh gọi API quá nhiều
    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination(prev => ({ ...prev, currentPage: 1 }))
            fetchCampaigns(1, search)
        }, 500) // Đợi 500ms sau khi user ngừng gõ

        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search])

    const filtered = useMemo(() => {
        let data = campaigns
        if (airline !== 'all') {
            // Filter by partnerName
            data = data.filter(c => c.airline === airline)
        }
        return data
    }, [campaigns, airline])

    const airlines = useMemo(() => {
        // Lấy danh sách từ airlinePartners API
        const partnerNames = airlinePartners.map(p => p.partnerName).filter(Boolean)
        return ['all', ...partnerNames]
    }, [airlinePartners])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">{t('recruitment')}</h1>
                    <p className="text-slate-600 mt-1">{t('recruitment_subtitle')}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('recruitment_search_label')}</label>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={t('recruitment_search_placeholder')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('recruitment_airline_label')}</label>
                            <select
                                value={airline}
                                onChange={e => setAirline(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoadingPartners}
                            >
                                {isLoadingPartners ? (
                                    <option value="all">Loading airlines...</option>
                                ) : (
                                    airlines.map(a => (
                                        <option key={a} value={a}>{a === 'all' ? t('recruitment_airline_all') : a}</option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <span>{error || t('recruitment_fetch_error')}</span>
                        <button
                            onClick={fetchCampaigns}
                            className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                        >
                            {t('retry')}
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading && (
                        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-sm text-gray-600">
                                {t('loading_campaigns') || t('loading_data') || 'Loading campaigns...'}
                            </p>
                        </div>
                    )}
                    {!isLoading && filtered.map(c => (
                        <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800">{c.name}</h3>
                                        {c.airline && (
                                            <span
                                                className={`inline-flex items-center mt-1 rounded-full border text-xs font-medium px-2.5 py-1 ${getAirlineBadgeClass(
                                                    c.airline
                                                )}`}
                                            >
                                                {c.airline}
                                            </span>
                                        )}
                                        {c.location && c.location !== 'Chưa cập nhật' && (
                                            <p className="text-sm text-slate-600 mt-1">
                                                {c.location}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`inline-flex items-center flex-shrink-0 whitespace-nowrap rounded-full text-xs font-medium px-2.5 py-1 ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {c.status === 'active' ? t('recruitment_status_active') : t('recruitment_status_inactive')}
                                    </span>
                                </div>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-500">{t('campaign_type') || 'Loại'}</span>
                                        <div className="mt-1">
                                            <span
                                                className={`inline-flex items-center rounded-full border text-xs font-medium px-2.5 py-1 ${getPositionBadgeClass(
                                                    c.position
                                                )}`}
                                            >
                                                {c.position}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">{t('start_date')}</span>
                                        <p className="font-medium text-slate-800">{c.startDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">{t('end_date')}</span>
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
                                        onClick={() => navigate(`/apply/${c.id}`, { state: { campaign: c } })}
                                        className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                                    >
                                        {t('view_details')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!isLoading && filtered.length === 0 && !error && (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-slate-500">
                        {t('recruitment_no_campaigns')}
                    </div>
                )}

                {/* Phân trang */}
                {!isLoading && campaigns.length > 0 && pagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <button
                            onClick={() => {
                                const newPage = pagination.currentPage - 1
                                setPagination(prev => ({ ...prev, currentPage: newPage }))
                                fetchCampaigns(newPage, search)
                            }}
                            disabled={!pagination.hasPreviousPage || pagination.currentPage === 1}
                            className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                        >
                            {t('pagination_prev')}
                        </button>
                        <span className="px-4 py-2 text-slate-700">
                            {t('pagination_page')} {pagination.currentPage} / {pagination.totalPages} ({pagination.totalRecords} {t('campaigns_label')})
                        </span>
                        <button
                            onClick={() => {
                                const newPage = pagination.currentPage + 1
                                setPagination(prev => ({ ...prev, currentPage: newPage }))
                                fetchCampaigns(newPage, search)
                            }}
                            disabled={!pagination.hasNextPage || pagination.currentPage >= pagination.totalPages}
                            className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                        >
                            {t('pagination_next')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Recruiment

