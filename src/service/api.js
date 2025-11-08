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

// Interceptor để tự động thêm token vào header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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

// API đăng ký
export const register = async (payload) => {
    try {
        const response = await api.post("/auth/registration", payload);

        if (response.data.code === 0 && response.data.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        }

        return {
            success: false,
            error: response.data.message || "Đăng ký thất bại",
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || "Đăng ký thất bại",
            status: error.response?.status,
        };
    }
};

// API lấy thông tin user theo ID
export const getUserProfile = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}`);

        // Kiểm tra code === 0 (success) theo format API
        if (response.data.code === 0 && response.data.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } else {
            return {
                success: false,
                error: response.data.message || "Không thể lấy thông tin người dùng",
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || "Không thể lấy thông tin người dùng",
            status: error.response?.status,
        };
    }
};

// API lấy danh sách thành phố
export const getCities = async () => {
    try {
        const response = await api.get("/cities");

        if (response.data.code === 0 && response.data.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        }

        return {
            success: false,
            error: response.data.message || "Không thể lấy danh sách thành phố",
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || "Không thể lấy danh sách thành phố",
            status: error.response?.status,
        };
    }
};

// API lấy danh sách phường/xã theo cityId
export const getWardsForCity = async (cityId) => {
    try {
        const response = await api.get(`/cities/${cityId}/wards`);

        if (response.data.code === 0 && response.data.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        }

        return {
            success: false,
            error: response.data.message || "Không thể lấy danh sách phường/xã",
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || "Không thể lấy danh sách phường/xã",
            status: error.response?.status,
        };
    }
};

export default api;