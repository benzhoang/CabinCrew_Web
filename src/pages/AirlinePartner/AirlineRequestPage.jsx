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

      <RequestList
        search={search}
        setSearch={setSearch}
        campaignTypeFilter={campaignTypeFilter}
        setCampaignTypeFilter={setCampaignTypeFilter}
      />
    </div>
  );
};

export default AirlineRequestPage;
