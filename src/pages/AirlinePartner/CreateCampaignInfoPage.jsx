import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CreateCampaignInfoPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        quantity: '',
        startDate: '',
        endDate: '',
        description: '',
        requirements: '',
        batches: []
    })

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()


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

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc'
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
            navigate('/airline-partner/campaigns')
        } catch (error) {
            console.error('Error creating campaign:', error)
            alert('Có lỗi xảy ra khi tạo campaign')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        if (window.confirm('Bạn có chắc chắn muốn hủy? Tất cả thông tin sẽ bị mất.')) {
            navigate('/airline-partner/campaigns')
        }
    }

    return (
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
            <div className="flex-1 mr-50">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tiêu đề *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-300' : 'border-slate-300'}`}
                            placeholder="Nhập tiêu đề yêu cầu tuyển dụng"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>
                    <p className="text-slate-600 mt-1 text-sm">Đăng công khai tuyển dụng - Cabin Crew</p>
                </div>
                <button
                    onClick={() => navigate('/airline-partner/campaigns')}
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
                            </div>

                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    
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
                                    {isSubmitting ? 'Đang tạo...' : 'Tạo yêu cầu'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default CreateCampaignInfoPage