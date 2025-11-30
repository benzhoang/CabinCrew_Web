import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { t, onLangChange } from "../../i18n";
import { toast } from "react-toastify";
import AppealModal from "../../components/CabinCrewComponent/AppealModal";
import { getMyPracticalSessions } from "../../service/api";

const TestResultPage = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [, setLangVersion] = useState(0);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [isAppealSubmitted, setIsAppealSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);

  // Lấy dữ liệu từ location state
  const {
    score,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unansweredQuestions,
    answers,
    questions,
    timeSpent,
    submittedAnswers,
    examInfo,
    totalScore,
    maxScore,
    testId: stateTestId,
  } = location.state || {};

  // re-render on language change
  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  // Load dữ liệu từ API
  useEffect(() => {
    const loadPracticalSessions = async () => {
      try {
        setIsLoading(true);
        const result = await getMyPracticalSessions();

        console.log("API Result:", result);

        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          // Lấy session mới nhất hoặc session có testId phù hợp với campaignId
          let selectedSession = result.data[0]; // Mặc định lấy session đầu tiên

          // Nếu có campaignId trong URL params, tìm session phù hợp
          if (campaignId) {
            const matchingSession = result.data.find(
              (session) => session.testId?.toString() === campaignId.toString()
            );
            if (matchingSession) {
              selectedSession = matchingSession;
            }
          }

          console.log("Selected Session:", selectedSession);

          // Map dữ liệu từ API sang format của component
          const mappedData = {
            score: selectedSession.totalScore || 0,
            totalQuestions: selectedSession.totalAnswers || 0,
            totalScore: selectedSession.totalScore || 0,
            maxScore: selectedSession.maxScore || 0,
            userFullName: selectedSession.userFullName || "",
            userEmail: selectedSession.userEmail || "",
            imgURL: selectedSession.imgURL || "",
            examInfo: {
              testName: selectedSession.testName || "",
              testType: selectedSession.testType || "",
              testId: selectedSession.testId || 0,
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
          // Nếu có location.state, vẫn cho phép hiển thị
          if (location.state && score !== undefined) {
            setIsLoading(false);
          } else {
            // Không có dữ liệu từ API, chuyển về trang test
            setError("Không tìm thấy kết quả bài thi");
            setTimeout(() => {
              navigate("/cabin-crew/tests");
            }, 2000);
          }
        }
      } catch (err) {
        console.error("Error loading practical sessions:", err);
        // Nếu có location.state, vẫn cho phép hiển thị
        if (location.state && score !== undefined) {
          setIsLoading(false);
        } else {
          setError("Không thể tải kết quả bài thi");
          setTimeout(() => {
            navigate("/cabin-crew/tests");
          }, 2000);
        }
      }
    };

    loadPracticalSessions();
  }, [location.state, score, navigate, campaignId]);

  // Debug: Log apiData khi nó thay đổi
  useEffect(() => {
    console.log("apiData updated:", apiData);
  }, [apiData]);

  // Ưu tiên dữ liệu từ location.state, nếu không có thì dùng từ API
  const finalTotalScore = totalScore !== undefined ? totalScore : (apiData?.totalScore || 0);
  const finalMaxScore = maxScore !== undefined ? maxScore : (apiData?.maxScore || 0);
  const finalExamInfo = examInfo || apiData?.examInfo || {};
  const finalUserFullName = apiData?.userFullName || "";
  const finalUserEmail = apiData?.userEmail || "";
  const finalImgURL = apiData?.imgURL || "";
  const finalTestName = finalExamInfo?.testName || "";
  const finalTestType = finalExamInfo?.testType || "";
  const finalStartTime = apiData?.startTime || "";
  const finalEndTime = apiData?.endTime || "";

  const safeScore = score !== undefined ? score : (apiData?.score || 0);
  const safeTotalQuestions = totalQuestions || (apiData?.totalQuestions || 0);

  // Debug: Log các giá trị final
  useEffect(() => {
    console.log("Final values:", {
      finalUserFullName,
      finalUserEmail,
      finalImgURL,
      finalTestName,
      finalTestType,
      finalStartTime,
      finalEndTime,
      apiData
    });
  }, [finalUserFullName, finalUserEmail, finalImgURL, finalTestName, finalTestType, finalStartTime, finalEndTime, apiData]);

  const handleBackToTest = () => {
    navigate(`/cabin-crew/tests/${campaignId}`);
  };

  const openAppealModal = () => {
    setIsAppealModalOpen(true);
  };

  const closeAppealModal = () => {
    setIsAppealModalOpen(false);
  };

  const handleConfirmAppeal = (appealReason) => {
    // TODO: Gửi yêu cầu phúc khảo đến API với lý do (appealReason)
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

  // Nếu không có dữ liệu từ cả location.state và API, hiển thị thông báo
  if ((!location.state || score === undefined) && !apiData && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-100">
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            {error || t("no_test_data") || "Không có dữ liệu bài thi. Đang chuyển hướng..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            {t("exam_result_title") || "Kết quả bài thi"}
          </h1>
          <p className="text-gray-600">
            {finalExamInfo?.testName ||
              t("exam_result_subtitle") ||
              "Xem chi tiết kết quả bài thi của bạn"}
          </p>
        </div>

        {/* Kết quả chính */}
        <div className="p-6 mb-6 bg-white shadow-lg rounded-xl">
          <div className="space-y-6">
            {/* Điểm số lớn */}
            <div className="text-center">
              <div className="inline-block p-6 rounded-full bg-red-100">
                <div className="text-5xl font-bold text-red-600">
                  {finalMaxScore > 0
                    ? `${finalTotalScore}/${finalMaxScore}`
                    : `${safeScore}/${safeTotalQuestions}`
                  }
                </div>
              </div>
            </div>

            {/* Container chung cho tất cả thông tin */}
            <div className="max-w-3xl mx-auto space-y-6">
              {/* User Info Section */}
              {(finalImgURL || finalUserFullName || finalUserEmail) && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex flex-col items-center mb-4">
                    {finalImgURL && (
                      <img
                        src={finalImgURL}
                        alt="User Avatar"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 mb-4"
                        onError={(e) => {
                          console.error("Image load error:", finalImgURL);
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
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

        {/* Chi tiết từng câu hỏi */}
        {questions && answers && (
          <div className="p-8 bg-white shadow-lg rounded-xl">
            <h2 className="mb-6 text-xl font-bold text-gray-800">
              {t("detailed_results") || "Chi tiết kết quả"}
            </h2>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const submittedAnswer = submittedAnswers?.find(
                  (ans) => Number(ans.questionId) === Number(question.id)
                );
                const userAnswer =
                  answers[question.id] || submittedAnswer?.selectedOptionKey;
                const isCorrect =
                  typeof submittedAnswer?.isCorrect === "boolean"
                    ? submittedAnswer.isCorrect
                    : question.correctAnswer
                      ? userAnswer === question.correctAnswer
                      : false;
                const isAnswered =
                  userAnswer !== undefined &&
                  userAnswer !== null &&
                  userAnswer !== "";

                const mappedOptions =
                  question.options?.map((option, optIndex) => {
                    const optionKey =
                      option?.key || String.fromCharCode(65 + optIndex);
                    const optionLabel =
                      typeof option === "string"
                        ? option
                        : option?.label || option?.optionContent || "";
                    return {
                      key: optionKey,
                      label: optionLabel,
                    };
                  }) || [];

                return (
                  <div
                    key={question.id}
                    className={`border-2 rounded-lg p-4 ${isCorrect
                      ? "border-green-200 bg-green-50"
                      : isAnswered
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="mb-2 font-semibold text-gray-800">
                          {t("question") || "Câu hỏi"} {index + 1}:{" "}
                          {question.question}
                        </div>
                        <div className="space-y-2">
                          {mappedOptions.map((option) => {
                            const isUserAnswer = userAnswer === option.key;
                            const baseClasses = "flex items-center p-2 rounded";
                            const stateClasses = isUserAnswer
                              ? isCorrect
                                ? " bg-green-100 border border-green-300"
                                : " bg-red-100 border border-red-300"
                              : " bg-gray-50";

                            return (
                              <div
                                key={option.key}
                                className={`${baseClasses}${stateClasses}`}
                              >
                                <span className="mr-2 font-medium">
                                  {option.key}.
                                </span>
                                <span className="text-gray-700">
                                  {option.label}
                                </span>
                                {isUserAnswer && (
                                  <span className="ml-auto font-semibold">
                                    {isCorrect ? (
                                      <span className="text-green-600">
                                        ✓ {t("your_answer") || "Đáp án của bạn"}
                                      </span>
                                    ) : (
                                      <span className="text-red-600">
                                        ✗ {t("your_answer") || "Đáp án của bạn"}
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="ml-4">
                        {isCorrect ? (
                          <span className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-full">
                            ✓ {t("correct") || "Đúng"}
                          </span>
                        ) : isAnswered ? (
                          <span className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full">
                            ✗ {t("incorrect") || "Sai"}
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full">
                            {t("not_answered") || "Chưa trả lời"}
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
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleBackToTest}
            className="px-8 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {t("back_to_test_list") || "Quay lại danh sách bài thi"}
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

export default TestResultPage;
