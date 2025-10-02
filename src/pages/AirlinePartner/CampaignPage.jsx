
import { useState } from 'react'
import { FaPlus, FaSearch } from 'react-icons/fa'
import CampaignList from '../../components/AirlinePartnerComponent/CampaignList'
import { useNavigate } from 'react-router-dom'

const CampaignPage = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [department, setDepartment] = useState('all')
  const navigate = useNavigate();

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <button  onClick={() => navigate('/airline-partner/campaigns/create')} className="inline-flex items-center gap-2 bg-cyan-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors">
              <FaPlus />
              <span>Tạo chiến dịch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative col-span-1 md:col-span-1">
              <input
                type="text"
                placeholder="Tìm theo tên, vị trí, phòng ban..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-3 pr-9 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <select
              className="h-10 rounded-lg border border-gray-300 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="completed">Hoàn thành</option>
            </select>
            <select
              className="h-10 rounded-lg border border-gray-300 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="all">Tất cả phòng ban</option>
              <option value="Cabin Crew">Cabin Crew</option>
              <option value="Flight Operations">Flight Operations</option>
            </select>
          </div>

          <CampaignList search={search} status={status} department={department} />
        </div>
      </div>
    </div>
  )
}

export default CampaignPage