import React, { useState, useEffect } from "react";
import {
  FiUpload,
  FiX,
  FiAlertCircle,
  FiFileText,
  FiInfo,
  FiLoader,
} from "react-icons/fi";

const ImportFlightHoursModal = ({
  isOpen,
  onClose,
  roundId,
  campaignRoundId,
  onImport,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setStatus({ type: null, message: "" });
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const isExcelFile =
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.name.endsWith(".csv");
    if (!isExcelFile) {
      setStatus({
        type: "error",
        message:
          "Please select the correct Excel format (.xlsx, .xls or .csv).",
      });
      setSelectedFile(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setStatus({
        type: "error",
        message: "File size must not exceed 10 MB.",
      });
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setStatus({ type: null, message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setStatus({
        type: "error",
        message: "You have not selected an Excel file to upload.",
      });
      return;
    }

    if (!roundId) {
      setStatus({ type: "error", message: "Round information not found." });
      return;
    }

    setIsUploading(true);
    setStatus({ type: null, message: "" });

    try {
      // Nếu có callback tùy chỉnh, dùng callback
      if (onImport) {
        const result = await onImport(selectedFile, roundId, campaignRoundId);
        if (result && result.success === false) {
          setStatus({
            type: "error",
            message: result.error || "Cannot import Excel file.",
          });
        } else {
          // Đóng modal - callback sẽ xử lý refresh/redirect
          onClose?.();
        }
      } else {
        // Default import logic - có thể gọi API import ở đây
        console.log(
          "Import flight hours data from file:",
          selectedFile.name,
          "for round:",
          roundId
        );
        setStatus({
          type: "error",
          message:
            "Import function is not implemented. Please contact the administrator.",
        });
      }
    } catch (error) {
      console.error("Error importing:", error);
      setStatus({
        type: "error",
        message: error.message || "Error importing Excel file.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Import flight hours confirmation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
            disabled={isUploading}
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {status.type === "error" && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
              <FiAlertCircle className="w-5 h-5" />
              <span>{status.message}</span>
            </div>
          )}

          <div className="border border-dashed border-indigo-300 rounded-2xl p-8 bg-indigo-50/40 text-center">
            <FiUpload className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
            <p className="text-lg font-semibold text-gray-900">
              Drag and drop Excel file here
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Or click the button below to select a file from your computer
            </p>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors font-medium">
              <FiFileText className="w-4 h-4" />
              Select Excel file
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>

            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-700">
                  Selected:{" "}
                  <span className="font-medium">{selectedFile.name}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50 space-y-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FiInfo className="w-4 h-4 text-indigo-500" />
              Quick guide
            </div>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>
                Download template from the Export button and fill in the flight
                hours confirmation information for each candidate.
              </li>
              <li>
                Mark Pass/Fail and only use Excel (.xlsx, .xls) or CSV (maximum
                10MB).
              </li>
              <li>
                Upload file to automatically update the confirmation results.
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="w-4 h-4" />
                  Upload file
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportFlightHoursModal;
