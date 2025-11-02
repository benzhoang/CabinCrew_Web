import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { onLangChange } from '../../../i18n'

const ExaminerCandidateEvaluation = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { id } = useParams()
    const [langVersion, setLangVersion] = useState(0)

    // Get candidate and batch data from location state
    const candidate = location.state?.candidate || location.state
    const batchData = location.state?.batchData

    // Evaluation criteria state
    const [evaluations, setEvaluations] = useState({
        // Criteria Set 1: Basic Interview Criteria
        communication: {
            paTest: false,
            englishProficiency: false,
            vietnameseProficiency: false,
            noLisp: false,
            noStuttering: false,
            noStrongAccent: false
        },
        interviewContent: {
            personalInfo: false,
            relevantExperience: false,
            workUnderPressure: false,
            jobSuitability: false
        },
        professionalDemeanor: {
            serviceManner: false,
            eyeContact: false,
            smile: false,
            friendlyVoice: false,
            warmVoice: false,
            comfortableVoice: false
        },
        // Criteria Set 2: Advanced Evaluation Criteria
        knowledgeOfAviation: false,
        candidatePreparation: false,
        problemSolvingService: false,
        problemSolvingSkills: false,
        communicationCustomerCare: false,
        teamworkSkills: false
    })

    const [notes, setNotes] = useState({
        communication: '',
        interviewContent: '',
        professionalDemeanor: '',
        general: ''
    })

    useEffect(() => {
        const off = onLangChange(() => setLangVersion(v => v + 1))
        return () => off()
    }, [])

    const handleCriteriaChange = (category, key, value) => {
        setEvaluations(prev => {
            if (typeof prev[category] === 'object' && prev[category] !== null && !Array.isArray(prev[category])) {
                return {
                    ...prev,
                    [category]: {
                        ...prev[category],
                        [key]: value
                    }
                }
            } else {
                return {
                    ...prev,
                    [category]: value
                }
            }
        })
    }

    const handleNoteChange = (category, value) => {
        setNotes(prev => ({
            ...prev,
            [category]: value
        }))
    }

    const handleSave = () => {
        // Save evaluation logic here
        console.log('Evaluations:', evaluations)
        console.log('Notes:', notes)
        alert('Đã lưu đánh giá thành công!')
    }

    const handleSubmit = () => {
        // Submit evaluation logic here
        console.log('Submitting evaluation...')
        alert('Đã gửi đánh giá thành công!')
        navigate('/examiner/applications', { state: batchData })
    }

    if (!candidate) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <p className="text-slate-500">Không tìm thấy thông tin ứng viên</p>
                    <button
                        onClick={() => navigate('/examiner/applications')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/examiner/applications', { state: batchData })}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold">Đánh giá Ứng viên</h1>
                            <p className="text-white/90 mt-1 text-sm">Đánh giá tiêu chí phỏng vấn cho ứng viên</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Candidate Information */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Thông tin Ứng viên</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-32 bg-slate-100 rounded-md overflow-hidden">
                                <img
                                    src={candidate.photo || 'https://via.placeholder.com/96x128/cccccc/666666?text=No+Photo'}
                                    alt={candidate.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/96x128/cccccc/666666?text=No+Photo'
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">{candidate.name}</h3>
                                <p className="text-sm text-slate-600">{candidate.position || 'Flight Attendant'}</p>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Email:</span>
                            <p className="font-medium text-slate-800">{candidate.email}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Số điện thoại:</span>
                            <p className="font-medium text-slate-800">{candidate.phone}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Ngày ứng tuyển:</span>
                            <p className="font-medium text-slate-800">{candidate.appliedDate}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Học vấn:</span>
                            <p className="font-medium text-slate-800">{candidate.education}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Kinh nghiệm:</span>
                            <p className="font-medium text-slate-800">{candidate.experience}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Ngôn ngữ:</span>
                            <p className="font-medium text-slate-800">
                                {candidate.languages && Array.isArray(candidate.languages)
                                    ? candidate.languages.join(', ')
                                    : 'Tiếng Việt'}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Đợt tuyển:</span>
                            <p className="font-medium text-slate-800">{candidate.batchName || batchData?.batchName || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Evaluation Criteria Section 1 */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Tiêu chí Đánh giá Phỏng vấn</h2>

                    {/* Communication and Pronunciation */}
                    <div className="mb-6 pb-6 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-700 mb-3">
                            1. Giao tiếp và Phát âm / Communication and Pronunciation
                        </h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.communication.paTest}
                                    onChange={(e) => handleCriteriaChange('communication', 'paTest', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Yêu cầu kiểm tra PA (Public Address)</span>
                                <span className="text-slate-500 text-sm">(Candidates will be required for a PA test)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.communication.englishProficiency}
                                    onChange={(e) => handleCriteriaChange('communication', 'englishProficiency', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Trình độ tiếng Anh</span>
                                <span className="text-slate-500 text-sm">(English proficiency will be evaluated)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.communication.vietnameseProficiency}
                                    onChange={(e) => handleCriteriaChange('communication', 'vietnameseProficiency', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Trình độ tiếng Việt</span>
                                <span className="text-slate-500 text-sm">(Vietnamese proficiency will be evaluated)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.communication.noLisp}
                                    onChange={(e) => handleCriteriaChange('communication', 'noLisp', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Không có lỗi phát âm</span>
                                <span className="text-slate-500 text-sm">(No lisp)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.communication.noStuttering}
                                    onChange={(e) => handleCriteriaChange('communication', 'noStuttering', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Không nói lắp</span>
                                <span className="text-slate-500 text-sm">(No stuttering)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.communication.noStrongAccent}
                                    onChange={(e) => handleCriteriaChange('communication', 'noStrongAccent', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Không có giọng địa phương quá nặng</span>
                                <span className="text-slate-500 text-sm">(No overly strong regional accent)</span>
                            </label>
                        </div>
                        <textarea
                            placeholder="Ghi chú về giao tiếp và phát âm..."
                            value={notes.communication}
                            onChange={(e) => handleNoteChange('communication', e.target.value)}
                            className="w-full mt-3 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                        />
                    </div>

                    {/* Interview Content and Work Suitability */}
                    <div className="mb-6 pb-6 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-700 mb-3">
                            2. Nội dung Phỏng vấn và Phù hợp Công việc / Interview Content and Work Suitability
                        </h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.interviewContent.personalInfo}
                                    onChange={(e) => handleCriteriaChange('interviewContent', 'personalInfo', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Thông tin cá nhân và kinh nghiệm liên quan</span>
                                <span className="text-slate-500 text-sm">(Questions about personal information and relevant experience)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.interviewContent.workUnderPressure}
                                    onChange={(e) => handleCriteriaChange('interviewContent', 'workUnderPressure', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Khả năng làm việc dưới áp lực</span>
                                <span className="text-slate-500 text-sm">(Ability to work under pressure)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.interviewContent.jobSuitability}
                                    onChange={(e) => handleCriteriaChange('interviewContent', 'jobSuitability', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Phù hợp với yêu cầu công việc</span>
                                <span className="text-slate-500 text-sm">(Suitability for job requirements)</span>
                            </label>
                        </div>
                        <textarea
                            placeholder="Ghi chú về nội dung phỏng vấn..."
                            value={notes.interviewContent}
                            onChange={(e) => handleNoteChange('interviewContent', e.target.value)}
                            className="w-full mt-3 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                        />
                    </div>

                    {/* Professional Demeanor for Service */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-700 mb-3">
                            3. Tác phong Chuyên nghiệp cho Dịch vụ / Professional Demeanor for Service
                        </h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.professionalDemeanor.serviceManner}
                                    onChange={(e) => handleCriteriaChange('professionalDemeanor', 'serviceManner', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Tác phong phù hợp với nghề dịch vụ</span>
                                <span className="text-slate-500 text-sm">(Manner suitable for service profession)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.professionalDemeanor.eyeContact}
                                    onChange={(e) => handleCriteriaChange('professionalDemeanor', 'eyeContact', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Giao tiếp bằng mắt</span>
                                <span className="text-slate-500 text-sm">(Eye contact)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.professionalDemeanor.smile}
                                    onChange={(e) => handleCriteriaChange('professionalDemeanor', 'smile', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Có nụ cười</span>
                                <span className="text-slate-500 text-sm">(Having a smile)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.professionalDemeanor.friendlyVoice}
                                    onChange={(e) => handleCriteriaChange('professionalDemeanor', 'friendlyVoice', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Giọng nói thân thiện</span>
                                <span className="text-slate-500 text-sm">(Friendly voice)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.professionalDemeanor.warmVoice}
                                    onChange={(e) => handleCriteriaChange('professionalDemeanor', 'warmVoice', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Giọng nói ấm áp</span>
                                <span className="text-slate-500 text-sm">(Warm voice)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={evaluations.professionalDemeanor.comfortableVoice}
                                    onChange={(e) => handleCriteriaChange('professionalDemeanor', 'comfortableVoice', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-700">Giọng nói dễ chịu cho khách hàng</span>
                                <span className="text-slate-500 text-sm">(Voice comfortable for customer)</span>
                            </label>
                        </div>
                        <textarea
                            placeholder="Ghi chú về tác phong chuyên nghiệp..."
                            value={notes.professionalDemeanor}
                            onChange={(e) => handleNoteChange('professionalDemeanor', e.target.value)}
                            className="w-full mt-3 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                        />
                    </div>
                </div>

                {/* Evaluation Criteria Section 2 */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Tiêu chí Đánh giá Nâng cao</h2>

                    <div className="space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <input
                                type="checkbox"
                                checked={evaluations.knowledgeOfAviation}
                                onChange={(e) => handleCriteriaChange('knowledgeOfAviation', null, e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                            />
                            <div className="flex-1">
                                <span className="font-medium text-slate-700">Kiến thức về Hàng không, Vietjet và Nghề Tiếp viên</span>
                                <p className="text-sm text-slate-500 mt-1">
                                    Đặt các câu hỏi về sự am hiểu đối với ngành hàng không, Vietjet và nghề tiếp viên hàng không /
                                    Having interview question about knowledge of aviation, Vietjet and cabin crew job
                                </p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <input
                                type="checkbox"
                                checked={evaluations.candidatePreparation}
                                onChange={(e) => handleCriteriaChange('candidatePreparation', null, e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                            />
                            <div className="flex-1">
                                <span className="font-medium text-slate-700">Sự Chuẩn bị của Ứng viên</span>
                                <p className="text-sm text-slate-500 mt-1">
                                    Đảm bảo ứng viên có sự chuẩn bị tốt trước khi gia nhập vào đội ngũ tiếp viên của Vietjet /
                                    Ensure candidates had well prepared before joining cabin crew team of Vietjet
                                </p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <input
                                type="checkbox"
                                checked={evaluations.problemSolvingService}
                                onChange={(e) => handleCriteriaChange('problemSolvingService', null, e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                            />
                            <div className="flex-1">
                                <span className="font-medium text-slate-700">Giải quyết Vấn đề trong Dịch vụ</span>
                                <p className="text-sm text-slate-500 mt-1">
                                    Đặt các câu hỏi về tình huống trong dịch vụ / Having interview question on solving problem in service
                                </p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <input
                                type="checkbox"
                                checked={evaluations.problemSolvingSkills}
                                onChange={(e) => handleCriteriaChange('problemSolvingSkills', null, e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                            />
                            <div className="flex-1">
                                <span className="font-medium text-slate-700">Kỹ năng Giải quyết Vấn đề (Phản ứng nhanh nhẹn)</span>
                                <p className="text-sm text-slate-500 mt-1">
                                    Đánh giá sự phản ứng nhanh nhẹn và ứng phó tốt đối với các tình huống xảy ra trong công việc /
                                    Evaluate candidates problem solving skills (responsiveness)
                                </p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <input
                                type="checkbox"
                                checked={evaluations.communicationCustomerCare}
                                onChange={(e) => handleCriteriaChange('communicationCustomerCare', null, e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                            />
                            <div className="flex-1">
                                <span className="font-medium text-slate-700">Kỹ năng Giao tiếp và Chăm sóc Khách hàng</span>
                                <p className="text-sm text-slate-500 mt-1">
                                    Kỹ năng giao tiếp và chăm sóc khách hàng / Communication and customer care skills
                                </p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <input
                                type="checkbox"
                                checked={evaluations.teamworkSkills}
                                onChange={(e) => handleCriteriaChange('teamworkSkills', null, e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                            />
                            <div className="flex-1">
                                <span className="font-medium text-slate-700">Kỹ năng Làm việc Nhóm</span>
                                <p className="text-sm text-slate-500 mt-1">
                                    Kỹ năng làm việc nhóm / Teamwork skills
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú Tổng quan</label>
                        <textarea
                            placeholder="Ghi chú tổng quan về ứng viên..."
                            value={notes.general}
                            onChange={(e) => handleNoteChange('general', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="4"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => navigate('/examiner/applications', { state: batchData })}
                        className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                    >
                        Lưu nháp
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Gửi đánh giá
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ExaminerCandidateEvaluation

