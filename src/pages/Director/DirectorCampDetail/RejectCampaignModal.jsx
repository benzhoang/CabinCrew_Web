import React, { useState } from "react";
import { toast } from "react-toastify";

// CSS animations for pop-up effect
const popupStyles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes pop-up {
    from { 
      opacity: 0; 
      transform: scale(0.8) translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  
  .animate-pop-up {
    animation: pop-up 0.3s ease-out;
  }
`;

// Inject styles into document head
if (
  typeof document !== "undefined" &&
  !document.querySelector("#reject-modal-styles")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "reject-modal-styles";
  styleSheet.textContent = popupStyles;
  document.head.appendChild(styleSheet);
}

const RejectCampaignModal = ({ isOpen, onClose, onSubmit, campaignTitle }) => {
  const [rejectReason, setRejectReason] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setRejectReason(value);

    if (errors.reason) {
      setErrors((prev) => ({
        ...prev,
        reason: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!rejectReason.trim()) {
      newErrors.reason = "Please enter a rejection reason";
    } else if (rejectReason.trim().length < 10) {
      newErrors.reason = "Rejection reason must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSubmit(rejectReason.trim());

      // Reset form
      setRejectReason("");
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error rejecting campaign:", error);
      toast.error("An error occurred while rejecting the proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRejectReason("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-pop-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Reject proposal
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {campaignTitle
                ? `Proposal: ${campaignTitle}`
                : "Please provide a reason for rejecting this proposal"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 transition-all duration-200 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            title="Close"
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
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-slate-50/30">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Rejection reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={rejectReason}
              onChange={handleInputChange}
              rows="6"
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none ${errors.reason ? "border-red-300" : "border-slate-300"
                }`}
              placeholder="Please enter the rejection reason (minimum 10 characters)..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Entered: {rejectReason.length} characters
            </p>
          </div>

          <div className="flex gap-3 pt-4 mt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${isSubmitting
                ? "bg-slate-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectCampaignModal;
