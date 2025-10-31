import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import RequestList from "../../components/SeniorRecruiterComponent/RequestList";

const SeniorRequestPage = () => {
  const [search, setSearch] = useState('')

  return (

    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-end mb-5">

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

          <RequestList search={search} />
        </div>
      </div>
    </div>
  );
};

export default SeniorRequestPage;