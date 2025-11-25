import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { t, onLangChange } from '../../../i18n';
import { getExamQuestions, submitMultipleChoiceTest } from '../../../service/api';
import AudioPlayer from './AudioPlayer';

const ListeningExam = ({ examInfo }) => {
    const navigate = useNavigate();
    const { id: testIdFromUrl } = useParams(); // Lấy testId từ URL params
    const [questions, setQuestions] = useState([]); // Danh sách câu hỏi từ API
    const [examData, setExamData] = useState(null); // Thông tin đề thi từ API
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true); // Loading state khi fetch questions
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(examInfo?.duration ? examInfo.duration * 60 : 1800); // Chuyển phút sang giây
    const [langVersion, setLangVersion] = useState(0);
    const [playCounts, setPlayCounts] = useState({}); // Đếm số lần phát audio cho mỗi câu hỏi
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [startTime] = useState(Date.now()); // Lưu thời gian bắt đầu làm bài
    const [markedQuestions, setMarkedQuestions] = useState(new Set()); // Lưu các câu hỏi được đánh dấu
    const [isAudioPlaying, setIsAudioPlaying] = useState(false); // Trạng thái phát audio toàn cục

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1));
        return () => off();
    }, []);

    // Fetch questions từ API
    useEffect(() => {
        const fetchExamQuestions = async () => {
            setIsLoadingQuestions(true);
            try {
                // Lấy testId từ URL params (ưu tiên) hoặc từ examInfo
                const testId = testIdFromUrl || examInfo?.examId;
                // Lấy joinCode từ examInfo hoặc từ localStorage
                let joinCode = examInfo?.examCode;

                // Nếu không có joinCode trong examInfo, thử lấy từ localStorage
                if (!joinCode && testId) {
                    joinCode = localStorage.getItem(`examCode_${testId}`);
                }

                console.log('=== Fetch Exam Questions ===');
                console.log('testIdFromUrl:', testIdFromUrl);
                console.log('examInfo:', examInfo);
                console.log('testId:', testId);
                console.log('joinCode:', joinCode);

                if (!testId) {
                    console.error('Missing testId:', { testId });
                    toast.error('Thiếu thông tin đề thi. Vui lòng thử lại.');
                    navigate('/test');
                    return;
                }

                if (!joinCode) {
                    console.error('Missing joinCode:', { joinCode });
                    toast.error('Thiếu mã đề thi. Vui lòng quay lại và nhập mã đề thi.');
                    navigate('/test');
                    return;
                }

                console.log('Calling getExamQuestions with:', { testId, joinCode });
                const result = await getExamQuestions(testId, joinCode);
                console.log('API Result:', result);

                // Kiểm tra nếu có data (bất kể success flag)
                // Một số API trả về success: false nhưng vẫn có data hợp lệ
                if (result.data && result.data.questions && Array.isArray(result.data.questions) && result.data.questions.length > 0) {
                    const data = result.data;
                    console.log('API Data:', data);
                    console.log('Questions count:', data.questions?.length || 0);

                    // Lưu thông tin đề thi
                    setExamData({
                        testId: data.testId,
                        testName: data.testName,
                        testType: data.testType,
                        maxScore: data.maxScore,
                        durationInMinutes: data.durationInMinutes,
                        audioFileURL: data.audioFileURL,
                        totalQuestions: data.totalQuestions,
                    });

                    // Map questions từ API sang format hiện tại
                    const mappedQuestions = (data.questions || []).map((q, index) => {
                        // Map options từ API sang format hiện tại, lưu cả optionId
                        const mappedOptions = (q.options || []).map((opt, optIndex) => {
                            const optionKey = String.fromCharCode(65 + optIndex); // A, B, C, D
                            return {
                                key: optionKey,
                                content: `${optionKey}. ${opt.optionContent}`,
                                optionId: opt.optionId, // Lưu optionId để dùng khi submit
                            };
                        });

                        return {
                            id: q.questionId,
                            question: q.questionContent,
                            options: mappedOptions.map(opt => opt.content), // Giữ format cũ cho hiển thị
                            optionsWithIds: mappedOptions, // Lưu thêm options với optionId
                            score: q.score,
                            orderNumber: q.orderNumber,
                        };
                    });

                    // Sắp xếp theo orderNumber
                    mappedQuestions.sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));

                    console.log('Mapped Questions:', mappedQuestions);
                    setQuestions(mappedQuestions);

                    // Cập nhật thời gian từ API
                    if (data.durationInMinutes) {
                        setTimeRemaining(data.durationInMinutes * 60);
                    }

                    toast.success(`Đã tải ${mappedQuestions.length} câu hỏi thành công`);
                } else {
                    console.error('API Error:', result.error);
                    toast.error(result.error || 'Không thể tải câu hỏi đề thi');
                    navigate('/test');
                }
            } catch (error) {
                console.error('Error fetching exam questions:', error);
                toast.error('Đã xảy ra lỗi khi tải câu hỏi đề thi');
                navigate('/test');
            } finally {
                setIsLoadingQuestions(false);
            }
        };

        fetchExamQuestions();
    }, [testIdFromUrl, examInfo, navigate]);

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
    const unansweredCount = questions.length - answeredCount;
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

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
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const openSubmitModal = () => {
        if (hasSubmitted) {
            return;
        }
        setIsSubmitModalOpen(true);
    };
    const closeSubmitModal = () => setIsSubmitModalOpen(false);
    const handleConfirmSubmit = async () => {
        if (hasSubmitted) {
            return;
        }

        setIsSubmitModalOpen(false);

        // Tính thời gian làm bài
        const endTime = Date.now();
        const startTimeISO = new Date(startTime).toISOString();
        const endTimeISO = new Date(endTime).toISOString();

        // Lấy testId từ examData hoặc examInfo
        const testId = examData?.testId || examInfo?.examId || testIdFromUrl;

        if (!testId) {
            toast.error('Không tìm thấy thông tin đề thi');
            return;
        }

        // Chuyển đổi answers từ format { questionId: optionKey } sang format API { questionId, selectedOptionId }
        const answersArray = [];
        questions.forEach((question) => {
            const userAnswer = answers[question.id];
            if (userAnswer !== undefined && userAnswer !== null) {
                // Tìm optionId tương ứng với optionKey (A, B, C, D)
                const selectedOption = question.optionsWithIds?.find(opt => opt.key === userAnswer);
                if (selectedOption && selectedOption.optionId) {
                    // Đảm bảo questionId và selectedOptionId là số nguyên
                    const questionIdNum = typeof question.id === 'string' ? parseInt(question.id, 10) : Number(question.id);
                    const optionIdNum = typeof selectedOption.optionId === 'string' ? parseInt(selectedOption.optionId, 10) : Number(selectedOption.optionId);

                    if (!isNaN(questionIdNum) && questionIdNum > 0 && !isNaN(optionIdNum) && optionIdNum > 0) {
                        answersArray.push({
                            questionId: questionIdNum,
                            selectedOptionId: optionIdNum,
                        });
                    } else {
                        console.warn(`Invalid IDs for question ${question.id}:`, {
                            questionId: questionIdNum,
                            optionId: optionIdNum,
                        });
                    }
                } else {
                    console.warn(`Không tìm thấy optionId cho câu hỏi ${question.id} với đáp án ${userAnswer}`, {
                        question,
                        optionsWithIds: question.optionsWithIds,
                    });
                }
            }
        });

        // Nếu không có câu trả lời nào, vẫn gửi request với mảng rỗng
        // (hoặc có thể hiển thị cảnh báo - tùy yêu cầu)
        if (answersArray.length === 0) {
            const confirmEmpty = window.confirm('Bạn chưa trả lời câu hỏi nào. Bạn có chắc chắn muốn nộp bài không?');
            if (!confirmEmpty) {
                setIsSubmitModalOpen(true);
                return;
            }
        }

        // Đảm bảo testId là số nguyên
        const testIdNum = typeof testId === 'string' ? parseInt(testId, 10) : Number(testId);
        if (isNaN(testIdNum) || testIdNum <= 0) {
            toast.error('Test ID không hợp lệ');
            return;
        }

        // Log payload để debug
        console.log('Submit payload:', {
            testId: testIdNum,
            startTime: startTimeISO,
            endTime: endTimeISO,
            answersCount: answersArray.length,
            answers: answersArray,
        });

        // Hiển thị loading
        toast.info('Đang nộp bài...', { autoClose: false });

        try {
            // Gọi API submit với chữ ký hàm (testId, startTime, endTime, answers)
            const result = await submitMultipleChoiceTest(
                testIdNum,
                startTimeISO,
                endTimeISO,
                answersArray
            );

            // Kiểm tra success hoặc có data trong response
            // API có thể trả về code: 2 với message "Test submitted successfully"
            // Hoặc có thể trả về success: true với data
            if (result.success) {
                const responseData = result.data;

                // Nếu không có data, vẫn tiếp tục với dữ liệu từ result
                if (!responseData) {
                    console.warn('API returned success but no data:', result);
                }

                // Tính thời gian làm bài để hiển thị
                const timeSpentMs = endTime - startTime;
                const timeSpentMinutes = Math.floor(timeSpentMs / 60000);
                const timeSpentSeconds = Math.floor((timeSpentMs % 60000) / 1000);
                const timeSpent = `${timeSpentMinutes}:${String(timeSpentSeconds).padStart(2, '0')}`;

                // Tính số câu đúng, sai, chưa trả lời từ submittedAnswers
                let correctAnswers = 0;
                let wrongAnswers = 0;
                let unansweredQuestions = 0;

                if (responseData && responseData.submittedAnswers && Array.isArray(responseData.submittedAnswers)) {
                    responseData.submittedAnswers.forEach((submittedAnswer) => {
                        if (submittedAnswer.isCorrect) {
                            correctAnswers++;
                        } else {
                            wrongAnswers++;
                        }
                    });
                } else if (responseData && typeof responseData.correctAnswers === 'number') {
                    // Nếu API trả về correctAnswers trực tiếp
                    correctAnswers = responseData.correctAnswers;
                }

                // Đếm số câu chưa trả lời (tổng số câu - số câu đã submit)
                unansweredQuestions = questions.length - answersArray.length;

                // Tính wrongAnswers nếu chưa có
                if (wrongAnswers === 0 && responseData) {
                    wrongAnswers = (responseData.submittedAnswers?.length || answersArray.length) - correctAnswers;
                }

                toast.dismiss();
                setHasSubmitted(true);
                toast.success('Nộp bài thành công!');

                // Chuyển đến trang kết quả với dữ liệu từ API
                navigate('/exam-result', {
                    replace: true,
                    state: {
                        examType: 'Listening',
                        testSessionId: responseData?.testSessionId,
                        score: responseData?.totalScore || 0, // ListeningExamResult expect 'score'
                        totalScore: responseData?.totalScore || 0,
                        maxScore: responseData?.maxScore || examData?.maxScore || 0,
                        correctAnswers: responseData?.correctAnswers || correctAnswers,
                        wrongAnswers: wrongAnswers,
                        unansweredQuestions: unansweredQuestions,
                        totalQuestions: questions.length,
                        answeredQuestions: answersArray.length,
                        answers: answers,
                        questions: questions,
                        submittedAnswers: responseData?.submittedAnswers || [],
                        timeSpent: timeSpent,
                        examInfo: examData || examInfo,
                        startTime: responseData?.startTime || startTimeISO,
                        endTime: responseData?.endTime || endTimeISO,
                        status: responseData?.status,
                    }
                });
            } else {
                toast.dismiss();
                const errorMessage = result.error || 'Không thể nộp bài. Vui lòng thử lại.';
                console.error('Submit failed:', result);
                toast.error(errorMessage);

                // Nếu có lỗi chi tiết, hiển thị thêm thông tin
                if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
                    console.error('Detailed errors:', result.errors);
                }
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            toast.dismiss();

            // Hiển thị thông báo lỗi chi tiết hơn
            let errorMessage = 'Đã xảy ra lỗi khi nộp bài.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errorMessage) {
                errorMessage = error.response.data.errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        }
    };

    // Loading state
    if (isLoadingQuestions) {
        return (
            <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('loading') || 'Đang tải câu hỏi...'}</p>
                </div>
            </div>
        );
    }

    // Nếu không có câu hỏi
    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">{t('no_questions') || 'Không có câu hỏi nào'}</p>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
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
                                        {t('listening_test') || 'Bài thi nghe'} - {t('question') || 'Câu hỏi'} {currentQuestionIndex + 1} / {questions.length}
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
                            {examData?.audioFileURL && (
                                <AudioPlayer
                                    questionId={currentQuestion.id}
                                    allQuestions={questions}
                                    maxPlays={3}
                                    onPlayCountChange={handlePlayCountChange}
                                    isPlaying={isAudioPlaying}
                                    onPlayingChange={setIsAudioPlaying}
                                    audioUrl={examData.audioFileURL}
                                />
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
                                    disabled={currentQuestionIndex === questions.length - 1}
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
                                    {answeredCount} / {questions.length} {t('questions') || 'câu hỏi'} {t('answered') || 'đã trả lời'}
                                </p>
                            </div>

                            {/* Danh sách số câu hỏi */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    {t('question_list') || 'Danh sách câu hỏi'}
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {questions.map((question, index) => {
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
                                disabled={hasSubmitted}
                                className={`w-full mt-6 px-4 py-3 rounded-lg font-semibold transition-colors ${hasSubmitted
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-red-700'
                                    }`}
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
                                {t('cancel') || 'Hủy'}
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                            >
                                {t('submit_exam') || 'Nộp bài'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListeningExam;