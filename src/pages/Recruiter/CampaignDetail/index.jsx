import React, { useMemo } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import Approvers from './Approvers'
import ApprovalLog from './ApprovalLog'
import DetailInfo from './DetailInfo'
import Followers from './Followers'
// import PendingCampaignDetail from './PendingCampaignDetail'

const CampaignDetail = () => {
    const { id } = useParams()
    const { state } = useLocation()
    const navigate = useNavigate()
    const campaign = state?.campaign

    // Kiểm tra nếu campaign đang chờ phê duyệt (pending)
    // if (campaign?.status === 'pending') {
    //     return <PendingCampaignDetail campaign={campaign} />
    // }

    const timeline = useMemo(() => ([
        { time: '15:24', text: 'Request created', by: 'Đặng Bích Thu Thủy' },
        { time: '17:51', text: 'Tony Quok approved the request', by: 'Tony Quok' },
        { time: '18:08', text: 'Hoàng Nhật Trường approved the request', by: 'Hoàng Nhật Trường' },
        { time: '19:30', text: 'Lương Thị Phúc approved the request', by: 'Lương Thị Phúc' },
    ]), [])

    const goBack = () => navigate('/recruiter/campaigns')

    return (
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">
                        {campaign?.name || 'Tuyển dụng Tiếp viên hàng không 2024'}
                    </h1>
                    <p className="text-slate-600 mt-1 text-sm">{campaign?.position || 'Flight Attendant'} - {campaign?.department || 'Cabin Crew'}</p>
                </div>
                <button onClick={goBack} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">Quay lại</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DetailInfo campaign={campaign} />
                </div>

                <div className="space-y-6">
                    <Approvers />
                    <Followers />
                    <ApprovalLog timeline={timeline} />
                </div>
            </div>
        </div>
    )
}

export default CampaignDetail
