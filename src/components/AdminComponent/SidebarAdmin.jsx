import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaBullhorn,
  FaCalendar,
  FaGauge,
  FaUser,
  FaChevronDown,
} from "react-icons/fa6";
import { FaFileAlt, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import Logo from "../../images/Logo.png";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "U";
}

const SidebarAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isAccountOpen, setIsAccountOpen] = useState(
    currentPath.startsWith("/admin/account/")
  );
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(
    currentPath.startsWith("/admin/criteria/")
  );
  const [isConfigOpen, setIsConfigOpen] = useState(
    currentPath.startsWith("/admin/config/")
  );
  const [displayName, setDisplayName] = useState("Admin");
  const [role, setRole] = useState("Admin");
  const initials = getInitials(displayName);

  // Hàm decode JWT token
  const decodeJwt = (token) => {
    if (!token) {
      return null;
    }
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const paddedPayload =
        payload + "=".repeat((4 - (payload.length % 4)) % 4);
      const decoded = atob(paddedPayload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  useEffect(() => {
    // Auto-open submenu when navigating to any /user/* route
    if (currentPath.startsWith("/admin/account/")) {
      setIsAccountOpen(true);
    }
    if (currentPath.startsWith("/admin/criteria/")) {
      setIsCriteriaOpen(true);
    }
    if (currentPath.startsWith("/admin/config/")) {
      setIsConfigOpen(true);
    }
  }, [currentPath]);

  useEffect(() => {
    // Load user data from token first, then fallback to localStorage
    try {
      const token = localStorage.getItem("token");
      let nameFromToken = null;
      let roleFromToken = null;

      // Try to get name and role from token
      if (token) {
        const decoded = decodeJwt(token);
        if (decoded) {
          // Get name from token claims
          nameFromToken =
            decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ] ||
            decoded.name ||
            null;

          // Get role from token claims
          roleFromToken =
            decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ] ||
            decoded.role ||
            null;
        }
      }

      // Set from token if available, otherwise fallback to localStorage
      if (nameFromToken) {
        setDisplayName(nameFromToken);
      } else {
        // Fallback to localStorage
        const employee = localStorage.getItem("employee");
        if (employee) {
          const employeeData = JSON.parse(employee);
          const nameFromStorage =
            employeeData.username ||
            employeeData.displayName ||
            employeeData.fullName ||
            "Admin";
          setDisplayName(nameFromStorage);
        }
      }

      if (roleFromToken) {
        setRole(roleFromToken);
      } else {
        // Fallback to localStorage
        const employee = localStorage.getItem("employee");
        if (employee) {
          const employeeData = JSON.parse(employee);
          if (employeeData.role) {
            setRole(employeeData.role);
          } else {
            setRole("Admin");
          }
        }
      }
    } catch (error) {
      console.error(
        "SidebarAdmin: Error loading user data from token or localStorage",
        error
      );
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("employee");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  return (
    <aside className="flex flex-col w-72 h-screen overflow-y-auto border-r bg-white/95 backdrop-blur-sm border-slate-200">
      {/* Logo */}
      <div className="flex items-center justify-center px-4 border-b shadow-inner h-36 border-slate-200 bg-slate-50/70">
        <img
          src={Logo}
          alt="Logo"
          className="object-contain w-auto h-24 drop-shadow-sm"
        />
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200">
        <div className="flex items-center justify-center font-semibold text-white rounded-full shadow-sm h-11 w-11 bg-gradient-to-br from-indigo-700 to-indigo-500">
          {initials}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-slate-800">
            {displayName}
          </span>
          <span className="text-xs text-slate-500">{role}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1 list-none">
          <li>
            <Link
              to="/admin/dashboard"
              className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/dashboard"
                ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                : "text-slate-700 hover:bg-slate-100 border-transparent"
                }`}
            >
              <FaGauge
                className={`h-4 w-4 shrink-0 transition-colors ${currentPath === "/admin/dashboard"
                  ? "text-white"
                  : "text-slate-600 group-hover:text-slate-800"
                  }`}
              />
              <span className="leading-5">Dashboard</span>
            </Link>
          </li>
          {/* Criteria */}
          <li>
            <button
              type="button"
              onClick={() => {
                setIsCriteriaOpen(true);
                navigate("/admin/criteria/appearance");
              }}
              className={`group w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all text-left cursor-pointer ${currentPath.startsWith("/admin/criteria/")
                ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                : "text-slate-700 hover:bg-slate-100 border-transparent"
                }`}
            >
              <FaQuestionCircle
                className={`h-4 w-4 shrink-0 transition-colors ${currentPath.startsWith("/admin/criteria/")
                  ? "text-white"
                  : "text-slate-600 group-hover:text-slate-800"
                  }`}
              />
              <span className="flex-1 leading-5">Criteria Management</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCriteriaOpen((v) => !v);
                }}
                className={`p-1 rounded cursor-pointer transition-transform duration-200 ${isCriteriaOpen ? "rotate-180" : ""
                  } hover:bg-white/20`}
                aria-label="Toggle criteria submenu"
                role="button"
              >
                <FaChevronDown className="w-3 h-3" />
              </span>
            </button>
            <ul
              className={`${isCriteriaOpen ? "block" : "hidden"
                } mt-1 ml-7 space-y-1`}
            >
              <li>
                <Link
                  to="/admin/criteria/appearance"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/criteria/appearance"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">Appearance</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/criteria/interview"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/criteria/interview"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">Interview</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/criteria/requirement"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/criteria/requirement"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">Requirement</span>
                </Link>
              </li>
            </ul>
          </li>
          {/* Configuration */}
          <li>
            <button
              type="button"
              onClick={() => {
                setIsConfigOpen(true);
                navigate("/admin/config/round-type");
              }}
              className={`group w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all text-left cursor-pointer ${currentPath.startsWith("/admin/config/")
                ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                : "text-slate-700 hover:bg-slate-100 border-transparent"
                }`}
            >
              <FaCalendar
                className={`h-4 w-4 shrink-0 transition-colors ${currentPath.startsWith("/admin/config/")
                  ? "text-white"
                  : "text-slate-600 group-hover:text-slate-800"
                  }`}
              />
              <span className="flex-1 leading-5">Configuration Management</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfigOpen((v) => !v);
                }}
                className={`p-1 rounded cursor-pointer transition-transform duration-200 ${isConfigOpen ? "rotate-180" : ""
                  } hover:bg-white/20`}
                aria-label="Toggle configuration submenu"
                role="button"
              >
                <FaChevronDown className="w-3 h-3" />
              </span>
            </button>
            <ul
              className={`${isConfigOpen ? "block" : "hidden"
                } mt-1 ml-7 space-y-1`}
            >
              <li>
                <Link
                  to="/admin/config/round-type"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/config/round-type"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">Round Type</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/config/test-type"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/config/test-type"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">Test Type</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/config/city-ward"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/config/city-ward"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">City/Ward</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/config/airline-partners"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/config/airline-partners"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">Airline Partner</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/config/general"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/config/general"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">General</span>
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                setIsAccountOpen(true);
                navigate("/admin/account/cabin-crews");
              }}
              className={`group w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all text-left cursor-pointer ${currentPath.startsWith("/admin/account/")
                ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                : "text-slate-700 hover:bg-slate-100 border-transparent"
                }`}
            >
              <FaUser
                className={`h-4 w-4 shrink-0 transition-colors ${currentPath.startsWith("/admin/account/")
                  ? "text-white"
                  : "text-slate-600 group-hover:text-slate-800"
                  }`}
              />
              <span className="flex-1 leading-5">Account Management</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAccountOpen((v) => !v);
                }}
                className={`p-1 rounded cursor-pointer transition-transform duration-200 ${isAccountOpen ? "rotate-180" : ""
                  } hover:bg-white/20`}
                aria-label="Toggle user submenu"
                role="button"
              >
                <FaChevronDown className="w-3 h-3" />
              </span>
            </button>
            <ul
              className={`${isAccountOpen ? "block" : "hidden"
                } mt-1 ml-7 space-y-1`}
            >
              <li>
                <Link
                  to="/admin/account/cabin-crews"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/account/cabin-crews"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">Cabin Crew</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/account/candidates"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/account/candidates"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">Candidate</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/account/recruiters"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/account/recruiters"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">Recruiter</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/account/airline-partners"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/account/airline-partners"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">Airline Partner</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/account/examiners"
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/account/examiners"
                    ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                    : "text-slate-700 hover:bg-slate-100 border-transparent"
                    }`}
                >
                  <span className="leading-5">Examiner</span>
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              to="/admin/campaigns"
              className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/campaigns"
                ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                : "text-slate-700 hover:bg-slate-100 border-transparent"
                }`}
            >
              <FaBullhorn
                className={`h-4 w-4 shrink-0 transition-colors ${currentPath === "/admin/campaigns"
                  ? "text-white"
                  : "text-slate-600 group-hover:text-slate-800"
                  }`}
              />
              <span className="leading-5">Campaign Management</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/tests"
              className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${currentPath === "/admin/tests"
                ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                : "text-slate-700 hover:bg-slate-100 border-transparent"
                }`}
            >
              <FaFileAlt
                className={`h-4 w-4 shrink-0 transition-colors ${currentPath === "/admin/tests"
                  ? "text-white"
                  : "text-slate-600 group-hover:text-slate-800"
                  }`}
              />
              <span className="leading-5">Test Management</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer with Logout */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <FaSignOutAlt className="w-4 h-4 shrink-0" />
          <span className="leading-5">Logout</span>
        </button>
        <div className="mt-2 text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} Cabin HR
        </div>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
