import React, { useRef, useEffect, useState } from 'react';

/**
 * Component hiển thị modal pop-up để xem hình ảnh
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {string} imageUrl - URL của hình ảnh cần hiển thị
 * @param {string} title - Tiêu đề của modal
 * @param {function} onClose - Callback khi đóng modal
 */
const ImageModal = ({ isOpen, imageUrl, title = 'Xem mẫu', onClose }) => {
    // Lưu lại giá trị overflow ban đầu bằng useRef
    const originalOverflowRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showQuickGuide, setShowQuickGuide] = useState(true);

    const QUICK_GUIDE = [
        {
            title: 'File size & format',
            details:
                'Keep the file size under 5 MB. Prefer JPG. Avoid screenshots of PDFs if you can export the page as an image instead.',
        },
        {
            title: 'Clear, readable, and in focus',
            details:
                'Make sure text is sharp and readable (no blur). Use good lighting, keep hands/shadows out of the frame, and avoid low-resolution images.',
        },
        {
            title: 'Correct framing (no cropping corners)',
            details:
                'Capture the full certificate including all 4 corners. Don\'t cut off edges.Keep the document flat and aligned(avoid extreme angles).',
        },
        {
            title: 'Do not cover important information',
            details:
                'Do not place fingers, stickers, or watermarks over key fields (name, identification number, scores, dates). Keep the entire document visible.',
        },
        {
            title: 'No heavy editing',
            details:
                'Do not over-edit (filters, strong contrast, aggressive compression). Light brightness adjustment is OK if it improves readability.',
        },
        {
            title: 'Information must match across documents',
            details:
                'Your name, date of birth, and identification number on the TOEIC certificate must exactly match your ID card and application form. Scores must be valid (Listening/Reading: divisible by 5, Total = Listening + Reading). Valid Until date must be exactly 2 years after Test Date.',
        },
    ];

    const handleOverlayClick = (e) => {
        // Chỉ đóng khi click vào overlay, không đóng khi click vào ảnh
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    useEffect(() => {
        // Reset image state when modal opens/closes or imageUrl changes
        if (isOpen && imageUrl) {
            setImageLoaded(false);
            setImageError(false);
            setShowQuickGuide(true);
        }
    }, [isOpen, imageUrl]);

    useEffect(() => {
        // Lưu lại giá trị overflow ban đầu lần đầu tiên
        if (originalOverflowRef.current === null) {
            originalOverflowRef.current = document.body.style.overflow || '';
        }

        if (!isOpen) {
            // Đảm bảo restore overflow khi modal đóng
            document.body.style.overflow = originalOverflowRef.current;
            return;
        }

        // Thêm event listener cho phím ESC
        const handleKeyDown = (e) => {
            // Đóng modal khi nhấn phím ESC
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        // Ngăn scroll body khi modal mở
        document.body.style.overflow = 'hidden';

        // Cleanup function
        return () => {
            // Restore lại overflow ban đầu
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflowRef.current;
        };
    }, [isOpen, onClose]);

    const handleImageLoad = () => {
        setImageLoaded(true);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(false);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={handleOverlayClick}
        >
            <div
                className="relative max-w-4xl max-h-[90vh] mx-4 w-full animate-slide-down"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Container chính */}
                <div className="bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
                    {/* Header */}
                    {title && (
                        <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-3 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight truncate">
                                    {title}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowQuickGuide((v) => !v)}
                                    className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm font-semibold"
                                    aria-expanded={showQuickGuide}
                                    aria-controls="image-modal-quick-guide"
                                    title="Show/Hide Quick guide"
                                >
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    Quick guide
                                </button>
                            </div>
                            <button
                                onClick={onClose}
                                className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                aria-label="Đóng"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Body (scrollable) */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Quick guide */}
                        {showQuickGuide && (
                            <div
                                id="image-modal-quick-guide"
                                className="px-5 py-4 bg-white border-b border-gray-200"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                                                    />
                                                </svg>
                                            </span>
                                            <h4 className="text-sm font-extrabold text-gray-900 tracking-tight">
                                                Quick guide (image requirements)
                                            </h4>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Follow these tips to avoid rejection due to unreadable or incomplete images.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowQuickGuide(false)}
                                        className="sm:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                                        aria-label="Hide Quick guide"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {QUICK_GUIDE.map((item) => (
                                        <div
                                            key={item.title}
                                            className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                                        >
                                            <p className="text-sm font-bold text-gray-900">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                                                {item.details}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Image Container */}
                        <div className="relative bg-gray-50 p-4 min-h-[300px] flex items-center justify-center">
                            {/* Loading State */}
                            {!imageLoaded && !imageError && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-sm text-gray-500 font-medium">Loading images...</p>
                                    </div>
                                </div>
                            )}

                            {/* Error State */}
                            {imageError && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center space-y-4 text-center px-4">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-red-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-gray-900 mb-1">
                                                Không thể tải hình ảnh
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Vui lòng kiểm tra lại đường dẫn hoặc thử lại sau
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Image */}
                            <img
                                src={imageUrl}
                                alt={title}
                                className={`max-w-full max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg transition-all duration-300 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                    }`}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Footer với thông tin */}
                    <div className="px-5 py-2 bg-gray-50 border-t border-gray-200 sticky bottom-0 z-10">
                        <p className="text-xs text-gray-500 text-center">
                            Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-xs">ESC</kbd> or click outside to close
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;