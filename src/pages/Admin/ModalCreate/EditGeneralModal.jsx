import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  getConfigurationById,
  updateConfiguration,
} from "../../../service/api2";

const EditGeneralModal = ({ isOpen, onClose, configId, onSuccess }) => {
  const [benchmark, setBenchmark] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [configData, setConfigData] = useState(null);

  useEffect(() => {
    if (isOpen && configId) {
      setIsLoading(true);
      setError("");
      // Fetch configuration data by ID
      getConfigurationById(configId)
        .then((res) => {
          if (res.success && res.data) {
            setConfigData(res.data);
            setBenchmark(res.data.benchmark?.toString() || "");
          } else {
            setError(res.error || "Cannot load configuration");
            toast.error("Cannot load configuration");
          }
        })
        .catch((err) => {
          console.error("Error loading configuration:", err);
          setError(err.message || "Cannot load configuration");
          toast.error("An error occurred while loading configuration");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, configId]);

  if (!isOpen || !configId) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const benchmarkValue = parseInt(benchmark.trim(), 10);

    if (isNaN(benchmarkValue) || benchmarkValue < 0) {
      setError("Benchmark must be a valid number (>= 0)");
      return;
    }

    if (!configData) {
      setError("Configuration data is not loaded");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      // Chuẩn bị data để gửi API
      const updateData = {
        ...configData,
        benchmark: benchmarkValue,
        // Đảm bảo các giá trị là số
        roundConfigurationId:
          configData.roundConfigurationId || configData.id || 0,
        campaignType:
          typeof configData.campaignType === "string"
            ? parseInt(configData.campaignType, 10)
            : configData.campaignType || 0,
        configurationType:
          typeof configData.configurationType === "string"
            ? parseInt(configData.configurationType, 10)
            : configData.configurationType || 1,
      };

      const result = await updateConfiguration(updateData);

      if (result.success) {
        toast.success("Update configuration successfully");
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setError(result.error || "Cannot update configuration");
        toast.error("Cannot update configuration");
      }
    } catch (err) {
      console.error("Error updating configuration:", err);
      setError(err.message || "An error occurred while updating configuration");
      toast.error("An error occurred while updating configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Edit Configuration
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Close"
            disabled={isSubmitting || isLoading}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="ml-3 text-sm text-gray-600">
              Loading configuration...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Configuration Type
              </label>
              <input
                type="text"
                value={configData?.configurationType || ""}
                disabled
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-200 text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Campaign Type
              </label>
              <input
                type="text"
                value={configData?.campaignType || ""}
                disabled
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-200 text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Effective Date
              </label>
              <input
                type="text"
                value={configData?.effectiveDate || ""}
                disabled
                className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-200 text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Benchmark <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={benchmark}
                onChange={(e) => {
                  setBenchmark(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter benchmark value"
                className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? "border-red-500" : "border-slate-300"
                }`}
                disabled={isSubmitting || isLoading}
                required
              />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditGeneralModal;
