import React, { useState } from "react";
import { t } from "../../i18n";
import { toast } from "react-toastify";
import { updateUserProfile } from "../../service/api";

const UpdateProfileButton = ({
  formData,
  userId,
  onUpdateSuccess,
  validateForm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const getUserId = () => {
    // Nếu userId được truyền vào, dùng nó
    if (userId) {
      return userId;
    }

    // Nếu không, lấy từ localStorage
    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      return null;
    }

    try {
      const userData = JSON.parse(rawUser);
      // Thử các cách lấy userId
      return (
        userData.userId ||
        userData.userID ||
        userData.id ||
        userData.user?.userId ||
        userData.user?.id ||
        userData.data?.userId ||
        userData.data?.id ||
        null
      );
    } catch (error) {
      console.error("Error when parsing user from localStorage:", error);
      return null;
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validate form nếu có hàm validate
    if (validateForm && !validateForm()) {
      return;
    }

    const currentUserId = getUserId();
    if (!currentUserId) {
      toast.error("Cannot find user ID. Please login again.");
      return;
    }

    setIsLoading(true);

    try {
      // Lấy thông tin user hiện tại từ localStorage để so sánh
      const rawUser = localStorage.getItem("user");
      let currentUserData = null;
      if (rawUser) {
        try {
          currentUserData = JSON.parse(rawUser);
        } catch (error) {
          console.error("Error when parsing user from localStorage:", error);
        }
      }

      // Chuẩn bị dữ liệu để gửi API
      // Gender và Ward phải là integer
      let wardId = null;

      // Ưu tiên dùng wardId nếu có
      if (formData.wardId) {
        const parsed =
          typeof formData.wardId === "number"
            ? formData.wardId
            : parseInt(formData.wardId, 10);
        if (!isNaN(parsed) && parsed > 0) {
          wardId = parsed;
        }
      } else if (formData.ward) {
        // Nếu không có wardId, thử parse ward (có thể là ID dạng string)
        if (typeof formData.ward === "number" && formData.ward > 0) {
          wardId = formData.ward;
        } else if (typeof formData.ward === "string") {
          const parsed = parseInt(formData.ward, 10);
          if (!isNaN(parsed) && parsed > 0) {
            wardId = parsed;
          }
        }
      }

      // Validate Gender - phải là integer hợp lệ (1, 2, hoặc 3)
      let genderValue = null;
      if (formData.gender) {
        const parsed = parseInt(formData.gender, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 3) {
          genderValue = parsed;
        }
      }

      // API yêu cầu tên field theo camelCase (như Swagger)
      // Chỉ gửi các field có giá trị hợp lệ, loại bỏ null/undefined/empty
      const updateData = {};

      // Chỉ thêm field nếu có giá trị
      if (formData.fullname && formData.fullname.trim()) {
        updateData.fullname = formData.fullname.trim();
      }

      if (genderValue !== null) {
        updateData.gender = genderValue;
      }

      if (formData.dateOfBirth) {
        updateData.dateOfBirth = formData.dateOfBirth;
      }

      // API yêu cầu email là bắt buộc, luôn gửi (như Swagger)
      if (formData.email && formData.email.trim()) {
        updateData.email = formData.email.trim();
      }

      // API yêu cầu phoneNumber là bắt buộc, luôn gửi (như Swagger)
      if (formData.phone && formData.phone.trim()) {
        updateData.phoneNumber = formData.phone.trim(); // camelCase như Swagger
      }

      if (formData.address && formData.address.trim()) {
        updateData.address = formData.address.trim();
      }

      if (formData.city && formData.city.trim()) {
        updateData.city = formData.city.trim();
      }

      if (wardId !== null && wardId > 0) {
        updateData.wardId = wardId; // camelCase như Swagger
      }

      console.log("[UpdateProfileButton] Sending update data:", updateData);
      console.log("[UpdateProfileButton] UserId:", currentUserId);

      // Validate dữ liệu trước khi gửi
      if (Object.keys(updateData).length === 0) {
        toast.error("No data to update. Please check your information again.");
        setIsLoading(false);
        return;
      }

      const result = await updateUserProfile(currentUserId, updateData);

      if (result.success) {
        toast.success(
          result.message ||
            t("profile_updated") ||
            "Update profile successfully!"
        );

        // Cập nhật localStorage
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          try {
            const userData = JSON.parse(rawUser);
            const updatedUser = {
              ...userData,
              ...updateData,
              userId: currentUserId,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (error) {
            console.error("Error when updating localStorage:", error);
          }
        }

        // Gọi callback nếu có
        if (onUpdateSuccess) {
          onUpdateSuccess(result.data);
        }

        // Notify other components
        window.dispatchEvent(new Event("auth-changed"));
      } else {
        // Hiển thị lỗi chi tiết từ API
        let errorMessage =
          result.error || "Cannot update profile. Please try again.";

        // Nếu có errors array, hiển thị chi tiết hơn
        if (
          result.errors &&
          Array.isArray(result.errors) &&
          result.errors.length > 0
        ) {
          errorMessage = result.errors.join(". ");
        }

        toast.error(errorMessage);

        // Log chi tiết để debug
        console.error("[UpdateProfileButton] Update failed:", {
          error: result.error,
          errors: result.errors,
          errorCode: result.errorCode,
          status: result.status,
        });
      }
    } catch (error) {
      console.error(
        "[UpdateProfileButton] Error when updating profile:",
        error
      );

      // Xử lý các loại lỗi khác nhau
      let errorMessage =
        "An error occurred while updating profile. Please try again.";

      if (error.message) {
        if (
          error.message.includes("Network Error") ||
          error.message.includes("network")
        ) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timeout. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }

      if (error.response) {
        // Có response từ server
        const status = error.response.status;
        const errorData = error.response.data;

        // Kiểm tra nếu có errorCode và errors array
        if (errorData && typeof errorData.errorCode !== "undefined") {
          let apiErrorMessage =
            errorData.errorMessage || "Cannot update profile.";

          // Nếu có errors array, kết hợp các lỗi
          if (
            errorData.errors &&
            Array.isArray(errorData.errors) &&
            errorData.errors.length > 0
          ) {
            apiErrorMessage = errorData.errors.join(". ");
          }

          errorMessage = apiErrorMessage;
        } else if (status === 400) {
          errorMessage =
            errorData?.message ||
            "Invalid data. Please check your information again.";
        } else if (status === 401) {
          errorMessage = "Session expired. Please login again.";
        } else if (status === 404) {
          errorMessage = "User not found. Please login again.";
        } else if (status === 500) {
          errorMessage =
            errorData?.message ||
            errorData?.errorMessage ||
            "Server error. Please check your data or try again later.";
          console.error("[UpdateProfileButton] Server error 500:", errorData);
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.errorMessage) {
          errorMessage = errorData.errorMessage;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleUpdateProfile}
          disabled={isLoading}
          className="flex items-center gap-2 px-8 py-3 font-semibold text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
              Updating...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M17 21v-8H7v8" />
                <path d="M7 3v5h8" />
              </svg>
              {t("update_profile")}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UpdateProfileButton;
