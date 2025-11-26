import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { t } from '../../i18n'
import { submitExistingApplication, updateApplication } from '../../service/api'

const ProfileFormActions = ({
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
    refreshCaptcha
}) => {
    const navigate = useNavigate()
    const [isSaving, setIsSaving] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validateCaptcha = useCallback(() => {
        if (captchaInput.toUpperCase() !== captchaCode) {
            alert(t('application_form_captcha_incorrect'))
            refreshCaptcha()
            return false
        }
        return true
    }, [captchaCode, captchaInput, refreshCaptcha])

    const handleUpdate = useCallback((e) => {
        e.preventDefault()
        if (!validateCaptcha()) {
            return
        }

        console.log('Updated form data:', formData)
        console.log('Updated files:', files)
        alert('Đã cập nhật thông tin thành công!')
    }, [files, formData, validateCaptcha])

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()
        if (isSubmitting) {
            return
        }
        if (!validateCaptcha()) {
            return
        }
        if (!applicationId) {
            alert('Không tìm thấy mã hồ sơ. Vui lòng tải lại trang và thử lại.')
            return
        }
        const campaignRoundId = formData.campaignRoundId
            ? parseInt(formData.campaignRoundId, 10)
            : undefined
        setIsSubmitting(true)
        try {
            const result = await submitExistingApplication(applicationId, campaignRoundId)
            if (result.success) {
                alert(result.message || 'Đã nộp hồ sơ thành công!')
                navigate('/profile')
            } else {
                alert(result.error || 'Không thể nộp hồ sơ. Vui lòng thử lại.')
            }
        } catch (error) {
            console.error('Submit application error:', error)
            alert('Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại sau.')
        } finally {
            setIsSubmitting(false)
        }
    }, [applicationId, formData.campaignRoundId, isSubmitting, navigate, validateCaptcha])

    const handleEditClick = useCallback(() => {
        setOriginalFormData({ ...formData })
        setIsEditing(true)
    }, [formData, setIsEditing, setOriginalFormData])

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
            const campaignRoundId = formData.campaignRoundId
                ? parseInt(formData.campaignRoundId, 10)
                : undefined
            const payload = {
                experience: formData.workingExperience,
                height: formData.height,
                weight: formData.weight,
                englishDegreeNumber: formData.englishCertificate,
                endDate: formData.certificateExpireDate,
                applicationForm: files.applicationForm,
                profilePhoto: files.profilePhoto,
                educationDegree: files.educationDegree,
                englishCertificate: files.englishCertificate,
                passportOrID: files.idCard
            }
            if (campaignRoundId) {
                payload.campaignRoundId = campaignRoundId
            }

            const result = await updateApplication(applicationId, payload)
            if (result.success) {
                alert(result.message || 'Đã cập nhật thông tin thành công!')
                setIsEditing(false)
                setOriginalFormData(null)
            } else {
                alert(result.error || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.')
            }
        } catch (error) {
            console.error('Update application error:', error)
            alert('Có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại sau.')
        } finally {
            setIsSaving(false)
        }
    }, [applicationId, files, formData, isSaving, setIsEditing, setOriginalFormData, validateCaptcha])

    const handleCancelClick = useCallback(() => {
        if (originalFormData) {
            setFormData(originalFormData)
        }
        setIsEditing(false)
        setOriginalFormData(null)
    }, [originalFormData, setFormData, setIsEditing, setOriginalFormData])

    return (
        <form onSubmit={handleUpdate} className="space-y-6">
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
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md text-lg"
                        >
                            Cập nhật thông tin
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md text-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang nộp hồ sơ...' : 'Nộp đơn'}
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
                            className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md text-lg ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </>
                )}
            </div>
        </form>
    )
}

export default ProfileFormActions