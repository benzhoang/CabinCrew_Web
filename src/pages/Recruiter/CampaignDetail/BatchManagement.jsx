import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// Helper function to format date for display
const formatDateForDisplay = (dateString, fallbackTime = null, isEndDate = false) => {
    if (!dateString) {
        if (fallbackTime) {
            if (fallbackTime.includes(' - ')) {
                return isEndDate ? fallbackTime.split(' - ')[1] : fallbackTime.split(' - ')[0]
            }
            return fallbackTime
        }
        return '—'
    }

    try {
        // If it's already in "dd/mm/yyyy" format, return as is
        if (dateString.includes('/') && !dateString.includes('T')) {
            return dateString.split(' ')[0]
        }

        // Try to parse as Date
        const date = new Date(dateString)
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('vi-VN')
        }
    } catch (e) {
        // If parsing fails, return the original string
        return dateString.split(' ')[0] || '—'
    }

    return dateString.split(' ')[0] || '—'
}

const BatchCard = ({ batch, statusCfg, percent, campaignId }) => {
    const [openStats, setOpenStats] = useState(false)
    const navigate = useNavigate()

    // Kiểm tra xem đợt có đang "sắp diễn ra" không
    const isUpcoming = batch.status === 'upcoming'

    const handleViewApplicants = () => {
        // Không cho phép xem danh sách ứng viên nếu đợt đang "sắp diễn ra"
        if (isUpcoming) {
            return
        }

        const campaignRoundId = batch.id || batch.campaignRoundId
        navigate(`/recruiter/applications/${campaignRoundId}`, {
            state: {
                campaignId,
                batchName: batch.name,
                batch: batch
            }
        })
    }

    const handleFinalReview = () => {
        navigate('/recruiter/final-review', {
            state: {
                batch: batch,
                campaignId: campaignId
            }
        })
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="text-sm font-semibold text-slate-800">
                    {batch.name}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.color}`}>{statusCfg.text}</span>
            </div>
            <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <InfoMini
                        label="Thời gian bắt đầu"
                        value={formatDateForDisplay(batch.startDate, batch.time, false)}
                    />
                    <InfoMini
                        label="Thời gian kết thúc"
                        value={formatDateForDisplay(batch.endDate, batch.time, true)}
                    />
                    <InfoMini label="Địa điểm" value={batch.location || '—'} />
                    <InfoMini label="Hình thức" value={batch.method || '—'} />
                    <InfoMini label="Phụ trách" value={batch.owner || '—'} />
                    {batch.target !== undefined && batch.target !== null && (
                        <InfoMini label="Chỉ tiêu" value={batch.target.toString()} />
                    )}
                    {batch.note && (
                        <InfoMini label="Ghi chú" value={batch.note} />
                    )}
                    {(batch.appliedCandidates !== undefined && batch.appliedCandidates !== null) && (
                        <InfoMini label="Thực tế" value={batch.appliedCandidates?.toString() || '0'} />
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
                <div className="border-t border-slate-100 pt-3 space-y-2">
                    <button
                        onClick={handleViewApplicants}
                        disabled={isUpcoming}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-md transition-colors duration-200 font-medium ${isUpcoming
                            ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800'
                            }`}
                        title={isUpcoming ? 'Chưa thể xem danh sách ứng viên vì đợt chưa bắt đầu' : 'Xem danh sách ứng viên'}
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        {isUpcoming ? 'Chưa thể xem danh sách' : 'Xem danh sách ứng viên'}
                    </button>

                    {/* Post-Recruitment Review Button */}
                    <button
                        onClick={handleFinalReview}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-md transition-colors duration-200 font-medium bg-orange-100 hover:bg-orange-200 text-orange-700 hover:text-orange-800"
                        title="Xét hậu kiểm ứng viên"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Xét hậu kiểm
                    </button>
                </div>
            </div>
        </div>
    )
}

// Format date từ API (có thể là "13/11/2025 00:00" hoặc ISO string)
const formatDateFromAPI = (dateString) => {
    if (!dateString) return ''
    if (typeof dateString !== 'string') return ''

    // Nếu đã là format "dd/mm/yyyy HH:mm"
    if (dateString.includes('/')) {
        // Convert "13/11/2025 00:00" to "2025-11-13"
        const parts = dateString.split(' ')[0].split('/')
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0')
            const month = parts[1].padStart(2, '0')
            const year = parts[2]
            return `${year}-${month}-${day}`
        }
    }

    // Nếu là ISO string, giữ nguyên format
    if (dateString.includes('T') || dateString.includes('-')) {
        return dateString.split('T')[0]
    }

    return dateString
}

// Convert rounds từ API thành format cho component
const convertRoundsToBatches = (rounds) => {
    if (!Array.isArray(rounds) || rounds.length === 0) {
        console.log('convertRoundsToBatches: No rounds data or empty array')
        return []
    }

    console.log('convertRoundsToBatches: Converting rounds:', rounds)

    return rounds.map((round, index) => {
        // Map status từ API sang status của component
        const statusMap = {
            'Upcoming': 'upcoming',
            'Ongoing': 'ongoing',
            'Completed': 'completed',
            'Draft': 'planned',
            'Cancelled': 'cancelled',
            'Paused': 'paused'
        }

        const mappedStatus = statusMap[round.status] || round.status?.toLowerCase() || 'planned'

        // Format dates
        const startDate = formatDateFromAPI(round.startDate)
        const endDate = formatDateFromAPI(round.endDate)

        // Format time string for display
        const timeString = round.startDate && round.endDate
            ? `${round.startDate.split(' ')[0]} - ${round.endDate.split(' ')[0]}`
            : ''

        const batchData = {
            id: round.campaignRoundId || round.id || index,
            name: round.roundName || round.name || `Đợt ${index + 1}`,
            startDate: startDate,
            endDate: endDate,
            time: timeString,
            location: round.location || '',
            method: round.method || 'Trực tiếp',
            owner: round.owner || '',
            status: mappedStatus,
            target: round.targetQuantity || round.target || 0,
            totalApplicants: round.totalApplicants || 0,
            appliedCandidates: round.actualQuantity || round.actualQuantiy || 0, // Fix: actualQuantity is correct spelling
            note: round.description || round.note || '',
            description: round.description || ''
        }

        console.log(`convertRoundsToBatches: Round ${index} converted:`, batchData)
        return batchData
    })
}

const BatchManagement = ({ campaign }) => {
    const [currentBatches, setCurrentBatches] = useState(() => {
        console.log('BatchManagement: Initializing with campaign:', campaign)
        // Ưu tiên dùng rounds từ campaign data
        if (campaign?.rounds && Array.isArray(campaign.rounds) && campaign.rounds.length > 0) {
            console.log('BatchManagement: Found rounds in campaign:', campaign.rounds)
            return convertRoundsToBatches(campaign.rounds)
        }
        // Fallback: dùng batches nếu có
        if (Array.isArray(campaign?.batches) && campaign.batches.length > 0) {
            console.log('BatchManagement: Found batches in campaign:', campaign.batches)
            return campaign.batches
        }
        // Không có data, trả về mảng rỗng
        console.log('BatchManagement: No rounds or batches found')
        return []
    })

    // Update khi campaign data thay đổi
    useEffect(() => {
        console.log('BatchManagement: Campaign data changed:', campaign)
        if (campaign?.rounds && Array.isArray(campaign.rounds)) {
            console.log('BatchManagement: Updating batches from rounds:', campaign.rounds)
            const convertedBatches = convertRoundsToBatches(campaign.rounds)
            console.log('BatchManagement: Converted batches:', convertedBatches)
            setCurrentBatches(convertedBatches)
        } else if (Array.isArray(campaign?.batches) && campaign.batches.length > 0) {
            console.log('BatchManagement: Updating batches from batches array:', campaign.batches)
            setCurrentBatches(campaign.batches)
        } else {
            console.log('BatchManagement: No rounds or batches, clearing batches')
            setCurrentBatches([])
        }
    }, [campaign])

    const getStatus = (status) => {
        const map = {
            ongoing: { text: 'Đang diễn ra', color: 'bg-green-100 text-green-700' },
            completed: { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-700' },
            planned: { text: 'Đã kết thúc', color: 'bg-slate-100 text-slate-700' },
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

    return (
        <div className="mt-6">
            <div className="mb-2">
                <div className="text-sm text-slate-600">
                    Kế hoạch các đợt tuyển
                </div>
            </div>
            {currentBatches.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-slate-500 text-sm">
                    Chưa có đợt tuyển nào.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentBatches.map((batch, index) => {
                        const statusCfg = getStatus(batch.status)
                        const progressPercent = percent(batch.appliedCandidates || 0, batch.target)
                        return (
                            <BatchCard
                                key={batch.id || index}
                                batch={batch}
                                statusCfg={statusCfg}
                                percent={progressPercent}
                                campaignId={campaign?.campaignId || campaign?.id || 1}
                            />
                        )
                    })}
                </div>
            )}
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