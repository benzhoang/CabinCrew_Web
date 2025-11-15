import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLoader, FiMusic, FiExternalLink, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getTestById, deleteTest } from '../../service/api';

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

const TestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTestDetail();
  }, [id]);

  const fetchTestDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTestById(id);
      if (response.success) {
        setTestData(response.data);
      } else {
        setError(response.error || 'Không thể tải chi tiết đề thi');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải chi tiết đề thi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) return;

    setIsDeleting(true);
    try {
      const response = await deleteTest(id);
      if (response.success) {
        alert(response.message || 'Xóa đề thi thành công');
        navigate('/examiner/testing');
      } else {
        alert(response.error || 'Không thể xóa đề thi');
      }
    } catch (err) {
      alert(err.message || 'Đã xảy ra lỗi khi xóa đề thi');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    // Quay lại trang testing và mở modal edit
    navigate('/examiner/testing', { state: { editTestId: id, testData } });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FiLoader className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-spin" />
            <p className="text-gray-600">Đang tải chi tiết đề thi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/examiner/testing')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/examiner/testing')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </button>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <p className="text-yellow-600">Không tìm thấy đề thi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/examiner/testing')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách đề thi</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{testData.testName || 'Đề thi chưa có tên'}</h1>
              <TestTypeBadge testType={testData.testType} />
            </div>
            <p className="text-gray-600">Mã đề thi: {testData.joinCode || `TEST-${testData.testId}`}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
            >
              <FiEdit2 className="w-4 h-4" />
              Chỉnh sửa
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiTrash2 className="w-4 h-4" />
              )}
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Thông tin chung">
            <div className="space-y-2">
              <InfoRow label="Tên đề thi" value={testData.testName} />
              <InfoRow label="Mục đích" value={testData.purpose} />
              <InfoRow label="Loại đề thi" value={<TestTypeBadge testType={testData.testType} />} />
              <InfoRow label="Điểm tối đa" value={testData.maxScore} />
              <InfoRow label="Thời lượng" value={`${testData.durationInMinutes} phút`} />
            </div>
          </Section>

          {testData.audioFileURL && (
            <Section title="File âm thanh">
              <div className="flex items-center gap-3">
                <FiMusic className="w-5 h-5 text-gray-500" />
                <a
                  href={testData.audioFileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  <span className="truncate max-w-md">{testData.audioFileURL}</span>
                  <FiExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Section title="Thông tin bổ sung">
            <div className="space-y-2">
              <InfoRow label="Mã đề thi" value={testData.joinCode || `TEST-${testData.testId}`} />
              <InfoRow label="ID đề thi" value={testData.testId} />
              {testData.createdAt && (
                <InfoRow label="Ngày tạo" value={formatDate(testData.createdAt)} />
              )}
              {testData.createdBy && (
                <InfoRow label="Người tạo" value={testData.createdBy} />
              )}
              {testData.updatedAt && (
                <InfoRow label="Cập nhật lần cuối" value={formatDate(testData.updatedAt)} />
              )}
              {testData.updatedBy && (
                <InfoRow label="Người cập nhật" value={testData.updatedBy} />
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default TestDetailPage;

