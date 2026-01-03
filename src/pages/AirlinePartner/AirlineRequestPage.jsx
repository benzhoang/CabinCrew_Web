import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import RequestList from "../../components/AirlinePartnerComponent/RequestList";
import { useNavigate } from "react-router-dom";

const AirlineRequestPage = () => {
  const [search, setSearch] = useState("");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("all");
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">
              Request Management
            </h2>
            <p className="text-slate-600">
              Manage and monitor requests across the system
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                navigate("/airline-partner/requests/recruitment/create")
              }
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FaPlus />
              <span>Create recruitment request</span>
            </button>
            <button
              onClick={() =>
                navigate("/airline-partner/requests/promotion/create")
              }
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FaPlus />
              <span>Create promotion request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-6 mb-6 bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Search Bar */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Request Type Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Request Type
            </label>
            <select
              value={campaignTypeFilter}
              onChange={(e) => setCampaignTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All request types</option>
              <option value="recruitment">Recruitment</option>
              <option value="promotion">Promotion</option>
            </select>
          </div>
        </div>
      </div>

      <RequestList search={search} campaignTypeFilter={campaignTypeFilter} />
    </div>
  );
};

export default AirlineRequestPage;
