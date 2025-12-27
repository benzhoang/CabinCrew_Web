import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { t, onLangChange } from "../../i18n";
import PostVerificationModal from "../../components/PostVerificationModal";
import { getApplicationById } from "../../service/api";
import ProfileFormActions from "./ProfileFormActions";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { applicationId: routeApplicationId } = useParams();
  const [, forceUpdate] = useState({});
  const decodeJwt = (token) => {
    if (!token) {
      return null;
    }
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const paddedPayload =
        payload + "=".repeat((4 - (payload.length % 4)) % 4);
      const decoded = atob(paddedPayload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const getUserId = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    if (userData) {
      const userId =
        userData.userId ||
        userData.userID ||
        userData.id ||
        userData.user?.userId ||
        userData.user?.id ||
        userData.data?.userId ||
        userData.data?.id;
      if (userId) {
        return userId;
      }
    }
    const token = localStorage.getItem("token") || userData?.accessToken;
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        return (
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ] ||
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"
          ] ||
          decoded.sub ||
          decoded.userId ||
          decoded.id
        );
      }
    }
    return null;
  };

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    mobileNumber: "",
    citizenId: "",
    workingExperience: "",
    height: "",
    weight: "",
    bmi: "",
    englishCertificate: "",
    readingScore: "",
    listeningScore: "",
    totalScore: "",
    certificateExpireDate: "",
    englishTestDate: "",
    campaignRoundId: "",
    termsAccepted: "",
    captcha: "",
  });

  const PLACEHOLDER_PROFILE_PHOTO =
    "https://via.placeholder.com/128x160/cccccc/666666?text=4x6";
  const [files, setFiles] = useState({
    applicationForm: null,
    profilePhoto: null,
    educationDegree: null,
    englishCertificate: null,
    idCard: null,
    idCardBack: null,
  });
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(
    PLACEHOLDER_PROFILE_PHOTO
  );

  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [showPostVerificationModal, setShowPostVerificationModal] =
    useState(false);
  const [applicationStatus, setApplicationStatus] = useState(""); // 'pending', 'accepted', 'rejected', 'final'
  const [submissionDate, setSubmissionDate] = useState("");
  const [applicationId, setApplicationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preview 4x6 avatar similar to recruiter view
  useEffect(() => {
    let objectUrl;
    const photo = files.profilePhoto;

    if (photo instanceof File) {
      objectUrl = URL.createObjectURL(photo);
      setProfilePhotoPreview(objectUrl);
    } else if (photo?.url) {
      setProfilePhotoPreview(photo.url);
    } else if (typeof photo === "string") {
      setProfilePhotoPreview(photo);
    } else {
      setProfilePhotoPreview(PLACEHOLDER_PROFILE_PHOTO);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [files.profilePhoto]);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    setCaptchaCode(generateCaptcha());
  }, []);

  useEffect(() => {
    const loadApplicationData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Lấy applicationId từ route params
        const appId = routeApplicationId;
        if (!appId) {
          setError("Application ID not found. Please check the link.");
          setIsLoading(false);
          return;
        }

        // Fetch application info via new API
        const result = await getApplicationById(appId);
        if (result.success && result.data) {
          const appData = result.data;
          console.log("Application data from API:", appData);
          // Helper function to format date to YYYY-MM-DD
          const formatDateForInput = (dateString) => {
            if (!dateString) {
              console.warn("formatDateForInput: dateString is empty");
              return "";
            }
            console.log(
              "formatDateForInput - Input:",
              dateString,
              "Type:",
              typeof dateString
            );
            // If it's already in YYYY-MM-DD format, return as is
            if (typeof dateString === "string") {
              // Check if it's YYYY-MM-DD format
              const ymdMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
              if (ymdMatch) {
                const result = dateString.split("T")[0]; // Remove time part if exists
                console.log("formatDateForInput - Already YYYY-MM-DD:", result);
                return result;
              }
              // Try parsing as Date
              try {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                  // Get local date parts to avoid timezone issues
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  const result = `${year}-${month}-${day}`;
                  console.log("formatDateForInput - Parsed:", result);
                  return result;
                } else {
                  console.warn(
                    "formatDateForInput - Invalid date:",
                    dateString
                  );
                }
              } catch (e) {
                console.error(
                  "formatDateForInput - Error parsing date:",
                  dateString,
                  e
                );
              }
            }
            console.warn("formatDateForInput - Could not format:", dateString);
            return "";
          };
          // Helper function to format date for display
          const formatDateForDisplay = (dateString) => {
            if (!dateString) {
              console.warn("formatDateForDisplay: dateString is empty");
              return "";
            }
            console.log(
              "formatDateForDisplay - Input:",
              dateString,
              "Type:",
              typeof dateString
            );
            try {
              let date;
              // If string is in DD/MM/YYYY or DD/MM/YYYY HH:mm format
              if (typeof dateString === "string") {
                const dateStr = dateString.trim();
                // Kiểm tra format DD/MM/YYYY hoặc DD/MM/YYYY HH:mm
                const ddmmyyyyMatch = dateStr.match(
                  /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/
                );
                if (ddmmyyyyMatch) {
                  const [, day, month, year] = ddmmyyyyMatch;
                  // Create date object using YYYY-MM-DD to avoid ambiguity
                  date = new Date(
                    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
                  );
                } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
                  // ISO format YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm:ss
                  date = new Date(dateString);
                } else {
                  // Try parsing as ISO string or other formats
                  date = new Date(dateString);
                }
              } else {
                date = new Date(dateString);
              }

              if (!isNaN(date.getTime())) {
                // Format as "DD month, YYYY"
                const day = date.getDate();
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                const monthNames = [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ];
                const result = `${day} ${monthNames[month - 1]}, ${year}`;
                console.log("formatDateForDisplay - Formatted:", result);
                return result;
              } else {
                console.warn(
                  "formatDateForDisplay - Invalid date:",
                  dateString
                );
                // Try to return as is if it's a valid string
                if (typeof dateString === "string" && dateString.trim()) {
                  return dateString;
                }
              }
            } catch (e) {
              console.error(
                "formatDateForDisplay - Error formatting date:",
                dateString,
                e
              );
              // Return as is if it's a valid string
              if (typeof dateString === "string" && dateString.trim()) {
                return dateString;
              }
            }
            console.warn(
              "formatDateForDisplay - Could not format:",
              dateString
            );
            return "";
          };
          // Store application metadata
          // Set applicationId from route param or from API response
          const finalApplicationId = appId || appData.applicationId;
          if (finalApplicationId) {
            setApplicationId(finalApplicationId);
          }
          if (appData.submissionDate) {
            const formattedSubmissionDate = formatDateForDisplay(
              appData.submissionDate
            );
            // Only set if we got a valid formatted date (not empty and not "Invalid Date")
            if (
              formattedSubmissionDate &&
              formattedSubmissionDate !== "Invalid Date" &&
              formattedSubmissionDate.trim()
            ) {
              setSubmissionDate(formattedSubmissionDate);
            } else {
              // Try to use raw value if formatting failed
              console.warn(
                "Could not format submissionDate, using raw value:",
                appData.submissionDate
              );
              setSubmissionDate(appData.submissionDate);
            }
          }
          // Set application status
          if (appData.status) {
            setApplicationStatus(appData.status.toLowerCase());
          }
          // Format endDate to YYYY-MM-DD for date input
          console.log("=== Processing endDate ===");
          console.log("Raw endDate from API:", appData.endDate);
          console.log("endDate type:", typeof appData.endDate);
          console.log("endDate value:", JSON.stringify(appData.endDate));
          let formattedEndDate = "";
          if (appData.endDate) {
            formattedEndDate = formatDateForInput(appData.endDate);
            console.log("Formatted endDate:", formattedEndDate);
            // If formatDateForInput returned empty, try alternative methods
            if (!formattedEndDate) {
              console.log(
                "formatDateForInput returned empty, trying alternative methods..."
              );
              // Try direct string manipulation if it's already close to YYYY-MM-DD
              const dateStr = String(appData.endDate).trim();
              if (dateStr.length >= 10) {
                // Try to extract YYYY-MM-DD from various formats
                const patterns = [
                  /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
                  /(\d{4})\/(\d{2})\/(\d{2})/, // YYYY/MM/DD
                  /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
                ];
                for (const pattern of patterns) {
                  const match = dateStr.match(pattern);
                  if (match) {
                    if (pattern === patterns[2]) {
                      // DD/MM/YYYY -> YYYY-MM-DD
                      formattedEndDate = `${match[3]}-${match[2]}-${match[1]}`;
                    } else {
                      // YYYY-MM-DD or YYYY/MM/DD
                      formattedEndDate = `${match[1]}-${match[2]}-${match[3]}`;
                    }
                    console.log("Alternative format worked:", formattedEndDate);
                    break;
                  }
                }
              }
              // Last resort: try new Date again with different approach
              if (!formattedEndDate) {
                try {
                  const date = new Date(appData.endDate);
                  if (!isNaN(date.getTime())) {
                    const year = date.getUTCFullYear();
                    const month = String(date.getUTCMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const day = String(date.getUTCDate()).padStart(2, "0");
                    formattedEndDate = `${year}-${month}-${day}`;
                    console.log("UTC date format worked:", formattedEndDate);
                  }
                } catch (e) {
                  console.error("All date formatting methods failed:", e);
                }
              }
            }
          } else {
            console.warn("endDate is null, undefined, or empty");
          }
          console.log("Final formattedEndDate:", formattedEndDate);
          // Map API response to form data
          const newFormData = {
            workingExperience: appData.experience || "",
            height: appData.height?.toString() || "",
            weight: appData.weight?.toString() || "",
            bmi: appData.bmi?.toString() || "",
            englishCertificate: appData.englishDegreeNumber || "",
            readingScore: appData.readingScore?.toString() || "",
            listeningScore: appData.listeningScore?.toString() || "",
            totalScore: appData.totalScore?.toString() || "",
            certificateExpireDate: formattedEndDate,
            englishTestDate: appData.englishTestDate
              ? formatDateForInput(appData.englishTestDate)
              : "",
            campaignRoundId: appData.campaignRoundId?.toString() || "",
          };
          console.log("New form data to set:", newFormData);
          setFormData((prev) => ({
            ...prev,
            ...newFormData,
          }));
          // Debug: Log form data to verify after state update
          setTimeout(() => {
            console.log(
              "Form data after state update (check in next render):",
              {
                certificateExpireDate: formattedEndDate,
                workingExperience: appData.experience,
                height: appData.height,
                weight: appData.weight,
                englishCertificate: appData.englishDegreeNumber,
              }
            );
          }, 100);
          // Map documents to files
          if (appData.documents && Array.isArray(appData.documents)) {
            const filesMap = {};
            appData.documents.forEach((doc) => {
              // Map document type to file field
              const type = doc.type?.toLowerCase() || "";
              const name =
                doc.name?.toLowerCase() || doc.title?.toLowerCase() || "";
              const url = doc.documentURL;
              const fileInfo = {
                name: url?.split("/").pop() || "Document",
                url,
              };
              if (type.includes("application") || type.includes("form")) {
                filesMap.applicationForm = fileInfo;
              } else if (type.includes("profile") || type.includes("photo")) {
                filesMap.profilePhoto = fileInfo;
              } else if (
                type.includes("education") ||
                type.includes("degree")
              ) {
                filesMap.educationDegree = fileInfo;
              } else if (
                type.includes("english") ||
                type.includes("certificate")
              ) {
                filesMap.englishCertificate = fileInfo;
              } else if (
                type.includes("passport") ||
                type.includes("id") ||
                type.includes("card")
              ) {
                const targetField =
                  type.includes("back") || name.includes("back")
                    ? "idCardBack"
                    : "idCard";
                filesMap[targetField] = fileInfo;
              }
            });
            setFiles((prev) => ({ ...prev, ...filesMap }));
          }
          // Map user profile data from API response (email, fullName, phoneNumber, dateOfBirth, gender, citizenId)
          // The new API includes all user profile fields in the response
          if (
            appData.email ||
            appData.fullName ||
            appData.phoneNumber ||
            appData.dateOfBirth ||
            appData.gender !== undefined ||
            appData.citizenId
          ) {
            // Map gender: API returns string or integer, form needs "male" or "female"
            let genderValue = "";
            if (appData.gender !== undefined && appData.gender !== null) {
              const genderStr = String(appData.gender).toLowerCase();
              if (
                genderStr === "male" ||
                genderStr === "1" ||
                genderStr === "m"
              ) {
                genderValue = "male";
              } else if (
                genderStr === "female" ||
                genderStr === "0" ||
                genderStr === "2" ||
                genderStr === "f"
              ) {
                genderValue = "female";
              }
            }

            setFormData((prev) => {
              const updated = {
                ...prev,
                email: appData.email || prev.email || "",
                fullName: appData.fullName || prev.fullName || "",
                dateOfBirth: appData.dateOfBirth
                  ? formatDateForInput(appData.dateOfBirth)
                  : prev.dateOfBirth || "",
                gender: genderValue || prev.gender || "",
                mobileNumber: appData.phoneNumber || prev.mobileNumber || "",
                citizenId:
                  appData.citizenId ||
                  appData.citizenID ||
                  appData.citizen_id ||
                  prev.citizenId ||
                  "",
              };
              // Keep certificateExpireDate from API if it was set
              if (prev.certificateExpireDate) {
                updated.certificateExpireDate = prev.certificateExpireDate;
              }
              console.log(
                "User profile data merged from application API, certificateExpireDate preserved:",
                updated.certificateExpireDate
              );
              return updated;
            });
          } else {
            console.warn(
              "No user profile data in API response, using localStorage as fallback"
            );
            // Fallback to localStorage if API doesn't include profile data
            const userData = JSON.parse(localStorage.getItem("user") || "null");
            if (userData) {
              setFormData((prev) => {
                const updated = {
                  ...prev,
                  email: userData.email || prev.email || "",
                  fullName:
                    userData.fullName || userData.name || prev.fullName || "",
                  dateOfBirth: userData.dateOfBirth || prev.dateOfBirth || "",
                  gender: userData.gender || prev.gender || "",
                  mobileNumber:
                    userData.mobileNumber ||
                    userData.phoneNumber ||
                    prev.mobileNumber ||
                    "",
                  citizenId:
                    userData.citizenId ||
                    userData.citizenID ||
                    userData.citizen_id ||
                    prev.citizenId ||
                    "",
                };
                if (prev.certificateExpireDate) {
                  updated.certificateExpireDate = prev.certificateExpireDate;
                }
                return updated;
              });
            }
          }
        } else {
          setError(result.error || "Không thể tải thông tin đơn ứng tuyển");
        }
      } catch (err) {
        console.error("Error loading application data:", err);
        setError("An error occurred while loading the application");
      } finally {
        setIsLoading(false);
      }
    };
    loadApplicationData();
  }, [routeApplicationId]);
  // Debug: Log formData.certificateExpireDate whenever it changes
  useEffect(() => {
    console.log(
      "formData.certificateExpireDate changed:",
      formData.certificateExpireDate
    );
  }, [formData.certificateExpireDate]);
  // Listen for language changes and force re-render
  useEffect(() => {
    const unsubscribe = onLangChange(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);
  // Refresh captcha function
  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "captcha") {
      setCaptchaInput(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles((prev) => ({
      ...prev,
      [name]: fileList[0] || null,
    }));
  };
  const handleFileDelete = (fileName) => {
    setFiles((prev) => ({
      ...prev,
      [fileName]: null,
    }));
    // Reset file input
    const fileInput = document.querySelector(`input[name="${fileName}"]`);
    if (fileInput) {
      fileInput.value = "";
    }
  };
  const handleSaveDraft = () => {
    // Lưu form data vào localStorage (không lưu files)
    const draftData = {
      formData,
      timestamp: new Date().toISOString(),
      campaignId: null,
    };
    localStorage.setItem("applicationFormDraft", JSON.stringify(draftData));
    toast.success(
      t("application_form_draft_saved") || "Saved draft successfully!"
    );
  };
  const handlePostVerificationSubmit = (verificationData) => {
    // Xử lý nộp hậu kiểm
    console.log("Post verification data:", verificationData);
    toast.success(
      "Post verification submitted successfully! We will review and respond as soon as possible."
    );
  };
  // Kiểm tra xem có hiển thị nút "Nộp hậu kiểm" không
  const shouldShowPostVerificationButton = applicationStatus === "final";
  const statusDisplay = (() => {
    if (!applicationStatus) return null;
    const status = applicationStatus.toLowerCase();
    if (status === "passed" || status === "accepted") {
      return {
        label: "Passed",
        className: "bg-green-100 text-green-800 border border-green-200",
      };
    }
    if (status === "failed" || status === "rejected") {
      return {
        label: "Failed",
        className: "bg-red-100 text-red-800 border border-red-200",
      };
    }
    if (status === "ongoing" || status === "pending" || status === "final") {
      return {
        label: status === "final" ? "Final result" : "Ongoing",
        className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      };
    }
    return {
      label: applicationStatus,
      className: "bg-slate-200 text-slate-800 border border-slate-300",
    };
  })();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile information...</p>
        </div>
      </div>
    );
  }
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-800">Profile</h1>
            {/* Thanh hiển thị kết quả cuối cùng - nhỏ gọn bên cạnh title */}
            {applicationStatus === "final" && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg px-3 py-1 text-white">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Final result</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {shouldShowPostVerificationButton && (
              <button
                onClick={() => setShowPostVerificationModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                Submit post-verification
              </button>
            )}
          </div>
        </div>
        {/* Application Information Card */}
        {(applicationStatus || submissionDate || applicationId) && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {applicationId && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Application ID
                  </label>
                  <p className="text-sm font-semibold text-slate-800">
                    #{applicationId}
                  </p>
                </div>
              )}
              {submissionDate && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Submission date
                  </label>
                  <p className="text-sm font-semibold text-slate-800">
                    {submissionDate}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Avatar + Document Uploads */}
          <div className="space-y-6">
            {/* Avatar Preview (4x6) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                CANDIDATE PROFILE
              </h3>
              <div className="text-center">
                <div className="w-32 h-40 mx-auto bg-slate-100 rounded-lg overflow-hidden mb-4 border-2 border-slate-300 shadow-sm">
                  <img
                    src={profilePhotoPreview}
                    alt="Ảnh 4x6"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_PROFILE_PHOTO;
                    }}
                  />
                </div>
                <p className="text-slate-600">Cabin Crew Candidate</p>
                {statusDisplay && (
                  <div
                    className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold capitalize ${statusDisplay.className}`}
                  >
                    {statusDisplay.label}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                {t("application_form_remember_upload")}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Application form *
                    </label>
                    {files.applicationForm && isEditing && (
                      <button
                        type="button"
                        onClick={() => handleFileDelete("applicationForm")}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Xóa file"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      name="applicationForm"
                      onChange={handleFileChange}
                      accept=".pdf"
                      disabled={!isEditing}
                      className={
                        !isEditing
                          ? "hidden"
                          : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      }
                      required
                    />
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-8 w-8 text-slate-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-sm text-slate-600">
                          {files.applicationForm ? (
                            <span className="text-green-600 font-medium">
                              ✓{" "}
                              {files.applicationForm instanceof File
                                ? files.applicationForm.name
                                : files.applicationForm.name ||
                                  files.applicationForm.file?.name ||
                                  "Form Job Application"}
                              {files.applicationForm.url &&
                                !(files.applicationForm instanceof File) && (
                                  <a
                                    href={files.applicationForm.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 underline"
                                  >
                                    (View)
                                  </a>
                                )}
                            </span>
                          ) : (
                            <span>{t("application_form_click_to_select")}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      4x6 photo *
                    </label>
                    {files.profilePhoto && isEditing && (
                      <button
                        type="button"
                        onClick={() => handleFileDelete("profilePhoto")}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Xóa file"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      name="profilePhoto"
                      onChange={handleFileChange}
                      accept="image/*"
                      disabled={!isEditing}
                      className={
                        !isEditing
                          ? "hidden"
                          : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      }
                      required
                    />
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-8 w-8 text-slate-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm text-slate-600">
                          {files.profilePhoto ? (
                            <span className="text-green-600 font-medium">
                              ✓{" "}
                              {files.profilePhoto instanceof File
                                ? files.profilePhoto.name
                                : files.profilePhoto.name ||
                                  files.profilePhoto.file?.name ||
                                  "Ảnh 4x6"}
                              {files.profilePhoto.url &&
                                !(files.profilePhoto instanceof File) && (
                                  <a
                                    href={files.profilePhoto.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 underline"
                                  >
                                    (View)
                                  </a>
                                )}
                            </span>
                          ) : (
                            <span>
                              {t("application_form_click_to_select_image")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Degree *
                    </label>
                    {files.educationDegree && isEditing && (
                      <button
                        type="button"
                        onClick={() => handleFileDelete("educationDegree")}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Xóa file"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      name="educationDegree"
                      onChange={handleFileChange}
                      accept=".pdf"
                      disabled={!isEditing}
                      className={
                        !isEditing
                          ? "hidden"
                          : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      }
                      required
                    />
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-8 w-8 text-slate-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-sm text-slate-600">
                          {files.educationDegree ? (
                            <span className="text-green-600 font-medium">
                              ✓{" "}
                              {files.educationDegree instanceof File
                                ? files.educationDegree.name
                                : files.educationDegree.name ||
                                  files.educationDegree.file?.name ||
                                  "Education Degree"}
                              {files.educationDegree.url &&
                                !(files.educationDegree instanceof File) && (
                                  <a
                                    href={files.educationDegree.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 underline"
                                  >
                                    (View)
                                  </a>
                                )}
                            </span>
                          ) : (
                            <span>{t("application_form_click_to_select")}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      English certificate *
                    </label>
                    {files.englishCertificate && isEditing && (
                      <button
                        type="button"
                        onClick={() => handleFileDelete("englishCertificate")}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Xóa file"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      name="englishCertificate"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,image/jpeg"
                      disabled={!isEditing}
                      className={
                        !isEditing
                          ? "hidden"
                          : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      }
                      required
                    />
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-8 w-8 text-slate-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                        <p className="text-sm text-slate-600">
                          {files.englishCertificate ? (
                            <span className="text-green-600 font-medium">
                              ✓{" "}
                              {files.englishCertificate instanceof File
                                ? files.englishCertificate.name
                                : files.englishCertificate.name ||
                                  files.englishCertificate.file?.name ||
                                  "English Certificate"}
                              {files.englishCertificate.url &&
                                !(files.englishCertificate instanceof File) && (
                                  <a
                                    href={files.englishCertificate.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 underline"
                                  >
                                    (View)
                                  </a>
                                )}
                            </span>
                          ) : (
                            <span>{t("application_form_click_to_select")}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Citizen ID - Front *
                        </label>
                        {files.idCard && isEditing && (
                          <button
                            type="button"
                            onClick={() => handleFileDelete("idCard")}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Xóa file"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="file"
                          name="idCard"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,image/jpeg"
                          disabled={!isEditing}
                          className={
                            !isEditing
                              ? "hidden"
                              : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          }
                          required
                        />
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                          <div className="text-center">
                            <svg
                              className="mx-auto h-8 w-8 text-slate-400 mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                              />
                            </svg>
                            <p className="text-sm text-slate-600">
                              {files.idCard ? (
                                <span className="text-green-600 font-medium">
                                  ✓{" "}
                                  {files.idCard instanceof File
                                    ? files.idCard.name
                                    : files.idCard.name ||
                                      files.idCard.file?.name ||
                                      "Citizen identification card - Mặt trước"}
                                  {files.idCard.url &&
                                    !(files.idCard instanceof File) && (
                                      <a
                                        href={files.idCard.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-600 underline"
                                      >
                                        (View)
                                      </a>
                                    )}
                                </span>
                              ) : (
                                <span>
                                  {t("application_form_click_to_select")}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Citizen ID - Back *
                        </label>
                        {files.idCardBack && isEditing && (
                          <button
                            type="button"
                            onClick={() => handleFileDelete("idCardBack")}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Xóa file"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="file"
                          name="idCardBack"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,image/jpeg"
                          disabled={!isEditing}
                          className={
                            !isEditing
                              ? "hidden"
                              : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          }
                          required
                        />
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                          <div className="text-center">
                            <svg
                              className="mx-auto h-8 w-8 text-slate-400 mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                              />
                            </svg>
                            <p className="text-sm text-slate-600">
                              {files.idCardBack ? (
                                <span className="text-green-600 font-medium">
                                  ✓{" "}
                                  {files.idCardBack instanceof File
                                    ? files.idCardBack.name
                                    : files.idCardBack.name ||
                                      files.idCardBack.file?.name ||
                                      "Citizen identification card - Mặt sau"}
                                  {files.idCardBack.url &&
                                    !(files.idCardBack instanceof File) && (
                                      <a
                                        href={files.idCardBack.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-600 underline"
                                      >
                                        (View)
                                      </a>
                                    )}
                                </span>
                              ) : (
                                <span>
                                  {t("application_form_click_to_select")}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column - Application Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Application details
            </h2>
            <ProfileFormActions
              formData={formData}
              files={files}
              applicationId={applicationId}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              originalFormData={originalFormData}
              setOriginalFormData={setOriginalFormData}
              setFormData={setFormData}
              captchaCode={captchaCode}
              captchaInput={captchaInput}
              handleInputChange={handleInputChange}
              refreshCaptcha={refreshCaptcha}
              applicationStatus={applicationStatus}
            >
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Personal information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      1. Email address:
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditing
                          ? "bg-slate-100 cursor-not-allowed"
                          : "bg-slate-50"
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      2. Full name:
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditing
                          ? "bg-slate-100 cursor-not-allowed"
                          : "bg-slate-50"
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      3. Date of birth:
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditing
                          ? "bg-slate-100 cursor-not-allowed"
                          : "bg-slate-50"
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      4. Gender:
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === "male"}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mr-2"
                          required
                        />
                        Male
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === "female"}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mr-2"
                          required
                        />
                        Female
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      5. Phone number:
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditing
                          ? "bg-slate-100 cursor-not-allowed"
                          : "bg-slate-50"
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      6. Citizen ID:
                    </label>
                    <input
                      type="text"
                      name="citizenId"
                      value={formData.citizenId}
                      onChange={handleInputChange}
                      placeholder="001234567890"
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditing
                          ? "bg-slate-100 cursor-not-allowed"
                          : "bg-slate-50"
                      }`}
                      required
                    />
                  </div>
                  {/* {formData.experience && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">7. Work experience:</label>
                                        </div>
                                    )} */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      7. Height & Weight:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          name="height"
                          value={formData.height}
                          onChange={handleInputChange}
                          placeholder="165"
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !isEditing
                              ? "bg-slate-100 cursor-not-allowed"
                              : "bg-slate-50"
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          placeholder="53"
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !isEditing
                              ? "bg-slate-100 cursor-not-allowed"
                              : "bg-slate-50"
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          BMI
                        </label>
                        <input
                          type="text"
                          name="bmi"
                          value={formData.bmi}
                          onChange={handleInputChange}
                          placeholder="24.2"
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !isEditing
                              ? "bg-slate-100 cursor-not-allowed"
                              : "bg-slate-50"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* English Certificate */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  English certificate
                </h3>
                <div className="space-y-4">
                  {/* Hàng đầu: Type và Total score */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Type:
                      </label>
                      <input
                        type="text"
                        name="englishCertificate"
                        value={formData.englishCertificate}
                        onChange={handleInputChange}
                        placeholder="TOEIC 500"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing
                            ? "bg-slate-100 cursor-not-allowed"
                            : "bg-slate-50"
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Total score:
                      </label>
                      <input
                        type="number"
                        name="totalScore"
                        value={formData.totalScore}
                        onChange={handleInputChange}
                        placeholder="0"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing
                            ? "bg-slate-100 cursor-not-allowed"
                            : "bg-slate-50"
                        }`}
                      />
                    </div>
                  </div>
                  {/* Hàng thứ hai: Reading score và Listening score */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Reading score:
                      </label>
                      <input
                        type="number"
                        name="readingScore"
                        value={formData.readingScore}
                        onChange={handleInputChange}
                        placeholder="0"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing
                            ? "bg-slate-100 cursor-not-allowed"
                            : "bg-slate-50"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Listening score:
                      </label>
                      <input
                        type="number"
                        name="listeningScore"
                        value={formData.listeningScore}
                        onChange={handleInputChange}
                        placeholder="0"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing
                            ? "bg-slate-100 cursor-not-allowed"
                            : "bg-slate-50"
                        }`}
                      />
                    </div>
                  </div>
                  {/* Hàng thứ ba: Expiration date và English test date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        English test date:
                      </label>
                      <input
                        type="date"
                        name="englishTestDate"
                        value={formData.englishTestDate}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing
                            ? "bg-slate-100 cursor-not-allowed"
                            : "bg-slate-50"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Expiration date:
                      </label>
                      <input
                        type="date"
                        name="certificateExpireDate"
                        value={formData.certificateExpireDate}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing
                            ? "bg-slate-100 cursor-not-allowed"
                            : "bg-slate-50"
                        }`}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Terms and Conditions */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Terms and conditions
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm terms:
                  </label>
                  <p className="text-sm text-slate-600 mb-3">
                    I confirm my data will be processed under the{" "}
                    <a href="#" className="text-blue-600 underline">
                      Privacy Policy
                    </a>{" "}
                    for recruitment purposes.
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="termsAccepted"
                        value="yes"
                        checked={formData.termsAccepted === "yes"}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mr-2"
                        required
                      />
                      Agree
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="termsAccepted"
                        value="no"
                        checked={formData.termsAccepted === "no"}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mr-2"
                        required
                      />
                      Disagree
                    </label>
                  </div>
                </div>
              </div>
            </ProfileFormActions>
          </div>
        </div>
      </div>
      {/* Post Verification Modal */}
      <PostVerificationModal
        isOpen={showPostVerificationModal}
        onClose={() => setShowPostVerificationModal(false)}
        onSubmit={handlePostVerificationSubmit}
      />
    </div>
  );
};

export default ProfilePage;
