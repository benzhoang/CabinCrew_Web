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
      try {
        setLoading(true);
        setError(null);

        const result = await getOngoingCampaign();

        if (result.success && result.data) {
          const campaignData = result.data;
          const rounds = campaignData.rounds || [];

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
              const status = matchedRound.status?.toLowerCase() || "";
              const isCompleted =
                status === "completed" ||
                status === "passed" ||
                status === "finished";
              const isActive =
                status === "in progress" ||
                status === "ongoing" ||
                status === "active";

              return {
                id: hardcodedStage.id,
                roundId: matchedRound.roundId || matchedRound.id,
                name: hardcodedStage.name,
                nameEn: hardcodedStage.nameEn,
                completed: isCompleted,
                active: isActive,
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
                active: false,
                date: null,
                status: "pending",
              };
            }
          });

          // Xác định currentStage dựa trên stage đã hoàn thành hoặc đang active
          const completedCount = mappedStages.filter(
            (stage) => stage.completed
          ).length;

          // Tìm stage đang active
          const activeStageIndex = mappedStages.findIndex(
            (stage) => stage.active && !stage.completed
          );

          let currentStageIndex;
          if (activeStageIndex !== -1) {
            currentStageIndex = activeStageIndex + 1;
          } else {
            currentStageIndex = completedCount + 1;
          }

          if (currentStageIndex > mappedStages.length) {
            currentStageIndex = mappedStages.length;
          }
          if (currentStageIndex < 1) {
            currentStageIndex = 1;
          }

          let status = "pending";
          let statusText = "Đang xem xét";
          let statusTextEn = "Under Review";

          if (campaignData.roundStatus) {
            const roundStatus = campaignData.roundStatus.toLowerCase();
            if (
              roundStatus.includes("completed") ||
              roundStatus.includes("passed") ||
              roundStatus.includes("finished")
            ) {
              status = "accepted";
              statusText = "Đã hoàn thành";
              statusTextEn = "Completed";
            } else if (
              roundStatus.includes("rejected") ||
              roundStatus.includes("failed")
            ) {
              status = "rejected";
              statusText = "Đã từ chối";
              statusTextEn = "Rejected";
            }
          }

          const mappedData = {
            id: campaignData.campaignRoundId || 1,
            position: campaignData.campaignName || "Chiến dịch nâng bậc",
            company: campaignData.airlinePartner || "Đối tác hàng không",
            roundName: campaignData.roundName || "",
            airlinePartner: campaignData.airlinePartner || "",
            campaignName: campaignData.campaignName || "",
            appliedDate: new Date().toISOString().split("T")[0],
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
          setError(
            result.error || "Không có chiến dịch nâng bậc đang được xử lý"
          );
        }
      } catch (err) {
        console.error("Error fetching ongoing campaign:", err);
        setPromotionStages([]);
        setError("Đã xảy ra lỗi khi tải dữ liệu");
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

  const getStageColor = (stage, currentStage, stageIndex) => {
    if (stage.completed) {
      return "bg-green-500 text-white";
    } else if (stage.active || stageIndex + 1 === currentStage) {
      return "bg-yellow-500 text-white";
    } else {
      return "bg-gray-300 text-gray-600";
    }
  };

  const getStageIcon = (stage, currentStage, stageIndex) => {
    if (stage.completed) {
      return <FaCheck className="w-4 h-4" />;
    } else if (stage.active || stageIndex + 1 === currentStage) {
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
            Theo dõi tiến trình nâng bậc của bạn qua các giai đoạn
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Tiến trình nâng bậc
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Theo dõi tiến trình nâng bậc của bạn
            </p>
          </div>
          <div className="p-6">
            {loading && <Loading message="Đang tải dữ liệu..." />}

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
                  Không có chiến dịch nâng bậc đang xử lý
                </h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
              </div>
            )}

            {!loading &&
              !error &&
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
                          <span className="font-medium">Đợt tuyển:</span>
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
                          <span className="font-medium">Đối tác:</span>
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
                        Ngày đăng ký:{" "}
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                      <div
                        className="h-full transition-all duration-500 bg-blue-500"
                        style={{
                          width:
                            application.stages.length > 0
                              ? `${
                                  (application.stages.filter((s) => s.completed)
                                    .length /
                                    application.stages.length) *
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 mt-4 rounded-lg bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-yellow-800">
                        <strong>Trạng thái hiện tại:</strong>{" "}
                        {application.stages.length > 0 &&
                        application.currentStage > 0 &&
                        application.currentStage <= application.stages.length
                          ? (() => {
                              const currentStageData =
                                application.stages[
                                  application.currentStage - 1
                                ];
                              if (currentStageData?.completed) {
                                return `Hoàn thành ${currentStageData.name}`;
                              }
                              return `Đang trong giai đoạn ${currentStageData.name}`;
                            })()
                          : "Đang chờ xử lý"}
                      </p>

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
                              Tham gia kiểm tra
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {!loading && !error && promotionStages.length === 0 && (
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
              Chưa có đơn nâng bậc
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Bạn chưa có đơn nâng bậc nào để theo dõi tiến trình
            </p>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
                Khám phá cơ hội
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionStagesPage;
