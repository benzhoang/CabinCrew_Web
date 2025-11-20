import { useState, useEffect } from 'react';
import { FiUpload, FiX, FiAlertCircle, FiCheckCircle, FiFileText, FiInfo, FiLoader } from 'react-icons/fi';
import { importQuestionsFromExcel } from '../../../service/api';

const ImportQuestionModal = ({ isOpen, onClose, testId, onSuccess }) => {
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
        message: 'Vui lòng chọn đúng định dạng Excel (.xlsx hoặc .xls).'
      });
      setSelectedFile(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setStatus({
        type: 'error',
        message: 'Kích thước file không được vượt quá 10 MB.'
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
      setStatus({ type: 'error', message: 'Bạn chưa chọn file Excel để tải lên.' });
      return;
    }

    if (!testId) {
      setStatus({ type: 'error', message: 'Không tìm thấy thông tin đề thi.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await importQuestionsFromExcel(testId, selectedFile);

      // Trong handleSubmit, sau khi import thành công:
      if (response.success) {
        setStatus({
          type: 'success',
          message: response.message || `Import thành công ${response.data?.totalQuestionsCreated || 0} câu hỏi.`,
        });
        // Quan trọng: Gọi onSuccess TRƯỚC, rồi mới đóng modal sau 1 chút
        if (onSuccess) {
          await onSuccess(response.data); // Đảm bảo fetch lại danh sách câu hỏi
        }
        // Đóng modal sau 1 giây để người dùng thấy thông báo thành công
        setTimeout(() => {
          onClose?.();
        }, 1000);
      } else {
        setStatus({
          type: 'error',
          message: response.error || 'Không thể import câu hỏi từ file Excel.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Đã xảy ra lỗi khi import câu hỏi.'
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
            <h2 className="text-2xl font-semibold text-gray-900">Import câu hỏi từ Excel</h2>
            <p className="text-sm text-gray-500">Chọn file mẫu đã điền sẵn để thêm câu hỏi hàng loạt.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Đóng"
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
            <p className="text-lg font-semibold text-gray-900">Kéo thả file Excel vào đây</p>
            <p className="text-sm text-gray-500 mb-6">Hoặc nhấn nút bên dưới để chọn file từ máy tính</p>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors font-medium">
              <FiFileText className="w-4 h-4" />
              Chọn file Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <p className="mt-4 text-sm text-gray-700">
                Đã chọn: <span className="font-medium">{selectedFile.name}</span>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50 space-y-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FiInfo className="w-4 h-4 text-indigo-500" />
              Hướng dẫn nhanh
            </div>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Tải template ở trang Export Question Template và điền đủ thông tin cần thiết.</li>
              <li>Mỗi dòng tương ứng với một câu hỏi, bao gồm đáp án và mức độ khó.</li>
              <li>Chỉ hỗ trợ định dạng Excel (.xlsx hoặc .xls) dung lượng tối đa 10MB.</li>
              <li>Sau khi upload, hệ thống sẽ tự động làm mới trang.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <FiUpload className="w-4 h-4" />
                  Tải lên file
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