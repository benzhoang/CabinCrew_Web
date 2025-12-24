import { useState } from "react";
import AccountTable from "../../components/AdminComponent/AccountTable";
import Pagination from "../../components/AdminComponent/Pagination";
import { FaSearch } from "react-icons/fa";

const CandidateListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);

  // Role ID for Candidate: 7
  const roleId = 7;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDataLoad = (pagination) => {
    if (pagination) {
      setTotalItems(pagination.totalRecords ?? 0);
      if (pagination.pageSize && pagination.pageSize !== pageSize) {
        setPageSize(pagination.pageSize);
      }
    }
  };

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full h-9 pl-3 pr-9 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <AccountTable
            searchTerm={searchTerm}
            roleId={roleId}
            roleName="Candidate"
            page={currentPage}
            pageSize={pageSize}
            onDataLoad={handleDataLoad}
          />

          <div className="pt-4">
            <Pagination
              totalItems={totalItems}
              itemsPerPage={pageSize || 1}
              currentPage={currentPage}
              maxPageNumbersToShow={5}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateListPage;
