import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { onLangChange } from '../../../i18n'
import { getInterviewCriterias, submitInterviewResult, getInterviewResults } from '../../../service/api'
import { toast } from 'react-toastify'

const mapCriteriaToEvaluations = (criteriaGroups, previousEvaluations = {}) => {
    const mapped = {}
    criteriaGroups?.forEach(group => {
        group?.items?.forEach(item => {
            if (!item) return
            const hasId = typeof item.interviewCriteriaItemId !== 'undefined' && item.interviewCriteriaItemId !== null
            const key = hasId ? item.interviewCriteriaItemId : item.criteria
            if (typeof key === 'undefined' || key === null) return
            const previousValue = previousEvaluations[key] || {}
            mapped[key] = {
                score: typeof previousValue.score === 'number' ? previousValue.score : 10,
                comment: previousValue.comment || ''
            }
        })
    })
    return mapped
}

const SCORE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const ExaminerCandidateEvaluation = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { id } = useParams()
    const [langVersion, setLangVersion] = useState(0)

    // Get candidate and batch data from location state
    const candidate = location.state?.candidate || location.state
    const batchData = location.state?.batchData

    // Interview Scorecard header info
    const [headerInfo, setHeaderInfo] = useState({
        date: new Date().toISOString().split('T')[0],
        applicantName: '',
        department: '',
        position: candidate?.position || '',
        availabilityDate: ''
    })

    // Interview criteria fetched from API
    const [criteriaGroups, setCriteriaGroups] = useState([])
    const [evaluations, setEvaluations] = useState({})
    const [criteriaLoading, setCriteriaLoading] = useState(true)
    const [criteriaError, setCriteriaError] = useState('')

    const [result, setResult] = useState('') // PASS, FAIL, or RESERVED
    const [generalComments, setGeneralComments] = useState('')
    const [submittedCount, setSubmittedCount] = useState(0) // Số lần đã chấm
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [checkingCount, setCheckingCount] = useState(true) // Đang kiểm tra số lần đã chấm
    const [submittedOnce, setSubmittedOnce] = useState(false) // Đã chấm trong phiên hiện tại

    // Countdown timer state (30 minutes = 1800 seconds)
    const [timeRemaining, setTimeRemaining] = useState(30 * 60) // 30 minutes in seconds
    const [isTimerExpired, setIsTimerExpired] = useState(false)

    const loadInterviewCriterias = useCallback(async () => {
        setCriteriaLoading(true)
        setCriteriaError('')
        try {
            const response = await getInterviewCriterias()
            if (response.success) {
                const groups = response.data || []
                setCriteriaGroups(groups)
                setEvaluations(prev => mapCriteriaToEvaluations(groups, prev))
            } else {
                setCriteriaError(response.error || 'Unable to load interview criteria')
            }
        } catch (error) {
            setCriteriaError(error.message || 'Unable to load interview criteria')
        } finally {
            setCriteriaLoading(false)
        }
    }, [])

    useEffect(() => {
        const off = onLangChange(() => setLangVersion(v => v + 1))
        return () => off()
    }, [])

    useEffect(() => {
        loadInterviewCriterias()
    }, [loadInterviewCriterias])

    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    setIsTimerExpired(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, []) // Only run once on mount

    useEffect(() => {
        if (candidate) {
            setHeaderInfo(prev => ({
                ...prev,
                applicantName: candidate.name || '',
                position: candidate.position || prev.position
            }))
        }
    }, [candidate])

    // Check submission count
    useEffect(() => {
        const checkSubmittedCount = async () => {
            if (!candidate?.activityId) {
                setCheckingCount(false)
                return
            }

            try {
                const response = await getInterviewResults(candidate.activityId)
                if (response.success && Array.isArray(response.data)) {
                    setSubmittedCount(response.data.length)
                } else {
                    setSubmittedCount(0)
                }
            } catch (error) {
                console.error('Error when checking submitted count:', error)
                setSubmittedCount(0)
            } finally {
                setCheckingCount(false)
            }
        }

        checkSubmittedCount()
    }, [candidate?.activityId])

    // Calculate total score
    const totalScore = Object.values(evaluations).reduce((sum, criterion) => {
        return sum + (criterion.score || 0)
    }, 0)
    const maxScore = Object.keys(evaluations).length * 10

    // Format time remaining to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    const handleScoreChange = (criterionKey, score) => {
        setEvaluations(prev => ({
            ...prev,
            [criterionKey]: {
                score: Number(score) || 0,
                comment: prev[criterionKey]?.comment || ''
            }
        }))
    }

    const handleCommentChange = (criterionKey, comment) => {
        setEvaluations(prev => ({
            ...prev,
            [criterionKey]: {
                score: prev[criterionKey]?.score ?? 10,
                comment: comment
            }
        }))
    }

    const handleHeaderInfoChange = (key, value) => {
        setHeaderInfo(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const formatEvaluationsForSubmit = () => {
        return Object.entries(evaluations).map(([criterionId, value]) => {
            const parsedId = Number(criterionId)
            return {
                interviewCriteriaItemId: Number.isNaN(parsedId) ? criterionId : parsedId,
                score: value?.score || 0,
                comment: value?.comment || ''
            }
        })
    }

    const handleSubmit = async () => {
        // Do not allow more than 3 submissions
        if (submittedCount >= 3) {
            toast.error('You have already submitted 3 times. Cannot submit more evaluations.')
            return
        }

        // Validate activityId and type
        const activityId = candidate?.activityId
        if (!activityId) {
            toast.error('activityId not found. Please try again.')
            return
        }

        // Determine type: 1 = Recruitment, 2 = Promotion
        const type = candidate?.applicationType === 'promotion' ? 2 : 1

        // Prepare payload
        const choices = formatEvaluationsForSubmit()

        if (choices.length === 0) {
            toast.error('Please score at least one criterion.')
            return
        }

        setLoadingSubmit(true)
        try {
            const response = await submitInterviewResult({
                activityId: activityId,
                comment: generalComments || '',
                type: type,
                choices: choices
            })

            if (response.success) {
                toast.success('Submitted evaluation successfully!', {
                    style: {
                        background: '#16a34a',
                        color: '#ffffff'
                    },
                    progressStyle: { background: '#22c55e' }
                })
                // Increase submission count
                const newCount = submittedCount + 1
                setSubmittedCount(newCount)
                setSubmittedOnce(true)
                // If less than 3, go back
                if (newCount < 3) {
                    if (batchData) {
                        navigate('/examiner/applications', { state: batchData })
                    } else {
                        navigate(-1)
                    }
                }
            } else {
                toast.error(response.error || 'Unable to submit evaluation. Please try again.')
            }
        } catch (error) {
            console.error('Error when submitting evaluation:', error)
            toast.error('An error occurred while submitting. Please try again.')
        } finally {
            setLoadingSubmit(false)
        }
    }

    if (!candidate) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <p className="text-slate-500">Candidate information not found</p>
                    <button
                        onClick={() => navigate('/examiner/applications')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back
                    </button>
                </div>
            </div>
        )
    }

    let criterionCounter = 0
    const hasReachedLimit = submittedCount >= 3 || submittedOnce

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    if (batchData) {
                                        navigate('/examiner/applications', { state: batchData })
                                    } else {
                                        navigate(-1)
                                    }
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold">Candidate Evaluation</h1>
                                <p className="text-white/90 mt-1 text-sm">Evaluate interview criteria for the applicant</p>
                            </div>
                        </div>
                        {/* Countdown Timer (fixed position, follows scroll) */}
                        <div className="fixed top-4 right-4 z-50">
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-white border-2 ${isTimerExpired
                                    ? 'border-red-500'
                                    : timeRemaining <= 300
                                        ? 'border-orange-500'
                                        : 'border-slate-300'
                                    } transition-all duration-300`}
                            >
                                <svg
                                    className={`w-5 h-5 ${isTimerExpired
                                        ? 'text-red-500'
                                        : timeRemaining <= 300
                                            ? 'text-orange-500'
                                            : 'text-slate-700'
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-600">Time remaining</span>
                                    <span className="text-2xl font-bold tracking-wider text-black">
                                        {formatTime(timeRemaining)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Candidate Information */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Candidate Information</h2>
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-32 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                            <img
                                src={candidate.photo || 'https://via.placeholder.com/96x128/cccccc/666666?text=No+Photo'}
                                alt={candidate.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/96x128/cccccc/666666?text=No+Photo'
                                }}
                            />
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <span className="text-sm text-slate-600 block mb-1">Full Name:</span>
                                <p className="font-medium text-slate-800">{candidate.name || '—'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600 block mb-1">Email:</span>
                                <p className="font-medium text-slate-800">{candidate.email || '—'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600 block mb-1">Phone:</span>
                                <p className="font-medium text-slate-800">{candidate.phone || '—'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600 block mb-1">Applied date:</span>
                                <p className="font-medium text-slate-800">{candidate.appliedDate || '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interview Scorecard Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">INTERVIEW SCORECARD</h2>
                    {/* Assessment Values Legend */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">Assessment Values / Scoring Legend:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div><span className="font-medium">Excellent:</span> 9-10 points</div>
                            <div><span className="font-medium">Good:</span> 7-8 points</div>
                            <div><span className="font-medium">Fair:</span> 5-6 points</div>
                            <div><span className="font-medium">Unsatisfactory:</span> 1-4 points</div>
                        </div>
                    </div>
                </div>

                {/* Criteria Sections */}
                <div className="space-y-6 mb-6">
                    {criteriaLoading ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">Loading interview criteria...</h2>
                                <p className="text-sm text-slate-500 mt-1">Please wait a moment.</p>
                            </div>
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : criteriaError ? (
                        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                            <p className="text-red-600 font-medium">{criteriaError}</p>
                            <button
                                onClick={loadInterviewCriterias}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : criteriaGroups.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <p className="text-slate-600">No interview criteria available.</p>
                        </div>
                    ) : (
                        criteriaGroups.map((group, groupIndex) => (
                            <div key={`${group.title || 'group'}-${groupIndex}`} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                    <h2 className="text-xl font-semibold text-slate-800">
                                        {group.title || `Group ${groupIndex + 1}`}
                                    </h2>
                                    {group.description && (
                                        <p className="text-sm text-slate-500">{group.description}</p>
                                    )}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full table-fixed">
                                        <colgroup>
                                            <col className="w-[45%]" />
                                            <col className="w-[20%]" />
                                            <col className="w-[35%]" />
                                        </colgroup>
                                        <thead>
                                            <tr className="border-b border-slate-300">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Criteria</th>
                                                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Assessment Score</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Comments / Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(group.items) && group.items.length > 0 ? (
                                                group.items.map((item, itemIndex) => {
                                                    const hasId = typeof item?.interviewCriteriaItemId !== 'undefined' && item?.interviewCriteriaItemId !== null
                                                    const criterionKey = hasId ? item.interviewCriteriaItemId : item?.criteria ?? `${groupIndex}-${itemIndex}`
                                                    const evaluation = evaluations[criterionKey] || { score: 10, comment: '' }
                                                    const displayOrder = ++criterionCounter
                                                    return (
                                                        <tr key={`${criterionKey}-${itemIndex}`} className="border-b border-slate-200 hover:bg-slate-50">
                                                            <td className="py-3 px-4 align-top">
                                                                <div className="font-medium text-slate-800">
                                                                    {displayOrder}. {item?.criteria || '—'}
                                                                </div>
                                                                {item?.description && (
                                                                    <div className="text-xs text-slate-500 mt-1">{item.description}</div>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-center align-middle">
                                                                <div className="flex justify-center">
                                                                    <select
                                                                        value={evaluation.score}
                                                                        onChange={(e) => handleScoreChange(criterionKey, e.target.value)}
                                                                        className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                                                                    >
                                                                        {SCORE_OPTIONS.map(num => (
                                                                            <option key={num} value={num}>{num}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 align-middle">
                                                                <input
                                                                    type="text"
                                                                    value={evaluation.comment}
                                                                    onChange={(e) => handleCommentChange(criterionKey, e.target.value)}
                                                                    className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                    placeholder="Remarks..."
                                                                />
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="py-4 text-center text-slate-500 text-sm">
                                                        No criteria in this group.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Result */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Comments/Remarks</label>
                        <textarea
                            placeholder="General remarks about the candidate..."
                            value={generalComments}
                            onChange={(e) => setGeneralComments(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="5"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    {!checkingCount && !hasReachedLimit && (
                        <button
                            onClick={handleSubmit}
                            disabled={loadingSubmit || hasReachedLimit}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingSubmit ? 'Submitting...' : 'Submit evaluation'}
                        </button>
                    )}
                    {!checkingCount && hasReachedLimit && (
                        <div className="px-6 py-2.5 bg-slate-100 text-slate-500 rounded-lg font-medium">
                            Submitted already
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ExaminerCandidateEvaluation