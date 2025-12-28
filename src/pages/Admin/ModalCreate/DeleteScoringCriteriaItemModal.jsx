import React from "react";
import { FiX, FiAlertTriangle, FiLoader } from "react-icons/fi";

const DeleteScoringCriteriaItemModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 space-y-4 bg-white shadow-xl rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Criteria
            </h3>
          </div>
          <button
            onClick={onClose}
            className="transition-colors text-slate-500 hover:text-slate-700"
            aria-label="Close"
            disabled={isDeleting}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="py-2">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete the criteria{" "}
            <span className="font-semibold text-slate-900">"{itemTitle}"</span>?
            This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 transition-colors border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            {isDeleting && <FiLoader className="w-4 h-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteScoringCriteriaItemModal;
