import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'
import { getCampaignRequests } from '../../service/api'

const RequestList = () => {
    const [campaigns, setCampaigns] = useState([])
    const [filteredCampaigns, setFilteredCampaigns] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [langVersion, setLangVersion] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1))
        return () => off()
    }, [])

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true)
            setError(null)
            try {
                const result = await getCampaignRequests()
                if (result.success) {
                    // Map dữ liệu từ API response sang format component đang dùng
                    const mappedCampaigns = (result.data || []).map(item => ({
                        id: item.requestId,
                        name: item.campaignName || 'N/A',
                        description: item.description || '',
                        targetQuantity: item.targetQuantity || 0,
                        requestType: item.requestType || '',
                        status: item.status || 'pending_approval',
                        rejectReason: item.rejectReason || '',
                        approvedAt: item.approvedAt || '',
                        rejectedAt: item.rejectedAt || '',
                        partnerName: item.partnerName || '',
                        directorName: item.directorName || '',
                        createdAt: item.createdAt || '',
                        // Map các field cũ để tương thích
                        position: item.requestType || '',
                        department: item.partnerName || '',
                    }))
                    setCampaigns(mappedCampaigns)
                } else {
                    setError(result.error || 'Không thể tải danh sách campaign')
                    setCampaigns([])
                }
            } catch (err) {
                console.error('Error fetching campaigns:', err)
                setError('Đã xảy ra lỗi khi tải dữ liệu: ' + (err.message || 'Unknown error'))
                setCampaigns([])
            } finally {
                setLoading(false)
            }
        }

        fetchCampaigns()
    }, [])

    useEffect(() => {
        let filtered = campaigns
        if (searchTerm) {
            filtered = filtered.filter(campaign =>
                (campaign.name && campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (campaign.requestType && campaign.requestType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (campaign.partnerName && campaign.partnerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (campaign.directorName && campaign.directorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(campaign => campaign.status === statusFilter)
        }
        setFilteredCampaigns(filtered)
    }, [campaigns, searchTerm, statusFilter])

    const handleViewDetails = (campaign) => {
        navigate(`/director/requirements/${campaign.id}`, { state: { campaign } })
    }

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa chiến dịch này?')) {
            // TODO: Implement delete API call when available
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

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-slate-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Lỗi: {error}</p>
                </div>
            </div>
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
                                    <div className="mb-2">
                                        <h4 className="text-lg font-semibold text-slate-800">{campaign.name}</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <span className="text-sm text-slate-600">Loại yêu cầu:</span>
                                            <p className="font-medium text-slate-800">{campaign.requestType || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Số lượng mục tiêu:</span>
                                            <p className="font-medium text-slate-800">{campaign.targetQuantity || 0}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Trạng thái:</span>
                                            <div className="mt-1">{getStatusBadge(campaign.status)}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        {campaign.partnerName ? (
                                            <div>
                                                <span className="text-sm text-slate-600">Đối tác:</span>
                                                <p className="font-medium text-slate-800">{campaign.partnerName}</p>
                                            </div>
                                        ) : (
                                            <div></div>
                                        )}
                                        {campaign.directorName && (
                                            <div>
                                                <span className="text-sm text-slate-600">Giám đốc:</span>
                                                <p className="font-medium text-slate-800">{campaign.directorName}</p>
                                            </div>
                                        )}
                                    </div>
                                    {campaign.createdAt && (
                                        <div className="mb-2">
                                            <span className="text-sm text-slate-600">Ngày tạo:</span>
                                            <p className="font-medium text-slate-800">
                                                {new Date(campaign.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    )}

                                    {campaign.description && (
                                        <p className="text-sm text-slate-600">{campaign.description}</p>
                                    )}
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
        </div>
    )
}

export default RequestList