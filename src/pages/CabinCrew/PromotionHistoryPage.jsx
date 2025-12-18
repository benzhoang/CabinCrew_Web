import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { t, onLangChange } from "../../i18n";
import { FaCheck, FaClock, FaEllipsisH } from "react-icons/fa";
import { getPromotionHistory } from "../../service/api2";
import { promotionStagesTemplates } from "./Templates/promotionStagesTemplates";
import { recruitmentStageTemplates } from "./Templates/recruitmentStageTemplates";

// Các hằng số & map dùng cho timeline recruitment (giống RecruitmentStages.jsx)
const LINE_START_PERCENT = 5;
const LINE_END_PERCENT = 95;
const AXIS_SEGMENTS = 4;
const TIMELINE_HEIGHT = 240;
const BASELINE_Y = 110;
const BRANCH_OFFSET = 70;

const stageAxisPositionMap = {
  screening: 0,
  appearance: 1,
  "english-listening": 2,
  "english-speaking": 2,
  interview: 3,
  final: 4,
};

const normalizeText = (text) => (text || "").toLowerCase().trim();

const doesRoundMatchRecruitmentStage = (round, stageTemplate) => {
  if (!round) return false;
  const roundName = normalizeText(round.roundName);
  const stageNames = [
    stageTemplate.name,
    stageTemplate.nameEn,
    ...(stageTemplate.aliases || []),
  ].map(normalizeText);
  return stageNames.some((name) => name && roundName.includes(name));
};

const isStageReached = (stage, index, currentStage) => {
  if (!stage || typeof index !== "number") return false;
  if (stage.completed) return true;
  return index + 1 <= currentStage;
};

const getAxisPercent = (templateId) => {
  const axisPos = stageAxisPositionMap[templateId];
  if (typeof axisPos !== "number") return LINE_START_PERCENT;
  return (
    LINE_START_PERCENT +
    ((LINE_END_PERCENT - LINE_START_PERCENT) * axisPos) / AXIS_SEGMENTS
  );
};

const getStagePositionStyle = (templateId) => {
  const isMainStage = ["screening", "appearance", "interview", "final"].includes(
    templateId
  );

  if (isMainStage) {
    return {
      left: `${getAxisPercent(templateId)}%`,
      top: `${BASELINE_Y - 30}px`,
      transform: "translateX(-50%)",
    };
  }

  const verticalOffset =
    templateId === "english-listening"
      ? -BRANCH_OFFSET
      : templateId === "english-speaking"
        ? BRANCH_OFFSET
        : 0;

  return {
    left: `${getAxisPercent(templateId)}%`,
    top: `${BASELINE_Y + verticalOffset}px`,
    transform: "translate(-50%, -50%)",
  };
};

const getRecruitmentProgressPercentage = (application) => {
  if (AXIS_SEGMENTS === 0) return 0;

  const completedPositions = application.stages
    .filter((stage) => stage.completed)
    .map((stage) => stageAxisPositionMap[stage.templateId])
    .filter((pos) => typeof pos === "number");

  const completedMax =
    completedPositions.length > 0 ? Math.max(...completedPositions) : 0;

  let currentPosition = completedMax;
  if (
    application.currentStage > 0 &&
    application.currentStage <= application.stages.length
  ) {
    const currentStageData =
      application.stages[application.currentStage - 1];
    if (currentStageData) {
      const axisPos = stageAxisPositionMap[currentStageData.templateId];
      if (typeof axisPos === "number") {
        currentPosition = axisPos;
      }
    }
  }

  const furthest = Math.max(completedMax, currentPosition);
  return (furthest / AXIS_SEGMENTS) * 100;
};

const PromotionHistoryPage = () => {
  //const navigate = useNavigate();
  const [promotionHistory, setPromotionHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tự động re-render khi đổi ngôn ngữ
  const [, setLangTick] = useState(0);
  useEffect(() => {
    const off = onLangChange(() => setLangTick((v) => v + 1));
    return () => off();
  }, []);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchPromotionHistory = async () => {
      try {
        setLoading(true);

        const result = await getPromotionHistory();
        console.log("API Result getPromotionHistory:", result);

        if (result.success && result.data && Array.isArray(result.data)) {
          const mappedHistory = result.data.map((item) => {
            const rounds = item.rounds || [];

            const campaignTypeRaw = item.campaignType || "";
            const campaignType = campaignTypeRaw.toLowerCase();
            const isRecruitment = campaignType.includes("recruitment");

            // Map rounds từ API vào các stage cố định theo loại campaign
            let mappedStages = [];

            if (isRecruitment) {
              // Giống RecruitmentStages.jsx
              mappedStages = recruitmentStageTemplates.map(
                (template, index) => {
                  const matchingRound = rounds.find((round) =>
                    doesRoundMatchRecruitmentStage(round, template)
                  );
                  const roundStatus = normalizeText(matchingRound?.status);
                  const isCompleted = ["completed", "passed", "finished"].some(
                    (status) => roundStatus.includes(status)
                  );

                  return {
                    activityId: matchingRound?.activityId || "",
                    applicationId: matchingRound?.applicationId || "",
                    id: matchingRound?.roundId || `${template.id}-${index}`,
                    templateId: template.id,
                    name: matchingRound?.roundName || template.name,
                    nameEn: matchingRound?.roundName || template.nameEn,
                    completed: Boolean(matchingRound) && isCompleted,
                    date: matchingRound?.date || null,
                    status: matchingRound?.status || "On Going",
                  };
                }
              );
            } else {
              // Mặc định: dùng logic cho promotion campaign
              mappedStages = promotionStagesTemplates.map((stageTemplate) => {
                const matchedRound = rounds.find((round) => {
                  const roundName = (round.roundName || "").toLowerCase();
                  return stageTemplate.keywords.some((keyword) =>
                    roundName.includes(keyword.toLowerCase())
                  );
                });

                if (matchedRound) {
                  const status = (matchedRound.status || "").toLowerCase();
                  const isCompleted =
                    status === "completed" ||
                    status === "passed" ||
                    status === "finished";

                  return {
                    id: stageTemplate.id,
                    roundId: matchedRound.roundId || matchedRound.id,
                    name: stageTemplate.name,
                    nameEn: stageTemplate.nameEn,
                    completed: isCompleted,
                    date: matchedRound.date || null,
                    status: matchedRound.status || "",
                  };
                } else {
                  // Stage chưa có trong API, hiển thị màu xám
                  return {
                    id: stageTemplate.id,
                    roundId: null,
                    name: stageTemplate.name,
                    nameEn: stageTemplate.nameEn,
                    completed: false,
                    date: null,
                    status: "Pending",
                  };
                }
              });
            }

            // Xác định currentStage dựa trên số stage đã hoàn thành
            const completedCount = mappedStages.filter(
              (stage) => stage.completed
            ).length;

            // Kiểm tra xem có stage nào bị Failed không
            const failedStageIndex = mappedStages.findIndex((stage) => {
              const status = (stage?.status || "").toLowerCase();
              return [
                "failed",
                "fail",
                "rejected",
                "not passed",
                "did not pass",
              ].some((keyword) => status.includes(keyword));
            });

            let currentStageIndex;

            // Nếu có stage Failed, hiển thị stage đó
            if (failedStageIndex !== -1) {
              currentStageIndex = failedStageIndex + 1;
            } else {
              // Nếu không có Failed, tính dựa trên số stage đã hoàn thành
              currentStageIndex = completedCount + 1;

              // Nếu tất cả rounds đã hoàn thành, currentStage là tổng số stage
              if (currentStageIndex > mappedStages.length) {
                currentStageIndex = mappedStages.length;
              }
            }

            // Đảm bảo currentStage ít nhất là 1
            if (currentStageIndex < 1) {
              currentStageIndex = 1;
            }

            let status = "pending";
            let statusText = "Under review";
            let statusTextEn = "Under Review";

            if (item.roundStatus) {
              const roundStatus = item.roundStatus.toLowerCase();
              if (
                roundStatus.includes("completed") ||
                roundStatus.includes("passed") ||
                roundStatus.includes("finished")
              ) {
                status = "accepted";
                statusText = "Completed";
                statusTextEn = "Completed";
              } else if (
                roundStatus.includes("rejected") ||
                roundStatus.includes("failed")
              ) {
                status = "rejected";
                statusText = "Not Qualified";
                statusTextEn = "Not Qualified";
              }
            }

            return {
              id: item.campaignRoundId || item.id || Math.random(),
              position: item.campaignName || "Promotion campaign",
              company: item.airlinePartner || "Airline partner",
              appliedDate:
                item.appliedDate || new Date().toISOString().split("T")[0],
              status,
              statusText,
              statusTextEn,
              location: item.location || "",
              description: item.description || "",
              campaignType: item.campaignType || "",
              currentStage: currentStageIndex || 1,
              stages: mappedStages,
            };
          });

          setPromotionHistory(mappedHistory);
        } else {
          setPromotionHistory([]);
        }
      } catch (err) {
        console.error("Error fetching promotion history:", err);
        setPromotionHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100";
      case "pending":
        return "bg-yellow-100";
      case "rejected":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "accepted":
        return "text-green-800";
      case "pending":
        return "text-yellow-800";
      case "rejected":
        return "text-red-800";
      default:
        return "text-gray-800";
    }
  };

  const getStatusText = (item) => {
    const lang = localStorage.getItem("lang") || "vi";
    return lang === "vi" ? item.statusText : item.statusTextEn;
  };

  // Hàm lấy màu cho Campaign type
  const getCampaignTypeColor = (campaignType) => {
    if (!campaignType) return "bg-gray-100 text-gray-800 border-gray-300";

    const type = campaignType.toLowerCase();
    if (type.includes("promotion")) {
      return "bg-purple-100 text-purple-800 border-purple-300";
    } else if (type.includes("recruitment")) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Hàm lấy tên giai đoạn theo ngôn ngữ
  const getStageName = (stage) => {
    const lang = localStorage.getItem("lang") || "vi";
    return lang === "vi" ? stage.name : stage.nameEn;
  };

  // Hàm kiểm tra stage có bị failed không
  const isStageFailed = (stage) => {
    const status = (stage?.status || "").toLowerCase();
    return ["failed", "fail", "rejected", "not passed", "did not pass"].some(
      (keyword) => status.includes(keyword)
    );
  };

  // Hàm chuyển đổi status của stage sang format status của application
  const getStageStatusForColor = (stage) => {
    if (!stage) return "pending";

    const status = (stage.status || "").toLowerCase();

    // Kiểm tra nếu stage bị failed
    if (isStageFailed(stage)) {
      return "rejected";
    }

    // Kiểm tra nếu stage đã completed
    if (
      status === "completed" ||
      status === "passed" ||
      status === "finished" ||
      stage.completed
    ) {
      return "accepted";
    }

    // Mặc định là pending
    return "pending";
  };

  // Hàm lấy màu sắc cho giai đoạn (giống PromotionStagesPage)
  const getStageColor = (stage, currentStage, stageIndex) => {
    if (isStageFailed(stage)) {
      return "bg-red-500 text-white";
    }
    if (stage.completed) {
      return "bg-green-500 text-white";
    } else if (stageIndex + 1 === currentStage) {
      return "bg-yellow-500 text-white";
    } else {
      return "bg-gray-300 text-gray-600";
    }
  };

  // Hàm lấy icon cho giai đoạn (giống PromotionStagesPage)
  const getStageIcon = (stage, currentStage, stageIndex) => {
    if (isStageFailed(stage)) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-10.95a1 1 0 10-1.414-1.414L10 7.758 7.879 5.636a1 1 0 00-1.414 1.414L8.586 9l-2.121 2.121a1 1 0 101.414 1.414L10 10.414l2.121 2.121a1 1 0 001.414-1.414L11.414 9l2.122-2.121z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (stage.completed) {
      return <FaCheck className="w-4 h-4" />;
    } else if (stageIndex + 1 === currentStage) {
      return <FaEllipsisH className="w-4 h-4" />;
    } else {
      return <FaClock className="w-4 h-4" />;
    }
  };

  // Tính toán statistics
  const totalApplications = promotionHistory.length;
  const completedCount = promotionHistory.filter(
    (item) => item.status === "accepted"
  ).length;
  const rejectedCount = promotionHistory.filter(
    (item) => item.status === "rejected"
  ).length;

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {t("promotion_history") || "Promotion history"}
          </h1>
          <p className="text-gray-600">
            {t("recruitment_history_subtitle") ||
              "View all your application history"}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("total_applications") || "Total applications"}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalApplications}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("accepted") || "Completed"}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {completedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Not Qualified
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {rejectedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("promotion_history")}
            </h2>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="py-8 text-center text-gray-600">
                Loading data...
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {promotionHistory.map((application) => {
                const isRecruitment = (application.campaignType || "")
                  .toLowerCase()
                  .includes("recruitment");

                return (
                  <div
                    key={application.id}
                    className="p-6 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex flex-col gap-2">
                      {/* Title + Status Badge */}
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {application.position}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {getStatusText(application)}
                        </span>
                      </div>

                      {/* Round + Airline Partner + Campaign Type */}
                      <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="font-medium">Round:</span>{" "}
                          {application.stages?.[application.currentStage - 1]
                            ?.name || "—"}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="font-medium">Airline partner:</span>{" "}
                          {application.company}
                        </div>
                        {application.campaignType && (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            <span className="font-medium">Campaign type:</span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCampaignTypeColor(
                                application.campaignType
                              )}`}
                            >
                              {application.campaignType}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {application.description && (
                        <p className="text-sm text-gray-600">
                          {application.description}
                        </p>
                      )}

                      {/* Registered Date */}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          Registered date:{" "}
                          {new Date(
                            application.appliedDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Hiển thị timeline cho các giai đoạn đã chấp thuận và không đạt yêu cầu */}
                    {(application.status === "accepted" ||
                      application.status === "rejected") &&
                      application.stages && (
                        <div className="pt-6 mt-6 border-t border-gray-200">
                          <h4 className="mb-4 text-sm font-medium text-gray-900">
                            Application timeline
                          </h4>

                          {/* Progress Timeline theo loại campaign */}
                          {isRecruitment ? (
                            <div
                              className="relative"
                              style={{ height: `${TIMELINE_HEIGHT}px` }}
                            >
                              {(() => {
                                const stageMap = {};
                                const stageIndexMap = {};
                                application.stages.forEach((stage, index) => {
                                  if (stage.templateId) {
                                    stageMap[stage.templateId] = stage;
                                    stageIndexMap[stage.templateId] = index;
                                  }
                                });

                                const timelineStageIds = [
                                  "screening",
                                  "appearance",
                                  "english-listening",
                                  "english-speaking",
                                  "interview",
                                  "final",
                                ];

                                const renderStageInfo = (
                                  stage,
                                  position
                                ) => (
                                  <div
                                    className={`${position === "top" ? "mb-3" : "mt-3"
                                      } w-28 text-center`}
                                  >
                                    <p className="text-xs font-medium text-gray-900">
                                      {getStageName(stage)}
                                    </p>
                                    {stage.date && (
                                      <p className="mt-1 text-xs text-gray-500">
                                        {new Date(
                                          stage.date
                                        ).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                );

                                return (
                                  <>
                                    {/* Horizontal progress line */}
                                    <div
                                      className="absolute bg-gray-200"
                                      style={{
                                        top: `${BASELINE_Y}px`,
                                        left: `${LINE_START_PERCENT}%`,
                                        width: `${LINE_END_PERCENT - LINE_START_PERCENT
                                          }%`,
                                        height: "2px",
                                      }}
                                    >
                                      <div
                                        className="h-full bg-blue-500 transition-all duration-500"
                                        style={{
                                          width: `${getRecruitmentProgressPercentage(
                                            application
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>

                                    {/* Vertical branch for English tests */}
                                    <div
                                      className="absolute bg-gray-200"
                                      style={{
                                        left: `${getAxisPercent(
                                          "english-listening"
                                        )}%`,
                                        top: `${BASELINE_Y - BRANCH_OFFSET}px`,
                                        height: `${BRANCH_OFFSET * 2}px`,
                                        width: "2px",
                                        transform: "translateX(-50%)",
                                      }}
                                    ></div>

                                    {/* Stage nodes */}
                                    {timelineStageIds.map((templateId) => {
                                      const stage = stageMap[templateId];
                                      if (!stage) return null;
                                      const stageIndex = stageIndexMap[templateId];
                                      const stageReached = isStageReached(
                                        stage,
                                        stageIndex,
                                        application.currentStage
                                      );
                                      const infoPosition =
                                        templateId === "english-listening"
                                          ? "top"
                                          : "bottom";

                                      const positionStyle =
                                        getStagePositionStyle(templateId);

                                      return (
                                        <div
                                          key={templateId}
                                          className="absolute flex flex-col items-center"
                                          style={positionStyle}
                                        >
                                          {infoPosition === "top" &&
                                            renderStageInfo(stage, "top")}
                                          <div
                                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${getStageColor(
                                              stage,
                                              application.currentStage,
                                              stageIndex ?? 0
                                            )}`}
                                          >
                                            {getStageIcon(
                                              stage,
                                              application.currentStage,
                                              stageIndex ?? 0
                                            )}
                                          </div>
                                          {infoPosition === "bottom" &&
                                            renderStageInfo(stage, "bottom")}
                                        </div>
                                      );
                                    })}
                                  </>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="relative">
                              {/* Progress Line cho promotion */}
                              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                                <div
                                  className="h-full transition-all duration-500 bg-blue-500"
                                  style={{
                                    width: `${(application.currentStage /
                                      application.stages.length) *
                                      100
                                      }%`,
                                  }}
                                ></div>
                              </div>

                              {/* Stages cho promotion */}
                              <div className="relative flex justify-between">
                                {application.stages.map((stage, index) => (
                                  <div
                                    key={stage.id}
                                    className="flex flex-col items-center"
                                  >
                                    {/* Stage Circle */}
                                    <div
                                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${getStageColor(
                                        stage,
                                        application.currentStage,
                                        index
                                      )}`}
                                    >
                                      {getStageIcon(
                                        stage,
                                        application.currentStage,
                                        index
                                      )}
                                    </div>

                                    {/* Stage Info */}
                                    <div className="mt-3 text-center max-w-24">
                                      <p className="text-xs font-medium text-gray-900">
                                        {getStageName(stage)}
                                      </p>
                                      {stage.date && (
                                        <p className="mt-1 text-xs text-gray-500">
                                          {new Date(
                                            stage.date
                                          ).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Current Status */}
                          {(() => {
                            const currentStage =
                              application.stages[application.currentStage - 1] ||
                              application.stages[0];
                            const stageStatus =
                              getStageStatusForColor(currentStage);
                            return (
                              <div
                                className={`mt-4 p-3 rounded-lg ${getStatusBgColor(
                                  stageStatus
                                )}`}
                              >
                                <p
                                  className={`text-sm ${getStatusTextColor(
                                    stageStatus
                                  )}`}
                                >
                                  <strong>Trạng thái hiện tại:</strong>{" "}
                                  {stageStatus === "rejected"
                                    ? `Not qualified at ${getStageName(
                                      currentStage
                                    )}`
                                    : currentStage?.completed
                                      ? `Completed ${getStageName(currentStage)}`
                                      : `In progress ${getStageName(
                                        currentStage
                                      )}`}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Empty State (if no applications) */}
        {promotionHistory.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow">
            <div className="py-12 text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t("no_applications") || "No applications submitted"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("no_applications_desc") ||
                  "You have not submitted any applications. Start searching for suitable job opportunities."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionHistoryPage;