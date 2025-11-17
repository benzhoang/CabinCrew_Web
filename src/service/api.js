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
    formData.append("file", file);

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

export default api;
