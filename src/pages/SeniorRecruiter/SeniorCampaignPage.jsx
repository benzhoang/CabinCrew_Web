import { useState, useEffect, useCallback } from "react";
import CampaignList from "../../components/SeniorRecruiterComponent/CampaignList";
import { getAirlinePartners } from "../../service/api";

const SeniorCampaignPage = () => {
  const [search, setSearch] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [airlinePartners, setAirlinePartners] = useState([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);

  // Fetch airline partners
  const fetchAirlinePartners = useCallback(async () => {
    setIsLoadingPartners(true);
    try {
      const res = await getAirlinePartners();
      if (res.success && Array.isArray(res.data)) {
        // Chỉ lấy partnerId và partnerName
        const partners = res.data
          .map((partner) => ({
            partnerId: partner?.partnerId ?? partner?.id ?? null,
            partnerName: partner?.partnerName || partner?.name || "",
          }))
          .filter((p) => p.partnerId && p.partnerName);
        setAirlinePartners(partners);
      } else {
        console.error("Failed to fetch airline partners:", res.error);
        setAirlinePartners([]);
      }
    } catch (err) {
      console.error("Error fetching airline partners:", err);
      setAirlinePartners([]);
    } finally {
      setIsLoadingPartners(false);
    }
  }, []);

  // Load airline partners on mount
  useEffect(() => {
    fetchAirlinePartners();
  }, [fetchAirlinePartners]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">
              Campaign Management
            </h2>
            <p className="text-slate-600">
              Manage recruitment campaigns and human resource plans
            </p>
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
              placeholder="Search by name, campaign type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Partner Filter */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Partner
            </label>
            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              disabled={isLoadingPartners}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Partners</option>
              {airlinePartners.map((partner) => (
                <option key={partner.partnerId} value={partner.partnerName}>
                  {partner.partnerName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Campaign List Component */}
      <CampaignList
        search={search}
        partnerFilter={partnerFilter}
        airlinePartners={airlinePartners}
      />
    </div>
  );
};

export default SeniorCampaignPage;
