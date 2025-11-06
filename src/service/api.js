import axios from "axios";

// Base URL cho API
const API_BASE_URL = "https://cabincrewcareer.azurewebsites.net/api/v1";

// Tạo axios instance với cấu hình mặc định
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// API đăng nhập
export const login = async (username, password) => {
    try {
        const response = await api.post("/auth/login", {
            username,
            password,
        });

        // Kiểm tra code === 0 (success) theo format API
        if (response.data.code === 0 && response.data.data) {
            return {
                success: true,
                data: response.data.data, // accessToken, refreshToken
                message: response.data.message,
            };
        } else {
            return {
                success: false,
                error: response.data.message || "Đăng nhập thất bại",
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || "Đăng nhập thất bại",
            status: error.response?.status,
        };
    }
};

export default api;

