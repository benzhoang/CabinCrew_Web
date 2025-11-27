import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaBell } from "react-icons/fa";
import ComplaintScoreModal from "../../components/ExaminerComponent/ComplaintScoreModal";
import TestModal from "../../components/ExaminerComponent/TestModal";
import NotificationModal from "../../components/ExaminerComponent/NotificationModal";

const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Sample data
const defaultCandidates = [
  {
    id: 1,
    name: "Nguyễn Thị Lan",
    education: "Đại học Ngoại thương",
    email: "lan.nguyen@email.com",
    phone: "0901234567",
    appliedDate: "2025-10-15",
    score: 85,
    round: "Vòng kiểm tra",
    photo: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 2,
    name: "Trần Văn Minh",
    education: "Đại học Bách khoa",
    email: "minh.tran@email.com",
    phone: "0912345678",
    appliedDate: "2025-10-16",
    score: 92,
    round: "Vòng kiểm tra",
    photo: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 3,
    name: "Lê Thị Hương",
    education: "Cao đẳng Du lịch",
    email: "huong.le@email.com",
    phone: "0923456789",
    appliedDate: "2025-10-17",
    score: 78,
    round: "Vòng kiểm tra",
    photo: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 4,
    name: "Phạm Văn Đức",
    education: "Đại học Kinh tế",
    email: "duc.pham@email.com",
    phone: "0934567890",
    appliedDate: "2025-10-18",
    score: 88,
    round: "Vòng kiểm tra",
    photo: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: 5,
    name: "Võ Thị Mai",
    education: "Đại học Sư phạm",
    email: "mai.vo@email.com",
    phone: "0945678901",
    appliedDate: "2025-10-19",
    score: 90,
    round: "Vòng kiểm tra",
    photo: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 6,
    name: "Võ Thị Mai",
    education: "Đại học Sư phạm",
    email: "mai.vo@email.com",
    phone: "0945678901",
    appliedDate: "2025-10-19",
    score: 90,
    round: "Vòng kiểm tra",
    photo: "https://i.pravatar.cc/150?img=6",
  },
];

const RoundBadge = ({ value }) => {
  return (
    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 rounded-md bg-green-50">
      {value}
    </span>
  );
};

const ScoreListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const examInfo = location?.state?.examInfo || {};

  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return defaultCandidates;
    const query = searchQuery.toLowerCase();
    return defaultCandidates.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.phone.includes(query)
    );
  }, [searchQuery]);

  const handleNotificationClick = (notification) => {
    // Find candidate by candidateId and show complaint modal
    const candidate = defaultCandidates.find(
      (c) => c.id === notification.candidateId
    );
    if (candidate) {
      setSelectedCandidate(candidate);
      setShowComplaintModal(true);
    }
  };

  const handleViewTestDetails = () => {
    setShowComplaintModal(false);
    setShowTestModal(true);
  };

  const handleBackToComplaint = () => {
    setShowTestModal(false);
    setShowComplaintModal(true);
  };

  const handleBackToNotifications = () => {
    setShowComplaintModal(false);
    setShowNotificationModal(true);
  };

  return (
    <div className="w-full h-full p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between p-6 text-white bg-gradient-to-r from-indigo-600 to-blue-600">
          <div>
            <h1 className="text-2xl font-extrabold md:text-3xl">
              Danh sách điểm của ứng viên
            </h1>
            <p className="mt-1 text-sm text-white/90">
              Xem và phản hồi phúc khảo điểm của ứng viên
            </p>
          </div>
          <button
            onClick={() => navigate("/examiner/exam-campaigns")}
            className="px-4 py-2 transition-colors rounded-lg bg-white/20 hover:bg-white/30"
            aria-label="Quay lại"
            title="Quay lại"
          >
            Quay lại
          </button>
        </div>
        <div className="p-6 mt-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Thông tin bài kiểm tra
          </h3>
          <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-gray-500">Mã đề:</p>
              <p className="mt-1 font-semibold text-gray-900">
                {examInfo?.testCode || "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Tên bài kiểm tra:</p>
              <p className="mt-1 font-semibold text-gray-900">
                {examInfo?.testName || "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Vòng:</p>
              <p className="mt-1 font-semibold text-gray-900">
                {examInfo?.roundName || "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Địa điểm:</p>
              <p className="mt-1 font-semibold text-gray-900">
                {examInfo?.location || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Danh sách điểm ({filteredCandidates.length})
            </h1>
            <div className="flex items-center gap-3">
              {/* Notification Icon */}
              <button
                onClick={() => setShowNotificationModal(true)}
                className="relative p-2 transition-colors rounded-lg hover:bg-gray-100"
                aria-label="Thông báo"
              >
                <FaBell className="w-5 h-5 text-gray-600" />
                <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"></span>
              </button>
              {/* Search Bar */}
              <div className="relative w-72">
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, SĐT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 text-sm border border-gray-300 rounded-lg h-9 pr-9 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
                <FaSearch className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse table-auto">
            <thead>
              <tr className="text-sm text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 font-semibold">ẢNH 4X6</th>
                <th className="px-5 py-3 font-semibold">ỨNG VIÊN</th>
                <th className="px-5 py-3 font-semibold">LIÊN HỆ</th>
                <th className="px-5 py-3 font-semibold">NGÀY ỨNG TUYỂN</th>
                <th className="px-5 py-3 font-semibold">ĐIỂM</th>
                <th className="px-5 py-3 font-semibold">VÒNG</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate, idx) => (
                <tr
                  key={candidate.id}
                  className={
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                  }
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center w-16 h-20 overflow-hidden bg-gray-200 rounded">
                      {candidate.photo ? (
                        <img
                          src={candidate.photo}
                          alt={candidate.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No Photo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {candidate.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {candidate.education}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm text-gray-700">{candidate.email}</p>
                      <p className="mt-1 text-xs text-gray-600">
                        {candidate.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {formatDate(candidate.appliedDate)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        candidate.score >= 85
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {candidate.score}/100
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <RoundBadge value={candidate.round} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCandidates.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">Không tìm thấy ứng viên nào</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ComplaintScoreModal
        isOpen={showComplaintModal}
        onClose={() => {
          setShowComplaintModal(false);
          setSelectedCandidate(null);
        }}
        onViewDetails={handleViewTestDetails}
        onBack={handleBackToNotifications}
        candidate={selectedCandidate}
      />
      <TestModal
        isOpen={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setSelectedCandidate(null);
        }}
        onBack={handleBackToComplaint}
        candidate={selectedCandidate}
      />
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onViewDetails={handleNotificationClick}
      />
    </div>
  );
};

export default ScoreListPage;
