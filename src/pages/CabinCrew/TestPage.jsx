import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { t, onLangChange } from "../../i18n";
import { getExamQuestions } from "../../service/api2.js";
import ModalVerifySubmit from "../../components/CabinCrewComponent/ModalVerifySubmit";

const TestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: testIdFromParams, campaignId } = useParams();
  const resolvedTestId = testIdFromParams || location.state?.examId;

  const [questions, setQuestions] = useState([]);
  const [examData, setExamData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(1800); // default 30'
  const [, setLangVersion] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [startTime] = useState(Date.now()); // Lưu thời gian bắt đầu làm bài
  const [markedQuestions, setMarkedQuestions] = useState(new Set());

  // re-render on language change
  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  // Fetch exam questions
  useEffect(() => {
    const fetchExamQuestions = async () => {
      const testId = resolvedTestId;
      let joinCode = location.state?.examCode;

      if (!joinCode && testId) {
        joinCode = localStorage.getItem(`examCode_${testId}`);
      }

      if (!testId) {
        toast.error("Thiếu thông tin đề thi. Vui lòng thử lại.");
        navigate(`/cabin-crew/tests/${campaignId}`);
        return;
      }

      if (!joinCode) {
        toast.error("Thiếu mã đề thi. Vui lòng quay lại danh sách đề thi.");
        navigate(`/cabin-crew/tests/${campaignId}`);
        return;
      }

      try {
        setIsLoadingQuestions(true);
        console.log("Calling getExamQuestions with:", { testId, joinCode });
        const result = await getExamQuestions(testId, joinCode);
        console.log("API Result:", result);

        if (
          result?.data?.questions &&
          Array.isArray(result.data.questions) &&
          result.data.questions.length > 0
        ) {
          const data = result.data;
          setExamData({
            testId: data.testId,
            testName: data.testName,
            testType: data.testType,
            maxScore: data.maxScore,
            durationInMinutes: data.durationInMinutes,
            totalQuestions: data.totalQuestions,
          });

          const mappedQuestions = data.questions
            .map((question) => {
              const options =
                question.options?.map((option, index) => {
                  const optionKey = String.fromCharCode(65 + index);
                  return {
                    key: optionKey,
                    optionId: option.optionId,
                    label: `${optionKey}. ${option.optionContent}`,
                  };
                }) || [];

              return {
                id: question.questionId,
                question: question.questionContent,
                options,
                score: question.score,
                orderNumber: question.orderNumber,
              };
            })
            .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));

          setQuestions(mappedQuestions);
          if (data.durationInMinutes) {
            setTimeRemaining(data.durationInMinutes * 60);
          }
        } else {
          toast.error(result?.error || "Không thể tải câu hỏi đề thi");
          navigate(`/cabin-crew/tests/${testId}`);
        }
      } catch (error) {
        console.error("Error fetch exam questions:", error);
        toast.error("Đã xảy ra lỗi khi tải câu hỏi đề thi");
        navigate(`/cabin-crew/tests/${testIdFromParams || ""}`);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchExamQuestions();
  }, [resolvedTestId, location.state, navigate, testIdFromParams, campaignId]);

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
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Calculate progress percentage - chỉ tính các câu đã được trả lời
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
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

  // Toggle đánh dấu câu hỏi
  const toggleMarkQuestion = (questionId) => {
    setMarkedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  if (isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">
            {t("loading") || "Đang tải câu hỏi..."}
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">
            {t("no_questions") || "Không có câu hỏi để hiển thị."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-100">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Ô lớn - Hiển thị câu hỏi */}
          <div className="lg:col-span-3">
            <div className="p-8 bg-white shadow-lg rounded-xl">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {t("question") || "Câu hỏi"} {currentQuestionIndex + 1} /{" "}
                    {totalQuestions}
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleMarkQuestion(currentQuestion.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        markedQuestions.has(currentQuestion.id)
                          ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={
                        markedQuestions.has(currentQuestion.id)
                          ? t("unmark_question") || "Bỏ đánh dấu"
                          : t("mark_question") || "Đánh dấu câu hỏi"
                      }
                    >
                      <svg
                        className="w-5 h-5"
                        fill={
                          markedQuestions.has(currentQuestion.id)
                            ? "currentColor"
                            : "none"
                        }
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                    <span className="text-sm text-gray-500">
                      {currentAnswer
                        ? t("answered") || "Đã trả lời"
                        : t("not_answered") || "Chưa trả lời"}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Nội dung câu hỏi */}
              <div className="mb-6">
                <p className="mb-4 text-lg font-semibold text-gray-800">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Các lựa chọn */}
              <div className="mb-8">
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentAnswer === option.key;
                    return (
                      <label
                        key={option.optionId}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option.key}
                          checked={isSelected}
                          onChange={() =>
                            handleAnswerSelect(currentQuestion.id, option.key)
                          }
                          className="w-5 h-5 mr-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Nút điều hướng */}
              <div className="flex items-center justify-between pt-6 border-t">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("previous") || "Câu trước"}
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("next") || "Câu sau"}
                </button>
              </div>
            </div>
          </div>

          {/* Ô nhỏ - Số câu hỏi, thời gian, thanh tiến trình */}
          <div className="lg:col-span-1">
            <div className="sticky p-6 bg-white shadow-lg rounded-xl top-8">
              {/* Thời gian */}
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  {t("time_remaining") || "Thời gian còn lại"}
                </h3>
                <div
                  className={`text-2xl font-bold ${
                    timeRemaining < 300 ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </div>
              </div>

              {/* Thanh tiến trình */}
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  {t("progress") || "Tiến trình"}
                </h3>
                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div
                    className="h-3 transition-all duration-300 bg-green-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-center text-gray-500">
                  {answeredCount} / {totalQuestions}{" "}
                  {t("questions") || "câu hỏi"} {t("answered") || "đã trả lời"}
                </p>
              </div>

              {/* Danh sách số câu hỏi */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                  {t("question_list") || "Danh sách câu hỏi"}
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
                        className={`relative w-full h-10 rounded-lg font-semibold text-sm transition-all ${
                          isCurrent
                            ? "bg-blue-600 text-white ring-2 ring-blue-300"
                            : isAnswered
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                        {isMarked && (
                          <svg
                            className="absolute top-0 right-0 w-4 h-4 text-yellow-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            style={{ transform: "translate(25%, -25%)" }}
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
                onClick={() => {
                  if (!hasSubmitted) {
                    setShowSubmitModal(true);
                  }
                }}
                disabled={hasSubmitted}
                className={`w-full mt-6 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  hasSubmitted
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {hasSubmitted
                  ? t("submitted") || "Đã nộp bài"
                  : t("submit_exam") || "Nộp bài"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <ModalVerifySubmit
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        answers={answers}
        questions={questions}
        startTime={startTime}
        testId={examData?.testId || resolvedTestId}
        examInfo={examData}
        navigateTo={`/cabin-crew/test-result/${
          examData?.testId || resolvedTestId
        }`}
        onSubmitted={() => setHasSubmitted(true)}
      />
    </div>
  );
};

export default TestPage;
