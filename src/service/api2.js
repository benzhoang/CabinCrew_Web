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

// API tạo tài khoản mới
export const createUser = async (userData) => {
  try {
    const response = await api2.post("/users", userData);

    // Log raw response để debug
    console.log("Raw API Response:", response);
    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);

    // Kiểm tra HTTP status code (200, 201 là success)
    const isHttpSuccess = response.status >= 200 && response.status < 300;

    // Lấy message từ response
    const responseMessage = response.data.message || "";
    const isSuccessMessage =
      responseMessage.toLowerCase().includes("success") ||
      responseMessage.toLowerCase().includes("created");

    // Kiểm tra code === 0 (success) theo format API
    // Hoặc HTTP status success, hoặc message chứa "success"/"created"
    const isSuccess =
      response.data.code === 0 ||
      (isHttpSuccess && response.data.code === undefined) ||
      (isHttpSuccess && isSuccessMessage);

    if (isSuccess) {
      return {
        success: true,
        data: response.data.data || null,
        message: responseMessage || "Tạo tài khoản thành công",
      };
    } else {
      return {
        success: false,
        error: responseMessage || "Tạo tài khoản thất bại",
      };
    }
  } catch (error) {
    // Nếu có response từ server (lỗi 4xx, 5xx)
    if (error.response) {
      // Kiểm tra xem có phải là success message trong error không
      const errorMessage = error.response.data?.message || error.message;

      // Nếu message chứa "success" hoặc "created", có thể là success
      if (
        errorMessage.toLowerCase().includes("success") ||
        errorMessage.toLowerCase().includes("created")
      ) {
        return {
          success: true,
          data: error.response.data?.data || null,
          message: errorMessage,
        };
      }

      return {
        success: false,
        error: errorMessage || "Tạo tài khoản thất bại",
        status: error.response.status,
      };
    }

    return {
      success: false,
      error: error.message || "Tạo tài khoản thất bại",
    };
  }
};

// API disable account - DELETE /api/v1/users/{id}
export const disableAccount = async (userId) => {
  try {
    const response = await api2.delete(`/users/${userId}`);

    if (
      response.data.code === 0 ||
      (response.status >= 200 && response.status < 300)
    ) {
      return {
        success: true,
        data: response.data.data || null,
        message: response.data.message || "Vô hiệu hóa tài khoản thành công",
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Vô hiệu hóa tài khoản thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Vô hiệu hóa tài khoản thất bại",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách campaign requests với pagination và filtering
export const getCampaignRequestList = async (params = {}) => {
  try {
    const allowedParams = {
      searchTerm: params.searchTerm,
      sortColumn: params.sortColumn,
      sortOrder: params.sortOrder,
      status: params.status,
      requestType: params.requestType,
      partnerId: params.partnerId,
      page: params.page,
      pageSize: params.pageSize,
    };

    const sanitizedParams = Object.fromEntries(
      Object.entries(allowedParams).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const response = await api2.get("/campaign-requests", {
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
        error:
          response.data.message || "Lấy danh sách campaign requests thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lấy danh sách campaign requests thất bại",
      status: error.response?.status,
    };
  }
};

// API lấy chi tiết campaign request theo ID
export const getCampaignRequestDetail = async (requestId) => {
  try {
    const response = await api2.get(`/campaign-requests/${requestId}`);

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
        error:
          response.data.message || "Lấy chi tiết campaign request thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lấy chi tiết campaign request thất bại",
      status: error.response?.status,
    };
  }
};

export default api2;
