import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// const formatDate = (isoString) => {
//   if (!isoString) return "";
//   const date = new Date(isoString);
//   if (Number.isNaN(date.getTime())) return isoString;
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();
//   return `${day}/${month}/${year}`;
// };

const demoRequests = [
    {
        id: 101,
        code: 'REQ-2024-001',
        title: 'Yêu cầu tuyển dụng - Cabin Crew (MRF)',
        proposer: 'Đặng Bích Thu Thùy',
        position: 'Cabin Crew',
        department: 'Cabin Crew',
        unit: 'Cabin Crew - Tiếp viên hàng không',
        quantity: 20,
        status: 'pending',
        startDate: '2024-10-01',
        endDate: '2024-12-31',
        description: 'Bổ sung nhân sự Cabin Crew do biến động nghỉ việc và mở rộng đội bay'
    },
    {
        id: 102,
        code: 'REQ-2024-002',
        title: 'Yêu cầu tuyển dụng - IT Specialist',
        proposer: 'Nguyễn Văn Nam',
        position: 'IT Specialist',
        department: 'Information Technology',
        unit: 'IT Operations',
        quantity: 5,
        status: 'approved',
        startDate: '2024-08-01',
        endDate: '2024-09-30',
        description: 'Tăng cường đội ngũ IT phục vụ triển khai hệ thống mới'
    },
    {
        id: 103,
        code: 'REQ-2024-003',
        title: 'Yêu cầu tuyển dụng - Aircraft Mechanic',
        proposer: 'Trần Bảo Vy',
        position: 'Aircraft Mechanic',
        department: 'Maintenance',
        unit: 'Base Maintenance',
        quantity: 12,
        status: 'rejected',
        startDate: '2024-07-15',
        endDate: '2024-10-15',
        description: 'Bổ sung kỹ thuật viên bảo trì, đợt đề xuất chưa đáp ứng ngân sách'
    },
];

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
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

const CampaignCard = ({ request }) => {
  const navigate = useNavigate();

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
            <div className="mb-5">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {request.title}
                </h3>
                <div className="text-xs text-slate-500">Mã yêu cầu: <span className="font-medium">{request.code}</span></div>
            </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 text-sm text-gray-700">
            <div>
              <span className="text-gray-500">Vị trí:</span>{" "}
              {request.position}
            </div>
            <div>
              <span className="text-gray-500">Phòng ban:</span>{" "}
              {request.department}
            </div>
            <div>
              <span className="text-gray-500">Trạng thái:</span>{" "}
              <StatusBadge status={request.status} />
            </div>
            <div>
              <span className="text-gray-500">Đơn vị:</span>{" "}
              {request.unit}
            </div>
            <div>
              <span className="text-gray-500">Số lượng:</span>{" "}
              {request.quantity}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() =>
              navigate(`/senior-recruiter/requests/${request.id}`, {
                state: { request: request },
              })
            }
          >
            Xem chi tiết
          </button>
        </div>
      </div>

      <p className="mt-5 text-sm text-gray-600">{request.description}</p>
    </div>
  );
};

const RequestList = ({ search = "", requests = demoRequests }) => {
  const [selectedStatus, setSelectedStatus] = useState("approved");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return requests.filter((c) => {
      const matchSearch =
        !s ||
        [c.title, c.role, c.department].some((v) =>
          String(v).toLowerCase().includes(s)
        );
      const matchStatus =
        selectedStatus === "all" || c.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [requests, search, selectedStatus]);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Danh sách yêu cầu ({filtered.length})
      </h2>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => setSelectedStatus("approved")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "approved"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Đã được duyệt
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
            onClick={() => setSelectedStatus("rejected")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "rejected"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Bị từ chối
          </button>
        </div>
      </div>
      {filtered.map((c) => (
        <CampaignCard key={c.id} request={c} />
      ))}
    </div>
  );
};

export default RequestList;
