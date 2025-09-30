import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CreateCampaign = () => {
    const [formData, setFormData] = useState({
        position: '',
        department: '',
        unit: 'Cabin Crew - Tiếp viên hàng không',
        quantity: '',
        startDate: '',
        endDate: '',
        description: '',
        requirements: '',
        batches: [
            {
                name: 'Đợt 1',
                time: '',
                location: '',
                method: 'Trực tiếp',
                owner: '',
                target: '',
                note: ''
            }
        ]
    })

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const departments = [
        'Cabin Crew',
        'Flight Operations',
        'Ground Operations',
        'Customer Service',
        'Maintenance'
    ]

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

    const handleBatchChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            batches: prev.batches.map((batch, i) =>
                i === index ? { ...batch, [field]: value } : batch
            )
        }))
    }

    const addBatch = () => {
        setFormData(prev => ({
            ...prev,
            batches: [...prev.batches, {
                name: `Đợt ${prev.batches.length + 1}`,
                time: '',
                location: '',
                method: 'Trực tiếp',
                owner: '',
                target: '',
                note: ''
            }]
        }))
    }

    const removeBatch = (index) => {
        if (formData.batches.length > 1) {
            setFormData(prev => ({
                ...prev,
                batches: prev.batches.filter((_, i) => i !== index)
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.position.trim()) {
            newErrors.position = 'Vị trí tuyển là bắt buộc'
        }
        if (!formData.department) {
            newErrors.department = 'Phòng ban là bắt buộc'
        }
        if (!formData.unit.trim()) {
            newErrors.unit = 'Đơn vị là bắt buộc'
        }
        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
            newErrors.quantity = 'Số lượng tuyển phải lớn hơn 0'
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Ngày bắt đầu là bắt buộc'
        }
        if (!formData.endDate) {
            newErrors.endDate = 'Ngày kết thúc là bắt buộc'
        }
        if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
            newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả nhu cầu là bắt buộc'
        }
        if (!formData.requirements.trim()) {
            newErrors.requirements = 'Yêu cầu là bắt buộc'
        }

        formData.batches.forEach((batch, index) => {
            if (!batch.time.trim()) {
                newErrors[`batches.${index}.time`] = 'Thời gian đợt tuyển là bắt buộc'
            }
            if (!batch.location.trim()) {
                newErrors[`batches.${index}.location`] = 'Địa điểm đợt tuyển là bắt buộc'
            }
            if (!batch.owner.trim()) {
                newErrors[`batches.${index}.owner`] = 'Người phụ trách là bắt buộc'
            }
            if (!batch.target || parseInt(batch.target) <= 0) {
                newErrors[`batches.${index}.target`] = 'Chỉ tiêu phải lớn hơn 0'
            }
        })

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
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log('Creating campaign:', formData)
            alert('Tạo campaign thành công!')
            navigate('/recruiter/campaigns')
        } catch (error) {
            console.error('Error creating campaign:', error)
            alert('Có lỗi xảy ra khi tạo campaign')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        if (window.confirm('Bạn có chắc chắn muốn hủy? Tất cả thông tin sẽ bị mất.')) {
            navigate('/recruiter/campaigns')
        }
    }

    return (
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-red-600 tracking-wide uppercase">
                        Tạo Yêu cầu tuyển dụng - MRF
                    </h1>
                    <p className="text-slate-600 mt-1 text-sm">Đăng công khai tuyển dụng - Cabin Crew</p>
                </div>
                <button
                    onClick={() => navigate('/recruiter/campaigns')}
                    className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700"
                >
                    Quay lại
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Thông tin cơ bịn */}
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-sm text-slate-500">Thông tin đề xuất</div>
                                    <div className="text-slate-800 font-semibold">Đặng Bích Thu Thủy (Crew Welfare Team Leader)</div>
                                </div>
                                <div className="text-right text-xs text-slate-500">
                                    <div>Ngày tạo: {new Date().toLocaleString('vi-VN')}</div>
                                    <div>Mã số: {Math.floor(Math.random() * 1000000)}</div>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Vị trí tuyển *
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.position ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            placeholder="Nhập vị trí tuyển dụng"
                                        />
                                        {errors.position && (
                                            <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Phòng ban *
                                        </label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.department ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                        >
                                            <option value="">-- Chọn phòng ban --</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                        {errors.department && (
                                            <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Đơn vị *
                                        </label>
                                        <input
                                            type="text"
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.unit ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            placeholder="Nhập đơn vị tổ chức"
                                        />
                                        {errors.unit && (
                                            <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Số lượng tuyển *
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            min="1"
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.quantity ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            placeholder="Nhập số lượng cần tuyển"
                                        />
                                        {errors.quantity && (
                                            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Ngày bắt đầu *
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
                                            Ngày kết thúc *
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
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Mô tả nhu cầu *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        placeholder="Mô tả chi tiết về nhu cầu tuyển dụng..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Yêu cầu *
                                    </label>
                                    <textarea
                                        name="requirements"
                                        value={formData.requirements}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.requirements ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        placeholder="Liệt kê các yêu cầu cho ứng viên..."
                                    />
                                    {errors.requirements && (
                                        <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Kế hoạch các đợt tuyển */}
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                                <div className="font-semibold text-slate-800">Kế hoạch các đợt tuyển</div>
                                <button
                                    type="button"
                                    onClick={addBatch}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                                >
                                    + Thêm đợt
                                </button>
                            </div>

                            <div className="p-5">
                                <div className="space-y-4">
                                    {formData.batches.map((batch, index) => (
                                        <div key={index} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                                            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-semibold text-slate-800">{batch.name}</span>
                                                    {formData.batches.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeBatch(index)}
                                                            className="text-red-600 hover:text-red-800 text-xs"
                                                        >
                                                            ✕ Xóa
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian *</label>
                                                        <input
                                                            type="text"
                                                            value={batch.time}
                                                            onChange={(e) => handleBatchChange(index, 'time', e.target.value)}
                                                            className={`w-full px-2 py-1 text-xs border rounded ${errors[`batches.${index}.time`] ? 'border-red-300' : 'border-slate-300'
                                                                }`}
                                                            placeholder="01/10/2024 - 15/10/2024"
                                                        />
                                                        {errors[`batches.${index}.time`] && (
                                                            <p className="text-xs text-red-600 mt-1">{errors[`batches.${index}.time`]}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Địa điểm *</label>
                                                        <select
                                                            value={batch.location}
                                                            onChange={(e) => handleBatchChange(index, 'location', e.target.value)}
                                                            className={`w-full px-2 py-1 text-xs border rounded ${errors[`batches.${index}.location`] ? 'border-red-300' : 'border-slate-300'
                                                                }`}
                                                        >
                                                            <option value="">-- Chọn địa điểm --</option>
                                                            {locations.map(location => (
                                                                <option key={location} value={location}>{location}</option>
                                                            ))}
                                                        </select>
                                                        {errors[`batches.${index}.location`] && (
                                                            <p className="text-xs text-red-600 mt-1">{errors[`batches.${index}.location`]}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức</label>
                                                        <select
                                                            value={batch.method}
                                                            onChange={(e) => handleBatchChange(index, 'method', e.target.value)}
                                                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                                                        >
                                                            {recruitmentMethods.map(method => (
                                                                <option key={method} value={method}>{method}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phụ trách *</label>
                                                        <input
                                                            type="text"
                                                            value={batch.owner}
                                                            onChange={(e) => handleBatchChange(index, 'owner', e.target.value)}
                                                            className={`w-full px-2 py-1 text-xs border rounded ${errors[`batches.${index}.owner`] ? 'border-red-300' : 'border-slate-300'
                                                                }`}
                                                            placeholder="Nguyễn Văn A"
                                                        />
                                                        {errors[`batches.${index}.owner`] && (
                                                            <p className="text-xs text-red-600 mt-1">{errors[`batches.${index}.owner`]}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Chỉ tiêu *</label>
                                                        <input
                                                            type="number"
                                                            value={batch.target}
                                                            onChange={(e) => handleBatchChange(index, 'target', e.target.value)}
                                                            min="1"
                                                            className={`w-full px-2 py-1 text-xs border rounded ${errors[`batches.${index}.target`] ? 'border-red-300' : 'border-slate-300'
                                                                }`}
                                                            placeholder="10"
                                                        />
                                                        {errors[`batches.${index}.target`] && (
                                                            <p className="text-xs text-red-600 mt-1">{errors[`batches.${index}.target`]}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                                                        <input
                                                            type="text"
                                                            value={batch.note}
                                                            onChange={(e) => handleBatchChange(index, 'note', e.target.value)}
                                                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                                                            placeholder="Phỏng vấn vòng 1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Thông tin tổng kết */}
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                            <div className="px-5 py-4 border-b border-slate-200 font-semibold text-slate-800">
                                Tổng quan Campaign
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Tổng đợt tuyển:</span>
                                    <span className="font-medium text-slate-800">{formData.batches.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Chỉ tiêu tổng:</span>
                                    <span className="font-medium text-slate-800">
                                        {formData.batches.reduce((sum, batch) => sum + (parseInt(batch.target) || 0), 0)} người
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Thời gian dự kiến:</span>
                                    <span className="font-medium text-slate-800">
                                        {formData.startDate && formData.endDate ?
                                            `${formData.startDate} - ${formData.endDate}` :
                                            'Chưa xác định'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${isSubmitting
                                        ? 'bg-slate-400 cursor-not-allowed text-white'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                        }`}
                                >
                                    {isSubmitting ? 'Đang tạo...' : 'Tạo Campaign'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default CreateCampaign