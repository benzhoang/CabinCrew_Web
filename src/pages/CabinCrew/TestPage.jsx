import { useState, useEffect } from "react";
import { t, onLangChange } from "../../i18n";
import ModalVerifySubmit from "../../components/CabinCrewComponent/ModalVerifySubmit";

// Mock data - Listening test với câu hỏi tiếng Anh
const mockQuestions = [
  {
    id: 1,
    question: "Khi hành khách bị say máy bay, bước đầu tiên bạn nên làm gì?",
    options: [
      "A. Yêu cầu hành khách di chuyển đến ghế khác",
      "B. Cung cấp túi nôn và khăn giấy, đảm bảo không khí lưu thông",
      "C. Yêu cầu hành khách uống nhiều nước",
      "D. Báo cáo ngay với phi công",
    ],
    correctAnswer: "B",
  },
  {
    id: 2,
    question: "Trong tình huống khẩn cấp, thứ tự ưu tiên sơ tán là gì?",
    options: [
      "A. Trẻ em, phụ nữ có thai, người cao tuổi, người khuyết tật, sau đó đến hành khách khác",
      "B. Hành khách VIP trước, sau đó đến các hành khách khác",
      "C. Tất cả hành khách di tản cùng lúc",
      "D. Phi công và phi hành đoàn trước",
    ],
    correctAnswer: "B",
  },
  {
    id: 3,
    question:
      "Khi thăng bậc lên Senior Flight Attendant, kỹ năng nào quan trọng nhất?",
    options: [
      "A. Kỹ năng giao tiếp và xử lý tình huống",
      "B. Kiến thức về máy bay và thiết bị",
      "C. Kỹ năng lãnh đạo và quản lý đội ngũ",
      "D. Tất cả các kỹ năng trên đều quan trọng",
    ],
    correctAnswer: "B",
  },
  {
    id: 4,
    question: "Khi xử lý xung đột giữa hành khách, bạn nên:",
    options: [
      "A. Can thiệp ngay lập tức và yêu cầu họ dừng lại",
      "B. Quan sát tình huống, tiếp cận một cách bình tĩnh và tách hai bên ra",
      "C. Báo cáo cho phi công và để họ xử lý",
      "D. Yêu cầu hành khách tự giải quyết",
    ],
    correctAnswer: "B",
  },
  {
    id: 5,
    question: "Purser (Trưởng đoàn) có trách nhiệm chính là gì?",
    options: [
      "A. Chỉ quản lý đội ngũ cabin crew",
      "B. Quản lý đội ngũ, điều phối dịch vụ hành khách và đảm bảo an toàn",
      "C. Chỉ phục vụ hành khách hạng nhất",
      "D. Chỉ báo cáo cho phi công",
    ],
    correctAnswer: "B",
  },
];

const TestPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 phút = 1800 giây
  const [, setLangVersion] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
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
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Calculate progress percentage - chỉ tính các câu đã được trả lời
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / mockQuestions.length) * 100;

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

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

  const currentQuestion = mockQuestions[currentQuestionIndex];
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
                    {t("question") || "Câu hỏi"} {currentQuestionIndex + 1} /{" "}
                    {mockQuestions.length}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {currentAnswer
                      ? t("answered") || "Đã trả lời"
                      : t("not_answered") || "Chưa trả lời"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Nội dung câu hỏi */}
              <div className="mb-6">
                <p className="text-lg font-semibold text-gray-800 mb-4">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Các lựa chọn */}
              <div className="mb-8">
                
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const optionKey = String.fromCharCode(65 + index); // A, B, C, D
                    const isSelected = currentAnswer === optionKey;

                    return (
                      <label
                        key={index}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={optionKey}
                          checked={isSelected}
                          onChange={() =>
                            handleAnswerSelect(currentQuestion.id, optionKey)
                          }
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
                  {t("previous") || "Câu trước"}
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === mockQuestions.length - 1}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("next") || "Câu sau"}
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
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {t("progress") || "Tiến trình"}
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {answeredCount} / {mockQuestions.length}{" "}
                  {t("questions") || "câu hỏi"} {t("answered") || "đã trả lời"}
                </p>
              </div>

              {/* Danh sách số câu hỏi */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {t("question_list") || "Danh sách câu hỏi"}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {mockQuestions.map((question, index) => {
                    const isCurrent = index === currentQuestionIndex;
                    const isAnswered = answers[question.id];

                    return (
                      <button
                        key={question.id}
                        onClick={() => handleQuestionClick(index)}
                        className={`w-full h-10 rounded-lg font-semibold text-sm transition-all ${
                          isCurrent
                            ? "bg-blue-600 text-white ring-2 ring-blue-300"
                            : isAnswered
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                onClick={() => {
                  setShowSubmitModal(true);
                }}
                className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                {t("submit_exam") || "Nộp bài"}
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
        questions={mockQuestions}
        startTime={startTime}
        navigateTo="/cabin-crew/test-result"
      />
    </div>
  );
};

export default TestPage;
