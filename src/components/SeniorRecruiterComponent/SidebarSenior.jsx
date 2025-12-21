import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "../../images/Logo.png";
import { FaBullhorn } from "react-icons/fa6";
import { FaInfoCircle, FaSignOutAlt } from "react-icons/fa";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "U";
}

const SidebarSenior = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Senior Recruiter");
  const [role, setRole] = useState("Senior Recruiter");
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
            "Senior Recruiter";
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
            setRole("Senior Recruiter");
          }
        }
      }
    } catch (error) {
      console.error(
        "SidebarSenior: Error loading user data from token or localStorage",
        error
      );
    }
  }, []);

  const isActive = (path) => currentPath.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("employee");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  return (
    <aside className="flex flex-col w-64 h-screen overflow-y-auto border-r bg-white/95 backdrop-blur-sm border-slate-200">
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
              to="/senior-recruiter/requests"
              className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${
                isActive("/senior-recruiter/requests")
                  ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                  : "text-slate-700 hover:bg-slate-100 border-transparent"
              }`}
            >
              <FaInfoCircle
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive("/senior-recruiter/requests")
                    ? "text-white"
                    : "text-slate-600 group-hover:text-slate-800"
                }`}
              />
              <span className="leading-5">Requests</span>
            </Link>
          </li>
          <li>
            <Link
              to="/senior-recruiter/campaigns"
              className={`group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium mb-1 border-l-2 transition-all no-underline ${
                isActive("/senior-recruiter/campaigns")
                  ? "bg-indigo-600 text-white shadow-sm border-indigo-600"
                  : "text-slate-700 hover:bg-slate-100 border-transparent"
              }`}
            >
              <FaBullhorn
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive("/senior-recruiter/campaigns")
                    ? "text-white"
                    : "text-slate-600 group-hover:text-slate-800"
                }`}
              />
              <span className="leading-5">Campaigns</span>
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

export default SidebarSenior;
