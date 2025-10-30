import React, { useRef, useState } from 'react'

const ImportHauKiemModal = ({ open, onClose, onSubmit }) => {
    const inputRef = useRef(null)
    const [files, setFiles] = useState([])

    if (!open) return null

    const handlePickFolder = () => {
        if (inputRef.current) {
            inputRef.current.click()
        }
    }

    const handleFilesChange = (e) => {
        const fileList = Array.from(e.target.files || [])
        setFiles(fileList)
    }

    const handleSubmit = () => {
        onSubmit?.(files)
        setFiles([])
        onClose?.()
    }

    const handleCancel = () => {
        setFiles([])
        onClose?.()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-xl rounded-xl shadow-lg border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Nộp hồ sơ văn bản hậu kiểm</h3>
                    <button onClick={handleCancel} className="text-slate-500 hover:text-slate-700">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-slate-600">Hãy chọn thư mục chứa các văn bản hậu kiểm (PDF/Word/Ảnh...). Toàn bộ tệp bên trong sẽ được tải lên.</p>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePickFolder} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Chọn thư mục</button>
                        <span className="text-sm text-slate-500">{files.length > 0 ? `${files.length} tệp đã chọn` : 'Chưa chọn thư mục'}</span>
                    </div>
                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        webkitdirectory="true"
                        directory="true"
                        multiple
                        onChange={handleFilesChange}
                    />
                    {files.length > 0 && (
                        <div className="max-h-56 overflow-auto border border-slate-200 rounded-md">
                            <ul className="divide-y divide-slate-200 text-sm">
                                {files.map((f, i) => (
                                    <li key={`${f.name}-${i}`} className="px-3 py-2 flex items-center justify-between">
                                        <span className="truncate max-w-[70%]" title={f.webkitRelativePath || f.name}>{f.webkitRelativePath || f.name}</span>
                                        <span className="text-slate-400">{(f.size / 1024).toFixed(1)} KB</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm">Hủy</button>
                    <button onClick={handleSubmit} disabled={files.length === 0} className={`px-4 py-2 rounded-lg text-sm text-white font-medium ${files.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>Nộp</button>
                </div>
            </div>
        </div>
    )
}

export default ImportHauKiemModal


