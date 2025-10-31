import React, { useState, useEffect } from 'react'
import { t, onLangChange } from '../../i18n'

const ProfileCabinCrewPage = () => {
    // Force re-render when language changes
    const [, forceUpdate] = useState({})

    const [formData, setFormData] = useState({
        email: 'lan.nguyen@email.com',
        fullName: 'Nguyễn Thị Lan',
        nationality: 'vietnamese',
        dateOfBirth: '1995-03-15',
        gender: 'female',
        mobileNumber: '+84 912 345 678',
        workingExperience: '1-2-years',
        flightExperience: '672',
        height: '165',
        weight: '53',
        englishCertificate: 'TOEIC 650',
        certificateExpireDate: '2025-12-31',
        basePreference: 'flexible',
        termsAccepted: 'yes',
        captcha: ''
    })

    const [files, setFiles] = useState({
        applicationForm: { name: 'VJC-PD-FRM-12_Application_Form.pdf' },
        profilePhoto: { name: 'Profile_Photo_4x6.jpg' },
        educationDegree: { name: 'Bachelor_Degree_Certificate.pdf' },
        englishCertificate: { name: 'TOEIC_Certificate_650.pdf' },
        idCard: { name: 'ID_Card_Front_Back.pdf' }
    })

    // Captcha state
    const [captchaCode, setCaptchaCode] = useState('')
    const [captchaInput, setCaptchaInput] = useState('')

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false)
    const [originalFormData, setOriginalFormData] = useState(null)

    // Generate random captcha code
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    // Initialize captcha on component mount
    useEffect(() => {
        setCaptchaCode(generateCaptcha())
    }, [])

    // Load draft data on component mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('applicationFormDraft')
        if (savedDraft) {
            try {
                const draftData = JSON.parse(savedDraft)
                setFormData(draftData.formData)
            } catch (error) {
                console.error('Error loading draft:', error)
            }
        }
    }, [])

    // Listen for language changes and force re-render
    useEffect(() => {
        const unsubscribe = onLangChange(() => {
            forceUpdate({})
        })
        return unsubscribe
    }, [])

    // Refresh captcha function
    const refreshCaptcha = () => {
        setCaptchaCode(generateCaptcha())
        setCaptchaInput('')
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (name === 'captcha') {
            setCaptchaInput(value)
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleFileChange = (e) => {
        const { name, files: fileList } = e.target
        setFiles(prev => ({
            ...prev,
            [name]: fileList[0] || null
        }))
    }

    const handleUpdate = (e) => {
        e.preventDefault()

        // Validate captcha
        if (captchaInput.toUpperCase() !== captchaCode) {
            alert(t('application_form_captcha_incorrect'))
            refreshCaptcha()
            return
        }

        // Xử lý cập nhật form ở đây
        console.log('Updated form data:', formData)
        console.log('Updated files:', files)
        alert('Đã cập nhật thông tin thành công!')
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Validate captcha
        if (captchaInput.toUpperCase() !== captchaCode) {
            alert(t('application_form_captcha_incorrect'))
            refreshCaptcha()
            return
        }

        // Xử lý nộp đơn ở đây
        console.log('Submitted form data:', formData)
        console.log('Submitted files:', files)
        alert('Đã nộp đơn ứng tuyển thành công!')
    }

    const handleEditClick = () => {
        setOriginalFormData({ ...formData })
        setIsEditing(true)
    }

    const handleSaveClick = (e) => {
        e.preventDefault()

        // Validate captcha
        if (captchaInput.toUpperCase() !== captchaCode) {
            alert(t('application_form_captcha_incorrect'))
            refreshCaptcha()
            return
        }

        // Xử lý lưu thông tin
        console.log('Updated form data:', formData)
        console.log('Updated files:', files)
        alert('Đã cập nhật thông tin thành công!')
        setIsEditing(false)
        setOriginalFormData(null)
    }

    const handleCancelClick = () => {
        if (originalFormData) {
            setFormData(originalFormData)
        }
        setIsEditing(false)
        setOriginalFormData(null)
    }

    // Removed unused handleSaveDraft to satisfy linter

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-slate-800">Hồ sơ</h1>
                        {/* Thanh hiển thị kết quả cuối cùng - nhỏ gọn bên cạnh title */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg px-3 py-1 text-white">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">Kết quả cuối cùng</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Document Uploads */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('application_form_remember_upload')}</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('application_form_application_form_file')} *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            name="applicationForm"
                                            onChange={handleFileChange}
                                            disabled={!isEditing}
                                            className={`absolute inset-0 w-full h-full opacity-0 ${!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            required
                                        />
                                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                                            <div className="text-center">
                                                <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm text-slate-600">
                                                    {files.applicationForm ? (
                                                        <span className="text-green-600 font-medium">✓ {files.applicationForm.name}</span>
                                                    ) : (
                                                        <span>{t('application_form_click_to_select')}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('application_form_profile_photo')} *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            name="profilePhoto"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            disabled={!isEditing}
                                            className={`absolute inset-0 w-full h-full opacity-0 ${!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            required
                                        />
                                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                                            <div className="text-center">
                                                <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm text-slate-600">
                                                    {files.profilePhoto ? (
                                                        <span className="text-green-600 font-medium">✓ {files.profilePhoto.name}</span>
                                                    ) : (
                                                        <span>{t('application_form_click_to_select_image')}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('application_form_education_degree')} *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            name="educationDegree"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            disabled={!isEditing}
                                            className={`absolute inset-0 w-full h-full opacity-0 ${!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            required
                                        />
                                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                                            <div className="text-center">
                                                <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-sm text-slate-600">
                                                    {files.educationDegree ? (
                                                        <span className="text-green-600 font-medium">✓ {files.educationDegree.name}</span>
                                                    ) : (
                                                        <span>{t('application_form_click_to_select')}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('application_form_english_certificate')} *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            name="englishCertificate"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            disabled={!isEditing}
                                            className={`absolute inset-0 w-full h-full opacity-0 ${!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            required
                                        />
                                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                                            <div className="text-center">
                                                <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                </svg>
                                                <p className="text-sm text-slate-600">
                                                    {files.englishCertificate ? (
                                                        <span className="text-green-600 font-medium">✓ {files.englishCertificate.name}</span>
                                                    ) : (
                                                        <span>{t('application_form_click_to_select')}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('application_form_id_card')} *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            name="idCard"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            disabled={!isEditing}
                                            className={`absolute inset-0 w-full h-full opacity-0 ${!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            required
                                        />
                                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                                            <div className="text-center">
                                                <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                </svg>
                                                <p className="text-sm text-slate-600">
                                                    {files.idCard ? (
                                                        <span className="text-green-600 font-medium">✓ {files.idCard.name}</span>
                                                    ) : (
                                                        <span>{t('application_form_click_to_select')}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Application Form */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">APPLICATION FORM DETAILS</h2>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">1. Email address:</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">2. Full name:</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">3. Nationality:</label>
                                        <select
                                            name="nationality"
                                            value={formData.nationality}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                                            required
                                        >
                                            <option value="">Select Nationality</option>
                                            <option value="vietnamese">Vietnamese</option>
                                            <option value="american">American</option>
                                            <option value="british">British</option>
                                            <option value="french">French</option>
                                            <option value="german">German</option>
                                            <option value="japanese">Japanese</option>
                                            <option value="korean">Korean</option>
                                            <option value="chinese">Chinese</option>
                                            <option value="thai">Thai</option>
                                            <option value="singaporean">Singaporean</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">4. Date of Birth:</label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">5. Gender:</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="male"
                                                    checked={formData.gender === 'male'}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="mr-2"
                                                    required
                                                />
                                                Male
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="female"
                                                    checked={formData.gender === 'female'}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="mr-2"
                                                    required
                                                />
                                                Female
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">6. Mobile number:</label>
                                        <input
                                            type="tel"
                                            name="mobileNumber"
                                            value={formData.mobileNumber}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">7. Working experience:</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="workingExperience"
                                                    value="no-experience"
                                                    checked={formData.workingExperience === 'no-experience'}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="mr-2"
                                                    required
                                                />
                                                No experience
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="workingExperience"
                                                    value="less-than-1-year"
                                                    checked={formData.workingExperience === 'less-than-1-year'}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="mr-2"
                                                    required
                                                />
                                                Less than 1 year
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="workingExperience"
                                                    value="1-2-years"
                                                    checked={formData.workingExperience === '1-2-years'}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="mr-2"
                                                    required
                                                />
                                                1-2 years
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="workingExperience"
                                                    value="3-5-years"
                                                    checked={formData.workingExperience === '3-5-years'}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="mr-2"
                                                    required
                                                />
                                                3-5 years
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">7a. Flight experience (hours):</label>
                                        <input
                                            type="number"
                                            name="flightExperience"
                                            value={formData.flightExperience}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 500"
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">8. Height & Weight:</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">Height (cm)</label>
                                                <input
                                                    type="number"
                                                    name="height"
                                                    value={formData.height}
                                                    onChange={handleInputChange}
                                                    placeholder="165"
                                                    disabled={!isEditing}
                                                    className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">Weight (kg)</label>
                                                <input
                                                    type="number"
                                                    name="weight"
                                                    value={formData.weight}
                                                    onChange={handleInputChange}
                                                    placeholder="53"
                                                    disabled={!isEditing}
                                                    className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* English Certificate */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">English Certificate</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Certificate Number:</label>
                                        <input
                                            type="text"
                                            name="englishCertificate"
                                            value={formData.englishCertificate}
                                            onChange={handleInputChange}
                                            placeholder="TOEIC 500"
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Expire Date:</label>
                                        <input
                                            type="date"
                                            name="certificateExpireDate"
                                            value={formData.certificateExpireDate}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditing ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Base Preference */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Base Preference</h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Base Preference:</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="basePreference"
                                                value="flexible"
                                                checked={formData.basePreference === 'flexible'}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="mr-2"
                                                required
                                            />
                                            Flexible base
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="basePreference"
                                                value="cam-ranh"
                                                checked={formData.basePreference === 'cam-ranh'}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="mr-2"
                                                required
                                            />
                                            Cam Ranh City (CXR)
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="basePreference"
                                                value="da-nang"
                                                checked={formData.basePreference === 'da-nang'}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="mr-2"
                                                required
                                            />
                                            Da Nang City (DAD)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Terms and Conditions</h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Terms and Conditions:</label>
                                    <p className="text-sm text-slate-600 mb-3">
                                        I acknowledge that my data will be processed in accordance with the <a href="#" className="text-blue-600 underline">Privacy Policy</a> for recruitment purposes.
                                    </p>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="termsAccepted"
                                                value="yes"
                                                checked={formData.termsAccepted === 'yes'}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="mr-2"
                                                required
                                            />
                                            Yes
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="termsAccepted"
                                                value="no"
                                                checked={formData.termsAccepted === 'no'}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="mr-2"
                                                required
                                            />
                                            No
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Captcha */}
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

                            {/* Action Buttons */}
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
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md text-lg"
                                        >
                                            Nộp đơn
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
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md text-lg"
                                        >
                                            Lưu
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileCabinCrewPage
