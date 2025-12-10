import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import CampaignList from "../../components/AdminComponent/CampaignList";

const CampaignListPage = () => {
  const [search, setSearch] = useState("");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end gap-3">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-3 pr-9 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <select
              value={campaignTypeFilter}
              onChange={(e) => setCampaignTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            >
              <option value="all">All campaign types</option>
              <option value="recruitment">Recruitment</option>
              <option value="promotion">Promotion</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            >
              <option value="all">All status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="ongoing">Ongoing</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          <CampaignList
            search={search}
            campaignTypeFilter={campaignTypeFilter}
            statusFilter={statusFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignListPage;
