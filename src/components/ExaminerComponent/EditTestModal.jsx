import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FiLoader, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { updateTest, getTestById } from '../../service/api';

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
  const [isFetching, setIsFetching] = useState(false);

  // Fetch test detail via api.js
  const fetchTestDetail = async (id) => {
    setIsFetching(true);
    setError(null);

    try {
      const response = await getTestById(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Unable to load test detail');
      }
      const data = response.data || {};

      setFormData({
        testName: data.testName || '',
        purpose: data.purpose || '',
        testType: data.testType || '',
        maxScore: data.maxScore || '',
        durationInMinutes: data.durationInMinutes || '',
        audioFile: null,
        audioFileName: ''
      });
      setCurrentAudioFileURL(data.audioFileURL || null);
      setShouldDeleteAudio(false);
    } catch (err) {
      setError(err.message || 'Unable to load test detail');
    } finally {
      setIsFetching(false);
    }
  };

  // Load test data when modal opens
  useEffect(() => {
    if (isOpen && testData?.id) {
      fetchTestDetail(testData.id);
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

  const normalizeTestType = (value) => {
    if (value === undefined || value === null) return null;
    // Nếu backend trả về số, giữ nguyên
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Chuẩn hoá bỏ khoảng trắng và lower-case để tránh lỗi "The value '' is invalid."
      const v = value.trim().toLowerCase();
      const compact = v.replace(/\s+/g, '');
      if (compact === 'englishlistening' || compact === 'listening' || v === '1') return 1;
      if (compact === 'englishspeaking' || compact === 'speaking' || v === '2') return 2;
      if (compact === 'practical' || v === '3') return 3;
      // Nếu không khớp, thử parse number
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return null;
  };

  const isListeningType = (value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      const compact = v.replace(/\s+/g, '');
      // handle variants: "EnglishListening", "English Listening", "Listening"
      return (
        v === '1' ||
        compact === 'englishlistening' ||
        v === 'english listening' ||
        v === 'listening' ||
        v.includes('listening')
      );
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!testData || !testData.id) {
      setError('Test ID not found');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Chuẩn hoá testType sang format backend yêu cầu (số)
      const normalizedTestType = normalizeTestType(formData.testType);

      // Prepare data to send, including delete audio flag if needed
      const submitData = {
        testName: formData.testName,
        purpose: formData.purpose,
        ...(normalizedTestType !== null && { testType: normalizedTestType }),
        maxScore: formData.maxScore,
        durationInMinutes: formData.durationInMinutes,
        shouldDeleteAudio: shouldDeleteAudio,
        ...(formData.audioFile && { audioFile: formData.audioFile })
      };

      const response = await updateTest(testData.id, submitData);

      if (response.success) {
        // Display success message
        setSuccessMessage(response.message || 'Test updated successfully');
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
        setError(response.error || 'Unable to update test');
      }
    } catch (err) {
      // Handle error from exception (network error, etc.)
      const errorMessage = err.response?.data?.errorMessage ||
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join('. ')
          : null) ||
        err.message ||
        'An error occurred while updating the test';
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
          <h2 className="text-2xl font-bold text-gray-900">Edit Test</h2>
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
                Test name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="testName"
                value={formData.testName}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter test name"
              />
            </div>

            {/* Test Type - readonly */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Test type
              </label>
              <input
                type="text"
                name="testType"
                value={formData.testType}
                readOnly
                className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              />
            </div>

            {/* Max Score */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Max score <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxScore"
                value={formData.maxScore}
                onChange={handleInputChange}
                required
                min="0"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter max score"
              />
            </div>

            {/* Duration */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="durationInMinutes"
                value={formData.durationInMinutes}
                onChange={handleInputChange}
                required
                min="1"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter duration (minutes)"
              />
            </div>

          </div>

          {/* PURPOSE (Full width) */}
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Enter test purpose"
            />
          </div>

          {/* AUDIO FILE - only for English Listening */}
          {isListeningType(formData.testType) && (
            <div className="mt-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Audio file
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
                    title="Delete file"
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
                  New file: {formData.audioFileName}
                </p>
              )}

              {/* Notification when file is marked for deletion */}
              {shouldDeleteAudio && !formData.audioFile && (
                <p className="text-sm mt-2 text-amber-600">
                  The current audio will be removed when saving changes
                </p>
              )}
            </div>
          )}

        </form>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <FiLoader className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Saving...' : 'Save changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditTestModal;