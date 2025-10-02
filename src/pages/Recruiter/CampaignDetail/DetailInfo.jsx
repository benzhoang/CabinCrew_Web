import React from 'react'
import BatchManagement from './BatchManagement'

const DetailInfo = ({ campaign, onCreateBatch }) => {

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

                <BatchManagement campaign={campaign} onCreateBatch={onCreateBatch} />
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

export default DetailInfo
