import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { onLangChange } from "../../../i18n";
import ApplyList from "../../../components/ExaminerComponent/ApplyList";
import {
  getCampaignRoundById,
  getRoundParticipants,
} from "../../../service/api2";

const ExaminerApplyList = () => {
  const [, setLangVersion] = useState(0);
  const [roundFilter, setRoundFilter] = useState("");
  const [applicantStatusFilter, setApplicantStatusFilter] = useState("all");
  const [campaignRoundData, setCampaignRoundData] = useState(null);
  const [availableRounds, setAvailableRounds] = useState([]);
  const [loadingRoundData, setLoadingRoundData] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const campaignRoundId = params.campaignRoundId;
  const campaignId = params.id;
  const isViewingBatch = Boolean(campaignRoundId);

  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  // Đọc roundId từ location.state để set filter khi quay lại từ ScoreListPage
  useEffect(() => {
    const roundIdFromState = location?.state?.roundId;
    if (roundIdFromState && roundIdFromState !== roundFilter) {
      setRoundFilter(roundIdFromState);
      // Clear state sau khi đã sử dụng để tránh set lại khi component re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state?.roundId]);

  // Hàm fetch dữ liệu đợt tuyển - có thể gọi lại khi cần refresh
  const fetchCampaignRoundData = useCallback(async () => {
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
  }, [campaignRoundId]);

  // Gọi API để lấy thông tin đợt tuyển khi đang xem batch
  useEffect(() => {
    fetchCampaignRoundData();
  }, [fetchCampaignRoundData]);

  // Tự động chọn round đầu tiên khi availableRounds được load và roundFilter chưa được set
  useEffect(() => {
    if (availableRounds.length > 0 && !roundFilter && roundFilter !== "final") {
      setRoundFilter(availableRounds[0].roundId);
    }
  }, [availableRounds, roundFilter]);

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

      // Lấy roundId từ roundFilter
      if (roundFilter) {
        roundId = roundFilter;
      } else {
        // Nếu chưa có roundFilter, lấy round đầu tiên từ availableRounds
        if (availableRounds.length > 0) {
          roundId = availableRounds[0].roundId;
        } else {
          // Chưa có rounds, đợi rounds được load
          setParticipants([]);
          return;
        }
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

  const goBackToCampaigns = () => {
    navigate(`/examiner/campaigns/${campaignId}`);
  };

  // Render applicant list view
  return (
    <div>
      {/* Page hero */}
      <div className="text-white bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="px-6 py-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold md:text-3xl">
                Applicant List - {campaignRoundData?.roundName || "N/A"}
              </h1>
              <p className="mt-1 text-sm text-white/90">
                Screen and evaluate applicants for recruitment & promotion
              </p>
            </div>
            <button
              onClick={goBackToCampaigns}
              className="px-4 py-2 transition-colors rounded-lg bg-white/20 hover:bg-white/30"
              aria-label="Back"
              title="Back"
            >
              Back
            </button>
          </div>
        </div>
      </div>
      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Batch Info */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Batch information
          </h3>
          {loadingRoundData ? (
            <div className="py-4 text-center">
              <p className="text-slate-500">Loading batch info...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div>
                <span className="text-sm text-slate-600">Batch name:</span>
                <p className="font-medium text-slate-800">
                  {campaignRoundData?.roundName || "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Start date:</span>
                <p className="font-medium text-slate-800">
                  {campaignRoundData?.startDate || "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">End date:</span>
                <p className="font-medium text-slate-800">
                  {campaignRoundData?.endDate || "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Description:</span>
                <p className="font-medium text-slate-800">
                  {campaignRoundData?.description || "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">
                  Target applicants:
                </span>
                <p className="font-medium text-slate-800">
                  {campaignRoundData
                    ? `${campaignRoundData.actualQuantiy || 0}/${
                        campaignRoundData.targetQuantity || 0
                      } applicants`
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Applicants List */}
        <ApplyList
          campaignRoundId={campaignRoundId}
          campaignId={campaignId}
          batchData={{
            campaignId,
            campaignRoundId,
            roundId: roundFilter,
          }}
          availableRounds={availableRounds}
          loadingRoundData={loadingRoundData}
          participants={participants}
          loadingParticipants={loadingParticipants}
          roundFilter={roundFilter}
          setRoundFilter={setRoundFilter}
          applicantStatusFilter={applicantStatusFilter}
          setApplicantStatusFilter={setApplicantStatusFilter}
          fetchCampaignRoundData={fetchCampaignRoundData}
          onParticipantsUpdate={setParticipants}
          isViewingBatch={isViewingBatch}
        />
      </div>
    </div>
  );
};

export default ExaminerApplyList;
