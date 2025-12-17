import React from "react";
import { FiX, FiAlertTriangle, FiLoader } from "react-icons/fi";

const DeleteScoringCriteriaItemModal = ({ isOpen, onClose, onConfirm, itemTitle, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                            <FiAlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            Xóa tiêu chí
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
                        Bạn có chắc chắn muốn xóa tiêu chí <span className="font-semibold text-slate-900">"{itemTitle}"</span>? Hành động này không thể hoàn tác.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDeleting}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={isDeleting}
                    >
                        {isDeleting && <FiLoader className="w-4 h-4 animate-spin" />}
                        {isDeleting ? "Đang xóa..." : "Xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteScoringCriteriaItemModal;

