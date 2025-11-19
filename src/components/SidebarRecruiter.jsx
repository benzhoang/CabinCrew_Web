import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../images/Logo.png";
import { t, onLangChange } from "../i18n";
import RecruiterNotificationModal from "./RecruiterNotificationModal";
import signalRService from "../service/signalrService";
import { getNotifications } from "../service/api";

// Hàm lấy chữ cái đầu tên
function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "U";
}

// Các icon
const FolderIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
);

const MicIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0014 0" />
    <path d="M12 19v3" />
  </svg>
);

const StarIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.48 3.5a1 1 0 011.04 0l3.12 1.87 3.54.52a1 1 0 01.55 1.7l-2.56 2.5.6 3.5a1 1 0 01-1.45 1.06L12 13.9 8.68 15.7a1 1 0 01-1.45-1.06l.6-3.5L5.27 7.6a1 1 0 01.55-1.7l3.54-.52 3.12-1.87z" />
  </svg>
);

const CampaignIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M3 3h18v18H3V3z" />
    <path d="M9 9h6v6H9V9z" />
    <path d="M12 3v18" />
    <path d="M3 12h18" />
  </svg>
);

const TaskIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 9h6" />
    <path d="M9 13h6" />
  </svg>
);

const BellIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const LogoutIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const navItems = [
  { to: "/recruiter/campaigns", key: "sidebar_campaign", icon: CampaignIcon },
  { to: "/recruiter/tasks", key: "sidebar_task", icon: TaskIcon },
  { to: "/recruiter/interviews", key: "sidebar_interviews", icon: MicIcon },
  { to: "/recruiter/scoring", key: "sidebar_evaluation", icon: StarIcon },
];

const SidebarRecruiter = ({ username = "Nguyễn Văn A" }) => {
  const initials = getInitials(username);
  const [, setLangTick] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [refreshModalTrigger, setRefreshModalTrigger] = useState(0);
  const navigate = useNavigate();

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
        const result = await getNotifications();
        if (result.success && Array.isArray(result.data)) {
          const unreadCount = result.data.filter(n => !n.isRead).length;
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
    const handleNewNotification = (notification) => {
      console.log("New notification from SignalR:", notification);

      // Tăng badge
      setNotificationCount(prev => prev + 1);
      setRefreshModalTrigger(prev => prev + 1);

      // Hiển thị thông báo hệ thống (giống Zalo/Facebook)
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          const notif = new Notification(notification.title || "Thông báo mới từ Cabin HR", {
            body: notification.body || notification.message || "Bạn có thông báo mới",
            icon: logo, // logo 192x192 đẹp nhất
            badge: logo,
            tag: notification.notificationId ? `cabin-${notification.notificationId}` : "cabin-new",
            renotify: true,
            requireInteraction: false,
            silent: false,
            // vibrate: [200, 100, 200], // rung trên mobile
          });

          // Khi click vào thông báo → focus lại trang + mở modal
          notif.onclick = () => {
            window.focus();
            setIsNotificationModalOpen(true);
            notif.close();
          };

          // Tự đóng sau 8 giây
          setTimeout(() => notif.close(), 8000);
        } else if (Notification.permission === "default") {
          // Nếu chưa cấp quyền → tự động hỏi lại (không làm phiền nhiều)
          Notification.requestPermission().then(perm => {
            if (perm === "granted") {
              new Notification(notification.title || "Thông báo mới", {
                body: notification.body || "Bạn có thông báo mới",
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
      signalRService.startConnection(handleNewNotification);
    }

    return () => {
      signalRService.stopConnection();
    };
  }, []);

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
    <aside className="h-screen w-64 bg-white/95 backdrop-blur-sm border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="h-36 px-4 flex items-center justify-center border-b border-slate-200 bg-slate-50/70 shadow-inner">
        <img src={logo} alt="Logo" className="h-24 w-auto object-contain drop-shadow-sm" />
      </div>

      {/* User info + bell */}
      <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-semibold shadow-sm">
          {initials}
        </div>
        <div className="flex flex-col flex-1">
          <span className="text-sm text-slate-800 font-semibold tracking-tight">{username}</span>
          <span className="text-xs text-slate-500">{t("sidebar_role")}</span>
        </div>

        <button
          className="relative p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200"
          onClick={() => setIsNotificationModalOpen(true)}
        >
          <BellIcon className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[16px]">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all ${isActive
                ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                : "text-slate-700 hover:bg-slate-100 border-transparent"
              }`
            }
          >
            {(() => {
              const Icon = item.icon;
              return <Icon className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-slate-800 group-[.active]:text-white" />;
            })()}
            <span className="leading-5">{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogoutIcon className="h-4 w-4 shrink-0" />
          <span className="leading-5">{t("sidebar_logout")}</span>
        </button>
        <div className="text-xs text-slate-500 mt-2 text-center">
          © {new Date().getFullYear()} Cabin HR
        </div>
      </div>

      {/* Modal thông báo */}
      {typeof window !== "undefined" &&
        createPortal(
          <RecruiterNotificationModal
            isOpen={isNotificationModalOpen}
            onClose={() => setIsNotificationModalOpen(false)}
            onNotificationUpdate={handleNotificationUpdate}
            refreshTrigger={refreshModalTrigger}
          />,
          document.body
        )}
    </aside>
  );
};

export default SidebarRecruiter;