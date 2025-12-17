import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { t } from "../../i18n";
import { submitMultipleChoiceTest } from "../../service/api2.js";

const ModalVerifySubmit = ({
  isOpen,
  onClose,
  answers,
  questions,
  startTime,
  navigateTo,
  testId,
  examInfo,
  onSubmitted,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Tính số câu chưa làm
  const getUnansweredCount = () => {
    let count = 0;
    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (
        userAnswer === undefined ||
        userAnswer === null ||
        userAnswer === ""
      ) {
        count++;
      }
    });
    return count;
  };

  const unansweredCount = getUnansweredCount();
  const hasUnanswered = unansweredCount > 0;

  const handleConfirm = async () => {
    if (isSubmitting) return;

    const answersArray = [];
    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (userAnswer === undefined || userAnswer === null) {
        return;
      }
      const selectedOption = question.options?.find(
        (opt) => opt.key === userAnswer
      );
      if (selectedOption?.optionId) {
        const questionIdNum =
          typeof question.id === "string"
            ? parseInt(question.id, 10)
            : Number(question.id);
        const optionIdNum =
          typeof selectedOption.optionId === "string"
            ? parseInt(selectedOption.optionId, 10)
            : Number(selectedOption.optionId);
        if (!isNaN(questionIdNum) && !isNaN(optionIdNum)) {
          answersArray.push({
            questionId: questionIdNum,
            selectedOptionId: optionIdNum,
          });
        }
      }
    });

    if (answersArray.length === 0) {
      const confirmEmpty = window.confirm(
        t("submit_no_answers_warning") ||
        "Bạn chưa trả lời câu hỏi nào. Bạn vẫn muốn nộp bài?"
      );
      if (!confirmEmpty) {
        return;
      }
    }

    const testIdNum =
      typeof testId === "string" ? parseInt(testId, 10) : Number(testId);
    if (isNaN(testIdNum) || testIdNum <= 0) {
      toast.error("Test ID không hợp lệ");
      return;
    }

    const endTime = Date.now();
    const startTimeISO = new Date(startTime).toISOString();
    const endTimeISO = new Date(endTime).toISOString();

    const timeSpentMs = endTime - startTime;
    const timeSpentMinutes = Math.floor(timeSpentMs / 60000);
    const timeSpentSeconds = Math.floor((timeSpentMs % 60000) / 1000);
    const timeSpent = `${timeSpentMinutes}:${String(timeSpentSeconds).padStart(
      2,
      "0"
    )}`;

    setIsSubmitting(true);
    const toastId = "submitting-exam";
    toast.info(t("submitting_exam") || "Submitting exam...", { toastId });

    try {
      const result = await submitMultipleChoiceTest(
        testIdNum,
        startTimeISO,
        endTimeISO,
        answersArray
      );

      toast.dismiss(toastId);

      if (result.success) {
        const responseData = result.data || {};
        let correctAnswers = 0;
        let wrongAnswers = 0;

        if (
          responseData.submittedAnswers &&
          Array.isArray(responseData.submittedAnswers)
        ) {
          responseData.submittedAnswers.forEach((submitted) => {
            if (submitted.isCorrect) {
              correctAnswers++;
            } else {
              wrongAnswers++;
            }
          });
        } else if (typeof responseData.correctAnswers === "number") {
          correctAnswers = responseData.correctAnswers;
        }

        if (wrongAnswers === 0) {
          wrongAnswers = answersArray.length - correctAnswers;
        }

        const unansweredQuestions = questions.length - answersArray.length;
        const targetPath = navigateTo || "/cabin-crew/tests";

        navigate(targetPath, {
          replace: true,
          state: {
            score: correctAnswers,
            totalQuestions: questions.length,
            correctAnswers,
            wrongAnswers: Math.max(wrongAnswers, 0),
            unansweredQuestions: Math.max(unansweredQuestions, 0),
            answers,
            questions,
            timeSpent,
            submittedAnswers: responseData.submittedAnswers || [],
            examInfo: examInfo || null,
            totalScore: responseData.totalScore,
            maxScore:
              responseData.maxScore || examInfo?.maxScore || questions.length,
            testSessionId: responseData.testSessionId,
            startTime: responseData.startTime || startTimeISO,
            endTime: responseData.endTime || endTimeISO,
            status: responseData.status,
          },
        });

        if (onSubmitted) {
          onSubmitted();
        }

        toast.success(
          result.message || t("submit_success") || "Submit exam successfully"
        );
        onClose();
      } else {
        toast.error(
          result.error || t("submit_exam_failed") || "Không thể nộp bài"
        );
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi khi nộp bài";
      toast.dismiss(toastId);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative z-10 w-full max-w-md p-6 mx-4 bg-white shadow-2xl rounded-xl">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              {t("submit_exam") || "Nộp bài"}
            </h3>
            <p className="text-sm text-gray-600">
              {t("submit_confirm") || "Bạn có chắc chắn muốn nộp bài?"}
            </p>
          </div>
        </div>

        {/* Cảnh báo câu chưa làm */}
        {hasUnanswered && (
          <div className="p-3 mt-3 border rounded-lg bg-amber-50 border-amber-200">
            <p className="text-sm font-medium text-amber-800">
              ⚠️ {t("unanswered_questions") || "Số câu hỏi chưa làm"}:{" "}
              <span className="font-bold text-amber-900">
                {unansweredCount}
              </span>{" "}
              {t("questions") || "câu"}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t("Hủy") || "Hủy"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded-lg ${isSubmitting
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {isSubmitting
              ? t("submitting_exam") || "Submitting exam..."
              : t("Nộp bài") || "Nộp bài"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalVerifySubmit;
