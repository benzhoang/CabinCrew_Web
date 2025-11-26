import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onLangChange } from "../../i18n";
import { getCampaignList } from "../../service/api2";
import { convertDateFormat } from "../../config/formatDate";

const formatDateDisplay = (value) => {
  if (!value) return "—";

  const tryParse = (dateString) => {
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const directDate = tryParse(value);
  if (directDate) {
    return directDate.toLocaleDateString("vi-VN");
  }

  const converted = convertDateFormat(value);
  if (converted) {
    const convertedDate = tryParse(converted);
    if (convertedDate) {
      return convertedDate.toLocaleDateString("vi-VN");
    }
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
    name: campaign.name ?? campaign.campaignName ?? "Chiến dịch nâng bậc",
    airline:
      campaign.partnerName ??
      campaign.airline ??
      campaign.airlineName ??
      "Đối tác chưa cập nhật",
    position:
      campaign.position ??
      campaign.role ??
      campaign.campaignType ??
      "Loại chưa cập nhật",
    location:
      campaign.location ??
      campaign.city ??
      campaign.address ??
      campaign.locationName ??
      "Chưa cập nhật",
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
  const [statusFilter, setStatusFilter] = useState("all"); // all | active
  const [, setLangVersion] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
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
          setError("Vui lòng đăng nhập để xem danh sách chiến dịch nâng bậc");
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

        if (
          response.success &&
          response.data &&
          Array.isArray(response.data.items)
        ) {
          const normalized = response.data.items
            .map(transformCampaign)
            .filter(Boolean);
          setCampaigns(normalized);

          const pageInfo = response.data.pagination;
          if (pageInfo) {
            setPagination((prev) => ({
              ...prev,
              currentPage: pageInfo.currentPage || page,
              totalRecords: pageInfo.totalRecords || 0,
              totalPages: pageInfo.totalPages || 0,
              hasNextPage: pageInfo.hasNextPage || false,
              hasPreviousPage: pageInfo.hasPreviousPage || false,
            }));
          }
        } else {
          setCampaigns([]);
          setError(
            response.error ||
              response.message ||
              "Không thể lấy danh sách chiến dịch nâng bậc"
          );
        }
      } catch (err) {
        setCampaigns([]);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.errorMessage ||
          err.message ||
          "Không thể lấy danh sách chiến dịch nâng bậc";
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

  const filtered = useMemo(() => {
    let data = baseCampaigns;
    if (airline !== "all") {
      data = data.filter((c) => c.airline === airline);
    }
    return data;
  }, [baseCampaigns, airline]);

  const airlines = useMemo(() => {
    const set = new Set(baseCampaigns.map((c) => c.airline));
    return ["all", ...Array.from(set)];
  }, [baseCampaigns]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl px-4 py-8 mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Chiến dịch nâng bậc
          </h1>
          <p className="mt-1 text-slate-600">
            Khám phá các cơ hội thăng tiến nghề nghiệp
          </p>
        </div>

        <div className="p-4 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên chiến dịch, vị trí hiện tại, vị trí mục tiêu, hãng bay"
                className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Hãng hàng không
              </label>
              <select
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {airlines.map((a) => (
                  <option key={a} value={a}>
                    {a === "all" ? "Tất cả" : a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang diễn ra</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {isLoading && (
            <div className="p-12 text-center bg-white border border-gray-200 md:col-span-2 rounded-xl text-slate-500">
              Đang tải danh sách chiến dịch nâng bậc...
            </div>
          )}
          {!isLoading &&
            filtered.map((c) => (
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
                          c.location !== "Chưa cập nhật" &&
                          ` • ${c.location}`}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-1 ${
                        c.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {c.status === "active" ? "Đang diễn ra" : "Đã kết thúc"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mt-4 text-sm sm:grid-cols-3">
                    <div>
                      <span className="text-slate-500">Loại</span>
                      <p className="font-medium text-slate-800">{c.position}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Ngày bắt đầu</span>
                      <p className="font-medium text-slate-800">
                        {c.startDate}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Ngày kết thúc</span>
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
                        navigate("/cabin-crew/promotion/apply", {
                          state: { campaign: c },
                        })
                      }
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {!isLoading && filtered.length === 0 && !error && (
          <div className="p-12 text-center bg-white border border-gray-200 rounded-xl text-slate-500">
            Không có chiến dịch nâng bậc phù hợp.
          </div>
        )}

        {!isLoading && filtered.length > 0 && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => fetchCampaigns(pagination.currentPage - 1, search)}
              disabled={!pagination.hasPreviousPage}
              className="px-4 py-2 border rounded-md border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-slate-700">
              Trang {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchCampaigns(pagination.currentPage + 1, search)}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 border rounded-md border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionPage;
