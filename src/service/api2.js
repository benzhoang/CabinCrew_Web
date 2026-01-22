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
        error: response.data.message || "Failed to get user list",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get user list",
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
        message: responseMessage || "Create user successfully",
      };
    } else {
      return {
        success: false,
        error: responseMessage || "Create user failed",
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
        error: errorMessage || "Create user failed",
        status: error.response.status,
      };
    }

    return {
      success: false,
      error: error.message || "Create user failed",
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
        message: response.data.message || "Disable account successfully",
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Disable account failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Disable account failed",
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
        error: response.data.message || "Failed to get campaign request list",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get campaign request list",
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
        error: response.data.message || "Failed to get campaign request detail",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get campaign request detail",
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
          "Create campaign request successfully",
      };
    }

    return {
      success: false,
      error: responseMessage || "Create campaign request failed",
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
        error: errorMessage || "Create campaign request failed",
        status: error.response.status,
      };
    }

    return {
      success: false,
      error: error.message || "Create campaign request failed",
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
          response.data.message || "Resubmit campaign request successfully",
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Resubmit campaign request failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Resubmit campaign request failed",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách campaigns - GET /api/v1/campaigns
export const getCampaignList = async (params = {}) => {
  try {
    const response = await api2.get("/campaigns", { params });
    const responseData = response.data;

    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData,
        message: "Get campaign list successfully",
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
      error: responseData.message || "Failed to get campaign list",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get campaign list",
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
      error: responseData?.message || "Failed to get ongoing campaign",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get ongoing campaign",
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
        message: "Get my campaigns successfully",
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
      error: responseData.message || "Failed to get my campaigns",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get my campaigns",
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
        message: responseData.message || "Get campaign detail successfully",
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
          message: responseData.message || "Get campaign detail successfully",
        };
      }
    }

    return {
      success: false,
      error: responseData?.message || "Failed to get campaign detail",
      rawResponse: responseData,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get campaign detail",
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
          responseMessage || "Update campaign and create rounds successfully",
        code: response.data.code,
      };
    } else {
      return {
        success: false,
        error: responseMessage || "Update campaign and create rounds failed",
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
        "Update campaign and create rounds failed",
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
        message: response.data.message || "Resubmit campaign successfully",
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Resubmit campaign failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Resubmit campaign failed",
      status: error.response?.status,
    };
  }
};

// API lấy thông tin đợt tuyển (campaign round) theo ID
export const getCampaignRoundById = async (id) => {
  try {
    const response = await api2.get(`/campaign-rounds/${id}`);
    const responseData = response.data;

    if (responseData?.code === 0 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message,
      };
    }

    // Một số API trả trực tiếp object mà không bọc trong {code, data}
    if (
      responseData &&
      typeof responseData === "object" &&
      !Array.isArray(responseData)
    ) {
      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message || "Get round detail successfully",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Failed to get round detail",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get round detail",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách participants (ứng viên) theo roundId
export const getRoundParticipants = async (roundId, params = {}) => {
  try {
    const response = await api2.get(`/rounds/${roundId}/participants`, {
      params,
    });
    const responseData = response.data;

    if (responseData?.code === 0 && responseData?.data) {
      return {
        success: true,
        data: responseData.data.items || [],
        pagination: {
          currentPage: responseData.data.currentPage,
          pageSize: responseData.data.pageSize,
          totalRecords: responseData.data.totalRecords,
          totalPages: responseData.data.totalPages,
          hasNextPage: responseData.data.hasNextPage,
          hasPreviousPage: responseData.data.hasPreviousPage,
        },
        message: responseData.message,
      };
    }

    // Một số API trả trực tiếp array
    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData,
        message: "Get round participants successfully",
      };
    }

    // Nếu data là array trực tiếp
    if (Array.isArray(responseData?.data)) {
      return {
        success: true,
        data: responseData.data,
        pagination: responseData.pagination,
        message: responseData.message || "Get round participants successfully",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Failed to get round participants",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get round participants",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách loại bài test - GET /api/v1/test-types
export const getTestTypes = async () => {
  try {
    const response = await api2.get("/test-types");
    const responseData = response.data;

    // Chuẩn success theo pattern code === 0 hoặc HTTP 2xx có data
    if (response.status >= 200 && response.status < 300 && responseData) {
      const list =
        responseData?.data && Array.isArray(responseData.data)
          ? responseData.data
          : Array.isArray(responseData)
            ? responseData
            : null;

      if (list) {
        return {
          success: true,
          data: list,
          message: responseData?.message || "Get test types successfully",
        };
      }
    }

    return {
      success: false,
      error: responseData?.message || "Failed to get test types",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get test types",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách configurations - GET /api/v1/configurations
export const getConfigurations = async (campaignType = null, roundTypeId = null, page = 1, pageSize = 5) => {
  try {
    const params = {};
    if (campaignType !== null && campaignType !== undefined) {
      params.campaignType = campaignType;
    }
    if (roundTypeId !== null && roundTypeId !== undefined && roundTypeId !== "") {
      params.roundTypeId = roundTypeId;
    }
    if (page !== null && page !== undefined) {
      params.page = page;
    }
    if (pageSize !== null && pageSize !== undefined) {
      params.pageSize = pageSize;
    }
    const response = await api2.get("/configurations", { params });
    const responseData = response.data;

    // Chuẩn success theo pattern code === 0 hoặc HTTP 2xx có data
    if (response.status >= 200 && response.status < 300 && responseData) {
      let list = null;
      let pagination = null;

      // Kiểm tra responseData.data.items (trường hợp data là object có items với pagination)
      if (responseData?.data?.items && Array.isArray(responseData.data.items)) {
        list = responseData.data.items;
        // Lấy pagination info từ responseData.data
        pagination = {
          currentPage: responseData.data.currentPage || page,
          pageSize: responseData.data.pageSize || pageSize,
          totalPages: responseData.data.totalPages || 1,
          totalRecords: responseData.data.totalRecords || list.length,
          hasNextPage: responseData.data.hasNextPage || false,
          hasPreviousPage: responseData.data.hasPreviousPage || false,
        };
      }
      // Kiểm tra responseData.data là array trực tiếp
      else if (responseData?.data && Array.isArray(responseData.data)) {
        list = responseData.data;
      }
      // Kiểm tra responseData là array trực tiếp
      else if (Array.isArray(responseData)) {
        list = responseData;
      }

      if (list) {
        return {
          success: true,
          data: list,
          pagination: pagination,
          message: responseData?.message || "Get configurations successfully",
        };
      }
    }

    return {
      success: false,
      error: responseData?.message || "Failed to get configurations",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get configurations",
      status: error.response?.status,
    };
  }
};

// API lấy configuration theo ID - GET /api/v1/configurations/{id}
export const getConfigurationById = async (id) => {
  try {
    const response = await api2.get(`/configurations/${id}`);
    const responseData = response.data;

    // Chuẩn success theo pattern code === 0 hoặc HTTP 2xx có data
    if (response.status >= 200 && response.status < 300 && responseData) {
      const data =
        responseData?.data && typeof responseData.data === "object"
          ? responseData.data
          : responseData;

      if (data) {
        return {
          success: true,
          data: data,
          message: responseData?.message || "Get configuration successfully",
        };
      }
    }

    return {
      success: false,
      error: responseData?.message || "Failed to get configuration",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get configuration",
      status: error.response?.status,
    };
  }
};

// API tạo configuration - POST /api/v1/configurations
export const createConfiguration = async (roundTypeId, benchmark) => {
  try {
    const requestBody = {
      roundTypeId: roundTypeId,
      benchmark: benchmark,
    };

    const response = await api2.post("/configurations", requestBody);

    // Log raw response để debug
    console.log("Raw API Response:", response);
    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);

    // Kiểm tra HTTP status code (200, 201 là success)
    const isHttpSuccess = response.status >= 200 && response.status < 300;

    // Lấy message từ response
    const responseMessage = response.data?.message || "";
    const isSuccessMessage =
      responseMessage.toLowerCase().includes("success") ||
      responseMessage.toLowerCase().includes("created");

    // Kiểm tra code === 0 (success) theo format API
    // Hoặc HTTP status success, hoặc message chứa "success"/"created"
    const isSuccess =
      response.data?.code === 0 ||
      (isHttpSuccess && response.data?.code === undefined) ||
      (isHttpSuccess && isSuccessMessage);

    if (isSuccess) {
      return {
        success: true,
        data: response.data?.data || null,
        message: responseMessage || "Create configuration successfully",
      };
    }

    return {
      success: false,
      error: responseMessage || "Failed to create configuration",
    };
  } catch (error) {
    const errorData = error.response?.data;
    return {
      success: false,
      error:
        errorData?.errorMessage ||
        errorData?.message ||
        error.message ||
        "Failed to create configuration",
      status: error.response?.status,
    };
  }
};

// API cập nhật configuration - POST /api/v1/configurations
export const updateConfiguration = async (configData) => {
  try {
    // Chuẩn bị request body theo format API
    const requestBody = {
      configurationId: configData.roundConfigurationId || configData.id || 0,
      campaignType: configData.campaignType || 0,
      configurationType: configData.configurationType || 1,
      benchmark: configData.benchmark || 0,
    };

    const response = await api2.post("/configurations", requestBody);
    const responseData = response.data;

    // Chuẩn success theo pattern code === 0 hoặc HTTP 2xx
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: responseData?.data || responseData,
        message: responseData?.message || "Update configuration successfully",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Failed to update configuration",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to update configuration",
      status: error.response?.status,
    };
  }
};

// API tạo loại bài test mới - POST /api/v1/test-types
export const createTestType = async (testTypeName) => {
  try {
    const trimmedName =
      typeof testTypeName === "string"
        ? testTypeName.trim()
        : String(testTypeName || "").trim();

    if (!trimmedName) {
      return {
        success: false,
        error: "Test type name is required",
      };
    }

    const body = {
      testTypeName: trimmedName,
    };

    const response = await api2.post("/test-types", body);
    const responseData = response.data;

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: responseData?.data || responseData,
        message: responseData?.message || "Create test type successfully",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Cannot create test type",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Cannot create test type",
      status: error.response?.status,
    };
  }
};

// API cập nhật loại bài test - PUT /api/v1/test-types/{id}
export const updateTestType = async (id, testTypeName) => {
  try {
    const parsedId = typeof id === "string" ? parseInt(id, 10) : Number(id);
    const trimmedName =
      typeof testTypeName === "string"
        ? testTypeName.trim()
        : String(testTypeName || "").trim();

    if (!parsedId || Number.isNaN(parsedId) || parsedId <= 0) {
      return {
        success: false,
        error: "Test type id is required",
      };
    }

    if (!trimmedName) {
      return {
        success: false,
        error: "Test type name is required",
      };
    }

    // Swagger hiển thị body "string" => gửi chuỗi tên trực tiếp.
    const body = trimmedName;

    const response = await api2.put(`/test-types/${parsedId}`, body);
    const responseData = response.data;

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: responseData?.data || responseData,
        message: responseData?.message || "Update test type successfully",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Cannot update test type",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Cannot update test type",
      status: error.response?.status,
    };
  }
};

// API xoá loại bài test - DELETE /api/v1/test-types/{id}
export const deleteTestType = async (id) => {
  try {
    const parsedId = typeof id === "string" ? parseInt(id, 10) : Number(id);

    if (!parsedId || Number.isNaN(parsedId) || parsedId <= 0) {
      return {
        success: false,
        error: "Test type id is required",
      };
    }

    const response = await api2.delete(`/test-types/${parsedId}`);
    const responseData = response.data;

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: responseData?.data || responseData,
        message: responseData?.message || "Delete test type successfully",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Cannot delete test type",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Cannot delete test type",
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
          "Create test successfully",
      };
    }

    return {
      success: false,
      error: responseMessage || "Create test failed",
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
        error: errorMessage || "Create test failed",
        status: error.response.status,
      };
    }

    return {
      success: false,
      error: error.message || "Create test failed",
    };
  }
};

// API lấy danh sách tests
export const getTests = async (page = 1, pageSize = 10, params = {}) => {
  try {
    const requestParams = {
      page: page,
      pageSize: pageSize,
      ...params,
    };

    const response = await api2.get("/tests", {
      params: requestParams,
    });

    console.log("Raw API Response:", response.data);

    const responseData = response.data;

    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData,
        message: "Get test list successfully",
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
        message: responseData.message || "Get test list successfully",
      };
    } else {
      return {
        success: false,
        error: responseData.message || "Failed to get test list",
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get test list",
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
          "Get interview criterias for promotion successfully",
      };
    } else {
      return {
        success: false,
        error:
          response.data.message ||
          "Get interview criterias for promotion failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Get interview criterias for promotion failed",
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
        message: response.data.message || "Get users by role successfully",
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Get users by role failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Get users by role failed",
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
        message: responseMessage || "Assign campaign tasks successfully",
        code: responseCode,
      };
    }

    // Xử lý các error code
    let errorMessage = responseMessage;

    // Map các error code sang message tiếng Việt
    const errorCodeMap = {
      24: "Campaign does not exist",
      26: "Campaign is not in Approved status",
      10: "Unable to determine the assigner",
      14: "User does not exist",
      27: "Campaign has already been assigned",
      28: "User has an ongoing campaign",
      29: "User has a campaign that overlaps in time",
    };

    if (responseCode && errorCodeMap[responseCode]) {
      errorMessage = errorCodeMap[responseCode];
    }

    return {
      success: false,
      error: errorMessage || "Assign campaign tasks failed",
      code: responseCode,
    };
  } catch (error) {
    // Xử lý error từ catch (network error, 4xx, 5xx)
    const errorResponse = error.response?.data;
    const errorCode = errorResponse?.code;
    const errorMessage = errorResponse?.message || "";

    // Map các error code sang message tiếng Việt
    const errorCodeMap = {
      24: "Campaign does not exist",
      26: "Campaign is not in Approved status",
      10: "Unable to determine the assigner",
      14: "User does not exist",
      27: "Campaign has already been assigned",
      28: "User has an ongoing campaign",
      29: "User has a campaign that overlaps in time",
    };

    let finalErrorMessage = errorMessage;
    if (errorCode && errorCodeMap[errorCode]) {
      finalErrorMessage = errorCodeMap[errorCode];
    }

    return {
      success: false,
      error:
        finalErrorMessage || error.message || "Assign campaign tasks failed",
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
        message:
          response.data.message || "Cancel assignment for user successfully",
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Cancel assignment for user failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Cancel assignment for user failed",
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
        error: response.data.message || "Failed to get test list",
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
        "Failed to get test list",
      status: error.response?.status,
    };
  }
};

// API lấy chi tiết test theo ID
export const getTestById = async (testId) => {
  try {
    const response = await api2.get(`/tests/${testId}`);

    if (response.data.code === 0 && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Failed to get test detail",
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get test detail",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách câu hỏi theo testId - GET /api/v1/test-questions/test/{testId}
export const getTestQuestionsByTestId = async (testId, options = {}) => {
  try {
    const testIdNum =
      typeof testId === "string" ? parseInt(testId, 10) : Number(testId);

    if (!testIdNum || Number.isNaN(testIdNum) || testIdNum <= 0) {
      return {
        success: false,
        error: "Invalid test ID",
      };
    }

    const params = {};
    if (options.forceRefresh) {
      // cache buster để chắc chắn không dùng dữ liệu cũ
      params.cacheBuster = `${Date.now()}-${Math.random()}`;
    }

    const response = await api2.get(`/test-questions/test/${testIdNum}`, {
      params,
    });
    const responseData = response.data;

    if (response.status >= 200 && response.status < 300 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || "Get test questions successfully",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Failed to get test questions",
      errorData: responseData,
    };
  } catch (error) {
    console.error("API Error getTestQuestionsByTestId:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        "Failed to get test questions",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách bài test để gán cho round - GET /api/v1/tests/for-rounds
export const getTestsForRounds = async (params = {}) => {
  try {
    let testTypeValue = params.testType;
    if (typeof testTypeValue !== "undefined" && testTypeValue !== null) {
      testTypeValue =
        typeof testTypeValue === "string"
          ? parseInt(testTypeValue, 10)
          : Number(testTypeValue);

      if (Number.isNaN(testTypeValue) || testTypeValue <= 0) {
        return {
          success: false,
          error: "Invalid test type",
        };
      }
    }

    const allowedParams = {
      testType: testTypeValue,
    };

    const sanitizedParams = Object.fromEntries(
      Object.entries(allowedParams).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const response = await api2.get("/tests/for-rounds", {
      params: sanitizedParams,
    });
    const responseData = response.data;

    if (response.status >= 200 && response.status < 300 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || "Get test list successfully",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Failed to get test list",
      errorData: responseData,
    };
  } catch (error) {
    console.error("API Error getTestsForRounds:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        "Failed to get test list",
      status: error.response?.status,
    };
  }
};

// API cập nhật testId cho round - PUT /api/v1/rounds/update-test-id
export const updateRoundTestId = async (roundId, testId) => {
  try {
    const roundIdNum =
      typeof roundId === "string" ? parseInt(roundId, 10) : Number(roundId);
    const testIdNum =
      typeof testId === "string" ? parseInt(testId, 10) : Number(testId);

    if (!roundIdNum || Number.isNaN(roundIdNum) || roundIdNum <= 0) {
      return {
        success: false,
        error: "Invalid round ID",
      };
    }

    if (!testIdNum || Number.isNaN(testIdNum) || testIdNum <= 0) {
      return {
        success: false,
        error: "Invalid test ID",
      };
    }

    const payload = {
      roundId: roundIdNum,
      testId: testIdNum,
    };

    const response = await api2.put("/rounds/update-test-id", payload);

    // API trả về boolean true khi thành công (status 200)
    if (response.status === 200 && response.data === true) {
      return {
        success: true,
        data: true,
        message: "Update test ID for round successfully",
      };
    }

    return {
      success: false,
      error: "Failed to update test ID for round",
      errorData: response.data,
    };
  } catch (error) {
    console.error("API Error updateRoundTestId:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        "Failed to update test ID for round",
      status: error.response?.status,
    };
  }
};

// API lấy test sessions theo loại bài test
export const getTestSessionsByType = async (params = {}) => {
  try {
    const parsedTestType =
      typeof params.testType === "string"
        ? parseInt(params.testType, 10)
        : Number(params.testType);

    if (isNaN(parsedTestType) || parsedTestType <= 0) {
      return {
        success: false,
        error: "Test type is required",
      };
    }

    const allowedParams = {
      testType: parsedTestType,
      userId: params.userId,
      roundId: params.roundId,
      searchTerm: params.searchTerm,
      sortColumn: params.sortColumn,
      sortOrder: params.sortOrder,
      page: params.page,
      pageSize: params.pageSize,
    };

    const sanitizedParams = Object.fromEntries(
      Object.entries(allowedParams).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    console.log("Endpoint: GET /test-sessions/by-type");
    console.log("Query params:", sanitizedParams);

    const response = await api2.get("/test-sessions/by-type", {
      params: sanitizedParams,
    });

    const responseData = response.data;

    if (responseData?.code === 0 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || "Get test sessions successfully",
      };
    }

    return {
      success: false,
      error:
        responseData?.message ||
        responseData?.errorMessage ||
        "Failed to get test sessions by type",
      errorData: responseData,
    };
  } catch (error) {
    console.error("API Error getTestSessionsByType:", error);
    console.error("Error response:", error.response?.data);

    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        "Failed to get test sessions by type",
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
        error: "Test ID is required",
      };
    }

    // Convert testId sang number nếu là string
    const testIdNum =
      typeof testId === "string" ? parseInt(testId, 10) : Number(testId);
    if (isNaN(testIdNum) || testIdNum <= 0) {
      return {
        success: false,
        error: "Invalid test ID",
      };
    }

    if (!joinCode || joinCode.length !== 10) {
      return {
        success: false,
        error: "Join Code must be exactly 10 characters",
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
        message: responseData.message || "Get exam questions successfully",
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
        error: responseData.message || "Failed to get exam questions",
      };
    }
  } catch (error) {
    console.error("API Error getExamQuestions:", error);
    console.error("Error response:", error.response?.data);
    const errorData = error.response?.data;
    return {
      success: false,
      error:
        errorData?.message || error.message || "Failed to get exam questions",
      status: error.response?.status,
    };
  }
};

// API submit multiple-choice test answers (Listening và Practical tests)
// Format theo API documentation:
// POST /api/v1/test-sessions/submit-multiple-choice
// Body: { testId: number, startTime: string (ISO 8601), endTime: string (ISO 8601), answers: [{ questionId: number, selectedOptionId: number }] }
export const submitMultipleChoiceTest = async (
  testId,
  startTime,
  endTime,
  answers
) => {
  try {
    // Validate và convert testId
    const testIdNum =
      typeof testId === "string" ? parseInt(testId, 10) : Number(testId);
    if (isNaN(testIdNum) || testIdNum <= 0) {
      return {
        success: false,
        error: "Invalid test ID",
      };
    }

    // Validate answers array
    if (!Array.isArray(answers)) {
      return {
        success: false,
        error: "Answers must be an array",
      };
    }

    // Validate và normalize từng answer
    const validatedAnswers = [];
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      if (!answer || typeof answer !== "object") {
        console.warn(`Answer at index ${i} is invalid, skipping`);
        continue;
      }

      // Convert và validate questionId
      const questionId =
        typeof answer.questionId === "string"
          ? parseInt(answer.questionId, 10)
          : Number(answer.questionId);

      if (isNaN(questionId) || questionId <= 0) {
        console.warn(
          `Invalid questionId at index ${i}: ${answer.questionId}, skipping`
        );
        continue;
      }

      // Convert và validate selectedOptionId
      const selectedOptionId =
        typeof answer.selectedOptionId === "string"
          ? parseInt(answer.selectedOptionId, 10)
          : Number(answer.selectedOptionId);

      if (isNaN(selectedOptionId) || selectedOptionId <= 0) {
        console.warn(
          `Invalid selectedOptionId at index ${i}: ${answer.selectedOptionId}, skipping`
        );
        continue;
      }

      validatedAnswers.push({
        questionId: questionId,
        selectedOptionId: selectedOptionId,
      });
    }

    // Tạo payload theo đúng format API
    const payload = {
      testId: testIdNum,
      startTime: startTime, // ISO 8601 format string
      endTime: endTime, // ISO 8601 format string
      answers: validatedAnswers, // Array of { questionId: number, selectedOptionId: number }
    };

    console.log("=== API Request ===");
    console.log("Endpoint: POST /test-sessions/submit-multiple-choice");
    console.log("Payload:", JSON.stringify(payload, null, 2));

    // Gọi API
    const response = await api2.post(
      "/test-sessions/submit-multiple-choice",
      payload
    );

    console.log("=== API Response ===");
    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(response.data, null, 2));

    const responseData = response.data;
    const responseCode = Number(responseData?.code);
    const isSuccessCode = responseCode === 0 || responseCode === 2;
    const hasSuccessfulStatus =
      responseData?.data && responseData.data.status === true;

    // Kiểm tra response theo format API: { code: 0 | 2, message: string, data: {...} }
    if (
      responseData &&
      responseData.data &&
      (isSuccessCode || hasSuccessfulStatus)
    ) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || "Submit test answers successfully",
      };
    } else {
      // Response không thành công
      return {
        success: false,
        error:
          responseData?.message ||
          responseData?.errorMessage ||
          "Failed to submit test answers",
        errorData: responseData,
      };
    }
  } catch (error) {
    console.error("=== API Error ===");
    console.error("Error:", error);
    console.error("Message:", error.message);
    console.error("Response:", error.response?.data);
    console.error("Status:", error.response?.status);

    const errorData = error.response?.data;

    // Xử lý các loại lỗi khác nhau
    if (error.response) {
      // Server trả về response nhưng có lỗi
      return {
        success: false,
        error:
          errorData?.message ||
          errorData?.errorMessage ||
          errorData?.title ||
          `Lỗi server (${error.response.status})`,
        status: error.response.status,
        errorData: errorData,
      };
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response (network error)
      return {
        success: false,
        error:
          "Failed to connect to server. Please check your network connection.",
      };
    } else {
      // Lỗi khác
      return {
        success: false,
        error:
          error.message || "An error occurred while submitting test answers",
      };
    }
  }
};

// API chuyển ứng viên từ test round sang interview round
export const moveToInterview = async (roundId) => {
  try {
    const roundIdNum =
      typeof roundId === "string" ? parseInt(roundId, 10) : Number(roundId);

    if (!roundIdNum || Number.isNaN(roundIdNum) || roundIdNum <= 0) {
      return {
        success: false,
        error: "Invalid round ID",
      };
    }

    const payload = {
      roundId: roundIdNum,
    };

    const response = await api2.post(
      "/round-activities/move-to-interview",
      payload
    );

    // API trả về code 200 khi thành công
    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Move to interview successfully",
      };
    }

    return {
      success: false,
      error: "Failed to move to interview",
      errorData: response.data,
    };
  } catch (error) {
    console.error("API Error moveToInterview:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        "Failed to move to interview",
      status: error.response?.status,
    };
  }
};

// API lấy lịch sử ứng tuyển của người dùng
export const getPromotionHistory = async () => {
  try {
    const response = await api2.get("/users/history");
    const responseData = response.data;

    if (responseData.code === 0 && Array.isArray(responseData.data)) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message,
      };
    }

    return {
      success: false,
      error: responseData.message || "Failed to get promotion history",
    };
  } catch (error) {
    const errorData = error.response?.data;
    return {
      success: false,
      error:
        errorData?.message ||
        errorData?.errorMessage ||
        error.message ||
        "Failed to get promotion history",
      status: error.response?.status,
    };
  }
};

// // API cập nhật startDate và endDate cho một round cụ thể - PUT /api/v1/rounds/{id}/dates
// export const updateRoundDates = async (roundId, startDate, endDate) => {
//   try {
//     // Validate roundId
//     const roundIdNum =
//       typeof roundId === "string" ? parseInt(roundId, 10) : Number(roundId);
//     if (!roundIdNum || Number.isNaN(roundIdNum) || roundIdNum <= 0) {
//       return {
//         success: false,
//         error: "Round ID không hợp lệ",
//       };
//     }

//     // Tạo payload theo format API (ISO 8601 format string)
//     const payload = {
//       startDate: startDate,
//       endDate: endDate,
//     };

//     const response = await api2.put(`/rounds/${roundIdNum}/dates`, payload);

//     // Kiểm tra response: API trả về status 200 và response body là boolean true
//     const isSuccess = response.status === 200 && response.data === true;

//     if (isSuccess) {
//       return {
//         success: true,
//         data: response.data,
//         message: "Cập nhật dates thành công",
//       };
//     } else {
//       return {
//         success: false,
//         error: "Cập nhật dates thất bại",
//         responseData: response.data,
//         status: response.status,
//       };
//     }
//   } catch (error) {
//     return {
//       success: false,
//       error:
//         error.response?.data?.message ||
//         error.message ||
//         "Cập nhật dates cho round thất bại",
//       status: error.response?.status,
//     };
//   }
// };

// API submit Interview Result
// Body: { activityId: number, comment: string, type: number (1: Recruitment, 2: Promotion), choices: [{ score: number, comment: string, interviewCriteriaItemId: number }] }
export const submitInterviewResult = async (payload) => {
  if (!payload) {
    return {
      success: false,
      error: "Missing data to submit interview result",
    };
  }

  if (!payload.activityId) {
    return {
      success: false,
      error: "Missing activityId to submit interview result",
    };
  }

  if (payload.type === undefined || payload.type === null) {
    return {
      success: false,
      error:
        "Missing type to submit interview result (1: Recruitment, 2: Promotion)",
    };
  }

  if (!Array.isArray(payload.choices)) {
    return {
      success: false,
      error: "Missing choices (array of choices) to submit interview result",
    };
  }

  try {
    const response = await api2.post("/interview-results", {
      activityId: Number(payload.activityId),
      comment: payload.comment || "",
      type: Number(payload.type),
      choices: payload.choices.map((choice) => ({
        score: Number(choice.score) || 0,
        comment: choice.comment || "",
        interviewCriteriaItemId: Number(choice.interviewCriteriaItemId) || 0,
      })),
    });

    const responseData = response.data;

    // Code 0 or 2 both indicate success (2 = CREATED_SUCCESS)
    if (responseData?.code === 0 || responseData?.code === 2) {
      return {
        success: true,
        data: responseData.data || null,
        message: responseData.message || "Submit interview result successfully",
      };
    }

    return {
      success: false,
      error:
        responseData?.message ||
        responseData?.errorMessage ||
        "Failed to submit interview result",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        "Failed to submit interview result",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách Interview Result Forms
export const getInterviewResults = async (activityId) => {
  if (!activityId) {
    return {
      success: false,
      error: "Missing activityId to get interview results",
    };
  }

  try {
    const response = await api2.get("/interview-results", {
      params: {
        activityId: activityId,
      },
    });
    const responseData = response.data;

    if (responseData?.code === 0) {
      return {
        success: true,
        data: responseData.data || [],
        message: responseData.message,
      };
    }

    return {
      success: false,
      error:
        responseData?.message ||
        responseData?.errorMessage ||
        "Failed to get interview results",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        "Failed to get interview results",
      status: error.response?.status,
    };
  }
};

// API lấy tất cả requirement items theo requirement ID - GET /api/v1/requirements/{id}/requirement-items
export const getRequirementItems = async (id) => {
  try {
    // Validate id
    const idNum = typeof id === "string" ? parseInt(id, 10) : Number(id);
    if (!idNum || Number.isNaN(idNum) || idNum <= 0) {
      return {
        success: false,
        error: "Invalid requirement ID",
      };
    }

    const response = await api2.get(`/requirements/${idNum}/requirement-items`);
    const responseData = response.data;

    // Kiểm tra code === 0 (success) theo format API
    if (responseData?.code === 0 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || "Get requirement items successfully",
      };
    }

    // Trường hợp API trả về trực tiếp array
    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData,
        message: "Get requirement items successfully",
      };
    }

    // Trường hợp data là array trực tiếp
    if (Array.isArray(responseData?.data)) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || "Get requirement items successfully",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Failed to get requirement items",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get requirement items",
      status: error.response?.status,
    };
  }
};

// API lấy tất cả round types theo campaign type - GET /api/v1/round-types
export const getRoundTypes = async (type) => {
  try {
    const params = {};

    // Nếu có type parameter, validate và thêm vào params
    if (type !== undefined && type !== null) {
      const typeNum =
        typeof type === "string" ? parseInt(type, 10) : Number(type);

      if (!Number.isNaN(typeNum) && typeNum > 0) {
        params.type = typeNum;
      }
    }

    const response = await api2.get("/round-types", {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    const responseData = response.data;

    // Kiểm tra code === 0 (success) theo format API
    if (responseData?.code === 0 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || "Get round types successfully",
      };
    }

    // Trường hợp API trả về trực tiếp array
    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData,
        message: "Get round types successfully",
      };
    }

    // Trường hợp data là array trực tiếp
    if (Array.isArray(responseData?.data)) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || "Get round types successfully",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Failed to get round types",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get round types",
      status: error.response?.status,
    };
  }
};

// API lấy thông tin đơn ứng tuyển theo application ID
// GET /api/v1/applications/{id}
export const getApplicationById = async (applicationId) => {
  try {
    if (!applicationId) {
      return {
        success: false,
        error: "Application ID không được để trống",
      };
    }

    const response = await api2.get(`/applications/${applicationId}`);

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
        error: response.data.message || "Cannot get application by ID",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Cannot get application by ID",
      status: error.response?.status,
    };
  }
};

// API lấy tất cả airline partners - GET /api/v1/airline-partners
export const getAllAirlinePartners = async () => {
  try {
    const response = await api2.get("/airline-partners");
    const responseData = response.data;

    // Kiểm tra code === 0 (success) theo format API
    if (responseData?.code === 0 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message:
          responseData.message || "Get all airline partners successfully",
      };
    }

    // Trường hợp API trả về trực tiếp array
    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData,
        message: "Get all airline partners successfully",
      };
    }

    // Trường hợp data là array trực tiếp
    if (Array.isArray(responseData?.data)) {
      return {
        success: true,
        data: responseData.data,
        message:
          responseData.message || "Get all airline partners successfully",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Failed to get airline partners",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to get airline partners",
      status: error.response?.status,
    };
  }
};

export default api2;
