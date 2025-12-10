import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { importFinalReview } from '../../../service/api'

const ImportHauKiemModal = ({ open, onClose, roundId, campaignRoundId, campaignId, batchData }) => {
    const inputRef = useRef(null)
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    if (!open) return null

    const handlePickFile = () => {
        if (inputRef.current) {
            inputRef.current.click()
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0] || null
        if (selectedFile) {
            // Kiểm tra định dạng file
            const isExcelFile = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')
            if (!isExcelFile) {
                toast.error('Please select an Excel file (.xlsx or .xls)')
                // Reset input
                if (inputRef.current) {
                    inputRef.current.value = ''
                }
                setFile(null)
                return
            }
            setFile(selectedFile)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-xl rounded-xl shadow-lg border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Submit post-audit documents</h3>
                    <button onClick={handleCancel} className="text-slate-500 hover:text-slate-700">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-slate-600">Please select the Excel file (.xlsx or .xls) containing the post-audit documents.</p>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePickFile} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Choose file</button>
                        <span className="text-sm text-slate-500">{file ? file.name : 'File not selected'}</span>
                    </div>
                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                    />
                    {file && (
                        <div className="border border-slate-200 rounded-md p-3 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-slate-800 truncate block" title={file.name}>{file.name}</span>
                                    <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setFile(null)
                                        if (inputRef.current) {
                                            inputRef.current.value = ''
                                        }
                                    }}
                                    className="ml-3 text-slate-400 hover:text-slate-600"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button onClick={handleCancel} disabled={loading} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                    <button onClick={handleSubmit} disabled={!file || loading} className={`px-4 py-2 rounded-lg text-sm text-white font-medium ${!file || loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                        {loading ? 'Processing...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImportHauKiemModal


