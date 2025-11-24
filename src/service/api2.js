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

// API lấy danh sách campaigns được giao cho recruiter/examiner
export const getMyCampaigns = async () => {
  try {
    const response = await api2.get("/users/my-campaigns");
    const responseData = response.data;

    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData,
        message: "Lấy danh sách chiến dịch thành công",
      };
    }

    if (responseData.code === 0) {
      let items = [];

      if (Array.isArray(responseData.data)) {
        items = responseData.data;
      } else if (Array.isArray(responseData.data?.items)) {
        items = responseData.data.items;
      } else if (
        responseData.data?.data &&
        Array.isArray(responseData.data.data)
      ) {
        items = responseData.data.data;
      }

      return {
        success: true,
        data: items,
        pagination: {
          currentPage: responseData.data?.currentPage,
          pageSize: responseData.data?.pageSize,
          totalRecords: responseData.data?.totalRecords,
          totalPages: responseData.data?.totalPages,
          hasNextPage: responseData.data?.hasNextPage,
          hasPreviousPage: responseData.data?.hasPreviousPage,
        },
        message: responseData.message,
      };
    }

    return {
      success: false,
      error: responseData.message || "Không thể lấy danh sách chiến dịch",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy danh sách chiến dịch",
      status: error.response?.status,
    };
  }
};

// API lấy chi tiết campaign theo ID - GET /api/v1/campaigns/{id}
export const getCampaignDetail = async (campaignId) => {
  try {
    const response = await api2.get(`/campaigns/${campaignId}`);
    const responseData = response.data;

    // Trường hợp API chuẩn: { code: 0, data: {...} }
    if (responseData?.code === 0 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message,
      };
    }

    // Một số API trả về { success: true, data: {...} }
    if (
      (responseData?.success === true || responseData?.isSuccess === true) &&
      responseData?.data
    ) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || "Lấy chi tiết campaign thành công",
      };
    }

    // Trường hợp API trả về trực tiếp object campaign
    if (
      responseData &&
      typeof responseData === "object" &&
      !Array.isArray(responseData)
    ) {
      const hasCampaignShape =
        responseData.campaignId !== undefined ||
        responseData.campaignName !== undefined ||
        responseData.status !== undefined ||
        responseData.id !== undefined;

      if (hasCampaignShape) {
        return {
          success: true,
          data: responseData,
          message: responseData.message || "Lấy chi tiết campaign thành công",
        };
      }
    }

    return {
      success: false,
      error: responseData?.message || "Lấy chi tiết campaign thất bại",
      rawResponse: responseData,
    };
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

    // Kiểm tra success dựa trên success flag hoặc code (code 0 hoặc 4 là success)
    // Code 4 cũng được coi là success (có thể là warning/info code)
    const responseCode = response.data.code;
    const isSuccess =
      responseCode === 0 ||
      responseCode === 4 ||
      (isHttpSuccess && responseCode === undefined);

    // Luôn trả về message nếu có trong response
    const responseMessage = response.data.message;

    if (isSuccess) {
      return {
        success: true,
        data: response.data.data || null,
        message:
          responseMessage || "Cập nhật campaign và tạo rounds thành công",
        code: response.data.code,
      };
    } else {
      return {
        success: false,
        error: responseMessage || "Cập nhật campaign và tạo rounds thất bại",
        message: responseMessage, // Vẫn trả về message để hiển thị
        code: response.data.code,
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Cập nhật campaign và tạo rounds thất bại",
      message: error.response?.data?.message, // Vẫn trả về message để hiển thị
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

// API lấy danh sách tests
export const getTests = async (page = 1, pageSize = 10) => {
  try {
    const response = await api2.get("/tests", {
      params: {
        page: page,
        pageSize: pageSize,
      },
    });

    console.log("Raw API Response:", response.data);

    if (response.data.code === 0 && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Không thể lấy danh sách đề thi",
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy danh sách đề thi",
      status: error.response?.status,
    };
  }
};

// API lấy interview criterias cho promotion - GET /api/v1/interview-criterias/promotion
export const getInterviewCriteriasPromotion = async () => {
  try {
    const response = await api2.get("/interview-criterias/promotion");

    // Kiểm tra code === 0 (success) theo format API
    if (response.data.code === 0 && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message:
          response.data.message ||
          "Lấy interview criterias cho promotion thành công",
      };
    } else {
      return {
        success: false,
        error:
          response.data.message ||
          "Lấy interview criterias cho promotion thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lấy interview criterias cho promotion thất bại",
      status: error.response?.status,
    };
  }
};

// API lấy tất cả users của một role cụ thể - GET /api/v1/roles/{id}/users
export const getUsersByRole = async (roleId) => {
  try {
    const response = await api2.get(`/roles/${roleId}/users`);

    // Kiểm tra code === 0 (success) theo format API
    if (response.data.code === 0 && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message:
          response.data.message || "Lấy danh sách users theo role thành công",
      };
    } else {
      return {
        success: false,
        error:
          response.data.message || "Lấy danh sách users theo role thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lấy danh sách users theo role thất bại",
      status: error.response?.status,
    };
  }
};

// API gán recruiters và examiners cho campaign - POST /api/v1/campaign-assignments/assign (Senior Recruiter only)
export const assignCampaignUsers = async (assignmentData) => {
  try {
    const response = await api2.post(
      "/campaign-assignments/assign",
      assignmentData
    );

    const responseCode = response.data?.code;
    const responseMessage = response.data?.message || "";

    // Code 2 = CREATED_SUCCESS: Giao việc thành công
    if (responseCode === 2) {
      return {
        success: true,
        data: response.data.data || null,
        message: responseMessage || "Giao việc thành công",
        code: responseCode,
      };
    }

    // Xử lý các error code
    let errorMessage = responseMessage;

    // Map các error code sang message tiếng Việt
    const errorCodeMap = {
      24: "Campaign không tồn tại",
      26: "Campaign không ở trạng thái Approved",
      10: "Không xác định được người giao việc",
      14: "User không tồn tại",
      27: "Campaign đã được giao việc rồi",
      28: "User đang có campaign ongoing",
      29: "User có campaign overlap thời gian",
    };

    if (responseCode && errorCodeMap[responseCode]) {
      errorMessage = errorCodeMap[responseCode];
    }

    return {
      success: false,
      error:
        errorMessage || "Gán recruiters và examiners cho campaign thất bại",
      code: responseCode,
    };
  } catch (error) {
    // Xử lý error từ catch (network error, 4xx, 5xx)
    const errorResponse = error.response?.data;
    const errorCode = errorResponse?.code;
    const errorMessage = errorResponse?.message || "";

    // Map các error code sang message tiếng Việt
    const errorCodeMap = {
      24: "Campaign không tồn tại",
      26: "Campaign không ở trạng thái Approved",
      10: "Không xác định được người giao việc",
      14: "User không tồn tại",
      27: "Campaign đã được giao việc rồi",
      28: "User đang có campaign ongoing",
      29: "User có campaign overlap thời gian",
    };

    let finalErrorMessage = errorMessage;
    if (errorCode && errorCodeMap[errorCode]) {
      finalErrorMessage = errorCodeMap[errorCode];
    }

    return {
      success: false,
      error:
        finalErrorMessage ||
        error.message ||
        "Gán recruiters và examiners cho campaign thất bại",
      status: error.response?.status,
      code: errorCode,
    };
  }
};

// API hủy assignment cho một user - PUT /api/v1/campaign-assignments/{assignmentId}/cancel
// (Senior Recruiter/Manager only)
export const cancelCampaignAssignment = async (assignmentId) => {
  try {
    const response = await api2.put(
      `/campaign-assignments/${assignmentId}/cancel`
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
        message: response.data.message || "Hủy assignment cho user thành công",
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Hủy assignment cho user thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Hủy assignment cho user thất bại",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách tests được gán cho user hiện tại (tự động lấy userId từ token)
export const getMyTests = async () => {
  try {
    const response = await api2.get("/tests/my-tests");

    console.log("Raw API Response getMyTests:", response.data);
    console.log("Response status:", response.status);
    console.log("Response data.code:", response.data?.code);
    console.log("Response data.data:", response.data?.data);

    // Kiểm tra nếu có data trong response (dù code có thể !== 0)
    const hasData =
      response.data.data &&
      ((response.data.data.tests &&
        Array.isArray(response.data.data.tests) &&
        response.data.data.tests.length > 0) ||
        (Array.isArray(response.data.data) && response.data.data.length > 0));

    // Nếu có data, coi như success (một số API trả về code !== 0 nhưng vẫn có data hợp lệ)
    if (response.data.code === 0 || hasData) {
      return {
        success: true,
        data: response.data.data || null,
        message: response.data.message,
        rawResponse: response.data,
      };
    } else {
      // API trả về code !== 0 và không có data
      console.warn("API returned code !== 0 and no data:", response.data.code);
      return {
        success: false,
        error: response.data.message || "Không thể lấy danh sách đề thi",
        data: response.data.data || null,
        rawResponse: response.data,
      };
    }
  } catch (error) {
    console.error("API Error getMyTests:", error);
    console.error("Error response:", error.response?.data);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy danh sách đề thi",
      status: error.response?.status,
    };
  }
};

// API lấy câu hỏi đề thi cho Cabin Crew và Candidate để làm bài
// Yêu cầu: testId và joinCode (10 ký tự)
export const getExamQuestions = async (testId, joinCode) => {
  try {
    // Kiểm tra testId và joinCode hợp lệ
    if (!testId) {
      return {
        success: false,
        error: "Test ID không được để trống",
      };
    }

    // Convert testId sang number nếu là string
    const testIdNum =
      typeof testId === "string" ? parseInt(testId, 10) : Number(testId);
    if (isNaN(testIdNum) || testIdNum <= 0) {
      return {
        success: false,
        error: "Test ID không hợp lệ",
      };
    }

    if (!joinCode || joinCode.length !== 10) {
      return {
        success: false,
        error: "Join Code phải có đúng 10 ký tự",
      };
    }

    console.log("Calling API with:", { testId: testIdNum, joinCode });

    const response = await api2.get("/test-questions/exam", {
      params: {
        testId: testIdNum,
        joinCode: joinCode,
      },
    });

    const responseData = response.data;
    console.log("API Response:", responseData);

    // Kiểm tra nếu có data trong response (bất kể code là gì, miễn là có data)
    // Một số API trả về code khác 0 nhưng vẫn có data hợp lệ
    if (responseData.data && responseData.data.questions) {
      console.log(
        "API Success - Questions count:",
        responseData.data.questions?.length || 0
      );
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || "Lấy câu hỏi thành công",
      };
    }
    // Nếu không có data, kiểm tra code === 0 (success) theo format API chuẩn
    else if (responseData.code === 0 && responseData.data) {
      console.log(
        "API Success - Questions count:",
        responseData.data.questions?.length || 0
      );
      return {
        success: true,
        data: responseData.data,
        message: responseData.message,
      };
    } else {
      console.error(
        "API Error - code:",
        responseData.code,
        "message:",
        responseData.message
      );
      return {
        success: false,
        error: responseData.message || "Không thể lấy câu hỏi đề thi",
      };
    }
  } catch (error) {
    console.error("API Error getExamQuestions:", error);
    console.error("Error response:", error.response?.data);
    const errorData = error.response?.data;
    return {
      success: false,
      error:
        errorData?.message || error.message || "Không thể lấy câu hỏi đề thi",
      status: error.response?.status,
    };
  }
};

// API lấy chiến dịch đang ứng tuyển của user
export const getOngoingCampaign = async () => {
  try {
    const response = await api2.get("/users/ongoing-campaign");
    const responseData = response.data;

    if (responseData?.code === 0 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message,
      };
    }

    return {
      success: false,
      error:
        responseData?.message ||
        "Không thể lấy thông tin chiến dịch đang ứng tuyển",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy thông tin chiến dịch đang ứng tuyển",
      status: error.response?.status,
    };
  }
};

export default api2;
