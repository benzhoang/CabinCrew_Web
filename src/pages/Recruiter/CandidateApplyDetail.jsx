import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { onLangChange } from '../../i18n'

const CandidateApplyDetail = () => {
    const [candidate, setCandidate] = useState(null)
    const [loading, setLoading] = useState(true)
    const [, setLangVersion] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const off = onLangChange(() => setLangVersion(v => v + 1))
        return () => off()
    }, [])

    useEffect(() => {
        // Lấy dữ liệu từ location.state (được truyền từ Screening.jsx)
        const candidateData = location.state?.candidate

        if (candidateData) {
            // Sử dụng dữ liệu từ Screening.jsx
            const candidateFromScreening = {
                id: candidateData.id,
                email: candidateData.email,
                fullName: candidateData.name,
                nationality: 'vietnamese',
                dateOfBirth: '1995-03-15',
                gender: 'female',
                mobileNumber: candidateData.phone,
                workingExperience: candidateData.experience || '1-2-years',
                height: '165',
                weight: '53',
                englishCertificate: 'TOEIC 650',
                certificateExpireDate: '2025-12-31',
                basePreference: 'flexible',
                termsAccepted: 'yes',
                status: candidateData.status,
                appliedDate: candidateData.appliedDate,
                currentRound: candidateData.round || 'screening',
                documents: {
                    applicationForm: 'VJC-PD-FRM-12_Application_Form.pdf',
                    profilePhoto: 'Profile_Photo_4x6.jpg',
                    educationDegree: 'Bachelor_Degree_Certificate.pdf',
                    englishCertificate: 'TOEIC_Certificate_650.pdf',
                    idCard: 'ID_Card_Front_Back.pdf'
                }
            }
            setCandidate(candidateFromScreening)
        } else {
            // Fallback mock data nếu không có dữ liệu từ Screening
            const mockCandidate = {
                id: 'CAND001',
                email: 'lan.nguyen@email.com',
                fullName: 'Nguyễn Thị Lan',
                nationality: 'vietnamese',
                dateOfBirth: '1995-03-15',
                gender: 'female',
                mobileNumber: '+84 912 345 678',
                workingExperience: '1-2-years',
                height: '165',
                weight: '53',
                englishCertificate: 'TOEIC 650',
                certificateExpireDate: '2025-12-31',
                basePreference: 'flexible',
                termsAccepted: 'yes',
                status: 'pending',
                appliedDate: '2024-10-15',
                currentRound: 'screening',
                documents: {
                    applicationForm: 'VJC-PD-FRM-12_Application_Form.pdf',
                    profilePhoto: 'Profile_Photo_4x6.jpg',
                    educationDegree: 'Bachelor_Degree_Certificate.pdf',
                    englishCertificate: 'TOEIC_Certificate_650.pdf',
                    idCard: 'ID_Card_Front_Back.pdf'
                }
            }
            setCandidate(mockCandidate)
        }
        setLoading(false)
    }, [location.state])

    const goBack = () => {
        // Quay về danh sách ứng viên với thông tin batch
        const batchData = location.state?.batchData
        if (batchData) {
            navigate('/recruiter/applications', { state: batchData })
        } else {
            navigate('/recruiter/applications')
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý' },
            approved: { color: 'bg-green-100 text-green-800', text: 'Đã duyệt' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Từ chối' },
            interview: { color: 'bg-blue-100 text-blue-800', text: 'Phỏng vấn' }
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const getNationalityText = (nationality) => {
        const nationalityMap = {
            'vietnamese': 'Vietnamese',
            'american': 'American',
            'british': 'British',
            'french': 'French',
            'german': 'German',
            'japanese': 'Japanese',
            'korean': 'Korean',
            'chinese': 'Chinese',
            'thai': 'Thai',
            'singaporean': 'Singaporean',
            'other': 'Other'
        }
        return nationalityMap[nationality] || nationality
    }

    const getWorkingExperienceText = (experience) => {
        const experienceMap = {
            'no-experience': 'No experience',
            'less-than-1-year': 'Less than 1 year',
            '1-2-years': '1-2 years',
            '3-5-years': '3-5 years'
        }
        return experienceMap[experience] || experience
    }

    const getBasePreferenceText = (preference) => {
        const preferenceMap = {
            'flexible': 'Flexible base',
            'cam-ranh': 'Cam Ranh City (CXR)',
            'da-nang': 'Da Nang City (DAD)'
        }
        return preferenceMap[preference] || preference
    }

    const getRoundText = (round) => {
        const roundMap = {
            'screening': 'Vòng sàng lọc',
            'grooming': 'Vòng grooming',
            'test': 'Vòng kiểm tra',
            'interview': 'Vòng phỏng vấn'
        }
        return roundMap[round] || 'Vòng sàng lọc'
    }

    const handleViewDocument = (documentName) => {
        if (!documentName) return

        // Tạo URL cho file PDF (giả sử file được lưu trong thư mục public/documents)
        const pdfUrl = `/documents/${documentName}`

        // Mở file PDF trong tab mới
        window.open(pdfUrl, '_blank')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!candidate) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Không tìm thấy thông tin ứng viên</h2>
                    <button
                        onClick={goBack}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={goBack}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Hồ sơ ứng viên - {candidate ? getRoundText(candidate.currentRound) : 'Vòng sàng lọc'}
                            </h1>
                            <p className="text-slate-600">Thông tin chi tiết về ứng viên</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Progress Bar */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Tiến trình ứng tuyển</h3>
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200">
                            <div className="h-full bg-blue-500" style={{ width: '60%' }}></div>
                        </div>

                        {/* Progress Steps */}
                        <div className="relative flex justify-between">
                            {/* Step 1 - Completed */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2 relative z-10">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-slate-800">Kiểm tra hồ sơ</span>
                                <span className="text-xs text-slate-500 mt-1">7/10/2022</span>
                            </div>

                            {/* Step 2 - Completed */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2 relative z-10">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-slate-800">Kiểm tra ngoại hình</span>
                                <span className="text-xs text-slate-500 mt-1">10/10/2022</span>
                            </div>

                            {/* Step 3 - Completed */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2 relative z-10">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-slate-800">Kiểm tra tiếng Anh</span>
                                <span className="text-xs text-slate-500 mt-1">15/10/2022</span>
                            </div>

                            {/* Step 4 - Pending */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center mb-2 relative z-10">
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-slate-600">Phỏng vấn</span>
                                <span className="text-xs text-slate-400 mt-1">Chưa lên lịch</span>
                            </div>

                            {/* Step 5 - Pending */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center mb-2 relative z-10">
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-slate-600">Kết quả cuối cùng</span>
                                <span className="text-xs text-slate-400 mt-1">Chưa có</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - CV and Documents */}
                    <div className="space-y-6">
                        {/* CV Section */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">CANDIDATE PROFILE</h3>

                            {/* Profile Photo */}
                            <div className="text-center mb-6">
                                <div className="w-32 h-40 mx-auto bg-slate-100 rounded-lg overflow-hidden mb-4 border-2 border-slate-300 shadow-sm">
                                    <img
                                        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                                        alt="Profile Photo 4x6"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/128x160/cccccc/666666?text=Profile+Photo'
                                        }}
                                    />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800">{candidate.fullName}</h4>
                                <p className="text-slate-600">Cabin Crew Candidate</p>
                                <div className="mt-2">
                                    {getStatusBadge(candidate.status)}
                                </div>
                            </div>

                            {/* Quick Info - Horizontal Layout */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-slate-600 text-xs mb-1">Email</div>
                                    <div className="font-medium text-slate-800 text-sm">{candidate.email}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-slate-600 text-xs mb-1">Phone</div>
                                    <div className="font-medium text-slate-800 text-sm">{candidate.mobileNumber}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-slate-600 text-xs mb-1">Nationality</div>
                                    <div className="font-medium text-slate-800 text-sm">{getNationalityText(candidate.nationality)}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-slate-600 text-xs mb-1">Experience</div>
                                    <div className="font-medium text-slate-800 text-sm">{getWorkingExperienceText(candidate.workingExperience)}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-slate-600 text-xs mb-1">Height/Weight</div>
                                    <div className="font-medium text-slate-800 text-sm">{candidate.height}cm / {candidate.weight}kg</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-slate-600 text-xs mb-1">Applied Date</div>
                                    <div className="font-medium text-slate-800 text-sm">{formatDate(candidate.appliedDate)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Uploaded Documents */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">UPLOADED DOCUMENTS</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        VJC-PD-FRM-12 Form Job Application
                                    </label>
                                    <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                                        {candidate.documents?.applicationForm ? (
                                            <div className="flex items-center gap-3">
                                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-green-600 font-medium">{candidate.documents.applicationForm}</span>
                                                <button
                                                    onClick={() => handleViewDocument(candidate.documents.applicationForm)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500">No file uploaded</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Profile Photo 4x6cm
                                    </label>
                                    <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                                        {candidate.documents?.profilePhoto ? (
                                            <div className="flex items-center gap-3">
                                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-green-600 font-medium">{candidate.documents.profilePhoto}</span>
                                                <button
                                                    onClick={() => handleViewDocument(candidate.documents.profilePhoto)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500">No file uploaded</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Education Degree
                                    </label>
                                    <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                                        {candidate.documents?.educationDegree ? (
                                            <div className="flex items-center gap-3">
                                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-green-600 font-medium">{candidate.documents.educationDegree}</span>
                                                <button
                                                    onClick={() => handleViewDocument(candidate.documents.educationDegree)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500">No file uploaded</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        English Certificate
                                    </label>
                                    <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                                        {candidate.documents?.englishCertificate ? (
                                            <div className="flex items-center gap-3">
                                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-green-600 font-medium">{candidate.documents.englishCertificate}</span>
                                                <button
                                                    onClick={() => handleViewDocument(candidate.documents.englishCertificate)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500">No file uploaded</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ID Card / Passport
                                    </label>
                                    <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                                        {candidate.documents?.idCard ? (
                                            <div className="flex items-center gap-3">
                                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-green-600 font-medium">{candidate.documents.idCard}</span>
                                                <button
                                                    onClick={() => handleViewDocument(candidate.documents.idCard)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500">No file uploaded</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Application Form Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">APPLICATION FORM DETAILS</h2>

                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">1. Email address:</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{candidate.email || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">2. Full name:</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{candidate.fullName || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">3. Nationality:</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{getNationalityText(candidate.nationality) || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">4. Date of Birth:</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{formatDate(candidate.dateOfBirth) || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">5. Gender:</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{candidate.gender === 'male' ? 'Male' : candidate.gender === 'female' ? 'Female' : 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">6. Mobile number:</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{candidate.mobileNumber || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">7. Working experience:</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{getWorkingExperienceText(candidate.workingExperience) || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">8. Height & Weight:</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">Height (cm)</label>
                                                <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{candidate.height || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">Weight (kg)</label>
                                                <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{candidate.weight || 'N/A'}</p>
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
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{candidate.englishCertificate || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Expire Date:</label>
                                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{formatDate(candidate.certificateExpireDate) || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Base Preference */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Base Preference</h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Base Preference:</label>
                                    <p className="text-slate-800 bg-slate-50 p-3 rounded-md">{getBasePreferenceText(candidate.basePreference) || 'N/A'}</p>
                                </div>
                            </div>
                            {/* Recruiter Actions */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Recruiter Actions</h3>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        onClick={() => {
                                            console.log('Approve candidate:', candidate.id)
                                        }}
                                    >
                                        Approve Application
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                        onClick={() => {
                                            console.log('Reject candidate:', candidate.id)
                                        }}
                                    >
                                        Reject Application
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        onClick={() => {
                                            console.log('Schedule interview:', candidate.id)
                                        }}
                                    >
                                        Schedule Interview
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                        onClick={() => {
                                            console.log('Send email:', candidate.id)
                                        }}
                                    >
                                        Send Email
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CandidateApplyDetail
