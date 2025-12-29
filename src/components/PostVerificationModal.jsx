import React, { useState } from "react";
import { t } from "../i18n";

const PostVerificationModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    englishCertificate: null,
    healthCertificate: null,
  });

  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));

    // Clear error when file is selected
    if (files[0]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.healthCertificate) {
      newErrors.healthCertificate = "Please upload the health certificate";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      englishCertificate: null,
      healthCertificate: null,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Submit Post Verification
          </h2>
          <button
            onClick={handleClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* English Certificate Upload */}
          <div>
            <div className="relative">
              <input
                type="file"
                name="englishCertificate"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
            </div>
            {errors.englishCertificate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.englishCertificate}
              </p>
            )}
          </div>

          {/* Health Certificate Upload */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Health Certificate *
            </label>
            <div className="relative">
              <input
                type="file"
                name="healthCertificate"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="p-6 transition-colors duration-200 border-2 border-dashed rounded-lg border-slate-300 hover:border-blue-400 hover:bg-blue-50">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-slate-400"
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
                    {formData.healthCertificate ? (
                      <span className="font-medium text-green-600">
                        ✓ {formData.healthCertificate.name}
                      </span>
                    ) : (
                      <span>Click to select the health certificate</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Supported: PDF, DOC, DOCX, JPG, PNG
                  </p>
                </div>
              </div>
            </div>
            {errors.healthCertificate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.healthCertificate}
              </p>
            )}
          </div>

          {/* Information Notice */}
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-blue-400 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Important Notice
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="space-y-1 list-disc list-inside">
                    <li>
                      The health certificate must be issued within the last 6
                      months
                    </li>
                    <li>
                      The uploaded file must be clear, complete information
                    </li>
                    <li>Maximum file size: 10MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 font-medium text-white transition-colors duration-200 bg-gray-500 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Submit Post Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostVerificationModal;
