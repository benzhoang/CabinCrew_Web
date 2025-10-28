import React from 'react'

const ApprovalLog = ({ timeline }) => {
    const items = Array.isArray(timeline) ? timeline : []
    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 font-semibold text-slate-800">Nhật ký phê duyệt</div>
            <div className="p-5">
                <ol className="relative border-s ps-4 border-slate-200">
                    {items.map((ev, i) => (
                        <li key={i} className="mb-4 ms-4">
                            <div className="absolute w-2 h-2 bg-blue-600 rounded-full -start-1 mt-2"></div>
                            <time className="text-xs text-slate-500">{ev.time}</time>
                            <div className="text-sm text-slate-800">{ev.text}</div>
                            <div className="text-xs text-slate-500">{ev.by}</div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    )
}

export default ApprovalLog
