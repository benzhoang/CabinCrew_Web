import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'

const mockCampaigns = [
    {
        id: 1,
        name: 'Chiến dịch Tuyển dụng Hàng không Toàn quốc 2024',
        position: 'Cabin Crew',
        department: 'Cabin Crew',
        status: 'pending_approval',
        startDate: '2024-01-10',
        endDate: '2024-04-10',
        targetHires: 150,
        currentHires: 85,
        description: 'Chiến dịch tuyển dụng tổng thể cho toàn bộ mạng lưới hàng không với mục tiêu 150 nhân viên',
        requirements: 'Tiếng Anh TOEIC 650+, Cao 1.60m+, Kỹ năng giao tiếp, Tinh thần phục vụ'
    },
    {
        id: 2,
        name: 'Chiến dịch Đào tạo Phi công Quốc tế',
        position: 'Pilot',
        department: 'Flight Operations',
        status: 'approved',
        startDate: '2024-02-01',
        endDate: '2024-06-30',
        targetHires: 25,
        currentHires: 18,
        description: 'Tuyển dụng và đào tạo đội ngũ phi công cho các chuyến bay quốc tế mới',
        requirements: 'Bằng lái máy bay ATPL, Kinh nghiệm bay 2000+ giờ, Tiếng Anh ICAO level 4+'
    },
    {
        id: 3,
        name: 'Chiến dịch Mở rộng Dịch vụ Hành khách',
        position: 'Customer Service',
        department: 'Ground Operations',
        status: 'rejected',
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        targetHires: 80,
        currentHires: 12,
        description: 'Tuyển dụng nhân viên dịch vụ hành khách cho sân bay và phòng vé',
        requirements: 'Kỹ năng xử lý tình huống, Tiếng Anh lưu loát, Làm việc ca linh hoạt'
    },
    {
        id: 4,
        name: 'Chiến dịch Phát triển Bảo trì Kỹ thuật',
        position: 'Aircraft Mechanic',
        department: 'Maintenance',
        status: 'pending_approval',
        startDate: '2024-01-20',
        endDate: '2024-04-20',
        targetHires: 40,
        currentHires: 28,
        description: 'Tuyển dụng kỹ thuật viên bảo trì để nâng cấp đội ngũ bảo dưỡng máy bay',
        requirements: 'Bằng kỹ thuật hàng không, Chứng chỉ EASA Part 66, An toàn lao động'
    },
    {
        id: 5,
        name: 'Chiến dịch Công nghệ Thông tin Hàng không',
        position: 'IT Specialist',
        department: 'Information Technology',
        status: 'approved',
        startDate: '2023-12-01',
        endDate: '2024-02-29',
        targetHires: 15,
        currentHires: 15,
        description: 'Tuyển dụng chuyên gia IT cho hệ thống quản lý và công nghệ hàng không',
        requirements: 'Bằng IT/Computer Science, Kinh nghiệm hệ thống booking, Cloud computing'
    }
]

const DirectorCampaign = () => {
    const [campaigns, setCampaigns] = useState(mockCampaigns)
    const [filteredCampaigns, setFilteredCampaigns] = useState(mockCampaigns)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
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
        if (searchTerm) {
            filtered = filtered.filter(campaign =>
                campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.department.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(campaign => campaign.status === statusFilter)
        }
        setFilteredCampaigns(filtered)
    }, [campaigns, searchTerm, statusFilter])

    const handleViewDetails = (campaign) => {
        setSelectedCampaign(campaign)
        setShowModal(true)
    }

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa chiến dịch này?')) {
            setCampaigns(campaigns.filter(campaign => campaign.id !== id))
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending_approval: { color: 'bg-yellow-100 text-yellow-800', text: 'Đang chờ duyệt' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Bị từ chối' },
            approved: { color: 'bg-green-100 text-green-800', text: 'Đã được duyệt' }
        }
        const config = statusConfig[status] || statusConfig.pending_approval
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quản lý Chiến dịch Tổng thể</h2>
                        <p className="text-slate-600">Quản lý và giám sát các chiến dịch tuyển dụng toàn hệ thống</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Danh sách Chiến dịch ({filteredCampaigns.length})</h3>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setStatusFilter('pending_approval')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'pending_approval'
                                ? 'bg-yellow-600 text-white border-yellow-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-yellow-50'
                                }`}
                        >
                            Đang chờ duyệt
                        </button>
                        <button
                            onClick={() => setStatusFilter('rejected')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'rejected'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50'
                                }`}
                        >
                            Bị từ chối
                        </button>
                        <button
                            onClick={() => setStatusFilter('approved')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'approved'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-green-50'
                                }`}
                        >
                            Đã được duyệt
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

            {showModal && selectedCampaign && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
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

                        <div className="p-6 space-y-4">
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
                        </div>

                        <div className="p-6 border-t border-slate-200 flex justify-end">
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