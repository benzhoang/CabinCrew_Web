import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// Mock data cho ứng viên đã có kết quả cuối cùng
const mockFinalCandidates = [
    {
        id: 1,
        name: 'Nguyễn Thị Lan',
        email: 'lan.nguyen@email.com',
        phone: '0901234567',
        position: 'Flight Attendant',
        appliedDate: '2024-10-15',
        status: 'approved',
        score: 92,
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
        score: 88,
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
        status: 'approved',
        score: 90,
        experience: '4 năm',
        education: 'Đại học Kinh tế',
        languages: ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Hàn'],
        batchName: 'Đợt 1',
        campaignId: 1,
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=200&fit=crop&crop=face'
    },
]

const FinalReview = () => {
    const [candidates, setCandidates] = useState(mockFinalCandidates)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const navigate = useNavigate()
    const location = useLocation()
    const batchData = location.state?.batch

    // Filter candidates
    const filteredCandidates = useMemo(() => {
        let filtered = candidates.filter(candidate =>
            candidate.status === 'approved' || candidate.status === 'rejected'
        )

        if (searchTerm) {
            const q = searchTerm.toLowerCase()
            filtered = filtered.filter(candidate =>
                candidate.name.toLowerCase().includes(q) ||
                candidate.email.toLowerCase().includes(q) ||
                candidate.phone.toLowerCase().includes(q)
            )
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(candidate => candidate.status === statusFilter)
        }

        return filtered
    }, [candidates, searchTerm, statusFilter])

    const getStatusBadge = (status) => {
        const statusConfig = {
            approved: { color: 'bg-green-100 text-green-800', text: 'Đã duyệt' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Từ chối' }
        }
        const config = statusConfig[status] || statusConfig.approved
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    const handleExport = () => {
        // TODO: Implement export functionality
        alert('Tính năng Export đang được phát triển')
    }

    const handleImport = () => {
        // TODO: Implement import functionality
        alert('Tính năng Import đang được phát triển')
    }

    const handleBack = () => {
        if (batchData) {
            navigate(`/recruiter/campaigns/${batchData.campaignId}`, { state: batchData })
        } else {
            navigate('/recruiter/campaigns')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold">Xét hậu kiểm</h1>
                                <p className="text-white/90 mt-1 text-sm">Danh sách ứng viên đã có kết quả cuối cùng</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Batch Info */}
                {batchData && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Thông tin đợt tuyển</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span className="text-sm text-slate-600">Tên đợt:</span>
                                <p className="font-medium text-slate-800">{batchData.name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Thời gian:</span>
                                <p className="font-medium text-slate-800">{batchData.time || '—'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Địa điểm:</span>
                                <p className="font-medium text-slate-800">{batchData.location || '—'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <label className="text-sm text-slate-600">Lọc theo trạng thái:</label>
                            <select
                                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Từ chối</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên, email, SĐT..."
                                    className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200">
                        <button
                            onClick={handleImport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Import
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            Export
                        </button>
                    </div>
                </div>

                {/* Candidates List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800">
                            Danh sách ứng viên ({filteredCandidates.length})
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ảnh 4x6</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ứng viên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Liên hệ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Điểm số</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredCandidates.map((candidate) => (
                                    <tr key={candidate.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-16 h-20 bg-slate-100 rounded-md overflow-hidden">
                                                <img
                                                    src={candidate.photo || 'https://via.placeholder.com/64x80/cccccc/666666?text=No+Photo'}
                                                    alt={`Ảnh ${candidate.name}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/64x80/cccccc/666666?text=No+Photo'
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{candidate.name}</div>
                                                <div className="text-sm text-slate-500">{candidate.education}</div>
                                                <div className="text-xs text-slate-400">{candidate.experience}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{candidate.email}</div>
                                            <div className="text-sm text-slate-500">{candidate.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-lg font-bold ${candidate.score >= 85 ? 'text-green-600' : candidate.score >= 70 ? 'text-blue-600' : 'text-red-600'}`}>
                                                {candidate.score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(candidate.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded px-3 py-1 transition-colors"
                                                onClick={() => navigate(`/candidate/${candidate.id}`, {
                                                    state: { candidate, batchData }
                                                })}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCandidates.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-slate-500">Chưa có ứng viên nào đạt kết quả cuối cùng</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FinalReview

