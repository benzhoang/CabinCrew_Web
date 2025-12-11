import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { t, onLangChange } from "../../i18n";
import { FaCheck, FaClock, FaEllipsisH } from "react-icons/fa";
import { getPromotionHistory } from "../../service/api2";

// Định nghĩa 5 stage cố định (giống PromotionStagesPage)
const hardcodedStages = [
  {
    id: 1,
    name: "Screening",
    nameEn: "Screening",
    keywords: ["screening", "sàng lọc"],
  },
  {
    id: 2,
    name: "Flight Hours Confirmation",
    nameEn: "Flight Hours Confirmation",
    keywords: ["flight hours", "giờ bay", "confirmation", "xác nhận"],
  },
  {
    id: 3,
    name: "Practical Test",
    nameEn: "Practical Test",
    keywords: ["practical", "thực hành", "test"],
  },
  {
    id: 4,
    name: "Interview",
    nameEn: "Interview",
    keywords: ["interview", "phỏng vấn"],
  },
  {
    id: 5,
    name: "Final",
    nameEn: "Final",
    keywords: ["final", "cuối cùng", "kết thúc"],
  },
];

const PromotionHistoryPage = () => {
  const navigate = useNavigate();
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

            // Map rounds từ API vào các stage cố định
            const mappedStages = hardcodedStages.map((hardcodedStage) => {
              // Tìm round tương ứng từ API
              const matchedRound = rounds.find((round) => {
                const roundName = (round.roundName || "").toLowerCase();
                return hardcodedStage.keywords.some((keyword) =>
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
                  id: hardcodedStage.id,
                  roundId: matchedRound.roundId || matchedRound.id,
                  name: hardcodedStage.name,
                  nameEn: hardcodedStage.nameEn,
                  completed: isCompleted,
                  date: matchedRound.date || null,
                  status: matchedRound.status || "",
                };
              } else {
                // Stage chưa có trong API, hiển thị màu xám
                return {
                  id: hardcodedStage.id,
                  roundId: null,
                  name: hardcodedStage.name,
                  nameEn: hardcodedStage.nameEn,
                  completed: false,
                  date: null,
                  status: "Pending",
                };
              }
            });

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
              {promotionHistory.map((application) => (
                <div
                  key={application.id}
                  className="p-6 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.position}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {getStatusText(application)}
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-gray-600">
                        {application.company}
                      </p>
                      <p className="mb-3 text-sm text-gray-500">
                        {application.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {application.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
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
                          {t("applied_on")}:{" "}
                          {new Date(
                            application.appliedDate
                          ).toLocaleDateString()}
                        </div>
                      </div>
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

                        {/* Progress Timeline */}
                        <div className="relative">
                          {/* Progress Line */}
                          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                            <div
                              className="h-full transition-all duration-500 bg-blue-500"
                              style={{
                                width: `${
                                  (application.currentStage /
                                    application.stages.length) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>

                          {/* Stages */}
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
                                  : `In progress ${getStageName(currentStage)}`}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                </div>
              ))}
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
              <div className="mt-6">
                <button
                  onClick={() => navigate("/cabin-crew/promotion")}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                >
                  {t("browse_jobs") || "Browse jobs"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionHistoryPage;
