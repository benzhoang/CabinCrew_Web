import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { t, onLangChange } from '../../../i18n';
import { toast } from 'react-toastify';
import AppealModal from '../../../components/AppealModal';
import { getMyListeningSessions } from '../../../service/api';

const ListeningExamResult = () => {
    const { id: campaignId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [langVersion, setLangVersion] = useState(0);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [isAppealSubmitted, setIsAppealSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionData, setSessionData] = useState(null);

    // Lấy dữ liệu từ location state (fallback)
    const { score: stateScore, totalQuestions: stateTotalQuestions, correctAnswers: stateCorrectAnswers, wrongAnswers: stateWrongAnswers, unansweredQuestions: stateUnansweredQuestions, answers, questions, timeSpent, submittedAnswers, testSessionId } = location.state || {};

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1));
        return () => off();
    }, []);

    // Gọi API để lấy dữ liệu listening sessions
    useEffect(() => {
        const fetchListeningSessions = async () => {
            try {
                setLoading(true);
                const response = await getMyListeningSessions();

                if (response.success && response.data && response.data.length > 0) {
                    // Tìm session tương ứng với testSessionId nếu có, nếu không thì lấy session mới nhất
                    let selectedSession = null;
                    if (testSessionId) {
                        selectedSession = response.data.find(session => session.testSessionId === testSessionId);
                    }

                    // Nếu không tìm thấy session theo testSessionId, lấy session mới nhất
                    if (!selectedSession) {
                        selectedSession = response.data[0]; // Lấy session đầu tiên (mới nhất)
                    }

                    setSessionData(selectedSession);
                } else {
                    // Nếu không có dữ liệu từ API, sử dụng dữ liệu từ location.state
                    if (!stateScore && !stateTotalQuestions) {
                        toast.error(response.error || 'Không thể tải dữ liệu kết quả bài thi');
                        navigate('/test');
                    }
                }
            } catch (error) {
                console.error('Error fetching listening sessions:', error);
                // Nếu lỗi, vẫn có thể sử dụng dữ liệu từ location.state
                if (!stateScore && !stateTotalQuestions) {
                    toast.error('Không thể tải dữ liệu kết quả bài thi');
                    navigate('/test');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchListeningSessions();
    }, [testSessionId, navigate, stateScore, stateTotalQuestions]);

    // Nếu không có dữ liệu, chuyển về trang test
    useEffect(() => {
        if (!loading) {
            // Kiểm tra cả dữ liệu từ API và location state
            const hasData = sessionData || (stateScore !== undefined && stateScore !== null) || (stateTotalQuestions && stateTotalQuestions > 0);
            if (!hasData) {
                navigate('/test');
            }
        }
    }, [loading, navigate, sessionData, stateScore, stateTotalQuestions]);

    // Lấy dữ liệu từ API hoặc location.state
    // Ưu tiên sử dụng questions.length làm totalQuestions (số câu hỏi thực tế trong đề)
    const totalQuestions = questions ? questions.length : (sessionData ? sessionData.maxScore : stateTotalQuestions);

    // Từ API: totalAnswers là số câu đúng, maxScore là tổng số câu hỏi
    const score = sessionData ? sessionData.totalAnswers : stateScore;
    const correctAnswers = sessionData ? sessionData.totalAnswers : stateCorrectAnswers;
    const unansweredQuestions = stateUnansweredQuestions || 0;

    // Tính số câu sai: tổng số câu - số câu đúng (bao gồm cả câu chưa trả lời vì chưa trả lời = sai)
    // Đảm bảo: correctAnswers + totalWrongAnswers = totalQuestions
    const totalWrongAnswers = (totalQuestions || 0) - (correctAnswers || 0);

    // Tính số câu đã trả lời
    const calculateAnsweredCount = () => {
        if (questions && answers) {
            // Đếm số câu có đáp án từ answers object
            return questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '').length;
        }
        // Fallback: tổng số câu - số câu chưa trả lời
        return (totalQuestions || 0) - (unansweredQuestions || 0);
    };
    const answeredCount = calculateAnsweredCount();

    // Tính phần trăm - sử dụng totalQuestions (số câu thực tế trong đề)
    const percentage = totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    // Xác định kết quả
    const getResultStatus = () => {
        if (percentage >= 80) return {
            status: 'excellent',
            bgColor: 'bg-green-100',
            textColor: 'text-green-600',
            textColorDark: 'text-green-700',
            text: t('excellent') || 'Xuất sắc'
        };
        if (percentage >= 60) return {
            status: 'good',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600',
            textColorDark: 'text-blue-700',
            text: t('good') || 'Tốt'
        };
        if (percentage >= 40) return {
            status: 'average',
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-600',
            textColorDark: 'text-yellow-700',
            text: t('average') || 'Trung bình'
        };
        return {
            status: 'poor',
            bgColor: 'bg-red-100',
            textColor: 'text-red-600',
            textColorDark: 'text-red-700',
            text: t('poor') || 'Cần cải thiện'
        };
    };

    const resultStatus = getResultStatus();

    const handleBackToTest = () => {
        navigate(`/test/${campaignId}`);
    };

    const openAppealModal = () => {
        setIsAppealModalOpen(true);
    };

    const closeAppealModal = () => {
        setIsAppealModalOpen(false);
    };

    const handleConfirmAppeal = (appealReason) => {
        // TODO: Gửi yêu cầu phúc khảo đến API với lý do (appealReason)
        console.log('Appeal reason:', appealReason);
        setIsAppealSubmitted(true);
        setIsAppealModalOpen(false);
        toast.success(t('appeal_submitted_success') || 'Yêu cầu phúc khảo đã được gửi thành công!');
    };

    // Tính thời gian làm bài từ startTime và endTime
    const calculateTimeSpent = () => {
        if (sessionData && sessionData.startTime && sessionData.endTime) {
            const start = new Date(sessionData.startTime);
            const end = new Date(sessionData.endTime);
            const diffMs = end - start;
            const diffMins = Math.floor(diffMs / 60000);
            const diffSecs = Math.floor((diffMs % 60000) / 1000);
            return `${diffMins} phút ${diffSecs} giây`;
        }
        return timeSpent || '';
    };

    const displayTimeSpent = calculateTimeSpent();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('loading') || 'Đang tải...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {t('exam_result_title') || 'Kết quả bài thi'}
                    </h1>
                    <p className="text-gray-600">
                        {t('exam_result_subtitle') || 'Xem chi tiết kết quả bài thi của bạn'}
                    </p>
                </div>

                {/* Kết quả chính */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="text-center">
                        {/* Số câu đã trả lời */}
                        <div className={`mb-6 inline-block p-8 rounded-full ${resultStatus.bgColor}`}>
                            <div className={`text-6xl font-bold ${resultStatus.textColor} mb-2`}>
                                {answeredCount}/{totalQuestions}
                            </div>
                            <div className={`text-lg ${resultStatus.textColorDark}`}>
                                {t('answered_questions') || 'Câu đã trả lời'}
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div className={`text-xl font-semibold ${resultStatus.textColor} mb-6`}>
                            {resultStatus.text}
                        </div>

                        {/* Thống kê */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                                <div className="text-sm text-green-700 mt-1">
                                    {t('correct_answers') || 'Câu đúng'}
                                </div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-red-600">{totalWrongAnswers}</div>
                                <div className="text-sm text-red-700 mt-1">
                                    {t('wrong_answers') || 'Câu sai'}
                                </div>
                                {unansweredQuestions > 0 && (
                                    <div className="text-xs text-red-600 mt-1">
                                        ({t('including_unanswered') || 'Bao gồm'} {unansweredQuestions} {t('unanswered_questions') || 'câu chưa trả lời'})
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thời gian làm bài */}
                        {displayTimeSpent && (
                            <div className="mt-6 text-sm text-gray-600">
                                {t('time_spent') || 'Thời gian làm bài'}: {displayTimeSpent}
                            </div>
                        )}
                        {/* Thông tin bài thi từ API */}
                        {sessionData && (
                            <div className="mt-4 text-sm text-gray-500">
                                <p>{t('test_name') || 'Tên bài thi'}: {sessionData.testName}</p>
                                {sessionData.maxScore !== undefined && sessionData.maxScore !== null && (
                                    <p>{t('max_score') || 'Điểm tối đa'}: {sessionData.maxScore}</p>
                                )}
                                {sessionData.startTime && (
                                    <p>{t('start_time') || 'Thời gian bắt đầu'}: {new Date(sessionData.startTime).toLocaleString('vi-VN')}</p>
                                )}
                                {sessionData.endTime && (
                                    <p>{t('end_time') || 'Thời gian kết thúc'}: {new Date(sessionData.endTime).toLocaleString('vi-VN')}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chi tiết từng câu hỏi */}
                {questions && answers && (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            {t('detailed_results') || 'Chi tiết kết quả'}
                        </h2>
                        <div className="space-y-4">
                            {questions.map((question, index) => {
                                const userAnswer = answers[question.id];
                                // Tìm submittedAnswer từ API response nếu có
                                const submittedAnswer = submittedAnswers?.find(sa => sa.questionId === question.id);
                                // Xác định câu đã trả lời hay chưa
                                const isAnswered = userAnswer !== undefined && userAnswer !== null && userAnswer !== '' || submittedAnswer !== undefined;
                                // Sử dụng isCorrect từ API nếu có, nếu không thì:
                                // - Nếu chưa trả lời (isAnswered = false) => sai
                                // - Nếu đã trả lời => so sánh với đáp án đúng
                                const isCorrect = submittedAnswer
                                    ? submittedAnswer.isCorrect
                                    : (isAnswered && userAnswer === question.correctAnswer);
                                // Xác định đáp án đúng: nếu có submittedAnswer và isCorrect = true, thì đáp án đã chọn là đúng
                                // Nếu không có submittedAnswer, sử dụng question.correctAnswer
                                const correctAnswerKey = submittedAnswer && isCorrect
                                    ? userAnswer // Nếu đúng, đáp án đã chọn là đáp án đúng
                                    : (question.correctAnswer || null);

                                return (
                                    <div
                                        key={question.id}
                                        className={`border-2 rounded-lg p-4 ${isCorrect
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-red-200 bg-red-50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 mb-2">
                                                    {t('question') || 'Câu hỏi'} {index + 1}: {question.question}
                                                </div>
                                                <div className="space-y-2">
                                                    {question.options.map((option, optIndex) => {
                                                        const optionKey = String.fromCharCode(65 + optIndex);
                                                        const isUserAnswer = userAnswer === optionKey;
                                                        // Xác định đáp án đúng
                                                        const isCorrectAnswer = correctAnswerKey === optionKey;

                                                        return (
                                                            <div
                                                                key={optIndex}
                                                                className={`flex items-center p-2 rounded border-2 ${isCorrectAnswer && isUserAnswer
                                                                    ? 'bg-green-100 border-green-400'
                                                                    : isCorrectAnswer
                                                                        ? 'bg-blue-100 border-blue-400'
                                                                        : isUserAnswer
                                                                            ? 'bg-red-100 border-red-400'
                                                                            : 'bg-gray-50 border-gray-200'
                                                                    }`}
                                                            >
                                                                <span className="font-medium mr-2">{optionKey}.</span>
                                                                <span className={`flex-1 ${isCorrectAnswer || isUserAnswer
                                                                    ? 'text-gray-800'
                                                                    : 'text-gray-500'
                                                                    }`}>
                                                                    {option}
                                                                </span>
                                                                <div className="ml-auto flex items-center gap-2">
                                                                    {isUserAnswer && (
                                                                        <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                                                            <circle cx="10" cy="10" r="6" />
                                                                        </svg>
                                                                    )}
                                                                    {isCorrectAnswer && (
                                                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                {isCorrect ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                        ✓ {t('correct') || 'Đúng'}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                                        ✗ {t('incorrect') || 'Sai'}
                                                        {!isAnswered && (
                                                            <span className="ml-1 text-xs">({t('not_answered') || 'Chưa trả lời'})</span>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Nút quay lại và phúc khảo */}
                <div className="mt-8 flex justify-center gap-4">
                    <button
                        onClick={handleBackToTest}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        {t('back_to_test_list') || 'Quay lại danh sách bài thi'}
                    </button>
                    {!isAppealSubmitted && (
                        <button
                            onClick={openAppealModal}
                            className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {t('request_appeal') || 'Yêu cầu phúc khảo'}
                        </button>
                    )}
                    {isAppealSubmitted && (
                        <div className="px-8 py-3 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center gap-2 border border-green-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('appeal_submitted') || 'Đã gửi yêu cầu phúc khảo'}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal xác nhận phúc khảo */}
            <AppealModal
                isOpen={isAppealModalOpen}
                onClose={closeAppealModal}
                onConfirm={handleConfirmAppeal}
            />
        </div>
    );
};

export default ListeningExamResult;