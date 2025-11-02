import { useState } from 'react';
import { FaTimes, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const NotificationModal = ({ isOpen, onClose, onViewDetails }) => {
  if (!isOpen) return null;

  // Sample notifications data - replace with actual data from props or API
  const notifications = [
    {
      id: 1,
      candidateId: 1,
      candidateName: 'Nguyễn Thị Lan',
      reason: 'Không đồng ý với điểm số đánh giá',
      description: 'Tôi cho rằng điểm số không phản ánh đúng khả năng của tôi trong phần thi nói.',
      submittedDate: '2024-10-20',
      time: '14:30',
      isRead: false
    },
    {
      id: 2,
      candidateId: 3,
      candidateName: 'Lê Thị Hương',
      reason: 'Yêu cầu xem lại kết quả',
      description: 'Tôi muốn được xem lại chi tiết điểm thi của mình vì có sự khác biệt so với kỳ vọng.',
      submittedDate: '2024-10-19',
      time: '10:15',
      isRead: false
    },
    {
      id: 3,
      candidateId: 4,
      candidateName: 'Phạm Văn Đức',
      reason: 'Khiếu nại về quy trình chấm điểm',
      description: 'Tôi nghĩ rằng quy trình chấm điểm không công bằng và muốn được giải thích rõ hơn.',
      submittedDate: '2024-10-18',
      time: '09:00',
      isRead: true
    },
    {
      id: 4,
      candidateId: 5,
      candidateName: 'Võ Thị Mai',
      reason: 'Yêu cầu phúc khảo',
      description: 'Tôi muốn được phúc khảo lại bài thi của mình vì có một số phần chưa được chấm đúng.',
      submittedDate: '2024-10-17',
      time: '16:45',
      isRead: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification) => {
    if (onViewDetails) {
      onViewDetails(notification);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Thông báo</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Có {unreadCount} thông báo chưa đọc
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <FaCheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    notification.isRead
                      ? 'bg-white border-gray-200 hover:border-indigo-300'
                      : 'bg-indigo-50 border-indigo-200 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-full ${
                      notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      <FaExclamationCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold text-sm ${
                              notification.isRead ? 'text-gray-900' : 'text-indigo-900'
                            }`}>
                              {notification.candidateName}
                            </p>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                          </div>
                          <p className={`text-sm font-medium mb-1 ${
                            notification.isRead ? 'text-gray-700' : 'text-indigo-800'
                          }`}>
                            {notification.reason}
                          </p>
                          <p className={`text-xs line-clamp-2 ${
                            notification.isRead ? 'text-gray-600' : 'text-indigo-700'
                          }`}>
                            {notification.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{notification.submittedDate}</span>
                        <span>•</span>
                        <span>{notification.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-center text-gray-500">
              Click vào thông báo để xem chi tiết khiếu nại
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;


