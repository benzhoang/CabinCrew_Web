import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAppearanceResult, getScoringCriterias } from '../../service/api'

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

const AppearanceResultPage = () => {
    const { activityId } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [result, setResult] = useState(null)
    const [scoringCriterias, setScoringCriterias] = useState([])

    const fetchResult = useCallback(async () => {
        if (!activityId) {
            setError('Activity ID not found for result lookup.')
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)
        try {
            const [resultResponse] = await Promise.all([
                getAppearanceResult(activityId),
                getScoringCriterias().then(response => {
                    if (response.success && Array.isArray(response.data)) {
                        setScoringCriterias(response.data)
                    }
                    return response
                })
            ])

            if (resultResponse.success) {
                setResult(resultResponse.data)
                setError(null)
            } else {
                setError(resultResponse.error || 'Unable to load appearance check result.')
                setResult(null)
            }
        } catch (err) {
            console.error('Load appearance result error:', err)
            setError('An error occurred while loading data.')
            setResult(null)
        } finally {
            setLoading(false)
        }
    }, [activityId])

    useEffect(() => {
        fetchResult()
    }, [fetchResult])

    const criteriaList = useMemo(() => {
        if (Array.isArray(result?.appearanceResults)) {
            return result.appearanceResults
        }
        if (Array.isArray(result?.criteriaResults)) {
            return result.criteriaResults
        }
        if (Array.isArray(result?.appearanceCriteriaResults)) {
            return result.appearanceCriteriaResults
        }
        if (Array.isArray(result?.criteria)) {
            return result.criteria
        }
        return []
    }, [result])

    // Map scoringCriteriaItemId -> useful metadata (VN/EN text + details + title)
    const criteriaInfoMap = useMemo(() => {
        const map = {}
        if (Array.isArray(scoringCriterias)) {
            scoringCriterias.forEach(category => {
                const categoryTitle = category.title || ''
                if (Array.isArray(category.items)) {
                    category.items.forEach(item => {
                        if (item.scoringCriteriaItemId) {
                            map[item.scoringCriteriaItemId] = {
                                name: item.text || item.englishText || '',
                                englishText: item.englishText || '',
                                details: Array.isArray(item.details) ? item.details : [],
                                title: categoryTitle
                            }
                        }
                    })
                }
            })
        }
        return map
    }, [scoringCriterias])

    // Hàm lấy thông tin tiêu chí (VN/EN + chi tiết + title)
    const getCriteriaInfo = useCallback((criteria) => {
        const itemId = criteria.scoringCriteriaItemId ||
            criteria.criteriaId ||
            criteria.id ||
            criteria.scoringCriteriaItem?.scoringCriteriaItemId

        const mapInfo = itemId ? criteriaInfoMap[itemId] : null
        const fallbackName = criteria.name ||
            criteria.criteriaName ||
            criteria.scoringCriteriaItemName ||
            criteria.scoringCriteriaItem?.text ||
            criteria.scoringCriteriaItem?.englishText ||
            ''

        const englishText = mapInfo?.englishText ||
            criteria.englishText ||
            criteria.criteriaEnglishName ||
            criteria.scoringCriteriaItem?.englishText ||
            ''

        const detailList = mapInfo?.details?.length
            ? mapInfo.details
            : Array.isArray(criteria.details)
                ? criteria.details
                : Array.isArray(criteria.scoringCriteriaItem?.details)
                    ? criteria.scoringCriteriaItem.details
                    : []

        const title = mapInfo?.title || ''

        return {
            name: mapInfo?.name || fallbackName || '',
            englishText,
            details: detailList,
            title
        }
    }, [criteriaInfoMap])

    // Nhóm criteriaList theo title
    const groupedCriteria = useMemo(() => {
        const groups = {}
        criteriaList.forEach((criteria, index) => {
            const criteriaInfo = getCriteriaInfo(criteria)
            const title = criteriaInfo.title || 'Others'
            if (!groups[title]) {
                groups[title] = []
            }
            groups[title].push({ ...criteria, criteriaInfo, originalIndex: index })
        })
        return groups
    }, [criteriaList, getCriteriaInfo])

    const summaryItems = useMemo(() => {
        const overallValue = getPassLabel(result?.isPassed)
        const overallBadge =
            result?.isPassed === true
                ? 'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-200'
                : result?.isPassed === false
                    ? 'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-50 text-red-700 border border-red-200'
                    : 'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200'

        return [
            { label: 'Evaluation ID', value: result?.evaluationId ?? '—' },
            { label: 'Candidate', value: result?.candidate || '—' },
            { label: 'Examiner', value: result?.examiner || '—' },
            { label: 'Round', value: result?.roundName || '—' },
            { label: 'Evaluation date', value: formatDateTime(result?.evaluatedDate) },
            { label: 'Overall result', value: overallValue, badgeClass: overallBadge }
        ]
    }, [result])

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium"
                        >
                            Back
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    {loading && (
                        <div className="text-center py-16">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading results...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="text-center py-10">
                            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M5.455 19h13.09c1.54 0 2.5-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.723 16c-.768 1.333.193 3 1.732 3z" />
                            </svg>
                            <p className="mt-3 text-base font-semibold text-gray-900">{error}</p>
                            <button
                                type="button"
                                onClick={fetchResult}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && result && (
                        <div className="space-y-8">
                            <section>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {summaryItems.map((item) => (
                                        <div key={item.label} className="bg-gray-50 rounded-lg p-4">
                                            <dt className="text-sm text-gray-500">{item.label}</dt>
                                            <dd className="mt-2">
                                                {item.badgeClass ? (
                                                    <span className={item.badgeClass}>{item.value || '—'}</span>
                                                ) : (
                                                    <span className="text-base font-semibold text-gray-900">{item.value || '—'}</span>
                                                )}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>

                            {criteriaList.length > 0 && (
                                <section>
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">General comments</h3>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                            {result?.comment || result?.generalComment || result?.note || result?.notes || '—'}
                                        </p>
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Criteria details</h2>
                                    <div className="space-y-6">
                                        {Object.entries(groupedCriteria).map(([title, criteriaGroup]) => (
                                            <div key={title} className="space-y-3">
                                                {title && (
                                                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
                                                        {title}
                                                    </h3>
                                                )}
                                                <div className="overflow-hidden border border-gray-200 rounded-lg">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                                    Criteria
                                                                </th>
                                                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                                                                    Result
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {criteriaGroup.map((criteria) => {
                                                                const criteriaInfo = criteria.criteriaInfo
                                                                const criteriaName = criteriaInfo.name || `Tiêu chí ${criteria.originalIndex + 1}`
                                                                const isPassed = criteria.isPassed ?? criteria.result ?? criteria.score
                                                                return (
                                                                    <tr key={criteria.id || criteria.criteriaId || criteria.originalIndex}>
                                                                        <td className="px-4 py-3 text-sm">
                                                                            <div className="font-medium text-gray-900">
                                                                                {criteriaName}
                                                                            </div>
                                                                            {criteriaInfo.englishText && (
                                                                                <div className="text-xs text-gray-500 italic mt-1">
                                                                                    {criteriaInfo.englishText}
                                                                                </div>
                                                                            )}
                                                                            {Array.isArray(criteriaInfo.details) && criteriaInfo.details.length > 0 && (
                                                                                <ul className="mt-2 space-y-1">
                                                                                    {criteriaInfo.details.map((detail, detailIndex) => (
                                                                                        <li key={detail.detailText || detail.text || detailIndex} className="text-xs text-gray-600 flex gap-2">
                                                                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                                                                                            <span>{detail.detailText || detail.text || detail.description || detail}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            )}
                                                                        </td>
                                                                        <td className={`px-4 py-3 text-sm align-top ${getResultColorClass(isPassed)}`}>
                                                                            {getPassLabel(isPassed)}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AppearanceResultPage