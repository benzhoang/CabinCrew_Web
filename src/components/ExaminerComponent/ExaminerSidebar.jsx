import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../images/Logo.png";
import { t, onLangChange } from "../../i18n";
import ExaminerNotificationModal from "./ExaminerNotificationModal";
import signalRService from "../../service/signalrService";
import {
  getNotifications,
  getUnreadNotificationCount,
} from "../../service/api";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "U";
}

const StarIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.48 3.5a1 1 0 011.04 0l3.12 1.87 3.54.52a1 1 0 01.55 1.7l-2.56 2.5.6 3.5a1 1 0 01-1.45 1.06L12 13.9 8.68 15.7a1 1 0 01-1.45-1.06l.6-3.5L5.27 7.6a1 1 0 01.55-1.7l3.54-.52 3.12-1.87z" />
  </svg>
);

const CampaignIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
  >
    <path d="M3 3h18v18H3V3z" />
    <path d="M9 9h6v6H9V9z" />
    <path d="M12 3v18" />
    <path d="M3 12h18" />
  </svg>
);

const ReportIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const TaskIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 9h6" />
    <path d="M9 13h6" />
  </svg>
);

const BellIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
  >
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const LogoutIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
  >
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const navItems = [
  { to: "/examiner/campaigns", key: "sidebar_campaign", icon: CampaignIcon },
  { to: "/examiner/tasks", key: "sidebar_task", icon: TaskIcon },
  // { to: "/examiner/exam-campaigns", key: "Score", icon: ReportIcon },
  { to: "/examiner/testing", key: "sidebar_testing", icon: StarIcon },
];

const ExaminerSidebar = ({ username = "Nguyễn Văn A" }) => {
  const [displayName, setDisplayName] = useState(username);
  const [role, setRole] = useState("Examiner");
  const initials = getInitials(displayName);
  const [, setLangTick] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [refreshModalTrigger, setRefreshModalTrigger] = useState(0);
  const [toastData, setToastData] = useState({
    show: false,
    title: "",
    body: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Load employee data from localStorage
    const employee = localStorage.getItem("employee");
    if (employee) {
      const employeeData = JSON.parse(employee);
      if (employeeData.displayName) {
        setDisplayName(employeeData.displayName);
      }
      if (employeeData.role === "examiner") {
        setRole("Examiner");
      }
    }
  }, []);

  useEffect(() => {
    const off = onLangChange(() => setLangTick((v) => v + 1));
    return () => off();
  }, []);

  // Yêu cầu quyền thông báo khi lần đầu load
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Load số thông báo chưa đọc ban đầu
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const result = await getUnreadNotificationCount();
        if (result.success) {
          setNotificationCount(result.count);
          return;
        }
        // fallback nếu API count lỗi
        const fallback = await getNotifications();
        if (fallback.success && Array.isArray(fallback.data)) {
          const unreadCount = fallback.data.filter((n) => !n.isRead).length;
          setNotificationCount(unreadCount);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();
  }, []);

  // Kết nối SignalR + xử lý thông báo real-time + hiển thị browser notification
  useEffect(() => {
    console.log("ExaminerSidebar: Khởi tạo SignalR connection...");

    const handleNewNotification = (notification) => {
      console.log(
        "ExaminerSidebar: Nhận được notification từ SignalR:",
        notification
      );

      // Tăng badge ngay lập tức để UX tốt hơn (sử dụng functional update để tránh stale closure)
      setNotificationCount((prev) => {
        const newCount = prev + 1;
        console.log(
          "ExaminerSidebar: Cập nhật badge từ",
          prev,
          "lên",
          newCount
        );
        return newCount;
      });

      // Trigger refresh modal
      setRefreshModalTrigger((prev) => prev + 1);
      console.log("ExaminerSidebar: Đã trigger refresh modal");

      // Hiển thị toast ngay lập tức
      const toastTitle = notification.title || "Thông báo mới từ Cabin HR";
      const toastBody =
        notification.body || notification.message || "Bạn có thông báo mới";

      console.log("ExaminerSidebar: Hiển thị toast với:", {
        title: toastTitle,
        body: toastBody,
      });
      setToastData({
        show: true,
        title: toastTitle,
        body: toastBody,
      });

      // Đồng bộ badge theo server sau đó để đảm bảo chính xác
      getUnreadNotificationCount()
        .then((res) => {
          if (res.success) {
            console.log("ExaminerSidebar: Đồng bộ badge từ server:", res.count);
            setNotificationCount(res.count);
          } else {
            console.warn("ExaminerSidebar: Không thể đồng bộ badge từ server");
          }
        })
        .catch((err) => {
          console.error("ExaminerSidebar: Lỗi khi đồng bộ badge:", err);
        });

      // Hiển thị thông báo hệ thống (giống Zalo/Facebook)
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            const notif = new Notification(toastTitle, {
              body: toastBody,
              icon: logo, // logo 192x192 đẹp nhất
              badge: logo,
              tag: notification.notificationId
                ? `cabin-${notification.notificationId}`
                : "cabin-new",
              renotify: true,
              requireInteraction: false,
              silent: false,
            });

            // Khi click vào thông báo → focus lại trang + mở modal
            notif.onclick = () => {
              window.focus();
              setIsNotificationModalOpen(true);
              notif.close();
            };

            // Tự đóng sau 8 giây
            setTimeout(() => notif.close(), 8000);
            console.log("ExaminerSidebar: Đã hiển thị browser notification");
          } catch (err) {
            console.error(
              "ExaminerSidebar: Lỗi khi tạo browser notification:",
              err
            );
          }
        } else if (Notification.permission === "default") {
          // Nếu chưa cấp quyền → tự động hỏi lại (không làm phiền nhiều)
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              new Notification(toastTitle, {
                body: toastBody,
                icon: logo,
                tag: "cabin-first",
              });
            }
          });
        }
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      console.log("ExaminerSidebar: Có token, bắt đầu kết nối SignalR...");
      signalRService
        .startConnection(handleNewNotification)
        .then(() => {
          console.log("ExaminerSidebar: SignalR connection đã được khởi tạo");
        })
        .catch((err) => {
          console.error("ExaminerSidebar: Không thể khởi tạo SignalR:", err);
        });
    } else {
      console.warn(
        "ExaminerSidebar: Không có token, không thể kết nối SignalR"
      );
    }

    return () => {
      console.log("ExaminerSidebar: Cleanup SignalR connection...");
      signalRService.stopConnection();
    };
  }, []); // Empty deps để chỉ chạy 1 lần khi mount

  // Tự ẩn toast sau 6s
  useEffect(() => {
    if (!toastData.show) return;
    const timer = setTimeout(
      () => setToastData((prev) => ({ ...prev, show: false })),
      6000
    );
    return () => clearTimeout(timer);
  }, [toastData.show]);

  // Nhận cập nhật số lượng chưa đọc từ modal
  const handleNotificationUpdate = (newCount) => {
    setNotificationCount(newCount);
  };

  const handleLogout = () => {
    localStorage.removeItem("employee");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  return (
    <aside className="flex flex-col w-64 h-screen border-r bg-white/95 backdrop-blur-sm border-slate-200">
      <div className="flex items-center justify-center px-4 border-b shadow-inner h-36 border-slate-200 bg-slate-50/70">
        <img
          src={logo}
          alt="Logo"
          className="object-contain w-auto h-24 drop-shadow-sm"
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200">
        <div className="flex items-center justify-center font-semibold text-white rounded-full shadow-sm h-11 w-11 bg-gradient-to-br from-indigo-700 to-indigo-500">
          {initials}
        </div>
        <div className="flex flex-col flex-1">
          <span className="text-sm font-semibold tracking-tight text-slate-800">
            {displayName}
          </span>
          <span className="text-xs text-slate-500">{role}</span>
        </div>

        <button
          className="relative p-2 transition-all duration-200 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          onClick={() => setIsNotificationModalOpen(true)}
        >
          <BellIcon className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[16px]">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                  : "text-slate-700 hover:bg-slate-100 border-transparent"
              }`
            }
          >
            {(() => {
              const Icon = item.icon;
              return (
                <Icon className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-slate-800 group-[.active]:text-white" />
              );
            })()}
            <span className="leading-5">{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogoutIcon className="w-4 h-4 shrink-0" />
          <span className="leading-5">{t("sidebar_logout")}</span>
        </button>
        <div className="mt-2 text-xs text-slate-500">
          © {new Date().getFullYear()} Cabin HR
        </div>
      </div>

      {/* Modal thông báo */}
      {typeof window !== "undefined" &&
        createPortal(
          <ExaminerNotificationModal
            isOpen={isNotificationModalOpen}
            onClose={() => setIsNotificationModalOpen(false)}
            onNotificationUpdate={handleNotificationUpdate}
            refreshTrigger={refreshModalTrigger}
          />,
          document.body
        )}

      {/* Toast thông báo nhanh */}
      {typeof window !== "undefined" &&
        toastData.show &&
        createPortal(
          <div
            className="fixed bottom-6 right-6 z-[9999] max-w-xs w-full bg-slate-900 text-white shadow-2xl rounded-lg overflow-hidden toast-enter"
            style={{
              pointerEvents: "auto",
            }}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold break-words">
                  {toastData.title || "Thông báo mới"}
                </div>
                <div className="mt-1 text-xs break-words text-slate-200">
                  {toastData.body || "Bạn có thông báo mới"}
                </div>
              </div>
              <button
                onClick={() => {
                  console.log("ExaminerSidebar: Đóng toast");
                  setToastData((prev) => ({ ...prev, show: false }));
                }}
                className="flex-shrink-0 ml-2 text-xs transition-colors text-slate-300 hover:text-white"
                aria-label="Close notification"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>,
          document.body
        )}
    </aside>
  );
};

export default ExaminerSidebar;
