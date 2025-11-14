import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const EditTestModal = ({ isOpen, onClose, testData, onSave }) => {
  const [formData, setFormData] = useState({
    testName: '',
    purpose: '',
    testType: '',
    maxScore: '',
    audioFile: null,
    audioFileName: ''
  });

  // Load test data vào form khi modal mở hoặc testData thay đổi
  useEffect(() => {
    if (isOpen && testData) {
      setFormData({
        testName: testData.name || '',
        purpose: testData.description || '',
        testType: testData.testType || '',
        maxScore: testData.maxScore || '',
        audioFile: null,
        audioFileName: testData.audioFileURL ? 'File hiện tại' : ''
      });
    }
  }, [isOpen, testData]);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        testName: '',
        purpose: '',
        testType: '',
        maxScore: '',
        audioFile: null,
        audioFileName: ''
      });
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
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Gọi API để lưu (chưa cần API theo yêu cầu)
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa đề thi</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              {/* TestName */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Tên đề thi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="testName"
                  value={formData.testName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập tên đề thi"
                />
              </div>

              {/* Purpose */}
              <div>
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

              {/* TestType */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Loại đề thi <span className="text-red-500">*</span>
                </label>
                <select
                  name="testType"
                  value={formData.testType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Chọn loại đề thi</option>
                  <option value="Listening">Listening</option>
                  <option value="Speaking">Speaking</option>
                  <option value="Reading">Reading</option>
                  <option value="Writing">Writing</option>
                </select>
              </div>

              {/* MaxScore */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Điểm tối đa <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxScore"
                  value={formData.maxScore}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập điểm tối đa"
                />
              </div>

              {/* AudioFile */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  File âm thanh
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {formData.audioFileName && (
                    <p className="text-sm text-gray-600">
                      {formData.audioFile ? `File mới: ${formData.audioFileName}` : formData.audioFileName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTestModal;

