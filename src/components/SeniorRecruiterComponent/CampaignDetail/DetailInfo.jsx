import React, { useState } from 'react'
import BatchManagement from './BatchManagement'

const DetailInfo = ({ campaign, onCreateBatch }) => {
    const [isEditingInfo, setIsEditingInfo] = useState(false)
    const [editData, setEditData] = useState({
        position: campaign?.position || 'Flight Attendant',
        department: campaign?.department || 'Cabin Crew',
        unit: 'Cabin Crew - Tiếp viên hàng không',
        targetHires: campaign?.targetHires ?? 20,
        startDate: campaign?.startDate || '2024-01-15',
        endDate: campaign?.endDate || '2024-03-15',
        description: campaign?.description || 'Nhu cầu tuyển dụng theo kế hoạch khai thác năm 2024 và bổ sung nhân sự thay thế.',
        requirements: campaign?.requirements || 'Tiếng Anh tốt, kỹ năng giao tiếp, sức khỏe tốt.'
    })

    const handleEditInfo = () => {
        setIsEditingInfo(true)
    }

    const handleSaveInfo = () => {
        // TODO: Implement save logic
        console.log('Saving campaign info:', editData)
        setIsEditingInfo(false)
        alert('Đã cập nhật thông tin campaign!')
    }

    const handleCancelEdit = () => {
        setIsEditingInfo(false)
        // Reset to original data
        setEditData({
            position: campaign?.position || 'Flight Attendant',
            department: campaign?.department || 'Cabin Crew',
            unit: 'Cabin Crew - Tiếp viên hàng không',
            targetHires: campaign?.targetHires ?? 20,
            startDate: campaign?.startDate || '2024-01-15',
            endDate: campaign?.endDate || '2024-03-15',
            description: campaign?.description || 'Nhu cầu tuyển dụng theo kế hoạch khai thác năm 2024 và bổ sung nhân sự thay thế.',
            requirements: campaign?.requirements || 'Tiếng Anh tốt, kỹ năng giao tiếp, sức khỏe tốt.'
        })
    }

    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                        Thông tin đề xuất
                        <button
                            onClick={handleEditInfo}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                            title="Chỉnh sửa thông tin"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    </div>
                    <div className="text-slate-800 font-semibold">Đặng Bích Thu Thủy (Crew Welfare Team Leader)</div>
                </div>
                <div className="text-right text-xs text-slate-500">
                    <div>Ngày tạo: 15:24 29/08/2024</div>
                    <div>Mã số: 138897</div>
                </div>
            </div>

            <div className="p-5">
                {isEditingInfo ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EditableInfo 
                                label="Vị trí tuyển" 
                                value={editData.position}
                                onChange={(value) => handleInputChange('position', value)}
                            />
                            <EditableInfo 
                                label="Phòng ban" 
                                value={editData.department}
                                onChange={(value) => handleInputChange('department', value)}
                            />
                            <EditableInfo 
                                label="Đơn vị" 
                                value={editData.unit}
                                onChange={(value) => handleInputChange('unit', value)}
                            />
                            <EditableInfo 
                                label="Số lượng tuyển" 
                                value={editData.targetHires.toString()}
                                onChange={(value) => handleInputChange('targetHires', parseInt(value) || 0)}
                                type="number"
                            />
                            <EditableInfo 
                                label="Ngày bắt đầu" 
                                value={editData.startDate}
                                onChange={(value) => handleInputChange('startDate', value)}
                                type="date"
                            />
                            <EditableInfo 
                                label="Ngày kết thúc" 
                                value={editData.endDate}
                                onChange={(value) => handleInputChange('endDate', value)}
                                type="date"
                            />
                        </div>

                        <div>
                            <div className="text-sm text-slate-600 mb-1">Mô tả nhu cầu</div>
                            <textarea
                                value={editData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                            />
                        </div>

                        <div>
                            <div className="text-sm text-slate-600 mb-1">Yêu cầu</div>
                            <textarea
                                value={editData.requirements}
                                onChange={(e) => handleInputChange('requirements', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={handleSaveInfo}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                            >
                                Lưu thay đổi
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Info label="Vị trí tuyển" value={editData.position} />
                            <Info label="Phòng ban" value={editData.department} />
                            <Info label="Đơn vị" value={editData.unit} />
                            <Info label="Số lượng tuyển" value={`${editData.targetHires}`} />
                            <Info label="Ngày bắt đầu" value={editData.startDate} />
                            <Info label="Ngày kết thúc" value={editData.endDate} />
                        </div>

                        <div className="mt-6">
                            <div className="text-sm text-slate-600 mb-1">Mô tả nhu cầu</div>
                            <div className="text-slate-800 text-sm bg-slate-50 rounded-md p-3 border border-slate-200">
                                {editData.description}
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="text-sm text-slate-600 mb-1">Yêu cầu</div>
                            <div className="text-slate-800 text-sm bg-slate-50 rounded-md p-3 border border-slate-200">
                                {editData.requirements}
                            </div>
                        </div>

                        <BatchManagement campaign={campaign} onCreateBatch={onCreateBatch} />
                    </div>
                )}
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

const EditableInfo = ({ label, value, onChange, type = "text" }) => (
    <div>
        <div className="text-sm text-slate-600 mb-1">{label}</div>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
)

export default DetailInfo
