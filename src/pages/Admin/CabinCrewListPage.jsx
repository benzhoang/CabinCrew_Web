import { useState } from "react";
import Pagination from "../../components/AdminComponent/Pagination";
import { FaSearch } from "react-icons/fa";
import AccountTable from "../../components/AdminComponent/AccountTable";

const CabinCrewListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);

  // Role ID for Cabin Crew: 6
  const roleId = 6;

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="w-full h-full">
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-3 text-sm border border-gray-300 rounded-lg h-9 pr-9 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
              />
              <FaSearch className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2" />
            </div>
          </div>

          <AccountTable
            searchTerm={searchTerm}
            roleId={roleId}
            roleName="Cabin Crew"
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

export default CabinCrewListPage;
