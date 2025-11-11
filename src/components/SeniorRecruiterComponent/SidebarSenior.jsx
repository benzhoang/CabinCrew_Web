import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../images/Logo.png";
import { FaBullhorn } from "react-icons/fa6";
import { FaInfoCircle, FaSignOutAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { t, onLangChange } from "../../i18n";

const SidebarSenior = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [, setLangTick] = useState(0);
  const employeeData = JSON.parse(localStorage.getItem("employee") || "{}");
  const username = employeeData?.username;
  const role = employeeData?.role;

  const isActive = (path) => currentPath.startsWith(path);

  useEffect(() => {
    const off = onLangChange(() => setLangTick((v) => v + 1));
    return () => off();
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("employee");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  return (
    <div className="h-full p-5 bg-gray-100 w-74">
      {/* Logo */}
      <div className="px-2 mb-6">
        <img src={Logo} alt="Logo" className="object-contain h-9" />
      </div>

      {/* User card */}
      <div className="flex items-center p-4 mb-4 bg-white shadow-sm rounded-xl">
        <div className="flex items-center justify-center w-12 h-12 mr-3 font-semibold text-white bg-indigo-600 rounded-full">
          NA
        </div>
        <div>
          <div className="font-semibold text-gray-900">{username}</div>
          <div className="text-sm text-gray-500">{role}</div>
        </div>
      </div>

      {/* Navigation */}
      <ul className="p-0 mt-0 space-y-1 list-none">
        <li>
          <Link
            to="/senior-recruiter/requests"
            className={`flex items-center p-3 no-underline transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 ${
              isActive("/senior-recruiter/requests")
                ? "text-blue-600 bg-cyan-50"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            <FaInfoCircle
              className={`mr-3 transition-colors duration-300 text-lg ${
                isActive("/senior-recruiter/requests")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            />
            <span
              className={
                isActive("/senior-recruiter/requests")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }
            >
              {t("sidebar_request")}
            </span>
          </Link>
        </li>
        <li>
          <Link
            to="/senior-recruiter/campaigns"
            className={`flex items-center p-3 no-underline transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 ${
              isActive("/senior-recruiter/campaigns")
                ? "text-blue-600 bg-cyan-50"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            <FaBullhorn
              className={`mr-3 transition-colors duration-300 text-lg ${
                isActive("/senior-recruiter/campaigns")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            />
            <span
              className={
                isActive("/senior-recruiter/campaigns")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }
            >
              {t("sidebar_campaign")}
            </span>
          </Link>
        </li>

        <li>
          <button
            type="button"
            className="flex items-center w-full p-3 text-base font-medium text-left text-gray-500 transition-all duration-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:text-red-600"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="mr-3" />
            <span>{t("sidebar_logout")}</span>
          </button>
        </li>
      </ul>

      {/* Footer */}
      <div className="absolute bottom-4 left-5 right-5"></div>
    </div>
  );
};

export default SidebarSenior;
