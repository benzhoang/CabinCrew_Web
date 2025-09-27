import { useState } from 'react'
import AirlinePartnerTable from '../../components/AdminComponent/AirlinePartnerTable'
import Pagination from '../../components/AdminComponent/Pagination'
import { FaPlus, FaSearch } from 'react-icons/fa'

const AirlinePartnerListPage = () => {
  const [search, setSearch] = useState('')

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              className="inline-flex items-center gap-2 bg-cyan-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <FaPlus />
              <span>Create airline partner</span>
            </button>
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-3 pr-9 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <AirlinePartnerTable />

          <div className="pt-4">
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AirlinePartnerListPage