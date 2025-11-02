import { FaTimes } from 'react-icons/fa';

const ComplaintScoreModal = ({ isOpen, onClose, candidate }) => {
  if (!isOpen) return null;

  // Sample data - replace with actual data from props
  const complaintData = candidate?.complaint || {
    reason: 'Không đồng ý với điểm số đánh giá',
    description: 'Tôi cho rằng điểm số không phản ánh đúng khả năng của tôi trong phần thi nói.',
    submittedDate: '2024-10-20'
  };

  const scoreData = candidate?.scores || {
    total: 85,
    speaking: 28,
    listening: 29,
    reading: 28
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Lý do khiếu nại và điểm thi</h2>
            <p className="text-sm text-gray-500 mt-1">{candidate?.name || 'Nguyễn Thị Lan'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Score Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Điểm thi</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Tổng điểm:</span>
                <span className="text-2xl font-bold text-indigo-600">{scoreData.total}/100</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Speaking</p>
                  <p className="text-lg font-semibold text-gray-900">{scoreData.speaking}/30</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Listening</p>
                  <p className="text-lg font-semibold text-gray-900">{scoreData.listening}/30</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Reading</p>
                  <p className="text-lg font-semibold text-gray-900">{scoreData.reading}/30</p>
                </div>
              </div>
            </div>
          </div>

          {/* Complaint Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lý do khiếu nại</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Lý do:</p>
                <p className="text-gray-900">{complaintData.reason}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết:</p>
                <p className="text-gray-900">{complaintData.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Ngày gửi:</p>
                <p className="text-gray-900">{complaintData.submittedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintScoreModal;

