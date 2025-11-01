import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';

// Mock data với 3 câu hỏi trắc nghiệm
const mockQuestions = [
    {
        id: 1,
        question: 'Trong giao tiếp với hành khách, bạn nên sử dụng ngôn ngữ như thế nào?',
        options: [
            'A. Nói nhanh để tiết kiệm thời gian',
            'B. Nói rõ ràng, lịch sự và dễ hiểu',
            'C. Chỉ nói khi được hỏi',
            'D. Sử dụng thuật ngữ chuyên môn'
        ],
        correctAnswer: 'B'
    },
    {
        id: 2,
        question: 'Khi máy bay gặp tình huống khẩn cấp, nhiệm vụ đầu tiên của tiếp viên hàng không là gì?',
        options: [
            'A. Gọi điện cho gia đình',
            'B. Giữ bình tĩnh và hướng dẫn hành khách',
            'C. Tìm chỗ ngồi an toàn nhất cho bản thân',
            'D. Chờ lệnh từ phi công'
        ],
        correctAnswer: 'B'
    },
    {
        id: 3,
        question: 'Đâu là đặc điểm quan trọng nhất của một tiếp viên hàng không chuyên nghiệp?',
        options: [
            'A. Ngoại hình đẹp',
            'B. Khả năng giao tiếp và chăm sóc khách hàng tốt',
            'C. Biết nhiều ngôn ngữ',
            'D. Kinh nghiệm bay lâu năm'
        ],
        correctAnswer: 'B'
    }
];

const ExamPage = () => {
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(1800); // 30 phút = 1800 giây
    const [langVersion, setLangVersion] = useState(0);

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1));
        return () => off();
    }, []);

    // Timer countdown
    useEffect(() => {
        if (timeRemaining <= 0) {
            // Hết thời gian - có thể tự động nộp bài
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Calculate progress percentage - chỉ tính các câu đã được trả lời
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / mockQuestions.length) * 100;

    // Handle answer selection
    const handleAnswerSelect = (questionId, answer) => {
        setAnswers({
            ...answers,
            [questionId]: answer
        });
    };

    // Handle question navigation
    const handleQuestionClick = (index) => {
        setCurrentQuestionIndex(index);
    };

    // Handle next/previous question
    const handleNext = () => {
        if (currentQuestionIndex < mockQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const currentQuestion = mockQuestions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Ô lớn - Hiển thị câu hỏi */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            {/* Header câu hỏi */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {t('question') || 'Câu hỏi'} {currentQuestionIndex + 1} / {mockQuestions.length}
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        {currentAnswer ? '(Đã trả lời)' : '(Chưa trả lời)'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Nội dung câu hỏi */}
                            <div className="mb-8">
                                <p className="text-lg font-semibold text-gray-800 mb-6">
                                    {currentQuestion.question}
                                </p>

                                {/* Các lựa chọn */}
                                <div className="space-y-4">
                                    {currentQuestion.options.map((option, index) => {
                                        const optionKey = String.fromCharCode(65 + index); // A, B, C, D
                                        const isSelected = currentAnswer === optionKey;

                                        return (
                                            <label
                                                key={index}
                                                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion.id}`}
                                                    value={optionKey}
                                                    checked={isSelected}
                                                    onChange={() => handleAnswerSelect(currentQuestion.id, optionKey)}
                                                    className="mr-4 h-5 w-5 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{option}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Nút điều hướng */}
                            <div className="flex justify-between items-center pt-6 border-t">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {t('previous') || 'Câu trước'}
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={currentQuestionIndex === mockQuestions.length - 1}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {t('next') || 'Câu sau'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Ô nhỏ - Số câu hỏi, thời gian, thanh tiến trình */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                            {/* Thời gian */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                    {t('time_remaining') || 'Thời gian còn lại'}
                                </h3>
                                <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                    {formatTime(timeRemaining)}
                                </div>
                            </div>

                            {/* Thanh tiến trình */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                    {t('progress') || 'Tiến trình'}
                                </h3>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                    {answeredCount} / {mockQuestions.length} {t('questions') || 'câu hỏi'} {t('answered') || 'đã trả lời'}
                                </p>
                            </div>

                            {/* Danh sách số câu hỏi */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    {t('question_list') || 'Danh sách câu hỏi'}
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {mockQuestions.map((question, index) => {
                                        const isCurrent = index === currentQuestionIndex;
                                        const isAnswered = answers[question.id];

                                        return (
                                            <button
                                                key={question.id}
                                                onClick={() => handleQuestionClick(index)}
                                                className={`w-full h-10 rounded-lg font-semibold text-sm transition-all ${isCurrent
                                                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                                    : isAnswered
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {index + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Nút nộp bài */}
                            <button
                                onClick={() => {
                                    if (window.confirm(t('submit_confirm') || 'Bạn có chắc chắn muốn nộp bài?')) {
                                        // TODO: Handle submit
                                        console.log('Answers:', answers);
                                        navigate('/test');
                                    }
                                }}
                                className="w-full mt-6 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                            >
                                {t('submit_exam') || 'Nộp bài'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamPage;
