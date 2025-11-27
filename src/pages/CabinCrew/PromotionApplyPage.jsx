import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import { getCampaignDetail } from "../../service/api2";
import { formatDateOnly } from "../../config/formatDate";

const getRoundTime = (start, end) => {
  const startLabel = formatDateOnly(start);
  const endLabel = formatDateOnly(end);
  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`;
  }
  return startLabel || endLabel || "";
};

const mapStatus = (status) => {
  if (!status) return "inactive";
  const normalized = status.toLowerCase();
  if (
    normalized === "approved" ||
    normalized === "active" ||
    normalized === "ongoing"
  ) {
    return "active";
  }
  if (
    normalized === "rejected" ||
    normalized === "ended" ||
    normalized === "completed"
  ) {
    return "inactive";
  }
  return normalized;
};

const mapRoundStatus = (status) => {
  if (!status) return "upcoming";
  const normalized = status.toLowerCase();
  if (normalized === "ended" || normalized === "completed") {
    return "completed";
  }
  if (
    normalized === "ongoing" ||
    normalized === "active" ||
    normalized === "inprogress"
  ) {
    return "ongoing";
  }
  return "upcoming";
};

const mapCampaignData = (apiData = {}, fallbackId) => {
  const rounds = apiData.rounds || apiData.campaignRounds || [];
  return {
    id: apiData.campaignId || apiData.id || fallbackId,
    campaignId: apiData.campaignId || apiData.id || fallbackId,
    name: apiData.campaignName || apiData.name || "",
    airline: apiData.partnerName || apiData.airline || "",
    partnerName: apiData.partnerName || "",
    location: apiData.location || "",
    position: apiData.position || apiData.campaignType || apiData.type || "",
    startDate: apiData.startDate || "",
    endDate: apiData.endDate || "",
    targetHires: apiData.targetQuantity ?? apiData.targetHires ?? 0,
    targetQuantity: apiData.targetQuantity ?? 0,
    status: mapStatus(apiData.status),
    campaignType: apiData.campaignType || "",
    jobDescription: apiData.jobDescription,
    jobRequirement: apiData.jobRequirement,
    batches: Array.isArray(rounds)
      ? rounds.map((round, index) => ({
          campaignRoundId:
            round.campaignRoundId || round.id || round.roundId || index,
          name:
            round.roundName || round.name || round.round || `Đợt ${index + 1}`,
          roundName: round.roundName || round.name || "",
          time: getRoundTime(round.startDate, round.endDate),
          location: round.location || "",
          method: round.method || "Trực tiếp",
          status: mapRoundStatus(round.status),
          owner: round.owner || "",
          description: round.description || "",
          slots: round.targetQuantity || round.slots || 0,
          targetQuantity: round.targetQuantity || 0,
          applied:
            round.actualQuantiy !== undefined
              ? round.actualQuantiy
              : round.applied || 0,
          actualQuantiy: round.actualQuantiy || 0,
          startDate: round.startDate || "",
          endDate: round.endDate || "",
        }))
      : [],
    ...apiData,
  };
};

const isCampaignActive = (data) => {
  if (!data) return false;
  const status = data.status?.toLowerCase();
  if (status === "active" || status === "ongoing" || status === "approved") {
    return true;
  }
  if (
    status === "inactive" ||
    status === "ended" ||
    status === "completed" ||
    status === "rejected"
  ) {
    return false;
  }
  if (Array.isArray(data.batches) && data.batches.length > 0) {
    const hasOngoingRound = data.batches.some((batch) => {
      const batchStatus = batch.status?.toLowerCase();
      return batchStatus === "ongoing" || batchStatus === "active";
    });
    if (hasOngoingRound) {
      return true;
    }
  }
  if (data.startDate && data.endDate) {
    const now = new Date();
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (now >= startDate && now <= endDate) {
      return true;
    }
  }
  return false;
};

const PromotionApplyPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const [campaign, setCampaign] = useState(state?.campaign || null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (state?.campaign) {
      setCampaign(state.campaign);
    }
  }, [state]);

  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCampaignDetail(id);
        if (response.success) {
          setCampaign(mapCampaignData(response.data, id));
        } else {
          setError(
            response.error ||
              "Không thể tải thông tin chiến dịch, vui lòng thử lại."
          );
        }
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải thông tin chiến dịch.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const formatDateLabel = (value) => formatDateOnly(value) || "—";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl px-4 py-8 mx-auto">
        {isLoading ? (
          <div className="p-10 text-center bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-center gap-3">
              <FiLoader className="w-6 h-6 text-indigo-600 animate-spin" />
              <p className="text-gray-600">Đang tải thông tin chiến dịch...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-10 text-center bg-white border border-gray-200 rounded-xl">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Quay lại
            </button>
          </div>
        ) : !campaign ? (
          <div className="p-10 text-center bg-white border border-gray-200 rounded-xl">
            <p className="mb-4 text-gray-600">
              Không tìm thấy thông tin chiến dịch.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Quay lại
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Quay lại
              </button>
            </div>
            <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-200">
                <div>
                  <h1 className="text-2xl font-extrabold md:text-3xl text-slate-800">
                    {campaign.name}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    {campaign.airline || "—"}
                    {campaign.location && ` • ${campaign.location}`}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-1 ${
                    isCampaignActive(campaign)
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {isCampaignActive(campaign) ? "Đang diễn ra" : "Đã kết thúc"}
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                  <Info label="Vị trí" value={"Chief Flight Attendant"} />
                  <Info
                    label="Loại"
                    value={
                      campaign.position ||
                      campaign.campaignType ||
                      campaign.type ||
                      "—"
                    }
                  />
                  <Info
                    label="Hãng hàng không"
                    value={campaign.airline || "—"}
                  />
                  <Info
                    label="Ngày bắt đầu"
                    value={formatDateLabel(campaign.startDate)}
                  />
                  <Info
                    label="Ngày kết thúc"
                    value={formatDateLabel(campaign.endDate)}
                  />
                  <Info
                    label="Chỉ tiêu"
                    value={`${campaign.targetHires ?? "—"}`}
                  />
                </div>

                {campaign.jobDescription && (
                  <div className="mt-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">
                      📋 Mô tả công việc / Job Description
                    </h3>
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div
                        className="job-description-content text-sm text-slate-700 whitespace-pre-line"
                        dangerouslySetInnerHTML={{
                          __html: campaign.jobDescription || "N/A",
                        }}
                      />
                    </div>
                  </div>
                )}

                {campaign.jobRequirement && (
                  <div className="mt-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">
                      📝 Yêu cầu công việc / Job Requirements
                    </h3>
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <div
                        className="job-requirement-content text-sm text-slate-700 whitespace-pre-line"
                        dangerouslySetInnerHTML={{
                          __html: campaign.jobRequirement || "N/A",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Recruitment Process */}
                <div className="mt-6">
                  <h3 className="mb-4 text-lg font-semibold text-slate-800">
                    🔄 Quy trình tuyển dụng / Recruitment Process
                  </h3>
                  <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                              1
                            </span>
                            <span className="text-slate-700">
                              Kiểm tra hồ sơ: Ứng viên chuẩn bị CCCD để đối
                              chiếu và lấy số báo danh
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                              2
                            </span>
                            <span className="text-slate-700">
                              Kiểm tra ngoại hình AI
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                              3
                            </span>
                            <span className="text-slate-700">
                              Cân đo chiều cao và BMI
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                              4
                            </span>
                            <span className="text-slate-700">
                              Thi Catwalk - Phỏng vấn AI
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                              5
                            </span>
                            <span className="text-slate-700">
                              Thi Tài năng (theo nhóm)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                              6
                            </span>
                            <span className="text-slate-700">
                              Phỏng vấn Hội đồng
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Batches (đợt tuyển) - dùng fallback nếu không có */}
                <div className="mt-6">
                  <div className="mb-2 text-sm text-slate-600">
                    Kế hoạch các đợt tuyển
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {(Array.isArray(campaign.batches) && campaign.batches.length
                      ? campaign.batches
                      : [
                          {
                            name: "Đợt 1",
                            time: `${campaign.startDate || "2025-10-01"} - ${
                              campaign.endDate || "2025-10-15"
                            }`,
                            location: campaign.location || "Hà Nội",
                            method: "Trực tiếp",
                            status: "completed",
                            owner: "HR Team A",
                            description:
                              "Tuyển dụng trực tiếp tại văn phòng Hà Nội",
                            slots: 50,
                            applied: 45,
                          },
                          {
                            name: "Đợt 2",
                            time: "2025-11-01 - 2025-11-20",
                            location: "TP.HCM",
                            method: "Trực tiếp + Online",
                            status: "ongoing",
                            owner: "HR Team B",
                            description:
                              "Tuyển dụng kết hợp trực tiếp và online tại TP.HCM",
                            slots: 80,
                            applied: 32,
                          },
                          {
                            name: "Đợt 3",
                            time: "2025-12-01 - 2025-12-15",
                            location: "Đà Nẵng",
                            method: "Online",
                            status: "upcoming",
                            owner: "HR Team C",
                            description:
                              "Tuyển dụng online cho khu vực miền Trung",
                            slots: 30,
                            applied: 0,
                          },
                        ]
                    ).map((b, i) => (
                      <div
                        key={i}
                        className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                          <div className="text-sm font-semibold text-slate-800">
                            {b.name}
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              b.status === "completed"
                                ? "bg-red-100 text-red-700"
                                : b.status === "ongoing"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {b.status === "completed"
                              ? "Đã hoàn thành"
                              : b.status === "ongoing"
                              ? "Đang diễn ra"
                              : "Sắp diễn ra"}
                          </span>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                            <InfoMini label="Thời gian" value={b.time || "—"} />
                            <InfoMini
                              label="Địa điểm"
                              value={b.location || "—"}
                            />
                            <InfoMini
                              label="Hình thức"
                              value={b.method || "—"}
                            />
                            {b.owner && (
                              <InfoMini label="Phụ trách" value={b.owner} />
                            )}
                            {b.slots && (
                              <InfoMini
                                label="Số lượng tuyển"
                                value={`${b.slots} người`}
                              />
                            )}
                            {b.applied !== undefined && (
                              <InfoMini
                                label="Đã ứng tuyển"
                                value={`${b.applied} người`}
                              />
                            )}
                          </div>
                          {b.description && (
                            <div className="text-xs">
                              <div className="mb-1 text-slate-500">Mô tả</div>
                              <div className="p-2 border rounded text-slate-700 bg-slate-50">
                                {b.description}
                              </div>
                            </div>
                          )}
                          {b.slots && b.applied !== undefined && (
                            <div className="text-xs">
                              <div className="mb-1 text-slate-500">
                                Tiến độ ứng tuyển
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      (b.applied / b.slots) * 100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="mt-1 text-slate-600">
                                {b.applied}/{b.slots} (
                                {Math.round((b.applied / b.slots) * 100)}%)
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-end px-4 pt-0 pb-4">
                          {b.status === "ongoing" && (
                            <button
                              onClick={() =>
                                navigate("/application-form", {
                                  state: { campaign: campaign, batch: b },
                                })
                              }
                              className="px-5 py-2.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
                            >
                              Ứng tuyển ngay
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <div className="text-sm text-slate-600">{label}</div>
    <div className="font-medium text-slate-800">{value}</div>
  </div>
);

const InfoMini = ({ label, value }) => (
  <div>
    <div className="text-slate-500">{label}</div>
    <div className="font-medium text-slate-800">{value}</div>
  </div>
);

export default PromotionApplyPage;
