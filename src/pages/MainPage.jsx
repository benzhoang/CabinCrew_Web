import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../images/Logo.png";
import Loading from "../components/Loading";
import { login as loginAPI } from "../service/api.js";
import { t, onLangChange } from "../i18n";
import { toast } from "react-toastify";

const MainPage = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageKey, setLoadingMessageKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [, forceRender] = useState(0);
  const loginTimeoutRef = useRef(null);

  // Re-render when language changes
  useEffect(() => {
    const off = onLangChange(() => forceRender((v) => v + 1));
    return () => off();
  }, []);

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
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
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
    candidate: "/recruitment",
    admin: "/admin/dashboard",
    recruiter: "/recruiter/campaigns",
    "airline-partner": "/airline-partner/requests",
    "cabin-crew": "/cabin-crew/promotion",
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
      const errorMsg = `${t("role_unsupported")}: ${role || ""}`;
      setErrorMessage(errorMsg.trim());
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

    // Clear error message
    setErrorMessage("");

    // Kiểm tra thông tin đăng nhập cơ bản
    if (!loginData.username || !loginData.password) {
      const errorMsg = t("signin_missing_fields");
      setErrorMessage(errorMsg);
      return;
    }

    // Clear timeout cũ nếu có
    if (loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
    }

    // Hiển thị loading
    setIsLoading(true);
    setLoadingMessageKey("loading_authenticating");

    // Tạo timeout 30 giây
    loginTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setLoadingMessageKey("");
      const errorMsg = t("signin_timeout_error");
      setErrorMessage(errorMsg);
      navigate("/");
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
          setLoadingMessageKey("");
          const errorMsg = t("signin_token_invalid");
          setErrorMessage(errorMsg);
          return;
        }

        // Lấy role từ JWT token (có thể nằm ở nhiều vị trí khác nhau)
        const apiRole =
          decodedToken[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] ||
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
          setLoadingMessageKey("");
          const errorMsg = t("signin_role_unknown");
          setErrorMessage(errorMsg);
          console.error("Decoded token:", decodedToken);
          return;
        }

        // Lấy user ID từ token
        const userId =
          decodedToken[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"
          ] ||
          decodedToken.sub ||
          decodedToken.userId ||
          decodedToken.id;

        // Tạo userInfo object
        const userInfo = {
          username: loginData.username,
          displayName:
            decodedToken.name || decodedToken.unique_name || loginData.username,
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
        setLoadingMessageKey("");
        setErrorMessage("");

        // Hiển thị toast thành công
        toast.success(t("signin_success"));

        // Tự động điều hướng theo role
        navigateByRole(mappedRole);
      } else {
        if (loginTimeoutRef.current) {
          clearTimeout(loginTimeoutRef.current);
          loginTimeoutRef.current = null;
        }
        setIsLoading(false);
        setLoadingMessageKey("");
        const errorMsg = result.error || t("signin_invalid_credentials");
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }
      setIsLoading(false);
      setLoadingMessageKey("");
      const errorMsg = t("signin_error_generic");
      setErrorMessage(errorMsg);
      console.error("Login error:", error);
    }
  };

  return (
    <>
      {isLoading && (
        <Loading
          message={loadingMessageKey ? t(loadingMessageKey) : undefined}
        />
      )}
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md">
          {/* Back to Home Button */}
          <div className="mb-6">
            <Link
              to="/home"
              className="inline-flex items-center font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5 mr-2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t("back_to_home")}
            </Link>
          </div>

          {/* Logo */}
          <div className="mb-8 text-center">
            <img
              src={logoImage}
              alt="CabinCrew Airlines"
              className="w-auto h-16 mx-auto mb-4"
            />
            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              {t("mainpage_title")}
            </h1>
            <p className="text-gray-600">
              {t("mainpage_subtitle")}
            </p>
          </div>

          {/* Login Form */}
          <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
              <h2 className="text-xl font-bold text-center text-white">
                {t("signin_title")}
              </h2>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-6">
                <p className="text-center text-gray-600">
                  {t("signin_prompt")}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Error Message */}
                {errorMessage && (
                  <div className="px-4 py-3 text-red-600 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-sm font-medium">{errorMessage}</p>
                  </div>
                )}

                {/* Username Field */}
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    {t("username_label")}
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={loginData.username}
                    onChange={(e) => {
                      handleInputChange(e);
                      setErrorMessage("");
                    }}
                    className="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-500 transition-colors duration-200 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t("username_placeholder")}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    {t("password_label")}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={loginData.password}
                      onChange={(e) => {
                        handleInputChange(e);
                        setErrorMessage("");
                      }}
                      className="w-full px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-500 transition-colors duration-200 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("password_placeholder")}
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? t("password_hide") : t("password_show")
                      }
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition-colors duration-200 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-5 h-5"
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
                          className="w-5 h-5"
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
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="remember-me"
                      className="block ml-2 text-sm text-gray-700"
                    >
                      {t("remember_me")}
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
                    >
                      {t("forgot_password")}
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-6 py-3 font-semibold text-white transition-all duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-xl"
                >
                  {t("login_button")}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {t("no_account")}{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
                  >
                    {t("signup_now")}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-sm text-center text-gray-500">
            <p>{t("copyright")}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
