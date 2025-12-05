import React from 'react'

/**
 * Component hiển thị icon con mắt để xem mẫu
 * @param {string} url - URL của ảnh mẫu cần mở
 * @param {string} title - Tooltip text khi hover
 * @param {string} className - CSS classes tùy chỉnh
 */
const EyeIcon = ({ url, title = 'Xem mẫu', className = '' }) => {
    const handleClick = () => {
        if (url) {
            window.open(url, '_blank')
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`inline-flex items-center justify-center w-5 h-5 text-blue-600 hover:text-blue-800 transition-colors ${className}`}
            title={title}
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        </button>
    )
}

export default EyeIcon

