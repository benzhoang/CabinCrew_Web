import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  createUser,
  getAllAirlinePartners,
  getAllUsers,
} from "../../service/api2";

// Map roleName to roleId
const getRoleId = (roleName) => {
  const roleMap = {
    Recruiter: 4,
    Examiner: 5,
    "Cabin Crew": 6,
    "Airline Partner": 8,
  };
  return roleMap[roleName] || 4;
};

const ModalForm = ({ isOpen, onClose, onSubmit, roleName = "Recruiter" }) => {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    partnerId: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [airlinePartners, setAirlinePartners] = useState([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);

  // Calculate maximum date (end of year, 18 years ago from today)
  // This allows selecting dates where age >= 18
  // For example, if today is 2024, max date is 2006-12-31 (allows selecting any date in 2006 and earlier)
  const getMaxDate = () => {
    const today = new Date();
    const maxYear = today.getFullYear() - 18;
    // Format as YYYY-MM-DD directly to avoid timezone issues with toISOString()
    return `${maxYear}-12-31`;
  };

  // Fetch airline partners and existing accounts when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (
        isOpen &&
        (roleName === "Airline Partner" || roleName === "Cabin Crew")
      ) {
        setIsLoadingPartners(true);
        try {
          // Fetch airline partners
          const partnersResult = await getAllAirlinePartners();
          if (partnersResult.success) {
            // Handle different response formats
            const partners = Array.isArray(partnersResult.data)
              ? partnersResult.data
              : Array.isArray(partnersResult.data?.items)
              ? partnersResult.data.items
              : [];
            setAirlinePartners(partners);

            // Only auto-select partner for Airline Partner role, not for Cabin Crew
            if (roleName === "Airline Partner") {
              // Fetch existing Airline Partner accounts to find which partners don't have accounts yet
              const roleId = getRoleId("Airline Partner"); // Role ID 8

              // Fetch accounts with flexible page and pageSize (similar to CampaignList pattern)
              const currentPage = 1;
              const pageSize = 5;

              const accountsResult = await getAllUsers({
                roleId: roleId,
                page: currentPage,
                pageSize: pageSize,
              });

              if (accountsResult.success) {
                // Handle different response formats
                const accounts = Array.isArray(accountsResult.data)
                  ? accountsResult.data
                  : Array.isArray(accountsResult.data?.items)
                  ? accountsResult.data.items
                  : [];

                // Get list of partner names that already have accounts (normalize to lowercase for comparison)
                const existingPartnerNames = new Set(
                  accounts
                    .map((account) => {
                      // Try to get partner name from airlinePartner field or partnerName field
                      const partnerName =
                        account.airlinePartner || account.partnerName || "";
                      return partnerName.trim().toLowerCase();
                    })
                    .filter((name) => name !== "")
                );

                // Find the first partner that doesn't have an account yet
                // Compare by partnerName (normalized to lowercase)
                const availablePartner = partners.find((partner) => {
                  const partnerName = (partner.partnerName || "")
                    .trim()
                    .toLowerCase();
                  return (
                    partnerName !== "" && !existingPartnerNames.has(partnerName)
                  );
                });

                // Auto-select the first available partner after a small delay to ensure form reset has completed
                if (availablePartner) {
                  setTimeout(() => {
                    setFormData((prev) => ({
                      ...prev,
                      partnerId: String(availablePartner.partnerId),
                    }));
                  }, 100);
                }
              } else {
                console.error("Error fetching accounts:", accountsResult.error);
              }
            }
            // For Cabin Crew, partners are loaded but no auto-selection happens
          } else {
            console.error(
              "Failed to load airline partners:",
              partnersResult.error
            );
            toast.error("Failed to load airline partners");
          }
        } catch (error) {
          console.error("Error loading data:", error);
          toast.error("Error loading data");
        } finally {
          setIsLoadingPartners(false);
        }
      } else if (isOpen) {
        // For other roles, just fetch partners without auto-selection
        setIsLoadingPartners(true);
        try {
          const result = await getAllAirlinePartners();
          if (result.success) {
            const partners = Array.isArray(result.data)
              ? result.data
              : Array.isArray(result.data?.items)
              ? result.data.items
              : [];
            setAirlinePartners(partners);
          } else {
            console.error("Failed to load airline partners:", result.error);
          }
        } catch (error) {
          console.error("Error loading airline partners:", error);
        } finally {
          setIsLoadingPartners(false);
        }
      }
    };

    fetchData();
  }, [isOpen, roleName]);

  // Reset form when modal opens/closes or roleName changes
  // Note: partnerId will be auto-selected by fetchData useEffect only for Airline Partner role
  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: "",
        fullname: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        partnerId: "", // Will be auto-selected only if role is Airline Partner
      });
      setErrors({});
    }
  }, [isOpen, roleName]);

  const validateField = (name, value) => {
    switch (name) {
      case "username":
        return !value.trim() ? "Username is required" : "";
      case "fullname": {
        return !value.trim() ? "Full name is required" : "";
      }
      case "email": {
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? "Please enter a valid email" : "";
      }
      case "phoneNumber": {
        if (!value.trim()) return "Phone number is required";
        const phoneRegex = /^[0-9+\-\s()]+$/;
        return !phoneRegex.test(value)
          ? "Please enter a valid phone number"
          : "";
      }
      case "dateOfBirth": {
        if (!value) return "Date of birth is required";
        return "";
      }
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submit
    const newErrors = {};
    let hasErrors = false;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert formData to API format
      const apiData = {
        username: formData.username.trim(),
        fullName: formData.fullname.trim(), // API expects fullName (camelCase)
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth,
        roleId: getRoleId(roleName),
        partnerId: formData.partnerId ? parseInt(formData.partnerId, 10) : null,
      };

      console.log("API Data (Formatted):", apiData);

      const result = await createUser(apiData);

      // Log API response để debug
      console.log("API Response:", result);

      if (result.success) {
        // Show success toast
        toast.success(`Create ${roleName.toLowerCase()} account successfully!`);
        // Call the onSubmit callback if provided
        if (onSubmit) {
          onSubmit(result.data);
        }
        // Reset form
        setFormData({
          username: "",
          fullname: "",
          email: "",
          phoneNumber: "",
          dateOfBirth: "",
          partnerId: "",
        });
        setErrors({});
        // Close modal after a short delay to allow toast to be visible
        setTimeout(() => {
          onClose();
        }, 100);
      } else {
        // Show error toast
        toast.error(`Create ${roleName.toLowerCase()} account failed`);
      }
    } catch {
      // Show error toast
      toast.error(
        `An error occurred while creating ${roleName.toLowerCase()} account`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-white shadow-lg rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create new {roleName.toLowerCase()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-full hover:bg-gray-100"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
              </div>
              {/* FullName */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    errors.fullname ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.fullname && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullname}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Phone Number */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Date of birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  max={getMaxDate()}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              {/* Partner - Only show for Airline Partner and Cabin Crew */}
              {(roleName === "Airline Partner" ||
                roleName === "Cabin Crew") && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Partner
                  </label>
                  <select
                    name="partnerId"
                    value={formData.partnerId}
                    onChange={handleInputChange}
                    disabled={
                      isLoadingPartners || roleName === "Airline Partner"
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                      errors.partnerId ? "border-red-500" : "border-gray-300"
                    } ${
                      isLoadingPartners || roleName === "Airline Partner"
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <option value="">Select a partner</option>
                    {airlinePartners.map((partner) => (
                      <option key={partner.partnerId} value={partner.partnerId}>
                        {partner.partnerName}
                      </option>
                    ))}
                  </select>
                  {errors.partnerId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.partnerId}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 font-medium text-white transition-colors rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
