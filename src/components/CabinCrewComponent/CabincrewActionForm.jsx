import React, { useCallback, useState } from 'react'
import { t } from '../../i18n'
import { updateFlightExperience } from '../../service/api'

const CabincrewActionForm = ({
    children,
    formData,
    files,
    applicationId,
    isEditing,
    setIsEditing,
    originalFormData,
    setOriginalFormData,
    setFormData,
    captchaCode,
    captchaInput,
    handleInputChange,
    refreshCaptcha,
    applicationStatus
}) => {
    const [isSaving, setIsSaving] = useState(false)

    const validateCaptcha = useCallback(() => {
        if (captchaInput.toUpperCase() !== captchaCode) {
            alert(t('application_form_captcha_incorrect'))
            refreshCaptcha()
            return false
        }
        return true
    }, [captchaCode, captchaInput, refreshCaptcha])

    const handleEditClick = useCallback(() => {
        if (applicationStatus === 'passed') {
            return
        }
        setOriginalFormData({ ...formData })
        setIsEditing(true)
    }, [formData, setIsEditing, setOriginalFormData, applicationStatus])

    const handleSaveClick = useCallback(async (e) => {
        e.preventDefault()
        if (isSaving) {
            return
        }
        if (!validateCaptcha()) {
            return
        }
        if (!applicationId) {
            alert('Không tìm thấy mã hồ sơ. Vui lòng tải lại trang và thử lại.')
            return
        }

        setIsSaving(true)
        try {
            // Chỉ gửi totalFlightHours và experience
            // Xử lý experience: nếu là "khác" thì lấy experienceOther, ngược lại lấy giá trị từ dropdown
            const experienceValue = formData.experience === 'khác'
                ? formData.experienceOther
                : formData.experience

            const payload = {
                totalFlightHours: formData.totalFlightHours ? parseInt(formData.totalFlightHours, 10) : 0,
                experience: experienceValue || null
            }

            // Gọi API với applicationId (được sử dụng làm activityId trong API endpoint)
            const result = await updateFlightExperience(applicationId, payload)
            if (result.success) {
                alert(result.message || 'Đã cập nhật thông tin thành công!')
                setIsEditing(false)
                setOriginalFormData(null)
            } else {
                alert(result.error || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.')
            }
        } catch (error) {
            console.error('Update flight experience error:', error)
            alert('Có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại sau.')
        } finally {
            setIsSaving(false)
        }
    }, [applicationId, formData, isSaving, setIsEditing, setOriginalFormData, validateCaptcha])

    const handleCancelClick = useCallback(() => {
        if (originalFormData) {
            setFormData(originalFormData)
        }
        setIsEditing(false)
        setOriginalFormData(null)
    }, [originalFormData, setFormData, setIsEditing, setOriginalFormData])

    return (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {children}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Captcha Verification</label>
                <div className="flex items-center gap-4">
                    <div className="bg-gray-200 p-4 rounded border text-2xl font-bold text-gray-700 select-none">
                        {captchaCode}
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            name="captcha"
                            value={captchaInput}
                            onChange={handleInputChange}
                            placeholder="Enter captcha code"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="text-sm text-blue-600 underline hover:text-blue-800 cursor-pointer"
                >
                    Try new code
                </button>
            </div>

            <div className="flex gap-4">
                {!isEditing ? (
                    <>
                        <button
                            type="button"
                            onClick={handleEditClick}
                            disabled={applicationStatus === 'passed'}
                            className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md text-lg ${applicationStatus === 'passed' ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            Cập nhật thông tin
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={handleCancelClick}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md text-lg"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveClick}
                            disabled={isSaving || applicationStatus === 'passed'}
                            className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md text-lg ${isSaving || applicationStatus === 'passed' ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSaving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </>
                )}
            </div>
        </form>
    )
}

export default CabincrewActionForm