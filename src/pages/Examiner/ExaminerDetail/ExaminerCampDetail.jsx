import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getCampaignById } from "../../../service/api";
import ExaminerBatchManage from "./ExaminerBatchManage";
import { formatDate } from "../../../config/formatDate";

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-sm text-gray-500 w-36 shrink-0">{label}</div>
    <div className="text-sm text-gray-900">{value}</div>
  </div>
);

const ExaminerCampDetail = ({ campaign }) => {
  const { id } = useParams();
  const { state } = useLocation();
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaignData = async () => {
      // Ưu tiên sử dụng campaign từ props hoặc state
      if (campaign || state?.campaign) {
        const campaignFromProps = campaign || state?.campaign;

        // Log campaign từ props/state
        console.log(
          "DetailInfo - Campaign from props/state:",
          campaignFromProps
        );
        console.log("DetailInfo - Has rounds:", !!campaignFromProps?.rounds);

        // Đảm bảo rounds là array (nếu có) - tạo copy mới để tránh mutate
        let normalizedCampaign = campaignFromProps;
        if (
          campaignFromProps &&
          !Array.isArray(campaignFromProps.rounds) &&
          campaignFromProps.rounds !== null &&
          campaignFromProps.rounds !== undefined
        ) {
          console.warn(
            "DetailInfo - Rounds from props/state is not an array, converting:",
            campaignFromProps.rounds
          );
          normalizedCampaign = {
            ...campaignFromProps,
            rounds: [campaignFromProps.rounds],
          };
        }

        setCampaignData(normalizedCampaign);

        // Nếu rounds đang trống, tiếp tục gọi API theo id để lấy rounds chuẩn theo Swagger
        const effectiveId =
          normalizedCampaign?.campaignId || normalizedCampaign?.id || id;
        if (
          effectiveId &&
          (!Array.isArray(normalizedCampaign.rounds) ||
            normalizedCampaign.rounds.length === 0)
        ) {
          try {
            console.log(
              "DetailInfo - Rounds empty, fetching by id to hydrate:",
              effectiveId
            );
            const result = await getCampaignById(effectiveId);
            if (result.success) {
              let apiData = result.data;
              // Đảm bảo rounds là array
              if (apiData && !Array.isArray(apiData.rounds) && apiData.rounds) {
                apiData = { ...apiData, rounds: [apiData.rounds] };
              }
              // Trộn dữ liệu: giữ thông tin hiện có, ưu tiên rounds từ API
              const merged = {
                ...normalizedCampaign,
                ...apiData,
                rounds: Array.isArray(apiData?.rounds) ? apiData.rounds : [],
              };
              setCampaignData(merged);
            }
          } catch (err) {
            console.warn(
              "DetailInfo - Unable to hydrate rounds from API:",
              err
            );
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
        return;
      }

      // Nếu không có campaign từ props/state, fetch từ API bằng ID
      if (id) {
        try {
          setLoading(true);
          const result = await getCampaignById(id);
          if (result.success) {
            const apiData = result.data;

            // Log API response để debug
            console.log("DetailInfo - API Response:", apiData);
            console.log(
              "DetailInfo - API Response has rounds:",
              !!apiData?.rounds
            );
            if (apiData?.rounds) {
              console.log("DetailInfo - API Rounds:", apiData.rounds);
            }

            // Đảm bảo rounds là array (nếu có) - tạo copy mới để tránh mutate
            let normalizedApiData = apiData;
            if (
              apiData &&
              !Array.isArray(apiData.rounds) &&
              apiData.rounds !== null &&
              apiData.rounds !== undefined
            ) {
              console.warn(
                "DetailInfo - Rounds from API is not an array, converting:",
                apiData.rounds
              );
              normalizedApiData = {
                ...apiData,
                rounds: [apiData.rounds],
              };
            }

            setCampaignData(normalizedApiData);
            setError(null);
          } else {
            setError(result.error || "Không thể tải thông tin chiến dịch");
          }
        } catch (err) {
          console.error("DetailInfo - Error fetching campaign:", err);
          setError(err.message || "Đã xảy ra lỗi khi tải thông tin chiến dịch");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("Không tìm thấy ID chiến dịch");
      }
    };

    fetchCampaignData();
  }, [id, campaign, state?.campaign]);

  // Debug: Log data để kiểm tra (chỉ log một lần khi data thay đổi)
  useEffect(() => {
    if (campaignData) {
      console.log("DetailInfo - Campaign Data:", campaignData);
      console.log("DetailInfo - All keys:", Object.keys(campaignData));
      console.log("DetailInfo - campaignType:", campaignData.campaignType);
      console.log("DetailInfo - targetQuantity:", campaignData.targetQuantity);

      // Log rounds data specifically
      if (campaignData.rounds) {
        console.log("DetailInfo - Rounds found:", campaignData.rounds);
        console.log(
          "DetailInfo - Rounds type:",
          Array.isArray(campaignData.rounds)
            ? "Array"
            : typeof campaignData.rounds
        );
        console.log(
          "DetailInfo - Rounds length:",
          Array.isArray(campaignData.rounds)
            ? campaignData.rounds.length
            : "N/A"
        );
        if (
          Array.isArray(campaignData.rounds) &&
          campaignData.rounds.length > 0
        ) {
          console.log(
            "DetailInfo - First round structure:",
            campaignData.rounds[0]
          );
          console.log(
            "DetailInfo - First round keys:",
            Object.keys(campaignData.rounds[0])
          );
        }
      } else {
        console.log("DetailInfo - No rounds found in campaign data");
      }

      console.log(
        "DetailInfo - Full data structure:",
        JSON.stringify(campaignData, null, 2)
      );
    }
  }, [campaignData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-gray-500">Đang tải thông tin chiến dịch...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-gray-500">Không có dữ liệu chiến dịch</div>
      </div>
    );
  }

  // Normalize và validate rounds data từ API
  const normalizeRoundsData = (campaign) => {
    if (!campaign) return campaign;

    // Nếu đã có rounds và là array, giữ nguyên
    if (campaign.rounds && Array.isArray(campaign.rounds)) {
      // Validate và normalize từng round
      const normalizedRounds = campaign.rounds.map((round, index) => {
        return {
          campaignRoundId: round.campaignRoundId || round.id || index + 1,
          roundName: round.roundName || round.name || `Đợt ${index + 1}`,
          description: round.description || "",
          targetQuantity: round.targetQuantity || round.target || 0,
          actualQuantity: round.actualQuantity || round.actualQuantiy || 0, // Handle typo in API
          status: round.status || "Draft",
          startDate: round.startDate || "",
          endDate: round.endDate || "",
          location: round.location || "",
          method: round.method || "Trực tiếp",
          owner: round.owner || "",
          totalApplicants: round.totalApplicants || 0,
        };
      });

      return {
        ...campaign,
        rounds: normalizedRounds,
      };
    }

    // Nếu không có rounds, trả về campaign với rounds là empty array
    if (!campaign.rounds) {
      return {
        ...campaign,
        rounds: [],
      };
    }

    return campaign;
  };

  const data = normalizeRoundsData(campaignData);

  // Format date từ API (có thể là "11/12/2025 00:00" hoặc ISO string)
  const formatDateFromAPI = (dateString) => {
    if (!dateString) return "";
    // Nếu đã là format "dd/mm/yyyy HH:mm", chỉ lấy phần date
    if (dateString.includes("/")) {
      return dateString.split(" ")[0];
    }
    return formatDate(dateString);
  };

  // Format campaignType để hiển thị - kiểm tra nhiều field name
  const formatCampaignType = (type) => {
    if (!type) return "";
    const typeMap = {
      Promotion: "Thăng bậc",
      Recruitment: "Tuyển dụng",
      Replacement: "Thay thế",
    };
    return typeMap[type] || type;
  };

  // Format targetQuantity để hiển thị - kiểm tra nhiều field name
  const formatTargetQuantity = (quantity) => {
    if (quantity === null || quantity === undefined || quantity === "")
      return "";
    const num = Number(quantity);
    if (isNaN(num)) return String(quantity);
    return num.toLocaleString("vi-VN");
  };

  // Lấy campaignType từ nhiều field name có thể
  // Lưu ý: data từ props/state đã được transform (campaignType → position)
  //        data từ API có format gốc (campaignType)
  const getCampaignType = () => {
    if (!data) return "";

    // Kiểm tra tất cả các field name có thể (bao gồm cả format đã transform)
    const type =
      data.campaignType || // Format gốc từ API
      data.position || // Format đã transform từ Campaign.jsx
      data.campaign_type ||
      data.type ||
      data.campaignTypeName ||
      "";

    return type;
  };

  // Lấy targetQuantity từ nhiều field name có thể
  // Lưu ý: data từ props/state đã được transform (targetQuantity → targetHires)
  //        data từ API có format gốc (targetQuantity)
  const getTargetQuantity = () => {
    if (!data) return "";

    // Kiểm tra tất cả các field name có thể (bao gồm cả format đã transform)
    const quantity =
      data.targetQuantity || // Format gốc từ API
      data.targetHires || // Format đã transform từ Campaign.jsx
      data.target_quantity ||
      data.quantity ||
      data.target ||
      data.targetQty ||
      "";

    return quantity;
  };

  return (
    <div className="w-full h-full p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">
            {data.campaignName || data.name || ""}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {data.description || ""}
          </p>
        </div>
        <button
          onClick={() => navigate("/examiner/campaigns")}
          className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Quay lại
        </button>
      </div>

      {/* Main campaign info card - similar layout to Airline CampaignInfo */}
      <div className="bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="text-sm text-slate-500">Thông tin đề xuất</div>
            <div className="font-semibold text-slate-800">
              {data.partnerName || "N/A"}
            </div>
          </div>
          <div className="text-xs text-right text-slate-500">
            <div>Ngày tạo: {formatDateFromAPI(data.createdAt) || "N/A"}</div>
            <div>Mã số: {data.campaignId || "N/A"}</div>
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-6">
            {/* Overview grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(data?.campaignType?.toLowerCase() === "promotion" ||
                data?.campaignType === "Promotion") && (
                <InfoRow label="Vị trí" value="Chief Flight Attendant" />
              )}
              {(data?.campaignType?.toLowerCase() === "recruitment" ||
                data?.campaignType === "Recruitment") && (
                <InfoRow label="Vị trí" value="Flight Attendant" />
              )}
              <InfoRow
                label="Số lượng tuyển"
                value={formatTargetQuantity(getTargetQuantity())}
              />
              <InfoRow
                label="Ngày bắt đầu"
                value={formatDateFromAPI(data.startDate) || ""}
              />
              <InfoRow
                label="Ngày kết thúc"
                value={formatDateFromAPI(data.endDate) || ""}
              />
            </div>

            {/* Job Description */}
            {data.jobDescription && (
              <div className="mt-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                  📋 Mô tả công việc / Job Description
                </h3>
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div
                    className="text-sm prose-sm prose job-description-content text-slate-700 max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: data.jobDescription || "N/A",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Job Requirements */}
            {data.jobRequirement && (
              <div className="mt-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                  📝 Yêu cầu công việc / Job Requirements
                </h3>
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div
                    className="text-sm prose-sm prose job-requirement-content text-slate-700 max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: data.jobRequirement || "N/A",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Batch Management Section */}
            <div className="mt-6">
              {(() => {
                console.log("DetailInfo - Passing to ExaminerBatchManage:", {
                  campaignId: data.campaignId || data.id,
                  campaignName: data.campaignName || data.name,
                  hasRounds: !!data.rounds,
                  roundsCount: Array.isArray(data.rounds)
                    ? data.rounds.length
                    : 0,
                  rounds: data.rounds,
                });
                return <ExaminerBatchManage campaign={data} />;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ExaminerCampDetail;
