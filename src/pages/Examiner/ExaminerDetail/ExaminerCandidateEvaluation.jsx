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

    // Interview Scorecard header info
    const [headerInfo, setHeaderInfo] = useState({
        date: new Date().toISOString().split('T')[0],
        applicantName: '',
        department: '',
        position: candidate?.position || '',
        availabilityDate: ''
    })

    // Evaluation criteria state - 17 criteria with scores (1-10) and comments
    const [evaluations, setEvaluations] = useState({
        // A. ATTITUDE / CHARACTER (11 criteria)
        appearance: { score: 1, comment: '' },
        selfPresentation: { score: 1, comment: '' },
        knowledgeAboutVietjet: { score: 1, comment: '' },
        honestPoliteTrustworthy: { score: 1, comment: '' },
        careerGoalIntention: { score: 1, comment: '' },
        culturalAdaptation: { score: 1, comment: '' },
        enthusiasticAttitude: { score: 1, comment: '' },
        funFriendlyTeamwork: { score: 1, comment: '' },
        englishProficiency: { score: 1, comment: '' },
        answering: { score: 1, comment: '' },
        listening: { score: 1, comment: '' },
        // B. PROFESSIONAL / TECHNICAL KNOWLEDGE (6 criteria)
        relevantExperience: { score: 1, comment: '' },
        decisionMaking: { score: 1, comment: '' },
        problemSolving: { score: 1, comment: '' },
        customerServiceOriented: { score: 1, comment: '' },
        qualifications: { score: 1, comment: '' },
        technicalKnowledgeSkills: { score: 1, comment: '' }
    })

    const [result, setResult] = useState('') // PASS, FAIL, or RESERVED
    const [generalComments, setGeneralComments] = useState('')

    useEffect(() => {
        const off = onLangChange(() => setLangVersion(v => v + 1))
        return () => off()
    }, [])

    useEffect(() => {
        if (candidate) {
            setHeaderInfo(prev => ({
                ...prev,
                applicantName: candidate.name || '',
                position: candidate.position || prev.position
            }))
        }
    }, [candidate])

    // Calculate total score
    const totalScore = Object.values(evaluations).reduce((sum, criterion) => {
        return sum + (criterion.score || 0)
    }, 0)

    const handleScoreChange = (criterionKey, score) => {
        setEvaluations(prev => ({
            ...prev,
            [criterionKey]: {
                ...prev[criterionKey],
                score: parseInt(score) || 0
            }
        }))
    }

    const handleCommentChange = (criterionKey, comment) => {
        setEvaluations(prev => ({
            ...prev,
            [criterionKey]: {
                ...prev[criterionKey],
                comment: comment
            }
        }))
    }

    const handleHeaderInfoChange = (key, value) => {
        setHeaderInfo(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleSave = () => {
        // Save evaluation logic here
        const evaluationData = {
            headerInfo,
            evaluations,
            totalScore,
            result,
            generalComments,
            candidateId: id || candidate?.id
        }
        console.log('Evaluation Data:', evaluationData)
        alert('Đã lưu đánh giá thành công!')
    }

    const handleSubmit = () => {
        // Submit evaluation logic here
        const evaluationData = {
            headerInfo,
            evaluations,
            totalScore,
            result,
            generalComments,
            candidateId: id || candidate?.id
        }
        console.log('Submitting evaluation...', evaluationData)
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
                            <div className="w-24 h-32 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
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
                                <p className="text-xs text-slate-500 mt-1">Ảnh 4x6</p>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Email:</span>
                            <p className="font-medium text-slate-800">{candidate.email || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Số điện thoại:</span>
                            <p className="font-medium text-slate-800">{candidate.phone || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Ngày ứng tuyển:</span>
                            <p className="font-medium text-slate-800">{candidate.appliedDate || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Học vấn:</span>
                            <p className="font-medium text-slate-800">{candidate.education || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Kinh nghiệm:</span>
                            <p className="font-medium text-slate-800">{candidate.experience || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Ngôn ngữ:</span>
                            <p className="font-medium text-slate-800">
                                {candidate.languages && Array.isArray(candidate.languages)
                                    ? candidate.languages.join(', ')
                                    : candidate.languages || 'Tiếng Việt'}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-slate-600 block mb-1">Đợt tuyển:</span>
                            <p className="font-medium text-slate-800">{candidate.batchName || batchData?.batchName || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Interview Scorecard Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">INTERVIEW SCORECARD</h2>
                    {/* Assessment Values Legend */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">Assessment Values / Scoring Legend:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div><span className="font-medium">Excellent:</span> 9-10 points</div>
                            <div><span className="font-medium">Good:</span> 7-8 points</div>
                            <div><span className="font-medium">Fair:</span> 5-6 points</div>
                            <div><span className="font-medium">Unsatisfactory:</span> 1-4 points</div>
                        </div>
                    </div>
                </div>

                {/* A. ATTITUDE / CHARACTER */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">A. ATTITUDE / CHARACTER</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-300">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Criteria</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Assessment Score</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Comments / Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* 1. APPEARANCE */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">1. APPEARANCE</div>
                                        <div className="text-xs text-slate-500 mt-1">(Neatly groomed? Appropriately dressed?)</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.appearance.score}
                                            onChange={(e) => handleScoreChange('appearance', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.appearance.comment}
                                            onChange={(e) => handleCommentChange('appearance', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 2. SELF PRESENTATION */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">2. SELF PRESENTATION</div>
                                        <div className="text-xs text-slate-500 mt-1">(Sits properly? Confident?)</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.selfPresentation.score}
                                            onChange={(e) => handleScoreChange('selfPresentation', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.selfPresentation.comment}
                                            onChange={(e) => handleCommentChange('selfPresentation', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 3. KNOWLEDGE ABOUT VIETJET AIR */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">3. KNOWLEDGE ABOUT VIETJET AIR</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.knowledgeAboutVietjet.score}
                                            onChange={(e) => handleScoreChange('knowledgeAboutVietjet', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.knowledgeAboutVietjet.comment}
                                            onChange={(e) => handleCommentChange('knowledgeAboutVietjet', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 4. HONEST, POLITE, & TRUSTWORTHY */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">4. HONEST, POLITE, & TRUSTWORTHY</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.honestPoliteTrustworthy.score}
                                            onChange={(e) => handleScoreChange('honestPoliteTrustworthy', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.honestPoliteTrustworthy.comment}
                                            onChange={(e) => handleCommentChange('honestPoliteTrustworthy', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 5. CAREER GOAL & INTENTION */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">5. CAREER GOAL & INTENTION</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.careerGoalIntention.score}
                                            onChange={(e) => handleScoreChange('careerGoalIntention', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.careerGoalIntention.comment}
                                            onChange={(e) => handleCommentChange('careerGoalIntention', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 6. CULTURAL ADAPTATION */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">6. CULTURAL ADAPTATION</div>
                                        <div className="text-xs text-slate-500 mt-1">(In Vietjet Air / In Vietnam)</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.culturalAdaptation.score}
                                            onChange={(e) => handleScoreChange('culturalAdaptation', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.culturalAdaptation.comment}
                                            onChange={(e) => handleCommentChange('culturalAdaptation', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 7. ENTHUSIASTIC ATTITUDE ABOUT WORK */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">7. ENTHUSIASTIC ATTITUDE ABOUT WORK</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.enthusiasticAttitude.score}
                                            onChange={(e) => handleScoreChange('enthusiasticAttitude', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.enthusiasticAttitude.comment}
                                            onChange={(e) => handleCommentChange('enthusiasticAttitude', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 8. FUN, FRIENDLY, TEAMWORK SPIRIT */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">8. FUN, FRIENDLY, TEAMWORK SPIRIT</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.funFriendlyTeamwork.score}
                                            onChange={(e) => handleScoreChange('funFriendlyTeamwork', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.funFriendlyTeamwork.comment}
                                            onChange={(e) => handleCommentChange('funFriendlyTeamwork', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 9. ENGLISH PROFICIENCY */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">9. ENGLISH PROFICIENCY</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.englishProficiency.score}
                                            onChange={(e) => handleScoreChange('englishProficiency', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.englishProficiency.comment}
                                            onChange={(e) => handleCommentChange('englishProficiency', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 10. ANSWERING */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">10. ANSWERING</div>
                                        <div className="text-xs text-slate-500 mt-1">(Relevant? Communicates ideas clearly?)</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.answering.score}
                                            onChange={(e) => handleScoreChange('answering', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.answering.comment}
                                            onChange={(e) => handleCommentChange('answering', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 11. LISTENING */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">11. LISTENING</div>
                                        <div className="text-xs text-slate-500 mt-1">(Attentive? Asks questions to clarify?)</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.listening.score}
                                            onChange={(e) => handleScoreChange('listening', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.listening.comment}
                                            onChange={(e) => handleCommentChange('listening', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* B. PROFESSIONAL / TECHNICAL KNOWLEDGE */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">B. PROFESSIONAL / TECHNICAL KNOWLEDGE</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-300">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Criteria</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Assessment Score</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Comments / Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* 12. RELEVANT EXPERIENCE */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">12. RELEVANT EXPERIENCE</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.relevantExperience.score}
                                            onChange={(e) => handleScoreChange('relevantExperience', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.relevantExperience.comment}
                                            onChange={(e) => handleCommentChange('relevantExperience', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 13. DECISION MAKING */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">13. DECISION MAKING</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.decisionMaking.score}
                                            onChange={(e) => handleScoreChange('decisionMaking', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.decisionMaking.comment}
                                            onChange={(e) => handleCommentChange('decisionMaking', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 14. PROBLEM SOLVING */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">14. PROBLEM SOLVING</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.problemSolving.score}
                                            onChange={(e) => handleScoreChange('problemSolving', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.problemSolving.comment}
                                            onChange={(e) => handleCommentChange('problemSolving', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 15. CUSTOMER SERVICES ORIENTED */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">15. CUSTOMER SERVICES ORIENTED</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.customerServiceOriented.score}
                                            onChange={(e) => handleScoreChange('customerServiceOriented', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.customerServiceOriented.comment}
                                            onChange={(e) => handleCommentChange('customerServiceOriented', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 16. QUALIFICATIONS */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">16. QUALIFICATIONS</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.qualifications.score}
                                            onChange={(e) => handleScoreChange('qualifications', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.qualifications.comment}
                                            onChange={(e) => handleCommentChange('qualifications', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>

                                {/* 17. TECHNICAL KNOWLEDGE & SKILLS */}
                                <tr className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-slate-800">17. TECHNICAL KNOWLEDGE & SKILLS</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <select
                                            value={evaluations.technicalKnowledgeSkills.score}
                                            onChange={(e) => handleScoreChange('technicalKnowledgeSkills', e.target.value)}
                                            className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={evaluations.technicalKnowledgeSkills.comment}
                                            onChange={(e) => handleCommentChange('technicalKnowledgeSkills', e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Ghi chú..."
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Total Score and Result */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-lg font-semibold text-slate-800">
                            TOTAL SCORE
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                            Total score (max 170) = {totalScore}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Comments/Remarks</label>
                        <textarea
                            placeholder="Ghi chú tổng quan về ứng viên..."
                            value={generalComments}
                            onChange={(e) => setGeneralComments(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="5"
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

