import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onLangChange } from "../../i18n";
import { getCampaignList } from "../../service/api2";
import { formatDate, formatDate2 } from "../../config/formatDate";

const formatDateDisplay = (value) => {
  if (!value) return "—";

  // Nếu đã là format DD/MM/YYYY hoặc DD/MM/YYYY HH:mm, chỉ lấy phần date
  if (typeof value === "string" && value.includes("/")) {
    return formatDate2(value);
  }

  // Nếu là ISO string hoặc date object, format sang DD/MM/YYYY
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return formatDate(value);
  }

  return value;
};

const normalizeRequirements = (requirements) => {
  if (!requirements) return [];
  if (Array.isArray(requirements)) {
    return requirements.filter(Boolean);
  }
  if (typeof requirements === "string") {
    return requirements
      .split(/[\n,;•]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const mapStatusForCandidate = (status) => {
  const normalized = (status || "").toString().trim().toLowerCase();
  if (
    [
      "ongoing",
      "active",
      "approved",
      "upcoming",
      "inprogress",
      "in_progress",
      "scheduled",
    ].includes(normalized)
  ) {
    return "active";
  }
  return "inactive";
};

const transformCampaign = (campaign) => {
  if (!campaign) return null;
  const id =
    campaign.id ?? campaign.campaignId ?? campaign.campaignID ?? campaign.Id;
  if (!id) return null;

  return {
    id,
    name: campaign.name ?? campaign.campaignName ?? "Promotion Campaign",
    airline:
      campaign.partnerName ??
      campaign.airline ??
      campaign.airlineName ??
      "Partner not updated",
    position:
      campaign.position ??
      campaign.role ??
      campaign.campaignType ??
      "Type not updated",
    location:
      campaign.location ??
      campaign.city ??
      campaign.address ??
      campaign.locationName ??
      "Location not updated",
    status: mapStatusForCandidate(campaign.status),
    rawStatus: campaign.status ?? "",
    campaignType: campaign.campaignType ?? "",
    startDate: formatDateDisplay(campaign.startDate),
    endDate: formatDateDisplay(campaign.endDate),
    description: campaign.description ?? "",
    requirements: normalizeRequirements(
      campaign.requirements ?? campaign.requirement
    ),
    targetHires:
      campaign.targetQuantity ??
      campaign.targetHires ??
      campaign.targetParticipants ??
      campaign.targetNumber ??
      0,
    batches: campaign.batches ?? [],
  };
};

const PromotionPage = () => {
  const [search, setSearch] = useState("");
  const [airline, setAirline] = useState("all");
  const statusFilter = "all";
  const [, setLangVersion] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 1000, // Tăng pageSize để fetch tất cả campaigns ngay từ đầu
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [displayPage, setDisplayPage] = useState(1); // Trang hiển thị hiện tại
  const displayPageSize = 4; // Số campaigns hiển thị mỗi trang
  const navigate = useNavigate();

  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  const fetchCampaigns = useCallback(
    async (page = 1, searchTerm = "") => {
      setIsLoading(true);
      setError(null);
      try {
        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view the list of promotion campaigns");
          setCampaigns([]);
          setIsLoading(false);
          return;
        }

        // campaignType: 2 = Promotion
        // campaignStatus: 5 = Ongoing
        const params = {
          page: page,
          pageSize: pagination.pageSize,
          campaignType: 2,
          campaignStatus: 5,
        };

        if (searchTerm && searchTerm.trim()) {
          params.searchTerm = searchTerm.trim();
        }

        // Gọi API mới từ api2.js
        const response = await getCampaignList(params);

        if (response.success && response.data && Array.isArray(response.data)) {
          const normalized = response.data
            .map(transformCampaign)
            .filter(Boolean);
          setCampaigns(normalized);

          // Lấy thông tin phân trang từ response.pagination
          if (response.pagination) {
            setPagination((prev) => ({
              ...prev,
              currentPage: response.pagination.currentPage || page,
              pageSize: response.pagination.pageSize || prev.pageSize,
              totalRecords: response.pagination.totalRecords || 0,
              totalPages: response.pagination.totalPages || 0,
              hasNextPage: response.pagination.hasNextPage || false,
              hasPreviousPage: response.pagination.hasPreviousPage || false,
            }));
          }
        } else {
          setCampaigns([]);
          setError(
            response.error ||
              response.message ||
              "Cannot get the list of promotion campaigns"
          );
        }
      } catch (err) {
        setCampaigns([]);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.errorMessage ||
          err.message ||
          "Cannot get the list of promotion campaigns";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.pageSize]
  );

  useEffect(() => {
    fetchCampaigns(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCampaigns(1, search);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const baseCampaigns = useMemo(
    () =>
      statusFilter === "active"
        ? campaigns.filter((c) => c.status === "active")
        : campaigns,
    [statusFilter, campaigns]
  );

  // Lấy danh sách hãng hàng không duy nhất từ campaigns
  const airlineOptions = useMemo(() => {
    const airlines = new Set();
    campaigns.forEach((c) => {
      if (
        c.airline &&
        c.airline.trim() &&
        c.airline !== "Partner not updated"
      ) {
        airlines.add(c.airline.trim());
      }
    });
    return ["all", ...Array.from(airlines).sort()];
  }, [campaigns]);

  const filtered = useMemo(() => {
    let data = baseCampaigns;
    if (airline !== "all") {
      const normalized = airline.toLowerCase();
      data = data.filter((c) =>
        (c.airline || "").toLowerCase().includes(normalized)
      );
    }
    return data;
  }, [baseCampaigns, airline]);

  // Phân trang cho phần hiển thị
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (displayPage - 1) * displayPageSize;
    const endIndex = startIndex + displayPageSize;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, displayPage, displayPageSize]);

  const totalDisplayPages = Math.ceil(filtered.length / displayPageSize);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setDisplayPage(1);
  }, [airline, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl px-4 py-8 mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Promotion Campaigns
          </h1>
          <p className="mt-1 text-slate-600">
            Discover the opportunities for career advancement
          </p>
        </div>

        <div className="p-4 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by campaign name, current position, target position, airline"
                className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Airline
              </label>
              <select
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {airlineOptions.map((a) => (
                  <option key={a} value={a}>
                    {a === "all" ? "All" : a}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {isLoading && (
            <div className="p-12 text-center bg-white border border-gray-200 md:col-span-2 rounded-xl text-slate-500">
              Loading promotion campaigns...
            </div>
          )}
          {!isLoading &&
            paginatedCampaigns.map((c) => (
              <div
                key={c.id}
                className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">
                        {c.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {c.airline}
                        {c.location &&
                          c.location !== "Location not updated" &&
                          ` • ${c.location}`}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center flex-shrink-0 whitespace-nowrap rounded-full text-xs font-medium px-2.5 py-1 ${
                        c.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {c.status === "active" ? "Ongoing" : "Ended"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mt-4 text-sm sm:grid-cols-3">
                    <div>
                      <span className="text-slate-500">Position</span>
                      <p className="font-medium text-slate-800">Purser</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Start Date</span>
                      <p className="font-medium text-slate-800">
                        {c.startDate}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">End Date</span>
                      <p className="font-medium text-slate-800">{c.endDate}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-700">{c.description}</p>
                  {c.requirements?.length > 0 && (
                    <ul className="flex flex-wrap gap-2 mt-3">
                      {c.requirements.map((r, idx) => (
                        <li
                          key={idx}
                          className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full"
                        >
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center gap-3 mt-5">
                    <button
                      onClick={() =>
                        navigate(`/cabin-crew/promotion/apply/${c.id}`)
                      }
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {!isLoading && filtered.length === 0 && !error && (
          <div className="p-12 text-center bg-white border border-gray-200 rounded-xl text-slate-500">
            No promotion campaigns found.
          </div>
        )}

        {!isLoading && filtered.length > 0 && totalDisplayPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setDisplayPage((prev) => Math.max(1, prev - 1))}
              disabled={displayPage === 1}
              className="px-4 py-2 border rounded-md border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-700">
              Page {displayPage} / {totalDisplayPages}
            </span>
            <button
              onClick={() =>
                setDisplayPage((prev) => Math.min(totalDisplayPages, prev + 1))
              }
              disabled={displayPage === totalDisplayPages}
              className="px-4 py-2 border rounded-md border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionPage;
