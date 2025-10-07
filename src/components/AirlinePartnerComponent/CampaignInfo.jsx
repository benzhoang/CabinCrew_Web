
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'


const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="text-sm font-semibold text-gray-900 mb-3">{title}</div>
    {children}
  </div>
)

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-36 shrink-0 text-gray-500 text-sm">{label}</div>
    <div className="text-gray-900 text-sm">{value}</div>
  </div>
)

const CampaignInfo = ({ campaign }) => {
  const data = campaign
  const navigate = useNavigate()
  const [expandedStats, setExpandedStats] = useState({})
  
  const toggleStats = (roundId) => {
    setExpandedStats(prev => ({
      ...prev,
      [roundId]: !prev[roundId]
    }))
  }

  const handleViewCandidates = (round) => {
    navigate(`/airline-partner/campaigns/${data.id}/candidate`, {
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
    <div className="w-full h-full">
      <div className="grid grid-cols-1 gap-5">
        <Section title="Thông tin đề xuất">
          <div className="text-gray-900 font-medium">{data.proposer}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <InfoRow label="Vị trí tuyển" value={data.role} />
            <InfoRow label="Phòng ban" value={data.department} />
            <InfoRow label="Đơn vị" value={data.unit} />
            <InfoRow label="Số lượng tuyển" value={data.quantity} />
            <InfoRow label="Ngày bắt đầu" value={formatDate(data.startDate)} />
            <InfoRow label="Ngày kết thúc" value={formatDate(data.endDate)} />
          </div>
          <div className="mt-4">
            <InfoRow label="Mô tả nhu cầu" value={data.description} />
          </div>
          <div className="mt-2">
            <InfoRow label="Yêu cầu" value={data.requirements} />
          </div>
        </Section>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="mb-5">
            <div className="text-sm font-semibold text-gray-900">Kế hoạch các đợt tuyển</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.rounds.map((round) => (
              <div key={round.id} className="rounded-xl border border-gray-200">
                <div className="px-5 py-3 flex items-center justify-between bg-gray-50 rounded-t-xl">
                  <div className="font-semibold text-gray-900">{round.name}</div>
                  <span className={`${
                    round.status === 'Đang diễn ra' 
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Thời gian bắt đầu</div>
                        <div className="text-gray-900 font-medium">{formatDate(round.startDate)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Thời gian kết thúc</div>
                        <div className="text-gray-900 font-medium">{formatDate(round.endDate)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Hình thức</div>
                        <div className="text-gray-900 font-medium">{round.method}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Chỉ tiêu</div>
                        <div className="text-gray-900 font-medium">{round.target}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Địa điểm</div>
                        <div className="text-gray-900 font-medium">{round.location}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Phụ trách</div>
                        <div className="text-gray-900 font-medium">{round.owner}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Ghi chú</div>
                        <div className="text-gray-900 font-medium">{round.notes}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div 
                      className="text-sm font-medium text-gray-900 mb-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => toggleStats(round.id)}
                    >
                      <span>Thống kê ứng viên</span>
                      <span className={`text-gray-400 transition-transform ${expandedStats[round.id] ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                    {expandedStats[round.id] && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-xs text-blue-600 font-medium mb-1">Lượt quan tâm</div>
                          <div className="text-lg font-bold text-blue-700">125</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-xs text-green-600 font-medium mb-1">Đã ứng tuyển</div>
                          <div className="text-lg font-bold text-green-700">89</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">Tiến độ tuyển dụng</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${round.progress}%`}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{round.progress}%</div>
                  </div>

                  <div className="mt-4">
                    <button 
                      className={getButtonStyle(round.status)}
                      onClick={() => !isButtonDisabled(round.status) && handleViewCandidates(round)}
                      disabled={isButtonDisabled(round.status)}
                    >
                      {isButtonDisabled(round.status) ? 'Chưa thể xem danh sách' : 'Xem danh sách ứng viên'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignInfo