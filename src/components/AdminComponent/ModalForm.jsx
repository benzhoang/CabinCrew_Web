import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { createUser } from "../../service/api2";

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
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or roleName changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: "",
        fullname: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
      });
      setErrors({});
    }
  }, [isOpen, roleName]);

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

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
        const age = calculateAge(value);
        return age < 22 ? "Age must be 22 or older" : "";
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
      };

      console.log("API Data (Formatted):", apiData);

      const result = await createUser(apiData);

      // Log API response để debug
      console.log("API Response:", result);

      if (result.success) {
        // Show success toast
        toast.success(
          result.message ||
            `Tạo tài khoản ${roleName.toLowerCase()} thành công!`
        );
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
        });
        setErrors({});
        // Close modal after a short delay to allow toast to be visible
        setTimeout(() => {
          onClose();
        }, 100);
      } else {
        // Show error toast
        toast.error(result.error || "Tạo tài khoản thất bại");
      }
    } catch (error) {
      // Show error toast
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Đã xảy ra lỗi khi tạo tài khoản"
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
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 font-medium text-white transition-colors rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
