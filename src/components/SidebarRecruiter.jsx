import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../images/Logo.png";
import { t } from "../i18n";
import RecruiterNotificationModal from "./RecruiterNotificationModal";
import signalRService from "../service/signalrService";
import { getNotifications, getUnreadNotificationCount } from "../service/api";
import { FaBullhorn, FaListCheck } from "react-icons/fa6";
import { FaBell, FaSignOutAlt } from "react-icons/fa";

// Hàm lấy chữ cái đầu tên
function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "U";
}

const navItems = [
  { to: "/recruiter/campaigns", key: "sidebar_campaign", icon: FaBullhorn },
  { to: "/recruiter/tasks", key: "sidebar_task", icon: FaListCheck },
];

const SidebarRecruiter = ({ username = "Nguyễn Văn A" }) => {
  // Lấy thông tin recruiter từ localStorage (được lưu sau khi đăng nhập)
  const [displayName, setDisplayName] = useState(username);
  const initials = getInitials(displayName);

  // Khởi tạo notificationCount từ localStorage để persist qua các lần re-mount
  const [notificationCount, setNotificationCount] = useState(() => {
    const saved = localStorage.getItem("notificationCount");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [refreshModalTrigger, setRefreshModalTrigger] = useState(0);
  const [toastData, setToastData] = useState({
    show: false,
    title: "",
    body: "",
  });
  const navigate = useNavigate();
  const hasFetchedInitialCount = useRef(false);
  const hasStartedSignalR = useRef(false);

  // Wrapper function để update cả state và localStorage
  const updateNotificationCount = (newCount) => {
    console.log("📊 Update notification count:", newCount);
    setNotificationCount(newCount);
    localStorage.setItem("notificationCount", newCount.toString());
  };

  // Yêu cầu quyền thông báo khi lần đầu load
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Hàm decode JWT token để lấy thông tin từ token
  const decodeJWT = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("SidebarRecruiter: Error decoding JWT:", error);
      return null;
    }
  };

  // Load tên hiển thị từ token (ưu tiên fullName từ token)
  useEffect(() => {
    try {
      // Ưu tiên 1: Lấy từ token
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = decodeJWT(token);
        if (decodedToken) {
          // Thử các trường có thể chứa fullName trong token
          const nameFromToken =
            decodedToken.fullName ||
            decodedToken.FullName ||
            decodedToken[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ] ||
            decodedToken[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/name"
            ] ||
            decodedToken.name ||
            decodedToken.unique_name ||
            decodedToken.displayName ||
            decodedToken.DisplayName;

          if (nameFromToken) {
            setDisplayName(nameFromToken);
            return;
          }
        }
      }

      // Ưu tiên 2: Lấy từ localStorage employee (fallback)
      const stored = localStorage.getItem("employee");
      if (stored) {
        const employee = JSON.parse(stored);
        const nameFromStorage =
          employee.fullName ||
          employee.FullName ||
          employee.displayName ||
          employee.DisplayName ||
          employee.username ||
          username;
        setDisplayName(nameFromStorage);
        return;
      }

      // Fallback cuối cùng: dùng username prop
      setDisplayName(username);
    } catch (error) {
      console.error(
        "SidebarRecruiter: Cannot parse employee from localStorage or token",
        error
      );
      setDisplayName(username);
    }
  }, [username]);

  // Load số thông báo chưa đọc ban đầu (CHỈ 1 LẦN)
  useEffect(() => {
    // Prevent multiple API calls
    if (hasFetchedInitialCount.current) {
      console.log("SidebarRecruiter: Đã fetch rồi, bỏ qua");
      return;
    }
    hasFetchedInitialCount.current = true;

    const fetchNotificationCount = async () => {
      try {
        console.log("SidebarRecruiter: 🔥 Bắt đầu load số thông báo...");
        const result = await getUnreadNotificationCount();
        console.log("SidebarRecruiter: API response:", result);

        if (result.success && typeof result.count === "number") {
          console.log("SidebarRecruiter: ✅ Set count =", result.count);
          updateNotificationCount(result.count);
          return;
        }

        // fallback nếu API count lỗi
        console.log("SidebarRecruiter: Fallback sang getNotifications()");
        const fallback = await getNotifications();
        console.log("SidebarRecruiter: Kết quả getNotifications:", fallback);

        if (fallback.success && Array.isArray(fallback.data)) {
          const unreadCount = fallback.data.filter((n) => !n.isRead).length;
          console.log(
            "SidebarRecruiter: Tính được",
            unreadCount,
            "thông báo chưa đọc từ",
            fallback.data.length,
            "thông báo"
          );
          updateNotificationCount(unreadCount);
        } else {
          console.warn("SidebarRecruiter: Không thể lấy số thông báo");
        }
      } catch (error) {
        console.error(
          "SidebarRecruiter: Error fetching notification count:",
          error
        );
      }
    };

    fetchNotificationCount();
  }, []);

  // Kết nối SignalR + xử lý thông báo real-time + hiển thị browser notification
  useEffect(() => {
    if (hasStartedSignalR.current) {
      console.log("SidebarRecruiter: SignalR đã được khởi tạo rồi, bỏ qua");
      return;
    }

    console.log("SidebarRecruiter: Khởi tạo SignalR connection...");
    hasStartedSignalR.current = true;

    const handleNewNotification = (notification) => {
      console.log(
        "SidebarRecruiter: Nhận được notification từ SignalR:",
        notification
      );

      // Tăng badge ngay lập tức để UX tốt hơn
      const currentCount = parseInt(
        localStorage.getItem("notificationCount") || "0",
        10
      );
      const newCount = currentCount + 1;
      console.log(
        "SidebarRecruiter: Cập nhật badge từ",
        currentCount,
        "lên",
        newCount
      );
      updateNotificationCount(newCount);

      // Trigger refresh modal
      setRefreshModalTrigger((prev) => prev + 1);
      console.log("SidebarRecruiter: Đã trigger refresh modal");

      // Hiển thị toast ngay lập tức
      const toastTitle = notification.title || "Thông báo mới từ Cabin HR";
      const toastBody =
        notification.body || notification.message || "Bạn có thông báo mới";

      console.log("SidebarRecruiter: Hiển thị toast với:", {
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
            console.log(
              "SidebarRecruiter: Đồng bộ badge từ server:",
              res.count
            );
            updateNotificationCount(res.count);
          } else {
            console.warn("SidebarRecruiter: Không thể đồng bộ badge từ server");
          }
        })
        .catch((err) => {
          console.error("SidebarRecruiter: Lỗi khi đồng bộ badge:", err);
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
            console.log("SidebarRecruiter: Đã hiển thị browser notification");
          } catch (err) {
            console.error(
              "SidebarRecruiter: Lỗi khi tạo browser notification:",
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
      console.log("SidebarRecruiter: Có token, bắt đầu kết nối SignalR...");
      signalRService
        .startConnection(handleNewNotification)
        .then(() => {
          console.log("SidebarRecruiter: SignalR connection đã được khởi tạo");
        })
        .catch((err) => {
          console.error("SidebarRecruiter: Không thể khởi tạo SignalR:", err);
        });
    } else {
      console.warn(
        "SidebarRecruiter: Không có token, không thể kết nối SignalR"
      );
    }

    return () => {
      console.log(
        "SidebarRecruiter: Component unmount, nhưng giữ SignalR connection active"
      );
      // ✅ KHÔNG đóng connection để duy trì real-time notifications
      // Connection sẽ được maintain xuyên suốt session cho đến khi user logout
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
    updateNotificationCount(newCount);
  };

  const handleLogout = () => {
    // Đóng SignalR connection khi logout
    console.log("SidebarRecruiter: User logout, đóng SignalR connection");
    signalRService.stopConnection();

    localStorage.removeItem("employee");
    localStorage.removeItem("token");
    localStorage.removeItem("notificationCount");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  return (
    <aside className="h-screen w-64 bg-white/95 backdrop-blur-sm border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="h-36 px-4 flex items-center justify-center border-b border-slate-200 bg-slate-50/70 shadow-inner">
        <img
          src={logo}
          alt="Logo"
          className="h-24 w-auto object-contain drop-shadow-sm"
        />
      </div>

      {/* User info + bell */}
      <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-semibold shadow-sm">
          {initials}
        </div>
        <div className="flex flex-col flex-1">
          <span className="text-sm text-slate-800 font-semibold tracking-tight">
            {displayName}
          </span>
          <span className="text-xs text-slate-500">{t("sidebar_role")}</span>
        </div>

        <button
          className="relative p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200"
          onClick={() => {
            console.log("🔔 Bell clicked, count:", notificationCount);
            setIsNotificationModalOpen(true);
          }}
          aria-label={`Thông báo (${notificationCount} chưa đọc)`}
        >
          <FaBell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
              `group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                  : "text-slate-700 hover:bg-slate-100 border-transparent"
              }`
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-slate-600 group-hover:text-slate-800"
                    }`}
                  />
                  <span className="leading-5">{t(item.key)}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <FaSignOutAlt className="h-4 w-4 shrink-0" />
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
            <div className="px-4 py-3 flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold break-words">
                  {toastData.title || "Thông báo mới"}
                </div>
                <div className="text-xs text-slate-200 mt-1 break-words">
                  {toastData.body || "Bạn có thông báo mới"}
                </div>
              </div>
              <button
                onClick={() => {
                  console.log("SidebarRecruiter: Đóng toast");
                  setToastData((prev) => ({ ...prev, show: false }));
                }}
                className="text-slate-300 hover:text-white text-xs flex-shrink-0 ml-2 transition-colors"
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

export default SidebarRecruiter;
