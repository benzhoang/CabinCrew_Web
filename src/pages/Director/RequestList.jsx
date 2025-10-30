import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'

const mockRequests = [
    {
        id: 101,
        code: 'REQ-2024-001',
        title: 'Yêu cầu tuyển dụng - Cabin Crew (MRF)',
        proposer: 'Đặng Bích Thu Thùy',
        position: 'Cabin Crew',
        department: 'Cabin Crew',
        unit: 'Cabin Crew - Tiếp viên hàng không',
        quantity: 20,
        status: 'pending_approval',
        startDate: '2024-10-01',
        endDate: '2024-12-31',
        description: 'Bổ sung nhân sự Cabin Crew do biến động nghỉ việc và mở rộng đội bay'
    },
    {
        id: 102,
        code: 'REQ-2024-002',
        title: 'Yêu cầu tuyển dụng - IT Specialist',
        proposer: 'Nguyễn Văn Nam',
        position: 'IT Specialist',
        department: 'Information Technology',
        unit: 'IT Operations',
        quantity: 5,
        status: 'approved',
        startDate: '2024-08-01',
        endDate: '2024-09-30',
        description: 'Tăng cường đội ngũ IT phục vụ triển khai hệ thống mới'
    },
    {
        id: 103,
        code: 'REQ-2024-003',
        title: 'Yêu cầu tuyển dụng - Aircraft Mechanic',
        proposer: 'Trần Bảo Vy',
        position: 'Aircraft Mechanic',
        department: 'Maintenance',
        unit: 'Base Maintenance',
        quantity: 12,
        status: 'rejected',
        startDate: '2024-07-15',
        endDate: '2024-10-15',
        description: 'Bổ sung kỹ thuật viên bảo trì, đợt đề xuất chưa đáp ứng ngân sách'
    },
]

const DirectorRequestList = () => {
    const [requests, setRequests] = useState(mockRequests)
    const [filteredRequests, setFilteredRequests] = useState(mockRequests)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [langVersion, setLangVersion] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1))
        return () => off()
    }, [])

    useEffect(() => {
        let filtered = requests
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter((req) =>
                req.title.toLowerCase().includes(term) ||
                req.code.toLowerCase().includes(term) ||
                (req.position || '').toLowerCase().includes(term) ||
                (req.department || '').toLowerCase().includes(term)
            )
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter((req) => req.status === statusFilter)
        }
        setFilteredRequests(filtered)
    }, [requests, searchTerm, statusFilter])

    const handleViewDetails = (request) => {
        navigate(`/director/requirements/${request.id}`, { state: { request } })
    }

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) {
            setRequests(requests.filter((req) => req.id !== id))
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending_approval: { color: 'bg-yellow-100 text-yellow-800', text: 'Đang chờ duyệt' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Bị từ chối' },
            approved: { color: 'bg-green-100 text-green-800', text: 'Đã được duyệt' },
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
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quản lý Yêu cầu Tuyển dụng</h2>
                        <p className="text-slate-600">Theo dõi và phê duyệt các yêu cầu tuyển dụng (MRF)</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Danh sách Yêu cầu ({filteredRequests.length})</h3>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề, mã, vị trí..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-72 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    {filteredRequests.map((req) => (
                        <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="mb-2">
                                        <h4 className="text-lg font-semibold text-slate-800">{req.title}</h4>
                                        <div className="text-xs text-slate-500">Mã yêu cầu: <span className="font-medium">{req.code}</span></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <span className="text-sm text-slate-600">Vị trí:</span>
                                            <p className="font-medium text-slate-800">{req.position}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Phòng ban:</span>
                                            <p className="font-medium text-slate-800">{req.department}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Trạng thái:</span>
                                            <div className="mt-1">{getStatusBadge(req.status)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                        <div>
                                            <span className="text-sm text-slate-600">Đơn vị:</span>
                                            <p className="font-medium text-slate-800">{req.unit}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Số lượng:</span>
                                            <p className="font-medium text-slate-800">{req.quantity}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Thời gian:</span>
                                            <p className="font-medium text-slate-800">{req.startDate} - {req.endDate}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-600">{req.description}</p>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleViewDetails(req)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Xem chi tiết
                                    </button>
                                    <button
                                        onClick={() => handleDelete(req.id)}
                                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRequests.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-slate-500">Không tìm thấy yêu cầu nào</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DirectorRequestList


