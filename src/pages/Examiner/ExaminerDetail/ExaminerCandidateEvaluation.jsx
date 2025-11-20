import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { onLangChange } from '../../../i18n'
import { getInterviewCriterias } from '../../../service/api'

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
                score: typeof previousValue.score === 'number' ? previousValue.score : 1,
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
                setCriteriaError(response.error || 'Không thể lấy tiêu chí phỏng vấn')
            }
        } catch (error) {
            setCriteriaError(error.message || 'Không thể lấy tiêu chí phỏng vấn')
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

    useEffect(() => {
        if (candidate) {
            setHeaderInfo(prev => ({
                ...prev,
                applicantName: candidate.name || '',
                position: candidate.position || prev.position
            }))
        }
    }, [candidate])

    // Calculate total score
    const totalScore = Object.values(evaluations).reduce((sum, criterion) => {
        return sum + (criterion.score || 0)
    }, 0)
    const maxScore = Object.keys(evaluations).length * 10

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
                score: prev[criterionKey]?.score ?? 1,
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

    const handleSave = () => {
        // Save evaluation logic here
        const evaluationData = {
            headerInfo,
            evaluations: formatEvaluationsForSubmit(),
            totalScore,
            result,
            generalComments,
            candidateId: id || candidate?.id
        }
        console.log('Evaluation Data:', evaluationData)
        alert('Đã lưu đánh giá thành công!')
    }

    const handleSubmit = () => {
        // Submit evaluation logic here
        const evaluationData = {
            headerInfo,
            evaluations: formatEvaluationsForSubmit(),
            totalScore,
            result,
            generalComments,
            candidateId: id || candidate?.id
        }
        console.log('Submitting evaluation...', evaluationData)
        alert('Đã gửi đánh giá thành công!')
        navigate('/examiner/applications', { state: batchData })
    }

    if (!candidate) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <p className="text-slate-500">Không tìm thấy thông tin ứng viên</p>
                    <button
                        onClick={() => navigate('/examiner/applications')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        )
    }

    let criterionCounter = 0

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/examiner/applications', { state: batchData })}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold">Đánh giá Ứng viên</h1>
                            <p className="text-white/90 mt-1 text-sm">Đánh giá tiêu chí phỏng vấn cho ứng viên</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Candidate Information */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Thông tin Ứng viên</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4">
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
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">{candidate.name}</h3>
                                <p className="text-sm text-slate-600">{candidate.position || 'Flight Attendant'}</p>
                                <p className="text-xs text-slate-500 mt-1">Ảnh 4x6</p>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Email:</span>
                            <p className="font-medium text-slate-800">{candidate.email || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Số điện thoại:</span>
                            <p className="font-medium text-slate-800">{candidate.phone || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Ngày ứng tuyển:</span>
                            <p className="font-medium text-slate-800">{candidate.appliedDate || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Học vấn:</span>
                            <p className="font-medium text-slate-800">{candidate.education || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Kinh nghiệm:</span>
                            <p className="font-medium text-slate-800">{candidate.experience || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Ngôn ngữ:</span>
                            <p className="font-medium text-slate-800">
                                {candidate.languages && Array.isArray(candidate.languages)
                                    ? candidate.languages.join(', ')
                                    : candidate.languages || 'Tiếng Việt'}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Đợt tuyển:</span>
                            <p className="font-medium text-slate-800">{candidate.batchName || batchData?.batchName || '—'}</p>
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
                                <h2 className="text-lg font-semibold text-slate-800">Đang tải tiêu chí phỏng vấn...</h2>
                                <p className="text-sm text-slate-500 mt-1">Vui lòng chờ trong giây lát.</p>
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
                                Thử lại
                            </button>
                        </div>
                    ) : criteriaGroups.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <p className="text-slate-600">Chưa có tiêu chí phỏng vấn nào.</p>
                        </div>
                    ) : (
                        criteriaGroups.map((group, groupIndex) => (
                            <div key={`${group.title || 'group'}-${groupIndex}`} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                    <h2 className="text-xl font-semibold text-slate-800">
                                        {group.title || `Nhóm ${groupIndex + 1}`}
                                    </h2>
                                    {group.description && (
                                        <p className="text-sm text-slate-500">{group.description}</p>
                                    )}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
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
                                                    const evaluation = evaluations[criterionKey] || { score: 1, comment: '' }
                                                    const displayOrder = ++criterionCounter
                                                    return (
                                                        <tr key={`${criterionKey}-${itemIndex}`} className="border-b border-slate-200 hover:bg-slate-50">
                                                            <td className="py-3 px-4">
                                                                <div className="font-medium text-slate-800">
                                                                    {displayOrder}. {item?.criteria || '—'}
                                                                </div>
                                                                {item?.description && (
                                                                    <div className="text-xs text-slate-500 mt-1">{item.description}</div>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <select
                                                                    value={evaluation.score}
                                                                    onChange={(e) => handleScoreChange(criterionKey, e.target.value)}
                                                                    className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                >
                                                                    {SCORE_OPTIONS.map(num => (
                                                                        <option key={num} value={num}>{num}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <input
                                                                    type="text"
                                                                    value={evaluation.comment}
                                                                    onChange={(e) => handleCommentChange(criterionKey, e.target.value)}
                                                                    className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                    placeholder="Ghi chú..."
                                                                />
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="py-4 text-center text-slate-500 text-sm">
                                                        Không có tiêu chí nào trong nhóm này.
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

                {/* Total Score and Result */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-lg font-semibold text-slate-800">
                            TOTAL SCORE
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                            Total score (max {maxScore || '—'}) = {totalScore}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Comments/Remarks</label>
                        <textarea
                            placeholder="Ghi chú tổng quan về ứng viên..."
                            value={generalComments}
                            onChange={(e) => setGeneralComments(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="5"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => navigate('/examiner/applications', { state: batchData })}
                        className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Gửi đánh giá
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ExaminerCandidateEvaluation