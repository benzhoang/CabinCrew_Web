import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';

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
    const [isPlaying, setIsPlaying] = useState(false);
    const [playCounts, setPlayCounts] = useState({}); // Đếm số lần phát audio cho mỗi câu hỏi
    const speechSynthesisRef = useRef(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [startTime] = useState(Date.now()); // Lưu thời gian bắt đầu làm bài

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

    // Play audio using Web Speech API
    const playAudio = (text) => {
        if (speechSynthesisRef.current) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
        speechSynthesisRef.current = utterance;
    };

    const stopAudio = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            stopAudio();
        } else {
            const currentQuestion = mockQuestions[currentQuestionIndex];
            const questionId = currentQuestion.id;
            const currentPlayCount = playCounts[questionId] || 0;

            // Kiểm tra xem đã phát 3 lần chưa
            if (currentPlayCount >= 3) {
                return; // Không cho phát thêm
            }

            // Tăng số lần phát
            setPlayCounts({
                ...playCounts,
                [questionId]: currentPlayCount + 1
            });

            playAudio(currentQuestion.audioText || currentQuestion.question);
        }
    };

    // Stop audio when component unmounts or question changes
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, []);

    // Stop audio when question changes
    useEffect(() => {
        stopAudio();
    }, [currentQuestionIndex]);

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
    const currentPlayCount = playCounts[currentQuestion.id] || 0;
    const canPlay = currentPlayCount < 3;

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
                                    <span className="text-sm text-gray-500">
                                        {currentAnswer ? (t('answered') || 'Đã trả lời') : (t('not_answered') || 'Chưa trả lời')}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Audio Player */}
                            {canPlay ? (
                                <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-center mb-4">
                                        <button
                                            onClick={handlePlayPause}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                                        >
                                            {isPlaying ? (
                                                <>
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('pause') || 'Tạm dừng'}
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('play') || 'Phát'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-600 text-center">
                                        <p className="mb-1">{t('listening_instruction') || 'Nghe audio và chọn đáp án đúng'}</p>
                                        <p className="text-amber-600 font-medium">
                                            {t('plays_remaining') || 'Còn lại'} {3 - currentPlayCount} {t('times') || 'lần'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-8 p-6 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center justify-center">
                                        <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-700 font-medium">
                                            {t('audio_limit_reached') || 'Bạn đã sử dụng hết 3 lần phát audio cho câu hỏi này'}
                                        </p>
                                    </div>
                                </div>
                            )}

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
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {t('submit_exam') || 'Nộp bài'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {t('submit_confirm') || 'Bạn có chắc chắn muốn nộp bài?'}
                                </p>
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