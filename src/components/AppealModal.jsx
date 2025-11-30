import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../i18n';
import { createEnquiryRequest } from '../service/api';
import { toast } from 'react-toastify';

const AppealModal = ({ isOpen, onClose, onConfirm, testSessionId }) => {
    const navigate = useNavigate();
    const [appealReason, setAppealReason] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        // Validate lý do phúc khảo
        if (!appealReason.trim()) {
            setError(t('appeal_reason_required') || 'Vui lòng nhập lý do yêu cầu phúc khảo');
            return;
        }

        if (appealReason.trim().length < 10) {
            setError(t('appeal_reason_min_length') || 'Lý do phúc khảo phải có ít nhất 10 ký tự');
            return;
        }

        if (appealReason.trim().length > 250) {
            setError(t('appeal_reason_max_length') || 'Lý do phúc khảo không được vượt quá 250 ký tự');
            return;
        }

        // Validate testSessionId
        if (!testSessionId) {
            setError('Không tìm thấy thông tin bài thi. Vui lòng thử lại.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await createEnquiryRequest(testSessionId, appealReason.trim());

            if (result.success) {
                // Thành công - hiển thị thông báo và điều hướng
                toast.success(
                    result.message || t('appeal_submitted_success') || 'Yêu cầu phúc khảo đã được gửi thành công!'
                );

                // Gọi callback nếu có
                if (onConfirm) {
                    onConfirm(appealReason.trim());
                }

                // Reset form
                setAppealReason('');
                setIsLoading(false);
                onClose();

                // Điều hướng đến trang promotion-stages
                navigate('/recruitment-stages');
            } else {
                // Lỗi từ API
                setError(result.error || 'Không thể gửi yêu cầu phúc khảo. Vui lòng thử lại.');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Error creating enquiry request:', err);
            setError('Đã xảy ra lỗi khi gửi yêu cầu phúc khảo. Vui lòng thử lại.');
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setAppealReason('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>
            <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {t('request_appeal') || 'Yêu cầu phúc khảo'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {t('appeal_confirm_message') || 'Bạn có chắc chắn muốn yêu cầu phúc khảo điểm thi này? Yêu cầu của bạn sẽ được xem xét và phản hồi trong thời gian sớm nhất.'}
                        </p>

                        {/* Input lý do phúc khảo */}
                        <div className="mb-4">
                            <label htmlFor="appeal-reason" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('appeal_reason_label') || 'Lý do yêu cầu phúc khảo'} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="appeal-reason"
                                value={appealReason}
                                onChange={(e) => {
                                    setAppealReason(e.target.value);
                                    setError(''); // Clear error when user types
                                }}
                                rows={4}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                                placeholder={t('appeal_reason_placeholder') || 'Vui lòng nhập lý do yêu cầu phúc khảo (tối thiểu 10 ký tự)...'}
                            />
                            {error && (
                                <p className="mt-1 text-sm text-red-600">{error}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                {t('appeal_reason_helper') || 'Vui lòng mô tả chi tiết lý do bạn yêu cầu phúc khảo điểm thi này.'}
                            </p>
                        </div>

                        {/* Lưu ý */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-blue-800">
                                <strong>{t('appeal_note') || 'Lưu ý:'}</strong> {t('appeal_note_detail') || 'Yêu cầu phúc khảo chỉ được xử lý trong vòng 7 ngày kể từ ngày công bố kết quả. Vui lòng kiểm tra email hoặc thông báo để nhận kết quả phúc khảo.'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {t('cancel') || 'Hủy'}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading
                            ? (t('sending') || 'Đang gửi...')
                            : (t('confirm_appeal') || 'Xác nhận phúc khảo')
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppealModal;