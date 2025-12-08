import { useNavigate } from "react-router-dom";
import Logo from "../../images/Logo.png";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";

const HeaderAdmin = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const employeeData = JSON.parse(localStorage.getItem("employee") || "{}");
  const username = employeeData?.username;

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("employee");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  return (
    <nav className="relative z-40 flex items-center h-16 px-6 shadow-sm bg-gray-50">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <button
            className="p-0 mr-4 text-gray-800 cursor-pointer hover:text-black hover:no-underline"
            onClick={toggleSidebar}
          >
            <FaBars className="text-2xl" />
          </button>
          <img src={Logo} alt="Logo" className="object-contain h-9" />
        </div>

        {/* Profile (right) with hover dropdown */}
        <div className="relative group mr-10 z-[60]">
          <div className="flex items-center cursor-pointer select-none">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png"
              alt="Ảnh đại diện Admin"
              className="object-cover w-10 h-10 mr-3 rounded-full"
            />
            <div className="text-sm font-semibold text-gray-700">
              {username}
            </div>
          </div>

          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
            {/* Invisible bridge để dễ hover từ profile đến dropdown */}
            <div className="py-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-left text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <FaSignOutAlt className="mr-3" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderAdmin;
