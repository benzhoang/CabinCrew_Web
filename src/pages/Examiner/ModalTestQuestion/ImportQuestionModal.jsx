import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiAlertCircle, FiCheckCircle, FiFileText, FiInfo, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { importQuestionsFromExcel } from '../../../service/api';

const ImportQuestionModal = ({ isOpen, onClose, testId, onSuccess }) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setStatus({ type: null, message: '' });
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const isExcelFile = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!isExcelFile) {
      setStatus({
        type: 'error',
        message: 'Please select an Excel file (.xlsx or .xls).'
      });
      setSelectedFile(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setStatus({
        type: 'error',
        message: 'File size must not exceed 10 MB.'
      });
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setStatus({ type: null, message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setStatus({ type: 'error', message: 'Please choose an Excel file to upload.' });
      return;
    }

    if (!testId) {
      setStatus({ type: 'error', message: 'Test information not found.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await importQuestionsFromExcel(testId, selectedFile);

      if (response.success) {
        // Thông báo toast ngắn gọn, thống nhất: nền trắng mặc định
        const toastMessage = "Import Questions Successfully";
        const successMessage =
          response.message ||
          `Đã import thành công ${response.data?.totalQuestionsCreated || 0} câu hỏi.`;

        toast.success(toastMessage, {
          position: "top-right",
          autoClose: 2000,
        });

        // Hiển thị chi tiết kết quả (số câu, cảnh báo...) trong panel bên trong modal
        setStatus({
          type: 'success',
          message: successMessage,
        });

        // Gọi callback để refresh danh sách câu hỏi
        if (onSuccess) {
          await onSuccess(response.data);
        }

        // Đóng modal và navigate về trang test detail
        setTimeout(() => {
          onClose?.();
          navigate(`/examiner/testing/${testId}`);
        }, 1000);
      } else {
        // Hiển thị toast lỗi (màu đỏ)
        const errorMessage = response.error || 'Không thể import câu hỏi từ file Excel.';
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 2000,
        });

        setStatus({
          type: 'error',
          message: errorMessage
        });
      }
    } catch (error) {
      // Hiển thị toast lỗi (màu đỏ)
      const errorMessage = error.message || 'Đã xảy ra lỗi khi import câu hỏi.';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 2000,
      });

      setStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Import questions from Excel</h2>
            <p className="text-sm text-gray-500">Select a prepared template file to bulk add questions.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {status.type && (
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${status.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
            >
              {status.type === 'error' ? <FiAlertCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
              <span>{status.message}</span>
            </div>
          )}

          <div className="border border-dashed border-indigo-300 rounded-2xl p-8 bg-indigo-50/40 text-center">
            <FiUpload className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
            <p className="text-lg font-semibold text-gray-900">Drag and drop Excel file here</p>
            <p className="text-sm text-gray-500 mb-6">Or click below to choose a file</p>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors font-medium">
              <FiFileText className="w-4 h-4" />
              Choose Excel file
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <p className="mt-4 text-sm text-gray-700">
                Selected: <span className="font-medium">{selectedFile.name}</span>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50 space-y-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FiInfo className="w-4 h-4 text-indigo-500" />
              Quick guide
            </div>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Download the template from the Export Question Template page and fill it in.</li>
              <li>Each row equals one question, including answers and difficulty.</li>
              <li>Only Excel formats (.xlsx/.xls) up to 10 MB are supported.</li>
              <li>After upload, the page will refresh automatically.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="w-4 h-4" />
                  Upload file
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportQuestionModal;