import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaSearch, FaBell } from "react-icons/fa";
import { FaEye, FaFilePen } from "react-icons/fa6";
import ComplaintScoreModal from "../../../components/ExaminerComponent/ComplaintScoreModal";
import TestModal from "../../../components/ExaminerComponent/TestModal";
import NotificationModal from "../../../components/ExaminerComponent/NotificationModal";
import { getTestById, getTestSessionsByType } from "../../../service/api2";

// const RoundBadge = ({ value }) => {
//   return (
//     <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 rounded-md bg-green-50">
//       {value}
//     </span>
//   );
// };

const ScoreListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [testSessions, setTestSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [testInfoLoading, setTestInfoLoading] = useState(false);
  const { id: campaignId, campaignRoundId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { testType, roundName, roundId, testId } = location?.state || {};

  // Check if this is an English Speaking test
  const isSpeakingTest = useMemo(() => {
    if (testType === 2) return true;
    if (roundName && roundName.toLowerCase().includes("speaking")) return true;
    return false;
  }, [testType, roundName]);

  // Fetch test sessions by testType
  useEffect(() => {
    const fetchTestSessions = async () => {
      if (!testType) {
        setTestSessions([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await getTestSessionsByType({
          testType,
          roundId: roundId || undefined,
        });

        if (result.success && result.data) {
          // Handle different response structures
          let sessions = [];
          if (Array.isArray(result.data)) {
            sessions = result.data;
          } else if (result.data.items && Array.isArray(result.data.items)) {
            sessions = result.data.items;
          } else if (result.data.data && Array.isArray(result.data.data)) {
            sessions = result.data.data;
          }

          // Transform API data to match display format
          const transformedSessions = sessions.map((session) => ({
            id: session.testSessionId || session.id,
            testSessionId: session.testSessionId,
            userId: session.userId,
            name: session.userFullName || session.name,
            email: session.userEmail || session.email,
            photo: session.imgURL || session.photo,
            totalScore: session.totalScore || 0,
            maxScore: session.maxScore || session["maxScore"] || 0,
            testName: session.testName,
            testType: session.testType,
            startTime: session.startTime,
            endTime: session.endTime,
            createdAt: session.createdAt || session.startTime,
            status: session.status !== undefined ? session.status : null,
          }));

          setTestSessions(transformedSessions);
        } else {
          setError(result.error || "Không thể lấy danh sách điểm");
          setTestSessions([]);
        }
      } catch (err) {
        console.error("Error fetching test sessions:", err);
        setError(err.message || "Không thể lấy danh sách điểm");
        setTestSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestSessions();
  }, [testType, roundId]);

  const filteredCandidates = useMemo(() => {
    const candidates = testSessions.length > 0 ? testSessions : [];
    if (!searchQuery.trim()) return candidates;
    const query = searchQuery.toLowerCase();
    return candidates.filter(
      (candidate) =>
        (candidate.name || "").toLowerCase().includes(query) ||
        (candidate.email || "").toLowerCase().includes(query)
    );
  }, [searchQuery, testSessions]);

  const derivedTestId = useMemo(() => {
    if (testId) return testId;
    if (testSessions[0]?.testId) return testSessions[0].testId;
    if (testSessions[0]?.id) return testSessions[0].id;
    return null;
  }, [testId, testSessions]);

  useEffect(() => {
    if (!derivedTestId) return;

    let isMounted = true;
    const fetchTestInfo = async () => {
      setTestInfoLoading(true);
      try {
        const response = await getTestById(derivedTestId);
        if (!isMounted) return;

        if (response.success && response.data) {
          setTestInfo(response.data);
        } else {
          setTestInfo(null);
        }
      } catch {
        if (!isMounted) return;
        setTestInfo(null);
      } finally {
        if (isMounted) {
          setTestInfoLoading(false);
        }
      }
    };

    fetchTestInfo();
    return () => {
      isMounted = false;
    };
  }, [derivedTestId]);

  const handleNotificationClick = (notification) => {
    // Find candidate by candidateId from testSessions and show complaint modal
    const candidate = testSessions.find(
      (c) => c.id === notification.candidateId || c.testSessionId === notification.candidateId
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

  const getStatusBadge = (status) => {
    // Nếu status là null hoặc undefined, hiển thị "Chưa xác định"
    if (status === null || status === undefined) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          Chưa xác định
        </span>
      );
    }

    // status: true → "Đạt", false → "Phúc khảo"
    if (status === true) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          Đạt
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
          Phúc khảo
        </span>
      );
    }
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
            onClick={() =>
              navigate(
                `/examiner/campaigns/${campaignId}/applications/${campaignRoundId}`
              )
            }
            className="px-4 py-2 transition-colors rounded-lg bg-white/20 hover:bg-white/30"
            aria-label="Quay lại"
            title="Quay lại"
          >
            Quay lại
          </button>
        </div>
        <div className="p-6 mt-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Thông tin bài kiểm tra
            </h3>
            {!testInfoLoading && derivedTestId && (
              <button
                onClick={() => {
                  if (!derivedTestId) return;
                  navigate(
                    `/examiner/campaigns/${campaignId}/test-question/${derivedTestId}`
                  );
                }}
                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
              >
                Xem chi tiết
              </button>
            )}
          </div>
          {testInfoLoading ? (
            <div className="py-4 text-center">
              <p className="text-gray-500">
                Đang tải thông tin bài kiểm tra...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-gray-500">ID bài kiểm tra:</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {testInfo?.testId || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Tên bài kiểm tra:</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {testInfo?.testName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Loại bài kiểm tra:</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {testInfo?.testType || "N/A"}
                </p>
              </div>
            </div>
          )}
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
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Đang tải danh sách điểm...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <table className="min-w-full border-collapse table-auto">
              <thead>
                <tr className="text-sm text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 font-semibold">ẢNH 4X6</th>
                  <th className="px-5 py-3 font-semibold">ỨNG VIÊN</th>
                  <th className="px-5 py-3 font-semibold">EMAIL</th>
                  <th className="px-5 py-3 font-semibold">TRẠNG THÁI</th>
                  {!isSpeakingTest && (
                    <th className="px-5 py-3 font-semibold">ĐIỂM</th>
                  )}
                  <th className="px-5 py-3 font-semibold">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate, idx) => (
                  <tr
                    key={candidate.id || candidate.testSessionId}
                    className={
                      idx % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center w-16 h-20 overflow-hidden bg-gray-200 rounded">
                        {candidate.photo ? (
                          <img
                            src={candidate.photo}
                            alt={candidate.name || "No name"}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/64x80/cccccc/666666?text=No+Photo";
                            }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">
                            No Photo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {candidate.name || "—"}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm text-gray-700">
                          {candidate.email || "—"}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(candidate.status)}
                    </td>
                    {!isSpeakingTest && (
                      <td className="px-5 py-4">
                        {candidate.maxScore > 0 || candidate.totalScore > 0 ? (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${candidate.maxScore > 0 &&
                              candidate.totalScore / candidate.maxScore >= 0.7
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                              }`}
                          >
                            {candidate.totalScore}/{candidate.maxScore}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-gray-600 transition-colors rounded hover:text-gray-900 hover:bg-gray-100"
                          title="Xem chi tiết"
                          onClick={() => {
                            const testSessionId =
                              candidate.testSessionId || candidate.id;
                            if (testSessionId) {
                              navigate(
                                `/examiner/candidate/test-session/${testSessionId}`
                              );
                            } else {
                              console.error("Không tìm thấy testSessionId");
                            }
                          }}
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-yellow-600 transition-colors rounded hover:text-yellow-900 hover:bg-yellow-100"
                          title="Phúc khảo"
                          onClick={() => {
                            const testSessionId =
                              candidate.testSessionId || candidate.id;
                            if (testSessionId) {
                              navigate(`/examiner/appeal/${testSessionId}`, {
                                state: {
                                  candidate,
                                  campaignId,
                                  campaignRoundId,
                                  testType,
                                },
                              });
                            } else {
                              console.error("Không tìm thấy testSessionId");
                            }
                          }}
                        >
                          <FaFilePen className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && !error && filteredCandidates.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">Không tìm thấy ứng viên nào</p>
            </div>
          )}
        </div>
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
