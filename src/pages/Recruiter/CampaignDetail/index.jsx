import React, { useMemo } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import Approvers from './Approvers'
import ApprovalLog from './ApprovalLog'
import DetailInfo from './DetailInfo'
import Followers from './Followers'

const CampaignDetail = () => {
    const { id } = useParams()
    const { state } = useLocation()
    const navigate = useNavigate()
    const campaign = state?.campaign

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
                    <h1 className="text-2xl md:text-3xl font-extrabold text-red-600 tracking-wide uppercase">
                        Yêu cầu tuyển dụng - MRF
                    </h1>
                    <p className="text-slate-600 mt-1 text-sm">[CCD] MRF - Cabin Crew (Replacement for Resignation/Maternity)</p>
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
