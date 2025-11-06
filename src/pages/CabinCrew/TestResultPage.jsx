import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';
import { toast } from 'react-toastify';
import AppealModal from '../../components/CabinCrewComponent/AppealModal';

const TestResultPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [, setLangVersion] = useState(0);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [isAppealSubmitted, setIsAppealSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Lấy dữ liệu từ location state
    const { score, totalQuestions, correctAnswers, wrongAnswers, unansweredQuestions, answers, questions, timeSpent } = location.state || {};

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1));
        return () => off();
    }, []);

    // Nếu không có dữ liệu, chuyển về trang test
    useEffect(() => {
        // Kiểm tra sau một khoảng thời gian ngắn để đảm bảo component đã render
        const timer = setTimeout(() => {
            if (!location.state || score === undefined) {
                navigate('/cabin-crew/tests');
            } else {
                setIsLoading(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [navigate, score, location.state]);

    // Tính phần trăm với giá trị mặc định
    const safeScore = score !== undefined ? score : 0;
    const safeTotalQuestions = totalQuestions || 0;
    const percentage = safeTotalQuestions > 0 ? Math.round((safeScore / safeTotalQuestions) * 100) : 0;

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
        navigate('/cabin-crew/tests');
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

    // Nếu đang loading, hiển thị loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('loading') || 'Đang tải...'}</p>
                </div>
            </div>
        );
    }

    // Nếu không có dữ liệu, hiển thị thông báo
    if (!location.state || score === undefined) {
        return (
            <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">{t('no_test_data') || 'Không có dữ liệu bài thi. Đang chuyển hướng...'}</p>
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
                        {/* Điểm số lớn */}
                        <div className={`mb-6 inline-block p-8 rounded-full ${resultStatus.bgColor}`}>
                            <div className={`text-6xl font-bold ${resultStatus.textColor} mb-2`}>
                                {safeScore}/{safeTotalQuestions}
                            </div>
                            <div className={`text-2xl font-semibold ${resultStatus.textColorDark}`}>
                                {percentage}%
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div className={`text-xl font-semibold ${resultStatus.textColor} mb-6`}>
                            {resultStatus.text}
                        </div>

                        {/* Thống kê */}
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-600">{correctAnswers || 0}</div>
                                <div className="text-sm text-green-700 mt-1">
                                    {t('correct_answers') || 'Câu đúng'}
                                </div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-red-600">{wrongAnswers || 0}</div>
                                <div className="text-sm text-red-700 mt-1">
                                    {t('wrong_answers') || 'Câu sai'}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-gray-600">{unansweredQuestions || 0}</div>
                                <div className="text-sm text-gray-700 mt-1">
                                    {t('unanswered_questions') || 'Chưa trả lời'}
                                </div>
                            </div>
                        </div>

                        {/* Thời gian làm bài */}
                        {timeSpent && (
                            <div className="mt-6 text-sm text-gray-600">
                                {t('time_spent') || 'Thời gian làm bài'}: {timeSpent}
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
                                const isCorrect = userAnswer === question.correctAnswer;
                                const isAnswered = userAnswer !== undefined;

                                return (
                                    <div
                                        key={question.id}
                                        className={`border-2 rounded-lg p-4 ${isCorrect
                                            ? 'border-green-200 bg-green-50'
                                            : isAnswered
                                                ? 'border-red-200 bg-red-50'
                                                : 'border-gray-200 bg-gray-50'
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

                                                        // Chỉ hiển thị đáp án mà người dùng đã chọn
                                                        if (!isUserAnswer) {
                                                            return (
                                                                <div
                                                                    key={optIndex}
                                                                    className="flex items-center p-2 rounded bg-gray-50"
                                                                >
                                                                    <span className="font-medium mr-2">{optionKey}.</span>
                                                                    <span className="text-gray-500">{option}</span>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div
                                                                key={optIndex}
                                                                className={`flex items-center p-2 rounded ${isCorrect
                                                                    ? 'bg-green-100 border border-green-300'
                                                                    : 'bg-red-100 border border-red-300'
                                                                    }`}
                                                            >
                                                                <span className="font-medium mr-2">{optionKey}.</span>
                                                                <span className="text-gray-700">{option}</span>
                                                                <span className="ml-auto font-semibold">
                                                                    {isCorrect ? (
                                                                        <span className="text-green-600">
                                                                            ✓ {t('your_answer') || 'Đáp án của bạn'}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-red-600">
                                                                            ✗ {t('your_answer') || 'Đáp án của bạn'}
                                                                        </span>
                                                                    )}
                                                                </span>
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
                                                ) : isAnswered ? (
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                                        ✗ {t('incorrect') || 'Sai'}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                                                        {t('not_answered') || 'Chưa trả lời'}
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

export default TestResultPage;

