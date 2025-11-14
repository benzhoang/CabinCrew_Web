import React from 'react';
import { t } from '../../../i18n';

/**
 * SubmitWarningModal Component
 * Component hiển thị pop-up cảnh báo khi người dùng muốn nộp file ghi âm
 */
const SubmitWarningModal = ({ isOpen, onClose, onConfirm, questionId }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="relative z-10 w-full max-w-md p-6 mx-4 bg-white shadow-2xl rounded-xl">
                <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                        <svg
                            className="w-8 h-8 text-amber-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="mb-1 text-lg font-semibold text-gray-900">
                            {t('submit_recording_warning_title') || 'Xác nhận nộp file ghi âm'}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {t('submit_recording_warning_message') || 'Bạn có chắc chắn muốn nộp file ghi âm này? Sau khi nộp, bạn sẽ không thể chỉnh sửa hoặc ghi âm lại.'}
                        </p>
                    </div>
                </div>

                <div className="p-3 mt-3 border rounded-lg bg-amber-50 border-amber-200">
                    <p className="text-sm font-medium text-amber-800">
                        ⚠️ {t('submit_recording_warning_note') || 'Lưu ý: Sau khi nộp, bạn sẽ không thể thay đổi file ghi âm này.'}
                    </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {t('cancel') || 'Hủy'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        {t('confirm_submit') || 'Xác nhận nộp'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmitWarningModal;

