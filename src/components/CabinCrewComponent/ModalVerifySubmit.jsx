import { useNavigate } from "react-router-dom";
import { t } from "../../i18n";

const ModalVerifySubmit = ({
  isOpen,
  onClose,
  onSubmit,
  answers,
  questions,
  startTime,
  navigateTo,
}) => {
  const navigate = useNavigate();

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

  const handleConfirm = () => {
    // Tính điểm
    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unansweredQuestions = 0;

    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (
        userAnswer === undefined ||
        userAnswer === null ||
        userAnswer === ""
      ) {
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
    const timeSpent = `${timeSpentMinutes}:${String(timeSpentSeconds).padStart(
      2,
      "0"
    )}`;

    // Handle submit logic
    if (onSubmit) {
      onSubmit({
        score,
        totalQuestions: questions.length,
        correctAnswers,
        wrongAnswers,
        unansweredQuestions,
        answers,
        questions,
        timeSpent,
      });
    } else if (navigateTo) {
      // Chuyển đến trang kết quả với dữ liệu
      navigate(navigateTo, {
        state: {
          score,
          totalQuestions: questions.length,
          correctAnswers,
          wrongAnswers,
          unansweredQuestions,
          answers,
          questions,
          timeSpent,
        },
      });
    } else {
      console.log("Answers:", answers);
      navigate("/cabin-crew/tests");
    }
    onClose();
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
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            {t("Nộp bài") || "Nộp bài"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalVerifySubmit;
