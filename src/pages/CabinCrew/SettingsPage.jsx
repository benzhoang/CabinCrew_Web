import React, { useEffect, useState } from "react";
import { t, onLangChange } from "../../i18n";
import { toast } from "react-toastify";
import { getUserProfile, getCities, getWardsForCity } from "../../service/api";
import PersonalInformation from "../../components/SettingsComponents/PersonalInformation";
import AccountInformation from "../../components/SettingsComponents/AccountInformation";
import AddressInformation from "../../components/SettingsComponents/AddressInformation";
import UpdateProfileButton from "../../components/SettingsComponents/UpdateProfileButton";

const SettingsPage = () => {
  const [, setTick] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    imgURL: "",
    fullname: "",
    gender: "",
    dateOfBirth: "",
    age: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    cityId: "",
    ward: "",
    wardId: "",
    role: "",
    airlinePartner: "",
  });
  const [errors, setErrors] = useState({});

  const genders = [
    { value: "1", label: t("male") },
    { value: "2", label: t("female") },
    { value: "3", label: t("other") },
  ];

  const decodeJwt = (token) => {
    if (!token) {
      return null;
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.warn("[SettingsPage] Token is not in correct JWT format");
        return null;
      }

      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");

      const paddedPayload =
        payload + "=".repeat((4 - (payload.length % 4)) % 4);
      const decoded = atob(paddedPayload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error("[SettingsPage] Error decoding JWT:", error);
      return null;
    }
  };

  const getStoredUser = () => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      console.warn("[SettingsPage] localStorage user is missing");
      return null;
    }

    try {
      const parsed = JSON.parse(rawUser);
      console.log("[SettingsPage] Parsed user from localStorage:", parsed);
      return parsed;
    } catch (error) {
      console.error("Cannot parse user data from localStorage:", error);
      return null;
    }
  };

  const extractUserId = (userData) => {
    if (!userData) {
      return null;
    }

    const candidates = [
      userData.userId,
      userData.userID,
      userData.id,
      userData.user?.userId,
      userData.user?.id,
      userData.data?.userId,
      userData.data?.id,
    ];

    const found = candidates.find(
      (value) => value !== undefined && value !== null && value !== ""
    );

    if (found === undefined || found === null) {
      console.warn(
        "[SettingsPage] Cannot find userId in candidates list",
        candidates
      );
      return null;
    }

    if (typeof found === "string") {
      const trimmed = found.trim();
      if (trimmed === "") {
        console.warn("[SettingsPage] userId is string but empty after trim");
        return null;
      }

      const numeric = Number(trimmed);
      return Number.isNaN(numeric) ? trimmed : numeric;
    }

    return found;
  };

  const normalizeUserIdForRequest = (userId) => {
    if (userId === undefined || userId === null) {
      return null;
    }

    if (typeof userId === "number") {
      console.log("[SettingsPage] userId is number, use directly:", userId);
      return userId;
    }

    if (typeof userId === "string") {
      const trimmed = userId.trim();
      if (trimmed === "") {
        console.warn(
          "[SettingsPage] userId is string but empty after trim in normalize"
        );
        return null;
      }

      const numeric = Number(trimmed);
      if (!Number.isNaN(numeric)) {
        console.log(
          "[SettingsPage] userId is string but can convert to number:",
          numeric
        );
      } else {
        console.log("[SettingsPage] userId is string and keep as is:", trimmed);
      }
      return Number.isNaN(numeric) ? trimmed : numeric;
    }

    return userId;
  };

  useEffect(() => {
    const off = onLangChange(() => setTick((v) => v + 1));
    return () => off();
  }, []);

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        // Get userId from localStorage
        const userData = getStoredUser();

        if (!userData) {
          console.warn("Cannot find user information in localStorage");
          setIsLoading(false);
          return;
        }

        const rawUserId = extractUserId(userData);
        console.log("[SettingsPage] rawUserId found:", rawUserId);
        let userId = normalizeUserIdForRequest(rawUserId);
        console.log("[SettingsPage] userId after normalize:", userId);

        if (!userId) {
          console.warn("Cannot find userId in user information");

          const tokenFromUser = userData.accessToken;
          const tokenFromStorage = localStorage.getItem("token");
          const decoded = decodeJwt(tokenFromUser || tokenFromStorage);
          console.log("[SettingsPage] decoded from token:", decoded);

          if (decoded) {
            const tokenCandidates = [
              decoded[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ],
              decoded[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"
              ],
              decoded.sub,
              decoded.userId,
              decoded.id,
            ];

            const tokenUserId = tokenCandidates.find(
              (value) => value !== undefined && value !== null && value !== ""
            );
            if (tokenUserId) {
              userId = normalizeUserIdForRequest(tokenUserId);
              console.log("[SettingsPage] userId from token:", userId);
              if (userId) {
                userData.userId = userId;
                localStorage.setItem("user", JSON.stringify(userData));
              }
            }
          }

          if (!userId) {
            // Fallback: load from localStorage as before
            // Format dateOfBirth from localStorage if available
            let formattedDateOfBirth = "";
            if (userData.dateOfBirth) {
              const birthDate = new Date(userData.dateOfBirth);
              if (!isNaN(birthDate.getTime())) {
                const year = birthDate.getFullYear();
                const month = String(birthDate.getMonth() + 1).padStart(2, "0");
                const day = String(birthDate.getDate()).padStart(2, "0");
                formattedDateOfBirth = `${year}-${month}-${day}`;
              }
            }

            // Convert gender from localStorage (could be integer or string)
            let genderValue = "";
            if (userData.gender !== undefined && userData.gender !== null) {
              genderValue = String(userData.gender);
            }

            setFormData((prev) => ({
              ...prev,
              imgURL: userData.imgURL || userData.avatar || "",
              fullname: userData.fullname || "",
              gender: genderValue,
              dateOfBirth: formattedDateOfBirth || userData.dateOfBirth || "",
              age: userData.age || "",
              username: userData.username || "",
              email: userData.email || "",
              phone: userData.phone || "",
              address:
                userData.address ||
                (userData.houseNumber && userData.street
                  ? `${userData.houseNumber} ${userData.street}`
                  : ""),
              city: userData.city || "",
              ward: userData.ward || "",
              wardId:
                userData.wardId ||
                (userData.ward && typeof userData.ward === "number"
                  ? userData.ward
                  : null) ||
                "",
              role: userData.role || "",
              airlinePartner: userData.airlinePartner || "",
            }));
            setIsLoading(false);
            return;
          }
        }

        // Call API to get profile information
        const result = await getUserProfile(userId);
        console.log("[SettingsPage] Result from getUserProfile:", result);

        if (result.success && result.data) {
          const profileData = result.data;

          // Calculate age if dateOfBirth is available
          let age = "";
          let formattedDateOfBirth = "";
          if (profileData.dateOfBirth) {
            const birthDate = new Date(profileData.dateOfBirth);
            if (!isNaN(birthDate.getTime())) {
              // Format dateOfBirth to YYYY-MM-DD for input type="date"
              const year = birthDate.getFullYear();
              const month = String(birthDate.getMonth() + 1).padStart(2, "0");
              const day = String(birthDate.getDate()).padStart(2, "0");
              formattedDateOfBirth = `${year}-${month}-${day}`;

              // Calculate age
              const today = new Date();
              let calculatedAge = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
              ) {
                calculatedAge--;
              }
              age = calculatedAge.toString();
            }
          }

          // Convert gender from integer to string to match radio buttons
          let genderValue = "";
          if (profileData.gender !== undefined && profileData.gender !== null) {
            // Gender from API is integer (1, 2, 3), convert to string
            genderValue = String(profileData.gender);
          }

          // Handle imgURL
          let imgURL = "";
          if (profileData.imgURL) {
            imgURL = profileData.imgURL;
            // If it's a relative URL, add base URL
            if (
              imgURL &&
              !imgURL.startsWith("http") &&
              !imgURL.startsWith("data:")
            ) {
              const API_BASE_URL = "https://cabincrewcareer.azurewebsites.net";
              imgURL = imgURL.startsWith("/")
                ? `${API_BASE_URL}${imgURL}`
                : `${API_BASE_URL}/${imgURL}`;
            }
          }

          // Get cityId and wardId from API
          const cityId =
            profileData.cityId ||
            profileData.cityID ||
            profileData.city?.id ||
            null;
          const wardId =
            profileData.wardId ||
            profileData.wardID ||
            profileData.ward?.id ||
            null;

          // Fetch city name from cityId
          let cityName = profileData.city || profileData.cityName || "";
          if (cityId && !cityName) {
            try {
              const citiesResult = await getCities();
              if (citiesResult.success && citiesResult.data) {
                const citiesList = Array.isArray(citiesResult.data)
                  ? citiesResult.data
                  : Array.isArray(citiesResult.data.items)
                  ? citiesResult.data.items
                  : Array.isArray(citiesResult.data.results)
                  ? citiesResult.data.results
                  : [];

                const foundCity = citiesList.find(
                  (c) => (c.id || c.cityId || c.provinceId) == cityId
                );
                if (foundCity) {
                  cityName =
                    foundCity.name ||
                    foundCity.cityName ||
                    foundCity.provinceName ||
                    "";
                }
              }
            } catch (error) {
              console.error("[SettingsPage] Error getting city name:", error);
            }
          }

          // Fetch ward name from wardId and cityId
          let wardName =
            profileData.ward ||
            profileData.commune ||
            profileData.wardName ||
            "";
          if (wardId && cityId && !wardName) {
            try {
              const wardsResult = await getWardsForCity(cityId);
              if (wardsResult.success && wardsResult.data) {
                const wardsList = Array.isArray(wardsResult.data)
                  ? wardsResult.data
                  : Array.isArray(wardsResult.data.items)
                  ? wardsResult.data.items
                  : Array.isArray(wardsResult.data.results)
                  ? wardsResult.data.results
                  : [];

                const foundWard = wardsList.find(
                  (w) => (w.id || w.wardId) == wardId
                );
                if (foundWard) {
                  wardName = foundWard.name || foundWard.wardName || "";
                }
              }
            } catch (error) {
              console.error("[SettingsPage] Error getting ward name:", error);
            }
          }

          // Map data from API to formData
          setFormData((prev) => ({
            ...prev,
            imgURL: imgURL,
            fullname:
              profileData.fullname ||
              profileData.fullName ||
              profileData.name ||
              "",
            gender: genderValue,
            dateOfBirth: formattedDateOfBirth || profileData.dateOfBirth || "",
            age: age || profileData.age || "",
            username: profileData.username || userData.username || "",
            email: profileData.email || "",
            phone: profileData.phone || profileData.phoneNumber || "",
            address:
              profileData.address ||
              (profileData.houseNumber && profileData.street
                ? `${profileData.houseNumber} ${profileData.street}`
                : ""),
            city: cityName,
            cityId: cityId || "",
            ward: wardName,
            wardId: wardId || "",
            role: profileData.role || userData.role || "",
            airlinePartner: profileData.airlinePartner || "",
          }));

          // Update localStorage with new data from API
          const updatedUser = {
            ...userData,
            ...profileData,
            userId: profileData.userId ?? userId,
            age: age || profileData.age || "",
            imgURL: imgURL,
            city: cityName,
            cityId: cityId,
            ward: wardName,
            wardId: wardId,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          // If API fails, fallback to localStorage
          console.warn("Cannot get information from API:", result.error);

          // Format dateOfBirth from localStorage if available
          let formattedDateOfBirth = "";
          if (userData.dateOfBirth) {
            const birthDate = new Date(userData.dateOfBirth);
            if (!isNaN(birthDate.getTime())) {
              const year = birthDate.getFullYear();
              const month = String(birthDate.getMonth() + 1).padStart(2, "0");
              const day = String(birthDate.getDate()).padStart(2, "0");
              formattedDateOfBirth = `${year}-${month}-${day}`;
            }
          }

          // Convert gender from localStorage (could be integer or string)
          let genderValue = "";
          if (userData.gender !== undefined && userData.gender !== null) {
            genderValue = String(userData.gender);
          }

          setFormData((prev) => ({
            ...prev,
            imgURL: userData.imgURL || userData.avatar || "",
            fullname: userData.fullname || "",
            gender: genderValue,
            dateOfBirth: formattedDateOfBirth || userData.dateOfBirth || "",
            age: userData.age || "",
            username: userData.username || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address:
              userData.address ||
              (userData.houseNumber && userData.street
                ? `${userData.houseNumber} ${userData.street}`
                : ""),
            city: userData.city || "",
            ward: userData.ward || "",
            wardId:
              userData.wardId ||
              (userData.ward && typeof userData.ward === "number"
                ? userData.ward
                : null) ||
              "",
            role: userData.role || "",
            airlinePartner: userData.airlinePartner || "",
          }));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Cannot load profile information. Please try again.");

        // Fallback: load from localStorage
        const userData = getStoredUser();
        if (userData) {
          // Format dateOfBirth from localStorage if available
          let formattedDateOfBirth = "";
          if (userData.dateOfBirth) {
            const birthDate = new Date(userData.dateOfBirth);
            if (!isNaN(birthDate.getTime())) {
              const year = birthDate.getFullYear();
              const month = String(birthDate.getMonth() + 1).padStart(2, "0");
              const day = String(birthDate.getDate()).padStart(2, "0");
              formattedDateOfBirth = `${year}-${month}-${day}`;
            }
          }

          // Convert gender from localStorage (could be integer or string)
          let genderValue = "";
          if (userData.gender !== undefined && userData.gender !== null) {
            genderValue = String(userData.gender);
          }

          setFormData((prev) => ({
            ...prev,
            imgURL: userData.imgURL || userData.avatar || "",
            fullname: userData.fullname || "",
            gender: genderValue,
            dateOfBirth: formattedDateOfBirth || userData.dateOfBirth || "",
            age: userData.age || "",
            username: userData.username || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address:
              userData.address ||
              (userData.houseNumber && userData.street
                ? `${userData.houseNumber} ${userData.street}`
                : ""),
            city: userData.city || "",
            ward: userData.ward || "",
            wardId:
              userData.wardId ||
              (userData.ward && typeof userData.ward === "number"
                ? userData.ward
                : null) ||
              "",
            role: userData.role || "",
            airlinePartner: userData.airlinePartner || "",
          }));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate Full Name: only letters and spaces
    if (name === "fullname") {
      const filteredValue = value.replace(/[^a-zA-ZÀ-ỹ\s]/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: filteredValue,
      }));
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }
    
    // Validate Phone: only digits
    if (name === "phone") {
      const filteredValue = value.replace(/\D/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: filteredValue,
      }));
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calculate age when date of birth changes
    if (name === "dateOfBirth" && value) {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      setFormData((prev) => ({
        ...prev,
        age: age.toString(),
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAvatarChange = (e, imageUrl = null) => {
    // If there's imageUrl from API (after successful upload), use it
    if (imageUrl) {
      setFormData((prev) => ({
        ...prev,
        imgURL: imageUrl,
      }));
      return;
    }

    // Fallback: if no imageUrl, read local file (for preview before upload)
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          imgURL: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = t("required_field");
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.fullname.trim())) {
      newErrors.fullname = "Full Name can only contain letters and spaces.";
    }

    if (!formData.gender) {
      newErrors.gender = t("required_field");
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t("required_field");
    }

    if (!formData.username.trim()) {
      newErrors.username = t("required_field");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("required_field");
    } else if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = "Email must be a Gmail address (@gmail.com).";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t("required_field");
    } else {
      const mobileRegex = /^\d{10,11}$/;
      if (!mobileRegex.test(formData.phone)) {
        newErrors.phone = "Mobile Number must be 10-11 digits.";
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = t("required_field");
    }

    if (!formData.city) {
      newErrors.city = t("required_field");
    }

    if (!formData.ward) {
      newErrors.ward = t("required_field");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handleSubmit is handled in UpdateProfileButton
  // Keep it for form compatibility, but do nothing
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Form submission is handled in UpdateProfileButton
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("user_profile")}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your personal information
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600">{t("loading_data")}</p>
          </div>
        )}

        {!isLoading && (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-8 lg:grid-cols-3"
          >
            {/* Left Column - Personal Info & Contact */}
            <div className="lg:col-span-1">
              <PersonalInformation
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                handleAvatarChange={handleAvatarChange}
                genders={genders}
              />
            </div>

            {/* Right Column - Detailed Information */}
            <div className="space-y-8 lg:col-span-2">
              <AccountInformation formData={formData} errors={errors} />

              <AddressInformation
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                setFormData={setFormData}
              />

              <UpdateProfileButton
                formData={formData}
                validateForm={validateForm}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
