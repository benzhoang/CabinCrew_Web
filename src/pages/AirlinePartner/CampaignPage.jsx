
import { useState } from 'react'
import { FaPlus, FaSearch } from 'react-icons/fa'
import CampaignList from '../../components/AirlinePartnerComponent/CampaignList'
import { useNavigate } from 'react-router-dom'

const CampaignPage = () => {
  const [search, setSearch] = useState('')
  const navigate = useNavigate();

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button  onClick={() => navigate('/airline-partner/campaigns/create')} className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <FaPlus />
                <span>Tạo yêu cầu chiến dịch</span>
              </button>
              <button className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <FaPlus />
                <span>Tạo yêu cầu nâng bậc</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo tên, vị trí, phòng ban..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-100 h-10 pl-3 pr-9 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <CampaignList search={search} />
        </div>
      </div>
    </div>
  )
}

export default CampaignPage