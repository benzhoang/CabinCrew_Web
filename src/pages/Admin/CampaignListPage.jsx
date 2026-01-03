import { useState, useEffect, useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import { getAllAirlinePartners } from "../../service/api2";
import CampaignList from "../../components/AdminComponent/CampaignList";

const CampaignListPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [airlinePartners, setAirlinePartners] = useState([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);

  // Fetch airline partners
  const fetchAirlinePartners = useCallback(async () => {
    setIsLoadingPartners(true);
    try {
      const result = await getAllAirlinePartners();
      if (result.success) {
        // Handle different response formats
        const partners = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.items)
          ? result.data.items
          : [];
        // Chỉ lấy partnerId và partnerName
        const formattedPartners = partners
          .map((partner) => ({
            partnerId: partner?.partnerId ?? partner?.id ?? null,
            partnerName: partner?.partnerName || partner?.name || "",
          }))
          .filter((p) => p.partnerId && p.partnerName);
        setAirlinePartners(formattedPartners);
      } else {
        console.error("Failed to fetch airline partners:", result.error);
        setAirlinePartners([]);
      }
    } catch (error) {
      console.error("Error fetching airline partners:", error);
      setAirlinePartners([]);
    } finally {
      setIsLoadingPartners(false);
    }
  }, []);

  // Load airline partners on mount
  useEffect(() => {
    fetchAirlinePartners();
  }, [fetchAirlinePartners]);

  // Tìm partnerId từ partner name được chọn
  const getPartnerIdFromName = useCallback(
    (partnerName) => {
      if (partnerName === "all" || !partnerName) return null;
      const partner = airlinePartners.find(
        (p) => p.partnerName === partnerName
      );
      return partner?.partnerId || null;
    },
    [airlinePartners]
  );

  const handlePartnerFilterChange = (e) => {
    setPartnerFilter(e.target.value);
  };

  return (
    <div className="w-full h-full">
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end gap-3">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search by name, campaign type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-3 text-sm border border-gray-300 rounded-lg h-9 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
              <FaSearch className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2" />
            </div>
            <select
              value={partnerFilter}
              onChange={handlePartnerFilterChange}
              disabled={isLoadingPartners}
              className="px-3 text-sm border border-gray-300 rounded-lg h-9 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">All partners</option>
              {airlinePartners.map((partner) => (
                <option key={partner.partnerId} value={partner.partnerName}>
                  {partner.partnerName}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 text-sm border border-gray-300 rounded-lg h-9 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            >
              <option value="all">All status</option>
              <option value="draft">Planning</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <CampaignList
            search={search}
            statusFilter={statusFilter}
            partnerId={getPartnerIdFromName(partnerFilter)}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignListPage;
