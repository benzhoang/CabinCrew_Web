import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { createConfiguration } from "../../../service/api2";

const CreateGeneralModal = ({ isOpen, onClose, onSuccess, roundTypeId }) => {
    const [benchmark, setBenchmark] = useState("60");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const benchmarkValue = parseInt(benchmark.trim(), 10);

        if (isNaN(benchmarkValue)) {
            setError("Benchmark must be a valid number");
            return;
        }

        if (benchmarkValue < 60 || benchmarkValue > 100) {
            setError("Benchmark must be between 60 and 100");
            return;
        }

        if (!roundTypeId || roundTypeId === "") {
            setError("Please select a Round Type first");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Đảm bảo roundTypeId là number
            const roundTypeIdNumber = typeof roundTypeId === "string"
                ? parseInt(roundTypeId, 10)
                : Number(roundTypeId);

            if (isNaN(roundTypeIdNumber)) {
                setError("Invalid Round Type ID");
                setIsLoading(false);
                return;
            }

            const res = await createConfiguration(roundTypeIdNumber, benchmarkValue);

            if (res.success) {
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
                setBenchmark("60");
                setError("");
            } else {
                setError(res.error || "Failed to create configuration");
            }
        } catch (err) {
            setError(err.message || "Failed to create configuration");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setBenchmark("60");
        setError("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Create Configuration
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-slate-500 hover:text-slate-700 transition-colors"
                        aria-label="Close"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Benchmark (%) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                            <input
                                type="number"
                                min="60"
                                max="100"
                                value={benchmark}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setBenchmark(value);
                                    
                                    // Validate real-time
                                    if (value === "") {
                                        setError("");
                                        return;
                                    }
                                    
                                    const numValue = parseInt(value, 10);
                                    if (isNaN(numValue)) {
                                        setError("Benchmark must be a valid number");
                                    } else if (numValue < 60 || numValue > 100) {
                                        setError("Benchmark must be between 60 and 100");
                                    } else {
                                        setError("");
                                    }
                                }}
                                placeholder="Enter benchmark value (60-100)"
                                className={`w-full rounded-lg border bg-white px-3 py-2 pr-8 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-slate-300"
                                    }`}
                                required
                            />
                            <span className="absolute right-3 text-slate-600 pointer-events-none">%</span>
                        </div>
                        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGeneralModal;

