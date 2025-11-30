import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onLangChange } from "../../../i18n";
import { FaFilePen } from "react-icons/fa6";
import TestListModal from "../../../components/ExaminerComponent/TestListModal";
import {
  getCampaignRoundById,
  getRoundParticipants,
} from "../../../service/api2";
import { formatDate } from "../../../config/formatDate";
import { FaFile } from "react-icons/fa";

const ExaminerApplyList = () => {
  const [applicantSearchTerm, setApplicantSearchTerm] = useState("");
  const [, setLangVersion] = useState(0);
  const [roundFilter, setRoundFilter] = useState("all");
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [campaignRoundData, setCampaignRoundData] = useState(null);
  const [availableRounds, setAvailableRounds] = useState([]);
  const [loadingRoundData, setLoadingRoundData] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const campaignRoundId = params.id;
  const isViewingBatch = Boolean(campaignRoundId);

  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  // Gọi API để lấy thông tin đợt tuyển khi đang xem batch
  useEffect(() => {
    const fetchCampaignRoundData = async () => {
      if (!campaignRoundId) {
        setCampaignRoundData(null);
        setAvailableRounds([]);
        return;
      }

      setLoadingRoundData(true);
      try {
        const result = await getCampaignRoundById(campaignRoundId);
        if (result.success && result.data) {
          setCampaignRoundData(result.data);
          // Lưu danh sách rounds từ API để sử dụng cho filter
          const rounds = result.data.rounds || [];
          setAvailableRounds(rounds);
        } else {
          console.error("Lỗi khi lấy thông tin đợt tuyển:", result.error);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API getCampaignRoundById:", error);
      } finally {
        setLoadingRoundData(false);
      }
    };

    fetchCampaignRoundData();
  }, [campaignRoundId]);

  // Gọi API để lấy danh sách participants theo roundId khi filter thay đổi
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!campaignRoundId) {
        setParticipants([]);
        return;
      }

      // Nếu chọn "final", không gọi API
      if (roundFilter === "final") {
        setParticipants([]);
        return;
      }

      let roundId = null;

      // Nếu chọn "all", lấy round đầu tiên từ availableRounds
      if (roundFilter === "all") {
        if (availableRounds.length > 0) {
          roundId = availableRounds[0].roundId;
        } else {
          // Chưa có rounds, đợi rounds được load
          setParticipants([]);
          return;
        }
      } else {
        // Lấy roundId từ roundFilter
        roundId = roundFilter;
      }

      // Kiểm tra roundId hợp lệ
      if (!roundId || roundId === "final") {
        setParticipants([]);
        return;
      }

      setLoadingParticipants(true);
      try {
        const result = await getRoundParticipants(roundId);
        if (result.success && result.data && Array.isArray(result.data)) {
          // Map dữ liệu từ API sang format hiển thị theo cấu trúc response
          const mappedParticipants = result.data.map((participant) => ({
            id: participant.userId || participant.activityId,
            activityId: participant.activityId || 0,
            userId: participant.userId || 0,
            name: participant.fullName || "",
            email: participant.email || "",
            phone: participant.phoneNumber || "",
            photo: participant.imgURL || "",
            status: participant.status || "pending",
            roundId: participant.roundId || 0,
            roundName: participant.roundName || "",
            appliedDate:
              participant.appliedDate || new Date().toISOString().split("T")[0],
            education: participant.education || "",
            // Giữ các field khác nếu cần
            position: participant.position || "",
            experience: participant.experience || "",
            languages: participant.languages || [],
            applicationType: participant.applicationType || "recruitment",
            currentPosition: participant.currentPosition || "",
            targetPosition: participant.targetPosition || "",
            score: participant.score || null,
          }));
          setParticipants(mappedParticipants);
        } else {
          console.error(
            "Lỗi khi lấy danh sách ứng viên:",
            result.error || "Dữ liệu không hợp lệ"
          );
          setParticipants([]);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API getRoundParticipants:", error);
        setParticipants([]);
      } finally {
        setLoadingParticipants(false);
      }
    };

    fetchParticipants();
  }, [campaignRoundId, roundFilter, availableRounds]);

  // Filter applicants for specific batch + Application type
  const filteredApplicants = useMemo(() => {
    if (!isViewingBatch) {
      // Nếu không xem batch cụ thể, trả về mảng rỗng
      return [];
    }

    // Chỉ sử dụng participants từ API khi đang xem batch
    let list = [...participants];

    // Filter theo roundFilter
    if (roundFilter === "final") {
      // Lọc theo kết quả cuối cùng: đã có quyết định cuối (đã duyệt hoặc từ chối)
      list = list.filter(
        (a) => a.status === "approved" || a.status === "rejected"
      );
    } else if (roundFilter !== "all") {
      // Filter theo roundId được chọn
      const selectedRoundId = String(roundFilter);
      list = list.filter((a) => {
        if (a.roundId && String(a.roundId) === selectedRoundId) return true;
        if (a.roundName) {
          const selectedRound = availableRounds.find(
            (r) => String(r.roundId) === selectedRoundId
          );
          return selectedRound && a.roundName === selectedRound.roundName;
        }
        return false;
      });
    }
    // Nếu roundFilter === 'all', hiển thị tất cả participants (đã được load từ round đầu tiên)

    // Áp dụng search filter
    if (applicantSearchTerm) {
      const q = applicantSearchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          (a.name || "").toLowerCase().includes(q) ||
          (a.email || "").toLowerCase().includes(q) ||
          (a.phone || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [
    isViewingBatch,
    participants,
    roundFilter,
    availableRounds,
    applicantSearchTerm,
  ]);

  const activeRoundForTests = useMemo(() => {
    if (!availableRounds.length) return null;
    if (roundFilter === "final") return null;
    if (roundFilter === "all") {
      return availableRounds[0];
    }

    return (
      availableRounds.find(
        (round) => String(round.roundId) === String(roundFilter)
      ) || null
    );
  }, [availableRounds, roundFilter]);

  // Check if the active round is an English Listening or Speaking test
  const isEnglishTestRound = useMemo(() => {
    if (!activeRoundForTests) return false;
    const roundName = activeRoundForTests.roundName || "";
    const testType = activeRoundForTests.testType;
    const nameLower = roundName.toLowerCase();

    // Check by testType (1 = English Listening, 2 = English Speaking)
    if (testType === 1 || testType === 2) return true;

    // Check by roundName
    if (nameLower.includes("listening") || nameLower.includes("speaking")) {
      return true;
    }

    return false;
  }, [activeRoundForTests]);

  const getApplicantStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Chờ xử lý" },
      approved: { color: "bg-green-100 text-green-800", text: "Đã duyệt" },
      rejected: { color: "bg-red-100 text-red-800", text: "Từ chối" },
      interview: { color: "bg-blue-100 text-blue-800", text: "Phỏng vấn" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getRoundBadge = (round, applicant = null) => {
    // Nếu có rounds từ API, tìm round tương ứng
    if (availableRounds.length > 0) {
      let foundRound = null;

      // Tìm round theo roundId hoặc roundName từ applicant
      if (applicant) {
        if (applicant.roundId) {
          foundRound = availableRounds.find(
            (r) => String(r.roundId) === String(applicant.roundId)
          );
        } else if (applicant.roundName) {
          foundRound = availableRounds.find(
            (r) => r.roundName === applicant.roundName
          );
        } else if (round) {
          // Fallback: tìm theo round string nếu có
          foundRound = availableRounds.find(
            (r) =>
              String(r.roundId) === String(round) ||
              r.roundName?.toLowerCase() === String(round).toLowerCase()
          );
        }
      } else if (round) {
        // Nếu chỉ có round (roundId hoặc roundName)
        foundRound = availableRounds.find(
          (r) =>
            String(r.roundId) === String(round) ||
            r.roundName?.toLowerCase() === String(round).toLowerCase()
        );
      }

      if (foundRound) {
        // Sử dụng màu mặc định cho tất cả rounds từ API
        const color = "bg-indigo-100 text-indigo-800";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}
          >
            {foundRound.roundName}
          </span>
        );
      }
    }

    // Fallback cho "Kết quả cuối cùng"
    if (round === "final") {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-200 text-slate-800">
          Kết quả cuối cùng
        </span>
      );
    }

    // Fallback mặc định với roundConfig cũ
    const roundConfig = {
      screening: {
        color: "bg-indigo-100 text-indigo-800",
        text: "Vòng sàng lọc",
      },
      grooming: {
        color: "bg-purple-100 text-purple-800",
        text: "Vòng grooming",
      },
      test: { color: "bg-amber-100 text-amber-800", text: "Vòng kiểm tra" },
      interview: {
        color: "bg-teal-100 text-teal-800",
        text: "Vòng phỏng vấn",
      },
      final: {
        color: "bg-slate-200 text-slate-800",
        text: "Kết quả cuối cùng",
      },
    };
    const config = roundConfig[round] || roundConfig.screening;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getEvaluationRoute = (applicant) =>
    applicant.applicationType === "promotion"
      ? `/examiner/cabin-crew/${applicant.id}`
      : `/examiner/candidate/${applicant.id}`;

  const handleNavigateToEvaluation = (applicant) => {
    const targetRoute = getEvaluationRoute(applicant);
    navigate(targetRoute, {
      state: {
        candidate: applicant,
      },
    });
  };

  const goBackToCampaigns = () => {
    navigate(-1);
  };

  const handleOpenTestModal = () => {
    setIsTestModalOpen(true);
  };

  const handleCloseTestModal = () => {
    setIsTestModalOpen(false);
  };

  const handleSelectTest = (test) => {
    setSelectedTest(test);
    setIsTestModalOpen(false);
  };

  // Helper function to map roundName to testType number
  const getTestTypeFromRoundName = (roundName) => {
    if (!roundName) return null;
    const nameLower = roundName.toLowerCase();
    if (nameLower.includes("listening")) {
      return 1; // English Listening
    }
    if (nameLower.includes("speaking")) {
      return 2; // English Speaking
    }
    return null;
  };

  // Get testType for the modal - use testType from round or map from roundName
  const testTypeForModal = useMemo(() => {
    if (!activeRoundForTests) return null;

    // First try to get testType directly from round
    if (activeRoundForTests.testType) {
      return activeRoundForTests.testType;
    }

    // If not available, map from roundName
    if (activeRoundForTests.roundName) {
      return getTestTypeFromRoundName(activeRoundForTests.roundName);
    }

    return null;
  }, [activeRoundForTests]);

  const handleViewScores = () => {
    const campaignId =
      campaignRoundData?.campaignId ||
      campaignRoundData?.campaign?.campaignId ||
      campaignRoundId;

    if (!campaignId) {
      console.warn("Không tìm thấy campaignId để xem bài thi");
      return;
    }

    // Get testType from activeRoundForTests or map from roundName
    let testType = activeRoundForTests?.testType;
    if (!testType && activeRoundForTests?.roundName) {
      testType = getTestTypeFromRoundName(activeRoundForTests.roundName);
    }

    navigate(`/examiner/campaigns/${campaignId}/score-list`, {
      state: {
        roundId: roundFilter,
        campaignRoundData,
        testType,
        roundName: activeRoundForTests?.roundName,
      },
    });
  };

  // Render applicant list view
  return (
    <div className="">
      {/* Page hero */}
      <div className="text-white bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="px-6 py-8 mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <button
              onClick={goBackToCampaigns}
              className="p-2 transition-colors rounded-lg hover:bg-white/10"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-extrabold md:text-3xl">
                Danh sách ứng viên - {campaignRoundData?.roundName || "N/A"}
              </h1>
              <p className="mt-1 text-sm text-white/90">
                Sàng lọc và đánh giá ứng viên tuyển dụng & thăng bậc
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Batch Info */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Thông tin đợt tuyển
          </h3>
          {loadingRoundData ? (
            <div className="py-4 text-center">
              <p className="text-slate-500">Đang tải thông tin đợt tuyển...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div>
                <span className="text-sm text-slate-600">Tên đợt:</span>
                <p className="font-medium text-slate-800">
                  {campaignRoundData?.roundName || "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Ngày bắt đầu:</span>
                <p className="font-medium text-slate-800">
                  {campaignRoundData?.startDate || "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Ngày kết thúc:</span>
                <p className="font-medium text-slate-800">
                  {campaignRoundData?.endDate || "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Mô tả:</span>
                <p className="font-medium text-slate-800">
                  {campaignRoundData?.description || "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Chỉ tiêu:</span>
                <p className="font-medium text-slate-800">
                  {campaignRoundData
                    ? `${campaignRoundData.actualQuantiy || 0}/${
                        campaignRoundData.targetQuantity || 0
                      }`
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Applicants List */}
        <div className="bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Danh sách ứng viên ({filteredApplicants.length})
              </h3>
              <div className="flex flex-col w-full gap-3 md:flex-row md:w-auto md:items-center">
                {isEnglishTestRound && (
                  <div className="flex flex-col items-start gap-1">
                    {!activeRoundForTests?.testId ||
                    activeRoundForTests?.testId === 0 ||
                    activeRoundForTests?.testId === null ? (
                      <button
                        onClick={handleOpenTestModal}
                        className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
                      >
                        <FaFilePen className="w-5 h-5" />
                        Chọn bài thi
                      </button>
                    ) : (
                      <button
                        onClick={handleViewScores}
                        className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg shadow-sm hover:bg-green-700"
                      >
                        <FaFile className="w-5 h-5" />
                        Xem bài thi
                      </button>
                    )}
                    {selectedTest && (
                      <span className="text-xs text-slate-500">
                        Đang chọn:{" "}
                        <span className="font-semibold text-slate-700">
                          {selectedTest.name}
                        </span>
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Vòng:</label>
                  <select
                    className="px-3 py-2 text-sm border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={roundFilter}
                    onChange={(e) => setRoundFilter(e.target.value)}
                    disabled={loadingRoundData}
                  >
                    <option value="all">Tất cả</option>
                    {loadingRoundData ? (
                      <option value="" disabled>
                        Đang tải...
                      </option>
                    ) : availableRounds.length > 0 ? (
                      availableRounds.map((round) => (
                        <option key={round.roundId} value={round.roundId}>
                          {round.roundName}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Chưa có dữ liệu vòng
                      </option>
                    )}
                  </select>
                </div>
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Tìm theo tên, email, SĐT..."
                    className="w-full py-2 pr-3 text-sm border rounded-md border-slate-300 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={applicantSearchTerm}
                    onChange={(e) => setApplicantSearchTerm(e.target.value)}
                  />
                  <svg
                    className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingParticipants ? (
              <div className="p-12 text-center">
                <p className="text-slate-500">Đang tải danh sách ứng viên...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                      Ảnh 4x6
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                      Ứng viên
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                      Liên hệ
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                      Ngày ứng tuyển
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                      Vòng
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-20 overflow-hidden rounded-md bg-slate-100">
                          <img
                            src={
                              applicant.photo ||
                              "https://via.placeholder.com/64x80/cccccc/666666?text=No+Photo"
                            }
                            alt={`Ảnh ${applicant.name}`}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/64x80/cccccc/666666?text=No+Photo";
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {applicant.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {applicant.education}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {applicant.email}
                        </div>
                        <div className="text-sm text-slate-500">
                          {applicant.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900">
                        {formatDate(applicant.appliedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getApplicantStatusBadge(applicant.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoundBadge(
                          applicant.roundId ||
                            applicant.roundName ||
                            applicant.round ||
                            "screening",
                          applicant
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                        <button
                          className="p-1 text-blue-600 transition-colors rounded hover:text-blue-900 hover:bg-blue-50"
                          title="Xem chi tiết"
                          onClick={() => handleNavigateToEvaluation(applicant)}
                        >
                          <svg
                            className="w-4 h-4 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loadingParticipants && filteredApplicants.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-slate-500">
                  Chưa có ứng viên nào cho đợt này
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <TestListModal
        isOpen={isTestModalOpen}
        onClose={handleCloseTestModal}
        onSelectTest={handleSelectTest}
        selectedTestId={selectedTest?.id}
        testType={testTypeForModal}
      />
    </div>
  );
};

export default ExaminerApplyList;
