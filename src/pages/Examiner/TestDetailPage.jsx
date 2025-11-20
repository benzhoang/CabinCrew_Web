import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLoader, FiMusic, FiPlay, FiPause, FiEye, FiEyeOff, FiUpload, FiPlusCircle } from 'react-icons/fi';
import { getTestById, getTestQuestions } from '../../service/api';
import ImportQuestionModal from './ModalTestQuestion/ImportQuestionModal';
import CreateQuestionModal from './ModalTestQuestion/CreateQuestionModal';

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const TestTypeBadge = ({ testType }) => {
  if (!testType) return null;
  const map = {
    "1": { cls: "bg-cyan-100 text-cyan-700", text: "EnglishListening" },
    "2": { cls: "bg-pink-100 text-pink-700", text: "EnglishSpeaking" },
    "3": { cls: "bg-emerald-100 text-emerald-700", text: "Practical" },
  };
  const cfg = map[testType] || { cls: "bg-gray-100 text-gray-700", text: testType };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${cfg.cls}`}>
      {cfg.text}
    </span>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-4 mb-4">
    <div className="w-40 shrink-0 text-gray-600 text-sm font-medium">{label}</div>
    <div className="text-gray-900 text-sm flex-1">{value || '—'}</div>
  </div>
);

const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const fileName = audioUrl ? audioUrl.split('/').pop() : 'Unknown';

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

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
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
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FiMusic className="w-5 h-5 text-gray-500" />
        <span className="text-gray-900 text-sm truncate max-w-md">{fileName}</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlayPause}
          className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
        >
          {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
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
          <div className="flex justify-between text-sm text-gray-600 mt-1">
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
      else setError(response.error || 'Không thể tải chi tiết đề thi');
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải chi tiết đề thi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestQuestions = useCallback(async (forceRefresh = false) => {
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
  }, [id]);

  const getTestCode = () => testData.joinCode || `TEST-${testData.testId}`;
  const obscureTestCode = () => '••••••';

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
        <button onClick={() => navigate('/examiner/testing')} className="mb-4 flex items-center gap-2 text-gray-600">
          <FiArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
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
          onClick={() => navigate('/examiner/testing')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="w-5 h-5" />
          Quay lại danh sách đề thi
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
              className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 flex items-center gap-2"
            >
              <FiUpload /> Import
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <FiPlusCircle /> Tạo câu hỏi
            </button>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 space-y-6">

          <Section title="Thông tin chung">
            <InfoRow label="Tên đề thi" value={testData.testName} />
            <InfoRow label="Mục đích" value={testData.purpose} />
            <InfoRow label="Loại đề thi" value={<TestTypeBadge testType={testData.testType} />} />
            <InfoRow label="Điểm tối đa" value={testData.maxScore} />
            <InfoRow label="Thời lượng" value={`${testData.durationInMinutes} phút`} />
          </Section>

          {testData.audioFileURL && (
            <Section title="File âm thanh">
              <AudioPlayer audioUrl={testData.audioFileURL} />
            </Section>
          )}

          {/* QUESTIONS */}
          <Section title={`Danh sách câu hỏi (${questionsData?.totalQuestions || 0})`}>
            {isLoadingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <FiLoader className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : questionsData?.questions?.length > 0 ? (
              <div className="space-y-4">
                {questionsData.questions
                  .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0))
                  .map((q, index) => (
                    <div key={q.questionId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center">
                          {q.orderNumber || index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium">{q.questionContent}</p>
                            <span className="ml-4 text-sm bg-gray-100 px-2 py-1 rounded">{q.score} điểm</span>
                          </div>

                          {q.options && q.options.length > 0 ? (
                            <div className="mt-3 space-y-2 ml-11">
                              {q.options.map((op, i) => (
                                <div
                                  key={op.optionId}
                                  className={`flex items-start gap-2 p-2 rounded 
                                    ${op.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
                                >
                                  <span className="font-medium text-gray-600">{String.fromCharCode(65 + i)}.</span>
                                  <span className={`flex-1 ${op.isCorrect ? 'text-green-800 font-medium' : 'text-gray-700'}`}>
                                    {op.optionContent}
                                  </span>
                                  {op.isCorrect && <span className="text-green-600 text-sm font-medium">✓ Đúng</span>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 ml-11 text-sm text-gray-500 italic">
                              (Câu hỏi tự luận – không có đáp án)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Chưa có câu hỏi nào</div>
            )}
          </Section>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          <Section title="Thông tin bổ sung">
            <InfoRow
              label="Mã đề thi"
              value={
                <div className="flex items-center gap-2">
                  <span>{testCode}</span>
                  <button onClick={toggleShowTestCode} className="text-gray-600 hover:text-gray-900">
                    {showTestCode ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              }
            />
            <InfoRow label="ID đề thi" value={testData.testId} />
            {testData.createdAt && <InfoRow label="Ngày tạo" value={formatDate(testData.createdAt)} />}
            {testData.createdBy && <InfoRow label="Người tạo" value={testData.createdBy} />}
            {testData.updatedAt && <InfoRow label="Cập nhật lần cuối" value={formatDate(testData.updatedAt)} />}
            {testData.updatedBy && <InfoRow label="Người cập nhật" value={testData.updatedBy} />}
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
        onSuccess={() => fetchTestQuestions()}
      />
    </div>
  );
};

export default TestDetailPage;