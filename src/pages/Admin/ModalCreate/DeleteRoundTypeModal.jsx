import React from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-toastify";
import { deleteRoundType } from "../../../service/api";

const DeleteRoundTypeModal = ({
  isOpen,
  onClose,
  roundType,
  onSuccess,
  isDeleting,
  setIsDeleting,
}) => {
  if (!isOpen || !roundType) return null;

  const handleConfirm = async () => {
    if (!roundType?.id) {
      toast.error("Round type id is missing");
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteRoundType(roundType.id);
      if (result.success) {
        toast.success("Delete round type successfully");
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error("Cannot delete round type");
      }
    } catch (error) {
      console.error("Error deleting round type:", error);
      toast.error("An error occurred while deleting round type");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Round Type
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Close"
            disabled={isDeleting}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="py-2">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              "{roundType.name || roundType.roundTypeName}"
            </span>
            ? This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoundTypeModal;
