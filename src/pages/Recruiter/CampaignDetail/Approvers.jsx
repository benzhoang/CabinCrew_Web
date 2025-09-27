import React from 'react'

const Approvers = ({ approvers }) => {
    const list = approvers && approvers.length ? approvers : ['Tony Quok', 'Hoàng Nhật Trường', 'Lương Thị Phúc']
    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 font-semibold text-slate-800">Người xét duyệt</div>
            <div className="p-5 space-y-4">
                {list.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-slate-800">{name}</div>
                            <div className="text-xs text-slate-500">Approver</div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Approved</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Approvers
