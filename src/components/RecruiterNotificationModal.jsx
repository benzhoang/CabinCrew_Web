import React, { useState, useEffect } from 'react';
import { FaTimes, FaExclamationCircle, FaCheckCircle, FaBell } from 'react-icons/fa';
import { getNotifications, markNotificationAsRead } from '../service/api';

const RecruiterNotificationModal = ({ isOpen, onClose, onNotificationUpdate, refreshTrigger }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, refreshTrigger]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNotifications();
      if (result.success) {
        // Sắp xếp: thông báo chưa đọc trước, sau đó theo thời gian mới nhất
        const sorted = result.data.sort((a, b) => {
          if (a.isRead !== b.isRead) {
            return a.isRead ? 1 : -1;
          }
          return new Date(b.time) - new Date(a.time);
        });
        setNotifications(sorted);
        // Cập nhật số lượng thông báo chưa đọc cho parent component
        if (onNotificationUpdate) {
          const unreadCount = sorted.filter(n => !n.isRead).length;
          onNotificationUpdate(unreadCount);
        }
      } else {
        setError(result.error || 'Không thể tải thông báo');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải thông báo');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notification) => {
    // Đánh dấu thông báo là đã đọc nếu chưa đọc
    if (!notification.isRead) {
      // Optimistic update: cập nhật UI ngay lập tức
      setNotifications(prev => {
        const updated = prev.map(n =>
          n.notificationId === notification.notificationId
            ? { ...n, isRead: true }
            : n
        );
        // Cập nhật số lượng thông báo chưa đọc ngay
        if (onNotificationUpdate) {
          const newUnreadCount = updated.filter(n => !n.isRead).length;
          onNotificationUpdate(newUnreadCount);
        }
        return updated;
      });

      // Gọi API để đánh dấu trên server
      try {
        const result = await markNotificationAsRead(notification.notificationId);
        if (!result.success) {
          // Nếu API thất bại, rollback lại trạng thái cũ
          setNotifications(prev => {
            const rolledBack = prev.map(n =>
              n.notificationId === notification.notificationId
                ? { ...n, isRead: false }
                : n
            );
            if (onNotificationUpdate) {
              const newUnreadCount = rolledBack.filter(n => !n.isRead).length;
              onNotificationUpdate(newUnreadCount);
            }
            return rolledBack;
          });
          setError('Không thể đánh dấu thông báo là đã đọc');
        }
      } catch (err) {
        console.error('Error marking notification as read:', err);
        // Rollback lại trạng thái cũ
        setNotifications(prev => {
          const rolledBack = prev.map(n =>
            n.notificationId === notification.notificationId
              ? { ...n, isRead: false }
              : n
          );
          if (onNotificationUpdate) {
            const newUnreadCount = rolledBack.filter(n => !n.isRead).length;
            onNotificationUpdate(newUnreadCount);
          }
          return rolledBack;
        });
        setError('Đã xảy ra lỗi khi đánh dấu thông báo');
      }
    }
    // Có thể thêm logic điều hướng hoặc xử lý khác ở đây
  };


  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-full">
              <FaBell className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Thông báo</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Có {unreadCount} thông báo chưa đọc
                </p>
              )}
            </div>
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải thông báo...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <FaCheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                // Format time từ API thành "dd/MM/yyyy HH:mm"
                let formattedDateTime = '';
                if (notification.time) {
                  try {
                    // Nếu time đã là format "dd/MM/yyyy HH:mm" thì dùng trực tiếp
                    if (typeof notification.time === 'string' && notification.time.includes('/')) {
                      formattedDateTime = notification.time;
                    } else {
                      // Parse và format lại
                      const notificationDate = new Date(notification.time);
                      if (!isNaN(notificationDate.getTime())) {
                        const day = String(notificationDate.getDate()).padStart(2, '0');
                        const month = String(notificationDate.getMonth() + 1).padStart(2, '0');
                        const year = notificationDate.getFullYear();
                        const hours = String(notificationDate.getHours()).padStart(2, '0');
                        const minutes = String(notificationDate.getMinutes()).padStart(2, '0');
                        formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}`;
                      } else {
                        formattedDateTime = notification.time;
                      }
                    }
                  } catch (err) {
                    formattedDateTime = notification.time;
                  }
                }

                return (
                  <div
                    key={notification.notificationId}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${notification.isRead
                      ? 'bg-white border-gray-200 hover:border-indigo-300'
                      : 'bg-indigo-50 border-indigo-200 hover:border-indigo-400'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-2 rounded-full ${notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                        <FaExclamationCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`font-semibold text-sm ${notification.isRead ? 'text-gray-900' : 'text-indigo-900'
                                }`}>
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </div>
                            <p className={`text-xs line-clamp-2 ${notification.isRead ? 'text-gray-600' : 'text-indigo-700'
                              }`}>
                              {notification.body}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{formattedDateTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-center text-gray-500">
              Click vào thông báo để xem chi tiết và đánh dấu đã đọc
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterNotificationModal;

