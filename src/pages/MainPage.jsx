import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../images/Logo.png";
import Loading from "../components/Loading";

const MainPage = () => {
  const navigate = useNavigate();

  // Data giả để test login
  const testUsers = {
    candidate: {
      username: "testuser",
      password: "123456",
      displayName: "Test Candidate",
      role: "candidate",
    },
    admin: {
      username: "admin",
      password: "admin123",
      displayName: "System Admin",
      role: "admin",
    },
    recruiter: {
      username: "recruiter",
      password: "recruiter123",
      displayName: "HR Recruiter",
      role: "recruiter",
    },
    "airline-partner": {
      username: "airline",
      password: "airline123",
      displayName: "Airline Partner",
      role: "airline-partner",
    },
    "cabin-crew": {
      username: "cabincrew",
      password: "cabincrew123",
      displayName: "Cabin Crew",
      role: "cabin-crew",
    },
    director: {
      username: "director",
      password: "director123",
      displayName: "Director",
      role: "director",
    },
    "senior-recruiter": {
      username: "senior",
      password: "senior123",
      displayName: "Senior Recruiter",
      role: "senior-recruiter",
    },
  };

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Hàm helper để kiểm tra login
  const checkLogin = (username, password) => {
    for (const [, userData] of Object.entries(testUsers)) {
      if (userData.username === username && userData.password === password) {
        return userData;
      }
    }
    return null;
  };

  const handleInputChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Kiểm tra thông tin đăng nhập cơ bản
    if (!loginData.username || !loginData.password) {
      alert("Vui lòng điền đầy đủ thông tin đăng nhập");
      return;
    }

    // Kiểm tra với data giả
    const userData = checkLogin(loginData.username, loginData.password);

    if (userData) {
      // Lưu thông tin vào localStorage theo role
      if (userData.role === "candidate" || userData.role === "cabin-crew") {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.removeItem("employee");
      } else if (
        userData.role === "admin" ||
        userData.role === "recruiter" ||
        userData.role === "airline-partner" ||
        userData.role === "director"||
        userData.role === "senior-recruiter"
      ) {
        localStorage.setItem("employee", JSON.stringify(userData));
        localStorage.removeItem("user");
      }
      window.dispatchEvent(new Event("auth-changed"));

      // Hiển thị loading
      setIsLoading(true);
      setLoadingMessage("Đang xác thực thông tin đăng nhập...");

      // Chờ 3 giây trước khi chuyển trang
      setTimeout(() => {
        setIsLoading(false);
        // Chuyển hướng theo role
        switch (userData.role) {
          case "candidate":
            navigate("/home");
            break;
          case "admin":
            navigate("/admin/dashboard/cabin-crews");
            break;
          case "recruiter":
            navigate("/recruiter/campaigns");
            break;
          case "airline-partner":
            navigate("/airline-partner/campaigns");
            break;
          case "cabin-crew":
            navigate("/cabin-crew/home");
            break;
          case "director":
            navigate("/director/campaigns");
            break;
          case "senior-recruiter":
            navigate("/senior-recruiter/campaigns");
            break;
          default:
            alert("Role không được hỗ trợ");
        }
      }, 3000);
    } else {
      alert("Thông tin đăng nhập không đúng");
    }
  };

  return (
    <>
      {isLoading && <Loading message={loadingMessage} />}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to Home Button */}
          <div className="mb-6">
            <Link
              to="/home"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5 mr-2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Quay trở lại trang chủ
            </Link>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src={logoImage}
              alt="SkyCabin Airlines"
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              SkyCabin Airlines
            </h1>
            <p className="text-gray-600">
              Hệ thống tuyển dụng và nâng bậc nhân viên hàng không
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white text-center">
                Đăng nhập hệ thống
              </h2>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-6">
                <p className="text-gray-600 text-center">
                  Nhập thông tin đăng nhập để truy cập hệ thống
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username Field */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tên đăng nhập
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={loginData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={loginData.password}
                      onChange={handleInputChange}
                      className="w-full pr-12 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Nhập mật khẩu"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                        >
                          <path d="M3 3l18 18" />
                          <path d="M10.584 10.59a2 2 0 102.828 2.83" />
                          <path d="M16.681 16.69A10.941 10.941 0 0112 18c-5 0-9-4.5-10-6 0 0 1.273-1.947 3.5-3.6M14.12 5.11A10.94 10.94 0 0112 6c5 0 9 4.5 10 6 0 0-1.055 1.615-2.94 3.17" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                        >
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Nhớ đăng nhập
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Đăng nhập
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Chưa có tài khoản?{" "}
                  <Link
                    to="/signup"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>© 2025 SkyCabin Airlines. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
