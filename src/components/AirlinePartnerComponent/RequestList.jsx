import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCampaignRequestList } from "../../service/api2.js";

// Comment data giả
// const demoRequests = [
//   {
//     id: 101,
//     code: "REQ-2024-001",
//     title: "Yêu cầu tuyển dụng - Cabin Crew (MRF)",
//     proposer: "Đặng Bích Thu Thùy",
//     position: "Cabin Crew",
//     department: "Cabin Crew",
//     unit: "Cabin Crew - Tiếp viên hàng không",
//     quantity: 20,
//     status: "pending",
//     requestType: "recruitment",
//     startDate: "2024-10-01",
//     endDate: "2024-12-31",
//     description:
//       "Bổ sung nhân sự Cabin Crew do biến động nghỉ việc và mở rộng đội bay",
//   },
//   {
//     id: 102,
//     code: "REQ-2024-002",
//     title: "Yêu cầu tuyển dụng - IT Specialist",
//     proposer: "Nguyễn Văn Nam",
//     position: "IT Specialist",
//     department: "Information Technology",
//     unit: "IT Operations",
//     quantity: 5,
//     status: "approved",
//     requestType: "recruitment",
//     startDate: "2024-08-01",
//     endDate: "2024-09-30",
//     description: "Tăng cường đội ngũ IT phục vụ triển khai hệ thống mới",
//   },
//   {
//     id: 103,
//     code: "REQ-2024-003",
//     title: "Yêu cầu tuyển dụng - Aircraft Mechanic",
//     proposer: "Trần Bảo Vy",
//     position: "Aircraft Mechanic",
//     department: "Maintenance",
//     unit: "Base Maintenance",
//     quantity: 12,
//     status: "rejected",
//     requestType: "recruitment",
//     startDate: "2024-07-15",
//     endDate: "2024-10-15",
//     description:
//       "Bổ sung kỹ thuật viên bảo trì, đợt đề xuất chưa đáp ứng ngân sách",
//   },
//   {
//     id: 104,
//     code: "REQ-2024-004",
//     title: "Yêu cầu nâng bậc - Senior Cabin Crew",
//     proposer: "Lê Thị Hoa",
//     position: "Senior Cabin Crew",
//     department: "Cabin Crew",
//     unit: "Cabin Crew - Tiếp viên hàng không",
//     quantity: 15,
//     status: "pending",
//     requestType: "promotion",
//     startDate: "2024-11-01",
//     endDate: "2025-01-31",
//     description: "Nâng bậc cho các cabin crew có kinh nghiệm lâu năm",
//   },
//   {
//     id: 105,
//     code: "REQ-2024-005",
//     title: "Yêu cầu nâng bậc - Lead IT Specialist",
//     proposer: "Phạm Minh Tuấn",
//     position: "Lead IT Specialist",
//     department: "Information Technology",
//     unit: "IT Operations",
//     quantity: 3,
//     status: "approved",
//     requestType: "promotion",
//     startDate: "2024-09-01",
//     endDate: "2024-12-31",
//     description: "Nâng bậc cho các IT Specialist xuất sắc",
//   },
// ];

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status?.toLowerCase() || "";
    switch (normalizedStatus) {
      case "approved":
        return {
          className: "bg-green-100 text-green-700 border-green-200",
          text: "Đã được duyệt",
        };
      case "pending":
        return {
          className: "bg-yellow-100 text-yellow-700 border-yellow-200",
          text: "Đang chờ duyệt",
        };
      case "rejected":
        return {
          className: "bg-red-100 text-red-600 border-red-200",
          text: "Bị từ chối",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-600 border-gray-200",
          text: status || "Không xác định",
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

const getRequestTypeLabel = (requestType) => {
  // Normalize requestType to lowercase for comparison
  const normalizedType = requestType?.toLowerCase() || "";
  switch (normalizedType) {
    case "recruitment":
      return "Tuyển dụng";
    case "promotion":
      return "Thăng bậc";
    default:
      return requestType || "Không xác định";
  }
};

const RequestTypeBadge = ({ type }) => {
  const normalizedType = type?.toLowerCase() || "";
  const label = getRequestTypeLabel(type);
  const className =
    normalizedType === "promotion"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : normalizedType === "recruitment"
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

const CampaignCard = ({ request }) => {
  const navigate = useNavigate();

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {request.campaignName}
            </h3>
            <div className="text-xs text-slate-500">
              Mã yêu cầu:{" "}
              <span className="font-medium">{request.requestId}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 mt-2 text-sm text-gray-700 md:grid-cols-3 gap-x-8 gap-y-2">
            <div>
              <span className="text-gray-500">Số lượng mục tiêu:</span>{" "}
              {request.targetQuantity}
            </div>
            <div>
              <span className="text-gray-500">Loại yêu cầu:</span>{" "}
              <RequestTypeBadge type={request.requestType} />
            </div>
            <div>
              <span className="text-gray-500">Trạng thái:</span>{" "}
              <StatusBadge status={request.status} />
            </div>
            <div>
              <span className="text-gray-500">Mô tả:</span>{" "}
              {request.description || "Không có mô tả"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() =>
              navigate(`/airline-partner/requests/${request.requestId}`, {
                state: { request: request },
              })
            }
          >
            Xem chi tiết
          </button>
          <button className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestList = ({ search = "", campaignTypeFilter = "all" }) => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Map selectedStatus to API status format
        const statusMap = {
          all: undefined,
          approved: "Approved",
          pending: "Pending",
          rejected: "Rejected",
        };

        // Map campaignTypeFilter to API format
        const requestTypeMap = {
          all: undefined,
          recruitment: "Recruitment",
          promotion: "Promotion",
        };

        const params = {
          page: 1,
          pageSize: 100,
          searchTerm: search || undefined,
          status: statusMap[selectedStatus],
          requestType: requestTypeMap[campaignTypeFilter],
        };

        const result = await getCampaignRequestList(params);

        if (result.success) {
          setRequests(result.data.items || []);
        } else {
          setError(result.error || "Lỗi khi tải danh sách yêu cầu");
        }
      } catch (err) {
        setError(err.message || "Lỗi khi tải danh sách yêu cầu");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [search, selectedStatus, campaignTypeFilter]);

  const filtered = useMemo(() => {
    // If status filter is "all", show all requests (API already filtered by status if selected)
    // Otherwise, filter client-side for consistency
    const s = search.trim().toLowerCase();
    return requests.filter((c) => {
      const matchSearch =
        !s ||
        [c.campaignName, c.description].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(s)
        );

      // Normalize status for comparison
      const normalizedStatus = c.status?.toLowerCase() || "";
      const normalizedSelectedStatus = selectedStatus?.toLowerCase() || "";
      const matchStatus =
        normalizedSelectedStatus === "all" ||
        normalizedStatus === normalizedSelectedStatus;

      // Normalize requestType for comparison
      const normalizedRequestType = c.requestType?.toLowerCase() || "";
      const normalizedCampaignTypeFilter =
        campaignTypeFilter?.toLowerCase() || "";
      const matchCampaignType =
        normalizedCampaignTypeFilter === "all" ||
        normalizedRequestType === normalizedCampaignTypeFilter;

      return matchSearch && matchStatus && matchCampaignType;
    });
  }, [requests, search, selectedStatus, campaignTypeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-red-600">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="mb-6 text-xl font-bold text-gray-800">
        Danh sách yêu cầu ({filtered.length})
      </h2>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "all"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("Approved")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "Approved"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Đã được duyệt
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("Pending")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "Pending"
                ? "bg-yellow-600 text-white border-yellow-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Đang chờ duyệt
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("Rejected")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "Rejected"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Bị từ chối
          </button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          Không có yêu cầu nào
        </div>
      ) : (
        filtered.map((c) => <CampaignCard key={c.requestId} request={c} />)
      )}
    </div>
  );
};

export default RequestList;
