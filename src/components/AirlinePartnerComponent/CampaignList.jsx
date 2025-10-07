import { useMemo } from 'react'
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

const demoCampaigns = [
  {
    id: 1,
    title: 'Tuyển dụng Tiếp viên hàng không 2024',
    department: 'Cabin Crew',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    progress: { current: 8, total: 20 },
    description: 'Tuyển dụng tiếp viên hàng không cho các chuyến bay nội địa và quốc tế.'
  },
  {
    id: 2,
    title: 'Chiến dịch Pilot Training',
    department: 'Flight Operations',
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-02-28',
    progress: { current: 5, total: 5 },
    description: 'Tuyển dụng và đào tạo phi công cho mùa bay mới.'
  }
]

const StatusBadge = ({ status }) => (
  <span
    className={
      (status === 'active'
        ? 'bg-green-100 text-green-700 border-green-200'
        : 'bg-red-100 text-red-600 border-red-200') +
      ' inline-block rounded-full border px-2 py-0.5 text-xs font-medium'
    }
  >
    {status === 'active' ? 'Đang hoạt động' : 'Hoàn thành'}
  </span>
)

const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate()
  const percent = useMemo(() => {
    const { current = 0, total = 0 } = campaign.progress || {}
    if (!total) return 0
    return Math.min(100, Math.round((current / total) * 100))
  }, [campaign])

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 truncate">{campaign.title}</h3>
            <StatusBadge status={campaign.status} />
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-sm text-gray-700">
            <div>
              <span className="text-gray-500">Phòng ban:</span> {campaign.department}
            </div>
            <div>
              <span className="text-gray-500">Thời gian bắt đầu:</span> {formatDate(campaign.startDate)}
            </div>
            <div>
              <span className="text-gray-500">Thời gian kết thúc:</span> {formatDate(campaign.endDate)}
            </div>
            <div>
              <span className="text-gray-500">Tiến độ:</span> {campaign.progress?.current ?? 0}/{campaign.progress?.total ?? 0} ({percent}%)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => navigate(`/airline-partner/campaigns/${campaign.id}`)}>Xem chi tiết</button>
          <button className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">Xóa</button>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full bg-blue-600" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600">{campaign.description}</p>
    </div>
  )
}

const CampaignList = ({ search = '', campaigns = demoCampaigns }) => {
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return campaigns.filter((c) => {
      const matchSearch = !s || [c.title, c.role, c.department].some((v) => String(v).toLowerCase().includes(s))
      return matchSearch 
    })
  }, [campaigns, search])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-stretch gap-3">
          <button type="button" className="px-4 py-1.5 text-sm font-medium border-2  rounded-md bg-white text-slate-700 border-slate-300 hover:bg-slate-5">Đang diễn ra</button>
          <button type="button" className="px-4 py-1.5 text-sm font-medium border-2  rounded-md bg-white text-slate-700 border-slate-300 hover:bg-slate-5">Đang chờ duyệt</button>
          <button type="button" className="px-4 py-1.5 text-sm font-medium border-2  rounded-md bg-white text-slate-700 border-slate-300 hover:bg-slate-5">Đã hoàn thành</button>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">
            Danh sách chiến dịch ({campaigns.length})
          </h2>
      {filtered.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  )
}

export default CampaignList