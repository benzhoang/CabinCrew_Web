import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../Candidate/Footer'

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
            alert('Mã CAPTCHA không đúng. Vui lòng thử lại!')
            refreshCaptcha()
            return
        }

        // Xử lý submit form ở đây
        console.log('Form data:', formData)
        console.log('Files:', files)
        alert('Đơn ứng tuyển đã được gửi thành công!')
        navigate('/recruitment')
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <p className="text-gray-600 mb-4">Không tìm thấy thông tin chiến dịch.</p>
                        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">Quay lại</button>
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
                    <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">Quay lại</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Job Details and Document Uploads */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h1 className="text-2xl font-bold text-slate-800 mb-4">{campaign.name}</h1>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Department:</span>
                                    <span className="font-medium">Cabin Crew</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Application Period:</span>
                                    <span className="font-medium">Open: 01 Oct 2025, Close: 01 Nov 2025</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Required Document:</span>
                                    <span className="font-medium">VJC-PD-FRM-12 Form Job Application</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">REMEMBER TO UPLOAD THESE DOCUMENT BEFORE YOU APPLY</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        VJC-PD-FRM-12 Form Job Application (file đính kèm/attached file) *
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
                                                        <span>Nhấn để chọn file hoặc kéo thả vào đây</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Ảnh chân dung 4x6 / Profile photo 4x6cm *
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
                                                        <span>Nhấn để chọn ảnh hoặc kéo thả vào đây</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Bằng tốt nghiệp (THPT trở lên)/Education degree (high school diploma or higher) *
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
                                                        <span>Nhấn để chọn file hoặc kéo thả vào đây</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Chứng chỉ tiếng Anh (bắt buộc)/English certificate (must have) *
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
                                                        <span>Nhấn để chọn file hoặc kéo thả vào đây</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        CCCD (2 mặt)/Valid Passport (For Expats) *
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
                                                        <span>Nhấn để chọn file hoặc kéo thả vào đây</span>
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">1. Your email address:</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">2. Your full name:</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">3. Your nationality:</label>
                                <select
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">--Select your nationality--</option>
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">4. Date of Birth:</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">5. Gender:</label>
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
                                        Male
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
                                        Female
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">6. Mobile number (Expats: WhatsApp number):</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">7. Working experience:</label>
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
                                        No experience
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
                                        Less than 1 year
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
                                        1-2 years
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
                                        3-5 years
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">8. Your height (in cm) & weight (in kg):</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Height (cm)</label>
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
                                        <label className="block text-xs text-slate-600 mb-1">Weight (kg)</label>
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
                                <p className="text-xs text-slate-500 mt-1">Example: 165 cm - 53kg</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">9. English Certificate (TOEIC/IELTS/TOEFL) & Expire Date:</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Number</label>
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
                                        <label className="block text-xs text-slate-600 mb-1">Expire Date</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">10. If selected, I hereby commit to accepting this as my permanent base (Cabin Crew only):</label>
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
                                        Flexible base
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
                                        Cam Ranh City (CXR)
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
                                        Da Nang City (DAD)
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">11. Acknowledgement of Terms and Conditions:</label>
                                <p className="text-sm text-slate-600 mb-3">
                                    I acknowledge that my personal data will be processed by Vietjet Aviation Joint Stock Company
                                    in accordance with the <a href="#" className="text-blue-600 underline">Privacy Policy</a>
                                    for recruitment purposes.
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
                                        Yes
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
                                        No
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">CAPTCHA:</label>
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
                                            placeholder="Enter character you see"
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
                                    Try a new code
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md text-lg"
                            >
                                FINISH
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
