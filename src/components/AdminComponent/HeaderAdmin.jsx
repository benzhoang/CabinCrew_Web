import { useNavigate } from "react-router-dom";
import Logo from "../../images/Logo.png";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";

const HeaderAdmin = ({ toggleSidebar }) => {

  const navigate = useNavigate();


  const handleLogout = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <nav className="h-16 bg-gray-50 flex items-center shadow-sm px-6 relative z-40">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <button
            className="text-gray-800 p-0 mr-4 hover:text-black hover:no-underline cursor-pointer"
            onClick={toggleSidebar}
          >
            <FaBars className="text-2xl" />
          </button>
          <img src={Logo} alt="Logo" className="h-9 object-contain" />
        </div>

        {/* Profile (right) with hover dropdown */}
        <div className="relative group mr-10 z-[60]">
          <div className="flex items-center cursor-pointer select-none">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png"
              alt="Ảnh đại diện Admin"
              className="rounded-full w-10 h-10 mr-3 object-cover"
            />
            <div className="text-sm font-semibold text-gray-700">Admin</div>
          </div>

          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
            {/* Invisible bridge để dễ hover từ profile đến dropdown */}
            <div className="absolute -top-2 left-0 right-0 h-2"></div>
            <div className="py-2">
              <button
                className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <FaUserCircle className="mr-3" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
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