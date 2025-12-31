import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { onLangChange } from '../../i18n'
import { getCampaignRoundById, getRoundParticipants } from '../../service/api'

const DirectorApplyList = () => {
    const [campaigns, setCampaigns] = useState([])
    const [filteredCampaigns, setFilteredCampaigns] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('active')
    const [departmentFilter, setDepartmentFilter] = useState('all')
    const [roundFilter, setRoundFilter] = useState('all')
    const [applicantSearchTerm, setApplicantSearchTerm] = useState('')
    const [, setLangVersion] = useState(0)
    const [campaignRoundData, setCampaignRoundData] = useState(null)
    const [availableRounds, setAvailableRounds] = useState([])
    const [loadingRoundData, setLoadingRoundData] = useState(false)
    const [participants, setParticipants] = useState([])
    const [loadingParticipants, setLoadingParticipants] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const params = useParams()

    // Check if we're viewing a specific batch
    const batchData = location.state
    // Nếu có id trong URL params, đang xem batch cụ thể
    const isViewingBatch = params.id || (batchData && batchData.batchName && batchData.campaignId)

    useEffect(() => {
        const off = onLangChange(() => setLangVersion(v => v + 1))
        return () => off()
    }, [])

    // Gọi API để lấy thông tin đợt tuyển khi đang xem batch
    useEffect(() => {
        const fetchCampaignRoundData = async () => {
            if (!isViewingBatch) {
                setCampaignRoundData(null)
                setAvailableRounds([])
                return
            }

            // Ưu tiên lấy campaignRoundId từ URL params (id)
            // Nếu không có thì lấy từ batchData
            const campaignRoundId = params.id || batchData?.batch?.id || batchData?.batch?.campaignRoundId || batchData?.campaignRoundId

            if (!campaignRoundId) {
                console.warn('Campaign round ID not found')
                return
            }

            setLoadingRoundData(true)
            try {
                const result = await getCampaignRoundById(campaignRoundId)
                if (result.success && result.data) {
                    setCampaignRoundData(result.data)
                    // Lưu danh sách rounds từ API để sử dụng cho filter
                    const rounds = result.data.rounds || []
                    setAvailableRounds(rounds)
                } else {
                    console.error('Lỗi khi lấy thông tin đợt tuyển:', result.error)
                }
            } catch (error) {
                console.error('Lỗi khi gọi API getCampaignRoundById:', error)
            } finally {
                setLoadingRoundData(false)
            }
        }

        fetchCampaignRoundData()
    }, [isViewingBatch, params.id, batchData])

    // Gọi API để lấy danh sách participants theo roundId khi filter thay đổi
    useEffect(() => {
        const fetchParticipants = async () => {
            if (!isViewingBatch) {
                setParticipants([])
                return
            }

            // Nếu chọn "final", không gọi API
            if (roundFilter === 'final') {
                setParticipants([])
                return
            }

            let roundId = null

            // Nếu chọn "all", lấy round đầu tiên từ availableRounds
            if (roundFilter === 'all') {
                if (availableRounds.length > 0) {
                    roundId = availableRounds[0].roundId
                } else {
                    // Chưa có rounds, đợi rounds được load
                    setParticipants([])
                    return
                }
            } else {
                // Lấy roundId từ roundFilter
                roundId = roundFilter
            }

            // Kiểm tra roundId hợp lệ
            if (!roundId || roundId === 'final') {
                setParticipants([])
                return
            }

            setLoadingParticipants(true)
            try {
                const result = await getRoundParticipants(roundId)
                if (result.success && result.data && Array.isArray(result.data)) {
                    // Map dữ liệu từ API sang format hiển thị theo cấu trúc response
                    // Response structure: { code: 0, message: "string", data: { items: [...], currentPage, pageSize, ... } }
                    const mappedParticipants = result.data.map((participant) => ({
                        id: participant.userId || participant.activityId,
                        activityId: participant.activityId || 0,
                        userId: participant.userId || 0,
                        name: participant.fullName || '',
                        email: participant.email || '',
                        phone: participant.phoneNumber || '',
                        photo: participant.imgURL || '',
                        status: participant.status || 'pending',
                        roundId: participant.roundId || 0,
                        roundName: participant.roundName || '',
                        // Giữ các field khác nếu cần
                        appliedDate: participant.appliedDate || new Date().toISOString().split('T')[0],
                        education: participant.education || '',
                    }))
                    setParticipants(mappedParticipants)
                } else {
                    console.error('Lỗi khi lấy danh sách ứng viên:', result.error || 'Dữ liệu không hợp lệ')
                    setParticipants([])
                }
            } catch (error) {
                console.error('Lỗi khi gọi API getRoundParticipants:', error)
                setParticipants([])
            } finally {
                setLoadingParticipants(false)
            }
        }

        fetchParticipants()
    }, [isViewingBatch, roundFilter, availableRounds])

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
            active: { color: 'bg-green-100 text-green-800', text: 'Active' },
            completed: { color: 'bg-blue-100 text-blue-800', text: 'Completed' },
            paused: { color: 'bg-yellow-100 text-yellow-800', text: 'Paused' }
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
            ongoing: { text: 'Ongoing', color: 'bg-green-100 text-green-700' },
            completed: { text: 'Completed', color: 'bg-blue-100 text-blue-700' },
            planned: { text: 'Planned', color: 'bg-slate-100 text-slate-700' },
            upcoming: { text: 'Upcoming', color: 'bg-yellow-100 text-yellow-800' },
            paused: { text: 'Paused', color: 'bg-orange-100 text-orange-700' },
            cancelled: { text: 'Cancelled', color: 'bg-red-100 text-red-700' },
        }
        return map[status] || map.planned
    }

    const buildBatches = (campaign) => {
        // Lấy thông tin giống DetailInfo.jsx khi thiếu dữ liệu
        if (Array.isArray(campaign?.batches) && campaign.batches.length) return campaign.batches
        const current = Number(campaign?.currentHires ?? 0)
        const target = campaign?.targetHires
        return [
            { name: 'Batch 1', time: `${campaign?.startDate || '—'} - ${campaign?.endDate || '—'}`, location: '—', method: 'In person', owner: '—', status: 'ongoing', current, target, note: 'Interview round 1' },
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

        // Chỉ sử dụng participants từ API, không dùng mock data
        let list = [...participants]

        // Filter theo roundFilter
        if (roundFilter === 'final') {
            // Lọc theo kết quả cuối cùng: đã có quyết định cuối (đã duyệt hoặc từ chối)
            list = list.filter(a => a.status === 'approved' || a.status === 'rejected')
        } else if (roundFilter !== 'all') {
            // Filter theo roundId được chọn
            const selectedRoundId = String(roundFilter)
            list = list.filter(a => {
                if (a.roundId && String(a.roundId) === selectedRoundId) return true
                if (a.roundName) {
                    const selectedRound = availableRounds.find(r => String(r.roundId) === selectedRoundId)
                    return selectedRound && a.roundName === selectedRound.roundName
                }
                return false
            })
        }
        // Nếu roundFilter === 'all', hiển thị tất cả participants (đã được load từ round đầu tiên)

        // Áp dụng search filter
        if (applicantSearchTerm) {
            const q = applicantSearchTerm.toLowerCase()
            list = list.filter(a =>
                (a.name || '').toLowerCase().includes(q) ||
                (a.email || '').toLowerCase().includes(q) ||
                (a.phone || '').toLowerCase().includes(q)
            )
        }

        return list
    }, [isViewingBatch, roundFilter, availableRounds, participants, applicantSearchTerm])

    const getRoundText = (rounds) => {
        const map = {
            screening: 'Screening round',
            grooming: 'Grooming round',
            test: 'Test round',
            interview: 'Interview round'
        }
        return map[rounds] || 'Screening round'
    }

    const getApplicantStatusBadge = (status) => {
        // Normalize status to handle case variations
        const normalizedStatus = status ? String(status).toLowerCase() : "";

        const statusConfig = {
            ongoing: { color: "bg-yellow-100 text-yellow-800", text: "Ongoing" },
            passed: { color: "bg-green-100 text-green-800", text: "Passed" },
            failed: { color: "bg-red-100 text-red-800", text: "Failed" },
            pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
        };
        const config = statusConfig[normalizedStatus] || statusConfig.pending;
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
            >
                {config.text}
            </span>
        );
    }

    const getRoundBadge = (round, applicant = null) => {
        // Nếu có rounds từ API, tìm round tương ứng
        if (availableRounds.length > 0) {
            let foundRound = null

            // Tìm round theo roundId hoặc roundName từ applicant
            if (applicant) {
                if (applicant.roundId) {
                    foundRound = availableRounds.find(r => String(r.roundId) === String(applicant.roundId))
                } else if (applicant.roundName) {
                    foundRound = availableRounds.find(r => r.roundName === applicant.roundName)
                } else if (round) {
                    // Fallback: tìm theo round string nếu có
                    foundRound = availableRounds.find(r =>
                        String(r.roundId) === String(round) ||
                        r.roundName?.toLowerCase() === String(round).toLowerCase()
                    )
                }
            } else if (round) {
                // Nếu chỉ có round (roundId hoặc roundName)
                foundRound = availableRounds.find(r =>
                    String(r.roundId) === String(round) ||
                    r.roundName?.toLowerCase() === String(round).toLowerCase()
                )
            }

            if (foundRound) {
                // Sử dụng màu mặc định cho tất cả rounds từ API
                const color = 'bg-indigo-100 text-indigo-800'
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                        {foundRound.roundName}
                    </span>
                )
            }
        }

        // Fallback for "final result"
        if (round === 'final') {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-800">
                    Final result
                </span>
            )
        }

        // Fallback mặc định nếu không tìm thấy
        return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {round || 'Not specified'}
            </span>
        )
    }

    const handleStatusChange = (applicantId, newStatus) => {
        // Handle status change logic here
        console.log(`Changing status of applicant ${applicantId} to ${newStatus}`)
    }

    const goBackToCampaigns = () => {
        navigate('/director/campaigns')
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
                                <h1 className="text-2xl md:text-3xl font-extrabold">Applicants - {campaignRoundData?.roundName || batchData?.batchName || 'Hiring batch'}</h1>
                                <p className="text-white/90 mt-1 text-sm">Screen and evaluate applicants for this batch</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Batch Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Batch information</h3>
                        {loadingRoundData ? (
                            <div className="text-center py-4">
                                <p className="text-slate-500">Loading batch information...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                    <span className="text-sm text-slate-600">Batch name:</span>
                                    <p className="font-medium text-slate-800">{campaignRoundData?.roundName || batchData?.batchName || '—'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-600">Start date:</span>
                                    <p className="font-medium text-slate-800">
                                        {campaignRoundData?.startDate || batchData.batch?.time?.split(' - ')[0] || '—'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-600">End date:</span>
                                    <p className="font-medium text-slate-800">
                                        {campaignRoundData?.endDate || batchData.batch?.time?.split(' - ')[1] || '—'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-600">Description:</span>
                                    <p className="font-medium text-slate-800">{campaignRoundData?.description || '—'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-600">Target applicants:</span>
                                    <p className="font-medium text-slate-800">
                                        {campaignRoundData
                                            ? `${campaignRoundData.actualQuantiy || 0}/${campaignRoundData.targetQuantity || 0} applicants`
                                            : `${batchData.batch?.current || 0}/${batchData.batch?.target || 0}`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Applicants List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <h3 className="text-lg font-semibold text-slate-800">Applicants ({filteredApplicants.length})</h3>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-slate-600">Round:</label>
                                        <select
                                            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={roundFilter}
                                            onChange={(e) => setRoundFilter(e.target.value)}
                                            disabled={loadingRoundData}
                                        >
                                            {loadingRoundData ? (
                                                <option value="" disabled>Loading...</option>
                                            ) : availableRounds.length > 0 ? (
                                                availableRounds.map((round) => (
                                                    <option key={round.roundId} value={round.roundId}>
                                                        {round.roundName}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No round data</option>
                                            )}
                                        </select>
                                    </div>
                                    <div className="relative md:w-64 w-full">
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, phone..."
                                            className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={applicantSearchTerm}
                                            onChange={(e) => setApplicantSearchTerm(e.target.value)}
                                        />
                                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loadingParticipants ? (
                                <div className="p-12 text-center">
                                    <p className="text-slate-500">Loading applicants...</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Photo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applicant</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applied date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Round</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                    {applicant.appliedDate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getApplicantStatusBadge(applicant.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getRoundBadge(applicant.roundId || applicant.roundName || applicant.round, applicant)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                                    <button
                                                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                                                        title="View detail"
                                                        onClick={() =>
                                                            navigate(`/candidate/${applicant.activityId}`, {
                                                                state: {
                                                                    candidate: applicant,
                                                                    batchData: batchData
                                                                }
                                                            })
                                                        }
                                                    >
                                                        <svg
                                                            className="w-4 h-4 mx-auto"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {!loadingParticipants && filteredApplicants.length === 0 && (
                            <div className="p-12 text-center">
                                <p className="text-slate-500">No applicants for this batch yet</p>
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

export default DirectorApplyList