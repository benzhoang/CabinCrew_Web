import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'

// Mock data cho campaigns - Ngành hàng không
const mockCampaigns = [
    {
        id: 1,
        name: 'Tuyển dụng Tiếp viên hàng không 2024',
        position: 'Flight Attendant',
        department: 'Cabin Crew',
        status: 'ongoing',
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        targetHires: 20,
        currentHires: 8,
        description: 'Tuyển dụng tiếp viên hàng không cho các chuyến bay nội địa và quốc tế',
        requirements: 'Tiếng Anh tốt, Chiều cao 1.60m+, Kỹ năng giao tiếp, Sức khỏe tốt'
    },
    {
        id: 2,
        name: 'Chiến dịch Pilot Training',
        position: 'Pilot',
        department: 'Flight Operations',
        status: 'completed',
        startDate: '2024-01-01',
        endDate: '2024-02-28',
        targetHires: 5,
        currentHires: 5,
        description: 'Tuyển dụng và đào tạo phi công cho đội bay mới',
        requirements: 'Bằng lái máy bay, Kinh nghiệm bay, Tiếng Anh thành thạo'
    },
    {
        id: 3,
        name: 'Ground Staff Campaign',
        position: 'Ground Staff',
        department: 'Ground Operations',
        status: 'pending',
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        targetHires: 15,
        currentHires: 6,
        description: 'Tuyển dụng nhân viên mặt đất cho sân bay',
        requirements: 'Kỹ năng xử lý hành lý, Giao tiếp tốt, Làm việc ca'
    },
    {
        id: 4,
        name: 'Customer Service Expansion',
        position: 'Customer Service Agent',
        department: 'Customer Service',
        status: 'ongoing',
        startDate: '2024-02-15',
        endDate: '2024-05-15',
        targetHires: 12,
        currentHires: 4,
        description: 'Mở rộng đội ngũ chăm sóc khách hàng',
        requirements: 'Kỹ năng giao tiếp, Tiếng Anh, Xử lý tình huống'
    },
    {
        id: 5,
        name: 'Maintenance Team',
        position: 'Aircraft Mechanic',
        department: 'Maintenance',
        status: 'pending',
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        targetHires: 8,
        currentHires: 2,
        description: 'Tuyển dụng kỹ thuật viên bảo trì máy bay',
        requirements: 'Bằng kỹ thuật, Kinh nghiệm bảo trì, An toàn lao động'
    }
]

const Campaign = () => {
    const [campaigns, setCampaigns] = useState(mockCampaigns)
    const [filteredCampaigns, setFilteredCampaigns] = useState(mockCampaigns)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [departmentFilter, setDepartmentFilter] = useState('all')
    const [sortBy, setSortBy] = useState('name')
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [langVersion, setLangVersion] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1))
        return () => off()
    }, [])

    useEffect(() => {
        let filtered = campaigns

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(campaign =>
                campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.department.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(campaign => campaign.status === statusFilter)
        }

        // Filter by department
        if (departmentFilter !== 'all') {
            filtered = filtered.filter(campaign => campaign.department === departmentFilter)
        }

        // Sort campaigns
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name)
                case 'startDate':
                    return new Date(a.startDate) - new Date(b.startDate)
                case 'endDate':
                    return new Date(a.endDate) - new Date(b.endDate)
                case 'progress':
                    const progressA = (a.currentHires / a.targetHires) * 100
                    const progressB = (b.currentHires / b.targetHires) * 100
                    return progressB - progressA
                case 'status':
                    const statusOrder = { ongoing: 1, pending: 2, completed: 3 }
                    return statusOrder[a.status] - statusOrder[b.status]
                default:
                    return 0
            }
        })

        setFilteredCampaigns(filtered)
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
        const config = statusConfig[status] || statusConfig.ongoing
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    const getProgressPercentage = (current, target) => {
        return Math.round((current / target) * 100)
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
                    {filteredCampaigns.map((campaign) => (
                        <div key={campaign.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-semibold text-slate-800">{campaign.name}</h4>
                                        {getStatusBadge(campaign.status)}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <span className="text-sm text-slate-600">Vị trí:</span>
                                            <p className="font-medium text-slate-800">{campaign.position}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Phòng ban:</span>
                                            <p className="font-medium text-slate-800">{campaign.department}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Thời gian:</span>
                                            <p className="font-medium text-slate-800">{campaign.startDate} - {campaign.endDate}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
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

                {filteredCampaigns.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-slate-500">Không tìm thấy chiến dịch nào</p>
                    </div>
                )}
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
                                    {getStatusBadge(selectedCampaign.status)}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-slate-600">Vị trí:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.position}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Phòng ban:</span>
                                        <p className="font-medium text-slate-800">{selectedCampaign.department}</p>
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
                                    <p className="text-slate-800 mt-1">{selectedCampaign.description}</p>
                                </div>

                                <div>
                                    <span className="text-sm text-slate-600">Yêu cầu:</span>
                                    <p className="text-slate-800 mt-1">{selectedCampaign.requirements}</p>
                                </div>

                                {/* Progress Bar */}
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
