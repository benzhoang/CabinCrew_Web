import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCampaignList } from "../../service/api2";
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

// Helper function to map status to campaignStatus number for API
// campaignStatus: integer (0: Draft, 1: Pending, 2: Approved, 3: Rejected, 4: Cancelled, 5: Ongoing, 6: Upcoming, 7: Ended)
const mapStatusToCampaignStatus = (status) => {
  const statusMap = {
    draft: 0,
    pending: 1,
    approved: 2,
    rejected: 3,
    cancelled: 4,
    ongoing: 5,
    upcoming: 6,
    ended: 7,
  };
  return statusMap[status?.toLowerCase()] ?? undefined;
};

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "ongoing":
        return {
          className: "bg-cyan-100 text-cyan-700 border-cyan-200",
          text: "Ongoing",
        };
      case "pending":
        return {
          className: "bg-yellow-100 text-yellow-700 border-yellow-200",
          text: "Pending",
        };
      case "ended":
        return {
          className: "bg-green-100 text-green-700 border-green-200",
          text: "Ended",
        };
      case "draft":
        return {
          className: "bg-gray-100 text-gray-600 border-gray-200",
          text: "Draft",
        };
      case "rejected":
        return {
          className: "bg-red-100 text-red-600 border-red-200",
          text: "Rejected",
        };
      case "approved":
        return {
          className: "bg-emerald-100 text-emerald-700 border-emerald-200",
          text: "Approved",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-600 border-gray-200",
          text: "Unknown",
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
      return "Recruitment";
    case "promotion":
      return "Promotion";
    default:
      return "Unknown";
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

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {campaign.title}
          </h3>

          <div className="grid grid-cols-1 mt-2 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
            <div>
              <span className="text-gray-500">Start date:</span>{" "}
              {formatDate(campaign.startDate) || "-"}
            </div>
            <div>
              <span className="text-gray-500">End date:</span>{" "}
              {formatDate(campaign.endDate) || "-"}
            </div>
            <div>
              <span className="text-gray-500">Campaign type:</span>{" "}
              <CampaignTypeBadge type={campaign.campaignType} />
            </div>
            <div>
              <span className="text-gray-500">Status:</span>{" "}
              <StatusBadge status={campaign.status} />
            </div>
            {campaign.campaignType === "promotion" && (
              <div className="mt-2">
                <span className="text-gray-500">Position:</span>{" "}
                <span>Chief Flight Attendant</span>
              </div>
            )}
            {campaign.campaignType === "recruitment" && (
              <div className="mt-2">
                <span className="text-gray-500">Position:</span>{" "}
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
              Create plan
            </button>
          ) : campaign.status === "rejected" ? (
            <button className="px-3 py-1.5 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700">
              Resend
            </button>
          ) : (
            <button
              className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              onClick={() =>
                navigate(`/senior-recruiter/campaigns/${campaign.id}`)
              }
            >
              View details
            </button>
          )}
        </div>
      </div>

      <p className="mt-5 text-sm text-gray-600">{campaign.description}</p>
    </div>
  );
};

const CampaignList = ({ search = "", campaignTypeFilter = "all" }) => {
  const [selectedStatus, setSelectedStatus] = useState("draft");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5, // Mỗi trang 5 campaign
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchCampaigns = async (page = 1, showLoading = false) => {
    try {
      // Chỉ hiển thị loading nếu là lần đầu hoặc được yêu cầu
      if (showLoading || isInitialLoad) {
        setLoading(true);
      }
      setError(null);

      const params = {
        page: page,
        pageSize: 5,
        searchTerm: search || undefined,
      };

      // Gửi status filter lên server nếu không phải "all"
      if (selectedStatus !== "all") {
        const campaignStatus = mapStatusToCampaignStatus(selectedStatus);
        if (campaignStatus !== undefined) {
          params.campaignStatus = campaignStatus;
        }
      }

      const result = await getCampaignList(params);

      if (result.success && result.data && Array.isArray(result.data)) {
        // Map API data to component structure
        const mappedCampaigns = result.data.map((item) => ({
          id: item.campaignId || item.id || item.campaignID || item.Id,
          title: item.campaignName || item.name || "Chiến dịch chưa có tên",
          description: item.description || "",
          startDate: convertDateFormat(item.startDate),
          endDate: convertDateFormat(item.endDate),
          status: mapStatus(item.status),
          campaignType: mapCampaignType(item.campaignType),
          progress: { current: 0, total: item.targetQuantity || 0 },
        }));
        setCampaigns(mappedCampaigns);

        // Lưu thông tin phân trang từ API
        if (result.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...result.pagination,
            pageSize: 5,
          }));
        } else {
          // Fallback nếu API chưa trả pagination
          setPagination((prev) => ({
            ...prev,
            currentPage: page,
            pageSize: 5,
            totalRecords: mappedCampaigns.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }));
        }
        setError(null);
      } else {
        console.error("Error fetching campaigns:", result.error);
        console.error("Result:", result);
        setCampaigns([]);
        setError(result.error || "Error when fetching campaign list");
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
      setError(error.message || "Error when fetching campaign list");
    } finally {
      if (showLoading || isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  };

  // Initial load - chỉ chạy một lần khi component mount
  useEffect(() => {
    fetchCampaigns(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch lại khi filter thay đổi (không hiển thị loading)
  useEffect(() => {
    if (!isInitialLoad) {
      fetchCampaigns(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignTypeFilter, search, selectedStatus]);

  const handlePageChange = (page) => {
    if (page === pagination.currentPage) return;
    if (page < 1) return;
    if (pagination.totalPages && page > pagination.totalPages) return;
    // Chỉ cho phép đổi trang nếu có previous/next tương ứng
    if (page > pagination.currentPage && !pagination.hasNextPage) return;
    if (page < pagination.currentPage && !pagination.hasPreviousPage) return;

    // Không hiển thị loading khi đổi trang
    fetchCampaigns(page, false);
  };

  const filtered = useMemo(() => {
    // Chỉ filter client-side cho campaignType (status đã được filter ở server)
    return campaigns.filter((c) => {
      const matchCampaignType =
        campaignTypeFilter === "all" || c.campaignType === campaignTypeFilter;
      return matchCampaignType;
    });
  }, [campaigns, campaignTypeFilter]);

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="mb-6 text-xl font-bold text-gray-800">Campaign list</h2>
        <div className="py-12 text-center">
          <p className="text-slate-500">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="mb-6 text-xl font-bold text-gray-800">Campaign list</h2>
        <div className="py-8 text-center">
          <div className="mb-2 text-red-600">{error}</div>
          <button
            onClick={() => {
              fetchCampaigns(1);
            }}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="mb-6 text-xl font-bold text-gray-800">
        Campaign list (
        {typeof pagination.totalRecords === "number" &&
        pagination.totalRecords > 0
          ? pagination.totalRecords
          : filtered.length}
        )
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
            Draft
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
            Pending
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
            Approved
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
            Rejected
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
            Ongoing
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
            Ended
          </button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Không có dữ liệu</div>
      ) : (
        <>
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </>
      )}

      {/* Phân trang - hiển thị nếu có pagination info, không phụ thuộc vào filtered.length */}
      {(pagination.totalPages > 1 ||
        pagination.hasNextPage ||
        pagination.hasPreviousPage ||
        (typeof pagination.totalRecords === "number" &&
          pagination.totalRecords > 0)) && (
        <div className="mt-6 px-6 py-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page <span className="font-semibold">{pagination.currentPage}</span>
            {pagination.totalPages ? (
              <>
                {" "}
                / <span className="font-semibold">{pagination.totalPages}</span>
              </>
            ) : null}
            {typeof pagination.totalRecords === "number" && (
              <span className="ml-2">({pagination.totalRecords} records)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
              className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                pagination.hasPreviousPage
                  ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              }`}
            >
              Previous
            </button>

            <span className="text-sm text-slate-600">
              {pagination.currentPage}
            </span>

            <button
              type="button"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                pagination.hasNextPage
                  ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignList;
