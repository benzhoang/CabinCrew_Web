import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaFileAlt, FaArrowLeft } from 'react-icons/fa';
import ComplaintScoreModal from '../../components/ComplaintScoreModal';
import TestModal from '../../components/TestModal';
import NotificationModal from '../../components/NotificationModal';


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
    name: 'Nguyễn Thị Lan',
    education: 'Đại học Ngoại thương',
    email: 'lan.nguyen@email.com',
    phone: '0901234567',
    appliedDate: '2025-10-15',
    score: 85,
    round: 'Vòng kiểm tra',
    photo: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: 2,
    name: 'Trần Văn Minh',
    education: 'Đại học Bách khoa',
    email: 'minh.tran@email.com',
    phone: '0912345678',
    appliedDate: '2025-10-16',
    score: 92,
    round: 'Vòng kiểm tra',
    photo: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 3,
    name: 'Lê Thị Hương',
    education: 'Cao đẳng Du lịch',
    email: 'huong.le@email.com',
    phone: '0923456789',
    appliedDate: '2025-10-17',
    score: 78,
    round: 'Vòng kiểm tra',
    photo: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 4,
    name: 'Phạm Văn Đức',
    education: 'Đại học Kinh tế',
    email: 'duc.pham@email.com',
    phone: '0934567890',
    appliedDate: '2025-10-18',
    score: 88,
    round: 'Vòng kiểm tra',
    photo: 'https://i.pravatar.cc/150?img=4'
  },
  {
    id: 5,
    name: 'Võ Thị Mai',
    education: 'Đại học Sư phạm',
    email: 'mai.vo@email.com',
    phone: '0945678901',
    appliedDate: '2025-10-19',
    score: 90,
    round: 'Vòng kiểm tra',
    photo: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: 6,
    name: 'Võ Thị Mai',
    education: 'Đại học Sư phạm',
    email: 'mai.vo@email.com',
    phone: '0945678901',
    appliedDate: '2025-10-19',
    score: 90,
    round: 'Vòng kiểm tra',
    photo: 'https://i.pravatar.cc/150?img=6'
  }
];

const RoundBadge = ({ value }) => {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
      {value}
    </span>
  );
};

const ScoreListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
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
    return defaultCandidates.filter(candidate =>
      candidate.name.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query) ||
      candidate.phone.includes(query)
    );
  }, [searchQuery]);

  const handleNotificationClick = (notification) => {
    // Find candidate by candidateId and show complaint modal
    const candidate = defaultCandidates.find(c => c.id === notification.candidateId);
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
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Danh sách ứng viên{examInfo?.roundName ? ` - ${examInfo.roundName}` : ''}</h1>
            <p className="opacity-90 mt-1">Sàng lọc và đánh giá ứng viên cho vòng tuyển dụng</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Quay lại"
            title="Quay lại"
          >
            Quay lại
          </button>
        </div>
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin vòng tuyển</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Tên vòng:</p>
              <p className="mt-1 font-semibold text-gray-900">{examInfo?.roundName || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Thời gian bắt đầu:</p>
              <p className="mt-1 font-semibold text-gray-900">{examInfo?.startDate ? formatDate(examInfo.startDate) : '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Thời gian kết thúc:</p>
              <p className="mt-1 font-semibold text-gray-900">{examInfo?.endDate ? formatDate(examInfo.endDate) : '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Địa điểm:</p>
              <p className="mt-1 font-semibold text-gray-900">{examInfo?.location || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Chỉ tiêu:</p>
              <p className="mt-1 font-semibold text-gray-900">{typeof examInfo?.target === 'number' ? examInfo.target : '—'}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Quay lại"
                title="Quay lại"
              >
                <FaArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Danh sách điểm ({filteredCandidates.length})
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Icon */}
              <button
                onClick={() => setShowNotificationModal(true)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Thông báo"
              >
                <FaBell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {/* Search Bar */}
              <div className="relative w-72">
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, SĐT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-3 pr-9 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600 border-b border-gray-200">
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
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <td className="px-5 py-4">
                    <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                      {candidate.photo ? (
                        <img
                          src={candidate.photo}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Photo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{candidate.education}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm text-gray-700">{candidate.email}</p>
                      <p className="text-xs text-gray-600 mt-1">{candidate.phone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{formatDate(candidate.appliedDate)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      candidate.score >= 85 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
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