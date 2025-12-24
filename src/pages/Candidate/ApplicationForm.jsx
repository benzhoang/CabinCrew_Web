import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../../components/Navbar'
import Footer from '../Candidate/Footer'
import { t, onLangChange } from '../../i18n'
import { saveApplicationDraft, submitApplication, getUserProfile } from '../../service/api'
import EyeIcon from '../../components/ApplicationFormComponents/EyeIcon'
import DeleteFileButton from '../../components/ApplicationFormComponents/DeleteFileButton'
import CaptchaInput from '../../components/ApplicationFormComponents/CaptchaInput'

const ApplicationForm = () => {
    const navigate = useNavigate()
    const { state } = useLocation()
    const campaign = state?.campaign
    const batch = state?.batch

    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        dateOfBirth: '',
        gender: '',
        mobileNumber: '',
        height: '',
        weight: '',
        termsAccepted: '',
        captcha: ''
    })

    const [files, setFiles] = useState({
        applicationForm: null,
        profilePhoto: null,
        educationDegree: null,
        englishCertificate: null,
        idCard: null,
        idCardBack: null
    })

    // Dùng key để reset input file khi xóa
    const [fileInputKeys, setFileInputKeys] = useState({
        applicationForm: 0,
        profilePhoto: 0,
        educationDegree: 0,
        englishCertificate: 0,
        idCard: 0,
        idCardBack: 0
    })

    // Captcha state
    const [captchaInput, setCaptchaInput] = useState('')
    const [captchaCode, setCaptchaCode] = useState('')

    // Loading state for save draft and submit
    const [isSavingDraft, setIsSavingDraft] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Force re-render when language changes
    const [, forceUpdate] = useState({})

    // Hàm decode JWT token
    const decodeJwt = (token) => {
        if (!token) {
            return null;
        }
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }
            const payload = parts[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
            const decoded = atob(paddedPayload);
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Lỗi khi decode JWT:', error);
            return null;
        }
    };

    // Hàm lấy userId từ localStorage hoặc token
    const getUserId = () => {
        const userData = JSON.parse(localStorage.getItem('user') || 'null');
        if (userData) {
            const userId = userData.userId || userData.userID || userData.id ||
                userData.user?.userId || userData.user?.id ||
                userData.data?.userId || userData.data?.id;
            if (userId) {
                return userId;
            }
        }
        const token = localStorage.getItem('token') || userData?.accessToken;
        if (token) {
            const decoded = decodeJwt(token);
            if (decoded) {
                return decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                    decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier'] ||
                    decoded.sub ||
                    decoded.userId ||
                    decoded.id;
            }
        }
        return null;
    };

    // Hàm format date sang YYYY-MM-DD cho input type="date"
    const formatDateForInput = (dateString) => {
        if (!dateString) {
            return ''
        }
        // Nếu đã là format YYYY-MM-DD, trả về như cũ
        if (typeof dateString === 'string') {
            const ymdMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
            if (ymdMatch) {
                return dateString.split('T')[0] // Bỏ phần time nếu có
            }
            // Thử parse như Date object
            try {
                const date = new Date(dateString)
                if (!isNaN(date.getTime())) {
                    // Lấy local date parts để tránh timezone issues
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    return `${year}-${month}-${day}`
                }
            } catch (e) {
                console.error('Error parsing date:', dateString, e)
            }
        }
        return ''
    }

    // Handle captcha code change callback
    const handleCaptchaCodeChange = (code) => {
        setCaptchaCode(code)
    }

    // Load user profile data from API
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const userId = getUserId()
                if (!userId) {
                    console.warn('Không tìm thấy userId, bỏ qua việc load profile')
                    return
                }

                const result = await getUserProfile(userId)
                if (result.success && result.data) {
                    const userData = result.data
                    console.log('User profile data from API:', userData)

                    // Format dateOfBirth sang YYYY-MM-DD cho input type="date"
                    const formattedDateOfBirth = userData.dateOfBirth
                        ? formatDateForInput(userData.dateOfBirth)
                        : ''

                    console.log('Raw dateOfBirth from API:', userData.dateOfBirth)
                    console.log('Formatted dateOfBirth:', formattedDateOfBirth)

                    // Ưu tiên dữ liệu từ API nếu có
                    setFormData(prev => ({
                        ...prev,
                        email: userData.email || prev.email,
                        fullName: userData.fullName || prev.fullName,
                        dateOfBirth: formattedDateOfBirth || prev.dateOfBirth || '',
                        gender: userData.gender ? String(userData.gender) : prev.gender,
                        mobileNumber: userData.phoneNumber || prev.mobileNumber
                    }))
                } else {
                    console.warn('Không thể lấy thông tin người dùng:', result.error)
                }
            } catch (error) {
                console.error('Error loading user profile:', error)
            }
        }

        loadUserProfile()
    }, [])

    // Load draft data on component mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('applicationFormDraft')
        const locationState = state?.hasDraft && state?.draftData

        if (locationState) {
            // Load từ state khi navigate từ ProfilePage - merge với dữ liệu hiện có
            setFormData(prev => {
                const draftFormData = state.draftData.formData || {}
                return {
                    ...prev,
                    ...Object.fromEntries(
                        Object.entries(draftFormData).filter(([key, value]) =>
                            value !== '' && value !== null && value !== undefined
                        )
                    )
                }
            })
        } else if (savedDraft) {
            try {
                const draftData = JSON.parse(savedDraft)
                // Chỉ load nếu cùng campaign - merge với dữ liệu hiện có
                if (draftData.campaignId === campaign?.id) {
                    setFormData(prev => {
                        const draftFormData = draftData.formData || {}
                        // Chỉ merge các field có giá trị, không ghi đè dateOfBirth nếu draft không có
                        return {
                            ...prev,
                            ...Object.fromEntries(
                                Object.entries(draftFormData).filter(([key, value]) =>
                                    value !== '' && value !== null && value !== undefined
                                )
                            )
                        }
                    })
                    // Không hiển thị thông báo xác nhận, chỉ load dữ liệu
                }
            } catch (error) {
                console.error('Error loading draft:', error)
            }
        }
    }, [campaign?.id, state])

    // Listen for language changes and force re-render
    useEffect(() => {
        const unsubscribe = onLangChange(() => {
            forceUpdate({})
        })
        return unsubscribe
    }, [])


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

    const handleCaptchaChange = (e) => {
        setCaptchaInput(e.target.value)
    }

    const handleFileChange = (e) => {
        const { name, files: fileList } = e.target
        setFiles(prev => ({
            ...prev,
            [name]: fileList[0] || null
        }))
    }

    const handleClearFile = (fieldName) => {
        setFiles(prev => ({
            ...prev,
            [fieldName]: null
        }))
        setFileInputKeys(prev => ({
            ...prev,
            [fieldName]: prev[fieldName] + 1
        }))
    }

    // Hàm lấy campaignRoundId từ batch hoặc tìm round Screening
    const getCampaignRoundId = () => {
        // Debug: Log để kiểm tra dữ liệu
        console.log('Campaign data:', campaign)
        console.log('Batch data:', batch)
        console.log('Campaign rounds:', campaign?.rounds)
        console.log('Campaign batches:', campaign?.batches)

        // Ưu tiên 1: Tìm round có type là "Screening" trong rounds gốc từ API (có thể có roundType)
        if (campaign?.rounds && Array.isArray(campaign.rounds)) {
            const screeningRound = campaign.rounds.find(
                r => {
                    const roundType = (r.roundType || r.type || '').toLowerCase()
                    return roundType === 'screening' || roundType === 'sàng lọc'
                }
            )
            if (screeningRound?.campaignRoundId || screeningRound?.id) {
                console.log('Found Screening round in rounds:', screeningRound)
                return screeningRound.campaignRoundId || screeningRound.id
            }
        }

        // Ưu tiên 2: Tìm round có type là "Screening" trong batches (đã map từ rounds)
        if (campaign?.batches && Array.isArray(campaign.batches)) {
            const screeningRound = campaign.batches.find(
                b => {
                    const roundType = (b.roundType || b.type || '').toLowerCase()
                    return roundType === 'screening' || roundType === 'sàng lọc'
                }
            )
            if (screeningRound?.campaignRoundId) {
                console.log('Found Screening round in batches:', screeningRound)
                return screeningRound.campaignRoundId
            }
        }

        // Ưu tiên 3: Tìm round có tên chứa "Screening" hoặc "Sàng lọc" trong rounds gốc
        if (campaign?.rounds && Array.isArray(campaign.rounds)) {
            const screeningRound = campaign.rounds.find(
                r => {
                    const roundName = (r.roundName || r.name || '').toLowerCase()
                    return roundName.includes('screening') || roundName.includes('sàng lọc')
                }
            )
            if (screeningRound?.campaignRoundId || screeningRound?.id) {
                return screeningRound.campaignRoundId || screeningRound.id
            }
        }

        // Ưu tiên 4: Tìm round có tên chứa "Screening" hoặc "Sàng lọc" trong batches
        if (campaign?.batches && Array.isArray(campaign.batches)) {
            const screeningRound = campaign.batches.find(
                b => {
                    const roundName = (b.roundName || b.name || '').toLowerCase()
                    return roundName.includes('screening') || roundName.includes('sàng lọc')
                }
            )
            if (screeningRound?.campaignRoundId) {
                return screeningRound.campaignRoundId
            }
        }

        // Ưu tiên 5: Lấy từ batch nếu có (batch được truyền từ Apply.jsx)
        if (batch?.campaignRoundId) {
            return batch.campaignRoundId
        }

        // Fallback: lấy từ batch hoặc campaign (nếu không tìm thấy Screening)
        const fallbackId = batch?.id ||
            campaign?.campaignRoundId ||
            campaign?.id
        console.log('Using fallback campaignRoundId:', fallbackId)
        return fallbackId
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (isSubmitting) return

        // Validate captcha
        if (captchaInput.toUpperCase() !== captchaCode) {
            toast.error(t('application_form_captcha_incorrect'))
            // Captcha sẽ tự động refresh trong component
            return
        }

        // Validate required fields
        if (!formData.email || !formData.fullName || !formData.dateOfBirth ||
            !formData.gender || !formData.mobileNumber ||
            !formData.height || !formData.weight ||
            formData.termsAccepted !== 'yes') {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }

        // Validate required files
        if (!files.applicationForm || !files.profilePhoto || !files.educationDegree ||
            !files.englishCertificate || !files.idCard || !files.idCardBack) {
            toast.error('Vui lòng upload đầy đủ các file bắt buộc')
            return
        }

        // Validate campaignRoundId
        const campaignRoundId = getCampaignRoundId()
        console.log('Final campaignRoundId for submit:', campaignRoundId)
        if (!campaignRoundId) {
            toast.error('Không tìm thấy thông tin vòng tuyển dụng. Vui lòng quay lại và thử lại.')
            return
        }

        setIsSubmitting(true)

        try {
            // Chuẩn bị dữ liệu để gửi API
            const applicationData = {
                // Thông tin cá nhân
                email: formData.email,
                fullName: formData.fullName,
                phoneNumber: formData.mobileNumber,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                // Thông tin hồ sơ
                height: formData.height,
                weight: formData.weight,
                campaignRoundId: campaignRoundId,
                applicationForm: files.applicationForm,
                profilePhoto: files.profilePhoto,
                educationDegree: files.educationDegree,
                englishCertificate: files.englishCertificate,
                passportOrID: files.idCard,
                passportOrIDBack: files.idCardBack
            }

            // Gọi API nộp đơn
            const result = await submitApplication(applicationData)

            if (result.success) {
                // Xóa bản nháp trong localStorage sau khi nộp thành công
                localStorage.removeItem('applicationFormDraft')

                toast.success(t('application_form_submitted_successfully') || result.message || 'Nộp đơn thành công!')
                // Đợi một chút để người dùng thấy toast trước khi navigate
                setTimeout(() => {
                    navigate('/recruitment-stages')
                }, 1500)
            } else {
                toast.error(result.error || 'Nộp đơn thất bại. Vui lòng thử lại.')
            }
        } catch (error) {
            console.error('Error submitting application:', error)
            toast.error('Có lỗi xảy ra khi nộp đơn. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSaveDraft = async () => {
        if (isSavingDraft) return

        setIsSavingDraft(true)

        try {
            // Lấy campaignRoundId
            const campaignRoundId = getCampaignRoundId()

            // Chuẩn bị dữ liệu để gửi API
            const draftData = {
                // Thông tin cá nhân
                email: formData.email || '',
                fullName: formData.fullName || '',
                phoneNumber: formData.mobileNumber || '',
                dateOfBirth: formData.dateOfBirth || '',
                gender: formData.gender || '',
                // Thông tin hồ sơ
                height: formData.height || '',
                weight: formData.weight || '',
                campaignRoundId: campaignRoundId || '',
                applicationForm: files.applicationForm || null,
                profilePhoto: files.profilePhoto || null,
                educationDegree: files.educationDegree || null,
                englishCertificate: files.englishCertificate || null,
                passportOrID: files.idCard || null,
                passportOrIDBack: files.idCardBack || null
            }

            // Gọi API lưu bản nháp
            const result = await saveApplicationDraft(draftData)

            if (result.success) {
                // Lưu vào localStorage để backup (không lưu files)
                const localDraftData = {
                    formData,
                    timestamp: new Date().toISOString(),
                    campaignId: campaign?.id
                }
                localStorage.setItem('applicationFormDraft', JSON.stringify(localDraftData))

                toast.success(t('application_form_draft_saved') || result.message || 'Đã lưu bản nháp thành công!')
                // Đợi một chút để người dùng thấy toast trước khi navigate
                setTimeout(() => {
                    navigate('/recruitment-stages')
                }, 1500)
            } else {
                toast.error(result.error || 'Lưu bản nháp thất bại. Vui lòng thử lại.')
            }
        } catch (error) {
            console.error('Error saving draft:', error)
            toast.error('Có lỗi xảy ra khi lưu bản nháp. Vui lòng thử lại.')
        } finally {
            setIsSavingDraft(false)
        }
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

                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('application_form_remember_upload')}</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
                                        <span>{t('application_form_application_form_file')} *</span>
                                        {files.applicationForm && (
                                            <DeleteFileButton
                                                onDelete={() => handleClearFile('applicationForm')}
                                            />
                                        )}
                                    </label>
                                    <div className="relative">
                                        <input
                                            key={fileInputKeys.applicationForm}
                                            type="file"
                                            name="applicationForm"
                                            onChange={handleFileChange}
                                            accept=".pdf"
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
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Vui lòng tải lên mẫu đơn ứng tuyển ở định dạng <span className="font-semibold">PDF (.pdf)</span>.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
                                        <span>{t('application_form_profile_photo')} *</span>
                                        {files.profilePhoto && (
                                            <DeleteFileButton
                                                onDelete={() => handleClearFile('profilePhoto')}
                                            />
                                        )}
                                    </label>
                                    <div className="relative">
                                        <input
                                            key={fileInputKeys.profilePhoto}
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
                                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
                                        <span>{t('application_form_education_degree')} *</span>
                                        {files.educationDegree && (
                                            <DeleteFileButton
                                                onDelete={() => handleClearFile('educationDegree')}
                                            />
                                        )}
                                    </label>
                                    <div className="relative">
                                        <input
                                            key={fileInputKeys.educationDegree}
                                            type="file"
                                            name="educationDegree"
                                            onChange={handleFileChange}
                                            accept=".pdf"
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
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Ưu tiên file scan/bản chụp được lưu dưới dạng <span className="font-semibold">PDF (.pdf)</span>.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            {t('application_form_english_certificate')} *
                                            <EyeIcon
                                                url="https://res.cloudinary.com/dxhaku7lp/image/upload/v1764240300/euxcie5gbzhzmzbg4o2x.jpg"
                                                title="Xem mẫu chứng chỉ tiếng Anh"
                                            />
                                        </span>
                                        {files.englishCertificate && (
                                            <DeleteFileButton
                                                onDelete={() => handleClearFile('englishCertificate')}
                                            />
                                        )}
                                    </label>
                                    <div className="relative">
                                        <input
                                            key={fileInputKeys.englishCertificate}
                                            type="file"
                                            name="englishCertificate"
                                            onChange={handleFileChange}
                                            accept=".jpg,.jpeg,image/jpeg"
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
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Vui lòng tải lên chứng chỉ tiếng Anh ở định dạng <span className="font-semibold">JPG (.jpg)</span>.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
                                            <span>{t('application_form_id_card')} - Mặt trước *</span>
                                            {files.idCard && (
                                                <DeleteFileButton
                                                    onDelete={() => handleClearFile('idCard')}
                                                />
                                            )}
                                        </label>
                                        <div className="relative">
                                            <input
                                                key={fileInputKeys.idCard}
                                                type="file"
                                                name="idCard"
                                                onChange={handleFileChange}
                                                accept=".jpg,.jpeg,image/jpeg"
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
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Vui lòng tải lên mặt trước hộ chiếu/CCCD còn hiệu lực dưới dạng <span className="font-semibold">JPG (.jpg)</span>.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
                                            <span>{t('application_form_id_card')} - Mặt sau *</span>
                                            {files.idCardBack && (
                                                <DeleteFileButton
                                                    onDelete={() => handleClearFile('idCardBack')}
                                                />
                                            )}
                                        </label>
                                        <div className="relative">
                                            <input
                                                key={fileInputKeys.idCardBack}
                                                type="file"
                                                name="idCardBack"
                                                onChange={handleFileChange}
                                                accept=".jpg,.jpeg,image/jpeg"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                required
                                            />
                                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                                                <div className="text-center">
                                                    <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                    </svg>
                                                    <p className="text-sm text-slate-600">
                                                        {files.idCardBack ? (
                                                            <span className="text-green-600 font-medium">✓ {files.idCardBack.name}</span>
                                                        ) : (
                                                            <span>{t('application_form_click_to_select')}</span>
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Vui lòng tải lên mặt sau hộ chiếu/CCCD còn hiệu lực dưới dạng <span className="font-semibold">JPG (.jpg)</span>.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Application Form */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Application form</h2>

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
                                <label className="block text-sm font-medium text-slate-700 mb-2">3. {t('application_form_date_of_birth')}</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    max="2003-12-31"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">4. {t('application_form_gender')}</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="1"
                                            checked={formData.gender === '1'}
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
                                            value="2"
                                            checked={formData.gender === '2'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                            required
                                        />
                                        {t('application_form_female')}
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">5. {t('application_form_mobile_number')}</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-2">6. {t('application_form_height_weight')}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">{t('application_form_height')}</label>
                                        <input
                                            type="number"
                                            name="height"
                                            value={formData.height}
                                            onChange={handleInputChange}
                                            placeholder=""
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
                                            placeholder=""
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{t('application_form_height_example')}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">7. {t('application_form_terms_conditions')}</label>
                                <p className="text-sm text-slate-600 mb-3">
                                    {t('application_form_acknowledge_data')} <a href="#" className="text-blue-600 underline"> {t('application_form_privacy_policy')} </a>
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

                            <CaptchaInput
                                value={captchaInput}
                                onChange={handleCaptchaChange}
                                onCodeChange={handleCaptchaCodeChange}
                            />

                            <div className="flex gap-4">
                                {/* <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    disabled={isSavingDraft}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md text-lg"
                                >
                                    {isSavingDraft ? 'Đang lưu...' : (t('application_form_save_draft') || 'Lưu bản nháp')}
                                </button> */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md text-lg"
                                >
                                    {isSubmitting ? 'Submitting...' : (t('application_form_finish') || 'Nộp đơn')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ApplicationForm