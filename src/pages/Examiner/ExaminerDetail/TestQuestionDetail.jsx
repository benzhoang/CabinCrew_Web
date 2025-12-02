import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiMusic,
  FiPlay,
  FiPause,
} from "react-icons/fi";
import { getTestById, getTestQuestionsByTestId } from "../../../service/api2";

const TestTypeBadge = ({ testType }) => {
  if (!testType) return null;

  const map = {
    1: { cls: "bg-cyan-100 text-cyan-700", text: "English Listening" },
    2: { cls: "bg-pink-100 text-pink-700", text: "English Speaking" },
    3: { cls: "bg-emerald-100 text-emerald-700", text: "Practical" },
  };

  const cfg = map[testType] || {
    cls: "bg-gray-100 text-gray-700",
    text: testType,
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${cfg.cls}`}
    >
      {cfg.text}
    </span>
  );
};

const Section = ({ title, children }) => (
  <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
    <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-4 mb-4">
    <div className="w-40 text-sm font-medium text-gray-600 shrink-0">
      {label}
    </div>
    <div className="flex-1 text-sm text-gray-900">{value || "—"}</div>
  </div>
);

const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const fileName = audioUrl ? audioUrl.split("/").pop() : "Unknown";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const currentTime = audio.currentTime;
      const total = audio.duration || 0;
      setProgress(total ? (currentTime / total) * 100 : 0);
    };

    const setAudioDuration = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setAudioDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const seekPercentage = Number(e.target.value);
    const seekTime = (seekPercentage / 100) * (audio.duration || 0);
    audio.currentTime = seekTime;
    setProgress(seekPercentage);
  };

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FiMusic className="w-5 h-5 text-gray-500" />
        <span className="max-w-md text-sm text-gray-900 truncate">
          {fileName}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlayPause}
          className="p-2 text-white transition-colors bg-indigo-600 rounded-full hover:bg-indigo-700"
        >
          {isPlaying ? (
            <FiPause className="w-5 h-5" />
          ) : (
            <FiPlay className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between mt-1 text-sm text-gray-600">
            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl} />
    </div>
  );
};

const TestQuestionDetail = () => {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [testData, setTestData] = useState(null);
  const [questionsData, setQuestionsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [testRes, questionRes] = await Promise.all([
          getTestById(testId),
          getTestQuestionsByTestId(testId, { forceRefresh: true }),
        ]);

        if (testRes.success) {
          setTestData(testRes.data);
        } else {
          setError(testRes.error || "Không thể tải chi tiết đề thi");
        }

        if (questionRes.success) {
          setQuestionsData(questionRes.data);
        } else {
          console.error("Lỗi khi tải câu hỏi:", questionRes.error);
        }
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu đề thi");
      } finally {
        setIsLoading(false);
        setIsLoadingQuestions(false);
      }
    };

    if (testId) {
      setIsLoadingQuestions(true);
      fetchData();
    }
  }, [testId]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <FiLoader className="w-12 h-12 text-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/examiner/testing")}
          className="flex items-center gap-2 mb-4 text-gray-600"
        >
          <FiArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <div className="p-6 border border-red-200 bg-red-50 rounded-xl">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!testData) return null;

  return (
    <div className="w-full h-full">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-6 text-white bg-gradient-to-r from-indigo-600 to-blue-600">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-extrabold md:text-3xl">
                {testData.testName}
              </h1>
              <TestTypeBadge testType={testData.testType} />
            </div>
            <p className="mt-1 text-sm text-white/90">
              Chi tiết đề thi và danh sách câu hỏi
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

      <div className="px-6">
        {/* MAIN CONTENT: chỉ bên trái giống TestDetailPage, không sidebar */}
        <div className="space-y-6">
          <Section title="Thông tin chung">
            <InfoRow label="Tên đề thi" value={testData.testName} />
            <InfoRow label="Mục đích" value={testData.purpose} />
            <InfoRow
              label="Loại đề thi"
              value={<TestTypeBadge testType={testData.testType} />}
            />
            <InfoRow label="Điểm tối đa" value={testData.maxScore} />
            <InfoRow
              label="Thời lượng"
              value={`${testData.durationInMinutes} phút`}
            />
          </Section>

          {testData.audioFileURL && (
            <Section title="File âm thanh">
              <AudioPlayer audioUrl={testData.audioFileURL} />
            </Section>
          )}

          {/* QUESTIONS */}
          <Section
            title={`Danh sách câu hỏi (${questionsData?.totalQuestions || 0})`}
          >
            {isLoadingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <FiLoader className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            ) : questionsData?.questions?.length > 0 ? (
              <div className="space-y-4">
                {questionsData.questions
                  .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0))
                  .map((q, index) => (
                    <div
                      key={q.questionId || index}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex items-center justify-center w-8 h-8 text-indigo-700 bg-indigo-100 rounded-full">
                          {q.orderNumber || index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium">{q.questionContent}</p>
                            {typeof q.score !== "undefined" && (
                              <span className="px-2 py-1 ml-4 text-sm bg-gray-100 rounded">
                                {q.score} điểm
                              </span>
                            )}
                          </div>

                          {q.options && q.options.length > 0 && (
                            <div className="mt-3 space-y-2 ml-11">
                              {q.options.map((op, i) => (
                                <div
                                  key={op.optionId || i}
                                  className={`flex items-start gap-2 p-2 rounded 
                                    ${
                                      op.isCorrect
                                        ? "bg-green-50 border border-green-200"
                                        : "bg-gray-50 border border-gray-200"
                                    }`}
                                >
                                  <span className="font-medium text-gray-600">
                                    {String.fromCharCode(65 + i)}.
                                  </span>
                                  <span
                                    className={`flex-1 ${
                                      op.isCorrect
                                        ? "text-green-800 font-medium"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {op.optionContent}
                                  </span>
                                  {op.isCorrect && (
                                    <span className="text-sm font-medium text-green-600">
                                      ✓ Đúng
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                Chưa có câu hỏi nào
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};

export default TestQuestionDetail;
