import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInterviewResults } from '../../service/api'

const formatDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value
    }
    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getPassLabel = (flag) => {
    if (flag === true) return 'Passed'
    if (flag === false) return 'Failed'
    return '—'
}

const getResultColorClass = (flag) => {
    if (flag === true) return 'text-green-600 font-semibold'
    if (flag === false) return 'text-red-600 font-semibold'
    return 'text-gray-700'
}

const getStatusBadge = (flag) => {
    if (flag === true) {
        return 'bg-green-100 text-green-800'
    }
    if (flag === false) {
        return 'bg-red-100 text-red-700'
    }
    return 'bg-gray-100 text-gray-700'
}

const PromotionInterviewCard = () => {
    const { activityId } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [results, setResults] = useState([])

    const fetchResults = useCallback(async () => {
        if (!activityId) {
            setError('Activity ID not found for result lookup.')
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)
        try {
            const response = await getInterviewResults(activityId)

            if (response.success) {
                // Ensure data is an array
                const dataArray = Array.isArray(response.data) ? response.data : []
                setResults(dataArray)
                setError(null)
            } else {
                setError(response.error || 'Unable to load interview results.')
                setResults([])
            }
        } catch (err) {
            console.error('Load interview results error:', err)
            setError('An error occurred while loading data.')
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [activityId])

    useEffect(() => {
        fetchResults()
    }, [fetchResults])

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Interview results</h1>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium"
                    >
                        Back
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-3 text-sm text-gray-600">Loading...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M5.455 19h13.09c1.54 0 2.5-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.723 16c-.768 1.333.193 3 1.732 3z" />
                            </svg>
                            <p className="mt-2 text-sm font-semibold text-gray-900">{error}</p>
                            <button
                                type="button"
                                onClick={fetchResults}
                                className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {results.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="mt-2 text-sm font-medium text-gray-900">No interview results</p>
                                    <p className="mt-1 text-xs text-gray-500">No interview results found for this activity.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {results.map((result, index) => (
                                        <div key={result.evaluationId || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(result?.isPassed)}`}>
                                                        {getPassLabel(result?.isPassed)}
                                                    </span>
                                                    {result?.roundName && (
                                                        <span className="text-xs text-gray-500">Round: {result.roundName}</span>
                                                    )}
                                                    {result?.finalScore !== undefined && result?.finalScore !== null && (
                                                        <span className="text-xs font-medium text-gray-700">Score: {result.finalScore}</span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/cabin-crew/detail-result/${result.evaluationId}`)}
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                                >
                                                    View details →
                                                </button>
                                            </div>

                                            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                <div className="bg-gray-50 rounded p-2">
                                                    <dt className="text-xs text-gray-500">Candidate</dt>
                                                    <dd className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{result?.candidate || '—'}</dd>
                                                </div>
                                                <div className="bg-gray-50 rounded p-2">
                                                    <dt className="text-xs text-gray-500">Examiner</dt>
                                                    <dd className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{result?.examiner || '—'}</dd>
                                                </div>
                                                <div className="bg-gray-50 rounded p-2">
                                                    <dt className="text-xs text-gray-500">Evaluation date</dt>
                                                    <dd className="text-sm font-semibold text-gray-900 mt-0.5">{formatDateTime(result?.evaluatedDate)}</dd>
                                                </div>
                                            </dl>

                                            {result?.comment && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs text-gray-600 line-clamp-2">{result.comment}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PromotionInterviewCard