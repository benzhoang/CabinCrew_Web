import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { t, onLangChange } from '../../../i18n';
import { toast } from 'react-toastify';
import AppealModal from '../../../components/AppealModal';
import { getMySpeakingSessions } from '../../../service/api';

const SpeakingReport = () => {
    const { id: testId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [langVersion, setLangVersion] = useState(0);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [isAppealSubmitted, setIsAppealSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionData, setSessionData] = useState(null);
    const [error, setError] = useState(null);

    // Lấy dữ liệu từ location state (fallback)
    const {
        examId,
        examName,
        examType,
        score,
        maxScore,
    } = location.state || {};

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

                console.log("API Result getMySpeakingSessions:", response);

                if (response.success && response.data && response.data.length > 0) {
                    // Tìm session có testId phù hợp với testId từ URL params hoặc examId từ state
                    const targetTestId = testId || examId;
                    let selectedSession = null;

                    if (targetTestId) {
                        selectedSession = response.data.find(
                            session => session.testId?.toString() === targetTestId.toString()
                        );
                    }

                    // Nếu không tìm thấy, lấy session mới nhất
                    if (!selectedSession) {
                        selectedSession = response.data[0];
                    }

                    console.log("Selected Session:", selectedSession);

                    // Map dữ liệu từ API sang format của component
                    // Giữ nguyên totalScore từ API (có thể là null/undefined) để kiểm tra chính xác
                    const mappedData = {
                        ...selectedSession,
                        userFullName: selectedSession.userFullName || "",
                        userEmail: selectedSession.userEmail || "",
                        imgURL: selectedSession.imgURL || "",
                        startTime: selectedSession.startTime,
                        endTime: selectedSession.endTime,
                        testName: selectedSession.testName || examName || "",
                        testType: selectedSession.testType || examType || "English Speaking",
                        totalScore: selectedSession.totalScore !== undefined && selectedSession.totalScore !== null
                            ? selectedSession.totalScore
                            : (score !== undefined && score !== null ? score : null),
                        maxScore: selectedSession.maxScore !== undefined && selectedSession.maxScore !== null
                            ? selectedSession.maxScore
                            : (maxScore !== undefined && maxScore !== null ? maxScore : 0),
                        status: selectedSession.status !== undefined ? selectedSession.status : false,
                        isPassedOrFailed: selectedSession.isPassedOrFailed !== undefined ? selectedSession.isPassedOrFailed : false,
                        canRequestEnquiry: selectedSession.canRequestEnquiry !== undefined ? selectedSession.canRequestEnquiry : false,
                    };

                    setSessionData(mappedData);
                } else {
                    setError(response.error || 'Không thể tải dữ liệu kết quả bài thi');
                }
            } catch (error) {
                console.error('Error fetching speaking sessions:', error);
                setError('Không thể tải dữ liệu kết quả bài thi');
            } finally {
                setLoading(false);
            }
        };

        fetchSpeakingSessions();
    }, [testId, examId, examName, examType, score, maxScore]);

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
        return '';
    };

    const timeSpent = calculateTimeSpent();

    // Lấy các giá trị final từ sessionData
    const finalUserFullName = sessionData?.userFullName || "";
    const finalUserEmail = sessionData?.userEmail || "";
    const finalImgURL = sessionData?.imgURL || "";
    const finalStartTime = sessionData?.startTime || "";
    const finalEndTime = sessionData?.endTime || "";
    const finalTestName = sessionData?.testName || "";
    const finalTestType = sessionData?.testType || "";
    const finalTotalScore = sessionData?.totalScore;
    const finalMaxScore = sessionData?.maxScore || 0;
    const totalAnswers = sessionData?.totalAnswers || 0;

    // Kiểm tra xem bài thi đã được chấm chưa
    // Nếu totalScore là null, undefined, hoặc 0 thì coi là chưa được chấm
    const isGraded = finalTotalScore !== null && finalTotalScore !== undefined && finalTotalScore !== 0;

    // Lấy các giá trị cho điều kiện hiển thị nút phúc khảo
    const status = sessionData?.status === true;
    const isPassedOrFailed = sessionData?.isPassedOrFailed === true;
    const canRequestEnquiry = sessionData?.canRequestEnquiry === true;

    // Điều kiện hiển thị nút phúc khảo:
    // - status = true (enable)
    // - isPassedOrFailed = false (enable)
    // - canRequestEnquiry = true (enable)
    const canShowAppealButton = status && !isPassedOrFailed && canRequestEnquiry && !isAppealSubmitted;

    const handleBackToScoreReport = () => {
        navigate('/score-report');
    };

    const openAppealModal = () => {
        setIsAppealModalOpen(true);
    };

    const closeAppealModal = () => {
        setIsAppealModalOpen(false);
    };

    const handleConfirmAppeal = (appealReason) => {
        console.log('Appeal reason:', appealReason);
        setIsAppealSubmitted(true);
        setIsAppealModalOpen(false);
        toast.success(t('appeal_submitted_success') || 'Yêu cầu phúc khảo đã được gửi thành công!');
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

    if (!sessionData && !loading) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-100">
                <div className="text-center">
                    <p className="mb-4 text-gray-600">
                        {error || t("no_test_data") || "Không có dữ liệu bài thi"}
                    </p>
                    <button
                        onClick={handleBackToScoreReport}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {t("back") || "Quay lại"}
                    </button>
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
                        {t('speaking_exam_report_title') || 'Báo cáo kết quả bài thi nói'}
                    </h1>
                    <p className="text-gray-600">
                        {t('speaking_exam_report_subtitle') || 'Xem chi tiết kết quả bài thi nói của bạn'}
                    </p>
                </div>

                {/* Kết quả chính */}
                <div className="p-6 mb-6 bg-white shadow-lg rounded-xl">
                    <div className="space-y-6">
                        <div className="max-w-3xl mx-auto space-y-6">
                            {/* User Info Section */}
                            {(finalImgURL || finalUserFullName || finalUserEmail) && (
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                        <div className="flex flex-col items-center md:flex-row md:items-center md:gap-6">
                                            {finalImgURL && (
                                                <img
                                                    src={finalImgURL}
                                                    alt="User Avatar"
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 mb-4 md:mb-0"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            )}

                                            <div className="space-y-4 text-center md:text-left">
                                                {finalUserFullName && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            {t("full_name") || "Họ và tên"}
                                                        </label>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {finalUserFullName}
                                                        </p>
                                                    </div>
                                                )}

                                                {finalUserEmail && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            {t("email") || "Email"}
                                                        </label>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {finalUserEmail}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-center md:justify-end w-full md:w-auto">
                                            {isGraded ? (
                                                <div className="inline-block p-6 rounded-full bg-green-100">
                                                    <div className="text-4xl font-bold text-green-600">
                                                        {finalMaxScore > 0
                                                            ? `${finalTotalScore}/${finalMaxScore}`
                                                            : `${totalAnswers || 0}`
                                                        }
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="inline-block p-6 rounded-full bg-yellow-100">
                                                    <div className="text-lg font-semibold text-yellow-700 text-center">
                                                        {t('exam_not_graded') || 'Bài thi này chưa được chấm'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Test Info Section */}
                            {(finalTestName || finalTestType) && (
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {finalTestName && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    {t("test_name") || "Tên bài thi"}
                                                </label>
                                                <p className="text-base font-semibold text-gray-800">
                                                    {finalTestName}
                                                </p>
                                            </div>
                                        )}

                                        {finalTestType && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    {t("test_type") || "Loại bài thi"}
                                                </label>
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${finalTestType === 'English Listening'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {finalTestType}
                                                </span>
                                            </div>
                                        )}

                                        {/* {finalMaxScore !== undefined && finalMaxScore !== null && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    {t("max_score") || "Điểm tối đa"}
                                                </label>
                                                <p className="text-base font-semibold text-gray-800">
                                                    {finalMaxScore}
                                                </p>
                                            </div>
                                        )} */}
                                    </div>
                                </div>
                            )}

                            {/* Time Info Section */}
                            {(finalStartTime || finalEndTime) && (
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {finalStartTime && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    {t("start_time") || "Thời gian bắt đầu"}
                                                </label>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {new Date(finalStartTime).toLocaleString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        {finalEndTime && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    {t("end_time") || "Thời gian kết thúc"}
                                                </label>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {new Date(finalEndTime).toLocaleString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        {timeSpent && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    {t("time_spent") || "Thời gian làm bài"}
                                                </label>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {timeSpent}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Nút quay lại và phúc khảo */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={handleBackToScoreReport}
                        className="px-8 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        {t("back_to_score_report") || "Back to Score Report"}
                    </button>
                    {/* Hiển thị nút phúc khảo dựa trên điều kiện: status=true, isPassedOrFailed=false, canRequestEnquiry=true */}
                    {canShowAppealButton && (
                        <button
                            onClick={openAppealModal}
                            className="flex items-center gap-2 px-8 py-3 font-semibold text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            {t("request_appeal") || "Request Appeal"}
                        </button>
                    )}
                    {isAppealSubmitted && (
                        <div className="flex items-center gap-2 px-8 py-3 font-semibold text-green-700 bg-green-100 border border-green-300 rounded-lg">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            {t("appeal_submitted") || "Đã gửi yêu cầu phúc khảo"}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal xác nhận phúc khảo */}
            <AppealModal
                isOpen={isAppealModalOpen}
                onClose={closeAppealModal}
                onConfirm={handleConfirmAppeal}
                testSessionId={sessionData?.testSessionId}
            />
        </div>
    );
};

export default SpeakingReport;