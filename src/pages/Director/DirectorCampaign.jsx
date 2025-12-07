import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'
import { getCampaigns } from '../../service/api'
import { formatDate } from '../../config/formatDate.js'

// StatusBadge component - hỗ trợ tất cả status từ API
const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        const normalized = (status || '').toString().trim()
        // Giữ nguyên case-sensitive để match chính xác với API
        switch (normalized) {
            case 'Ongoing':
                return {
                    className: 'bg-blue-100 text-blue-700 border-blue-200',
                    text: 'Đang diễn ra',
                }
            case 'Pending':
                return {
                    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    text: 'Đang chờ duyệt',
                }
            case 'Approved':
                return {
                    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    text: 'Đã được duyệt',
                }
            case 'Rejected':
                return {
                    className: 'bg-red-100 text-red-700 border-red-200',
                    text: 'Đã từ chối',
                }
            case 'Upcoming':
                return {
                    className: 'bg-purple-100 text-purple-700 border-purple-200',
                    text: 'Sắp diễn ra',
                }
            case 'Ended':
                return {
                    className: 'bg-gray-100 text-gray-700 border-gray-200',
                    text: 'Đã kết thúc',
                }
            case 'Draft':
                return {
                    className: 'bg-slate-100 text-slate-600 border-slate-200',
                    text: 'Bản nháp',
                }
            // Fallback cho các giá trị cũ (lowercase) để tương thích ngược
            case 'ongoing':
            case 'active':
                return {
                    className: 'bg-blue-100 text-blue-700 border-blue-200',
                    text: 'Đang diễn ra',
                }
            case 'pending':
                return {
                    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    text: 'Đang chờ duyệt',
                }
            case 'approved':
                return {
                    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    text: 'Đã được duyệt',
                }
            case 'rejected':
                return {
                    className: 'bg-red-100 text-red-700 border-red-200',
                    text: 'Đã từ chối',
                }
            case 'completed':
            case 'ended':
                return {
                    className: 'bg-gray-100 text-gray-700 border-gray-200',
                    text: 'Đã kết thúc',
                }
            default:
                return {
                    className: 'bg-gray-100 text-gray-600 border-gray-200',
                    text: normalized || 'Không xác định',
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

// Helper function to map campaignType to Vietnamese label
const getCampaignTypeLabel = (campaignType) => {
    const normalized = (campaignType || '').toString().trim().toLowerCase()
    switch (normalized) {
        case 'recruitment':
        case 'tuyển dụng':
            return 'Tuyển dụng'
        case 'promotion':
        case 'thăng bậc':
            return 'Thăng bậc'
        default:
            return 'Không xác định'
    }
}

// CampaignTypeBadge component giống CampaignList.jsx
const CampaignTypeBadge = ({ type }) => {
    const label = getCampaignTypeLabel(type)
    const normalized = (type || '').toString().trim().toLowerCase()
    const className =
        normalized === 'promotion' || normalized === 'thăng bậc'
            ? 'bg-purple-100 text-purple-700 border-purple-200'
            : normalized === 'recruitment' || normalized === 'tuyển dụng'
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'

    return (
        <span
            className={`${className} inline-block rounded-full border px-2 py-0.5 text-xs font-medium`}
        >
            {label}
        </span>
    )
}

// CampaignCard component giống CampaignList.jsx
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
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                        {campaign.name}
                    </h3>

                    <div className="grid grid-cols-1 mt-2 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
                        <div>
                            <span className="text-gray-500">Thời gian bắt đầu:</span>{' '}
                            {formatDate(campaign.rawStartDate) || campaign.startDate}
                        </div>
                        <div>
                            <span className="text-gray-500">Thời gian kết thúc:</span>{' '}
                            {formatDate(campaign.rawEndDate) || campaign.endDate}
                        </div>
                        <div>
                            <span className="text-gray-500">Loại chiến dịch:</span>{' '}
                            <CampaignTypeBadge type={campaign.position || campaign.campaignType} />
                        </div>
                        <div>
                            <span className="text-gray-500">Trạng thái:</span>{' '}
                            <StatusBadge status={campaign.status} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => onViewDetails(campaign)}
                    >
                        Xem chi tiết
                    </button>
                </div>
            </div>

            {campaign.targetHires > 0 && (
                <div className="mt-4">
                    <div className="flex justify-between mb-1 text-sm text-slate-600">
                        <span className="text-gray-500">Tiến độ tuyển dụng</span>{' '}
                        {campaign.currentHires}/{campaign.targetHires} ({percent}%)
                    </div>
                    <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                        <div
                            className="h-full bg-blue-600"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            )}

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
    const [sortBy, setSortBy] = useState('name')
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [langVersion, setLangVersion] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5, // Mỗi trang 5 campaign
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
        if (!date) return value || 'Không xác định'
        return date.toLocaleDateString('vi-VN')
    }

    // Giữ nguyên status từ API, không transform
    const mapStatusValue = (status) => {
        if (!status) return 'Draft'
        // Giữ nguyên status từ API (Upcoming, Ended, Ongoing, Rejected, Approved, Pending, Draft)
        const statusStr = status.toString().trim()
        // Chỉ normalize nếu là các giá trị cũ (lowercase) để tương thích ngược
        const normalized = statusStr.toLowerCase()
        if (['ongoing', 'inprogress', 'in_progress', 'active'].includes(normalized)) return 'Ongoing'
        if (['pending', 'waiting', 'reviewing'].includes(normalized)) return 'Pending'
        if (['approved', 'approve'].includes(normalized)) return 'Approved'
        if (['rejected', 'reject'].includes(normalized)) return 'Rejected'
        if (['ended', 'completed', 'done', 'finished', 'closed'].includes(normalized)) return 'Ended'
        if (['upcoming', 'scheduled'].includes(normalized)) return 'Upcoming'
        if (['draft'].includes(normalized)) return 'Draft'
        // Nếu đã là format đúng từ API (PascalCase), giữ nguyên
        if (['Upcoming', 'Ended', 'Ongoing', 'Rejected', 'Approved', 'Pending', 'Draft'].includes(statusStr)) {
            return statusStr
        }
        // Mặc định
        return statusStr || 'Draft'
    }

    const transformCampaignData = (item) => {
        const targetQuantity = item.targetHires ?? item.targetQuantity ?? 0
        const currentQuantity = item.currentHires ?? item.currentQuantity ?? 0

        return {
            id: item.id ?? item.campaignId ?? item.campaignID ?? item.Id,
            name: item.name ?? item.campaignName ?? 'Chiến dịch chưa có tên',
            position: item.position ?? item.role ?? item.campaignType ?? 'Không xác định',
            department: item.department ?? item.campaignDepartment ?? item.departmentName ?? 'Không xác định',
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
                const pageSize = 5 // Mỗi trang 5 campaign
                const response = await getCampaigns({
                    page: page,
                    pageSize: pageSize
                })
                if (response.success && Array.isArray(response.data)) {
                    const normalizedCampaigns = response.data.map(transformCampaignData)
                    setCampaigns(normalizedCampaigns)
                    setFilteredCampaigns(normalizedCampaigns)

                    // Lưu thông tin phân trang từ API nếu có
                    if (response.pagination) {
                        setPagination(prev => ({
                            ...prev,
                            ...response.pagination,
                            pageSize: pageSize,
                        }))
                    } else {
                        // Nếu API chưa trả pagination, fallback theo data hiện tại
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
                    setError(response.error || 'Không thể lấy danh sách chiến dịch')
                }
            } catch (err) {
                setCampaigns([])
                setFilteredCampaigns([])
                setError(err.message || 'Không thể lấy danh sách chiến dịch')
            } finally {
                setIsLoading(false)
            }
        }

        // Lần đầu load sẽ là trang 1
        fetchCampaigns(1)
    }, [])

    const normalizeString = (value) => (value || '').toString().toLowerCase()
    const normalizeStatus = (value) => normalizeString(value)

    useEffect(() => {
        let filtered = campaigns

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(campaign =>
                normalizeString(campaign.name).includes(term) ||
                normalizeString(campaign.position).includes(term)
            )
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(campaign => {
                const campaignStatus = (campaign.status || '').toString().trim()
                const filterStatus = statusFilter.toString().trim()
                // So sánh case-insensitive
                return campaignStatus.toLowerCase() === filterStatus.toLowerCase()
            })
        }

        // Sort campaigns
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return normalizeString(a.name).localeCompare(normalizeString(b.name))
                case 'startDate':
                    return (parseDateValue(a.rawStartDate) || 0) - (parseDateValue(b.rawStartDate) || 0)
                case 'endDate':
                    return (parseDateValue(a.rawEndDate) || 0) - (parseDateValue(b.rawEndDate) || 0)
                case 'progress':
                    const progressA = ((Number(a.currentHires) || 0) / (Number(a.targetHires) || 1)) * 100
                    const progressB = ((Number(b.currentHires) || 0) / (Number(b.targetHires) || 1)) * 100
                    return progressB - progressA
                case 'status':
                    const statusOrder = {
                        'Pending': 1,
                        'Approved': 2,
                        'Rejected': 3,
                        'Draft': 4,
                        'Upcoming': 5,
                        'Ongoing': 6,
                        'Ended': 7
                    }
                    const statusA = statusOrder[a.status] || statusOrder[normalizeStatus(a.status)] || 8
                    const statusB = statusOrder[b.status] || statusOrder[normalizeStatus(b.status)] || 8
                    return statusA - statusB
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
        if (window.confirm('Bạn có chắc chắn muốn xóa chiến dịch này?')) {
            setCampaigns(campaigns.filter(campaign => campaign.id !== id))
        }
    }

    const handlePageChange = (page) => {
        if (page === pagination.currentPage) return
        if (page < 1) return
        if (pagination.totalPages && page > pagination.totalPages) return
        // Chỉ cho phép đổi trang nếu có previous/next tương ứng
        if (page > pagination.currentPage && !pagination.hasNextPage) return
        if (page < pagination.currentPage && !pagination.hasPreviousPage) return

        // Gọi lại API với trang mới
        const fetchNewPage = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const pageSize = pagination.pageSize || 5
                const response = await getCampaigns({
                    page: page,
                    pageSize: pageSize
                })
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
                    setError(response.error || 'Không thể lấy danh sách chiến dịch')
                    setCampaigns([])
                }
            } catch (err) {
                setError(err.message || 'Không thể lấy danh sách chiến dịch')
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
                    Quản lý Chiến dịch
                </h2>
                <div className="py-8 text-center">
                    <div className="mb-2 text-red-600">{error}</div>
                    <button
                        onClick={() => {
                            setError(null)
                            setIsLoading(true)
                            const fetchCampaigns = async () => {
                                try {
                                    const response = await getCampaigns()
                                    if (response.success && Array.isArray(response.data)) {
                                        const normalizedCampaigns = response.data.map(transformCampaignData)
                                        setCampaigns(normalizedCampaigns)
                                        setFilteredCampaigns(normalizedCampaigns)
                                        setError(null)
                                    } else {
                                        setError(response.error || 'Không thể lấy danh sách chiến dịch')
                                    }
                                } catch (err) {
                                    setError(err.message || 'Không thể lấy danh sách chiến dịch')
                                } finally {
                                    setIsLoading(false)
                                }
                            }
                            fetchCampaigns()
                        }}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5 p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-800">
                Quản lý Chiến dịch ({filteredCampaigns.length})
            </h2>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search Bar */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm</label>
                        <input
                            type="text"
                            placeholder="Tìm theo tên, loại chiến dịch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Sort Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Sắp xếp theo</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="name">Tên chiến dịch</option>
                            <option value="startDate">Ngày bắt đầu</option>
                            <option value="endDate">Ngày kết thúc</option>
                            <option value="progress">Tiến độ</option>
                            <option value="status">Trạng thái</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-stretch gap-3 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Pending')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'pending'
                            ? 'bg-yellow-600 text-white border-yellow-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Đang chờ duyệt
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Approved')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'approved'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Đã được duyệt
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Ongoing')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'ongoing'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Đang diễn ra
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Rejected')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'rejected'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Đã từ chối
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Upcoming')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'upcoming'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Sắp diễn ra
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Ended')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'ended'
                            ? 'bg-gray-600 text-white border-gray-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Đã kết thúc
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('Draft')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter.toLowerCase() === 'draft'
                            ? 'bg-slate-600 text-white border-slate-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Bản nháp
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${statusFilter === 'all'
                            ? 'bg-slate-700 text-white border-slate-700'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        Tất cả
                    </button>
                </div>
            </div>

            {/* Campaign Cards */}
            {isLoading ? (
                <div className="py-12 text-center">
                    <p className="text-slate-500">Đang tải dữ liệu...</p>
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-slate-500">Không tìm thấy chiến dịch nào</p>
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

                    {/* Phân trang */}
                    <div className="mt-6 px-6 py-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            Trang <span className="font-semibold">{pagination.currentPage}</span>
                            {pagination.totalPages ? (
                                <> / <span className="font-semibold">{pagination.totalPages}</span></>
                            ) : null}
                            {typeof pagination.totalRecords === 'number' && (
                                <span className="ml-2">
                                    ({pagination.totalRecords} bản ghi)
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
                                Trước
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
                                Sau
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Modal Chi tiết */}
            {showModal && selectedCampaign && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-slate-800">Chi tiết Chiến dịch</h3>
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
                                        <span className="text-sm text-slate-600">Loại chiến dịch:</span>
                                        <div className="mt-1">
                                            <CampaignTypeBadge type={selectedCampaign.position || selectedCampaign.campaignType} />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Trạng thái:</span>
                                        <div className="mt-1"><StatusBadge status={selectedCampaign.status} /></div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Ngày bắt đầu:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.startDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Ngày kết thúc:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.endDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Mục tiêu tuyển dụng:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.targetHires} người</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Đã tuyển:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.currentHires} người</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm text-slate-600">Mô tả:</span>
                                    <p className="text-slate-800 mt-1">{selectedCampaign.description || 'Không có mô tả'}</p>
                                </div>

                                {selectedCampaign.requirements && (
                                    <div>
                                        <span className="text-sm text-slate-600">Yêu cầu:</span>
                                        <p className="text-slate-800 mt-1">{selectedCampaign.requirements}</p>
                                    </div>
                                )}

                                {/* Progress Bar */}
                                {selectedCampaign.targetHires > 0 && (
                                    <div>
                                        <span className="text-sm text-slate-600">Tiến độ tuyển dụng:</span>
                                        <div className="mt-2">
                                            {(() => {
                                                const current = Number(selectedCampaign.currentHires) || 0
                                                const total = Number(selectedCampaign.targetHires) || 0
                                                const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
                                                return (
                                                    <>
                                                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                                                            <span>{current}/{total} người</span>
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
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DirectorCampaign