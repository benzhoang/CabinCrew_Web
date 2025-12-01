import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCampaignList } from "../../service/api2";
import Loading from "../Loading.jsx";
import { formatDate, convertDateFormat } from "../../config/formatDate.js";

// Helper function to map API status to component status
const mapStatus = (status) => {
  const statusMap = {
    Draft: "draft",
    Pending: "pending",
    Approved: "approved",
    Rejected: "rejected",
    Ongoing: "ongoing",
    Ended: "ended",
  };
  return statusMap[status] || status.toLowerCase();
};

// Helper function to map API campaignType to component campaignType
const mapCampaignType = (campaignType) => {
  const typeMap = {
    Recruitment: "recruitment",
    Promotion: "promotion",
  };
  return typeMap[campaignType] || campaignType.toLowerCase();
};

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "ongoing":
        return {
          className: "bg-cyan-100 text-cyan-700 border-cyan-200",
          text: "Đang diễn ra",
        };
      case "pending":
        return {
          className: "bg-yellow-100 text-yellow-700 border-yellow-200",
          text: "Đang chờ duyệt",
        };
      case "ended":
        return {
          className: "bg-green-100 text-green-700 border-green-200",
          text: "Đã hoàn thành",
        };
      case "draft":
        return {
          className: "bg-gray-100 text-gray-600 border-gray-200",
          text: "Bản nháp",
        };
      case "rejected":
        return {
          className: "bg-red-100 text-red-600 border-red-200",
          text: "Bị từ chối",
        };
      case "approved":
        return {
          className: "bg-emerald-100 text-emerald-700 border-emerald-200",
          text: "Đã được duyệt",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-600 border-gray-200",
          text: "Không xác định",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`${config.className} inline-block rounded-full border px-2 py-0.5 text-xs font-medium`}
    >
      {config.text}
    </span>
  );
};

const getCampaignTypeLabel = (campaignType) => {
  switch (campaignType) {
    case "recruitment":
      return "Tuyển dụng";
    case "promotion":
      return "Thăng bậc";
    default:
      return "Không xác định";
  }
};

const CampaignTypeBadge = ({ type }) => {
  const label = getCampaignTypeLabel(type);
  const className =
    type === "promotion"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : type === "recruitment"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <span
      className={`${className} inline-block rounded-full border px-2 py-0.5 text-xs font-medium`}
    >
      {label}
    </span>
  );
};

const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate();
  const percent = useMemo(() => {
    const { current = 0, total = 0 } = campaign.progress || {};
    if (!total) return 0;
    return Math.min(100, Math.round((current / total) * 100));
  }, [campaign]);

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {campaign.title}
          </h3>

          <div className="grid grid-cols-1 mt-2 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
            <div>
              <span className="text-gray-500">Ngày bắt đầu:</span>{" "}
              {formatDate(campaign.startDate) || "-"}
            </div>
            <div>
              <span className="text-gray-500">Ngày kết thúc:</span>{" "}
              {formatDate(campaign.endDate) || "-"}
            </div>
            <div>
              <span className="text-gray-500">Loại chiến dịch:</span>{" "}
              <CampaignTypeBadge type={campaign.campaignType} />
            </div>
            <div>
              <span className="text-gray-500">Trạng thái:</span>{" "}
              <StatusBadge status={campaign.status} />
            </div>
            {campaign.campaignType === "promotion" && (
              <div className="mt-2">
                <span className="text-gray-500">Vị trí:</span>{" "}
                <span>Chief Flight Attendant</span>
              </div>
            )}
            {campaign.campaignType === "recruitment" && (
              <div className="mt-2">
                <span className="text-gray-500">Vị trí:</span>{" "}
                <span>Flight Attendant</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {campaign.status === "draft" ? (
            <button
              onClick={() =>
                navigate(`/senior-recruiter/campaigns/${campaign.id}/create`)
              }
              className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Tạo kế hoạch
            </button>
          ) : campaign.status === "rejected" ? (
            <button className="px-3 py-1.5 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700">
              Gửi lại
            </button>
          ) : (
            <button
              className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              onClick={() =>
                navigate(`/senior-recruiter/campaigns/${campaign.id}`)
              }
            >
              Xem chi tiết
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between mb-1 text-sm text-slate-600">
          <span className="text-gray-500">Tiến độ tuyển dụng</span>{" "}
          {campaign.progress?.current ?? 0}/{campaign.progress?.total ?? 0} (
          {percent}%)
        </div>
        <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-600"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600">{campaign.description}</p>
    </div>
  );
};

const CampaignList = ({ search = "", campaignTypeFilter = "all" }) => {
  const [selectedStatus, setSelectedStatus] = useState("draft");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);

        // Không gửi status filter lên API, sẽ filter ở client-side
        // Có thể API không hỗ trợ status filter hoặc format không đúng
        const params = {
          searchTerm: search || undefined,
          fetchAll: true,
        };

        const result = await getCampaignList(params);

        if (result.success && result.data) {
          // Map API data to component structure
          const items = result.data.items || [];
          const mappedCampaigns = items.map((item) => ({
            id: item.campaignId, // Used for key and navigation, not displayed
            title: item.campaignName,
            description: item.description || "",
            startDate: convertDateFormat(item.startDate),
            endDate: convertDateFormat(item.endDate),
            status: mapStatus(item.status),
            campaignType: mapCampaignType(item.campaignType),
            progress: { current: 0, total: item.targetQuantity || 0 },
          }));
          setCampaigns(mappedCampaigns);
          setError(null);
        } else {
          console.error("Error fetching campaigns:", result.error);
          console.error("Result:", result);
          setCampaigns([]);
          setError(result.error || "Không thể tải danh sách chiến dịch");
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setCampaigns([]);
        setError(error.message || "Đã xảy ra lỗi khi tải danh sách chiến dịch");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [campaignTypeFilter, search]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchSearch =
        !s ||
        [c.title, c.description].some((v) =>
          String(v).toLowerCase().includes(s)
        );
      const matchStatus =
        selectedStatus === "all" || c.status === selectedStatus;
      const matchCampaignType =
        campaignTypeFilter === "all" || c.campaignType === campaignTypeFilter;
      return matchSearch && matchStatus && matchCampaignType;
    });
  }, [campaigns, search, selectedStatus, campaignTypeFilter]);

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Danh sách chiến dịch
        </h2>
        <div className="py-8 text-center">
          <div className="mb-2 text-red-600">{error}</div>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              const fetchCampaigns = async () => {
                try {
                  const params = {
                    searchTerm: search || undefined,
                    fetchAll: true,
                  };
                  const result = await getCampaignList(params);
                  if (result.success && result.data) {
                    const items = result.data.items || [];
                    const mappedCampaigns = items.map((item) => ({
                      id: item.campaignId,
                      title: item.campaignName,
                      description: item.description || "",
                      startDate: convertDateFormat(item.startDate),
                      endDate: convertDateFormat(item.endDate),
                      status: mapStatus(item.status),
                      campaignType: mapCampaignType(item.campaignType),
                      progress: { current: 0, total: item.targetQuantity || 0 },
                    }));
                    setCampaigns(mappedCampaigns);
                    setError(null);
                  } else {
                    setError(
                      result.error || "Không thể tải danh sách chiến dịch"
                    );
                  }
                } catch (err) {
                  setError(
                    err.message || "Đã xảy ra lỗi khi tải danh sách chiến dịch"
                  );
                } finally {
                  setLoading(false);
                }
              };
              fetchCampaigns();
            }}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="mb-6 text-xl font-bold text-gray-800">
        Danh sách chiến dịch ({filtered.length})
      </h2>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => setSelectedStatus("draft")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "draft"
                ? "bg-gray-200 text-gray-700 border-gray-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Bản nháp
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("pending")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "pending"
                ? "bg-yellow-600 text-white border-yellow-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Đang chờ duyệt
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("approved")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "approved"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Đã được duyệt
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("rejected")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "rejected"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Bị từ chối
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("ongoing")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "ongoing"
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Đang diễn ra
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("ended")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "ended"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Đã hoàn thành
          </button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Không có dữ liệu</div>
      ) : (
        filtered.map((c) => <CampaignCard key={c.id} campaign={c} />)
      )}
    </div>
  );
};

export default CampaignList;
