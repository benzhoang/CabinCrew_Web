import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { onLangChange } from '../../i18n'

// Mock data giống Campaign.jsx
const mockCampaigns = [
    {
        id: 1,
        name: 'Tuyển dụng Tiếp viên hàng không 2024',
        position: 'Flight Attendant',
        department: 'Cabin Crew',
        status: 'active',
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
        status: 'paused',
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
        status: 'active',
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
        status: 'active',
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        targetHires: 8,
        currentHires: 2,
        description: 'Tuyển dụng kỹ thuật viên bảo trì máy bay',
        requirements: 'Bằng kỹ thuật, Kinh nghiệm bảo trì, An toàn lao động'
    }
]

// Mock data for applicants
const mockApplicants = [
    {
        id: 1,
        name: 'Nguyễn Thị Lan',
        email: 'lan.nguyen@email.com',
        phone: '0901234567',
        position: 'Flight Attendant',
        appliedDate: '2024-10-15',
        status: 'pending',
        score: null,
        experience: '2 năm',
        education: 'Đại học Ngoại thương',
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        batchName: 'Đợt 1',
        campaignId: 1,
        photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=200&fit=crop&crop=face'
    },
    {
        id: 2,
        name: 'Trần Văn Minh',
        email: 'minh.tran@email.com',
        phone: '0912345678',
        position: 'Flight Attendant',
        appliedDate: '2024-10-16',
        status: 'approved',
        score: 85,
        experience: '3 năm',
        education: 'Đại học Bách khoa',
        languages: ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Nhật'],
        batchName: 'Đợt 1',
        campaignId: 1,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop&crop=face'
    },
    {
        id: 3,
        name: 'Lê Thị Hương',
        email: 'huong.le@email.com',
        phone: '0923456789',
        position: 'Flight Attendant',
        appliedDate: '2024-10-17',
        status: 'rejected',
        score: 65,
        experience: '1 năm',
        education: 'Cao đẳng Du lịch',
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        batchName: 'Đợt 1',
        campaignId: 1,
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=200&fit=crop&crop=face'
    },
    {
        id: 4,
        name: 'Phạm Văn Đức',
        email: 'duc.pham@email.com',
        phone: '0934567890',
        position: 'Flight Attendant',
        appliedDate: '2024-10-18',
        status: 'pending',
        score: null,
        experience: '4 năm',
        education: 'Đại học Kinh tế',
        languages: ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Hàn'],
        batchName: 'Đợt 1',
        campaignId: 1
    },
    {
        id: 5,
        name: 'Võ Thị Mai',
        email: 'mai.vo@email.com',
        phone: '0945678901',
        position: 'Flight Attendant',
        appliedDate: '2024-10-19',
        status: 'interview',
        score: 78,
        experience: '2 năm',
        education: 'Đại học Sư phạm',
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        batchName: 'Đợt 1',
        campaignId: 1
    }
]

const Screening = () => {
    const [campaigns, setCampaigns] = useState(mockCampaigns)
    const [filteredCampaigns, setFilteredCampaigns] = useState(mockCampaigns)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('active')
    const [departmentFilter, setDepartmentFilter] = useState('all')
    const [, setLangVersion] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()

    // Check if we're viewing a specific batch
    const batchData = location.state
    const isViewingBatch = batchData && batchData.batchName && batchData.campaignId

    useEffect(() => {
        const off = onLangChange(() => setLangVersion(v => v + 1))
        return () => off()
    }, [])

    useEffect(() => {
        let filtered = campaigns

        // Mặc định chỉ xem campaign đang hoạt động trên Screening
        filtered = filtered.filter(c => c.status === 'active')

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

        if (departmentFilter !== 'all') {
            filtered = filtered.filter(campaign => campaign.department === departmentFilter)
        }

        setFilteredCampaigns(filtered)
    }, [campaigns, searchTerm, statusFilter, departmentFilter])

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', text: 'Đang hoạt động' },
            completed: { color: 'bg-blue-100 text-blue-800', text: 'Hoàn thành' },
            paused: { color: 'bg-yellow-100 text-yellow-800', text: 'Tạm dừng' }
        }
        const config = statusConfig[status] || statusConfig.active
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    const percent = (current, target) => {
        if (!target || target <= 0) return 0
        const p = Math.round((Number(current || 0) / Number(target)) * 100)
        return Math.max(0, Math.min(100, p))
    }

    const getBatchStatusCfg = (status) => {
        const map = {
            ongoing: { text: 'Đang diễn ra', color: 'bg-green-100 text-green-700' },
            completed: { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-700' },
            planned: { text: 'Đã lên kế hoạch', color: 'bg-slate-100 text-slate-700' },
            upcoming: { text: 'Sắp diễn ra', color: 'bg-yellow-100 text-yellow-800' },
            paused: { text: 'Tạm dừng', color: 'bg-orange-100 text-orange-700' },
            cancelled: { text: 'Hủy', color: 'bg-red-100 text-red-700' },
        }
        return map[status] || map.planned
    }

    const buildBatches = (campaign) => {
        // Lấy thông tin giống DetailInfo.jsx khi thiếu dữ liệu
        if (Array.isArray(campaign?.batches) && campaign.batches.length) return campaign.batches
        const current = Number(campaign?.currentHires ?? 0)
        const target = campaign?.targetHires
        return [
            { name: 'Đợt 1', time: `${campaign?.startDate || '—'} - ${campaign?.endDate || '—'}`, location: '—', method: 'Trực tiếp', owner: '—', status: 'ongoing', current, target, note: 'Phỏng vấn vòng 1' },
        ]
    }

    // Tổng quan để làm header metrics
    const overview = useMemo(() => {
        const list = filteredCampaigns
            .map(c => ({ ...c, batches: buildBatches(c).filter(b => b.status === 'ongoing') }))
            .filter(c => c.batches.length > 0)
        const totalCampaigns = list.length
        const totalBatches = list.reduce((acc, c) => acc + c.batches.length, 0)
        const totalApplicants = list.reduce((acc, c) => acc + c.batches.reduce((s, b) => s + Number(b.current || 0), 0), 0)
        return { totalCampaigns, totalBatches, totalApplicants }
    }, [filteredCampaigns])

    // Filter applicants for specific batch
    const filteredApplicants = useMemo(() => {
        if (!isViewingBatch) return []
        return mockApplicants.filter(applicant =>
            applicant.campaignId === batchData.campaignId &&
            applicant.batchName === batchData.batchName
        )
    }, [isViewingBatch, batchData])

    const getApplicantStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý' },
            approved: { color: 'bg-green-100 text-green-800', text: 'Đã duyệt' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Từ chối' },
            interview: { color: 'bg-blue-100 text-blue-800', text: 'Phỏng vấn' }
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    const handleStatusChange = (applicantId, newStatus) => {
        // Handle status change logic here
        console.log(`Changing status of applicant ${applicantId} to ${newStatus}`)
    }

    const goBackToCampaigns = () => {
        navigate('/recruiter/campaigns')
    }

    if (isViewingBatch) {
        // Render applicant list view
        return (
            <div className="">
                {/* Page hero */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={goBackToCampaigns}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold">Danh sách ứng viên - {batchData.batchName}</h1>
                                <p className="text-white/90 mt-1 text-sm">Sàng lọc và đánh giá ứng viên cho đợt tuyển dụng</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Batch Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Thông tin đợt tuyển</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <span className="text-sm text-slate-600">Tên đợt:</span>
                                <p className="font-medium text-slate-800">{batchData.batchName}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Thời gian:</span>
                                <p className="font-medium text-slate-800">{batchData.batch?.time || '—'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Địa điểm:</span>
                                <p className="font-medium text-slate-800">{batchData.batch?.location || '—'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Chỉ tiêu:</span>
                                <p className="font-medium text-slate-800">{batchData.batch?.current || 0}/{batchData.batch?.target || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Applicants List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">Danh sách ứng viên ({filteredApplicants.length})</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ảnh 4x6</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ứng viên</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Liên hệ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kinh nghiệm</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày ứng tuyển</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Điểm</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredApplicants.map((applicant) => (
                                        <tr key={applicant.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-16 h-20 bg-slate-100 rounded-md overflow-hidden">
                                                    <img
                                                        src={applicant.photo || 'https://via.placeholder.com/64x80/cccccc/666666?text=No+Photo'}
                                                        alt={`Ảnh ${applicant.name}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/64x80/cccccc/666666?text=No+Photo'
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">{applicant.name}</div>
                                                    <div className="text-sm text-slate-500">{applicant.education}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">{applicant.email}</div>
                                                <div className="text-sm text-slate-500">{applicant.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">{applicant.experience}</div>
                                                <div className="text-sm text-slate-500">{applicant.languages.join(', ')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                {applicant.appliedDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getApplicantStatusBadge(applicant.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                {applicant.score ? `${applicant.score}/100` : '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-1">
                                                    <button
                                                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                                                        title="Xem chi tiết"
                                                        onClick={() => navigate(`/candidate/${applicant.id}`, {
                                                            state: {
                                                                candidate: applicant,
                                                                batchData: batchData
                                                            }
                                                        })}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                                                        title="Duyệt ứng viên"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                                        title="Từ chối ứng viên"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredApplicants.length === 0 && (
                            <div className="p-12 text-center">
                                <p className="text-slate-500">Chưa có ứng viên nào cho đợt này</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

const InfoMini = ({ label, value }) => (
    <div>
        <div className="text-slate-500">{label}</div>
        <div className="text-slate-800 font-medium">{value}</div>
    </div>
)

export default Screening


