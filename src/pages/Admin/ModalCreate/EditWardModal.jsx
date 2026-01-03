import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { updateWard } from "../../../service/api";

const EditWardModal = ({ isOpen, onClose, ward, onSuccess }) => {
  const [wardName, setWardName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && ward) {
      setWardName(ward.wardName || ward.name || "");
      setError("");
    }
  }, [isOpen, ward]);

  if (!isOpen || !ward) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = wardName.trim();

    if (!trimmedName) {
      setError("Ward name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const wardId = ward.wardId ?? ward.id;
      const result = await updateWard(wardId, trimmedName);

      if (result.success) {
        toast.success("Update ward successfully");
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error("Cannot update ward");
      }
    } catch (err) {
      console.error("Error updating ward:", err);
      toast.error("An error occurred while updating ward");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Update Ward</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Close"
            disabled={isSubmitting}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ward name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={wardName}
              onChange={(e) => {
                setWardName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter ward name"
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-slate-300"
              }`}
              disabled={isSubmitting}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWardModal;
