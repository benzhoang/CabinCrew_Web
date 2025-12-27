import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../../i18n";
import {
  submitExistingApplication,
  updateApplication,
} from "../../service/api";
import { toast } from "react-toastify";

const ProfileFormActions = ({
  children,
  formData,
  files,
  applicationId,
  isEditing,
  setIsEditing,
  originalFormData,
  setOriginalFormData,
  setFormData,
  captchaCode,
  captchaInput,
  handleInputChange,
  refreshCaptcha,
  applicationStatus,
}) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateCaptcha = useCallback(() => {
    if (captchaInput.toUpperCase() !== captchaCode) {
      toast.error(t("application_form_captcha_incorrect"));
      refreshCaptcha();
      return false;
    }
    return true;
  }, [captchaCode, captchaInput, refreshCaptcha]);

  const handleUpdate = useCallback(
    (e) => {
      e.preventDefault();
      if (!validateCaptcha()) {
        return;
      }

      console.log("Updated form data:", formData);
      console.log("Updated files:", files);
      toast.success("Information updated successfully!");
    },
    [files, formData, validateCaptcha]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmitting) {
        return;
      }
      if (!validateCaptcha()) {
        return;
      }
      if (!applicationId) {
        toast.error("Application ID not found. Please reload and try again.");
        return;
      }
      const campaignRoundId = formData.campaignRoundId
        ? parseInt(formData.campaignRoundId, 10)
        : undefined;
      setIsSubmitting(true);
      try {
        const result = await submitExistingApplication(
          applicationId,
          campaignRoundId
        );
        if (result.success) {
          toast.success(
            result.message || "Application submitted successfully!"
          );
          navigate("/profile");
        } else {
          toast.error(
            result.error || "Could not submit application. Please try again."
          );
        }
      } catch (error) {
        console.error("Submit application error:", error);
        toast.error(
          "An error occurred when submitting the application. Please try again later."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      applicationId,
      formData.campaignRoundId,
      isSubmitting,
      navigate,
      validateCaptcha,
    ]
  );

  const handleEditClick = useCallback(() => {
    if (applicationStatus === "passed") {
      return;
    }
    setOriginalFormData({ ...formData });
    setIsEditing(true);
  }, [formData, setIsEditing, setOriginalFormData, applicationStatus]);

  const handleSaveClick = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSaving) {
        return;
      }
      if (!validateCaptcha()) {
        return;
      }
      if (!applicationId) {
        toast.error("Application ID not found. Please reload and try again.");
        return;
      }

      setIsSaving(true);
      try {
        const campaignRoundId = formData.campaignRoundId
          ? parseInt(formData.campaignRoundId, 10)
          : undefined;
        const payload = {
          experience: formData.workingExperience,
          height: formData.height,
          weight: formData.weight,
          englishDegreeNumber: formData.englishCertificate,
          endDate: formData.certificateExpireDate,
          applicationForm: files.applicationForm,
          profilePhoto: files.profilePhoto,
          educationDegree: files.educationDegree,
          englishCertificate: files.englishCertificate,
          passportOrID: files.idCard,
          passportOrIDBack: files.idCardBack,
        };
        if (campaignRoundId) {
          payload.campaignRoundId = campaignRoundId;
        }

        const result = await updateApplication(applicationId, payload);
        if (result.success) {
          toast.success(result.message || "Information updated successfully!");
          setIsEditing(false);
          setOriginalFormData(null);
        } else {
          toast.error(
            result.error || "Could not update application. Please try again."
          );
        }
      } catch (error) {
        console.error("Update application error:", error);
        toast.error(
          "An error occurred when updating the application. Please try again later."
        );
      } finally {
        setIsSaving(false);
      }
    },
    [
      applicationId,
      files,
      formData,
      isSaving,
      setIsEditing,
      setOriginalFormData,
      validateCaptcha,
    ]
  );

  const handleCancelClick = useCallback(() => {
    if (originalFormData) {
      setFormData(originalFormData);
    }
    setIsEditing(false);
    setOriginalFormData(null);
  }, [originalFormData, setFormData, setIsEditing, setOriginalFormData]);

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      {children}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Captcha Verification
        </label>
        <div className="flex items-center gap-4">
          <div className="bg-gray-200 p-4 rounded border text-2xl font-bold text-gray-700 select-none">
            {captchaCode}
          </div>
          <div className="flex-1">
            <input
              type="text"
              name="captcha"
              value={captchaInput}
              onChange={handleInputChange}
              placeholder="Enter captcha code"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        <button
          type="button"
          onClick={refreshCaptcha}
          className="text-sm text-blue-600 underline hover:text-blue-800 cursor-pointer"
        >
          Try new code
        </button>
      </div>

      <div className="flex gap-4">
        {!isEditing ? (
          <>
            <button
              type="button"
              onClick={handleEditClick}
              disabled={applicationStatus === "passed"}
              className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md text-lg ${
                applicationStatus === "passed"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              Update information
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCancelClick}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md text-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving || applicationStatus === "passed"}
              className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md text-lg ${
                isSaving || applicationStatus === "passed"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </form>
  );
};

export default ProfileFormActions;
