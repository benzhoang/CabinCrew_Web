import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BatchCard = ({ batch, statusCfg, percent, campaignId }) => {
    const [openStats, setOpenStats] = useState(false)
    const navigate = useNavigate()

    const handleViewApplicants = () => {
        navigate('/applications', {
            state: {
                campaignId,
                batchName: batch.name,
                batch: batch
            }
        })
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="text-sm font-semibold text-slate-800">{batch.name}</div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.color}`}>{statusCfg.text}</span>
            </div>
            <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <InfoMini label="Thời gian" value={batch.time} />
                    <InfoMini label="Địa điểm" value={batch.location || '—'} />
                    <InfoMini label="Hình thức" value={batch.method || '—'} />
                    <InfoMini label="Phụ trách" value={batch.owner || '—'} />
                    {batch.target !== undefined && (
                        <InfoMini label="Chỉ tiêu" value={`${batch.current ?? 0}/${batch.target}`} />
                    )}
                    {batch.note && (
                        <InfoMini label="Ghi chú" value={batch.note} />
                    )}
                </div>

                {/* Applicant Statistics Dropdown */}
                {(batch.totalApplicants !== undefined || batch.appliedCandidates !== undefined) && (
                    <div className="border-t border-slate-100 pt-3">
                        <button
                            onClick={() => setOpenStats(!openStats)}
                            className="w-full flex items-center justify-between text-xs text-slate-700 font-medium hover:text-blue-600 transition"
                        >
                            <span>Thống kê ứng viên</span>
                            <span>{openStats ? '▲' : '▼'}</span>
                        </button>
                        {openStats && (
                            <div className="mt-3">
                                <div className="grid grid-cols-2 gap-3">
                                    {batch.totalApplicants !== undefined && (
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <div className="text-xs text-blue-600 mb-1">Lượt quan tâm</div>
                                            <div className="text-lg font-bold text-blue-700">{batch.totalApplicants}</div>
                                        </div>
                                    )}
                                    {batch.appliedCandidates !== undefined && (
                                        <div className="bg-green-50 rounded-lg p-3">
                                            <div className="text-xs text-green-600 mb-1">Đã ứng tuyển</div>
                                            <div className="text-lg font-bold text-green-700">{batch.appliedCandidates}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Recruitment Progress */}
                {batch.target !== undefined && (
                    <div className="border-t border-slate-100 pt-3">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                            <span>Tiến độ tuyển dụng</span>
                            <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                        </div>
                    </div>
                )}

                {/* View Applicants Button */}
                <div className="border-t border-slate-100 pt-3">
                    <button
                        onClick={handleViewApplicants}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 rounded-md transition-colors duration-200 font-medium"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Xem danh sách ứng viên
                    </button>
                </div>
            </div>
        </div>
    )
}

const BatchManagement = ({ campaign, onCreateBatch }) => {
    const batches = Array.isArray(campaign?.batches) && campaign.batches.length ? campaign.batches : [
        {
            name: 'Đợt 1',
            time: '01/10/2024 - 15/10/2024',
            location: 'Hà Nội',
            method: 'Trực tiếp',
            owner: 'Nguyễn Thanh Tùng',
            status: 'ongoing',
            current: 7,
            target: 10,
            totalApplicants: 125,
            appliedCandidates: 89,
            note: 'Phỏng vấn vòng 1'
        },
        {
            name: 'Đợt 2',
            time: '01/11/2024 - 15/11/2024',
            location: 'TP.HCM',
            method: 'Trực tiếp',
            owner: 'Trần Bảo Vy',
            status: 'upcoming',
            current: 0,
            target: 10,
            totalApplicants: 0,
            appliedCandidates: 0,
            note: 'Phỏng vấn vòng 2'
        },
    ]

    const getStatus = (status) => {
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

    const percent = (current, target) => {
        if (!target || target <= 0) return 0
        const p = Math.round((Number(current || 0) / Number(target)) * 100)
        return Math.max(0, Math.min(100, p))
    }

    const handleCreateBatch = () => {
        if (onCreateBatch && typeof onCreateBatch === 'function') {
            onCreateBatch()
        } else {
            // Default action - you can customize this
            console.log('Create new batch')
        }
    }

    return (
        <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-600">Kế hoạch các đợt tuyển</div>
                <button
                    onClick={handleCreateBatch}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 font-medium"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo đợt
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batches.map((batch, index) => {
                    const statusCfg = getStatus(batch.status)
                    const progressPercent = percent(batch.current, batch.target)
                    return (
                        <BatchCard
                            key={index}
                            batch={batch}
                            statusCfg={statusCfg}
                            percent={progressPercent}
                            campaignId={campaign?.id || 1}
                        />
                    )
                })}
            </div>
        </div>
    )
}

const InfoMini = ({ label, value }) => (
    <div>
        <div className="text-slate-500">{label}</div>
        <div className="text-slate-800 font-medium">{value}</div>
    </div>
)

export default BatchManagement
