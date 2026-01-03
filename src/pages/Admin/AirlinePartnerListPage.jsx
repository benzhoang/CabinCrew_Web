import { useState, useEffect } from "react";
import AccountTable from "../../components/AdminComponent/AccountTable";
import Pagination from "../../components/AdminComponent/Pagination";
import ModalForm from "../../components/AdminComponent/ModalForm";
import { FaPlus, FaSearch } from "react-icons/fa";
import { getAllAirlinePartners } from "../../service/api2";

const AirlinePartnerListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAirlinePartners, setTotalAirlinePartners] = useState(0);
  const [totalPartnersFromAPI, setTotalPartnersFromAPI] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Role ID for Airline Partner: 8
  const roleId = 8;

  // Fetch total partners from API
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const result = await getAllAirlinePartners();
        if (result.success) {
          // Handle different response formats
          const partners = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.data?.items)
            ? result.data.items
            : [];
          setTotalPartnersFromAPI(partners.length);
        } else {
          console.error("Failed to load airline partners:", result.error);
        }
      } catch (error) {
        console.error("Error loading airline partners:", error);
      }
    };

    fetchPartners();
  }, [refreshKey]); // Re-fetch when refreshKey changes

  const handleCreateUser = (userData) => {
    console.log("Creating new user:", userData);
    // Trigger refresh by incrementing refreshKey
    setRefreshKey((prev) => prev + 1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDataLoad = (pagination) => {
    if (!pagination) return;

    const totalRecords = pagination.totalRecords ?? 0;
    setTotalItems(totalRecords);

    if (!searchTerm?.trim()) {
      setTotalAirlinePartners(totalRecords);
    }

    if (pagination.pageSize && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  // Disable create button if number of Airline Partner accounts equals number of partners from API
  const isCreateDisabled =
    totalAirlinePartners >= totalPartnersFromAPI && totalPartnersFromAPI > 0;

  return (
    <div className="w-full h-full">
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (!isCreateDisabled) {
                  setIsModalOpen(true);
                }
              }}
              disabled={isCreateDisabled}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCreateDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "text-white bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaPlus />
              <span>Create new airline partner</span>
            </button>
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search by name..."
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
            roleName="Airline Partner"
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
        roleName="Airline Partner"
      />
    </div>
  );
};

export default AirlinePartnerListPage;
