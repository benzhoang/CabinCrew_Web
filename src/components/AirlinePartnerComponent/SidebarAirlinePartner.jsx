import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../images/Logo.png";
import { FaBullhorn } from "react-icons/fa6";
import { FaClipboardCheck, FaInfoCircle, FaSignOutAlt } from "react-icons/fa";

const SidebarAirlinePartner = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const employeeData = JSON.parse(localStorage.getItem("employee") || "{}");
  const username = employeeData?.username;
  const role = employeeData?.role;

  const isActive = (path) => currentPath.startsWith(path);

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
            to="/airline-partner/requests"
            className={`flex items-center p-3 no-underline transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 ${
              isActive("/airline-partner/requests")
                ? "text-blue-600 bg-cyan-50"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            <FaInfoCircle
              className={`mr-3 transition-colors duration-300 text-lg ${
                isActive("/airline-partner/requests")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            />
            <span
              className={
                isActive("/airline-partner/requests")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }
            >
              Request
            </span>
          </Link>
        </li>
        <li>
          <Link
            to="/airline-partner/campaigns"
            className={`flex items-center p-3 no-underline transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 ${
              isActive("/airline-partner/campaigns")
                ? "text-blue-600 bg-cyan-50"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            <FaBullhorn
              className={`mr-3 transition-colors duration-300 text-lg ${
                isActive("/airline-partner/campaigns")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            />
            <span
              className={
                isActive("/airline-partner/campaigns")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }
            >
              Campaign
            </span>
          </Link>
        </li>
        <li>
          <Link
            to="/airline-partner/criteria"
            className={`flex items-center p-3 no-underline transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 ${
              isActive("/airline-partner/criteria")
                ? "text-blue-600 bg-cyan-50"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            <FaClipboardCheck
              className={`mr-3 transition-colors duration-300 text-lg ${
                isActive("/airline-partner/criteria")
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            />
            <span
              className={
                isActive("/airline-partner/criteria")
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }
            >
              Criteria
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
            <span>Logout</span>
          </button>
        </li>
      </ul>

      {/* Footer */}
      <div className="absolute bottom-4 left-5 right-5"></div>
    </div>
  );
};

export default SidebarAirlinePartner;
