import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../../i18n';
import AudioPlayer from './AudioPlayer';

// Mock data - Listening test với câu hỏi tiếng Anh
const mockQuestions = [
    {
        id: 1,
        question: 'What should you do when a passenger asks for assistance?',
        audioText: 'What should you do when a passenger asks for assistance?',
        options: [
            'A. Ignore the request and continue with your duties',
            'B. Respond politely and provide the necessary help',
            'C. Ask another crew member to handle it',
            'D. Direct them to find the information themselves'
        ],
        correctAnswer: 'B'
    },
    {
        id: 2,
        question: 'How should you address passengers during the flight?',
        audioText: 'How should you address passengers during the flight?',
        options: [
            'A. Use their first names only',
            'B. Use formal titles and be respectful',
            'C. Use casual language to be friendly',
            'D. Avoid speaking to passengers directly'
        ],
        correctAnswer: 'B'
    },
    {
        id: 3,
        question: 'What is the most important quality for a cabin crew member?',
        audioText: 'What is the most important quality for a cabin crew member?',
        options: [
            'A. Physical appearance',
            'B. Excellent communication and customer service skills',
            'C. Ability to speak multiple languages',
            'D. Years of flying experience'
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
    const [playCounts, setPlayCounts] = useState({}); // Đếm số lần phát audio cho mỗi câu hỏi
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [startTime] = useState(Date.now()); // Lưu thời gian bắt đầu làm bài
    const [markedQuestions, setMarkedQuestions] = useState(new Set()); // Lưu các câu hỏi được đánh dấu

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
    const unansweredCount = mockQuestions.length - answeredCount;
    const progress = (answeredCount / mockQuestions.length) * 100;

    // Toggle đánh dấu câu hỏi
    const toggleMarkQuestion = (questionId) => {
        setMarkedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    // Handle answer selection
    const handleAnswerSelect = (questionId, answer) => {
        setAnswers({
            ...answers,
            [questionId]: answer
        });
    };

    // Callback để cập nhật playCount từ AudioPlayer
    const handlePlayCountChange = (questionId, newPlayCount) => {
        setPlayCounts(prev => ({
            ...prev,
            [questionId]: newPlayCount
        }));
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

    const openSubmitModal = () => setIsSubmitModalOpen(true);
    const closeSubmitModal = () => setIsSubmitModalOpen(false);
    const handleConfirmSubmit = () => {
        // Tính điểm
        let score = 0;
        let correctAnswers = 0;
        let wrongAnswers = 0;
        let unansweredQuestions = 0;

        mockQuestions.forEach((question) => {
            const userAnswer = answers[question.id];
            if (userAnswer === undefined) {
                unansweredQuestions++;
            } else if (userAnswer === question.correctAnswer) {
                score++;
                correctAnswers++;
            } else {
                wrongAnswers++;
            }
        });

        // Tính thời gian làm bài
        const endTime = Date.now();
        const timeSpentMs = endTime - startTime;
        const timeSpentMinutes = Math.floor(timeSpentMs / 60000);
        const timeSpentSeconds = Math.floor((timeSpentMs % 60000) / 1000);
        const timeSpent = `${timeSpentMinutes}:${String(timeSpentSeconds).padStart(2, '0')}`;

        setIsSubmitModalOpen(false);

        // Chuyển đến trang kết quả với dữ liệu
        navigate('/exam-result', {
            state: {
                score,
                totalQuestions: mockQuestions.length,
                correctAnswers,
                wrongAnswers,
                unansweredQuestions,
                answers,
                questions: mockQuestions,
                timeSpent
            }
        });
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
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {t('listening_test') || 'Bài thi nghe'} - {t('question') || 'Câu hỏi'} {currentQuestionIndex + 1} / {mockQuestions.length}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleMarkQuestion(currentQuestion.id)}
                                            className={`p-2 rounded-lg transition-colors ${markedQuestions.has(currentQuestion.id)
                                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            title={markedQuestions.has(currentQuestion.id) ? (t('unmark_question') || 'Bỏ đánh dấu') : (t('mark_question') || 'Đánh dấu câu hỏi')}
                                        >
                                            <svg className="w-5 h-5" fill={markedQuestions.has(currentQuestion.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                            </svg>
                                        </button>
                                        <span className="text-sm text-gray-500">
                                            {currentAnswer ? (t('answered') || 'Đã trả lời') : (t('not_answered') || 'Chưa trả lời')}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Audio Player - Sử dụng component riêng */}
                            <AudioPlayer
                                questionId={currentQuestion.id}
                                audioText={currentQuestion.audioText || currentQuestion.question}
                                allQuestions={mockQuestions}
                                maxPlays={3}
                                onPlayCountChange={handlePlayCountChange}
                            />

                            {/* Các lựa chọn */}
                            <div className="mb-8">
                                <p className="text-sm font-medium text-gray-700 mb-4">
                                    {t('select_answer') || 'Chọn đáp án của bạn:'}
                                </p>
                                <div className="space-y-3">
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
                                        const isMarked = markedQuestions.has(question.id);

                                        return (
                                            <button
                                                key={question.id}
                                                onClick={() => handleQuestionClick(index)}
                                                className={`relative w-full h-10 rounded-lg font-semibold text-sm transition-all ${isCurrent
                                                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                                    : isAnswered
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {index + 1}
                                                {isMarked && (
                                                    <svg
                                                        className="absolute top-0 right-0 w-4 h-4 text-yellow-600"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        style={{ transform: 'translate(25%, -25%)' }}
                                                    >
                                                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Nút nộp bài */}
                            <button
                                onClick={openSubmitModal}
                                className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                            >
                                {t('submit_exam') || 'Nộp bài'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal xác nhận nộp bài */}
            {isSubmitModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeSubmitModal}></div>
                    <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {t('submit_exam') || 'Nộp bài'}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    {t('submit_confirm') || 'Bạn có chắc chắn muốn nộp bài?'}
                                </p>
                                {unansweredCount > 0 && (
                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-sm text-amber-800 font-medium">
                                            ⚠️ {t('unanswered_questions') || 'Số câu hỏi chưa làm'}: <span className="font-bold text-amber-900">{unansweredCount}</span> {t('questions') || 'câu'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeSubmitModal}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                {t('Hủy')}
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                            >
                                {t('Nộp bài')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamPage;