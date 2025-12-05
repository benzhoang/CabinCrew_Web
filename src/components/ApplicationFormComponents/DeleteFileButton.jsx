import React from 'react'

/**
 * Component hiển thị nút xóa file với icon thùng rác
 * @param {function} onDelete - Callback function khi nhấn xóa
 * @param {string} title - Tooltip text khi hover
 * @param {string} className - CSS classes tùy chỉnh
 */
const DeleteFileButton = ({ onDelete, title = 'Xóa file', className = '' }) => {
    const handleClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (onDelete) {
            onDelete()
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-600 hover:bg-red-100 ${className}`}
            title={title}
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M10 11v6m4-6v6M9 7l1-2h4l1 2m-1 12H9a2 2 0 01-2-2V7h10v10a2 2 0 01-2 2z" />
            </svg>
        </button>
    )
}

export default DeleteFileButton

