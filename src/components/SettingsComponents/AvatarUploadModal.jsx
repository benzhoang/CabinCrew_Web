import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { t } from "../../i18n";
import { uploadProfileImage } from "../../service/api";

const AvatarUploadModal = ({ isOpen, onClose, onSave, currentAvatar }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar || null);
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update preview when currentAvatar changes
  useEffect(() => {
    if (isOpen && currentAvatar) {
      setPreview(currentAvatar);
    }
  }, [isOpen, currentAvatar]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size cannot exceed 5MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadProfileImage(selectedFile);
      console.log("Upload result:", result);

      if (result.success) {
        // Hiển thị thông báo thành công (màu xanh lá)
        toast.success("Update image successfully");

        let imageUrl = null;
        if (result.data) {
          // Xử lý nhiều format response khác nhau
          if (typeof result.data === "string") {
            imageUrl = result.data;
          } else {
            imageUrl =
              result.data.imgURL ||
              result.data.url ||
              result.data.imageUrl ||
              result.data.imagePath ||
              result.data.path;
          }

          // Nếu là relative URL, thêm base URL
          if (
            imageUrl &&
            typeof imageUrl === "string" &&
            !imageUrl.startsWith("http") &&
            !imageUrl.startsWith("data:")
          ) {
            const API_BASE_URL = "https://cabincrewcareer.azurewebsites.net";
            imageUrl = imageUrl.startsWith("/")
              ? `${API_BASE_URL}${imageUrl}`
              : `${API_BASE_URL}/${imageUrl}`;
          }
        }

        if (imageUrl) setPreview(imageUrl);

        if (onSave) {
          const syntheticEvent = {
            target: {
              files: [selectedFile],
              value: imageUrl || preview,
            },
          };
          onSave(syntheticEvent, imageUrl);
        }

        // Đợi toast hiển thị xong rồi reload trang (reload sẽ tự động đóng modal)
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errorMessage =
          result.error || "Failed to upload image. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        "An error occurred while uploading image. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setSelectedFile(null);
    setPreview(currentAvatar || null);
    setError(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {t("upload_avatar") || "Tải ảnh đại diện"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Preview Area */}
        <div className="mb-6">
          <div className="w-48 h-48 mx-auto overflow-hidden bg-gray-200 border-4 border-gray-300 rounded-full">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-300">
                <svg
                  className="w-24 h-24 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* File Input */}
        <div className="mb-6">
          <label
            htmlFor="avatar-upload"
            className="block w-full px-4 py-3 text-center text-white transition-colors bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700"
          >
            <svg
              className="inline-block w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {t("choose_image") || "Chọn ảnh"}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="mt-2 text-xs text-center text-gray-500">
            {t("image_format_hint") || "Định dạng: JPG, PNG, GIF. Tối đa 5MB"}
          </p>
          {error && (
            <p className="mt-2 text-xs text-center text-red-500">{error}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t("cancel") || "Hủy"}
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedFile || isUploading}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center ${
              selectedFile && !isUploading
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isUploading ? (
              <>
                <svg
                  className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("uploading") || "Đang tải..."}
              </>
            ) : (
              t("save") || "Lưu"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AvatarUploadModal;
