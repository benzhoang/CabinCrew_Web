import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAppearanceResult } from '../../service/api'

const formatDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value
    }
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getPassLabel = (flag) => {
    if (flag === true) return 'Đạt'
    if (flag === false) return 'Chưa đạt'
    return '—'
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

    const fetchResult = useCallback(async () => {
        if (!activityId) {
            setError('Không tìm thấy mã hoạt động để tra cứu kết quả.')
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)
        try {
            const response = await getAppearanceResult(activityId)
            if (response.success) {
                setResult(response.data)
                setError(null)
            } else {
                setError(response.error || 'Không thể tải kết quả kiểm tra ngoại hình.')
                setResult(null)
            }
        } catch (err) {
            console.error('Load appearance result error:', err)
            setError('Đã xảy ra lỗi khi tải dữ liệu.')
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

    const summaryItems = useMemo(() => ([
        { label: 'Mã đánh giá', value: result?.evaluationId ?? '—' },
        { label: 'Thí sinh', value: result?.candidate || '—' },
        { label: 'Giám khảo', value: result?.examiner || '—' },
        { label: 'Vòng tuyển', value: result?.roundName || '—' },
        { label: 'Ngày đánh giá', value: formatDateTime(result?.evaluatedDate) },
        { label: 'Kết quả tổng', value: getPassLabel(result?.isPassed) }
    ]), [result])

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Mã hoạt động #{activityId}</p>
                        <h1 className="text-3xl font-bold text-gray-900">Kết quả kiểm tra Appearance</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium"
                        >
                            Quay lại
                        </button>
                        <button
                            type="button"
                            onClick={fetchResult}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
                        >
                            Tải lại
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    {loading && (
                        <div className="text-center py-16">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Đang tải kết quả...</p>
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
                                Thử lại
                            </button>
                        </div>
                    )}

                    {!loading && !error && result && (
                        <div className="space-y-8">
                            <section>
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(result?.isPassed)}`}>
                                        {getPassLabel(result?.isPassed)}
                                    </span>
                                    {result?.roundName && (
                                        <span className="text-sm text-gray-500">Vòng: {result.roundName}</span>
                                    )}
                                </div>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {summaryItems.map((item) => (
                                        <div key={item.label} className="bg-gray-50 rounded-lg p-4">
                                            <dt className="text-sm text-gray-500">{item.label}</dt>
                                            <dd className="text-base font-semibold text-gray-900 mt-1">{item.value || '—'}</dd>
                                        </div>
                                    ))}
                                </dl>
                                {result?.comment && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Nhận xét chung</h3>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                            {result.comment}
                                        </p>
                                    </div>
                                )}
                            </section>

                            {criteriaList.length > 0 && (
                                <section>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết tiêu chí</h2>
                                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        Tiêu chí
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        Kết quả
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        Nhận xét
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {criteriaList.map((criteria, index) => (
                                                    <tr key={criteria.id || criteria.criteriaId || index}>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                            {criteria.name || criteria.criteriaName || criteria.scoringCriteriaItemName || `Tiêu chí ${index + 1}`}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {getPassLabel(criteria.isPassed ?? criteria.result ?? criteria.score)}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-pre-wrap">
                                                            {criteria.comment || criteria.notes || criteria.note || '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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