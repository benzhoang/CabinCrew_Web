import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../images/Logo.png";
import { t, onLangChange } from "../i18n";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "U";
}

const FolderIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
  >
    <path d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
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

const RequirementsIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
  >
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
  {
    to: "/director/requirements",
    key: "sidebar_requirements",
    icon: RequirementsIcon,
  },
  { to: "/director/campaigns", key: "sidebar_campaign", icon: CampaignIcon },
];

const DirectorSidebar = ({ username = "Nguyễn Văn A" }) => {
  const [displayName, setDisplayName] = useState(username);
  const [role, setRole] = useState("Director");
  const initials = getInitials(displayName);
  const [, setLangTick] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Load employee data from localStorage và ưu tiên username/full name
    try {
      const employee = localStorage.getItem("employee");
      if (employee) {
        const employeeData = JSON.parse(employee);
        const nameFromStorage =
          employeeData.username ||
          employeeData.displayName ||
          employeeData.fullName ||
          username;

        setDisplayName(nameFromStorage);

        if (employeeData.role) {
          setRole(employeeData.role);
        } else if (employeeData.role === "director") {
          setRole("Director");
        }
      }
    } catch (error) {
      console.error("DirectorSidebar: Cannot parse employee from localStorage", error);
    }
  }, []);

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
          <LogoutIcon className="h-4 w-4 shrink-0" />
          <span className="leading-5">{t("sidebar_logout")}</span>
        </button>
        <div className="text-xs text-slate-500 mt-2">
          © {new Date().getFullYear()} Cabin HR
        </div>
      </div>
    </aside>
  );
};

export default DirectorSidebar;
