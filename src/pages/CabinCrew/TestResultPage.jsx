import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { t, onLangChange } from "../../i18n";
import { getMyPracticalSessions } from "../../service/api";

const TestResultPage = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [, setLangVersion] = useState(0);
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

        if (
          result.success &&
          result.data &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
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
            setError("Cannot find test results");
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
          setError("Cannot load test results");
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
  const finalTotalScore =
    totalScore !== undefined ? totalScore : apiData?.totalScore || 0;
  const finalMaxScore =
    maxScore !== undefined ? maxScore : apiData?.maxScore || 0;
  const finalExamInfo = examInfo || apiData?.examInfo || {};
  const finalUserFullName = apiData?.userFullName || "";
  const finalUserEmail = apiData?.userEmail || "";
  const finalImgURL = apiData?.imgURL || "";
  const finalTestName = finalExamInfo?.testName || "";
  const finalTestType = finalExamInfo?.testType || "";
  const finalStartTime = apiData?.startTime || "";
  const finalEndTime = apiData?.endTime || "";

  const safeScore = score !== undefined ? score : apiData?.score || 0;
  const safeTotalQuestions = totalQuestions || apiData?.totalQuestions || 0;

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
      apiData,
    });
  }, [
    finalUserFullName,
    finalUserEmail,
    finalImgURL,
    finalTestName,
    finalTestType,
    finalStartTime,
    finalEndTime,
    apiData,
  ]);

  const handleBackToTest = () => {
    navigate(`/cabin-crew/tests/${campaignId}`);
  };

  // Nếu đang loading, hiển thị loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">{t("loading") || "Loading..."}</p>
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
            {error || t("no_test_data") || "No test data. Redirecting..."}
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
            {t("exam_result_title") || "Test result"}
          </h1>
          <p className="text-gray-600">
            {finalExamInfo?.testName ||
              t("exam_result_subtitle") ||
              "View detailed test results"}
          </p>
        </div>

        {/* Kết quả chính */}
        <div className="p-6 mb-6 bg-white shadow-lg rounded-xl">
          <div className="space-y-6">
            {/* Điểm số lớn */}
            <div className="text-center">
              <div className="inline-block p-6 bg-green-100 rounded-full">
                <div className="text-5xl font-bold text-green-600">
                  {finalMaxScore > 0
                    ? `${finalTotalScore}/${finalMaxScore}`
                    : `${safeScore}/${safeTotalQuestions}`}
                </div>
              </div>
            </div>

            {/* Container chung cho tất cả thông tin */}
            <div className="max-w-3xl mx-auto space-y-6">
              {/* User Info Section */}
              {(finalImgURL || finalUserFullName || finalUserEmail) && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col items-center mb-4">
                    {finalImgURL && (
                      <img
                        src={finalImgURL}
                        alt="User Avatar"
                        className="object-cover w-20 h-20 mb-4 border-2 border-gray-300 rounded-full"
                        onError={(e) => {
                          console.error("Image load error:", finalImgURL);
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    {finalUserFullName && (
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-500">
                          {t("full_name") || "Full name"}
                        </label>
                        <p className="text-base font-semibold text-gray-800">
                          {finalUserFullName}
                        </p>
                      </div>
                    )}

                    {finalUserEmail && (
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-500">
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
                <div className="pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {finalTestName && (
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-500">
                          {t("test_name") || "Test name"}
                        </label>
                        <p className="text-base font-semibold text-gray-800">
                          {finalTestName}
                        </p>
                      </div>
                    )}

                    {finalTestType && (
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-500">
                          {t("test_type") || "Test type"}
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
                <div className="pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {finalStartTime && (
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-500">
                          {t("start_time") || "Start time"}
                        </label>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(finalStartTime).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}

                    {finalEndTime && (
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-500">
                          {t("end_time") || "End time"}
                        </label>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(finalEndTime).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}

                    {finalStartTime && finalEndTime && (
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-500">
                          {t("time_spent") || "Time spent"}
                        </label>
                        <p className="text-sm font-semibold text-gray-800">
                          {(() => {
                            const start = new Date(finalStartTime);
                            const end = new Date(finalEndTime);
                            const diffMs = end - start;
                            const diffMins = Math.floor(diffMs / 60000);
                            const diffSecs = Math.floor(
                              (diffMs % 60000) / 1000
                            );
                            return `${diffMins}:${String(diffSecs).padStart(
                              2,
                              "0"
                            )}`;
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
            onClick={handleBackToTest}
            className="px-8 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {t("back_to_test_list") || "Back to test list"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage;
