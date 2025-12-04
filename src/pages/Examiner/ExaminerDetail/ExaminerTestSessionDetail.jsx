import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTestSessionById, getTestSessionAnswers, scoreTestSessionAnswers } from "../../../service/api";

const ExaminerTestSessionDetail = () => {
  const { testSessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testSessionData, setTestSessionData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [speakingScores, setSpeakingScores] = useState({});
  const [submittingSpeakingScores, setSubmittingSpeakingScores] = useState(false);
  const [speakingSubmitMessage, setSpeakingSubmitMessage] = useState("");
  const [speakingSubmitError, setSpeakingSubmitError] = useState("");
  const [speakingScoresLocked, setSpeakingScoresLocked] = useState(false);

  const {
    userFullName,
    userEmail,
    imgURL,
    testName,
    testType,
    startTime,
    endTime,
    totalScore,
    maxScore,
    status,
    totalAnswers,
    campaignRoundId,
    roundId,
  } = testSessionData || {};

  useEffect(() => {
    const fetchTestSession = async () => {
      if (!testSessionId) {
        setError("Không tìm thấy Test Session ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getTestSessionById(testSessionId);

        console.log("API Result:", result);
        console.log("Test Session ID:", testSessionId);

        if (result.success && result.data) {
          console.log("Test Session Data:", result.data);
          setTestSessionData(result.data);
        } else {
          console.error("API Error:", result.error);
          setError(result.error || "Không thể lấy thông tin bài làm");
        }
      } catch (err) {
        console.error("Error fetching test session:", err);
        setError(err.message || "Không thể lấy thông tin bài làm");
      } finally {
        setLoading(false);
      }
    };

    const fetchAnswers = async () => {
      if (!testSessionId) {
        return;
      }

      setLoadingAnswers(true);
      try {
        const result = await getTestSessionAnswers(testSessionId);

        console.log("Answers API Result:", result);

        if (result.success && result.data) {
          console.log("Answers Data:", result.data);
          // result.data có thể là array hoặc object, xử lý cả hai trường hợp
          if (Array.isArray(result.data)) {
            setAnswers(result.data);
          } else if (result.data && Array.isArray(result.data.answers)) {
            setAnswers(result.data.answers);
          } else {
            setAnswers([]);
          }
        } else {
          console.error("Answers API Error:", result.error);
          setAnswers([]);
        }
      } catch (err) {
        console.error("Error fetching answers:", err);
        setAnswers([]);
      } finally {
        setLoadingAnswers(false);
      }
    };

    fetchTestSession();
    fetchAnswers();
  }, [testSessionId]);

  const getAnswerKey = (answer, index) => {
    if (answer?.answerId) return `answer-${answer.answerId}`;
    if (answer?.questionId) return `question-${answer.questionId}`;
    return `index-${index}`;
  };

  const speakingCriteria = [
    { key: "pronunciation", label: "Pronunciation" },
    { key: "fluency", label: "Fluency" },
    { key: "grammar", label: "Grammar" },
  ];

  // Tỉ lệ điểm của từng tiêu chí trên tổng điểm câu hỏi
  // Pronunciation: 30%, Fluency: 30%, Grammar: 40%
  const speakingCriteriaWeights = {
    pronunciation: 0.3,
    fluency: 0.3,
    grammar: 0.4,
  };

  useEffect(() => {
    if (testType !== "EnglishSpeaking") {
      setSpeakingScores({});
      setSpeakingSubmitMessage("");
      setSpeakingSubmitError("");
      setSpeakingScoresLocked(false);
      return;
    }

    if (!answers || answers.length === 0) {
      setSpeakingScores({});
      setSpeakingSubmitMessage("");
      setSpeakingSubmitError("");
      setSpeakingScoresLocked(false);
      return;
    }

    setSpeakingScores((prevScores) => {
      const nextScores = {};
      answers.forEach((answer, index) => {
        const key = getAnswerKey(answer, index);
        nextScores[key] = {
          pronunciation:
            prevScores[key]?.pronunciation ??
            answer.pronunciationScore ??
            "",
          fluency:
            prevScores[key]?.fluency ?? answer.fluencyScore ?? "",
          grammar:
            prevScores[key]?.grammar ?? answer.grammarScore ?? "",
        };
      });
      return nextScores;
    });
  }, [answers, testType]);

  // Nếu bài nói đã được chấm (có totalScore > 0), khoá nút chấm điểm
  useEffect(() => {
    if (testType === "EnglishSpeaking" && (totalScore || 0) > 0) {
      setSpeakingScoresLocked(true);
    }
  }, [testType, totalScore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải thông tin bài làm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full p-6">
        <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Debug: Log testSessionData
  console.log("testSessionData:", testSessionData);
  console.log("testSessionData type:", typeof testSessionData);
  console.log("testSessionData keys:", testSessionData ? Object.keys(testSessionData) : "null");

  // Kiểm tra nếu không có data thì hiển thị thông báo
  if (!testSessionData || Object.keys(testSessionData).length === 0) {
    return (
      <div className="w-full h-full p-6 bg-gray-50">
        <div className="mb-6">
          <div className="flex items-center justify-between p-6 text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-xl">
            <div>
              <h1 className="text-2xl font-extrabold md:text-3xl">
                Chi tiết bài làm
              </h1>
              <p className="mt-1 text-sm text-white/90">
                Thông tin chi tiết về bài làm của ứng viên
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 transition-colors rounded-lg bg-white/20 hover:bg-white/30"
              aria-label="Quay lại"
              title="Quay lại"
            >
              Quay lại
            </button>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <p className="text-gray-600 mb-4">Không có dữ liệu để hiển thị</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Tính thời gian làm bài
  const calculateTimeSpent = () => {
    if (!startTime || !endTime) return "—";
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end - start;
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      return `${diffMins}:${String(diffSecs).padStart(2, "0")}`;
    } catch (e) {
      return "—";
    }
  };

  const handleSpeakingScoreChange = (answer, index, field, value) => {
    const key = getAnswerKey(answer, index);
    setSpeakingScores((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSubmitSpeakingScores = async () => {
    if (
      testType !== "EnglishSpeaking" ||
      answers.length === 0 ||
      submittingSpeakingScores ||
      speakingScoresLocked
    ) {
      return;
    }

    setSpeakingSubmitError("");
    setSpeakingSubmitMessage("");

    const answerScoresPayload = {};
    const validationErrors = [];

    answers.forEach((answer, index) => {
      if (!answer.answerId) {
        validationErrors.push(
          `Không tìm thấy answerId cho câu hỏi ${answer.questionId || index + 1
          }`
        );
        return;
      }

      const key = getAnswerKey(answer, index);
      const currentScores = speakingScores[key] || {};
      const criteriaScores = {};

      for (const { key: criteriaKey, label } of speakingCriteria) {
        const rawValue = currentScores[criteriaKey];
        if (rawValue === "" || rawValue === undefined || rawValue === null) {
          validationErrors.push(
            `Vui lòng nhập điểm ${label} cho câu hỏi ${answer.questionId || index + 1
            }`
          );
          continue;
        }

        const numericValue = Number(rawValue);
        if (Number.isNaN(numericValue) || numericValue < 0) {
          validationErrors.push(
            `Điểm ${label} phải là số không âm (câu hỏi ${answer.questionId || index + 1
            })`
          );
          continue;
        }

        // Giới hạn điểm mỗi tiêu chí theo % maxScore
        // Pronunciation 30%, Fluency 30%, Grammar 40%
        const weight = speakingCriteriaWeights[criteriaKey] || 0;
        const maxForCriteria = (answer.maxScore || 0) * weight;
        if (maxForCriteria > 0 && numericValue > maxForCriteria) {
          validationErrors.push(
            `Điểm ${label} tối đa là ${maxForCriteria} (câu hỏi ${answer.questionId || index + 1
            })`
          );
          continue;
        }

        criteriaScores[label] = numericValue;
      }

      if (Object.keys(criteriaScores).length === speakingCriteria.length) {
        const totalForAnswer = Object.values(criteriaScores).reduce(
          (sum, value) => sum + value,
          0
        );
        answerScoresPayload[answer.answerId] = {
          criteriaScores,
          isCorrect: totalForAnswer > 0,
        };
      }
    });

    if (validationErrors.length > 0) {
      setSpeakingSubmitError(validationErrors.join(". "));
      return;
    }

    if (Object.keys(answerScoresPayload).length === 0) {
      setSpeakingSubmitError("Không có dữ liệu hợp lệ để chấm điểm.");
      return;
    }

    setSubmittingSpeakingScores(true);
    try {
      const result = await scoreTestSessionAnswers({
        testSessionId,
        answerScores: answerScoresPayload,
      });

      if (!result.success) {
        throw new Error(result.error || "Chấm điểm thất bại");
      }

      setSpeakingSubmitMessage(result.message || "Chấm điểm thành công.");
      setSpeakingScoresLocked(true);

      const scoreListId = campaignRoundId || roundId;
      if (scoreListId) {
        setTimeout(() => {
          navigate(`/examiner/campaigns/${scoreListId}/score-list`);
        }, 800);
      } else {
        setTimeout(() => {
          navigate(-1);
        }, 800);
      }
    } catch (err) {
      console.error("Error scoring speaking answers:", err);
      setSpeakingSubmitError(err.message || "Không thể chấm điểm.");
    } finally {
      setSubmittingSpeakingScores(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="w-full h-full p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-6 text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-xl">
          <div>
            <h1 className="text-2xl font-extrabold md:text-3xl">
              Chi tiết bài làm
            </h1>
            <p className="mt-1 text-sm text-white/90">
              Thông tin chi tiết về bài làm của ứng viên
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 transition-colors rounded-lg bg-white/20 hover:bg-white/30"
            aria-label="Quay lại"
            title="Quay lại"
          >
            Quay lại
          </button>
        </div>
      </div>

      {/* Thông tin ứng viên */}
      <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin ứng viên
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-4">
            <div className="w-24 h-32 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              {imgURL ? (
                <img
                  src={imgURL}
                  alt={userFullName || "No name"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/96x128/cccccc/666666?text=No+Photo";
                  }}
                />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                  No Photo
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Họ và tên</p>
              <p className="mt-1 font-semibold text-gray-900">
                {userFullName || "—"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 font-semibold text-gray-900">
              {userEmail || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin bài kiểm tra */}
      <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin bài kiểm tra
        </h3>
        <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-gray-500">Tên bài kiểm tra:</p>
            <p className="mt-1 font-semibold text-gray-900">
              {testName || "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Loại bài kiểm tra:</p>
            <p className="mt-1 font-semibold text-gray-900">
              {testType || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Kết quả */}
      <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kết quả</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="inline-block p-6 rounded-full bg-indigo-100">
              <div className="text-3xl font-bold text-indigo-600">
                {maxScore > 0 ? `${totalScore}/${maxScore}` : totalScore || "—"}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">Điểm số</p>
          </div>
          <div>
            <p className="text-gray-500">Tổng số câu trả lời:</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {totalAnswers || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Trạng thái:</p>
            <p className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${status
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {status ? "Hoàn thành" : "Chưa hoàn thành"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-500">Thời gian làm bài:</p>
            <p className="mt-1 font-semibold text-gray-900">
              {calculateTimeSpent()}
            </p>
          </div>
        </div>
      </div>

      {/* Thời gian */}
      <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thời gian</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-gray-500">Thời gian bắt đầu:</p>
            <p className="mt-1 font-semibold text-gray-900">
              {formatDateTime(startTime)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Thời gian kết thúc:</p>
            <p className="mt-1 font-semibold text-gray-900">
              {formatDateTime(endTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách câu trả lời chi tiết */}
      <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Danh sách câu trả lời chi tiết
          </h3>
          {loadingAnswers && (
            <div className="w-5 h-5 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          )}
        </div>

        {loadingAnswers ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải danh sách câu trả lời...</p>
          </div>
        ) : answers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Chưa có câu trả lời nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer, index) => {
              const isEnglishSpeaking = testType === "EnglishSpeaking";
              const showCorrectness = !isEnglishSpeaking;
              const answerKey = getAnswerKey(answer, index);
              const scoreDraft = speakingScores[answerKey] || {};

              return (
                <div
                  key={answer.answerId || index}
                  className={`p-5 border rounded-xl ${isEnglishSpeaking
                    ? "bg-gray-50 border-gray-200"
                    : answer.isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-indigo-600 rounded-full">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {showCorrectness && (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${answer.isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {answer.isCorrect ? "Đúng" : "Sai"}
                        </span>
                      )}
                      <span className="px-3 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                        Điểm:{" "}
                        {answer.maxScore > 0
                          ? `${answer.score ?? 0}/${answer.maxScore}`
                          : answer.score ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Câu hỏi:
                    </p>
                    <p className="text-gray-900">{answer.questionContent || "—"}</p>
                  </div>

                  {/* Multiple Choice Answer */}
                  {answer.selectedOptionId && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Câu trả lời (Trắc nghiệm):
                      </p>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">
                          Option ID: {answer.selectedOptionId}
                        </p>
                        <p className="text-gray-900">
                          {answer.selectedOptionContent || "—"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Speaking Answer (Audio) */}
                  {answer.answerAudioFileURL && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Câu trả lời (Nói):
                      </p>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <audio
                          controls
                          className="w-full"
                          src={answer.answerAudioFileURL}
                        >
                          Trình duyệt của bạn không hỗ trợ phát audio.
                        </audio>
                      </div>
                    </div>
                  )}

                  {isEnglishSpeaking && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-800 mb-3">
                        Chấm điểm theo tiêu chí
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {speakingCriteria.map(({ key: field, label }) => (
                          <div key={field}>
                            <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                              {label}
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={scoreDraft[field] ?? ""}
                              onChange={(e) =>
                                handleSpeakingScoreChange(
                                  answer,
                                  index,
                                  field,
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm"
                              placeholder="Nhập điểm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {testType === "EnglishSpeaking" && answers.length > 0 && (
              <div className="pt-4 mt-6 border-t border-dashed border-gray-200">
                {speakingSubmitError && (
                  <p className="mb-3 text-sm text-red-600">
                    {speakingSubmitError}
                  </p>
                )}
                {speakingSubmitMessage && (
                  <p className="mb-3 text-sm text-green-600">
                    {speakingSubmitMessage}
                  </p>
                )}
                <button
                  onClick={handleSubmitSpeakingScores}
                  className="px-6 py-3 text-sm font-semibold text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={submittingSpeakingScores || speakingScoresLocked}
                >
                  {submittingSpeakingScores
                    ? "Đang chấm..."
                    : speakingScoresLocked
                      ? "Đã chấm điểm"
                      : "Chấm điểm"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExaminerTestSessionDetail;