import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const demoCampaigns = [
  {
    id: 1,
    code: "CCD1 MRF",
    title: "Tuyển dụng Tiếp viên hàng không 2024",
    subtitle: "Cabin Crew (Thay thế do nghỉ việc/Thai sản)",
    proposer: "Đặng Bích Thu Thùy (Crew Welfare Team Leader)",
    role: "Tiếp viên hàng không",
    department: "Cabin Crew",
    unit: "Cabin Crew - Tiếp viên hàng không",
    quantity: 20,
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    progress: { current: 8, total: 20 },
    description:
      "Tuyển dụng tiếp viên hàng không cho các chuyến bay nội địa và quốc tế.",
    requirements:
      "Tiếng Anh tốt, Chiều cao 1.60m+, Kỹ năng giao tiếp, Sức khỏe tốt",
    rounds: [
      {
        id: "r1",
        name: "Đợt 1",
        status: "Đang diễn ra",
        startDate: "2024-10-01",
        endDate: "2024-10-15",
        location: "Hà Nội",
        method: "Trực tiếp",
        owner: "Nguyễn Thanh Tùng",
        target: "10",
        actualQuantity: "7",
        notes: "Phỏng vấn vòng 1",
        progress: 70,
      },
      {
        id: "r2",
        name: "Đợt 2",
        status: "Sắp diễn ra",
        startDate: "2024-11-01",
        endDate: "2024-11-15",
        location: "TP.HCM",
        method: "Trực tiếp",
        owner: "Trần Bảo Vy",
        target: "10",
        actualQuantity: "0",
        notes: "Phỏng vấn vòng 2",
        progress: 0,
      },
    ],
  },
  {
    id: 2,
    code: "CCD2 PILOT",
    title: "Chiến dịch Pilot Training",
    subtitle: "Flight Operations Training",
    proposer: "Nguyễn Văn A (Flight Operations Manager)",
    role: "Phi công",
    department: "Flight Operations",
    unit: "Flight Operations - Phi công",
    quantity: 5,
    status: "completed",
    startDate: "2024-01-01",
    endDate: "2024-02-28",
    progress: { current: 5, total: 5 },
    description: "Tuyển dụng và đào tạo phi công cho mùa bay mới.",
    requirements: "Bằng lái máy bay, Kinh nghiệm bay, Tiếng Anh tốt",
    rounds: [
      {
        id: "r1",
        name: "Đợt 1",
        status: "Đã hoàn thành",
        startDate: "2024-01-01",
        endDate: "2024-02-28",
        location: "TP.HCM",
        method: "Trực tiếp",
        owner: "Nguyễn Văn A",
        target: "5",
        actualQuantity: "5",
        notes: "Đào tạo phi công",
        progress: 100,
      },
    ],
  },
  {
    id: 3,
    code: "CCD3 MAINT",
    title: "Tuyển dụng Kỹ thuật viên bảo trì",
    subtitle: "Maintenance Department",
    proposer: "Trần Văn B (Maintenance Manager)",
    role: "Kỹ thuật viên bảo trì",
    department: "Maintenance",
    unit: "Maintenance - Kỹ thuật viên",
    quantity: 15,
    status: "pending",
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    progress: { current: 0, total: 15 },
    description:
      "Tuyển dụng kỹ thuật viên bảo trì máy bay, đang chờ phê duyệt từ ban quản lý.",
    requirements: "Bằng kỹ thuật, Kinh nghiệm bảo trì, Chứng chỉ hàng không",
    rounds: [
      {
        id: "r1",
        name: "Đợt 1",
        status: "Chưa diễn ra",
        startDate: "2024-03-01",
        endDate: "2024-04-30",
        location: "Hà Nội",
        method: "Trực tiếp",
        owner: "Trần Văn B",
        target: "15",
        actualQuantity: "0",
        notes: "Chờ phê duyệt",
        progress: 0,
      },
    ],
  },
];

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          className: "bg-green-100 text-green-700 border-green-200",
          text: "Đang diễn ra",
        };
      case "pending":
        return {
          className: "bg-yellow-100 text-yellow-700 border-yellow-200",
          text: "Đang chờ duyệt",
        };
      case "completed":
        return {
          className: "bg-red-100 text-red-600 border-red-200",
          text: "Đã hoàn thành",
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

const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate();
  const percent = useMemo(() => {
    const { current = 0, total = 0 } = campaign.progress || {};
    if (!total) return 0;
    return Math.min(100, Math.round((current / total) * 100));
  }, [campaign]);

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {campaign.title}
            </h3>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-sm text-gray-700">
            <div>
              <span className="text-gray-500">Phòng ban:</span>{" "}
              {campaign.department}
            </div>
            <div>
              <span className="text-gray-500">Thời gian bắt đầu:</span>{" "}
              {formatDate(campaign.startDate)}
            </div>
            <div>
              <span className="text-gray-500">Thời gian kết thúc:</span>{" "}
              {formatDate(campaign.endDate)}
            </div>
            <div>
              <span className="text-gray-500">Trạng thái:</span>{" "}
              <StatusBadge status={campaign.status} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() =>
              navigate(`/airline-partner/campaigns/${campaign.id}`, {
                state: { campaign: campaign },
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

      <div className="mt-4">
        <div className="flex justify-between text-sm text-slate-600 mb-1">
          <span className="text-gray-500">Tiến độ tuyển dụng</span>{" "}
          {campaign.progress?.current ?? 0}/{campaign.progress?.total ?? 0} (
          {percent}%)
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
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

const CampaignList = ({ search = "", campaigns = demoCampaigns }) => {
  const [selectedStatus, setSelectedStatus] = useState("active");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchSearch =
        !s ||
        [c.title, c.role, c.department].some((v) =>
          String(v).toLowerCase().includes(s)
        );
      const matchStatus =
        selectedStatus === "all" || c.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [campaigns, search, selectedStatus]);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Danh sách chiến dịch ({filtered.length})
      </h2>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => setSelectedStatus("active")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "active"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Đang diễn ra
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
            onClick={() => setSelectedStatus("completed")}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              selectedStatus === "completed"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Đã hoàn thành
          </button>
        </div>
      </div>
      {filtered.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  );
};

export default CampaignList;
