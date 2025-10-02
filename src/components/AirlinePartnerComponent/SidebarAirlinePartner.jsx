import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../images/Logo.png";
import {
  FaBullhorn,
} from "react-icons/fa6";
import { FaFile, FaFolderOpen, FaSignOutAlt } from "react-icons/fa";

const SidebarAirlinePartner = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const isActive = (path) => currentPath.startsWith(path);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="w-74 h-full bg-gray-100 p-5">
      {/* Logo */}
      <div className="mb-6 px-2">
        <img src={Logo} alt="Logo" className="h-9 object-contain" />
      </div>

      {/* User card */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center">
        <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold mr-3">NA</div>
        <div>
          <div className="text-gray-900 font-semibold">Airline A</div>
          <div className="text-gray-500 text-sm">Airline Partner</div>
        </div>
      </div>

      {/* Navigation */}
      <ul className="list-none p-0 mt-0 space-y-1">
        <li>
          <Link
            to="/airline-partner/campaigns"
            className={`flex items-center p-3 no-underline transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 ${
              isActive("/airline-partner/campaigns")
                ? "text-cyan-600 bg-cyan-50"
                : "text-gray-700 hover:text-cyan-600"
            }`}
          >
            <FaBullhorn
              className={`mr-3 transition-colors duration-300 text-lg ${
                isActive("/airline-partner/campaigns") ? "text-cyan-600" : "text-gray-500"
              }`}
            />
            <span
              className={
                isActive("/airline-partner/campaigns")
                  ? "text-cyan-600"
                  : "text-gray-700 hover:text-cyan-600"
              }
            >
              Campaigns
            </span>
          </Link>
        </li>

        <li>
          <Link
            to="/airline-partner/report"
            className={`flex items-center p-3 no-underline transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 ${
              isActive("/airline-partner/report")
                ? "text-cyan-600 bg-cyan-50"
                : "text-gray-700 hover:text-cyan-600"
            }`}
          >
            <FaFile
              className={`mr-3 transition-colors duration-300 text-lg ${
                isActive("/airline-partner/report") ? "text-cyan-600" : "text-gray-500"
              }`}
            />
            <span
              className={
                isActive("/airline-partner/report")
                  ? "text-cyan-600"
                  : "text-gray-700 hover:text-cyan-600"
              }
            >
              Report
            </span>
          </Link>
        </li>
        <li>
        <button
          type="button"
          className="w-full flex items-center p-3 text-left transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 hover:text-red-600 text-gray-500 cursor-pointer"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="mr-3" />
          <span>Logout</span>
        </button>
        </li>
      </ul>

      {/* Footer */}
      <div className="absolute bottom-4 left-5 right-5">
        
      </div>
    </div>
  );
};

export default SidebarAirlinePartner;