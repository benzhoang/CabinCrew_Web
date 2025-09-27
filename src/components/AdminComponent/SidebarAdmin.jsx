import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaBullhorn,
  FaCalendar,
  FaGauge,
  FaUser,
  FaChevronDown,
} from "react-icons/fa6";
import { FaFileAlt, FaQuestionCircle } from "react-icons/fa";
const SidebarAdmin = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isAccountOpen, setIsAccountOpen] = useState(currentPath.startsWith("/admin/account/"));
  const [isDashboardOpen, setIsDashboardOpen] = useState(currentPath.startsWith("/admin/dashboard/"));

  useEffect(() => {
    // Auto-open submenu when navigating to any /user/* route
    if (currentPath.startsWith("/admin/account/")) {
      setIsAccountOpen(true);
    }
    // Auto-open submenu when navigating to any /dashboard/* route
    if (currentPath.startsWith("/admin/dashboard/")) {
      setIsDashboardOpen(true);
    }
  }, [currentPath]);

  return (
    <div
      className={`w-74 h-full bg-gray-100 p-5  ${
        isOpen ? "open" : "collapsed"
      }`}
    >
      {/* Navigation */}
      <ul className="list-none p-0 mt-0 space-y-1">
        <li>
          <button
            type="button"
            onClick={() => {
              setIsDashboardOpen(true);
              navigate("/admin/dashboard/cabin-crews");
            }}
            className={`w-full flex items-center p-3 text-left transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 cursor-pointer ${
                currentPath.startsWith("/admin/dashboard/")
                ? "text-cyan-600 bg-cyan-50"
                : "text-gray-700 hover:text-cyan-600"
            }`}
          >
            <FaGauge
              className={`mr-3 transition-colors duration-300 text-lg ${
                currentPath.startsWith("/admin/dashboard/")
                  ? "text-cyan-600"
                  : "text-gray-500"
              }`}
            />
            <span
              className={
                currentPath.startsWith("/admin/dashboard/")
                  ? "text-cyan-600"
                  : "text-gray-700 hover:text-cyan-600"
              }
            >
              Dashboard
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsDashboardOpen((v) => !v);
              }}
              className={`ml-auto p-1 rounded cursor-pointer transition-transform duration-200 ${
                isDashboardOpen ? "rotate-180" : ""
              } hover:bg-gray-100`}
              aria-label="Toggle dashboard submenu"
              role="button"
            >
              <FaChevronDown />
            </span>
          </button>
          <ul
            className={`${
              isDashboardOpen ? "block" : "hidden"
            } mt-1 ml-10 space-y-1`}
          >
            <li>
              <Link
                to="/admin/dashboard/cabin-crews"
                className={`flex items-center p-2 no-underline rounded-md transition-colors ${
                  currentPath === "/admin/dashboard/cabin-crews"
                    ? "text-cyan-600 bg-cyan-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>Cabin Crew</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/dashboard/candidates"
                className={`flex items-center p-2 no-underline rounded-md transition-colors ${
                  currentPath === "/admin/dashboard/candidates"
                    ? "text-cyan-600 bg-cyan-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>Candidate</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/dashboard/airline-partners"
                className={`flex items-center p-2 no-underline rounded-md transition-colors ${
                  currentPath === "/admin/dashboard/airline-partners"
                    ? "text-cyan-600 bg-cyan-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>Airline Partner</span>
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
            className={`w-full flex items-center p-3 text-left transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 cursor-pointer ${
                currentPath.startsWith("/admin/account/")
                ? "text-cyan-600 bg-cyan-50"
                : "text-gray-700 hover:text-cyan-600"
            }`}
          >
            <FaUser
              className={`mr-3 transition-colors duration-300 text-lg ${
                currentPath.startsWith("/admin/account/")
                  ? "text-cyan-600"
                  : "text-gray-500"
              }`}
            />
            <span
              className={
                currentPath.startsWith("/admin/account/")
                  ? "text-cyan-600"
                  : "text-gray-700 hover:text-cyan-600"
              }
            >
              Account Management
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsAccountOpen((v) => !v);
              }}
              className={`ml-auto p-1 rounded cursor-pointer transition-transform duration-200 ${
                isAccountOpen ? "rotate-180" : ""
              } hover:bg-gray-100`}
              aria-label="Toggle user submenu"
              role="button"
            >
              <FaChevronDown />
            </span>
          </button>
          <ul
            className={`${
              isAccountOpen ? "block" : "hidden"
            } mt-1 ml-10 space-y-1`}
          >
            <li>
              <Link
                to="/admin/account/cabin-crews"
                className={`flex items-center p-2 no-underline rounded-md transition-colors ${
                  currentPath === "/admin/account/cabin-crews"
                    ? "text-cyan-600 bg-cyan-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>Cabin Crew</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/account/recruiters"
                className={`flex items-center p-2 no-underline rounded-md transition-colors ${
                  currentPath === "/admin/account/recruiters"
                    ? "text-cyan-600 bg-cyan-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>Recruiter</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/account/candidates"
                className={`flex items-center p-2 no-underline rounded-md transition-colors ${
                  currentPath === "/admin/account/candidates"
                    ? "text-cyan-600 bg-cyan-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>Candidate</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/account/airline-partners"
                className={`flex items-center p-2 no-underline rounded-md transition-colors ${
                  currentPath === "/admin/account/airline-partners"
                    ? "text-cyan-600 bg-cyan-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>Airline Partner</span>
              </Link>
            </li>
          </ul>
        </li>
        <li>
          <Link
            to="/admin/campaigns"
            className={`flex items-center p-3 no-underline transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 ${
              currentPath === "/admin/campaigns"
                ? "text-cyan-600 bg-cyan-50"
                : "text-gray-700 hover:text-cyan-600"
            }`}
          >
            <FaBullhorn
              className={`mr-3 transition-colors duration-300 text-lg ${
                currentPath === "/admin/campaigns"
                  ? "text-cyan-600"
                  : "text-gray-500"
              }`}
            />
            <span
              className={
                currentPath === "/admin/campaigns"
                  ? "text-cyan-600"
                  : "text-gray-700 hover:text-cyan-600"
              }
            >
              Campaign
            </span>
          </Link>
        </li>
        <li>
          <Link
            to=""
            className={`flex items-center p-3 no-underline transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 ${
              currentPath === ""
                ? "text-cyan-600 bg-cyan-50"
                : "text-gray-700 hover:text-cyan-600"
            }`}
          >
            <FaFileAlt
              className={`mr-3 transition-colors duration-300 text-lg ${
                currentPath === "" ? "text-cyan-600" : "text-gray-500"
              }`}
            />
            <span
              className={
                currentPath === ""
                  ? "text-cyan-600"
                  : "text-gray-700 hover:text-cyan-600"
              }
            >
              Test
            </span>
          </Link>
        </li>
        <li>
          <Link
            to=""
            className={`flex items-center p-3 no-underline transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 ${
              currentPath === "/assessment-list"
                ? "text-cyan-600 bg-cyan-50"
                : "text-gray-700 hover:text-cyan-600"
            }`}
          >
            <FaCalendar
              className={`mr-3 transition-colors duration-300 text-lg ${
                currentPath === "/assessment-list"
                  ? "text-cyan-600"
                  : "text-gray-500"
              }`}
            />
            <span
              className={
                currentPath === "/assessment-list"
                  ? "text-cyan-600"
                  : "text-gray-700 hover:text-cyan-600"
              }
            >
              Interview schedule
            </span>
          </Link>
        </li>
        <li>
          <Link
            to=""
            className={`flex items-center p-3 no-underline transition-all duration-300 text-base font-medium rounded-lg hover:bg-gray-50 ${
              currentPath === ""
                ? "text-cyan-600 bg-cyan-50"
                : "text-gray-700 hover:text-cyan-600"
            }`}
          >
            <FaQuestionCircle
              className={`mr-3 transition-colors duration-300 text-lg ${
                currentPath === "" ? "text-cyan-600" : "text-gray-500"
              }`}
            />
            <span
              className={
                currentPath === ""
                  ? "text-cyan-600"
                  : "text-gray-700 hover:text-cyan-600"
              }
            >
              Q&A
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SidebarAdmin;
