import React, { useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getCampaignRequestById } from '../../../service/api'

const formatDate = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return isoString
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

const Section = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-sm font-semibold text-gray-900 mb-3">{title}</div>
        {children}
    </div>
)

const InfoRow = ({ label, value }) => (
    <div className="flex items-start gap-3">
        <div className="w-36 shrink-0 text-gray-500 text-sm">{label}</div>
        <div className="text-gray-900 text-sm">{value}</div>
    </div>
)

const RequestCampInfo = () => {
    const { id } = useParams()
    const { state } = useLocation()
    const [data, setData] = useState(state?.campaign || null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchRequestDetail = async () => {
            // Nếu có ID từ params, gọi API
            if (id) {
                setLoading(true)
                setError(null)
                try {
                    const result = await getCampaignRequestById(id)
                    if (result.success && result.data) {
                        // Map dữ liệu từ API response sang format component đang dùng
                        const apiData = result.data
                        setData({
                            id: apiData.requestId || apiData.id,
                            code: apiData.code || `REQ-${apiData.requestId || apiData.id}`,
                            title: apiData.campaignName || apiData.title || 'Yêu cầu tuyển dụng',
                            proposer: apiData.proposerName || apiData.proposer || 'N/A',
                            position: apiData.requestType || apiData.position || 'N/A',
                            department: apiData.partnerName || apiData.department || 'N/A',
                            unit: apiData.unit || 'N/A',
                            quantity: apiData.targetQuantity || apiData.quantity || 0,
                            startDate: apiData.startDate || apiData.createdAt || '',
                            endDate: apiData.endDate || '',
                            description: apiData.description || '',
                            jobDescription: apiData.jobDescription || '',
                            jobRequirement: apiData.jobRequirement || '',
                            requestType: apiData.requestType || '',
                            status: apiData.status || 'pending_approval',
                            partnerName: apiData.partnerName || '',
                            directorName: apiData.directorName || '',
                            createdAt: apiData.createdAt || '',
                            rejectReason: apiData.rejectReason || '',
                            approvedAt: apiData.approvedAt || '',
                            rejectedAt: apiData.rejectedAt || '',
                        })
                    } else {
                        setError(result.error || 'Không thể tải chi tiết yêu cầu')
                        // Nếu có data từ state, dùng nó làm fallback
                        if (state?.campaign) {
                            setData(state.campaign)
                        }
                    }
                } catch (err) {
                    console.error('Error fetching request detail:', err)
                    setError('Đã xảy ra lỗi khi tải dữ liệu: ' + (err.message || 'Unknown error'))
                    // Nếu có data từ state, dùng nó làm fallback
                    if (state?.campaign) {
                        setData(state.campaign)
                    }
                } finally {
                    setLoading(false)
                }
            } else {
                // Không có ID, dùng data từ state
                if (state?.campaign) {
                    setData(state.campaign)
                } else {
                    setError('Không tìm thấy ID yêu cầu')
                }
                setLoading(false)
            }
        }

        fetchRequestDetail()
    }, [id, state])

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-slate-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }

    if (error && !state?.campaign) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Lỗi: {error}</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-slate-600">Không có dữ liệu</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">{data.title || 'Chi tiết Yêu cầu tuyển dụng'}</h2>
                        <p className="text-slate-600">Mã yêu cầu: <span className="font-medium">{data.code}</span></p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-5">
                <Section title="Thông tin yêu cầu">
                    <div className="text-gray-900 font-medium">{data.proposer}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                        <InfoRow label="Loại yêu cầu" value={data.requestType || data.position} />
                        <InfoRow label="Đối tác" value={data.partnerName || data.department} />
                        <InfoRow label="Giám đốc" value={data.directorName || 'N/A'} />
                        <InfoRow label="Số lượng mục tiêu" value={data.quantity} />
                        <InfoRow label="Ngày tạo" value={formatDate(data.createdAt)} />
                        <InfoRow label="Trạng thái" value={data.status || 'N/A'} />
                    </div>

                    {data.description && (
                        <div className="mt-4">
                            <InfoRow label="Mô tả" value={data.description} />
                        </div>
                    )}

                    {/* Job Description */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">📋 Mô tả công việc / Job Description</h3>
                        {data.jobDescription ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-sm text-slate-700 whitespace-pre-wrap">{data.jobDescription}</div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 italic">Chưa có mô tả công việc</div>
                        )}
                    </div>

                    {/* Job Requirements */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">📝 Yêu cầu công việc / Job Requirements</h3>
                        {data.jobRequirement ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="text-sm text-slate-700 whitespace-pre-wrap">{data.jobRequirement}</div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 italic">Chưa có yêu cầu công việc</div>
                        )}
                    </div>

                    {/* Recruitment Process */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">🔄 Quy trình tuyển dụng / Recruitment Process</h3>
                    </div>

                    {/* Additional Info */}
                    {(data.approvedAt || data.rejectedAt || data.rejectReason) && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Thông tin bổ sung</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {data.approvedAt && (
                                    <InfoRow label="Ngày duyệt" value={formatDate(data.approvedAt)} />
                                )}
                                {data.rejectedAt && (
                                    <InfoRow label="Ngày từ chối" value={formatDate(data.rejectedAt)} />
                                )}
                                {data.rejectReason && (
                                    <div className="md:col-span-2">
                                        <InfoRow label="Lý do từ chối" value={data.rejectReason} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                </Section>

            </div>
            <div className="mt-4 flex justify-end gap-3">
                <button
                    onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) {
                            console.log('Yêu cầu đã được duyệt')
                        }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                    Duyệt
                </button>
                <button
                    onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
                            console.log('Yêu cầu đã bị từ chối')
                        }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                    Từ chối
                </button>
            </div>
        </div>
    )
}

export default RequestCampInfo