import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiMusic,
  FiPlay,
  FiPause,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiPlusCircle,
} from "react-icons/fi";
import { getTestById, getTestQuestions } from "../../service/api";
import ImportQuestionModal from "./ModalTestQuestion/ImportQuestionModal";
import CreateQuestionModal from "./ModalTestQuestion/CreateQuestionModal";
import { formatDate3 } from "../../config/formatDate";

const TestTypeBadge = ({ testType }) => {
  if (!testType) return null;
  const map = {
    1: { cls: "bg-cyan-100 text-cyan-700", text: "EnglishListening" },
    2: { cls: "bg-pink-100 text-pink-700", text: "EnglishSpeaking" },
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
    const updateProgress = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration;
      setProgress((currentTime / duration) * 100 || 0);
    };
    const setAudioDuration = () => {
      setDuration(audio.duration);
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
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const seekPercentage = e.target.value;
    const seekTime = (seekPercentage / 100) * audio.duration;
    audio.currentTime = seekTime;
    setProgress(seekPercentage);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
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

const TestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [questionsData, setQuestionsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);
  const [showTestCode, setShowTestCode] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchTestDetail();
    fetchTestQuestions();
  }, [id]);

  const fetchTestDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTestById(id);
      if (response.success) setTestData(response.data);
      else setError(response.error || "Unable to load test detail");
    } catch (err) {
      setError(err.message || "An error occurred while loading test detail");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestQuestions = useCallback(
    async (forceRefresh = false) => {
      setIsLoadingQuestions(true);
      try {
        // Dùng timestamp mạnh + random để chắc chắn bypass cache
        const response = await getTestQuestions(id, {
          forceRefresh: true,
        });

        if (response.success) {
          setQuestionsData(response.data); // Cập nhật state mới hoàn toàn
          console.log("Danh sách câu hỏi đã được làm mới:", response.data);
        } else {
          console.error("Lỗi khi tải câu hỏi:", response.error);
        }
      } catch (err) {
        console.error("Exception khi fetch câu hỏi:", err);
      } finally {
        setIsLoadingQuestions(false);
      }
    },
    [id]
  );

  const getTestCode = () => testData.joinCode || `TEST-${testData.testId}`;
  const obscureTestCode = () => "••••••";

  const toggleShowTestCode = () => setShowTestCode(!showTestCode);

  const handleImportSuccess = useCallback(async () => {
    await fetchTestQuestions(true);
  }, [fetchTestQuestions]);

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
          Back
        </button>
        <div className="p-6 border border-red-200 bg-red-50 rounded-xl">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!testData) return null;

  const testCode = showTestCode ? getTestCode() : obscureTestCode();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/examiner/testing")}
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="w-5 h-5" />
          Back to tests
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{testData.testName}</h1>
              <TestTypeBadge testType={testData.testType} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50"
            >
              <FiUpload /> Import
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <FiPlusCircle /> Create question
            </button>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT CONTENT */}
        <div className="space-y-6 lg:col-span-2">
          <Section title="General information">
            <InfoRow label="Test name" value={testData.testName} />
            <InfoRow label="Purpose" value={testData.purpose} />
            <InfoRow
              label="Test type"
              value={<TestTypeBadge testType={testData.testType} />}
            />
            <InfoRow label="Max score" value={testData.maxScore} />
            <InfoRow
              label="Duration"
              value={`${testData.durationInMinutes} minutes`}
            />
          </Section>

          {testData.audioFileURL && (
            <Section title="Audio file">
              <AudioPlayer audioUrl={testData.audioFileURL} />
            </Section>
          )}

          {/* QUESTIONS */}
          <Section
            title={`Questions (${questionsData?.totalQuestions || 0})`}
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
                      key={q.questionId}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex items-center justify-center w-8 h-8 text-indigo-700 bg-indigo-100 rounded-full">
                          {q.orderNumber || index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium">{q.questionContent}</p>
                            <span className="px-2 py-1 ml-4 text-sm bg-gray-100 rounded">
                              {q.score} pts
                            </span>
                          </div>

                          {q.options && q.options.length > 0 && (
                            <div className="mt-3 space-y-2 ml-11">
                              {q.options.map((op, i) => (
                                <div
                                  key={op.optionId}
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
                                      ✓ Correct
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
                No questions yet
              </div>
            )}
          </Section>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          <Section title="Additional info">
            <InfoRow
              label="Test code"
              value={
                <div className="flex items-center gap-2">
                  <span>{testCode}</span>
                  <button
                    onClick={toggleShowTestCode}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {showTestCode ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              }
            />
            <InfoRow label="Test ID" value={testData.testId} />
            {testData.createdAt && (
              <InfoRow
                label="Created at"
                value={formatDate3(testData.createdAt)}
              />
            )}
            {testData.createdBy && (
              <InfoRow label="Created by" value={testData.createdBy} />
            )}
            {testData.updatedAt && (
              <InfoRow
                label="Last updated"
                value={formatDate3(testData.updatedAt)}
              />
            )}
            {testData.updatedBy && (
              <InfoRow label="Updated by" value={testData.updatedBy} />
            )}
          </Section>
        </div>
      </div>

      {/* MODALS */}
      <ImportQuestionModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        testId={id}
        onSuccess={handleImportSuccess}
      />

      <CreateQuestionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        testType={testData.testType}
        testId={id}
        onSuccess={() => fetchTestQuestions()}
      />
    </div>
  );
};

export default TestDetailPage;
