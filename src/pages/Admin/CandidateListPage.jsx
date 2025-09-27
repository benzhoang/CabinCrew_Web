import AccountTable from "../../components/AdminComponent/AccountTable";
import Pagination from "../../components/AdminComponent/Pagination";
import { FaSearch } from "react-icons/fa";

const CandidateListPage = () => {
  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search"
                className="w-full h-9 pl-3 pr-9 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <AccountTable />

          <div className="pt-4">
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateListPage