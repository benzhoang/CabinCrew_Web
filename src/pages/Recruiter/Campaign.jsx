import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'
import { getMyCampaigns } from '../../service/api'

const Campaign = () => {
    const [campaigns, setCampaigns] = useState([])
    const [filteredCampaigns, setFilteredCampaigns] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [departmentFilter, setDepartmentFilter] = useState('all')
    const [sortBy, setSortBy] = useState('name')
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [langVersion, setLangVersion] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
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

    const mapStatusValue = (status) => {
        const normalized = (status || '').toString().trim().toLowerCase()
        if (['ongoing', 'inprogress', 'in_progress', 'active', 'approved'].includes(normalized)) return 'ongoing'
        if (['pending', 'draft', 'scheduled', 'waiting', 'reviewing'].includes(normalized)) return 'pending'
        if (['completed', 'done', 'finished', 'closed'].includes(normalized)) return 'completed'
        return 'ongoing'
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
        const fetchCampaigns = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await getMyCampaigns()
                if (response.success && Array.isArray(response.data)) {
                    const normalizedCampaigns = response.data.map(transformCampaignData)
                    setCampaigns(normalizedCampaigns)
                    setFilteredCampaigns(normalizedCampaigns)
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

        fetchCampaigns()
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
                normalizeString(campaign.position).includes(term) ||
                normalizeString(campaign.department).includes(term)
            )
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(campaign => normalizeStatus(campaign.status) === statusFilter)
        }

        // Filter by department
        if (departmentFilter !== 'all') {
            filtered = filtered.filter(campaign => campaign.department === departmentFilter)
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
                    const statusOrder = { ongoing: 1, pending: 2, completed: 3 }
                    const statusA = statusOrder[normalizeStatus(a.status)] || 4
                    const statusB = statusOrder[normalizeStatus(b.status)] || 4
                    return statusA - statusB
                default:
                    return 0
            }
        })

        setFilteredCampaigns(sorted)
    }, [campaigns, searchTerm, statusFilter, departmentFilter, sortBy])

    const handleViewDetails = (campaign) => {
        navigate(`/recruiter/campaigns/${campaign.id}`, { state: { campaign } })
    }

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa chiến dịch này?')) {
            setCampaigns(campaigns.filter(campaign => campaign.id !== id))
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            ongoing: { color: 'bg-green-100 text-green-800', text: 'Đang diễn ra' },
            completed: { color: 'bg-blue-100 text-blue-800', text: 'Đã hoàn thành' },
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Đang chờ diễn ra' }
        }
        const config = statusConfig[normalizeStatus(status)] || statusConfig.ongoing
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    const getProgressPercentage = (current, target) => {
        const numericCurrent = Number(current) || 0
        const numericTarget = Number(target) || 0
        if (numericTarget <= 0) return 0
        return Math.round((numericCurrent / numericTarget) * 100)
    }

    const hasProgressData = (campaign) => {
        return Number(campaign.targetHires) > 0
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quản lý Chiến dịch</h2>
                        <p className="text-slate-600">Quản lý các chiến dịch tuyển dụng và kế hoạch nhân sự</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Bar */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm</label>
                        <input
                            type="text"
                            placeholder="Tìm theo tên, vị trí, phòng ban..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Department Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Phòng ban</label>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tất cả phòng ban</option>
                            <option value="Cabin Crew">Cabin Crew</option>
                            <option value="Flight Operations">Flight Operations</option>
                            <option value="Ground Operations">Ground Operations</option>
                            <option value="Customer Service">Customer Service</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
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

            {/* Campaigns List */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Danh sách Chiến dịch ({filteredCampaigns.length})</h3>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setStatusFilter('ongoing')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'ongoing'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-green-50'
                                }`}
                        >
                            Đang diễn ra
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'pending'
                                ? 'bg-yellow-600 text-white border-yellow-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-yellow-50'
                                }`}
                        >
                            Đang chờ diễn ra
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'completed'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
                                }`}
                        >
                            Đã hoàn thành
                        </button>
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'all'
                                ? 'bg-slate-600 text-white border-slate-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            Tất cả
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-slate-200">
                    {isLoading && (
                        <div className="p-6 text-center text-slate-500">
                            Đang tải danh sách chiến dịch...
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="p-6 text-center text-red-500">
                            {error}
                        </div>
                    )}

                    {filteredCampaigns.map((campaign) => (
                        <div key={campaign.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="mb-2">
                                        <h4 className="text-lg font-semibold text-slate-800">{campaign.name}</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <span className="text-sm text-slate-600">Vị trí:</span>
                                            <p className="font-medium text-slate-800">{campaign.position || 'Không xác định'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Phòng ban:</span>
                                            <p className="font-medium text-slate-800">{campaign.department || 'Không xác định'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Trạng thái:</span>
                                            <div className="mt-1">{getStatusBadge(campaign.status)}</div>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-sm text-slate-600">Thời gian:</span>
                                        <p className="font-medium text-slate-800">{campaign.startDate} - {campaign.endDate}</p>
                                    </div>

                                    {/* Progress Bar */}
                                    {hasProgressData(campaign) && (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm text-slate-600 mb-1">
                                                <span>Tiến độ tuyển dụng</span>
                                                <span>{campaign.currentHires}/{campaign.targetHires} ({getProgressPercentage(campaign.currentHires, campaign.targetHires)}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${getProgressPercentage(campaign.currentHires, campaign.targetHires)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-sm text-slate-600">{campaign.description}</p>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleViewDetails(campaign)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Xem chi tiết
                                    </button>
                                    <button
                                        onClick={() => handleDelete(campaign.id)}
                                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
                                        <span className="text-sm text-slate-600">Vị trí:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.position || 'Không xác định'}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Phòng ban:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.department || 'Không xác định'}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Trạng thái:</span>
                                        <div className="mt-1">{getStatusBadge(selectedCampaign.status)}</div>
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
                                {hasProgressData(selectedCampaign) && (
                                    <div>
                                        <span className="text-sm text-slate-600">Tiến độ tuyển dụng:</span>
                                        <div className="mt-2">
                                            <div className="flex justify-between text-sm text-slate-600 mb-1">
                                                <span>{selectedCampaign.currentHires}/{selectedCampaign.targetHires} người</span>
                                                <span>{getProgressPercentage(selectedCampaign.currentHires, selectedCampaign.targetHires)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-3">
                                                <div
                                                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                                    style={{ width: `${getProgressPercentage(selectedCampaign.currentHires, selectedCampaign.targetHires)}%` }}
                                                ></div>
                                            </div>
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

export default Campaign
