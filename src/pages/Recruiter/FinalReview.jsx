import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { exportFinalReviewExcel } from './Export & Import/exportFinalReview'
import ImportHauKiemModal from './Export & Import/ImportHauKiemModal'
import { getCampaignRoundById, getRoundParticipants, exportRoundUsers } from '../../service/api'

const FinalReview = () => {
    const { campaignRoundId } = useParams()
    const [candidates, setCandidates] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [loadingRoundInfo, setLoadingRoundInfo] = useState(false)
    const [loadingCandidates, setLoadingCandidates] = useState(false)
    const [fetchError, setFetchError] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [finalRoundId, setFinalRoundId] = useState(null)
    const [campaignId, setCampaignId] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()
    const batchData = location.state?.batch
    const resolvedCampaignRoundId = useMemo(
        () => campaignRoundId || batchData?.campaignRoundId || batchData?.id,
        [campaignRoundId, batchData]
    )

    // Khởi tạo campaignId từ location.state ngay khi component mount
    useEffect(() => {
        const initialCampaignId = location.state?.campaignId || batchData?.campaignId
        if (initialCampaignId) {
            setCampaignId(initialCampaignId)
        }
    }, [location.state, batchData])

    useEffect(() => {
        if (!resolvedCampaignRoundId) {
            setFinalRoundId(null)
            setFetchError('Cannot find recruitment batch information to determine Final round.')
            return
        }

        const fetchRoundInfo = async () => {
            setLoadingRoundInfo(true)
            setFetchError(null)
            try {
                const result = await getCampaignRoundById(resolvedCampaignRoundId)
                if (result.success && result.data) {
                    const roundData = result.data
                    const roundsList = Array.isArray(roundData.rounds) ? roundData.rounds : []

                    // Lưu campaignId từ nhiều nguồn
                    const fetchedCampaignId =
                        location.state?.campaignId ||
                        roundData.campaignId ||
                        batchData?.campaignId ||
                        null
                    if (fetchedCampaignId) {
                        setCampaignId(fetchedCampaignId)
                    }

                    // Tìm round có roundName là 'Final'
                    let finalRound =
                        roundsList.find((round) => round.roundName?.toLowerCase() === 'final') || null

                    // Fallback: nếu bản thân round hiện tại là Final
                    if (!finalRound && roundData.roundName?.toLowerCase() === 'final') {
                        finalRound = {
                            roundId: roundData.roundId || roundData.campaignRoundId || resolvedCampaignRoundId,
                            roundName: roundData.roundName
                        }
                    }

                    if (finalRound?.roundId) {
                        setFinalRoundId(finalRound.roundId)
                    } else {
                        setFinalRoundId(null)
                        setFetchError('Could not find a Final round in this recruitment batch.')
                    }
                } else {
                    setFinalRoundId(null)
                    setFetchError(result.error || 'Unable to load recruitment batch information.')
                }
            } catch (error) {
                setFinalRoundId(null)
                setFetchError(error.message || 'Unable to load recruitment batch information.')
            } finally {
                setLoadingRoundInfo(false)
            }
        }

        fetchRoundInfo()
    }, [resolvedCampaignRoundId])

    useEffect(() => {
        if (!finalRoundId) {
            setCandidates([])
            setPagination(null)
            return
        }

        const fetchParticipants = async () => {
            setLoadingCandidates(true)
            setFetchError(null)
            try {
                const result = await getRoundParticipants(finalRoundId, { roundName: 'Final' })
                if (result.success && Array.isArray(result.data)) {
                    const mappedCandidates = result.data.map((participant) => ({
                        id: participant.userId || participant.activityId,
                        activityId: participant.activityId || 0,
                        userId: participant.userId || 0,
                        name: participant.fullName || '',
                        email: participant.email || '',
                        phone: participant.phoneNumber || '',
                        photo: participant.imgURL || '',
                        status: participant.status?.toLowerCase() || 'pending',
                        roundId: participant.roundId || finalRoundId,
                        roundName: participant.roundName || 'Final',
                        appliedDate: participant.appliedDate || new Date().toISOString().split('T')[0],
                        education: participant.education || '',
                        experience: participant.experience || '',
                        batchName: batchData?.name || participant.roundName || 'Final',
                        campaignId: batchData?.campaignId || participant.campaignId || 0,
                        raw: participant
                    }))
                    setCandidates(mappedCandidates)
                    setPagination(result.pagination || null)
                } else {
                    setCandidates([])
                    setPagination(null)
                    setFetchError(result.error || 'Unable to load candidate list.')
                }
            } catch (error) {
                setCandidates([])
                setPagination(null)
                setFetchError(error.message || 'Unable to load candidate list.')
            } finally {
                setLoadingCandidates(false)
            }
        }

        fetchParticipants()
    }, [finalRoundId, batchData])

    // Filter candidates
    const filteredCandidates = useMemo(() => {
        // Bắt đầu từ toàn bộ danh sách, không auto lọc chỉ approved/rejected
        let filtered = [...candidates]

        if (searchTerm) {
            const q = searchTerm.toLowerCase()
            filtered = filtered.filter(candidate =>
                candidate.name.toLowerCase().includes(q) ||
                candidate.email.toLowerCase().includes(q) ||
                candidate.phone.toLowerCase().includes(q)
            )
        }

        if (statusFilter !== 'all') {
            const normalizedFilter = statusFilter.toLowerCase()
            filtered = filtered.filter(candidate => (candidate.status || '').toLowerCase() === normalizedFilter)
        }

        return filtered
    }, [candidates, searchTerm, statusFilter])

    const getStatusBadge = (status) => {
        const normalized = status ? String(status).toLowerCase() : ''
        const statusConfig = {
            passed: { color: 'bg-green-100 text-green-800', text: 'Passed' },
            failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
            ongoing: { color: 'bg-blue-100 text-blue-800', text: 'In progress' }
        }
        const config = statusConfig[normalized] || statusConfig.ongoing
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    const [showImport, setShowImport] = useState(false)

    const handleExport = async () => {
        if (!finalRoundId) {
            window.alert('Round ID not found to export.')
            return
        }

        try {
            const result = await exportRoundUsers(finalRoundId)
            if (!result?.success) {
                window.alert(result?.error || 'Export users failed.')
            }
        } catch (error) {
            console.error('Lỗi khi gọi API export-users:', error)
            window.alert('An error occurred while exporting users.')
        }
    }

    const handleImport = () => {
        setShowImport(true)
    }

    const handleBack = () => {
        // Get campaignId from state or location.state
        const effectiveCampaignId = campaignId || location.state?.campaignId || batchData?.campaignId
        if (effectiveCampaignId) {
            navigate(`/recruiter/campaigns/${effectiveCampaignId}`, { state: batchData })
        } else if (batchData) {
            navigate(`/recruiter/campaigns`, { state: batchData })
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
                        <h1 className="text-2xl md:text-3xl font-extrabold">Final Review</h1>
                        <p className="text-white/90 mt-1 text-sm">List of candidates with final results</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Batch Info */}
                {batchData && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Batch information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span className="text-sm text-slate-600">Batch name:</span>
                                <p className="font-medium text-slate-800">{batchData.name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Time:</span>
                                <p className="font-medium text-slate-800">{batchData.time || '—'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <label className="text-sm text-slate-600">Filter by status:</label>
                            <select
                                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone..."
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
                            disabled={!finalRoundId}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
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
                    {fetchError && (
                        <div className="px-6 py-3 bg-red-50 text-sm text-red-700 border-b border-red-100">
                            {fetchError}
                        </div>
                    )}
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800">
                            Candidate list ({filteredCandidates.length})
                        </h3>
                    </div>

                    {loadingCandidates ? (
                        <div className="p-12 text-center text-slate-500 text-sm">
                            Loading candidate list...
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Photo 4x6</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Candidate</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
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
                                                        <div className="text-sm text-slate-500">{candidate.education || '—'}</div>
                                                        <div className="text-xs text-slate-400">{candidate.experience || '—'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900">{candidate.email || '—'}</div>
                                                    <div className="text-sm text-slate-500">{candidate.phone || '—'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(candidate.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded px-3 py-1 transition-colors"
                                                        onClick={() => navigate(`/final-review/candidate/${candidate.activityId}`, {
                                                            state: { candidate, batchData }
                                                        })}
                                                    >
                                                        View details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredCandidates.length === 0 && (
                                <div className="p-12 text-center">
                                    <p className="text-slate-500">No candidates have final results yet</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <ImportHauKiemModal
                open={showImport}
                onClose={() => setShowImport(false)}
                roundId={finalRoundId}
                campaignRoundId={resolvedCampaignRoundId}
                campaignId={campaignId}
                batchData={batchData}
            />
        </div>
    )
}

export default FinalReview