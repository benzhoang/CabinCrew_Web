import axios from "axios";

// Base URL cho API
const API_BASE_URL = "https://cabincrewcareer.azurewebsites.net/api/v1";

// Tạo axios instance với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 giây timeout
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
      // API trả về lỗi nhưng không ném exception
      // Ưu tiên errorMessage từ API response (format: {errorCode, error, errorMessage})
      const errorMessage =
        response.data.errorMessage ||
        response.data.message ||
        "Đăng nhập thất bại";
      return {
        success: false,
        error: errorMessage,
        errorCode: response.data.errorCode,
        errorType: response.data.error,
      };
    }
  } catch (error) {
    const errorData = error.response?.data;
    // Ưu tiên errorMessage từ API response (format: {errorCode, error, errorMessage})
    const errorMessage =
      errorData?.errorMessage ||
      errorData?.message ||
      error.message ||
      "Đăng nhập thất bại";

    return {
      success: false,
      error: errorMessage,
      errorCode: errorData?.errorCode,
      errorType: errorData?.error,
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
      error:
        error.response?.data?.message || error.message || "Đăng ký thất bại",
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
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy thông tin người dùng",
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
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy danh sách thành phố",
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
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy danh sách phường/xã",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách tiêu chí phỏng vấn
export const getInterviewCriterias = async () => {
  try {
    const response = await api.get("/interview-criterias/recruitment");
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
      error:
        responseData.message ||
        responseData.errorMessage ||
        "Không thể lấy tiêu chí phỏng vấn",
    };
  } catch (error) {
    const errorData = error.response?.data;
    return {
      success: false,
      error:
        errorData?.message ||
        errorData?.errorMessage ||
        error.message ||
        "Không thể lấy tiêu chí phỏng vấn",
      status: error.response?.status,
    };
  }
};

// API cập nhật thông tin user theo ID
export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);

    // Kiểm tra HTTP status code trước (200, 201, 204 đều là thành công)
    const httpStatus = response.status;
    const isHttpSuccess = httpStatus >= 200 && httpStatus < 300;

    // Nếu HTTP status là thành công
    if (isHttpSuccess) {
      const responseData = response.data;

      // Kiểm tra nếu có errorCode trong response (format: {errorCode: 5, errorMessage: "...", errors: [...]})
      if (responseData && typeof responseData.errorCode !== "undefined") {
        // Có errorCode, kiểm tra xem có lỗi không
        if (responseData.errorCode === 0 || responseData.errorCode === null) {
          // Thành công
          return {
            success: true,
            data: responseData.data,
            message:
              responseData.message ||
              responseData.errorMessage ||
              "Cập nhật profile thành công",
          };
        } else {
          // Có lỗi - xử lý errors array
          let errorMessage =
            responseData.errorMessage ||
            "Không thể cập nhật thông tin người dùng";

          // Nếu có errors array, kết hợp các lỗi
          if (
            responseData.errors &&
            Array.isArray(responseData.errors) &&
            responseData.errors.length > 0
          ) {
            errorMessage = responseData.errors.join(". ");
          }

          return {
            success: false,
            error: errorMessage,
            errors: responseData.errors || [],
            errorCode: responseData.errorCode,
          };
        }
      }

      // Kiểm tra nếu có field code trong response (format: {code: 4, message: "Updated successfully", data: {...}})
      if (responseData && typeof responseData.code !== "undefined") {
        // Kiểm tra message để xác định thành công (code: 4 với message "Updated successfully" là thành công)
        const message = responseData.message || "";
        const isSuccessMessage =
          message.toLowerCase().includes("success") ||
          message.toLowerCase().includes("updated successfully") ||
          responseData.code === 0 ||
          responseData.code === 4; // code 4 là thành công theo Swagger

        if (isSuccessMessage) {
          return {
            success: true,
            data: responseData.data,
            message: responseData.message || "Cập nhật profile thành công",
          };
        } else {
          // Code khác và message không phải success, coi như lỗi
          return {
            success: false,
            error:
              responseData.message || "Không thể cập nhật thông tin người dùng",
          };
        }
      }

      // Không có field code hoặc errorCode, nhưng HTTP status thành công => coi như thành công
      return {
        success: true,
        data: responseData || responseData?.data,
        message: responseData?.message || "Cập nhật profile thành công",
      };
    } else {
      // HTTP status không thành công
      return {
        success: false,
        error:
          response.data?.message || "Không thể cập nhật thông tin người dùng",
        status: httpStatus,
      };
    }
  } catch (error) {
    const errorData = error.response?.data;

    // Kiểm tra nếu có errorCode và errors array trong error response
    if (errorData && typeof errorData.errorCode !== "undefined") {
      let errorMessage =
        errorData.errorMessage || "Không thể cập nhật thông tin người dùng";

      // Nếu có errors array, kết hợp các lỗi
      if (
        errorData.errors &&
        Array.isArray(errorData.errors) &&
        errorData.errors.length > 0
      ) {
        errorMessage = errorData.errors.join(". ");
      }

      return {
        success: false,
        error: errorMessage,
        errors: errorData.errors || [],
        errorCode: errorData.errorCode,
        status: error.response?.status,
      };
    }

    return {
      success: false,
      error:
        errorData?.message ||
        errorData?.errorMessage ||
        errorData?.title ||
        error.message ||
        "Không thể cập nhật thông tin người dùng",
      status: error.response?.status,
    };
  }
};

// API upload ảnh đại diện
export const uploadProfileImage = async (file) => {
  try {
    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append('file', file);

    // Tạo axios instance riêng cho upload file (cần Content-Type: multipart/form-data)
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${API_BASE_URL}/users/profile-img`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
        timeout: 60000, // 60 giây timeout cho upload file
      }
    );

    // Kiểm tra code === 0 (success) theo format API
    // API có thể trả về data trực tiếp hoặc trong response.data.data
    const responseData = response.data;
    const isSuccess =
      responseData.code === 0 ||
      (response.status >= 200 && response.status < 300);

    if (isSuccess) {
      // Lấy data từ response (có thể là responseData.data hoặc responseData)
      const data = responseData.data || responseData;
      return {
        success: true,
        data: data,
        message: responseData.message || "Tải ảnh đại diện thành công",
      };
    } else {
      return {
        success: false,
        error: responseData.message || "Tải ảnh đại diện thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Tải ảnh đại diện thất bại",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách campaign requests
export const getCampaignRequests = async () => {
  try {
    const response = await api.get("/campaign-requests");

    if (response.data.code === 0 && response.data.data) {
      // API trả về data.items là array các campaign requests
      const items = response.data.data.items || [];
      return {
        success: true,
        data: items,
        pagination: {
          currentPage: response.data.data.currentPage,
          pageSize: response.data.data.pageSize,
          totalRecords: response.data.data.totalRecords,
          totalPages: response.data.data.totalPages,
          hasNextPage: response.data.data.hasNextPage,
          hasPreviousPage: response.data.data.hasPreviousPage,
        },
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Không thể lấy danh sách campaign",
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy danh sách campaign",
      status: error.response?.status,
    };
  }
};

// API lấy chi tiết campaign request theo ID
export const getCampaignRequestById = async (id) => {
  try {
    const response = await api.get(`/campaign-requests/${id}`);

    if (response.data.code === 0 && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Không thể lấy chi tiết campaign request",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Không thể lấy chi tiết campaign request",
      status: error.response?.status,
    };
  }
};

// API duyệt hoặc từ chối campaign request
// status: 2 = Approved, 3 = Rejected
// rejectReason: bắt buộc khi status = 3
export const approveOrRejectCampaignRequest = async (id, status, rejectReason = null) => {
  try {
    const payload = { status };

    // Nếu từ chối, thêm rejectReason
    if (status === 3 && rejectReason) {
      payload.rejectReason = rejectReason;
    }

    const response = await api.put(`/campaign-requests/${id}`, payload);

    // Kiểm tra HTTP status code
    const httpStatus = response.status;
    const isHttpSuccess = httpStatus >= 200 && httpStatus < 300;

    if (isHttpSuccess) {
      const responseData = response.data;

      // Kiểm tra nếu có errorCode
      if (responseData && typeof responseData.errorCode !== "undefined") {
        if (responseData.errorCode === 0 || responseData.errorCode === null) {
          return {
            success: true,
            data: responseData.data,
            message: responseData.message || responseData.errorMessage || (status === 2 ? "Duyệt yêu cầu thành công" : "Từ chối yêu cầu thành công"),
          };
        } else {
          let errorMessage = responseData.errorMessage || (status === 2 ? "Không thể duyệt yêu cầu" : "Không thể từ chối yêu cầu");

          if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
            errorMessage = responseData.errors.join(". ");
          }

          return {
            success: false,
            error: errorMessage,
            errors: responseData.errors || [],
            errorCode: responseData.errorCode,
          };
        }
      }

      // Kiểm tra nếu có field code
      if (responseData && typeof responseData.code !== "undefined") {
        const message = responseData.message || "";
        const isSuccessMessage =
          message.toLowerCase().includes("success") ||
          responseData.code === 0 ||
          responseData.code === 4;

        if (isSuccessMessage) {
          return {
            success: true,
            data: responseData.data,
            message: responseData.message || (status === 2 ? "Duyệt yêu cầu thành công" : "Từ chối yêu cầu thành công"),
          };
        } else {
          return {
            success: false,
            error: responseData.message || responseData.errorMessage || (status === 2 ? "Không thể duyệt yêu cầu" : "Không thể từ chối yêu cầu"),
          };
        }
      }

      // HTTP status thành công nhưng không có code/errorCode => coi như thành công
      return {
        success: true,
        data: responseData?.data || responseData,
        message: responseData?.message || (status === 2 ? "Duyệt yêu cầu thành công" : "Từ chối yêu cầu thành công"),
      };
    } else {
      return {
        success: false,
        error: response.data?.message || response.data?.errorMessage || (status === 2 ? "Không thể duyệt yêu cầu" : "Không thể từ chối yêu cầu"),
        status: httpStatus,
      };
    }
  } catch (error) {
    const errorData = error.response?.data;
    let errorMessage = status === 2 ? "Đã xảy ra lỗi khi duyệt yêu cầu" : "Đã xảy ra lỗi khi từ chối yêu cầu";

    if (errorData) {
      if (errorData.errorMessage) {
        errorMessage = errorData.errorMessage;
      } else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors.join('. ');
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

// API lấy danh sách campaigns
export const getCampaigns = async (params = {}) => {
  try {
    const response = await api.get("/campaigns", { params });
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
      } else if (responseData.data?.data && Array.isArray(responseData.data.data)) {
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

// API lấy danh sách campaigns được giao cho recruiter/examiner
export const getMyCampaigns = async () => {
  try {
    const response = await api.get("/users/my-campaigns");
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
      } else if (responseData.data?.data && Array.isArray(responseData.data.data)) {
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

// API lấy danh sách tasks được giao cho recruiter/examiner
export const getMyTasks = async () => {
  try {
    const response = await api.get("/users/my-tasks");
    const responseData = response.data;

    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData,
        message: "Lấy danh sách task thành công",
      };
    }

    if (responseData.code === 0) {
      let items = [];

      if (Array.isArray(responseData.data)) {
        items = responseData.data;
      } else if (Array.isArray(responseData.data?.items)) {
        items = responseData.data.items;
      } else if (responseData.data?.data && Array.isArray(responseData.data.data)) {
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
      error: responseData.message || "Không thể lấy danh sách task",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy danh sách task",
      status: error.response?.status,
    };
  }
};

// API lấy chi tiết campaign theo ID
export const getCampaignById = async (id) => {
  try {
    const response = await api.get(`/campaigns/${id}`);
    const responseData = response.data;

    if (responseData?.code === 0 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message,
      };
    }

    // Một số API trả trực tiếp object campaign mà không bọc trong {code, data}
    if (responseData && typeof responseData === "object" && !Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message || "Lấy chi tiết chiến dịch thành công",
      };
    }

    return {
      success: false,
      error: responseData?.message || "Không thể lấy chi tiết chiến dịch",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy chi tiết chiến dịch",
      status: error.response?.status,
    };
  }
};

// API duyệt hoặc từ chối campaign (cập nhật status)
// status: 2 = Approved, 3 = Rejected
// rejectReason: bắt buộc khi status = 3
export const updateCampaignStatus = async (id, status, rejectReason = null) => {
  try {
    // Tạo payload object với status (theo API documentation: { "status": 2 } hoặc { "status": 3, "rejectReason": "..." })
    const payload = { status };

    // Nếu từ chối, thêm rejectReason
    if (status === 3 && rejectReason) {
      payload.rejectReason = rejectReason;
    }

    const response = await api.put(`/campaigns/${id}/status`, payload);

    // Kiểm tra HTTP status code
    const httpStatus = response.status;
    const isHttpSuccess = httpStatus >= 200 && httpStatus < 300;

    if (isHttpSuccess) {
      const responseData = response.data;

      // Kiểm tra nếu có errorCode
      if (responseData && typeof responseData.errorCode !== "undefined") {
        if (responseData.errorCode === 0 || responseData.errorCode === null) {
          return {
            success: true,
            data: responseData.data,
            message: responseData.message || responseData.errorMessage || (status === 2 ? "Duyệt chiến dịch thành công" : "Từ chối chiến dịch thành công"),
          };
        } else {
          let errorMessage = responseData.errorMessage || (status === 2 ? "Không thể duyệt chiến dịch" : "Không thể từ chối chiến dịch");

          if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
            errorMessage = responseData.errors.join(". ");
          }

          return {
            success: false,
            error: errorMessage,
            errors: responseData.errors || [],
            errorCode: responseData.errorCode,
          };
        }
      }

      // Kiểm tra nếu có field code (API trả về code: 0 = success, code: 1 = error)
      if (responseData && typeof responseData.code !== "undefined") {
        if (responseData.code === 0) {
          // Thành công
          return {
            success: true,
            data: responseData.data,
            message: responseData.message || (status === 2 ? "Duyệt chiến dịch thành công" : "Từ chối chiến dịch thành công"),
          };
        } else {
          // Có lỗi (code !== 0)
          return {
            success: false,
            error: responseData.message || responseData.errorMessage || (status === 2 ? "Không thể duyệt chiến dịch" : "Không thể từ chối chiến dịch"),
          };
        }
      }

      // HTTP status thành công nhưng không có code/errorCode => coi như thành công
      return {
        success: true,
        data: responseData?.data || responseData,
        message: responseData?.message || (status === 2 ? "Duyệt chiến dịch thành công" : "Từ chối chiến dịch thành công"),
      };
    } else {
      return {
        success: false,
        error: response.data?.message || response.data?.errorMessage || (status === 2 ? "Không thể duyệt chiến dịch" : "Không thể từ chối chiến dịch"),
        status: httpStatus,
      };
    }
  } catch (error) {
    const errorData = error.response?.data;
    let errorMessage = status === 2 ? "Đã xảy ra lỗi khi duyệt chiến dịch" : "Đã xảy ra lỗi khi từ chối chiến dịch";

    if (errorData) {
      if (errorData.errorMessage) {
        errorMessage = errorData.errorMessage;
      } else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors.join('. ');
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

// API lấy danh sách tests
export const getTests = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get("/tests", {
      params: {
        page: page,
        pageSize: pageSize
      }
    });

    console.log('Raw API Response:', response.data);

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
    console.error('API Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Không thể lấy danh sách đề thi",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách tests được gán cho user hiện tại (tự động lấy userId từ token)
export const getMyTests = async () => {
  try {
    const response = await api.get("/tests/my-tests");

    console.log('Raw API Response getMyTests:', response.data);
    console.log('Response status:', response.status);
    console.log('Response data.code:', response.data?.code);
    console.log('Response data.data:', response.data?.data);

    // Kiểm tra nếu có data trong response (dù code có thể !== 0)
    const hasData = response.data.data && (
      (response.data.data.tests && Array.isArray(response.data.data.tests) && response.data.data.tests.length > 0) ||
      (Array.isArray(response.data.data) && response.data.data.length > 0)
    );

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
      console.warn('API returned code !== 0 and no data:', response.data.code);
      return {
        success: false,
        error: response.data.message || "Không thể lấy danh sách đề thi",
        data: response.data.data || null,
        rawResponse: response.data,
      };
    }
  } catch (error) {
    console.error('API Error getMyTests:', error);
    console.error('Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Không thể lấy danh sách đề thi",
      status: error.response?.status,
    };
  }
};

// API xóa test theo ID
export const deleteTest = async (testId) => {
  try {
    const response = await api.delete(`/tests/${testId}`);

    // Kiểm tra code === 0 (success) theo format API
    if (response.data.code === 0) {
      return {
        success: true,
        message: response.data.message || "Xóa đề thi thành công",
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Không thể xóa đề thi",
      };
    }
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Không thể xóa đề thi",
      status: error.response?.status,
    };
  }
};

// API lấy chi tiết test theo ID
export const getTestById = async (testId) => {
  try {
    const response = await api.get(`/tests/${testId}`);

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
    console.error('API Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Không thể lấy chi tiết đề thi",
      status: error.response?.status,
    };
  }
};

// API lấy danh sách câu hỏi của đề thi theo testId
// Trong api.js → hàm getTestQuestions
export const getTestQuestions = async (testId, options = {}) => {
  const { forceRefresh = false } = options;
  try {
    const params = {};
    if (forceRefresh) {
      // Cách ĐẬM BẢO bypass cache 100%
      params.cacheBuster = Date.now() + Math.random();
    }

    const response = await api.get(`/test-questions/test/${testId}`, { params });
    const responseData = response.data;

    if (response.status >= 200 && response.status < 300 && responseData && responseData.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message,
      };
    } else {
      return {
        success: false,
        error: responseData?.message || "Không thể lấy danh sách câu hỏi",
      };
    }
  } catch (error) {
    console.error('API Error getTestQuestions:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Không thể lấy danh sách câu hỏi",
      status: error.response?.status,
    };
  }
};

// API cập nhật test theo ID
export const updateTest = async (testId, testData) => {
  try {
    // Luôn sử dụng FormData để backend có thể xử lý đúng (kể cả khi không có file audio)
    const formData = new FormData();
    formData.append("testName", testData.testName || "");
    formData.append("purpose", testData.purpose || "");
    formData.append("testType", testData.testType || "");
    formData.append("maxScore", testData.maxScore || "");
    formData.append("durationInMinutes", testData.durationInMinutes || "");

    // Xử lý audio file
    if (testData.shouldDeleteAudio === true) {
      // Backend yêu cầu field RemoveAudio (boolean) để xóa audio file
      formData.append("RemoveAudio", "true");
      // Không gửi audioFile khi muốn xóa file cũ
    } else if (testData.audioFile) {
      // Chỉ append audioFile nếu có file mới được chọn
      formData.append("audioFile", testData.audioFile);
    }

    // Lấy token từ localStorage
    const headers = {};
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Không set Content-Type thủ công - axios sẽ tự động set với boundary phù hợp cho FormData

    // Gọi API PUT
    const response = await axios.put(
      `${API_BASE_URL}/tests/${testId}`,
      formData,
      {
        headers,
        timeout: 60000, // 60 giây timeout cho upload file
      }
    );

    // Kiểm tra HTTP status code trước (200, 201, 204 đều là thành công)
    const httpStatus = response.status;
    const isHttpSuccess = httpStatus >= 200 && httpStatus < 300;

    // Nếu HTTP status là thành công
    if (isHttpSuccess) {
      const responseData = response.data;

      // Kiểm tra nếu có errorCode trong response (format: {errorCode: 5, errorMessage: "...", errors: [...]})
      if (responseData && typeof responseData.errorCode !== "undefined") {
        // Có errorCode, kiểm tra xem có lỗi không
        if (responseData.errorCode === 0 || responseData.errorCode === null) {
          // Thành công
          return {
            success: true,
            data: responseData.data,
            message:
              responseData.message ||
              responseData.errorMessage ||
              "Cập nhật đề thi thành công",
          };
        } else {
          // Có lỗi - xử lý errors array
          let errorMessage =
            responseData.errorMessage ||
            "Không thể cập nhật đề thi";

          // Nếu có errors array, kết hợp các lỗi
          if (
            responseData.errors &&
            Array.isArray(responseData.errors) &&
            responseData.errors.length > 0
          ) {
            errorMessage = responseData.errors.join(". ");
          }

          return {
            success: false,
            error: errorMessage,
            errors: responseData.errors || [],
            errorCode: responseData.errorCode,
          };
        }
      }

      // Kiểm tra nếu có field code trong response (format: {code: 4, message: "Updated successfully", data: {...}})
      if (responseData && typeof responseData.code !== "undefined") {
        // Kiểm tra message để xác định thành công (code: 4 với message "Updated successfully" là thành công)
        const message = responseData.message || "";
        const isSuccessMessage =
          message.toLowerCase().includes("success") ||
          message.toLowerCase().includes("updated successfully") ||
          responseData.code === 0 ||
          responseData.code === 4; // code 4 là thành công theo Swagger

        if (isSuccessMessage) {
          return {
            success: true,
            data: responseData.data,
            message: responseData.message || "Cập nhật đề thi thành công",
          };
        } else {
          // Code khác và message không phải success, coi như lỗi
          return {
            success: false,
            error:
              responseData.message || responseData.errorMessage || "Không thể cập nhật đề thi",
          };
        }
      }

      // Không có field code hoặc errorCode, nhưng HTTP status thành công => coi như thành công
      return {
        success: true,
        data: responseData?.data || responseData,
        message: responseData?.message || "Cập nhật đề thi thành công",
      };
    } else {
      // HTTP status không thành công
      return {
        success: false,
        error:
          response.data?.message || response.data?.errorMessage || "Không thể cập nhật đề thi",
        status: httpStatus,
      };
    }
  } catch (error) {
    console.error("API Update Error:", error);

    // Xử lý lỗi từ response
    const errorData = error.response?.data;
    let errorMessage = "Đã xảy ra lỗi khi cập nhật đề thi";

    if (errorData) {
      // Ưu tiên errorMessage từ API
      if (errorData.errorMessage) {
        errorMessage = errorData.errorMessage;
      }
      // Nếu có errors array, kết hợp các lỗi
      else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors.join('. ');
      }
      // Nếu có message
      else if (errorData.message) {
        errorMessage = errorData.message;
      }
    }
    // Nếu không có errorData, sử dụng error.message
    else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

// API lấy danh sách thông báo
export const getNotifications = async (isRead = null) => {
  try {
    const params = {};
    if (isRead !== null) {
      params.isRead = isRead;
    }

    const response = await api.get("/notifications", { params });
    const responseData = response.data;

    if (responseData.code === 0 && responseData.data) {
      return {
        success: true,
        data: Array.isArray(responseData.data) ? responseData.data : [],
        message: responseData.message,
      };
    }

    return {
      success: false,
      error: responseData.message || "Không thể lấy danh sách thông báo",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy danh sách thông báo",
      status: error.response?.status,
    };
  }
};

// API đánh dấu thông báo là đã đọc
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    const httpSuccess = response.status >= 200 && response.status < 300;
    const responseData = response.data ?? {};

    if (httpSuccess) {
      if (typeof responseData.errorCode !== "undefined") {
        if (responseData.errorCode === 0 || responseData.errorCode === null) {
          return {
            success: true,
            message:
              responseData.message ||
              responseData.errorMessage ||
              "Đánh dấu thông báo thành công",
          };
        }

        return {
          success: false,
          error:
            responseData.errorMessage ||
            responseData.message ||
            "Không thể đánh dấu thông báo",
          errorCode: responseData.errorCode,
        };
      }

      if (typeof responseData.code !== "undefined") {
        const message = responseData.message || "";
        const normalizedMessage =
          typeof message === "string" ? message.toLowerCase() : "";
        const isSuccessCode =
          responseData.code === 0 ||
          responseData.code === 4 ||
          normalizedMessage.includes("success");

        if (isSuccessCode) {
          return {
            success: true,
            message: responseData.message || "Đánh dấu thông báo thành công",
          };
        }

        return {
          success: false,
          error: responseData.message || "Không thể đánh dấu thông báo",
          errorCode: responseData.code,
        };
      }

      return {
        success: true,
        message: responseData.message || "Đánh dấu thông báo thành công",
      };
    }

    return {
      success: false,
      error: responseData.message || "Không thể đánh dấu thông báo",
      status: response.status,
    };
  } catch (error) {
    const errorData = error.response?.data;
    return {
      success: false,
      error:
        errorData?.errorMessage ||
        errorData?.message ||
        error.message ||
        "Không thể đánh dấu thông báo",
      status: error.response?.status,
    };
  }
};

// API đánh dấu tất cả thông báo là đã đọc
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.put("/notifications/read-all");

    if (response.data.code === 0) {
      return {
        success: true,
        message: response.data.message || "Đánh dấu tất cả thông báo thành công",
      };
    }

    return {
      success: false,
      error: response.data.message || "Không thể đánh dấu tất cả thông báo",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể đánh dấu tất cả thông báo",
      status: error.response?.status,
    };
  }
};

// API tạo nhiều câu hỏi cùng lúc (bulk create)
export const createBulkTestQuestions = async (testId, questionsData) => {
  try {
    // Kiểm tra testId hợp lệ
    const testIdNum = typeof testId === 'string' ? parseInt(testId, 10) : Number(testId);
    if (!testIdNum || testIdNum <= 0 || isNaN(testIdNum)) {
      return {
        success: false,
        error: 'Test ID không hợp lệ. Vui lòng kiểm tra lại.',
      };
    }

    // Kiểm tra questionsData có hợp lệ không
    if (!questionsData || !Array.isArray(questionsData) || questionsData.length === 0) {
      return {
        success: false,
        error: 'Danh sách câu hỏi không hợp lệ.',
      };
    }

    // Kiểm tra số lượng câu hỏi (tối đa 50)
    if (questionsData.length > 50) {
      return {
        success: false,
        error: 'Số lượng câu hỏi không được vượt quá 50.',
      };
    }

    // Tạo payload theo format API
    const payload = {
      testId: testIdNum,
      questions: questionsData,
    };

    const response = await api.post('/test-questions/bulk', payload);

    // Kiểm tra HTTP status code
    const httpStatus = response.status;
    const isHttpSuccess = httpStatus >= 200 && httpStatus < 300;

    if (isHttpSuccess) {
      const responseData = response.data;

      // Kiểm tra nếu có errorCode
      if (responseData && typeof responseData.errorCode !== 'undefined') {
        if (responseData.errorCode === 0 || responseData.errorCode === null) {
          return {
            success: true,
            data: responseData.data,
            message: responseData.message || responseData.errorMessage || 'Tạo câu hỏi thành công',
          };
        } else {
          let errorMessage = responseData.errorMessage || 'Không thể tạo câu hỏi';

          if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
            errorMessage = responseData.errors.join('. ');
          }

          return {
            success: false,
            error: errorMessage,
            errors: responseData.errors || [],
            errorCode: responseData.errorCode,
          };
        }
      }

      // Kiểm tra nếu có field code
      if (responseData && typeof responseData.code !== 'undefined') {
        if (responseData.code === 0) {
          return {
            success: true,
            data: responseData.data,
            message: responseData.message || 'Tạo câu hỏi thành công',
          };
        } else {
          return {
            success: false,
            error: responseData.message || responseData.errorMessage || 'Không thể tạo câu hỏi',
          };
        }
      }

      // HTTP status thành công nhưng không có code/errorCode => coi như thành công
      return {
        success: true,
        data: responseData?.data || responseData,
        message: responseData?.message || 'Tạo câu hỏi thành công',
      };
    } else {
      return {
        success: false,
        error: response.data?.message || response.data?.errorMessage || 'Không thể tạo câu hỏi',
        status: httpStatus,
      };
    }
  } catch (error) {
    console.error('Bulk Create Questions Error:', error);
    const errorData = error.response?.data;
    let errorMessage = 'Đã xảy ra lỗi khi tạo câu hỏi';

    if (errorData) {
      if (errorData.errorMessage) {
        errorMessage = errorData.errorMessage;
      } else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors.join('. ');
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (error.response?.status === 400) {
        errorMessage = errorData.title || errorData || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
      errorData: errorData,
    };
  }
};

// API import câu hỏi từ file Excel
export const importQuestionsFromExcel = async (testId, file) => {
  try {
    // Kiểm tra file hợp lệ
    if (!file) {
      return {
        success: false,
        error: 'Vui lòng chọn file Excel để tải lên.',
      };
    }

    // Kiểm tra định dạng file
    const isExcelFile = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!isExcelFile) {
      return {
        success: false,
        error: 'Vui lòng chọn đúng định dạng Excel (.xlsx hoặc .xls).',
      };
    }

    // Kiểm tra kích thước file (10 MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Kích thước file không được vượt quá 10 MB.',
      };
    }

    // Kiểm tra và chuyển đổi testId sang number
    const testIdNum = typeof testId === 'string' ? parseInt(testId, 10) : Number(testId);
    if (!testIdNum || testIdNum <= 0 || isNaN(testIdNum)) {
      return {
        success: false,
        error: 'Test ID không hợp lệ. Vui lòng kiểm tra lại.',
      };
    }

    // Tạo FormData để gửi file
    // Backend yêu cầu field name là 'excelFile' chứ không phải 'file'
    const formData = new FormData();
    formData.append('excelFile', file);
    // Không gửi testId trong FormData, sẽ gửi như query parameter

    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Không set Content-Type thủ công - axios sẽ tự động set với boundary phù hợp cho FormData

    // Gọi API POST với testId như query parameter (thử cách này trước)
    const response = await axios.post(
      `${API_BASE_URL}/test-questions/import-excel?testId=${testIdNum}`,
      formData,
      {
        headers,
        timeout: 60000, // 60 giây timeout cho upload file
      }
    );

    // Kiểm tra HTTP status code
    const httpStatus = response.status;
    const isHttpSuccess = httpStatus >= 200 && httpStatus < 300;

    if (isHttpSuccess) {
      const responseData = response.data;

      // Kiểm tra nếu có errorCode
      if (responseData && typeof responseData.errorCode !== 'undefined') {
        if (responseData.errorCode === 0 || responseData.errorCode === null) {
          return {
            success: true,
            data: responseData.data,
            message: responseData.message || responseData.errorMessage || 'Import câu hỏi thành công',
          };
        } else {
          let errorMessage = responseData.errorMessage || 'Không thể import câu hỏi';

          if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
            errorMessage = responseData.errors.join('. ');
          }

          return {
            success: false,
            error: errorMessage,
            errors: responseData.errors || [],
            errorCode: responseData.errorCode,
          };
        }
      }

      // Kiểm tra nếu có field code
      if (responseData && typeof responseData.code !== 'undefined') {
        if (responseData.code === 0) {
          return {
            success: true,
            data: responseData.data,
            message: responseData.message || 'Import câu hỏi thành công',
          };
        } else {
          return {
            success: false,
            error: responseData.message || responseData.errorMessage || 'Không thể import câu hỏi',
          };
        }
      }

      // HTTP status thành công nhưng không có code/errorCode => coi như thành công
      return {
        success: true,
        data: responseData?.data || responseData,
        message: responseData?.message || 'Import câu hỏi thành công',
      };
    } else {
      return {
        success: false,
        error: response.data?.message || response.data?.errorMessage || 'Không thể import câu hỏi',
        status: httpStatus,
      };
    }
  } catch (error) {
    console.error('Import Excel Error:', error);
    const errorData = error.response?.data;
    let errorMessage = 'Đã xảy ra lỗi khi import câu hỏi';

    if (errorData) {
      if (errorData.errorMessage) {
        errorMessage = errorData.errorMessage;
      } else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors.join('. ');
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (error.response?.status === 400) {
        errorMessage = errorData.title || errorData || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại file Excel.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
      errorData: errorData, // Thêm errorData để debug
    };
  }
};

// API lấy thông tin đợt tuyển (campaign round) theo ID
export const getCampaignRoundById = async (id) => {
  try {
    const response = await api.get(`/campaign-rounds/${id}`);
    const responseData = response.data;

    if (responseData?.code === 0 && responseData?.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message,
      };
    }

    // Một số API trả trực tiếp object mà không bọc trong {code, data}
    if (responseData && typeof responseData === "object" && !Array.isArray(responseData)) {
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
    const response = await api.get(`/rounds/${roundId}/participants`, { params });
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

// API lấy chiến dịch đang ứng tuyển của user
export const getOngoingCampaign = async () => {
  try {
    const response = await api.get("/users/ongoing-campaign");
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
      error: responseData?.message || "Không thể lấy thông tin chiến dịch đang ứng tuyển",
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

// API submit multiple-choice test answers (Listening và Practical tests)
// Format theo API documentation:
// POST /api/v1/test-sessions/submit-multiple-choice
// Body: { testId: number, startTime: string (ISO 8601), endTime: string (ISO 8601), answers: [{ questionId: number, selectedOptionId: number }] }
export const submitMultipleChoiceTest = async (testId, startTime, endTime, answers) => {
  try {
    // Validate và convert testId
    const testIdNum = typeof testId === 'string' ? parseInt(testId, 10) : Number(testId);
    if (isNaN(testIdNum) || testIdNum <= 0) {
      return {
        success: false,
        error: 'Test ID không hợp lệ',
      };
    }

    // Validate answers array
    if (!Array.isArray(answers)) {
      return {
        success: false,
        error: 'Danh sách câu trả lời phải là một mảng',
      };
    }

    // Validate và normalize từng answer
    const validatedAnswers = [];
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      if (!answer || typeof answer !== 'object') {
        console.warn(`Answer at index ${i} is invalid, skipping`);
        continue;
      }

      // Convert và validate questionId
      const questionId = typeof answer.questionId === 'string'
        ? parseInt(answer.questionId, 10)
        : Number(answer.questionId);

      if (isNaN(questionId) || questionId <= 0) {
        console.warn(`Invalid questionId at index ${i}: ${answer.questionId}, skipping`);
        continue;
      }

      // Convert và validate selectedOptionId
      const selectedOptionId = typeof answer.selectedOptionId === 'string'
        ? parseInt(answer.selectedOptionId, 10)
        : Number(answer.selectedOptionId);

      if (isNaN(selectedOptionId) || selectedOptionId <= 0) {
        console.warn(`Invalid selectedOptionId at index ${i}: ${answer.selectedOptionId}, skipping`);
        continue;
      }

      validatedAnswers.push({
        questionId: questionId,
        selectedOptionId: selectedOptionId
      });
    }

    // Tạo payload theo đúng format API
    const payload = {
      testId: testIdNum,
      startTime: startTime, // ISO 8601 format string
      endTime: endTime, // ISO 8601 format string
      answers: validatedAnswers // Array of { questionId: number, selectedOptionId: number }
    };

    console.log('=== API Request ===');
    console.log('Endpoint: POST /test-sessions/submit-multiple-choice');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Gọi API
    const response = await api.post('/test-sessions/submit-multiple-choice', payload);

    console.log('=== API Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    const responseData = response.data;

    // Kiểm tra response theo format API: { code: 0, message: string, data: {...} }
    if (responseData && responseData.code === 0 && responseData.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || 'Nộp bài thi thành công',
      };
    } else {
      // Response không thành công
      return {
        success: false,
        error: responseData?.message || responseData?.errorMessage || 'Không thể nộp bài thi',
        errorData: responseData,
      };
    }
  } catch (error) {
    console.error('=== API Error ===');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);

    const errorData = error.response?.data;

    // Xử lý các loại lỗi khác nhau
    if (error.response) {
      // Server trả về response nhưng có lỗi
      return {
        success: false,
        error: errorData?.message ||
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
        error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
      };
    } else {
      // Lỗi khác
      return {
        success: false,
        error: error.message || 'Đã xảy ra lỗi khi nộp bài thi',
      };
    }
  }
};

// API submit speaking test answers with audio recordings
// Endpoint: POST /api/v1/test-sessions/submit-speaking (multipart/form-data)
export const submitSpeakingExam = async ({ testId, startTime, endTime, answers }) => {
  try {
    const testIdNum =
      typeof testId === 'string' ? parseInt(testId, 10) : Number(testId);

    if (isNaN(testIdNum) || testIdNum <= 0) {
      return {
        success: false,
        error: 'Test ID không hợp lệ',
      };
    }

    if (!startTime || !endTime) {
      return {
        success: false,
        error: 'Thiếu thông tin thời gian bắt đầu hoặc kết thúc bài thi',
      };
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return {
        success: false,
        error: 'Không có dữ liệu ghi âm để nộp bài thi nói',
      };
    }

    const guessExtension = (mimeType = '') => {
      const lower = mimeType.toLowerCase();
      if (lower.includes('mp3') || lower.includes('mpeg')) return 'mp3';
      if (lower.includes('wav')) return 'wav';
      if (lower.includes('ogg')) return 'ogg';
      return 'webm';
    };

    const normalizedAnswers = answers.reduce((acc, answer, index) => {
      if (!answer) {
        return acc;
      }

      const questionIdNum =
        typeof answer.questionId === 'string'
          ? parseInt(answer.questionId, 10)
          : Number(answer.questionId);

      if (isNaN(questionIdNum) || questionIdNum <= 0) {
        console.warn(
          `submitSpeakingExam: questionId không hợp lệ tại vị trí ${index}`,
          answer.questionId
        );
        return acc;
      }

      let file = null;

      if (answer.file instanceof File) {
        file = answer.file;
      } else if (answer.blob instanceof Blob) {
        const mimeType = answer.blob.type || 'audio/webm';
        const extension = guessExtension(mimeType);
        const fileName =
          answer.fileName ||
          `speaking_question_${questionIdNum}_${Date.now()}_${index}.${extension}`;
        file = new File([answer.blob], fileName, { type: mimeType });
      }

      if (!(file instanceof File)) {
        console.warn(
          `submitSpeakingExam: không tìm thấy file hợp lệ cho questionId ${questionIdNum}`
        );
        return acc;
      }

      acc.push({
        questionId: questionIdNum,
        file,
      });
      return acc;
    }, []);

    if (normalizedAnswers.length === 0) {
      return {
        success: false,
        error: 'Không có ghi âm hợp lệ để nộp bài thi nói',
      };
    }

    const formData = new FormData();
    formData.append('testId', testIdNum);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    formData.append(
      'questionIds',
      normalizedAnswers.map((item) => item.questionId).join(',')
    );

    normalizedAnswers.forEach((item) => {
      formData.append('audioFiles', item.file);
    });

    console.log('=== API Request ===');
    console.log('Endpoint: POST /test-sessions/submit-speaking');
    console.log('FormData fields:', {
      testId: testIdNum,
      startTime,
      endTime,
      questionIds: normalizedAnswers.map((item) => item.questionId),
      fileCount: normalizedAnswers.length,
    });

    const response = await api.post(
      '/test-sessions/submit-speaking',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('=== API Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    const responseData = response.data;

    if (responseData && responseData.code === 0 && responseData.data) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || 'Nộp bài thi nói thành công',
      };
    }

    return {
      success: false,
      error:
        responseData?.message ||
        responseData?.errorMessage ||
        'Không thể nộp bài thi nói',
      errorData: responseData,
    };
  } catch (error) {
    console.error('=== API Error (Speaking) ===');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);

    const errorData = error.response?.data;

    if (error.response) {
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
      return {
        success: false,
        error:
          'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
      };
    }

    return {
      success: false,
      error: error.message || 'Đã xảy ra lỗi khi nộp bài thi nói',
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
        error: 'Test ID không được để trống',
      };
    }

    // Convert testId sang number nếu là string
    const testIdNum = typeof testId === 'string' ? parseInt(testId, 10) : Number(testId);
    if (isNaN(testIdNum) || testIdNum <= 0) {
      return {
        success: false,
        error: 'Test ID không hợp lệ',
      };
    }

    if (!joinCode || joinCode.length !== 10) {
      return {
        success: false,
        error: 'Join Code phải có đúng 10 ký tự',
      };
    }

    console.log('Calling API with:', { testId: testIdNum, joinCode });

    const response = await api.get('/test-questions/exam', {
      params: {
        testId: testIdNum,
        joinCode: joinCode,
      },
    });

    const responseData = response.data;
    console.log('API Response:', responseData);

    // Kiểm tra nếu có data trong response (bất kể code là gì, miễn là có data)
    // Một số API trả về code khác 0 nhưng vẫn có data hợp lệ
    if (responseData.data && responseData.data.questions) {
      console.log('API Success - Questions count:', responseData.data.questions?.length || 0);
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || 'Lấy câu hỏi thành công',
      };
    }
    // Nếu không có data, kiểm tra code === 0 (success) theo format API chuẩn
    else if (responseData.code === 0 && responseData.data) {
      console.log('API Success - Questions count:', responseData.data.questions?.length || 0);
      return {
        success: true,
        data: responseData.data,
        message: responseData.message,
      };
    } else {
      console.error('API Error - code:', responseData.code, 'message:', responseData.message);
      return {
        success: false,
        error: responseData.message || 'Không thể lấy câu hỏi đề thi',
      };
    }
  } catch (error) {
    console.error('API Error getExamQuestions:', error);
    console.error('Error response:', error.response?.data);
    const errorData = error.response?.data;
    return {
      success: false,
      error:
        errorData?.message ||
        error.message ||
        'Không thể lấy câu hỏi đề thi',
      status: error.response?.status,
    };
  }
};

// API lưu bản nháp đơn ứng tuyển
export const saveApplicationDraft = async (draftData) => {
  try {
    // Tạo FormData để gửi dữ liệu và files
    const formData = new FormData();

    // Thêm các trường text/string
    if (draftData.experience) {
      formData.append("Experience", draftData.experience);
    }
    if (draftData.height !== undefined && draftData.height !== '') {
      formData.append("Height", parseInt(draftData.height));
    }
    if (draftData.weight !== undefined && draftData.weight !== '') {
      formData.append("Weight", parseInt(draftData.weight));
    }
    if (draftData.englishDegreeNumber) {
      formData.append("EnglishDegreeNumber", draftData.englishDegreeNumber);
    }
    if (draftData.endDate) {
      formData.append("EndDate", draftData.endDate);
    }
    if (draftData.campaignRoundId) {
      formData.append("CampaignRoundId", parseInt(draftData.campaignRoundId));
    }

    // Thêm các file nếu có
    if (draftData.applicationForm) {
      formData.append("ApplicationForm", draftData.applicationForm);
    }
    if (draftData.profilePhoto) {
      formData.append("ProfilePhoto", draftData.profilePhoto);
    }
    if (draftData.educationDegree) {
      formData.append("EducationDegree", draftData.educationDegree);
    }
    if (draftData.englishCertificate) {
      formData.append("EnglishCertificate", draftData.englishCertificate);
    }
    if (draftData.passportOrID) {
      formData.append("PassportOrID", draftData.passportOrID);
    }

    // Lấy token từ localStorage
    const headers = {};
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Không set Content-Type thủ công - axios sẽ tự động set với boundary phù hợp cho FormData

    // Gọi API POST
    const response = await axios.post(
      `${API_BASE_URL}/applications/draft`,
      formData,
      {
        headers,
        timeout: 60000, // 60 giây timeout cho upload file
      }
    );

    // Kiểm tra HTTP status code
    const httpStatus = response.status;
    const isHttpSuccess = httpStatus >= 200 && httpStatus < 300;

    if (isHttpSuccess) {
      const responseData = response.data;
      // Kiểm tra code === 0 (success) theo format API
      if (responseData.code === 0 || isHttpSuccess) {
        return {
          success: true,
          data: responseData.data || responseData,
          message: responseData.message || "Lưu bản nháp thành công",
        };
      } else {
        return {
          success: false,
          error: responseData.message || "Lưu bản nháp thất bại",
        };
      }
    } else {
      return {
        success: false,
        error: "Lưu bản nháp thất bại",
      };
    }
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.errorMessage ||
      errorData?.message ||
      error.message ||
      "Lưu bản nháp thất bại";

    return {
      success: false,
      error: errorMessage,
      errorCode: errorData?.errorCode,
      errorType: errorData?.error,
      status: error.response?.status,
    };
  }
};

// API nộp đơn ứng tuyển
export const submitApplication = async (applicationData) => {
  try {
    // Tạo FormData để gửi dữ liệu và files
    const formData = new FormData();

    // Thêm các trường text/string (required)
    if (applicationData.experience) {
      formData.append("Experience", applicationData.experience);
    }
    if (applicationData.height !== undefined && applicationData.height !== '') {
      formData.append("Height", parseInt(applicationData.height));
    }
    if (applicationData.weight !== undefined && applicationData.weight !== '') {
      formData.append("Weight", parseInt(applicationData.weight));
    }
    if (applicationData.englishDegreeNumber) {
      formData.append("EnglishDegreeNumber", applicationData.englishDegreeNumber);
    }
    if (applicationData.endDate) {
      formData.append("EndDate", applicationData.endDate);
    }
    if (applicationData.campaignRoundId) {
      formData.append("CampaignRoundId", parseInt(applicationData.campaignRoundId));
    }

    // Thêm các file (required)
    if (applicationData.applicationForm) {
      formData.append("ApplicationForm", applicationData.applicationForm);
    }
    if (applicationData.profilePhoto) {
      formData.append("ProfilePhoto", applicationData.profilePhoto);
    }
    if (applicationData.educationDegree) {
      formData.append("EducationDegree", applicationData.educationDegree);
    }
    if (applicationData.englishCertificate) {
      formData.append("EnglishCertificate", applicationData.englishCertificate);
    }
    if (applicationData.passportOrID) {
      formData.append("PassportOrID", applicationData.passportOrID);
    }

    // Lấy token từ localStorage
    const headers = {};
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Không set Content-Type thủ công - axios sẽ tự động set với boundary phù hợp cho FormData

    // Gọi API POST
    const response = await axios.post(
      `${API_BASE_URL}/applications/submit`,
      formData,
      {
        headers,
        timeout: 60000, // 60 giây timeout cho upload file
      }
    );

    // Kiểm tra HTTP status code
    const httpStatus = response.status;
    const isHttpSuccess = httpStatus >= 200 && httpStatus < 300;

    if (isHttpSuccess) {
      const responseData = response.data;
      // Kiểm tra code === 0 (success) theo format API
      if (responseData.code === 0 || isHttpSuccess) {
        return {
          success: true,
          data: responseData.data || responseData,
          message: responseData.message || "Nộp đơn thành công",
        };
      } else {
        return {
          success: false,
          error: responseData.message || "Nộp đơn thất bại",
        };
      }
    } else {
      return {
        success: false,
        error: "Nộp đơn thất bại",
      };
    }
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.errorMessage ||
      errorData?.message ||
      error.message ||
      "Nộp đơn thất bại";

    return {
      success: false,
      error: errorMessage,
      errorCode: errorData?.errorCode,
      errorType: errorData?.error,
      status: error.response?.status,
    };
  }
};

export default api;
