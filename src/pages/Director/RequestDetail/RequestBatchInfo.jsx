import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const formatDate = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return isoString
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

const mockCampaign = {
    id: 1,
    code: "CCD1 MRF",
    title: "Yêu cầu tuyển dụng - MRF",
    subtitle: "Cabin Crew (Thay thế do nghỉ việc/Thai sản)",
    proposer: "Đặng Bích Thu Thùy (Crew Welfare Team Leader)",
    role: "Tiếp viên hàng không",
    department: "Cabin Crew",
    unit: "Cabin Crew - Tiếp viên hàng không",
    quantity: 20,
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    description:
        "Tuyển dụng tiếp viên hàng không cho các chuyến bay nội địa và quốc tế",
    requirements:
        "Tiếng Anh tốt, Chiều cao 1.60m+, Kỹ năng giao tiếp, Sức khỏe tốt",
    rounds: [
        {
            id: "r1",
            name: "Đợt 1",
            status: "Đang diễn ra",
            startDate: "2024-10-01",
            endDate: "2024-10-15",
            location: "Hà Nội",
            method: "Trực tiếp",
            owner: "Nguyễn Thanh Tùng",
            target: "200",
            actual: "0",
            notes: "Phỏng vấn vòng 1",
            progress: 70,
        },
        {
            id: "r2",
            name: "Đợt 2",
            status: "Sắp diễn ra",
            startDate: "2024-11-01",
            endDate: "2024-11-15",
            location: "TP.HCM",
            method: "Trực tiếp",
            owner: "Trần Bảo Vy",
            target: "100",
            actual: "0",
            notes: "Phỏng vấn vòng 2",
            progress: 0,
        },
    ],
}

const Section = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-sm font-semibold text-gray-900 mb-3">{title}</div>
        {children}
    </div>
)

const RequestBatchInfo = () => {
    const { state } = useLocation()
    const data = state?.campaign || mockCampaign
    console.log("Data: ", data)
    const navigate = useNavigate()
    const [expandedStats, setExpandedStats] = useState({})

    const toggleStats = (roundId) => {
        setExpandedStats(prev => ({
            ...prev,
            [roundId]: !prev[roundId]
        }))
    }

    const handleViewCandidates = (round) => {
        navigate(`/director/campaigns/${data.id}/candidate`, {
            state: {
                campaignId: data.id,
                roundName: round.name,
                round: round,
                campaign: data
            }
        })
    }

    // Function to check if button should be disabled based on round status
    const isButtonDisabled = (roundStatus) => {
        return roundStatus === 'Sắp diễn ra' || roundStatus === 'Chưa diễn ra'
    }

    // Function to get button styling based on status
    const getButtonStyle = (roundStatus) => {
        if (isButtonDisabled(roundStatus)) {
            return "w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
        }
        return "w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
    }

    return (
        <div className="px-6 pt-0 pb-6">
            <Section title="Kế hoạch các đợt tuyển">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {data.rounds.map((round) => (
                        <div key={round.id} className="rounded-xl border border-gray-200">
                            <div className="px-5 py-3 flex items-center justify-between bg-gray-50 rounded-t-xl">
                                <div className="font-semibold text-gray-900">{round.name}</div>
                                <span className={`${round.status === 'Đang diễn ra'
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : round.status === 'Sắp diễn ra'
                                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        : round.status === 'Chưa diễn ra'
                                            ? 'bg-gray-100 text-gray-700 border-gray-200'
                                            : 'bg-gray-100 text-gray-700 border-gray-200'
                                    } text-xs px-2 py-0.5 rounded-full border`}>
                                    {round.status}
                                </span>
                            </div>
                            <div className="p-5">
                                {/* 2-column detail grid where each pair forms a row to keep perfect alignment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                                    {/* Row 1 */}
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Thời gian bắt đầu</div>
                                        <div className="text-gray-900 font-medium">{formatDate(round.startDate)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Địa điểm</div>
                                        <div className="text-gray-900 font-medium">{round.location}</div>
                                    </div>

                                    {/* Row 2 */}
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Thời gian kết thúc</div>
                                        <div className="text-gray-900 font-medium">{formatDate(round.endDate)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Phụ trách</div>
                                        <div className="text-gray-900 font-medium">{round.owner}</div>
                                    </div>

                                    {/* Row 3: Align "Thực tế" with "Ghi chú" on the same row */}
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Thực tế</div>
                                        <div className="text-gray-900 font-medium">{round.actual ?? 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Ghi chú</div>
                                        <div className="text-gray-900 font-medium">{round.notes}</div>
                                    </div>

                                    {/* Row 4 */}
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Hình thức</div>
                                        <div className="text-gray-900 font-medium">{round.method}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs mb-1">Chỉ tiêu</div>
                                        <div className="text-gray-900 font-medium">{round.target}</div>
                                    </div>
                                </div>

                                {/* Removed progress bar and candidate list button per request */}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <div className="mt-4 flex justify-end gap-3">
                <button
                    onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) {
                            console.log('Yêu cầu đã được duyệt')
                        }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                    Duyệt
                </button>
                <button
                    onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
                            console.log('Yêu cầu đã bị từ chối')
                        }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                    Từ chối
                </button>
                <button
                    onClick={() => { console.log('Giao việc cho yêu cầu') }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                    Giao việc
                </button>
            </div>
        </div>
    )
}

export default RequestBatchInfo

