import React, { useEffect, useState } from "react";
import { t, onLangChange } from "../../i18n";
import { getOngoingCampaign } from "../../service/api2";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaClock, FaEllipsisH } from "react-icons/fa";
import Loading from "../../components/Loading";

const PromotionStagesPage = () => {
  const navigate = useNavigate();
  const [langTick, setLangTick] = useState(0);
  useEffect(() => {
    const off = onLangChange(() => setLangTick((v) => v + 1));
    return () => off();
  }, []);

  const [promotionStages, setPromotionStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOngoingPromotion = async () => {
      const friendlyError =
        "Currently, promotion campaign cannot be loaded. Please try again later.";
      try {
        setLoading(true);
        setError(null);

        const result = await getOngoingCampaign();

        if (result.success && result.data) {
          const campaignData = result.data;
          const rounds = campaignData.rounds || [];

          // Kiểm tra xem data có thực sự có giá trị không (không phải empty)
          const hasValidData =
            campaignData.campaignRoundId !== null &&
            campaignData.campaignRoundId !== undefined &&
            campaignData.campaignRoundId !== "";

          // Nếu không có data hợp lệ, hiển thị empty state
          if (!hasValidData && rounds.length === 0) {
            setPromotionStages([]);
            setLoading(false);
            return;
          }

          // Định nghĩa 5 stage cố định
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
                activityId: matchedRound.activityId || null,
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
          let statusText = "Ongoing";
          let statusTextEn = "Ongoing";

          if (campaignData.roundStatus) {
            const roundStatus = campaignData.roundStatus.toLowerCase();
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
              statusText = "Rejected";
              statusTextEn = "Rejected";
            }
          }

          const mappedData = {
            id: campaignData.campaignRoundId || 1,
            position: campaignData.campaignName || "Promotion campaign",
            company: campaignData.airlinePartner || "Airline partner",
            roundName: campaignData.roundName || "",
            airlinePartner: campaignData.airlinePartner || "",
            campaignName: campaignData.campaignName || "",
            participatedDate: campaignData.participatedDate || "",
            status,
            statusText,
            statusTextEn,
            location: campaignData.location || "",
            description: campaignData.description || "",
            currentStage: currentStageIndex || 1,
            stages: mappedStages,
          };

          setPromotionStages([mappedData]);
        } else {
          setPromotionStages([]);
          setError(friendlyError);
        }
      } catch (err) {
        console.error("Error fetching ongoing campaign:", err);
        setPromotionStages([]);
        setError(friendlyError);
      } finally {
        setLoading(false);
      }
    };

    fetchOngoingPromotion();
  }, [langTick]);

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

  const getStatusText = (item) => {
    const lang = localStorage.getItem("lang") || "vi";
    return lang === "vi" ? item.statusText : item.statusTextEn;
  };

  // const getStageName = (stage) => {
  //   const lang = localStorage.getItem("lang") || "vi";
  //   return lang === "vi" ? stage.name : stage.nameEn;
  // };

  const isStageFailed = (stage) => {
    const status = (stage?.status || "").toLowerCase();
    return ["failed", "fail", "rejected", "not passed", "did not pass"].some(
      (keyword) => status.includes(keyword)
    );
  };

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

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {t("promotion_stages")}
          </h1>
          <p className="text-gray-600">
            Track the progress of your promotion through the stages
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Promotion stages
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Track the progress of your promotion through the stages
            </p>
          </div>
          <div className="p-6">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-sm text-gray-600">
                  {t("loading_data") || "Loading data..."}
                </p>
              </div>
            )}

            {error && !loading && (
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No promotion campaign is being processed
                </h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
              </div>
            )}

            {!loading &&
              !error &&
              promotionStages.length > 0 &&
              promotionStages.map((application) => (
                <div
                  key={`stages-${application.id}`}
                  className="mb-8 last:mb-0"
                >
                  <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.campaignName || application.position}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusText(application)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mb-2 text-sm text-gray-600">
                      {application.roundName && (
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
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span className="font-medium">Round:</span>
                          <span>{application.roundName}</span>
                        </div>
                      )}
                      {application.airlinePartner && (
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
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="font-medium">Airline partner:</span>
                          <span>{application.airlinePartner}</span>
                        </div>
                      )}
                    </div>
                    {application.description && (
                      <p className="mb-3 text-sm text-gray-500">
                        {application.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {application.location && (
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
                      )}
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
                        Registered date: {application.participatedDate}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                      <div
                        className="h-full transition-all duration-500 bg-blue-500"
                        style={{
                          width:
                            application.stages.length > 1
                              ? `${((Math.min(
                                Math.max(application.currentStage || 1, 1),
                                application.stages.length
                              ) -
                                1) /
                                (application.stages.length - 1)) *
                              100
                              }%`
                              : "0%",
                        }}
                      ></div>
                    </div>

                    <div className="relative flex justify-between">
                      {application.stages.map((stage, index) => (
                        <div
                          key={stage.id || index}
                          className="flex flex-col items-center"
                        >
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

                          <div className="mt-3 text-center max-w-24">
                            <p className="text-xs font-medium text-gray-900">
                              {stage.name}
                            </p>
                            {stage.date && (
                              <p className="mt-1 text-xs text-gray-500">
                                {new Date(stage.date).toLocaleDateString()}
                              </p>
                            )}
                            {stage.name === "Screening" && stage.activityId && (
                              <button
                                onClick={() =>
                                  navigate(
                                    `/cabin-crew/profile/${stage.activityId}`
                                  )
                                }
                                className="mt-2 text-xs text-blue-600 underline hover:text-blue-800"
                              >
                                View profile
                              </button>
                            )}
                            {stage.name
                              ?.toLowerCase()
                              .includes("interview") &&
                              stage.activityId && (
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/cabin-crew/interview-result/${stage.activityId || stage.roundId || ""
                                      }`
                                    )
                                  }
                                  className="mt-2 text-xs font-semibold text-blue-600 underline hover:text-blue-800"
                                >
                                  {t("view_result")}
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 mt-4 rounded-lg bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-yellow-800">
                        <strong>Current status:</strong>{" "}
                        {application.stages.length > 0 &&
                          application.currentStage > 0 &&
                          application.currentStage <= application.stages.length
                          ? (() => {
                            const currentStageData =
                              application.stages[
                              application.currentStage - 1
                              ];
                            if (currentStageData?.completed) {
                              return `Completed ${currentStageData.name}`;
                            }
                            return `In progress ${currentStageData.name}`;
                          })()
                          : "Pending"}
                      </p>

                      {/* Flight Hours Confirmation Button - show while Flight Hours Confirmation stage is active */}
                      {(() => {
                        const currentStageData =
                          application.stages[application.currentStage - 1];
                        const isFlightHoursStage = currentStageData?.name
                          ?.toLowerCase()
                          .includes("flight hours");
                        if (
                          isFlightHoursStage &&
                          !currentStageData?.completed &&
                          currentStageData?.activityId
                        ) {
                          return (
                            <button
                              onClick={() =>
                                navigate(
                                  `/cabin-crew/profile/${currentStageData.activityId}`
                                )
                              }
                              className="inline-flex items-center px-6 py-3 font-medium text-white transition-all duration-200 rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Update flight hours
                            </button>
                          );
                        }
                        return null;
                      })()}

                      {/* Join Test Button - show while Practical Test stage is active */}
                      {(() => {
                        const currentStageData =
                          application.stages[application.currentStage - 1];
                        const isPracticalStage = currentStageData?.name
                          ?.toLowerCase()
                          .includes("practical");
                        if (isPracticalStage && !currentStageData?.completed) {
                          return (
                            <button
                              onClick={() =>
                                navigate(`/cabin-crew/tests/${application.id}`)
                              }
                              className="inline-flex items-center px-6 py-3 font-medium text-white transition-all duration-200 rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Join test
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              ))}

            {/* Empty State (if no campaigns in progress) */}
            {promotionStages.length === 0 && !loading && !error && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionStagesPage;
