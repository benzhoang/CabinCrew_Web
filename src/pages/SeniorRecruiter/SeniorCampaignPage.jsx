import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import CampaignList from "../../components/SeniorRecruiterComponent/CampaignList";

const SeniorCampaignPage = () => {
  const [searchParams] = useSearchParams();
  const campaignTypeFromUrl = searchParams.get("campaignType") || "all";
  
  const [search, setSearch] = useState("");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState(campaignTypeFromUrl);
  
  // Cập nhật campaignTypeFilter khi URL thay đổi
  useEffect(() => {
    if (campaignTypeFromUrl !== campaignTypeFilter) {
      setCampaignTypeFilter(campaignTypeFromUrl);
    }
  }, [campaignTypeFromUrl]);

  return (
    <div className="w-full h-full">
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, position, department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 pl-3 text-sm border border-gray-300 rounded-lg w-100 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
                <FaSearch className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2" />
              </div>
              <select
                value={campaignTypeFilter}
                onChange={(e) => setCampaignTypeFilter(e.target.value)}
                className="h-10 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              >
                <option value="all">All campaign types</option>
                <option value="recruitment">Recruitment</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>
          </div>

          <CampaignList
            search={search}
            campaignTypeFilter={campaignTypeFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default SeniorCampaignPage;
