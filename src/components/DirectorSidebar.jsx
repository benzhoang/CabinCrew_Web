import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../images/Logo.png";
import { t, onLangChange } from "../i18n";
import { FaBullhorn } from "react-icons/fa6";
import { FaInfoCircle, FaSignOutAlt } from "react-icons/fa";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "U";
}

const navItems = [
  {
    to: "/director/requirements",
    key: "sidebar_requirements",
    icon: FaInfoCircle,
  },
  { to: "/director/campaigns", key: "sidebar_campaign", icon: FaBullhorn },
];

const DirectorSidebar = ({ username = "Nguyễn Văn A" }) => {
  const [displayName, setDisplayName] = useState(username);
  const [role, setRole] = useState("Director");
  const initials = getInitials(displayName);
  const [, setLangTick] = useState(0);
  const navigate = useNavigate();

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
      console.error("DirectorSidebar: Error decoding JWT:", error);
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
      const employee = localStorage.getItem("employee");
      if (employee) {
        const employeeData = JSON.parse(employee);
        const nameFromStorage =
          employeeData.fullName ||
          employeeData.FullName ||
          employeeData.displayName ||
          employeeData.DisplayName ||
          employeeData.username ||
          username;

        setDisplayName(nameFromStorage);

        if (employeeData.role) {
          setRole(employeeData.role);
        } else if (employeeData.role === "director") {
          setRole("Director");
        }
        return;
      }

      // Fallback cuối cùng: dùng username prop
      setDisplayName(username);
    } catch (error) {
      console.error(
        "DirectorSidebar: Cannot parse employee from localStorage or token",
        error
      );
      setDisplayName(username);
    }
  }, [username]);

  useEffect(() => {
    const off = onLangChange(() => setLangTick((v) => v + 1));
    return () => off();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("employee");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  return (
    <aside className="h-screen w-64 bg-white/95 backdrop-blur-sm border-r border-slate-200 flex flex-col">
      <div className="h-36 px-4 flex items-center justify-center border-b border-slate-200 bg-slate-50/70 shadow-inner">
        <img
          src={logo}
          alt="Logo"
          className="h-24 w-auto object-contain drop-shadow-sm"
        />
      </div>

      <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-semibold shadow-sm">
          {initials}
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-slate-800 font-semibold tracking-tight">
            {displayName}
          </span>
          <span className="text-xs text-slate-500">{role}</span>
        </div>
      </div>

      <nav className="p-3 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
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
              {({ isActive }) => (
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
              )}
            </NavLink>
          );
        })}
      </nav>

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
    </aside>
  );
};

export default DirectorSidebar;
