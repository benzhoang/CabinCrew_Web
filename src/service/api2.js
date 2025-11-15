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

// API tạo campaign request mới - POST /api/v1/campaign-requests
export const createCampaignRequest = async (campaignRequestData) => {
  try {
    const response = await api2.post("/campaign-requests", campaignRequestData);

    // Log raw response để dễ debug giống createUser
    console.log("Raw Campaign Request Response:", response);

    const responseCode = response.data?.code;
    const normalizedCode =
      typeof responseCode === "string"
        ? responseCode.trim().toUpperCase()
        : responseCode;
    const responseMessage = response.data?.message || "";
    const httpSuccess = response.status >= 200 && response.status < 300;
    const successCodes = new Set([
      0,
      true,
      "SUCCESS",
      "CREATED_SUCCESS",
      "CREATED",
      "OK",
    ]);

    const messageImpliesSuccess =
      responseMessage.toLowerCase().includes("success") ||
      responseMessage.toLowerCase().includes("created");

    const isSuccess =
      successCodes.has(normalizedCode) ||
      successCodes.has(responseCode) ||
      response.data?.success === true ||
      response.data?.isSuccess === true ||
      messageImpliesSuccess ||
      (httpSuccess && (responseCode === undefined || responseCode === null));

    if (isSuccess) {
      return {
        success: true,
        data: response.data?.data ?? null,
        message:
          responseMessage ||
          (typeof normalizedCode === "string" ? normalizedCode : null) ||
          "Tạo campaign request thành công",
      };
    }

    return {
      success: false,
      error: responseMessage || "Tạo campaign request thất bại",
    };
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || error.message || "";
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
        error: errorMessage || "Tạo campaign request thất bại",
        status: error.response.status,
      };
    }

    return {
      success: false,
      error: error.message || "Tạo campaign request thất bại",
    };
  }
};

// API update campaign request to resubmit - PUT /api/v1/campaign-requests/{id}/resubmit
export const updateCampaignRequest = async (requestId, campaignRequestData) => {
  try {
    const response = await api2.put(
      `/campaign-requests/${requestId}/resubmit`,
      campaignRequestData
    );

    // Kiểm tra HTTP status code (200, 201 là success)
    const isHttpSuccess = response.status >= 200 && response.status < 300;

    // Kiểm tra code === 0 (success) theo format API
    const isSuccess =
      response.data.code === 0 ||
      (isHttpSuccess && response.data.code === undefined);

    if (isSuccess) {
      return {
        success: true,
        data: response.data.data || null,
        message:
          response.data.message || "Resubmit campaign request thành công",
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Resubmit campaign request thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Resubmit campaign request thất bại",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách campaigns - GET /api/v1/campaigns
export const getCampaignList = async (params = {}) => {
  try {
    const allowedParams = {
      searchTerm: params.searchTerm,
      sortColumn: params.sortColumn,
      sortOrder: params.sortOrder,
      status: params.status,
      partnerId: params.partnerId,
      page: params.page,
      pageSize: params.pageSize,
    };

    const sanitizedParams = Object.fromEntries(
      Object.entries(allowedParams).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const response = await api2.get("/campaigns", {
      params: sanitizedParams,
    });

    // Log response để debug
    console.log("Campaign List API Response:", response.data);

    // Kiểm tra nhiều trường hợp response structure
    const responseData = response.data;

    // Trường hợp 1: response.data.code === 0 và có response.data.data
    if (responseData.code === 0 && responseData.data) {
      const data = responseData.data;
      // Nếu data là array trực tiếp
      if (Array.isArray(data)) {
        return {
          success: true,
          data: {
            items: data,
            pagination: undefined,
          },
          message: responseData.message,
        };
      }
      // Nếu data có items hoặc là object với các trường pagination
      if (data.items || (data && typeof data === "object")) {
        return {
          success: true,
          data: {
            items: data.items || (Array.isArray(data) ? data : []),
            pagination: data.pagination
              ? {
                  currentPage: data.pagination.currentPage || 1,
                  pageSize: data.pagination.pageSize || 0,
                  totalRecords: data.pagination.totalRecords || 0,
                  totalPages: data.pagination.totalPages || 0,
                  hasNextPage: data.pagination.hasNextPage || false,
                  hasPreviousPage: data.pagination.hasPreviousPage || false,
                }
              : data.currentPage
              ? {
                  currentPage: data.currentPage || 1,
                  pageSize: data.pageSize || 0,
                  totalRecords: data.totalRecords || 0,
                  totalPages: data.totalPages || 0,
                  hasNextPage: data.hasNextPage || false,
                  hasPreviousPage: data.hasPreviousPage || false,
                }
              : undefined,
          },
          message: responseData.message,
        };
      }
    }

    // Trường hợp 2: response.data là array trực tiếp (không có code và data wrapper)
    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: {
          items: responseData,
          pagination: undefined,
        },
        message: "Success",
      };
    }

    // Trường hợp 3: response.data có items trực tiếp
    if (responseData.items && Array.isArray(responseData.items)) {
      return {
        success: true,
        data: {
          items: responseData.items,
          pagination: responseData.pagination || undefined,
        },
        message: responseData.message || "Success",
      };
    }

    // Nếu không match bất kỳ trường hợp nào
    return {
      success: false,
      error: responseData.message || "Lấy danh sách campaigns thất bại",
      rawResponse: responseData,
    };
  } catch (error) {
    console.error("Campaign List API Error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lấy danh sách campaigns thất bại",
      status: error.response?.status,
    };
  }
};

// API lấy chi tiết campaign theo ID - GET /api/v1/campaigns/{id}
export const getCampaignDetail = async (campaignId) => {
  try {
    const response = await api2.get(`/campaigns/${campaignId}`);

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
        error: response.data.message || "Lấy chi tiết campaign thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lấy chi tiết campaign thất bại",
      status: error.response?.status,
    };
  }
};

// API cập nhật campaign và tạo rounds - PUT /api/v1/campaigns/{id}/campaign-rounds
export const updateCampaignAndCreateRounds = async (
  campaignId,
  campaignData
) => {
  try {
    const response = await api2.put(
      `/campaigns/${campaignId}/campaign-rounds`,
      campaignData
    );

    // Kiểm tra HTTP status code (200, 201 là success)
    const isHttpSuccess = response.status >= 200 && response.status < 300;

    // Kiểm tra code === 0 (success) theo format API
    const isSuccess =
      response.data.code === 0 ||
      (isHttpSuccess && response.data.code === undefined);

    if (isSuccess) {
      return {
        success: true,
        data: response.data.data || null,
        message:
          response.data.message || "Cập nhật campaign và tạo rounds thành công",
      };
    } else {
      return {
        success: false,
        error:
          response.data.message || "Cập nhật campaign và tạo rounds thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Cập nhật campaign và tạo rounds thất bại",
      status: error.response?.status,
    };
  }
};

// API resubmit campaign - PUT /api/v1/campaigns/{id}/resubmit
export const resubmitCampaign = async (campaignId, campaignData) => {
  try {
    const response = await api2.put(
      `/campaigns/${campaignId}/resubmit`,
      campaignData
    );

    // Kiểm tra HTTP status code (200, 201 là success)
    const isHttpSuccess = response.status >= 200 && response.status < 300;

    // Kiểm tra code === 0 (success) theo format API
    const isSuccess =
      response.data.code === 0 ||
      (isHttpSuccess && response.data.code === undefined);

    if (isSuccess) {
      return {
        success: true,
        data: response.data.data || null,
        message: response.data.message || "Resubmit campaign thành công",
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Resubmit campaign thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Resubmit campaign thất bại",
      status: error.response?.status,
    };
  }
};

// API tạo test mới với audio file upload - POST /api/v1/tests
export const createTest = async (testData, audioFile) => {
  try {
    // Tạo FormData để gửi file và dữ liệu
    const formData = new FormData();

    // Append audio file nếu có (theo format API: AudioFile)
    if (audioFile) {
      formData.append("AudioFile", audioFile);
    }

    // Append các trường dữ liệu khác từ testData
    if (testData) {
      Object.keys(testData).forEach((key) => {
        // Bỏ qua AudioFile/audioFile nếu đã append riêng
        if (
          key !== "audioFile" &&
          key !== "AudioFile" &&
          testData[key] !== undefined &&
          testData[key] !== null
        ) {
          // Nếu là object hoặc array, stringify nó
          if (
            typeof testData[key] === "object" &&
            !(testData[key] instanceof File)
          ) {
            formData.append(key, JSON.stringify(testData[key]));
          } else {
            formData.append(key, testData[key]);
          }
        }
      });
    }

    // Gửi request với Content-Type: multipart/form-data
    const response = await api2.post("/tests", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 giây timeout cho upload file
    });

    // Log raw response để debug
    console.log("Raw Test Creation Response:", response);

    const responseCode = response.data?.code;
    const normalizedCode =
      typeof responseCode === "string"
        ? responseCode.trim().toUpperCase()
        : responseCode;
    const responseMessage = response.data?.message || "";
    const httpSuccess = response.status >= 200 && response.status < 300;
    const successCodes = new Set([
      0,
      true,
      "SUCCESS",
      "CREATED_SUCCESS",
      "CREATED",
      "OK",
    ]);

    const messageImpliesSuccess =
      responseMessage.toLowerCase().includes("success") ||
      responseMessage.toLowerCase().includes("created");

    const isSuccess =
      successCodes.has(normalizedCode) ||
      successCodes.has(responseCode) ||
      response.data?.success === true ||
      response.data?.isSuccess === true ||
      messageImpliesSuccess ||
      (httpSuccess && (responseCode === undefined || responseCode === null));

    if (isSuccess) {
      return {
        success: true,
        data: response.data?.data ?? null,
        message:
          responseMessage ||
          (typeof normalizedCode === "string" ? normalizedCode : null) ||
          "Tạo test thành công",
      };
    }

    return {
      success: false,
      error: responseMessage || "Tạo test thất bại",
    };
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || error.message || "";
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
        error: errorMessage || "Tạo test thất bại",
        status: error.response.status,
      };
    }

    return {
      success: false,
      error: error.message || "Tạo test thất bại",
    };
  }
};

export default api2;
