import { useState, useEffect, useCallback } from "react";
import RequestList from "../../components/SeniorRecruiterComponent/RequestList";
import { getAirlinePartners } from "../../service/api";

const SeniorRequestPage = () => {
  const [search, setSearch] = useState("");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("all");
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
              Request Management
            </h2>
            <p className="text-slate-600">
              Manage and monitor requests across the system
            </p>
          </div>
        </div>
      </div>

      <RequestList
        search={search}
        setSearch={setSearch}
        campaignTypeFilter={campaignTypeFilter}
        setCampaignTypeFilter={setCampaignTypeFilter}
        partnerFilter={partnerFilter}
        setPartnerFilter={setPartnerFilter}
        airlinePartners={airlinePartners}
        isLoadingPartners={isLoadingPartners}
      />
    </div>
  );
};

export default SeniorRequestPage;
