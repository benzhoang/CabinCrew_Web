import React, { useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getCampaignRequestById } from '../../../service/api'
import RejectRequestModal from './RejectRequestModal'

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
        <div className="text-gray-900 text-sm whitespace-pre-wrap">{value}</div>
    </div>
)

const RequestCampInfo = () => {
    const { id } = useParams()
    const { state } = useLocation()
    const [data, setData] = useState(state?.campaign || null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)

    // Fetch API
    useEffect(() => {
        const fetchRequestDetail = async () => {
            if (id) {
                setLoading(true)
                try {
                    const result = await getCampaignRequestById(id)
                    if (result.success) {
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
                            startDate: apiData.startDate || '',
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
                    }
                } catch (err) {
                    console.error(err)
                    setError('Đã xảy ra lỗi khi tải dữ liệu')
                } finally {
                    setLoading(false)
                }
            } else {
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
            <div className="p-6 h-64 flex justify-center items-center">
                <p className="text-slate-600">Đang tải dữ liệu...</p>
            </div>
        )
    }

    if (error && !data) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="p-6 h-64 flex justify-center items-center">
                <p className="text-slate-600">Không có dữ liệu</p>
            </div>
        )
    }

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{data.title}</h2>
                <p className="text-slate-600">Mã yêu cầu: <span className="font-medium">{data.code}</span></p>
            </div>

            {/* SECTION */}
            <div className="grid grid-cols-1 gap-5">
                <Section title="Thông tin yêu cầu">

                    <div className="text-gray-900 font-medium">{data.proposer}</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                        <InfoRow label="Loại yêu cầu" value={data.requestType} />
                        <InfoRow label="Đối tác" value={data.partnerName} />
                        <InfoRow label="Giám đốc" value={data.directorName || 'N/A'} />
                        <InfoRow label="Số lượng mục tiêu" value={data.quantity} />
                        <InfoRow label="Ngày tạo" value={formatDate(data.createdAt)} />
                        <InfoRow label="Trạng thái" value={data.status} />
                    </div>

                    {data.description && (
                        <div className="mt-4">
                            <InfoRow label="Mô tả" value={data.description} />
                        </div>
                    )}

                    {/* JOB DESCRIPTION */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">📋 Mô tả công việc</h3>
                        {data.jobDescription ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap">
                                {data.jobDescription}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Chưa có mô tả công việc</p>
                        )}
                    </div>

                    {/* JOB REQUIREMENT */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">📝 Yêu cầu công việc</h3>
                        {data.jobRequirement ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap">
                                {data.jobRequirement}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Chưa có yêu cầu công việc</p>
                        )}
                    </div>

                </Section>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-6 flex justify-end gap-4">

                {/* NÚT TỪ CHỐI */}
                <button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isRejecting || isApproving}
                    className={`flex items-center gap-2 px-6 py-3 text-sm text-white rounded-lg transition-all duration-200 
                        font-medium shadow-md transform
                        ${isRejecting || isApproving
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-105 active:scale-95'
                        }`}
                >
                    {isRejecting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang từ chối...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Từ chối
                        </>
                    )}
                </button>

                {/* NÚT DUYỆT */}
                <button
                    onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) {
                            setIsApproving(true)
                            setTimeout(() => {
                                console.log('Yêu cầu đã được duyệt')
                                setIsApproving(false)
                            }, 1500)
                        }
                    }}
                    disabled={isApproving || isRejecting}
                    className={`flex items-center gap-2 px-6 py-3 text-sm text-white rounded-lg transition-all duration-200 
                        font-medium shadow-md transform
                        ${isApproving || isRejecting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-105 active:scale-95'
                        }`}
                >
                    {isApproving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang duyệt...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Duyệt
                        </>
                    )}
                </button>
            </div>

            {/* MODAL TỪ CHỐI */}
            <RejectRequestModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onSubmit={(reason) => {
                    setIsRejecting(true)
                    setTimeout(() => {
                        console.log('Yêu cầu bị từ chối với lý do: ', reason)
                        setIsRejecting(false)
                        setIsRejectModalOpen(false)
                    }, 1500)
                }}
                requestTitle={data.title}
            />
        </div>
    )
}

export default RequestCampInfo