import React, { useState } from 'react'
import { t } from '../i18n'

const PostVerificationModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        englishCertificate: null,
        healthCertificate: null
    })

    const [errors, setErrors] = useState({})

    const handleFileChange = (e) => {
        const { name, files } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: files[0] || null
        }))

        // Clear error when file is selected
        if (files[0]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.englishCertificate) {
            newErrors.englishCertificate = 'Vui lòng tải lên chứng chỉ tiếng Anh'
        }

        if (!formData.healthCertificate) {
            newErrors.healthCertificate = 'Vui lòng tải lên giấy khám sức khỏe'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (validateForm()) {
            onSubmit(formData)
            onClose()
        }
    }

    const handleClose = () => {
        setFormData({
            englishCertificate: null,
            healthCertificate: null
        })
        setErrors({})
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Nộp hậu kiểm
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* English Certificate Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Chứng chỉ tiếng Anh *
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                name="englishCertificate"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required
                            />
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-sm text-slate-600">
                                        {formData.englishCertificate ? (
                                            <span className="text-green-600 font-medium">
                                                ✓ {formData.englishCertificate.name}
                                            </span>
                                        ) : (
                                            <span>Nhấp để chọn chứng chỉ tiếng Anh</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Hỗ trợ: PDF, DOC, DOCX, JPG, PNG
                                    </p>
                                </div>
                            </div>
                        </div>
                        {errors.englishCertificate && (
                            <p className="text-red-500 text-sm mt-1">{errors.englishCertificate}</p>
                        )}
                    </div>

                    {/* Health Certificate Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Giấy khám sức khỏe *
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                name="healthCertificate"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required
                            />
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm text-slate-600">
                                        {formData.healthCertificate ? (
                                            <span className="text-green-600 font-medium">
                                                ✓ {formData.healthCertificate.name}
                                            </span>
                                        ) : (
                                            <span>Nhấp để chọn giấy khám sức khỏe</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Hỗ trợ: PDF, DOC, DOCX, JPG, PNG
                                    </p>
                                </div>
                            </div>
                        </div>
                        {errors.healthCertificate && (
                            <p className="text-red-500 text-sm mt-1">{errors.healthCertificate}</p>
                        )}
                    </div>

                    {/* Information Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-medium text-blue-800">Lưu ý quan trọng</h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Chứng chỉ tiếng Anh phải còn hiệu lực</li>
                                        <li>Giấy khám sức khỏe phải được cấp trong vòng 6 tháng gần nhất</li>
                                        <li>File tải lên phải rõ nét, đầy đủ thông tin</li>
                                        <li>Kích thước file tối đa: 10MB</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            Nộp hậu kiểm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PostVerificationModal
