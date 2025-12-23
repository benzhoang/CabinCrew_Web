import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaRegEye,
  FaFilePen,
  FaArrowRight,
  FaClipboardCheck,
} from "react-icons/fa6";
import TestListModal from "./TestListModal";
import {
  getRoundParticipants,
  moveToInterview,
  getTestSessionsByType,
} from "../../service/api2";
import { formatDate } from "../../config/formatDate";
import { toast } from "react-toastify";

const ApplyList = ({
  campaignRoundId,
  campaignId,
  batchData,
  availableRounds,
  loadingRoundData,
  participants,
  loadingParticipants,
  roundFilter,
  setRoundFilter,
  fetchCampaignRoundData,
  onParticipantsUpdate,
  isViewingBatch = true,
}) => {
  const [applicantSearchTerm, setApplicantSearchTerm] = useState("");
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isMovingToInterview, setIsMovingToInterview] = useState(false);
  const [isConfirmMoveOpen, setIsConfirmMoveOpen] = useState(false);
  const [testSessions, setTestSessions] = useState([]);
  const [loadingTestSessions, setLoadingTestSessions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Filter applicants for specific batch + Application type
  const filteredApplicants = useMemo(() => {
    if (!isViewingBatch) {
      // If not viewing a specific batch, return empty
      return [];
    }

    // Chỉ sử dụng participants từ API khi đang xem batch
    let list = [...participants];

    // Filter by roundFilter
    if (roundFilter === "final") {
      // Lọc theo kết quả cuối cùng: đã có quyết định cuối (đã duyệt hoặc từ chối)
      list = list.filter(
        (a) => a.status === "approved" || a.status === "rejected"
      );
    } else if (roundFilter) {
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

    // Apply search filter
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
    if (!roundFilter) {
      return availableRounds[0];
    }

    return (
      availableRounds.find(
        (round) => String(round.roundId) === String(roundFilter)
      ) || null
    );
  }, [availableRounds, roundFilter]);

  // Compute dateRange from selected round
  const selectedRoundDateRange = useMemo(() => {
    if (!activeRoundForTests) return null;
    const startDate = activeRoundForTests.startDate
      ? formatDate(activeRoundForTests.startDate)
      : "";
    const endDate = activeRoundForTests.endDate
      ? formatDate(activeRoundForTests.endDate)
      : "";
    if (startDate && endDate) {
      return `${startDate} - ${endDate}`;
    }
    if (startDate || endDate) {
      return startDate || endDate;
    }
    return null;
  }, [activeRoundForTests]);

  // Check if active round requires test selection (English or Practical)
  const isTestRound = useMemo(() => {
    if (!activeRoundForTests) return false;
    const roundName = activeRoundForTests.roundName || "";
    const testType = activeRoundForTests.testType;
    const nameLower = roundName.toLowerCase();

    // Check by testType (1 = English Listening, 2 = English Speaking, 3 = Practical Test)
    if (testType === 1 || testType === 2 || testType === 3) return true;

    // Check by roundName
    if (
      nameLower.includes("listening") ||
      nameLower.includes("speaking") ||
      nameLower.includes("practical")
    ) {
      return true;
    }

    return false;
  }, [activeRoundForTests]);

  // Determine current test type
  const getCurrentTestType = useMemo(() => {
    if (!activeRoundForTests) return null;
    const roundName = activeRoundForTests.roundName || "";
    const testType = activeRoundForTests.testType;
    const nameLower = roundName.toLowerCase();

    // Check by testType
    if (testType === 1) return "listening";
    if (testType === 2) return "speaking";
    if (testType === 3) return "practical";

    // Check by roundName
    if (nameLower.includes("listening")) return "listening";
    if (nameLower.includes("speaking")) return "speaking";
    if (nameLower.includes("practical")) return "practical";

    return null;
  }, [activeRoundForTests]);

  // Find next round based on current test type
  // Yêu cầu mới: tất cả test rounds (Listening / Speaking / Practical)
  // đều chuyển sang Interview
  const getNextRound = useMemo(() => {
    if (!activeRoundForTests || !availableRounds.length) return null;

    const currentTestType = getCurrentTestType;

    const findInterviewRound = () =>
      availableRounds.find((round) => {
        const roundName = (round.roundName || "").toLowerCase();
        return (
          roundName.includes("interview") || roundName.includes("phỏng vấn")
        );
      });

    if (
      currentTestType === "listening" ||
      currentTestType === "speaking" ||
      currentTestType === "practical"
    ) {
      return findInterviewRound();
    }

    return null;
  }, [activeRoundForTests, availableRounds, getCurrentTestType]);

  // Fetch test sessions for English Speaking round
  useEffect(() => {
    const fetchTestSessions = async () => {
      // Chỉ fetch khi ở round English Speaking Test (testType = 2)
      if (
        !activeRoundForTests ||
        getCurrentTestType !== "speaking" ||
        !activeRoundForTests.roundId
      ) {
        setTestSessions([]);
        return;
      }

      setLoadingTestSessions(true);
      try {
        const result = await getTestSessionsByType({
          testType: 2, // English Speaking Test
          roundId: activeRoundForTests.roundId,
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

          setTestSessions(sessions);
        } else {
          setTestSessions([]);
        }
      } catch (error) {
        console.error("Error fetching test sessions:", error);
        setTestSessions([]);
      } finally {
        setLoadingTestSessions(false);
      }
    };

    fetchTestSessions();
  }, [activeRoundForTests, getCurrentTestType]);

  // Check if any participant has no score in English Speaking Test
  const hasUnscoredParticipants = useMemo(() => {
    // Only check for speaking round
    if (getCurrentTestType !== "speaking") {
      return false;
    }

    // While loading, keep button visible
    if (loadingTestSessions) {
      return false;
    }

    // No participants -> no need to check
    if (filteredApplicants.length === 0) {
      return false;
    }

    // Participants exist but no test sessions => unscored
    if (testSessions.length === 0) {
      // Có participants nhưng không có test sessions nào = có người chưa có điểm
      return true;
    }

    // Build score map userId -> hasScore
    const scoreMap = new Map();
    testSessions.forEach((session) => {
      const userId = session.userId;
      const totalScore = session.totalScore;
      // Kiểm tra nếu totalScore là null, undefined, hoặc không phải là số hợp lệ
      // Coi 0 cũng là "không điểm" vì có thể API trả về 0 khi chưa chấm điểm
      if (
        totalScore === null ||
        totalScore === undefined ||
        totalScore === "" ||
        totalScore === 0
      ) {
        scoreMap.set(userId, false);
      } else {
        // Kiểm tra xem có phải là số hợp lệ không
        const scoreNum = Number(totalScore);
        if (isNaN(scoreNum)) {
          scoreMap.set(userId, false);
        } else {
          // Có điểm hợp lệ (số dương)
          scoreMap.set(userId, true);
        }
      }
    });

    // Check if any applicant lacks score
    const hasUnscored = filteredApplicants.some((applicant) => {
      const userId = applicant.userId || applicant.id;
      // Nếu participant không có trong test sessions (chưa làm bài thi)
      if (!scoreMap.has(userId)) {
        return true; // Chưa có điểm
      }
      // Kiểm tra xem có điểm hợp lệ không
      const hasScore = scoreMap.get(userId);
      return hasScore === false;
    });

    return hasUnscored;
  }, [
    testSessions,
    filteredApplicants,
    getCurrentTestType,
    loadingTestSessions,
  ]);

  // Confirmation message for modal
  const confirmMessage = useMemo(() => {
    if (!activeRoundForTests) {
      return "Do you want to finalize this round?";
    }

    const roundName = activeRoundForTests.roundName || "this round";
    // Ví dụ: Do you want to finalize the "English Listening Test" round?
    return `Do you want to finalize the "${roundName}" round?`;
  }, [activeRoundForTests]);

  const getApplicantStatusBadge = (status) => {
    // Normalize status to handle case variations
    const normalizedStatus = status ? String(status).toLowerCase() : "";

    const statusConfig = {
      ongoing: { color: "bg-blue-100 text-blue-800", text: "Ongoing" },
      passed: { color: "bg-green-100 text-green-800", text: "Passed" },
      failed: { color: "bg-red-100 text-red-800", text: "Failed" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
    };

    const config = statusConfig[normalizedStatus] || statusConfig.pending;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getRoundBadge = (round, applicant = null) => {
    // If rounds exist from API, find matching round
    if (availableRounds.length > 0) {
      let foundRound = null;

      // Find round via roundId or roundName from applicant
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
          // Fallback: match by round string if present
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

    // Fallback for final
    if (round === "final") {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-200 text-slate-800">
          Final result
        </span>
      );
    }

    // Default fallback roundConfig
    const roundConfig = {
      screening: {
        color: "bg-indigo-100 text-indigo-800",
        text: "Screening",
      },
      grooming: {
        color: "bg-purple-100 text-purple-800",
        text: "Grooming",
      },
      test: { color: "bg-amber-100 text-amber-800", text: "Test round" },
      interview: {
        color: "bg-teal-100 text-teal-800",
        text: "Interview",
      },
      final: {
        color: "bg-slate-200 text-slate-800",
        text: "Final result",
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
    location.state?.campaignType === "Promotion"
      ? `/examiner/campaigns/cabin-crew/${applicant.id}`
      : `/examiner/campaigns/candidate/${applicant.id}`;

  // Kiểm tra xem round hiện tại có phải là interview không
  const isInterviewRound = useMemo(() => {
    if (!activeRoundForTests) return false;
    const roundName = (activeRoundForTests.roundName || "").toLowerCase();
    return roundName.includes("interview") || roundName.includes("phỏng vấn");
  }, [activeRoundForTests]);

  const handleNavigateToEvaluation = (applicant) => {
    const targetRoute = getEvaluationRoute(applicant);
    navigate(targetRoute, {
      state: {
        candidate: applicant,
        batchData,
      },
    });
  };

  const mapRoundToStageId = (roundData, applicant) => {
    const roundName = (
      roundData?.roundName ||
      applicant?.roundName ||
      ""
    ).toLowerCase();
    const testType = roundData?.testType;

    if (roundName.includes("screening")) return "screening";
    if (roundName.includes("appearance") || roundName.includes("grooming"))
      return "appearance";
    if (roundName.includes("listening") || testType === 1)
      return "english-listening";
    if (roundName.includes("speaking") || testType === 2)
      return "english-speaking";
    if (roundName.includes("practical") || testType === 3)
      return "english-speaking";
    if (roundName.includes("interview")) return "interview";
    if (roundName.includes("final")) return "final";

    return null;
  };

  const handleNavigateToCandidateView = (applicant) => {
    const roundFromFilter =
      roundFilter === "final"
        ? { roundId: "final", roundName: "Final" }
        : availableRounds.find(
            (r) => String(r.roundId) === String(roundFilter)
          ) ||
          activeRoundForTests ||
          null;

    const stageId =
      mapRoundToStageId(roundFromFilter, applicant) ||
      mapRoundToStageId({ roundName: applicant?.roundName }, applicant) ||
      "screening";

    navigate(`/examiner/candidate/${applicant.activityId || applicant.id}`, {
      state: {
        candidate: applicant,
        viewingRound: {
          stageId,
          roundId:
            roundFromFilter?.roundId || roundFilter || applicant?.roundId,
          roundName: roundFromFilter?.roundName || applicant?.roundName || "",
        },
      },
    });
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
    // Refresh lại dữ liệu đợt tuyển để cập nhật testId mới
    if (fetchCampaignRoundData) {
      fetchCampaignRoundData();
    }
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
    if (nameLower.includes("practical")) {
      return 3; // Practical Test
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
    if (!campaignId) {
      console.warn("campaignId not found to view tests");
      return;
    }

    // Get testType from activeRoundForTests or map from roundName
    let testType = activeRoundForTests?.testType;
    if (!testType && activeRoundForTests?.roundName) {
      testType = getTestTypeFromRoundName(activeRoundForTests.roundName);
    }

    navigate(
      `/examiner/campaigns/${campaignId}/score-list/${campaignRoundId}`,
      {
        state: {
          roundId: roundFilter,
          testType,
          testId: activeRoundForTests?.testId,
          roundName: activeRoundForTests?.roundName,
        },
      }
    );
  };

  const openConfirmMoveModal = () => {
    if (!activeRoundForTests?.roundId) {
      console.warn("roundId not found to move round");
      return;
    }

    setIsConfirmMoveOpen(true);
  };

  const closeConfirmMoveModal = () => {
    setIsConfirmMoveOpen(false);
  };

  const handleConfirmMoveToInterview = async () => {
    if (!activeRoundForTests?.roundId) {
      console.warn("Không tìm thấy roundId để chuyển vòng");
      return;
    }

    setIsConfirmMoveOpen(false);

    setIsMovingToInterview(true);
    try {
      const result = await moveToInterview(activeRoundForTests.roundId);

      if (result.success) {
        toast.success("Moved to next round successfully!");

        // Reload lại dữ liệu
        // Refetch campaign round data
        if (fetchCampaignRoundData) {
          await fetchCampaignRoundData();
        }

        // Refetch participants với rounds mới
        let roundId = null;
        if (roundFilter) {
          roundId = roundFilter;
        } else if (availableRounds.length > 0) {
          roundId = availableRounds[0].roundId;
        }

        if (roundId && roundId !== "final" && onParticipantsUpdate) {
          const participantsResult = await getRoundParticipants(roundId);
          if (
            participantsResult.success &&
            participantsResult.data &&
            Array.isArray(participantsResult.data)
          ) {
            const mappedParticipants = participantsResult.data.map(
              (participant) => ({
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
                  participant.appliedDate ||
                  new Date().toISOString().split("T")[0],
                education: participant.education || "",
                position: participant.position || "",
                experience: participant.experience || "",
                languages: participant.languages || [],
                applicationType: participant.applicationType || "recruitment",
                currentPosition: participant.currentPosition || "",
                targetPosition: participant.targetPosition || "",
                score: participant.score || null,
                hasInterviewEvaluated:
                  participant.hasInterviewEvaluated || false,
              })
            );
            onParticipantsUpdate(mappedParticipants);
          }
        }
      } else {
        toast.error("Unable to move to next round. Please try again.");
      }
    } catch (error) {
      console.error("Error when moving to next round:", error);
      toast.error(
        "An error occurred while moving to next round. Please try again."
      );
    } finally {
      setIsMovingToInterview(false);
    }
  };

  return (
    <>
      {/* Applicants List */}
      <div className="bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-slate-800">
              Applicants ({filteredApplicants.length})
            </h3>
            <div className="flex flex-col w-full gap-3 md:flex-row md:w-auto md:items-center">
              {isTestRound && (
                <div className="flex items-center gap-2">
                  {!activeRoundForTests?.testId ||
                  activeRoundForTests?.testId === 0 ||
                  activeRoundForTests?.testId === null ? (
                    <button
                      onClick={handleOpenTestModal}
                      className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
                    >
                      <FaFilePen className="w-5 h-5" />
                      Choose test
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleViewScores}
                        className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg shadow-sm hover:bg-green-700"
                      >
                        <FaRegEye className="w-5 h-5" />
                        View tests
                      </button>
                      {/* Chỉ hiển thị nút Xét duyệt khi không có participant nào chưa có điểm (cho English Speaking Test) */}
                      {(() => {
                        const isSpeakingTest =
                          getCurrentTestType === "speaking";
                        const shouldHideButton =
                          isSpeakingTest && hasUnscoredParticipants;

                        // Debug log để kiểm tra
                        if (isSpeakingTest) {
                          console.log(
                            "🔍 English Speaking Test - Button visibility:",
                            {
                              isSpeakingTest,
                              hasUnscoredParticipants,
                              shouldHideButton,
                              testSessionsCount: testSessions.length,
                              participantsCount: filteredApplicants.length,
                              loadingTestSessions,
                              testSessions: testSessions.map((s) => ({
                                userId: s.userId,
                                totalScore: s.totalScore,
                                totalScoreType: typeof s.totalScore,
                              })),
                              participants: filteredApplicants.map((a) => ({
                                userId: a.userId || a.id,
                                name: a.name,
                              })),
                            }
                          );
                        }

                        return !shouldHideButton;
                      })() && (
                        <button
                          onClick={openConfirmMoveModal}
                          disabled={isMovingToInterview}
                          className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaArrowRight className="w-5 h-5" />
                          {isMovingToInterview ? "Finalizing..." : "Finalize"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Round:</label>
                <select
                  className="px-3 py-2 text-sm border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={roundFilter}
                  onChange={(e) => setRoundFilter(e.target.value)}
                  disabled={loadingRoundData}
                >
                  {loadingRoundData ? (
                    <option value="" disabled>
                      Loading...
                    </option>
                  ) : availableRounds.length > 0 ? (
                    availableRounds.map((round) => (
                      <option key={round.roundId} value={round.roundId}>
                        {round.roundName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No round data
                    </option>
                  )}
                </select>
              </div>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
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
          {selectedRoundDateRange && (
            <div className="mt-3 text-sm text-slate-600">
              Round timeline:{" "}
              <span className="font-medium text-slate-800">
                {selectedRoundDateRange}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loadingParticipants ? (
            <div className="p-12 text-center">
              <p className="text-slate-500">Loading applicants...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Portrait
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Applied date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Round
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Actions
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
                          alt={`Photo of ${applicant.name}`}
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
                      <div className="flex items-center justify-center gap-2">
                        {isInterviewRound ? (
                          <>
                            {/* Icon con mắt - xem thông tin candidate */}
                            <button
                              className="p-1 text-blue-600 transition-colors rounded hover:text-blue-900 hover:bg-blue-50"
                              title="View candidate details"
                              onClick={() =>
                                handleNavigateToCandidateView(applicant)
                              }
                            >
                              <FaRegEye className="w-4 h-4" />
                            </button>
                            {/* Icon chấm phỏng vấn - chỉ hiển thị nếu chưa được đánh giá */}
                            {!applicant.hasInterviewEvaluated && (
                              <button
                                className="p-1 text-purple-600 transition-colors rounded hover:text-purple-900 hover:bg-purple-50"
                                title="Evaluate interview"
                                onClick={() =>
                                  handleNavigateToEvaluation(applicant)
                                }
                              >
                                <FaClipboardCheck className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            className="p-1 text-blue-600 transition-colors rounded hover:text-blue-900 hover:bg-blue-50"
                            title="View candidate details"
                            onClick={() =>
                              handleNavigateToCandidateView(applicant)
                            }
                          >
                            <FaRegEye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loadingParticipants && filteredApplicants.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500">No applicants for this batch yet</p>
            </div>
          )}
        </div>
      </div>
      {/* Modal xác nhận xét duyệt */}
      {isConfirmMoveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm p-6 bg-white shadow-lg rounded-xl">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Confirm approval
            </h2>
            <p className="mb-6 text-sm text-slate-600">{confirmMessage}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmMoveModal}
                className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMoveToInterview}
                disabled={isMovingToInterview}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMovingToInterview ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      <TestListModal
        isOpen={isTestModalOpen}
        onClose={handleCloseTestModal}
        onSelectTest={handleSelectTest}
        selectedTestId={selectedTest?.id}
        testType={testTypeForModal}
        roundId={activeRoundForTests?.roundId}
        onRefresh={fetchCampaignRoundData}
      />
    </>
  );
};

export default ApplyList;
