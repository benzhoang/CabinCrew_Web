import { useState, useMemo } from 'react';
import { FaSearch, FaBell, FaInfoCircle, FaFileAlt } from 'react-icons/fa';
import ComplaintScoreModal from '../../components/ComplaintScoreModal';
import TestModal from '../../components/TestModal';
import NotificationModal from '../../components/NotificationModal';

// Sample data
const defaultCandidates = [
  {
    id: 1,
    name: 'Nguyễn Thị Lan',
    education: 'Đại học Ngoại thương',
    email: 'lan.nguyen@email.com',
    phone: '0901234567',
    appliedDate: '2024-10-15',
    score: 85,
    round: 'Vòng phỏng vấn',
    photo: null
  },
  {
    id: 2,
    name: 'Trần Văn Minh',
    education: 'Đại học Bách khoa',
    email: 'minh.tran@email.com',
    phone: '0912345678',
    appliedDate: '2024-10-16',
    score: 92,
    round: 'Vòng phỏng vấn',
    photo: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 3,
    name: 'Lê Thị Hương',
    education: 'Cao đẳng Du lịch',
    email: 'huong.le@email.com',
    phone: '0923456789',
    appliedDate: '2024-10-17',
    score: 78,
    round: 'Vòng phỏng vấn',
    photo: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 4,
    name: 'Phạm Văn Đức',
    education: 'Đại học Kinh tế',
    email: 'duc.pham@email.com',
    phone: '0934567890',
    appliedDate: '2024-10-18',
    score: 88,
    round: 'Vòng phỏng vấn',
    photo: null
  },
  {
    id: 5,
    name: 'Võ Thị Mai',
    education: 'Đại học Sư phạm',
    email: 'mai.vo@email.com',
    phone: '0945678901',
    appliedDate: '2024-10-19',
    score: 90,
    round: 'Vòng phỏng vấn',
    photo: null
  },
  {
    id: 6,
    name: 'Võ Thị Mai',
    education: 'Đại học Sư phạm',
    email: 'mai.vo@email.com',
    phone: '0945678901',
    appliedDate: '2024-10-19',
    score: 90,
    round: 'Vòng phỏng vấn',
    photo: null
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

  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return defaultCandidates;
    const query = searchQuery.toLowerCase();
    return defaultCandidates.filter(candidate =>
      candidate.name.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query) ||
      candidate.phone.includes(query)
    );
  }, [searchQuery]);

  const handleShowComplaint = (candidate) => {
    setSelectedCandidate(candidate);
    setShowComplaintModal(true);
  };

  const handleShowTest = (candidate) => {
    setSelectedCandidate(candidate);
    setShowTestModal(true);
  };

  const handleNotificationClick = (notification) => {
    // Find candidate by candidateId and show complaint modal
    const candidate = defaultCandidates.find(c => c.id === notification.candidateId);
    if (candidate) {
      setSelectedCandidate(candidate);
      setShowComplaintModal(true);
    }
  };

  return (
    <div className="w-full h-full p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                <th className="px-5 py-3 font-semibold text-right">HÀNH ĐỘNG</th>
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
                  <td className="px-5 py-4 text-sm text-gray-700">{candidate.appliedDate}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                      {candidate.score}/100
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <RoundBadge value={candidate.round} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleShowComplaint(candidate)}
                        className="p-2 rounded-md border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 text-indigo-600 hover:text-indigo-700 transition-colors"
                        aria-label="Xem lý do khiếu nại và điểm thi"
                      >
                        <FaInfoCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShowTest(candidate)}
                        className="p-2 rounded-md border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 text-indigo-600 hover:text-indigo-700 transition-colors"
                        aria-label="Xem bài thi"
                      >
                        <FaFileAlt className="w-4 h-4" />
                      </button>
                    </div>
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
        candidate={selectedCandidate}
      />
      <TestModal
        isOpen={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setSelectedCandidate(null);
        }}
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