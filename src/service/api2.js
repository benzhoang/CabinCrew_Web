import axios from "axios";

// Base URL cho API
const API_BASE_URL = "https://cabincrewcareer.azurewebsites.net/api/v1";

// Tạo axios instance với cấu hình mặc định
const api2 = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào mọi request
api2.interceptors.request.use(
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

// API lấy tất cả tài khoản
export const getAllUsers = async (params = {}) => {
  try {
    const allowedParams = {
      searchTerm: params.searchTerm,
      sortColumn: params.sortColumn,
      sortOrder: params.sortOrder,
      isActive: params.isActive,
      roleId: params.roleId,
      partnerId: params.partnerId,
      page: params.page,
      pageSize: params.pageSize,
    };

    const sanitizedParams = Object.fromEntries(
      Object.entries(allowedParams).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const response = await api2.get("/users", {
      params: sanitizedParams,
    });

    // Kiểm tra code === 0 (success) theo format API
    if (response.data.code === 0 && response.data.data) {
      return {
        success: true,
        data: {
          items: response.data.data.items || [],
          pagination: {
            currentPage: response.data.data.currentPage || 1,
            pageSize: response.data.data.pageSize || 0,
            totalRecords: response.data.data.totalRecords || 0,
            totalPages: response.data.data.totalPages || 0,
            hasNextPage: response.data.data.hasNextPage || false,
            hasPreviousPage: response.data.data.hasPreviousPage || false,
          },
        },
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Lấy danh sách tài khoản thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lấy danh sách tài khoản thất bại",
      status: error.response?.status,
    };
  }
};

export default api2;
