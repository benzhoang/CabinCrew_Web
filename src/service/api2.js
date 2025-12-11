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
    const response = await api2.get("/campaigns", { params });
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
        message: responseData.message || "Lấy thông tin đợt tuyển thành công",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Không thể lấy thông tin đợt tuyển",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy thông tin đợt tuyển",
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
        message: "Lấy danh sách ứng viên thành công",
      };
    }

    // Nếu data là array trực tiếp
    if (Array.isArray(responseData?.data)) {
      return {
        success: true,
        data: responseData.data,
        pagination: responseData.pagination,
        message: responseData.message || "Lấy danh sách ứng viên thành công",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Không thể lấy danh sách ứng viên",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy danh sách ứng viên",
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
          message: responseData?.message || "Lấy loại đề thi thành công",
        };
      }
    }

    return {
      success: false,
      error: responseData?.message || "Không thể lấy loại đề thi",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy loại đề thi",
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
        message: "Lấy danh sách đề thi thành công",
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
        message: responseData.message || "Lấy danh sách đề thi thành công",
      };
    } else {
      return {
        success: false,
        error: responseData.message || "Không thể lấy danh sách đề thi",
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
        error: response.data.message || "Không thể lấy chi tiết đề thi",
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy chi tiết đề thi",
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
        error: "Test ID không hợp lệ",
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
        message: responseData.message || "Lấy câu hỏi thành công",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Không thể lấy danh sách câu hỏi",
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
        "Không thể lấy danh sách câu hỏi",
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
          error: "Loại bài thi không hợp lệ",
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
        message: responseData.message || "Lấy danh sách đề thi thành công",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Không thể lấy danh sách đề thi",
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
        "Không thể lấy danh sách đề thi",
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
        error: "Round ID không hợp lệ",
      };
    }

    if (!testIdNum || Number.isNaN(testIdNum) || testIdNum <= 0) {
      return {
        success: false,
        error: "Test ID không hợp lệ",
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
        message: "Cập nhật bài thi cho round thành công",
      };
    }

    return {
      success: false,
      error: "Không thể cập nhật bài thi cho round",
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
        "Không thể cập nhật bài thi cho round",
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
        error: "Loại bài thi là bắt buộc",
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
        message: responseData.message || "Lấy test sessions thành công",
      };
    }

    return {
      success: false,
      error:
        responseData?.message ||
        responseData?.errorMessage ||
        "Không thể lấy test sessions theo loại",
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
        "Không thể lấy test sessions theo loại",
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
        error: "Test ID không hợp lệ",
      };
    }

    // Validate answers array
    if (!Array.isArray(answers)) {
      return {
        success: false,
        error: "Danh sách câu trả lời phải là một mảng",
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
        message: responseData.message || "Nộp bài thi thành công",
      };
    } else {
      // Response không thành công
      return {
        success: false,
        error:
          responseData?.message ||
          responseData?.errorMessage ||
          "Không thể nộp bài thi",
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
        error: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      };
    } else {
      // Lỗi khác
      return {
        success: false,
        error: error.message || "Đã xảy ra lỗi khi nộp bài thi",
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
        error: "Round ID không hợp lệ",
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
        message: response.data.message || "Chuyển vòng thành công",
      };
    }

    return {
      success: false,
      error: "Không thể chuyển vòng",
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
        "Không thể chuyển vòng",
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
      error: responseData.message || "Không thể lấy lịch sử thăng bậc",
    };
  } catch (error) {
    const errorData = error.response?.data;
    return {
      success: false,
      error:
        errorData?.message ||
        errorData?.errorMessage ||
        error.message ||
        "Không thể lấy lịch sử thăng bậc",
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
      error: "Thiếu dữ liệu để gửi kết quả phỏng vấn",
    };
  }

  if (!payload.activityId) {
    return {
      success: false,
      error: "Thiếu activityId để gửi kết quả phỏng vấn",
    };
  }

  if (payload.type === undefined || payload.type === null) {
    return {
      success: false,
      error:
        "Thiếu type để gửi kết quả phỏng vấn (1: Recruitment, 2: Promotion)",
    };
  }

  if (!Array.isArray(payload.choices)) {
    return {
      success: false,
      error: "Thiếu choices (mảng các lựa chọn) để gửi kết quả phỏng vấn",
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
        message: responseData.message || "Gửi kết quả phỏng vấn thành công",
      };
    }

    return {
      success: false,
      error:
        responseData?.message ||
        responseData?.errorMessage ||
        "Không thể gửi kết quả phỏng vấn",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        "Không thể gửi kết quả phỏng vấn",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách Interview Result Forms
export const getInterviewResults = async (activityId) => {
  if (!activityId) {
    return {
      success: false,
      error: "Thiếu activityId để truy xuất kết quả phỏng vấn",
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
        "Không thể lấy danh sách kết quả phỏng vấn",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        error.message ||
        "Không thể lấy danh sách kết quả phỏng vấn",
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
        error: "Requirement ID không hợp lệ",
      };
    }

    const response = await api2.get(`/requirements/${idNum}/requirement-items`);
    const responseData = response.data;

    // Kiểm tra code === 0 (success) theo format API
    if (responseData?.code === 0 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message:
          responseData.message || "Lấy danh sách requirement items thành công",
      };
    }

    // Trường hợp API trả về trực tiếp array
    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData,
        message: "Lấy danh sách requirement items thành công",
      };
    }

    // Trường hợp data là array trực tiếp
    if (Array.isArray(responseData?.data)) {
      return {
        success: true,
        data: responseData.data,
        message:
          responseData.message || "Lấy danh sách requirement items thành công",
      };
    }

    return {
      success: false,
      error:
        responseData?.message || "Lấy danh sách requirement items thất bại",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lấy danh sách requirement items thất bại",
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
        message: responseData.message || "Lấy danh sách round types thành công",
      };
    }

    // Trường hợp API trả về trực tiếp array
    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData,
        message: "Lấy danh sách round types thành công",
      };
    }

    // Trường hợp data là array trực tiếp
    if (Array.isArray(responseData?.data)) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || "Lấy danh sách round types thành công",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Lấy danh sách round types thất bại",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Lấy danh sách round types thất bại",
      status: error.response?.status,
    };
  }
};

export default api2;
