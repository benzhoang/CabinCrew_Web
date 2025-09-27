import React from 'react'

const DetailInfo = ({ campaign }) => {
    const batches = Array.isArray(campaign?.batches) && campaign.batches.length ? campaign.batches : [
        { name: 'Đợt 1', time: '01/10/2024 - 15/10/2024', location: 'Hà Nội', method: 'Trực tiếp', owner: 'Nguyễn Thanh Tùng', status: 'upcoming', current: 0, target: 10, note: 'Phỏng vấn vòng 1' },
        { name: 'Đợt 2', time: '01/11/2024 - 15/11/2024', location: 'TP.HCM', method: 'Trực tiếp', owner: 'Trần Bảo Vy', status: 'planned', current: 0, target: 10, note: 'Phỏng vấn vòng 2' },
    ]

    const getStatus = (status) => {
        const map = {
            ongoing: { text: 'Đang diễn ra', color: 'bg-green-100 text-green-700' },
            completed: { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-700' },
            planned: { text: 'Đã lên kế hoạch', color: 'bg-slate-100 text-slate-700' },
            upcoming: { text: 'Sắp diễn ra', color: 'bg-yellow-100 text-yellow-800' },
            paused: { text: 'Tạm dừng', color: 'bg-orange-100 text-orange-700' },
            cancelled: { text: 'Hủy', color: 'bg-red-100 text-red-700' },
        }
        return map[status] || map.planned
    }

    const percent = (current, target) => {
        if (!target || target <= 0) return 0
        const p = Math.round((Number(current || 0) / Number(target)) * 100)
        return Math.max(0, Math.min(100, p))
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                    <div className="text-sm text-slate-500">Thông tin đề xuất</div>
                    <div className="text-slate-800 font-semibold">Đặng Bích Thu Thủy (Crew Welfare Team Leader)</div>
                </div>
                <div className="text-right text-xs text-slate-500">
                    <div>Ngày tạo: 15:24 29/08/2024</div>
                    <div>Mã số: 138897</div>
                </div>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Info label="Vị trí tuyển" value={campaign?.position || 'Flight Attendant'} />
                    <Info label="Phòng ban" value={campaign?.department || 'Cabin Crew'} />
                    <Info label="Đơn vị" value="Cabin Crew - Tiếp viên hàng không" />
                    <Info label="Số lượng tuyển" value={`${campaign?.targetHires ?? 20}`} />
                    <Info label="Ngày bắt đầu" value={campaign?.startDate || '2024-01-15'} />
                    <Info label="Ngày kết thúc" value={campaign?.endDate || '2024-03-15'} />
                </div>

                <div className="mt-6">
                    <div className="text-sm text-slate-600 mb-1">Mô tả nhu cầu</div>
                    <div className="text-slate-800 text-sm bg-slate-50 rounded-md p-3 border border-slate-200">
                        {campaign?.description || 'Nhu cầu tuyển dụng theo kế hoạch khai thác năm 2024 và bổ sung nhân sự thay thế.'}
                    </div>
                </div>

                <div className="mt-4">
                    <div className="text-sm text-slate-600 mb-1">Yêu cầu</div>
                    <div className="text-slate-800 text-sm bg-slate-50 rounded-md p-3 border border-slate-200">
                        {campaign?.requirements || 'Tiếng Anh tốt, kỹ năng giao tiếp, sức khỏe tốt.'}
                    </div>
                </div>

                <div className="mt-6">
                    <div className="text-sm text-slate-600 mb-2">Kế hoạch các đợt tuyển</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {batches.map((b, i) => {
                            const statusCfg = getStatus(b.status)
                            const p = percent(b.current, b.target)
                            return (
                                <div key={i} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                        <div className="text-sm font-semibold text-slate-800">{b.name}</div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.color}`}>{statusCfg.text}</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <InfoMini label="Thời gian" value={b.time} />
                                            <InfoMini label="Địa điểm" value={b.location || '—'} />
                                            <InfoMini label="Hình thức" value={b.method || '—'} />
                                            <InfoMini label="Phụ trách" value={b.owner || '—'} />
                                            {b.target !== undefined && (
                                                <InfoMini label="Chỉ tiêu" value={`${b.current ?? 0}/${b.target}`} />
                                            )}
                                            {b.note && (
                                                <InfoMini label="Ghi chú" value={b.note} />
                                            )}
                                        </div>
                                        {b.target !== undefined && (
                                            <div>
                                                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                                                    <span>Tiến độ</span>
                                                    <span>{p}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2">
                                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${p}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

const Info = ({ label, value }) => (
    <div>
        <div className="text-sm text-slate-600">{label}</div>
        <div className="font-medium text-slate-800">{value}</div>
    </div>
)

const InfoMini = ({ label, value }) => (
    <div>
        <div className="text-slate-500">{label}</div>
        <div className="text-slate-800 font-medium">{value}</div>
    </div>
)

export default DetailInfo
