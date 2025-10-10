import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// CSS animations for pop-up effect
const popupStyles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes pop-up {
    from { 
      opacity: 0; 
      transform: scale(0.8) translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  
  .animate-pop-up {
    animation: pop-up 0.3s ease-out;
  }
`

// Inject styles into document head
if (typeof document !== 'undefined' && !document.querySelector('#popup-styles')) {
    const styleSheet = document.createElement('style')
    styleSheet.id = 'popup-styles'
    styleSheet.textContent = popupStyles
    document.head.appendChild(styleSheet)
}

const ApprovalModal = ({ isOpen, onClose, onSubmit, campaign }) => {
    const [selectedApprovers, setSelectedApprovers] = useState([])
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Mock data cho danh sách người có thể phê duyệt
    const availableApprovers = [
        { id: 1, name: 'Nguyễn Văn An', position: 'Giám đốc Nhân sự', department: 'HR' },
        { id: 2, name: 'Trần Thị Bình', position: 'Trưởng phòng Tuyển dụng', department: 'HR' },
        { id: 3, name: 'Lê Văn Cường', position: 'Giám đốc Vận hành', department: 'Operations' },
        { id: 4, name: 'Phạm Thị Dung', position: 'Trưởng phòng Cabin Crew', department: 'Cabin Crew' },
        { id: 5, name: 'Hoàng Văn Em', position: 'Giám đốc Tài chính', department: 'Finance' },
        { id: 6, name: 'Vũ Thị Phương', position: 'Trưởng phòng Đào tạo', department: 'Training' }
    ]

    const handleApproverToggle = (approver) => {
        setSelectedApprovers(prev => {
            const isSelected = prev.find(a => a.id === approver.id)
            if (isSelected) {
                return prev.filter(a => a.id !== approver.id)
            } else if (prev.length < 3) {
                return [...prev, approver]
            }
            return prev
        })

        if (errors.approvers) {
            setErrors(prev => ({ ...prev, approvers: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (selectedApprovers.length === 0) {
            newErrors.approvers = 'Vui lòng chọn ít nhất 1 người phê duyệt'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            onSubmit({
                campaignId: campaign.id,
                approvers: selectedApprovers,
                submittedAt: new Date().toISOString()
            })

            setSelectedApprovers([])
            setErrors({})
            onClose()
        } catch (error) {
            console.error('Error submitting approval:', error)
            alert('Có lỗi xảy ra khi gửi phê duyệt')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setSelectedApprovers([])
        setErrors({})
        onClose()
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-pop-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Phê duyệt Chiến dịch
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            Chọn người phê duyệt cho chiến dịch "{campaign?.name}"
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-all duration-200"
                        title="Đóng"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 bg-slate-50/30">
                    <div className="mb-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <h4 className="text-sm font-medium text-yellow-800 mb-1">Lưu ý quan trọng</h4>
                                    <p className="text-sm text-yellow-700">
                                        Bạn cần chọn từ 1 đến 3 người phê duyệt cho chiến dịch này.
                                        Sau khi gửi, chiến dịch sẽ chuyển sang trạng thái chờ phê duyệt.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            Chọn người phê duyệt (1-3 người) *
                        </label>

                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {availableApprovers.map((approver) => {
                                const isSelected = selectedApprovers.find(a => a.id === approver.id)
                                const isDisabled = !isSelected && selectedApprovers.length >= 3

                                return (
                                    <div
                                        key={approver.id}
                                        onClick={() => handleApproverToggle(approver)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${isSelected
                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                            : isDisabled
                                                ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50'
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-slate-300'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-slate-800">{approver.name}</h4>
                                                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                                        {approver.department}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">{approver.position}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {errors.approvers && (
                            <p className="mt-2 text-sm text-red-600">{errors.approvers}</p>
                        )}

                        <div className="mt-4 text-sm text-slate-600">
                            Đã chọn: {selectedApprovers.length}/3 người
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${isSubmitting
                                ? 'bg-slate-400 cursor-not-allowed text-white'
                                : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Gửi phê duyệt
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const PendingCampaignDetail = ({ campaign }) => {
    const [showApprovalModal, setShowApprovalModal] = useState(false)
    const [approvalStatus, setApprovalStatus] = useState({
        submitted: false,
        totalApprovers: 0,
        approvedCount: 0,
        approvers: []
    })
    const navigate = useNavigate()

    const handleApprovalSubmit = (approvalData) => {
        console.log('Approval submitted:', approvalData)

        // Cập nhật trạng thái phê duyệt
        setApprovalStatus({
            submitted: true,
            totalApprovers: approvalData.approvers.length,
            approvedCount: 0, // Chưa có ai phê duyệt
            approvers: approvalData.approvers
        })

        alert(`Đã gửi phê duyệt cho ${approvalData.approvers.length} người. Chiến dịch đang chờ phê duyệt.`)

        // Có thể chuyển hướng hoặc cập nhật trạng thái campaign
        // navigate('/recruiter/campaigns')
    }

    const getProgressPercentage = (current, target) => {
        return Math.round((current / target) * 100)
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate('/recruiter/campaigns')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Quay lại"
                    >
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{campaign.name}</h1>
                        <p className="text-slate-600">Chiến dịch đang chờ phê duyệt</p>
                    </div>
                </div>

                {/* Status Banner */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-yellow-800">Chiến dịch đang chờ phê duyệt</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                Chiến dịch này cần được phê duyệt trước khi có thể bắt đầu tuyển dụng.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Main Info */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Thông tin Chiến dịch</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <span className="text-sm text-slate-600">Vị trí:</span>
                                <p className="font-medium text-slate-800">{campaign.position}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Phòng ban:</span>
                                <p className="font-medium text-slate-800">{campaign.department}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Ngày bắt đầu:</span>
                                <p className="font-medium text-slate-800">{campaign.startDate}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Ngày kết thúc:</span>
                                <p className="font-medium text-slate-800">{campaign.endDate}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Mục tiêu tuyển dụng:</span>
                                <p className="font-medium text-slate-800">{campaign.targetHires} người</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Đã tuyển:</span>
                                <p className="font-medium text-slate-800">{campaign.currentHires} người</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <span className="text-sm text-slate-600">Mô tả:</span>
                            <p className="text-slate-800 mt-1">{campaign.description}</p>
                        </div>

                        <div>
                            <span className="text-sm text-slate-600">Yêu cầu:</span>
                            <p className="text-slate-800 mt-1">{campaign.requirements}</p>
                        </div>
                    </div>
                </div>

                {/* Progress & Actions */}
                <div className="space-y-6">
                    {/* Approval Status */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Trạng thái Phê duyệt</h3>

                        {!approvalStatus.submitted ? (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-slate-600 mb-1">
                                    <span>Phê duyệt</span>
                                    <span>Chưa gửi</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div className="bg-slate-300 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-slate-600 mb-1">
                                    <span>Phê duyệt</span>
                                    <span>{approvalStatus.approvedCount}/{approvalStatus.totalApprovers} ({getProgressPercentage(approvalStatus.approvedCount, approvalStatus.totalApprovers)}%)</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${approvalStatus.approvedCount === approvalStatus.totalApprovers
                                            ? 'bg-green-600'
                                            : approvalStatus.approvedCount > 0
                                                ? 'bg-yellow-600'
                                                : 'bg-slate-300'
                                            }`}
                                        style={{ width: `${getProgressPercentage(approvalStatus.approvedCount, approvalStatus.totalApprovers)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${!approvalStatus.submitted
                                ? 'bg-yellow-100 text-yellow-800'
                                : approvalStatus.approvedCount === approvalStatus.totalApprovers
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {!approvalStatus.submitted ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    ) : approvalStatus.approvedCount === approvalStatus.totalApprovers ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                                {!approvalStatus.submitted
                                    ? 'Chờ gửi phê duyệt'
                                    : approvalStatus.approvedCount === approvalStatus.totalApprovers
                                        ? 'Đã phê duyệt hoàn tất'
                                        : 'Đang chờ phê duyệt'
                                }
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Hành động</h3>

                        <div className="space-y-3">
                            {!approvalStatus.submitted && (
                                <button
                                    onClick={() => setShowApprovalModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Phê duyệt
                                </button>
                            )}

                            {approvalStatus.submitted && (
                                <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-600 mb-2">Đã gửi phê duyệt cho:</p>
                                    <div className="space-y-1">
                                        {approvalStatus.approvers.map((approver, index) => (
                                            <div key={index} className="text-xs text-slate-700">
                                                • {approver.name} - {approver.position}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => alert('Chức năng chỉnh sửa đang được phát triển')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 rounded-lg transition-all duration-200 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Modal */}
            <ApprovalModal
                isOpen={showApprovalModal}
                onClose={() => setShowApprovalModal(false)}
                onSubmit={handleApprovalSubmit}
                campaign={campaign}
            />
        </div>
    )
}

export default PendingCampaignDetail
