import { useState } from "react";
import Pagination from "../../components/AdminComponent/Pagination";
import ModalForm from "../../components/AdminComponent/ModalForm";
import { FaPlus, FaSearch } from "react-icons/fa";
import AccountTable from "../../components/AdminComponent/AccountTable";

const RecruiterListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateUser = (userData) => {
    console.log('Creating new user:', userData);
    // Here you would typically make an API call to create the user
    // For now, we'll just log the data
  };

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-cyan-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <FaPlus />
              <span>Create new recruiter</span>
            </button>
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

      {/* Modal */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
};

export default RecruiterListPage