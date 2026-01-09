import React, { useState } from "react";
import { FiX } from "react-icons/fi";

const CreateGeneralModal = ({ isOpen, onClose, onSuccess }) => {
    const [benchmark, setBenchmark] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const benchmarkValue = parseInt(benchmark.trim(), 10);

        if (isNaN(benchmarkValue) || benchmarkValue < 0) {
            setError("Benchmark must be a valid number (>= 0)");
            return;
        }

        // TODO: Implement API call to create configuration
        // For now, just close modal
        if (onSuccess) {
            onSuccess();
        }
        onClose();
        setBenchmark("");
        setError("");
    };

    const handleClose = () => {
        setBenchmark("");
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
                            required
                        />
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
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGeneralModal;

