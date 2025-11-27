import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { t, onLangChange } from "../../../i18n";
import { getExamQuestions, submitSpeakingExam } from "../../../service/api";
import AudioRecorder from "./AudioRecorder";

const SpeakingExam = ({ examInfo }) => {
  const navigate = useNavigate();
  const { id: testIdFromUrl } = useParams(); // Lấy testId từ URL params
  const [questions, setQuestions] = useState([]); // Danh sách câu hỏi từ API
  const [examData, setExamData] = useState(null); // Thông tin đề thi từ API
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true); // Loading state khi fetch questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordings, setRecordings] = useState({}); // Lưu recordings cho mỗi câu hỏi
  const [timeRemaining, setTimeRemaining] = useState(
    examInfo?.duration ? examInfo.duration * 60 : 1800
  ); // Chuyển phút sang giây
  const [langVersion, setLangVersion] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [startTime] = useState(Date.now());
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        console.log("=== Fetch Speaking Exam Questions ===");
        console.log("testIdFromUrl:", testIdFromUrl);
        console.log("examInfo:", examInfo);
        console.log("testId:", testId);
        console.log("joinCode:", joinCode);

        if (!testId) {
          console.error("Missing testId:", { testId });
          toast.error("Thiếu thông tin đề thi. Vui lòng thử lại.");
          navigate("/test");
          return;
        }

        if (!joinCode) {
          console.error("Missing joinCode:", { joinCode });
          toast.error("Thiếu mã đề thi. Vui lòng quay lại và nhập mã đề thi.");
          navigate("/test");
          return;
        }

        console.log("Calling getExamQuestions with:", { testId, joinCode });
        const result = await getExamQuestions(testId, joinCode);
        console.log("API Result:", result);

        // Kiểm tra nếu có data (bất kể success flag)
        // Một số API trả về success: false nhưng vẫn có data hợp lệ
        if (
          result.data &&
          result.data.questions &&
          Array.isArray(result.data.questions) &&
          result.data.questions.length > 0
        ) {
          const data = result.data;
          console.log("API Data:", data);
          console.log("Questions count:", data.questions?.length || 0);

          // Lưu thông tin đề thi
          setExamData({
            testId: data.testId,
            testName: data.testName,
            testType: data.testType,
            maxScore: data.maxScore,
            durationInMinutes: data.durationInMinutes,
            audioFileURL: data.audioFileURL, // Speaking test có thể không có audioFileURL
            totalQuestions: data.totalQuestions,
          });

          // Map questions từ API sang format hiện tại
          // Speaking test: questions không có options (options = null)
          const mappedQuestions = (data.questions || []).map((q, index) => {
            return {
              id: q.questionId,
              question: q.questionContent,
              timeLimit: 120, // Default time limit, có thể lấy từ API nếu có
              description: q.questionContent, // Có thể thêm description riêng nếu API có
              score: q.score,
              orderNumber: q.orderNumber,
            };
          });

          // Sắp xếp theo orderNumber
          mappedQuestions.sort(
            (a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)
          );

          console.log("Mapped Questions:", mappedQuestions);
          setQuestions(mappedQuestions);

          // Cập nhật thời gian từ API
          if (data.durationInMinutes) {
            setTimeRemaining(data.durationInMinutes * 60);
          }

          toast.success(`Đã tải ${mappedQuestions.length} câu hỏi thành công`);
        } else {
          console.error("API Error:", result.error);
          toast.error(result.error || "Không thể tải câu hỏi đề thi");
          navigate("/test");
        }
      } catch (error) {
        console.error("Error fetching exam questions:", error);
        toast.error("Đã xảy ra lỗi khi tải câu hỏi đề thi");
        navigate("/test");
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchExamQuestions();
  }, [testIdFromUrl, examInfo, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
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

  // Callback khi recording hoàn thành
  const handleRecordingComplete = (questionId, recording) => {
    setRecordings((prev) => ({
      ...prev,
      [questionId]: recording,
    }));
  };

  // Callback khi xóa recording
  const handleDeleteRecording = (questionId) => {
    setRecordings((prev) => {
      const newRecordings = { ...prev };
      delete newRecordings[questionId];
      return newRecordings;
    });
  };

  // Callback khi nộp file ghi âm
  const handleSubmitRecording = (questionId, recording) => {
    // Có thể thêm logic xử lý nộp file ở đây (ví dụ: gọi API)
    console.log(`Đã nộp file ghi âm cho câu hỏi ${questionId}`, recording);
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
    if (isSubmitting) {
      return;
    }
    setIsSubmitModalOpen(true);
  };
  const closeSubmitModal = () => setIsSubmitModalOpen(false);

  const handleConfirmSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitModalOpen(false);

    try {
      const resolveTestId = () => {
        const candidates = [examData?.testId, examInfo?.examId, testIdFromUrl];

        for (const value of candidates) {
          if (value === undefined || value === null) continue;
          const parsed =
            typeof value === "string" ? parseInt(value, 10) : Number(value);
          if (!isNaN(parsed) && parsed > 0) {
            return parsed;
          }
        }

        return null;
      };

      const resolvedTestId = resolveTestId();

      if (!resolvedTestId) {
        toast.error("Thiếu thông tin đề thi. Vui lòng thử lại.");
        return;
      }

      if (!questions || questions.length === 0) {
        toast.error("Không tìm thấy câu hỏi. Vui lòng tải lại trang.");
        return;
      }

      const orderedRecordings = questions
        .map((question) => {
          const recording = recordings[question.id];
          if (!recording || !(recording.blob instanceof Blob)) {
            return null;
          }

          return {
            questionId: question.id,
            recording,
          };
        })
        .filter(Boolean);

      if (orderedRecordings.length === 0) {
        toast.error("Bạn chưa ghi âm câu trả lời nào.");
        return;
      }

      const startTimeISO = new Date(startTime).toISOString();
      const endTimeISO = new Date().toISOString();

      const apiAnswers = orderedRecordings.map((item, index) => ({
        questionId: Number(item.questionId),
        blob: item.recording.blob,
        fileName: `speaking_${resolvedTestId}_${item.questionId}_${
          item.recording.timestamp || Date.now()
        }_${index}.mp3`,
      }));

      toast.info("Đang nộp bài thi nói...", { autoClose: 2000 });
      setIsSubmitting(true);

      const result = await submitSpeakingExam({
        testId: resolvedTestId,
        startTime: startTimeISO,
        endTime: endTimeISO,
        answers: apiAnswers,
      });

      if (result.success) {
        const sessionData = result.data || {};
        const timeSpentMs = Date.now() - startTime;
        const timeSpentMinutes = Math.floor(timeSpentMs / 60000);
        const timeSpentSeconds = Math.floor((timeSpentMs % 60000) / 1000);
        const timeSpent = `${timeSpentMinutes}:${String(
          timeSpentSeconds
        ).padStart(2, "0")}`;
        const recordedCountForSubmit = apiAnswers.length;
        const unansweredCount = questions.length - recordedCountForSubmit;

        toast.success(result.message || "Nộp bài thi nói thành công");

        navigate(`/exam-result/${examData?.testId}`, {
          state: {
            examType: "Speaking",
            testSessionId: sessionData.testSessionId,
            score: sessionData.totalScore || 0,
            totalScore: sessionData.totalScore || 0,
            maxScore: sessionData.maxScore || examData?.maxScore,
            totalQuestions: sessionData.totalQuestions || questions.length,
            recordedCount: recordedCountForSubmit,
            unansweredCount,
            recordings,
            submittedAnswers: sessionData.submittedAnswers || [],
            questions: questions,
            timeSpent,
            examInfo: examData || examInfo,
            sessionData,
          },
        });
      } else {
        let errorMessage = "Không thể nộp bài thi nói. Vui lòng thử lại.";
        if (result.error) {
          errorMessage = result.error;
        } else if (result.errorData) {
          errorMessage =
            result.errorData.message ||
            result.errorData.errorMessage ||
            errorMessage;
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi nộp bài thi nói:", error);
      toast.error("Đã xảy ra lỗi khi nộp bài thi nói. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {t("loading") || "Đang tải câu hỏi..."}
          </p>
        </div>
      </div>
    );
  }

  // Nếu không có câu hỏi
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            {t("no_questions") || "Không có câu hỏi nào"}
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Không tìm thấy câu hỏi</p>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(recordings).length;
  const progress =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

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
                    {t("speaking_test") || "Bài thi nói"} -{" "}
                    {t("question") || "Câu hỏi"} {currentQuestionIndex + 1} /{" "}
                    {questions.length}
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
                      {recordings[currentQuestion.id]
                        ? t("recorded") || "Đã ghi âm"
                        : t("not_recorded") || "Chưa ghi âm"}
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

              {/* Câu hỏi */}
              <div className="mb-8">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {t("question") || "Câu hỏi"}:
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed mb-2">
                    {currentQuestion.question}
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    {currentQuestion.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {t("time_limit") || "Thời gian giới hạn"}:{" "}
                      {formatTime(currentQuestion.timeLimit)}
                    </span>
                  </div>
                </div>

                {/* Recording Controls - Sử dụng component AudioRecorder */}
                <AudioRecorder
                  questionId={currentQuestion.id}
                  existingRecording={recordings[currentQuestion.id]}
                  onRecordingComplete={handleRecordingComplete}
                  onDelete={handleDeleteRecording}
                  onSubmit={handleSubmitRecording}
                />
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
                  disabled={currentQuestionIndex === questions.length - 1}
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
                  {answeredCount} / {questions.length}{" "}
                  {t("questions") || "câu hỏi"} {t("recorded") || "đã ghi âm"}
                </p>
              </div>

              {/* Danh sách số câu hỏi */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {t("question_list") || "Danh sách câu hỏi"}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {questions.map((question, index) => {
                    const isCurrent = index === currentQuestionIndex;
                    const isRecorded = recordings[question.id];
                    const isMarked = markedQuestions.has(question.id);

                    return (
                      <button
                        key={question.id}
                        onClick={() => handleQuestionClick(index)}
                        className={`relative w-full h-10 rounded-lg font-semibold text-sm transition-all ${
                          isCurrent
                            ? "bg-blue-600 text-white ring-2 ring-blue-300"
                            : isRecorded
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
                onClick={openSubmitModal}
                disabled={isSubmitting}
                className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? t("submitting_exam") || "Đang nộp..."
                  : t("submit_exam") || "Nộp bài"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận nộp bài */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeSubmitModal}
          ></div>
          <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl p-6">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t("submit_exam") || "Nộp bài"}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {t("submit_confirm") || "Bạn có chắc chắn muốn nộp bài?"}
                </p>
                {questions.length - answeredCount > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 font-medium">
                      ⚠️ {t("unrecorded_questions") || "Số câu hỏi chưa ghi âm"}
                      :{" "}
                      <span className="font-bold text-amber-900">
                        {questions.length - answeredCount}
                      </span>{" "}
                      {t("questions") || "câu"}
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
                {t("cancel") || "Hủy"}
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? t("submitting_exam") || "Đang nộp..."
                  : t("submit_exam") || "Nộp bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakingExam;
