import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { t, onLangChange } from '../../../i18n';
import { toast } from 'react-toastify';
import AppealModal from '../../../components/AppealModal';
import { getMySpeakingSessions } from '../../../service/api';

const SpeakingExamResult = () => {
    const { id: campaignId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [langVersion, setLangVersion] = useState(0);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [isAppealSubmitted, setIsAppealSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionData, setSessionData] = useState(null);

    // Lấy dữ liệu từ location state (fallback)
    const { totalQuestions: stateTotalQuestions, unansweredCount: stateUnansweredCount, questions, timeSpent: stateTimeSpent, recordedCount: stateRecordedCount, recordings, testSessionId } = location.state || {};

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1));
        return () => off();
    }, []);

    // Gọi API để lấy dữ liệu speaking sessions
    useEffect(() => {
        const fetchSpeakingSessions = async () => {
            try {
                setLoading(true);
                const response = await getMySpeakingSessions();

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
                    if (!questions) {
                        toast.error(response.error || 'Không thể tải dữ liệu kết quả bài thi');
                        navigate('/test');
                    }
                }
            } catch (error) {
                console.error('Error fetching speaking sessions:', error);
                // Nếu lỗi, vẫn có thể sử dụng dữ liệu từ location.state
                if (!questions) {
                    toast.error('Không thể tải dữ liệu kết quả bài thi');
                    navigate('/test');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSpeakingSessions();
    }, [testSessionId, navigate, questions]);

    // Nếu không có dữ liệu, chuyển về trang test
    useEffect(() => {
        if (!loading) {
            // Kiểm tra cả dữ liệu từ API và location state
            const hasData = sessionData || questions;
            if (!hasData) {
                navigate('/test');
            }
        }
    }, [loading, navigate, sessionData, questions]);

    // Lấy dữ liệu từ API hoặc location.state
    // Ưu tiên sử dụng questions.length làm totalQuestions (số câu hỏi thực tế trong đề)
    const totalQuestions = questions ? questions.length : (sessionData ? sessionData.maxScore : stateTotalQuestions);

    // Tính số câu đã nộp: nếu có recordings thì đếm số câu có recording, nếu không thì dùng từ API/state
    const calculateRecordedCount = () => {
        if (questions && recordings) {
            // Đếm số câu hỏi có recording
            return questions.filter(q => recordings[q.id]).length;
        }
        // Fallback về dữ liệu từ API hoặc state
        return sessionData ? sessionData.totalAnswers : (stateRecordedCount || 0);
    };

    const recordedCount = calculateRecordedCount();

    // Tính số câu chưa nộp = tổng số câu - số câu đã nộp
    const unansweredCount = totalQuestions - recordedCount;

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
        return stateTimeSpent || '';
    };

    const timeSpent = calculateTimeSpent();

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

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

    // Tạo tên file ghi âm dựa trên questionId và timestamp
    const getRecordingFileName = (questionId, recording) => {
        if (!recording || !recording.timestamp) {
            return `speaking_question_${questionId}.mp3`;
        }
        const date = new Date(recording.timestamp);
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '');
        return `speaking_question_${questionId}_${dateStr}_${timeStr}.mp3`;
    };

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
                        {t('speaking_exam_result_title') || 'Kết quả bài thi nói'}
                    </h1>
                    <p className="text-gray-600">
                        {t('speaking_exam_result_subtitle') || 'Xem danh sách các câu hỏi đã nộp file ghi âm'}
                    </p>
                </div>

                {/* Thống kê */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="text-center">
                        <div className="mb-6 inline-block p-8 rounded-full bg-blue-100">
                            <div className="text-6xl font-bold text-blue-600 mb-2">
                                {recordedCount || 0}/{totalQuestions || 0}
                            </div>
                            <div className="text-lg text-blue-700">
                                {t('submitted_recordings') || 'Câu đã nộp'}
                            </div>
                        </div>

                        {/* Thống kê chi tiết */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-600">{recordedCount || 0}</div>
                                <div className="text-sm text-green-700 mt-1">
                                    {t('submitted_recordings') || 'Câu đã nộp file'}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-gray-600">{unansweredCount || 0}</div>
                                <div className="text-sm text-gray-700 mt-1">
                                    {t('unsubmitted_recordings') || 'Câu chưa nộp file'}
                                </div>
                            </div>
                        </div>

                        {/* Thời gian làm bài */}
                        {timeSpent && (
                            <div className="mt-6 text-sm text-gray-600">
                                {t('time_spent') || 'Thời gian làm bài'}: {timeSpent}
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

                {/* Danh sách câu hỏi đã nộp */}
                {questions && (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            {t('submitted_recordings_list') || 'Danh sách câu hỏi đã nộp file ghi âm'}
                        </h2>
                        <div className="space-y-4">
                            {questions.map((question, index) => {
                                const hasRecording = recordings && recordings[question.id];
                                const recording = hasRecording ? recordings[question.id] : null;

                                return (
                                    <div
                                        key={question.id}
                                        className={`border-2 rounded-lg p-4 ${hasRecording
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 mb-2">
                                                    {t('question') || 'Câu hỏi'} {index + 1}: {question.question}
                                                </div>
                                                {question.description && (
                                                    <p className="text-sm text-gray-600 italic mb-3">
                                                        {question.description}
                                                    </p>
                                                )}
                                                {recording && (
                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex items-center gap-2 text-sm text-green-700">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="font-medium">
                                                                {t('recording_submitted') || 'Đã nộp file ghi âm'}
                                                                {recording.duration && (
                                                                    <span className="ml-2 text-gray-600">
                                                                        ({formatTime(recording.duration)})
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span className="font-mono text-xs">
                                                                {getRecordingFileName(question.id, recording)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                {hasRecording ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        {t('submitted') || 'Đã nộp'}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                                                        {t('not_submitted') || 'Chưa nộp'}
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

export default SpeakingExamResult;