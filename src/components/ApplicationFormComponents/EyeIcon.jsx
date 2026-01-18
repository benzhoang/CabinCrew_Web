import React from 'react'

/**
 * Component hiển thị icon cảnh báo (dấu chấm than) để xem mẫu
 * @param {string} url - URL của ảnh mẫu cần mở
 * @param {string} title - Tooltip text khi hover
 * @param {string} className - CSS classes tùy chỉnh
 * @param {function} onClick - Callback khi click vào icon (thay vì mở link)
 */
const EyeIcon = ({ url, title = 'Xem mẫu', className = '', onClick }) => {
    const handleClick = () => {
        if (onClick) {
            // Nếu có callback, gọi callback
            onClick();
        } else if (url) {
            // Fallback: mở link nếu không có callback
            window.open(url, '_blank')
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`inline-flex items-center justify-center w-5 h-5 text-red-600 hover:text-red-800 transition-colors ${className}`}
            title={title}
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
        </button>
    )
}

export default EyeIcon

