import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../images/Logo.png";
import Loading from "../components/Loading";
import { login as loginAPI } from "../service/api.js";

const MainPage = () => {
  const navigate = useNavigate();

  // Data giả để test login - ĐÃ ẨN, sử dụng API thật
  // const testUsers = {
  //   candidate: {
  //     username: "testuser",
  //     password: "123456",
  //     displayName: "Test Candidate",
  //     role: "candidate",
  //   },
  //   admin: {
  //     username: "admin",
  //     password: "admin123",
  //     displayName: "System Admin",
  //     role: "admin",
  //   },
  //   recruiter: {
  //     username: "recruiter",
  //     password: "recruiter123",
  //     displayName: "HR Recruiter",
  //     role: "recruiter",
  //   },
  //   "airline-partner": {
  //     username: "airline",
  //     password: "airline123",
  //     displayName: "Airline Partner",
  //     role: "airline-partner",
  //   },
  //   "cabin-crew": {
  //     username: "cabincrew",
  //     password: "cabincrew123",
  //     displayName: "Cabin Crew",
  //     role: "cabin-crew",
  //   },
  //   director: {
  //     username: "director",
  //     password: "director123",
  //     displayName: "Director",
  //     role: "director",
  //   },
  //   examiner: {
  //     username: "examiner",
  //     password: "examiner123",
  //     displayName: "Examiner",
  //     role: "examiner",
  //   },
  //   "senior-recruiter": {
  //     username: "senior",
  //     password: "senior123",
  //     displayName: "Senior Recruiter",
  //     role: "senior-recruiter",
  //   },
  // };

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const loginTimeoutRef = useRef(null);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
    };
  }, []);

  // Hàm decode JWT để lấy thông tin từ token
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  // Hàm map role từ API sang format trong app
  const mapRole = (apiRole) => {
    if (!apiRole) return null;

    // Chuyển sang lowercase và map các role đặc biệt
    const roleMap = {
      candidate: "candidate",
      admin: "admin",
      recruiter: "recruiter",
      airlinepartner: "airline-partner",
      "airline-partner": "airline-partner",
      cabincrew: "cabin-crew",
      "cabin-crew": "cabin-crew",
      examiner: "examiner",
      director: "director",
      seniorrecruiter: "senior-recruiter",
      "senior-recruiter": "senior-recruiter",
    };

    const normalizedRole = apiRole.toLowerCase().replace(/\s+/g, "");
    return roleMap[normalizedRole] || normalizedRole;
  };

  // Mapping role với route tương ứng
  const roleRoutes = {
    candidate: "/home",
    admin: "/admin/dashboard/cabin-crews",
    recruiter: "/recruiter/campaigns",
    "airline-partner": "/airline-partner/requests",
    "cabin-crew": "/cabin-crew/home",
    examiner: "/examiner/campaigns",
    director: "/director/requirements",
    "senior-recruiter": "/senior-recruiter/requests",
  };

  // Hàm tự động điều hướng theo role
  const navigateByRole = (role) => {
    const route = roleRoutes[role];
    if (route) {
      navigate(route);
    } else {
      alert(`Role "${role}" không được hỗ trợ. Vui lòng liên hệ quản trị viên.`);
      console.error("Unsupported role:", role);
    }
  };

  const handleInputChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Kiểm tra thông tin đăng nhập cơ bản
    if (!loginData.username || !loginData.password) {
      alert("Vui lòng điền đầy đủ thông tin đăng nhập");
      return;
    }

    // Clear timeout cũ nếu có
    if (loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
    }

    // Hiển thị loading
    setIsLoading(true);
    setLoadingMessage("Đang xác thực thông tin đăng nhập...");

    // Tạo timeout 30 giây
    loginTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setLoadingMessage("");
      navigate("/");
      alert("Lỗi đăng nhập");
      loginTimeoutRef.current = null;
    }, 30000);

    try {
      // Gọi API đăng nhập
      const result = await loginAPI(loginData.username, loginData.password);

      // Clear timeout khi có kết quả
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }

      if (result.success && result.data) {
        const { accessToken, refreshToken } = result.data;

        // Decode JWT để lấy thông tin user
        const decodedToken = decodeJWT(accessToken);

        if (!decodedToken) {
          if (loginTimeoutRef.current) {
            clearTimeout(loginTimeoutRef.current);
            loginTimeoutRef.current = null;
          }
          setIsLoading(false);
          setLoadingMessage("");
          alert("Không thể xác thực token. Vui lòng thử lại.");
          return;
        }

        // Lấy role từ JWT token (có thể nằm ở nhiều vị trí khác nhau)
        const apiRole =
          decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          decodedToken.role ||
          decodedToken.Role ||
          decodedToken.roles?.[0];

        // Map role từ API sang format trong app
        const mappedRole = mapRole(apiRole);

        if (!mappedRole) {
          if (loginTimeoutRef.current) {
            clearTimeout(loginTimeoutRef.current);
            loginTimeoutRef.current = null;
          }
          setIsLoading(false);
          setLoadingMessage("");
          alert("Không thể xác định role của người dùng.");
          console.error("Decoded token:", decodedToken);
          return;
        }

        // Lấy user ID từ token
        const userId =
          decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"] ||
          decodedToken.sub ||
          decodedToken.userId ||
          decodedToken.id;

        // Tạo userInfo object
        const userInfo = {
          username: loginData.username,
          displayName: decodedToken.name || decodedToken.unique_name || loginData.username,
          role: mappedRole,
          userId: userId,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };

        // Lưu thông tin vào localStorage theo role
        if (mappedRole === "candidate" || mappedRole === "cabin-crew") {
          localStorage.setItem("user", JSON.stringify(userInfo));
          localStorage.removeItem("employee");
        } else if (
          mappedRole === "admin" ||
          mappedRole === "recruiter" ||
          mappedRole === "airline-partner" ||
          mappedRole === "director" ||
          mappedRole === "senior-recruiter" ||
          mappedRole === "examiner"
        ) {
          localStorage.setItem("employee", JSON.stringify(userInfo));
          localStorage.removeItem("user");
        }

        // Lưu tokens
        localStorage.setItem("token", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        window.dispatchEvent(new Event("auth-changed"));

        setIsLoading(false);
        setLoadingMessage("");

        // Tự động điều hướng theo role
        navigateByRole(mappedRole);
      } else {
        if (loginTimeoutRef.current) {
          clearTimeout(loginTimeoutRef.current);
          loginTimeoutRef.current = null;
        }
        setIsLoading(false);
        setLoadingMessage("");
        alert(result.error || "Thông tin đăng nhập không đúng");
      }
    } catch (error) {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }
      setIsLoading(false);
      setLoadingMessage("");
      alert("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
      console.error("Login error:", error);
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
