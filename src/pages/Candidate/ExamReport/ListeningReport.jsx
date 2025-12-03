import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { t, onLangChange } from '../../../i18n';
import { toast } from "react-toastify";
import AppealModal from '../../../components/AppealModal';
import { getMyListeningSessions } from "../../../service/api";

const ListeningReport = () => {
    const { id: testId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [, setLangVersion] = useState(0);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [isAppealSubmitted, setIsAppealSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [apiData, setApiData] = useState(null);
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

    // Load dữ liệu từ API
    useEffect(() => {
        const loadListeningSessions = async () => {
            try {
                setIsLoading(true);
                const result = await getMyListeningSessions();

                console.log("API Result getMyListeningSessions:", result);

                if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
                    // Tìm session có testId phù hợp với testId từ URL params hoặc examId từ state
                    const targetTestId = testId || examId;
                    let selectedSession = null;

                    if (targetTestId) {
                        selectedSession = result.data.find(
                            (session) => session.testId?.toString() === targetTestId.toString()
                        );
                    }

                    // Nếu không tìm thấy, lấy session mới nhất
                    if (!selectedSession) {
                        selectedSession = result.data[0];
                    }

                    console.log("Selected Session:", selectedSession);

                    // Map dữ liệu từ API sang format của component
                    const mappedData = {
                        score: selectedSession.totalScore || score || 0,
                        totalQuestions: selectedSession.totalAnswers || 0,
                        totalScore: selectedSession.totalScore || score || 0,
                        maxScore: selectedSession.maxScore || maxScore || 0,
                        userFullName: selectedSession.userFullName || "",
                        userEmail: selectedSession.userEmail || "",
                        imgURL: selectedSession.imgURL || "",
                        examInfo: {
                            testName: selectedSession.testName || examName || "",
                            testType: selectedSession.testType || examType || "EnglishListening",
                            testId: selectedSession.testId || testId || 0,
                        },
                        startTime: selectedSession.startTime,
                        endTime: selectedSession.endTime,
                        status: selectedSession.status,
                        testSessionId: selectedSession.testSessionId,
                    };

                    console.log("Mapped Data:", mappedData);
                    setApiData(mappedData);
                    setIsLoading(false);
                } else {
                    setError(result.error || "Không tìm thấy kết quả bài thi");
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Error loading listening sessions:", err);
                setError("Không thể tải kết quả bài thi");
                setIsLoading(false);
            }
        };

        loadListeningSessions();
    }, [testId, examId, examName, examType, score, maxScore]);

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
        console.log("Appeal reason:", appealReason);
        setIsAppealSubmitted(true);
        setIsAppealModalOpen(false);
        toast.success(
            t("appeal_submitted_success") ||
            "Yêu cầu phúc khảo đã được gửi thành công!"
        );
    };

    // Nếu đang loading, hiển thị loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-100">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">{t("loading") || "Đang tải..."}</p>
                </div>
            </div>
        );
    }

    // Nếu không có dữ liệu, hiển thị thông báo
    if (!apiData && !isLoading) {
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

    const finalTotalScore = apiData?.totalScore || 0;
    const finalMaxScore = apiData?.maxScore || 0;
    const finalExamInfo = apiData?.examInfo || {};
    const finalUserFullName = apiData?.userFullName || "";
    const finalUserEmail = apiData?.userEmail || "";
    const finalImgURL = apiData?.imgURL || "";
    const finalTestName = finalExamInfo?.testName || "";
    const finalTestType = finalExamInfo?.testType || "";
    const finalStartTime = apiData?.startTime || "";
    const finalEndTime = apiData?.endTime || "";

    return (
        <div className="min-h-screen px-4 py-8 bg-gray-100">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-gray-800">
                        {t("exam_report_title") || "Báo cáo kết quả bài thi"}
                    </h1>
                    <p className="text-gray-600">
                        {finalTestName ||
                            t("exam_report_subtitle") ||
                            "Xem chi tiết kết quả bài thi của bạn"}
                    </p>
                </div>

                {/* Kết quả chính */}
                <div className="p-6 mb-6 bg-white shadow-lg rounded-xl">
                    <div className="space-y-6">
                        <div className="max-w-3xl mx-auto space-y-6">
                            {/* User Info Section */}
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
                                        <div className="inline-block p-6 rounded-full bg-blue-100">
                                            <div className="text-4xl font-bold text-blue-600">
                                                {finalMaxScore > 0
                                                    ? `${finalTotalScore}/${finalMaxScore}`
                                                    : `${finalTotalScore}`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                                <p className="text-base font-semibold text-gray-800">
                                                    {finalTestType}
                                                </p>
                                            </div>
                                        )}
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

                                        {finalStartTime && finalEndTime && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    {t("time_spent") || "Thời gian làm bài"}
                                                </label>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {(() => {
                                                        const start = new Date(finalStartTime);
                                                        const end = new Date(finalEndTime);
                                                        const diffMs = end - start;
                                                        const diffMins = Math.floor(diffMs / 60000);
                                                        const diffSecs = Math.floor((diffMs % 60000) / 1000);
                                                        return `${diffMins}:${String(diffSecs).padStart(2, '0')}`;
                                                    })()}
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
                        {t("back_to_score_report") || "Quay lại báo cáo điểm số"}
                    </button>
                    {!isAppealSubmitted && (
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
                            {t("request_appeal") || "Yêu cầu phúc khảo"}
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
                testSessionId={apiData?.testSessionId}
            />
        </div>
    );
};

export default ListeningReport;

