import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { importFinalReview } from '../../../service/api'

const ImportHauKiemModal = ({ open, onClose, roundId, campaignRoundId, campaignId, batchData }) => {
    const inputRef = useRef(null)
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const navigate = useNavigate()

    if (!open) return null

    const validateFile = (selectedFile) => {
        if (!selectedFile) return false

        // Kiểm tra định dạng file
        const isValidFormat = selectedFile.name.endsWith('.xlsx') ||
            selectedFile.name.endsWith('.xls') ||
            selectedFile.name.endsWith('.csv')

        if (!isValidFormat) {
            toast.error('Please select an Excel file (.xlsx, .xls) or CSV')
            return false
        }

        // Kiểm tra kích thước file (maximum 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (selectedFile.size > maxSize) {
            toast.error('File size must be less than 10MB')
            return false
        }

        return true
    }

    const handlePickFile = () => {
        if (inputRef.current) {
            inputRef.current.click()
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0] || null
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile)
        } else {
            // Reset input
            if (inputRef.current) {
                inputRef.current.value = ''
            }
            setFile(null)
        }
    }

    const handleDragEnter = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const droppedFile = e.dataTransfer.files?.[0] || null
        if (droppedFile && validateFile(droppedFile)) {
            setFile(droppedFile)
            // Set file vào input để đảm bảo consistency
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(droppedFile)
            if (inputRef.current) {
                inputRef.current.files = dataTransfer.files
            }
        } else {
            setFile(null)
        }
    }

    const handleSubmit = async () => {
        if (!roundId) {
            toast.error('Round ID not found to import')
            return
        }

        if (!file) {
            toast.error('Please choose a file to import')
            return
        }

        setLoading(true)
        try {
            const result = await importFinalReview(roundId, file)

            if (result.success) {
                toast.success('Upload successfully')
                setFile(null)
                // Reset input
                if (inputRef.current) {
                    inputRef.current.value = ''
                }
                onClose?.()
                // Navigate to final review page with campaignRoundId if available, otherwise use roundId
                const targetId = campaignRoundId || roundId
                navigate(`/recruiter/final-review/${targetId}`, {
                    state: {
                        batch: batchData,
                        campaignId: campaignId
                    }
                })
            } else {
                toast.error(result.error || 'Cannot import the Excel file')
            }
        } catch (error) {
            console.error('Lỗi khi import:', error)
            toast.error('An error occurred while importing the file')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setFile(null)
        // Reset input
        if (inputRef.current) {
            inputRef.current.value = ''
        }
        onClose?.()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-xl shadow-lg border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Submit post-audit documents</h3>
                    <button onClick={handleCancel} className="text-slate-500 hover:text-slate-700">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="px-6 py-5 space-y-6">
                    {/* Drag and Drop Zone */}
                    <div
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : file
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-slate-300 hover:border-blue-400 bg-slate-50'
                            }`}
                    >
                        {/* Upload Icon */}
                        <div className="flex justify-center mb-4">
                            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="text-base font-semibold text-slate-800 mb-2">Drag and drop Excel file here</p>
                        <p className="text-sm text-slate-600 mb-4">Or click the button below to select a file from your computer</p>
                        <button
                            onClick={handlePickFile}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Select Excel file
                        </button>
                        {file && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-slate-800">{file.name}</span>
                                    <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                    />

                    {/* Quick Guide Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="text-sm font-semibold text-slate-800">Quick guide</h4>
                        </div>
                        <ul className="space-y-2 pl-7">
                            <li className="text-sm text-slate-600 list-disc">
                                Download template from the Export button and fill in the flight hours confirmation information for each candidate.
                            </li>
                            <li className="text-sm text-slate-600 list-disc">
                                Mark Pass/Fail and only use Excel (.xlsx, .xls) or CSV (maximum 10MB).
                            </li>
                            <li className="text-sm text-slate-600 list-disc">
                                Upload file to automatically update the confirmation results.
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!file || loading}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white font-medium transition-colors ${!file || loading
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {loading ? 'Processing...' : 'Upload file'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImportHauKiemModal


