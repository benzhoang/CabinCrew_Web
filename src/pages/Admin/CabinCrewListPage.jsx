import { useState } from "react";
import Pagination from "../../components/AdminComponent/Pagination";
import ModalForm from "../../components/AdminComponent/ModalForm";
import { FaPlus, FaSearch } from "react-icons/fa";
import AccountTable from "../../components/AdminComponent/AccountTable";

const CabinCrewListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Role ID for Cabin Crew: 6
  const roleId = 6;

  const handleCreateUser = (userData) => {
    console.log("Creating new user:", userData);
    // Trigger refresh by incrementing refreshKey
    setRefreshKey((prev) => prev + 1);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="w-full h-full">
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FaPlus />
              <span>Create new cabin crew</span>
            </button>
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-3 text-sm border border-gray-300 rounded-lg h-9 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
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
            refreshKey={refreshKey}
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

      {/* Modal */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUser}
        roleName="Cabin Crew"
      />
    </div>
  );
};

export default CabinCrewListPage;
