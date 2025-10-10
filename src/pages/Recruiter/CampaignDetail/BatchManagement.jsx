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

const CreateBatchModal = ({ isOpen, onClose, onSubmit, editingBatch = null, batchData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        location: '',
        method: 'Trực tiếp',
        owner: '',
        target: '',
        note: ''
    })
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Populate form data when editing
    React.useEffect(() => {
        if (editingBatch && batchData) {
            setFormData({
                name: batchData.name || '',
                startDate: batchData.startDate || '',
                endDate: batchData.endDate || '',
                location: batchData.location || '',
                method: batchData.method || 'Trực tiếp',
                owner: batchData.owner || '',
                target: batchData.target?.toString() || '',
                note: batchData.note || ''
            })
        } else {
            // Reset form for new batch
            setFormData({
                name: '',
                startDate: '',
                endDate: '',
                location: '',
                method: 'Trực tiếp',
                owner: '',
                target: '',
                note: ''
            })
        }
    }, [editingBatch, batchData])

    const locations = [
        'Hà Nội',
        'TP.HCM',
        'Đà Nẵng',
        'Hải Phòng',
        'Cần Thơ'
    ]

    const recruitmentMethods = [
        'Trực tiếp',
        'Trực tuyến',
        'Hybrid'
    ]

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Tên đợt là bắt buộc'
        }
        if (!formData.startDate.trim()) {
            newErrors.startDate = 'Thời gian bắt đầu là bắt buộc'
        }
        if (!formData.endDate.trim()) {
            newErrors.endDate = 'Thời gian kết thúc là bắt buộc'
        }
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = 'Thời gian kết thúc phải sau thời gian bắt đầu'
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Địa điểm đợt tuyển là bắt buộc'
        }
        if (!formData.owner.trim()) {
            newErrors.owner = 'Người phụ trách là bắt buộc'
        }
        if (!formData.target || parseInt(formData.target) <= 0) {
            newErrors.target = 'Chỉ tiêu phải lớn hơn 0'
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

            // Create new batch object with additional properties
            const newBatch = {
                ...formData,
                time: `${formData.startDate} - ${formData.endDate}`, // Keep backward compatibility
                status: 'planned',
                current: 0,
                totalApplicants: 0,
                appliedCandidates: 0
            }

            onSubmit(newBatch)

            // Reset form
            setFormData({
                name: '',
                startDate: '',
                endDate: '',
                location: '',
                method: 'Trực tiếp',
                owner: '',
                target: '',
                note: ''
            })
            setErrors({})
            onClose()
        } catch (error) {
            console.error('Error creating batch:', error)
            alert('Có lỗi xảy ra khi tạo đợt')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setFormData({
            name: '',
            startDate: '',
            endDate: '',
            location: '',
            method: 'Trực tiếp',
            owner: '',
            target: '',
            note: ''
        })
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
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {editingBatch ? 'Chỉnh sửa đợt tuyển' : 'Tạo đợt tuyển mới'}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {editingBatch ? 'Cập nhật thông tin đợt tuyển' : 'Thêm đợt tuyển dụng mới vào campaign'}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Tên đợt *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-slate-300'
                                    }`}
                                placeholder="Đợt 1, Đợt 2..."
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Thời gian bắt đầu *
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.startDate ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.startDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Thời gian kết thúc *
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.endDate ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.endDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Địa điểm *
                            </label>
                            <select
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.location ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            >
                                <option value="">-- Chọn địa điểm --</option>
                                {locations.map(location => (
                                    <option key={location} value={location}>{location}</option>
                                ))}
                            </select>
                            {errors.location && (
                                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Hình thức
                            </label>
                            <select
                                name="method"
                                value={formData.method}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {recruitmentMethods.map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Phụ trách *
                            </label>
                            <input
                                type="text"
                                name="owner"
                                value={formData.owner}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.owner ? 'border-red-300' : 'border-slate-300'
                                    }`}
                                placeholder="Nguyễn Văn A"
                            />
                            {errors.owner && (
                                <p className="mt-1 text-sm text-red-600">{errors.owner}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Chỉ tiêu *
                            </label>
                            <input
                                type="number"
                                name="target"
                                value={formData.target}
                                onChange={handleInputChange}
                                min="1"
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.target ? 'border-red-300' : 'border-slate-300'
                                    }`}
                                placeholder="10"
                            />
                            {errors.target && (
                                <p className="mt-1 text-sm text-red-600">{errors.target}</p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Ghi chú
                            </label>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Phỏng vấn vòng 1, yêu cầu đặc biệt..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
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
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {editingBatch ? 'Đang cập nhật...' : 'Đang tạo...'}
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    {editingBatch ? 'Cập nhật đợt' : 'Tạo đợt'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const BatchCard = ({ batch, statusCfg, percent, campaignId, onEdit }) => {
    const [openStats, setOpenStats] = useState(false)
    const navigate = useNavigate()

    // Kiểm tra xem đợt có đang "sắp diễn ra" không
    const isUpcoming = batch.status === 'upcoming'

    const handleViewApplicants = () => {
        // Không cho phép xem danh sách ứng viên nếu đợt đang "sắp diễn ra"
        if (isUpcoming) {
            return
        }

        navigate('/applications', {
            state: {
                campaignId,
                batchName: batch.name,
                batch: batch
            }
        })
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    {batch.name}
                    <button
                        onClick={onEdit}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                        title="Chỉnh sửa đợt tuyển"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.color}`}>{statusCfg.text}</span>
            </div>
            <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <InfoMini label="Thời gian bắt đầu" value={batch.startDate ? new Date(batch.startDate).toLocaleDateString('vi-VN') : (batch.time ? batch.time.split(' - ')[0] : '—')} />
                    <InfoMini label="Thời gian kết thúc" value={batch.endDate ? new Date(batch.endDate).toLocaleDateString('vi-VN') : (batch.time ? batch.time.split(' - ')[1] : '—')} />
                    <InfoMini label="Địa điểm" value={batch.location || '—'} />
                    <InfoMini label="Hình thức" value={batch.method || '—'} />
                    <InfoMini label="Phụ trách" value={batch.owner || '—'} />
                    {batch.target !== undefined && (
                        <InfoMini label="Chỉ tiêu" value={`${batch.current ?? 0}/${batch.target}`} />
                    )}
                    {batch.note && (
                        <InfoMini label="Ghi chú" value={batch.note} />
                    )}
                </div>

                {/* Applicant Statistics Dropdown */}
                {(batch.totalApplicants !== undefined || batch.appliedCandidates !== undefined) && (
                    <div className="border-t border-slate-100 pt-3">
                        <button
                            onClick={() => setOpenStats(!openStats)}
                            className="w-full flex items-center justify-between text-xs text-slate-700 font-medium hover:text-blue-600 transition"
                        >
                            <span>Thống kê ứng viên</span>
                            <span>{openStats ? '▲' : '▼'}</span>
                        </button>
                        {openStats && (
                            <div className="mt-3">
                                <div className="grid grid-cols-2 gap-3">
                                    {batch.totalApplicants !== undefined && (
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <div className="text-xs text-blue-600 mb-1">Lượt quan tâm</div>
                                            <div className="text-lg font-bold text-blue-700">{batch.totalApplicants}</div>
                                        </div>
                                    )}
                                    {batch.appliedCandidates !== undefined && (
                                        <div className="bg-green-50 rounded-lg p-3">
                                            <div className="text-xs text-green-600 mb-1">Đã ứng tuyển</div>
                                            <div className="text-lg font-bold text-green-700">{batch.appliedCandidates}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Recruitment Progress */}
                {batch.target !== undefined && (
                    <div className="border-t border-slate-100 pt-3">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                            <span>Tiến độ tuyển dụng</span>
                            <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                        </div>
                    </div>
                )}

                {/* View Applicants Button */}
                <div className="border-t border-slate-100 pt-3">
                    <button
                        onClick={handleViewApplicants}
                        disabled={isUpcoming}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-md transition-colors duration-200 font-medium ${isUpcoming
                            ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800'
                            }`}
                        title={isUpcoming ? 'Chưa thể xem danh sách ứng viên vì đợt chưa bắt đầu' : 'Xem danh sách ứng viên'}
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        {isUpcoming ? 'Chưa thể xem danh sách' : 'Xem danh sách ứng viên'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const BatchManagement = ({ campaign, onCreateBatch }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBatch, setEditingBatch] = useState(null)
    const [currentBatches, setCurrentBatches] = useState(() => {
        return Array.isArray(campaign?.batches) && campaign.batches.length ? campaign.batches : [
            {
                name: 'Đợt 1',
                startDate: '2024-10-01',
                endDate: '2024-10-15',
                time: '01/10/2024 - 15/10/2024',
                location: 'Hà Nội',
                method: 'Trực tiếp',
                owner: 'Nguyễn Thanh Tùng',
                status: 'ongoing',
                current: 7,
                target: 10,
                totalApplicants: 125,
                appliedCandidates: 89,
                note: 'Phỏng vấn vòng 1'
            },
            {
                name: 'Đợt 2',
                startDate: '2024-11-01',
                endDate: '2024-11-15',
                time: '01/11/2024 - 15/11/2024',
                location: 'TP.HCM',
                method: 'Trực tiếp',
                owner: 'Trần Bảo Vy',
                status: 'upcoming',
                current: 0,
                target: 10,
                totalApplicants: 0,
                appliedCandidates: 0,
                note: 'Phỏng vấn vòng 2'
            },
        ]
    })

    const getStatus = (status) => {
        const map = {
            ongoing: { text: 'Đang diễn ra', color: 'bg-green-100 text-green-700' },
            completed: { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-700' },
            planned: { text: 'Đã lên kế hoạch', color: 'bg-slate-100 text-slate-700' },
            upcoming: { text: 'Sắp diễn ra', color: 'bg-yellow-100 text-yellow-800' },
            paused: { text: 'Tạm dừng', color: 'bg-orange-100 text-orange-700' },
            cancelled: { text: 'Hủy', color: 'bg-red-100 text-red-700' },
        }
        return map[status] || map.planned
    }

    const percent = (current, target) => {
        if (!target || target <= 0) return 0
        const p = Math.round((Number(current || 0) / Number(target)) * 100)
        return Math.max(0, Math.min(100, p))
    }

    const handleCreateBatch = () => {
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setEditingBatch(null)
    }

    const handleBatchSubmit = (newBatch) => {
        // Generate automatic name if not provided
        if (!newBatch.name.trim()) {
            newBatch.name = `Đợt ${currentBatches.length + 1}`
        }

        // Add new batch to the list
        setCurrentBatches(prev => [...prev, newBatch])

        // Call parent callback if provided
        if (onCreateBatch && typeof onCreateBatch === 'function') {
            onCreateBatch(newBatch)
        }

        console.log('New batch created:', newBatch)
    }

    const handleEditBatch = (batchIndex) => {
        setEditingBatch(batchIndex)
        setIsModalOpen(true)
    }

    const handleUpdateBatch = (updatedBatch) => {
        setCurrentBatches(prev => prev.map((batch, index) =>
            index === editingBatch ? { ...batch, ...updatedBatch } : batch
        ))
        setEditingBatch(null)
        setIsModalOpen(false)
        console.log('Batch updated:', updatedBatch)
    }

    return (
        <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-600">
                    Kế hoạch các đợt tuyển
                </div>
                <button
                    onClick={handleCreateBatch}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo đợt mới
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentBatches.map((batch, index) => {
                    const statusCfg = getStatus(batch.status)
                    const progressPercent = percent(batch.current, batch.target)
                    return (
                        <BatchCard
                            key={index}
                            batch={batch}
                            statusCfg={statusCfg}
                            percent={progressPercent}
                            campaignId={campaign?.id || 1}
                            onEdit={() => handleEditBatch(index)}
                        />
                    )
                })}
            </div>

            {/* Create/Edit Batch Modal */}
            <CreateBatchModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={editingBatch !== null ? handleUpdateBatch : handleBatchSubmit}
                editingBatch={editingBatch}
                batchData={editingBatch !== null ? currentBatches[editingBatch] : null}
            />
        </div>
    )
}

const InfoMini = ({ label, value }) => (
    <div>
        <div className="text-slate-500">{label}</div>
        <div className="text-slate-800 font-medium">{value}</div>
    </div>
)

export default BatchManagement
