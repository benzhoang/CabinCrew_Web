import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FiLoader, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { updateTest } from '../../service/api';

const EditTestModal = ({ isOpen, onClose, testData, onSave }) => {
  const [formData, setFormData] = useState({
    testName: '',
    purpose: '',
    testType: '',
    maxScore: '',
    durationInMinutes: '',
    audioFile: null,
    audioFileName: ''
  });
  const [currentAudioFileURL, setCurrentAudioFileURL] = useState(null);
  const [shouldDeleteAudio, setShouldDeleteAudio] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load test data when modal opens
  useEffect(() => {
    if (isOpen && testData) {
      setFormData({
        testName: testData.name || '',
        purpose: testData.description || '',
        testType: testData.testType || '',
        maxScore: testData.maxScore || '',
        durationInMinutes: testData.durationInMinutes || '',
        audioFile: null,
        audioFileName: ''
      });
      setCurrentAudioFileURL(testData.audioFileURL || null);
      setShouldDeleteAudio(false);
    }
  }, [isOpen, testData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        testName: '',
        purpose: '',
        testType: '',
        maxScore: '',
        durationInMinutes: '',
        audioFile: null,
        audioFileName: ''
      });
      setCurrentAudioFileURL(null);
      setShouldDeleteAudio(false);
      setError(null);
      setSuccessMessage(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        audioFile: file,
        audioFileName: file.name
      }));
      // When a new file is selected, unmark deletion of the old file
      setShouldDeleteAudio(false);
    }
  };

  const handleDeleteCurrentAudio = () => {
    setCurrentAudioFileURL(null);
    setShouldDeleteAudio(true);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!testData || !testData.id) {
      setError('Không tìm thấy ID đề thi');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Prepare data to send, including delete audio flag if needed
      const submitData = {
        testName: formData.testName,
        purpose: formData.purpose,
        testType: formData.testType,
        maxScore: formData.maxScore,
        durationInMinutes: formData.durationInMinutes,
        shouldDeleteAudio: shouldDeleteAudio,
        ...(formData.audioFile && { audioFile: formData.audioFile })
      };

      const response = await updateTest(testData.id, submitData);

      if (response.success) {
        // Display success message
        setSuccessMessage(response.message || 'Cập nhật đề thi thành công');
        // Call onSave callback with new data from response (including updated audioFileURL)
        if (onSave) {
          onSave(formData, response.data);
        }
        // Automatically close modal after 1.5 seconds
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Display specific error from API response
        setError(response.error || 'Không thể cập nhật đề thi');
      }
    } catch (err) {
      // Handle error from exception (network error, etc.)
      const errorMessage = err.response?.data?.errorMessage ||
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join('. ')
          : null) ||
        err.message ||
        'Đã xảy ra lỗi khi cập nhật đề thi';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa đề thi</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-sm font-medium text-green-700">{successMessage}</p>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* GRID 2 CỘT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Test Name */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Tên đề thi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="testName"
                value={formData.testName}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập tên đề thi"
              />
            </div>

            {/* Test Type */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Loại đề thi <span className="text-red-500">*</span>
              </label>
              <select
                name="testType"
                value={formData.testType}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Chọn loại đề thi</option>
                <option value="1">EnglishListening</option>
                <option value="2">EnglishSpeaking</option>
                <option value="3">Practical</option>
              </select>
            </div>

            {/* Max Score */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Điểm tối đa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxScore"
                value={formData.maxScore}
                onChange={handleInputChange}
                required
                min="0"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập điểm tối đa"
              />
            </div>

            {/* Duration */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Thời lượng (phút) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="durationInMinutes"
                value={formData.durationInMinutes}
                onChange={handleInputChange}
                required
                min="1"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập thời lượng bài thi"
              />
            </div>

          </div>

          {/* PURPOSE (Full width) */}
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Mục đích <span className="text-red-500">*</span>
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Nhập mục đích của đề thi"
            />
          </div>

          {/* AUDIO FILE */}
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              File âm thanh
            </label>

            {/* Display current file if available */}
            {currentAudioFileURL && !shouldDeleteAudio && (
              <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiExternalLink className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <a
                    href={currentAudioFileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 hover:underline truncate flex-1"
                  >
                    {currentAudioFileURL}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteCurrentAudio}
                  className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Xóa file"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Input for new file selection */}
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />

            {/* Display newly selected file */}
            {formData.audioFile && (
              <p className="text-sm mt-2 text-gray-600">
                File mới: {formData.audioFileName}
              </p>
            )}

            {/* Notification when file is marked for deletion */}
            {shouldDeleteAudio && !formData.audioFile && (
              <p className="text-sm mt-2 text-amber-600">
                File âm thanh sẽ bị xóa khi lưu thay đổi
              </p>
            )}
          </div>

        </form>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <FiLoader className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditTestModal;