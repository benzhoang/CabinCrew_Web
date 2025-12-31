import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'
import { getCampaigns, getAirlinePartners } from '../../service/api'
import { formatDate } from '../../config/formatDate.js'

// StatusBadge component - supports all status values returned by the API
const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        const normalized = (status || '').toString().trim()
        // Keep case-sensitive to match API exactly
        switch (normalized) {
            case 'Ongoing':
                return {
                    className: 'bg-green-100 text-green-800 border-green-300',
                    text: 'Ongoing',
                }
            case 'Pending':
                return {
                    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    text: 'Pending',
                }
            case 'Approved':
                return {
                    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    text: 'Approved',
                }
            case 'Rejected':
                return {
                    className: 'bg-red-100 text-red-700 border-red-200',
                    text: 'Rejected',
                }
            case 'Upcoming':
                return {
                    className: 'bg-purple-100 text-purple-700 border-purple-200',
                    text: 'Upcoming',
                }
            case 'Ended':
                return {
                    className: 'bg-gray-100 text-gray-700 border-gray-200',
                    text: 'Ended',
                }
            case 'Draft':
                return {
                    className: 'bg-slate-100 text-slate-600 border-slate-200',
                    text: 'Planning',
                }
            case 'Canceled':
                return {
                    className: 'bg-orange-100 text-orange-700 border-orange-200',
                    text: 'Canceled',
                }
            // Backward compatibility for legacy lowercase values
            case 'ongoing':
            case 'active':
                return {
                    className: 'bg-green-100 text-green-800 border-green-300',
                    text: 'Ongoing',
                }
            case 'pending':
                return {
                    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    text: 'Pending',
                }
            case 'approved':
                return {
                    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    text: 'Approved',
                }
            case 'rejected':
                return {
                    className: 'bg-red-100 text-red-700 border-red-200',
                    text: 'Rejected',
                }
            case 'completed':
            case 'ended':
                return {
                    className: 'bg-gray-100 text-gray-700 border-gray-200',
                    text: 'Ended',
                }
            case 'canceled':
            case 'cancelled':
                return {
                    className: 'bg-orange-100 text-orange-700 border-orange-200',
                    text: 'Canceled',
                }
            default:
                return {
                    className: 'bg-gray-100 text-gray-600 border-gray-200',
                    text: normalized || 'Unknown',
                }
        }
    }

    const config = getStatusConfig(status)

    return (
        <span
            className={`${config.className} inline-block rounded-full border px-2 py-0.5 text-xs font-medium`}
        >
            {config.text}
        </span>
    )
}

// Helper function to map campaignType to English label
const getCampaignTypeLabel = (campaignType) => {
    const normalized = (campaignType || '').toString().trim().toLowerCase()
    switch (normalized) {
        case 'recruitment':
        case 'tuyển dụng':
            return 'Recruitment'
        case 'promotion':
        case 'thăng bậc':
            return 'Promotion'
        default:
            return 'Unknown'
    }
}

// CampaignTypeBadge component similar to CampaignList.jsx
const CampaignTypeBadge = ({ type }) => {
    const label = getCampaignTypeLabel(type)
    const normalized = (type || '').toString().trim().toLowerCase()
    const className =
        normalized === 'promotion' || normalized === 'thăng bậc'
            ? 'bg-purple-100 text-purple-800 border-purple-300'
            : normalized === 'recruitment' || normalized === 'tuyển dụng'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-gray-100 text-gray-800 border-gray-300'

    return (
        <span
            className={`${className} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`}
        >
            {label}
        </span>
    )
}

// PositionBadge component
const PositionBadge = ({ position }) => {
    const getPositionColor = (position) => {
        if (!position) return "bg-gray-100 text-gray-800 border-gray-300";

        const pos = position.toLowerCase();
        if (pos.includes("purser")) {
            return "bg-orange-100 text-orange-800 border-orange-300";
        } else if (pos.includes("cabin crew")) {
            return "bg-teal-100 text-teal-800 border-teal-300";
        }
        return "bg-gray-100 text-gray-800 border-gray-300";
    }

    return (
        <span
            className={`${getPositionColor(position)} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`}
        >
            {position || 'Undetermined'}
        </span>
    )
}

// PartnerBadge component
const PartnerBadge = ({ partnerName }) => {
    const getPartnerColor = (partnerName) => {
        if (!partnerName) return "bg-gray-100 text-gray-800 border-gray-300";

        const partner = partnerName.toLowerCase();
        if (
            partner.includes("vietnam airlines") ||
            partner.includes("vietnamairlines")
        ) {
            return "bg-yellow-100 text-yellow-800 border-yellow-300";
        } else if (partner.includes("vietjet") || partner.includes("viet jet")) {
            return "bg-red-100 text-red-800 border-red-300";
        } else if (
            partner.includes("bamboo") ||
            partner.includes("bamboo airways")
        ) {
            return "bg-green-100 text-green-800 border-green-300";
        } else if (partner.includes("jetstar") || partner.includes("sun phuquoc")) {
            return "bg-indigo-100 text-indigo-800 border-indigo-300";
        }
        return "bg-cyan-100 text-cyan-800 border-cyan-300";
    }

    if (!partnerName) return null;

    return (
        <span
            className={`${getPartnerColor(partnerName)} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`}
        >
            {partnerName}
        </span>
    )
}

// CampaignCard component similar to CampaignList.jsx
const CampaignCard = ({ campaign, onViewDetails, onDelete }) => {
    const navigate = useNavigate()
    const percent = useMemo(() => {
        const current = Number(campaign.currentHires) || 0
        const total = Number(campaign.targetHires) || 0
        if (!total) return 0
        return Math.min(100, Math.round((current / total) * 100))
    }, [campaign])

    return (
        <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                        {campaign.name}
                    </h3>

                    <div className="grid grid-cols-1 mt-2 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-6 gap-x-6 gap-y-1">
                        <div>
                            <span className="text-gray-500">Position:</span>
                            <div className="mt-1">
                                <PositionBadge position={campaign.position} />
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">Type:</span>
                            <div className="mt-1">
                                <CampaignTypeBadge type={campaign.campaignType} />
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">Partner:</span>
                            <div className="mt-1">
                                <PartnerBadge partnerName={campaign.partnerName} />
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">Status:</span>
                            <div className="mt-1">
                                <StatusBadge status={campaign.status} />
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">Start date:</span>
                            <p className="font-medium text-slate-800 mt-1">{formatDate(campaign.rawStartDate) || campaign.startDate}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">End date:</span>
                            <p className="font-medium text-slate-800 mt-1">{formatDate(campaign.rawEndDate) || campaign.endDate}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => onViewDetails(campaign)}
                    >
                        View details
                    </button>
                </div>
            </div>

            {/* {campaign.targetHires > 0 && (
                <div className="mt-4">
                    <div className="flex justify-between mb-1 text-sm text-slate-600">
                        <span className="text-gray-500">Hiring progress</span>{' '}
                        {campaign.currentHires}/{campaign.targetHires} ({percent}%)
                    </div>
                    <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                        <div
                            className="h-full bg-blue-600"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            )} */}

            {campaign.description && (
                <p className="mt-3 text-sm text-gray-600">{campaign.description}</p>
            )}
        </div>
    )
}

const DirectorCampaign = () => {
    const [campaigns, setCampaigns] = useState([])
    const [filteredCampaigns, setFilteredCampaigns] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [partnerFilter, setPartnerFilter] = useState('all')
    const [airlinePartners, setAirlinePartners] = useState([])
    const [isLoadingPartners, setIsLoadingPartners] = useState(false)
    const [sortBy, setSortBy] = useState('startDateDesc')
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [langVersion, setLangVersion] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5, // 5 campaigns per page
        totalRecords: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    })
    const navigate = useNavigate()

    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1))
        return () => off()
    }, [])

    // Fetch airline partners
    const fetchAirlinePartners = useCallback(async () => {
        setIsLoadingPartners(true)
        try {
            const res = await getAirlinePartners()
            if (res.success && Array.isArray(res.data)) {
                // Chỉ lấy partnerId và partnerName
                const partners = res.data
                    .map((partner) => ({
                        partnerId: partner?.partnerId ?? partner?.id ?? null,
                        partnerName: partner?.partnerName || partner?.name || '',
                    }))
                    .filter((p) => p.partnerId && p.partnerName)
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

    // Tìm partnerId từ partner name được chọn
    const getPartnerIdFromName = useCallback(
        (partnerName) => {
            if (partnerName === 'all' || !partnerName) return null
            const partner = airlinePartners.find(
                (p) => p.partnerName === partnerName
            )
            return partner?.partnerId || null
        },
        [airlinePartners]
    )

    const parseDateValue = (value) => {
        if (!value) return null

        const native = new Date(value)
        if (!Number.isNaN(native.getTime())) return native

        const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/)
        if (match) {
            const [, day, month, year, hour = '0', minute = '0'] = match
            return new Date(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hour),
                Number(minute)
            )
        }

        return null
    }

    const formatDateValue = (value) => {
        const date = parseDateValue(value)
        if (!date) return value || 'Unknown'
        return date.toLocaleDateString('en-US')
    }

    // Preserve status from API without transforming
    const mapStatusValue = (status) => {
        if (!status) return 'Draft'
        // Keep API statuses (Upcoming, Ended, Ongoing, Rejected, Approved, Pending, Draft, Canceled)
        const statusStr = status.toString().trim()
        // Normalize only old lowercase values for backward compatibility
        const normalized = statusStr.toLowerCase()
        if (['ongoing', 'inprogress', 'in_progress', 'active'].includes(normalized)) return 'Ongoing'
        if (['pending', 'waiting', 'reviewing'].includes(normalized)) return 'Pending'
        if (['approved', 'approve'].includes(normalized)) return 'Approved'
        if (['rejected', 'reject'].includes(normalized)) return 'Rejected'
        if (['ended', 'completed', 'done', 'finished', 'closed'].includes(normalized)) return 'Ended'
        if (['upcoming', 'scheduled'].includes(normalized)) return 'Upcoming'
        if (['draft'].includes(normalized)) return 'Draft'
        if (['canceled', 'cancelled'].includes(normalized)) return 'Canceled'
        // If already in correct API PascalCase, keep as-is
        if (['Upcoming', 'Ended', 'Ongoing', 'Rejected', 'Approved', 'Pending', 'Draft', 'Canceled'].includes(statusStr)) {
            return statusStr
        }
        // Default
        return statusStr || 'Draft'
    }

    const transformCampaignData = (item) => {
        const targetQuantity = item.targetHires ?? item.targetQuantity ?? 0
        const currentQuantity = item.currentHires ?? item.currentQuantity ?? 0

        return {
            id: item.id ?? item.campaignId ?? item.campaignID ?? item.Id,
            name: item.name ?? item.campaignName ?? 'Untitled campaign',
            position: item.position ?? item.role ?? 'Unknown',
            campaignType: item.campaignType ?? 'Unknown',
            department: item.department ?? item.campaignDepartment ?? item.departmentName ?? 'Unknown',
            partnerName: item.partnerName ?? item.airline ?? item.airlineName ?? '',
            status: mapStatusValue(item.status),
            startDate: formatDateValue(item.startDate),
            endDate: formatDateValue(item.endDate),
            rawStartDate: item.startDate,
            rawEndDate: item.endDate,
            targetHires: targetQuantity,
            currentHires: currentQuantity,
            description: item.description ?? '',
            requirements: item.requirements ?? item.requirement ?? ''
        }
    }

    useEffect(() => {
        const fetchCampaigns = async (page = 1) => {
            setIsLoading(true)
            setError(null)
            try {
                const pageSize = 5 // 5 campaigns per page
                const partnerId = getPartnerIdFromName(partnerFilter)
                const params = {
                    page: page,
                    pageSize: pageSize,
                }
                if (partnerId) {
                    params.partnerId = partnerId
                }
                const response = await getCampaigns(params)
                if (response.success && Array.isArray(response.data)) {
                    const normalizedCampaigns = response.data.map(transformCampaignData)
                    setCampaigns(normalizedCampaigns)
                    setFilteredCampaigns(normalizedCampaigns)

                    // Save pagination info from API if provided
                    if (response.pagination) {
                        setPagination(prev => ({
                            ...prev,
                            ...response.pagination,
                            pageSize: pageSize,
                        }))
                    } else {
                        // Fallback pagination when API does not return it
                        setPagination(prev => ({
                            ...prev,
                            currentPage: page,
                            pageSize: pageSize,
                            totalRecords: normalizedCampaigns.length,
                            totalPages: 1,
                            hasNextPage: false,
                            hasPreviousPage: false,
                        }))
                    }
                } else {
                    setCampaigns([])
                    setFilteredCampaigns([])
                    setError(response.error || 'Unable to fetch campaigns')
                }
            } catch (err) {
                setCampaigns([])
                setFilteredCampaigns([])
                setError(err.message || 'Unable to fetch campaigns')
            } finally {
                setIsLoading(false)
            }
        }

        // First load fetches page 1
        fetchCampaigns(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [partnerFilter, getPartnerIdFromName])

    const normalizeString = (value) => (value || '').toString().toLowerCase()
    const normalizeStatus = (value) => normalizeString(value)

    useEffect(() => {
        let filtered = campaigns

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(campaign =>
                normalizeString(campaign.name).includes(term) ||
                normalizeString(campaign.position).includes(term) ||
                normalizeString(campaign.campaignType).includes(term)
            )
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(campaign => {
                const campaignStatus = (campaign.status || '').toString().trim()
                const filterStatus = statusFilter.toString().trim()
                // Case-insensitive comparison
                return campaignStatus.toLowerCase() === filterStatus.toLowerCase()
            })
        }

        // Sort campaigns
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'startDateDesc': {
                    const dateA = parseDateValue(a.rawStartDate) || 0
                    const dateB = parseDateValue(b.rawStartDate) || 0
                    return dateB - dateA // newest first
                }
                case 'startDateAsc': {
                    const dateA = parseDateValue(a.rawStartDate) || 0
                    const dateB = parseDateValue(b.rawStartDate) || 0
                    return dateA - dateB // oldest first
                }
                default:
                    return 0
            }
        })

        setFilteredCampaigns(sorted)
    }, [campaigns, searchTerm, statusFilter, sortBy])

    const handleViewDetails = (campaign) => {
        navigate(`/director/campaigns/${campaign.id}`, { state: { campaign } })
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            setCampaigns(campaigns.filter(campaign => campaign.id !== id))
        }
    }

    const handlePageChange = (page) => {
        if (page === pagination.currentPage) return
        if (page < 1) return
        if (pagination.totalPages && page > pagination.totalPages) return
        // Allow page change only when a previous/next page exists
        if (page > pagination.currentPage && !pagination.hasNextPage) return
        if (page < pagination.currentPage && !pagination.hasPreviousPage) return

        // Fetch the new page from API
        const fetchNewPage = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const pageSize = pagination.pageSize || 5
                const partnerId = getPartnerIdFromName(partnerFilter)
                const params = {
                    page: page,
                    pageSize: pageSize,
                }
                if (partnerId) {
                    params.partnerId = partnerId
                }
                const response = await getCampaigns(params)
                if (response.success && Array.isArray(response.data)) {
                    const normalizedCampaigns = response.data.map(transformCampaignData)
                    setCampaigns(normalizedCampaigns)
                    setFilteredCampaigns(normalizedCampaigns)

                    if (response.pagination) {
                        setPagination(prev => ({
                            ...prev,
                            ...response.pagination,
                            pageSize: pageSize,
                        }))
                    } else {
                        setPagination(prev => ({
                            ...prev,
                            currentPage: page,
                            pageSize: pageSize,
                            totalRecords: normalizedCampaigns.length,
                            totalPages: 1,
                            hasNextPage: false,
                            hasPreviousPage: false,
                        }))
                    }
                } else {
                    setError(response.error || 'Unable to fetch campaigns')
                    setCampaigns([])
                }
            } catch (err) {
                setError(err.message || 'Unable to fetch campaigns')
                setCampaigns([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchNewPage()
    }

    if (error) {
        return (
            <div className="flex flex-col gap-5 p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-800">
                    Campaign Management
                </h2>
                <div className="py-8 text-center">
                    <div className="mb-2 text-red-600">{error}</div>
                    <button
                        onClick={() => {
                            setError(null)
                            setIsLoading(true)
                            const fetchCampaigns = async () => {
                                try {
                                    const partnerId = getPartnerIdFromName(partnerFilter)
                                    const params = {
                                        page: 1,
                                        pageSize: 5,
                                    }
                                    if (partnerId) {
                                        params.partnerId = partnerId
                                    }
                                    const response = await getCampaigns(params)
                                    if (response.success && Array.isArray(response.data)) {
                                        const normalizedCampaigns = response.data.map(transformCampaignData)
                                        setCampaigns(normalizedCampaigns)
                                        setFilteredCampaigns(normalizedCampaigns)
                                        setError(null)
                                    } else {
                                        setError(response.error || 'Unable to fetch campaigns')
                                    }
                                } catch (err) {
                                    setError(err.message || 'Unable to fetch campaigns')
                                } finally {
                                    setIsLoading(false)
                                }
                            }
                            fetchCampaigns()
                        }}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5 p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-800">
                Campaign Management ({filteredCampaigns.length})
            </h2>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Bar */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name or campaign type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Airline Partner Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Airline Partner</label>
                        <select
                            value={partnerFilter}
                            onChange={(e) => setPartnerFilter(e.target.value)}
                            disabled={isLoadingPartners}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="all">All Partners</option>
                            {airlinePartners.map((partner) => (
                                <option key={partner.partnerId} value={partner.partnerName}>
                                    {partner.partnerName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Sort by assigned date</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="startDateDesc">Newest first</option>
                            <option value="startDateAsc">Oldest first</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-stretch gap-3 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter === 'all'
                            ? 'bg-slate-700 text-white border-slate-700'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Draft')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'draft'
                            ? 'bg-slate-600 text-white border-slate-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Planning
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Pending')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'pending'
                            ? 'bg-yellow-600 text-white border-yellow-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Approved')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'approved'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Approved
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Ongoing')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'ongoing'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Ongoing
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Upcoming')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'upcoming'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Ended')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'ended'
                            ? 'bg-gray-600 text-white border-gray-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Ended
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Rejected')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'rejected'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Rejected
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Canceled')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'canceled'
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Canceled
                    </button>
                </div>
            </div>

            {/* Campaign Cards */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-600">
                        {t('loading_data') || 'Loading data...'}
                    </p>
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-slate-500">No campaigns found</p>
                </div>
            ) : (
                <>
                    {filteredCampaigns.map((campaign) => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            onViewDetails={handleViewDetails}
                            onDelete={handleDelete}
                        />
                    ))}

                    {/* Pagination */}
                    <div className="mt-6 px-6 py-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            Page <span className="font-semibold">{pagination.currentPage}</span>
                            {pagination.totalPages ? (
                                <> / <span className="font-semibold">{pagination.totalPages}</span></>
                            ) : null}
                            {typeof pagination.totalRecords === 'number' && (
                                <span className="ml-2">
                                    ({pagination.totalRecords} records)
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPreviousPage}
                                className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasPreviousPage
                                    ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                    }`}
                            >
                                Prev
                            </button>

                            <span className="text-sm text-slate-600">
                                {pagination.currentPage}
                            </span>

                            <button
                                type="button"
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasNextPage
                                    ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Detail modal */}
            {showModal && selectedCampaign && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-slate-800">Campaign details</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-800 mb-2">{selectedCampaign.name}</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-slate-600">Position:</span>
                                        <div className="mt-1">
                                            <PositionBadge position={selectedCampaign.position} />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Type:</span>
                                        <div className="mt-1">
                                            <CampaignTypeBadge type={selectedCampaign.campaignType} />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Partner:</span>
                                        <div className="mt-1">
                                            <PartnerBadge partnerName={selectedCampaign.partnerName} />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Status:</span>
                                        <div className="mt-1"><StatusBadge status={selectedCampaign.status} /></div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Start Date:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.startDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">End Date:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.endDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Recruitment Target:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.targetHires} people</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Hired:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.currentHires} people</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm text-slate-600">Description:</span>
                                    <p className="text-slate-800 mt-1">{selectedCampaign.description || 'No description'}</p>
                                </div>

                                {selectedCampaign.requirements && (
                                    <div>
                                        <span className="text-sm text-slate-600">Requirements:</span>
                                        <p className="text-slate-800 mt-1">{selectedCampaign.requirements}</p>
                                    </div>
                                )}

                                {/* Progress Bar */}
                                {selectedCampaign.targetHires > 0 && (
                                    <div>
                                        <span className="text-sm text-slate-600">Hiring progress:</span>
                                        <div className="mt-2">
                                            {(() => {
                                                const current = Number(selectedCampaign.currentHires) || 0
                                                const total = Number(selectedCampaign.targetHires) || 0
                                                const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
                                                return (
                                                    <>
                                                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                                                            <span>{current}/{total} people</span>
                                                            <span>{percent}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="h-full bg-blue-600"
                                                                style={{ width: `${percent}%` }}
                                                            ></div>
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DirectorCampaign