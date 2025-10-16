import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../Candidate/Footer'
import { t, onLangChange } from '../../i18n'

const ApplicationForm = () => {
    const navigate = useNavigate()
    const { state } = useLocation()
    const campaign = state?.campaign

    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        nationality: '',
        dateOfBirth: '',
        gender: '',
        mobileNumber: '',
        workingExperience: '',
        height: '',
        weight: '',
        englishCertificate: '',
        certificateExpireDate: '',
        basePreference: '',
        termsAccepted: '',
        captcha: ''
    })

    const [files, setFiles] = useState({
        applicationForm: null,
        profilePhoto: null,
        educationDegree: null,
        englishCertificate: null,
        idCard: null
    })

    // Captcha state
    const [captchaCode, setCaptchaCode] = useState('')
    const [captchaInput, setCaptchaInput] = useState('')

    // Force re-render when language changes
    const [, forceUpdate] = useState({})

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

    const handleSubmit = (e) => {
        e.preventDefault()

        // Validate captcha
        if (captchaInput.toUpperCase() !== captchaCode) {
            alert(t('application_form_captcha_incorrect'))
            refreshCaptcha()
            return
        }

        // Xử lý submit form ở đây
        console.log('Form data:', formData)
        console.log('Files:', files)
        alert(t('application_form_submitted_successfully'))
        navigate('/recruitment')
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <p className="text-gray-600 mb-4">{t('application_form_campaign_not_found')}</p>
                        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">{t('application_form_go_back')}</button>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">{t('application_form_go_back')}</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Job Details and Document Uploads */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h1 className="text-2xl font-bold text-slate-800 mb-4">{campaign.name}</h1>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">{t('application_form_department')}:</span>
                                    <span className="font-medium">Cabin Crew</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">{t('application_form_application_period')}:</span>
                                    <span className="font-medium">Open: 01 Oct 2025, Close: 01 Nov 2025</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">{t('application_form_required_document')}:</span>
                                    <span className="font-medium">VJC-PD-FRM-12 Form Job Application</span>
                                </div>
                            </div>
                        </div>

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
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                        <h2 className="text-xl font-bold text-slate-800 mb-6">APPLICATION FORM</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">1. {t('application_form_your_email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">2. {t('application_form_your_fullname')}</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">3. {t('application_form_your_nationality')}</label>
                                <select
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">{t('application_form_select_nationality')}</option>
                                    <option value="vietnamese">{t('application_form_vietnamese')}</option>
                                    <option value="american">{t('application_form_american')}</option>
                                    <option value="british">{t('application_form_british')}</option>
                                    <option value="french">{t('application_form_french')}</option>
                                    <option value="german">{t('application_form_german')}</option>
                                    <option value="japanese">{t('application_form_japanese')}</option>
                                    <option value="korean">{t('application_form_korean')}</option>
                                    <option value="chinese">{t('application_form_chinese')}</option>
                                    <option value="thai">{t('application_form_thai')}</option>
                                    <option value="singaporean">{t('application_form_singaporean')}</option>
                                    <option value="other">{t('application_form_other')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">4. {t('application_form_date_of_birth')}</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">5. {t('application_form_gender')}</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={formData.gender === 'male'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_male')}
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={formData.gender === 'female'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_female')}
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">6. {t('application_form_mobile_number')}</label>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">7. {t('application_form_working_experience')}</label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="workingExperience"
                                            value="no-experience"
                                            checked={formData.workingExperience === 'no-experience'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_no_experience')}
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="workingExperience"
                                            value="less-than-1-year"
                                            checked={formData.workingExperience === 'less-than-1-year'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_less_than_1_year')}
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="workingExperience"
                                            value="1-2-years"
                                            checked={formData.workingExperience === '1-2-years'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_1_2_years')}
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="workingExperience"
                                            value="3-5-years"
                                            checked={formData.workingExperience === '3-5-years'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_3_5_years')}
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">8. {t('application_form_height_weight')}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">{t('application_form_height')}</label>
                                        <input
                                            type="number"
                                            name="height"
                                            value={formData.height}
                                            onChange={handleInputChange}
                                            placeholder="165"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">{t('application_form_weight')}</label>
                                        <input
                                            type="number"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleInputChange}
                                            placeholder="53"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{t('application_form_height_example')}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">9. {t('application_form_english_certificate_info')}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">{t('application_form_certificate_number')}</label>
                                        <input
                                            type="text"
                                            name="englishCertificate"
                                            value={formData.englishCertificate}
                                            onChange={handleInputChange}
                                            placeholder="TOEIC 500"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">{t('application_form_expire_date')}</label>
                                        <input
                                            type="date"
                                            name="certificateExpireDate"
                                            value={formData.certificateExpireDate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">10. {t('application_form_base_preference')}</label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="basePreference"
                                            value="flexible"
                                            checked={formData.basePreference === 'flexible'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_flexible_base')}
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="basePreference"
                                            value="cam-ranh"
                                            checked={formData.basePreference === 'cam-ranh'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_cam_ranh')}
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="basePreference"
                                            value="da-nang"
                                            checked={formData.basePreference === 'da-nang'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_da_nang')}
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">11. {t('application_form_terms_conditions')}</label>
                                <p className="text-sm text-slate-600 mb-3">
                                    {t('application_form_acknowledge_data')} <a href="#" className="text-blue-600 underline">{t('application_form_privacy_policy')}</a>
                                    {t('application_form_for_recruitment')}
                                </p>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="termsAccepted"
                                            value="yes"
                                            checked={formData.termsAccepted === 'yes'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_yes')}
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="termsAccepted"
                                            value="no"
                                            checked={formData.termsAccepted === 'no'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_no')}
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{t('application_form_captcha')}</label>
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
                                            placeholder={t('application_form_enter_captcha')}
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
                                    {t('application_form_try_new_code')}
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md text-lg"
                            >
                                {t('application_form_finish')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ApplicationForm
