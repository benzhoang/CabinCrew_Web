import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { onLangChange } from "../../i18n";
import { getCampaignRoundById, getRoundParticipants } from "../../service/api";

const AdminApplyListPage = () => {
  const [campaigns] = useState([]);
  const [, setFilteredCampaigns] = useState([]);
  const [searchTerm] = useState("");
  const [statusFilter] = useState("active");
  const [departmentFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState(null);
  const [applicantSearchTerm, setApplicantSearchTerm] = useState("");
  const [, setLangVersion] = useState(0);
  const [campaignRoundData, setCampaignRoundData] = useState(null);
  const [availableRounds, setAvailableRounds] = useState([]);
  const [loadingRoundData, setLoadingRoundData] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Check if we're viewing a specific batch
  const batchData = location.state;
  // Nếu có campaignRoundId trong URL params, đang xem batch cụ thể
  const isViewingBatch =
    params.campaignRoundId ||
    (batchData && batchData.batchName && batchData.campaignId);

  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  // Gọi API để lấy thông tin đợt tuyển khi đang xem batch
  useEffect(() => {
    const fetchCampaignRoundData = async () => {
      if (!isViewingBatch) {
        setCampaignRoundData(null);
        setAvailableRounds([]);
        return;
      }

      // Ưu tiên lấy campaignRoundId từ URL params (campaignRoundId)
      // Nếu không có thì lấy từ batchData
      const campaignRoundId =
        params.campaignRoundId ||
        batchData?.batch?.id ||
        batchData?.batch?.campaignRoundId ||
        batchData?.campaignRoundId;

      if (!campaignRoundId) {
        console.warn("CampaignRoundId not found");
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
          console.error(
            "Error when fetching campaign round data:",
            result.error
          );
        }
      } catch (error) {
        console.error("Error when calling API getCampaignRoundById:", error);
      } finally {
        setLoadingRoundData(false);
      }
    };

    fetchCampaignRoundData();
  }, [isViewingBatch, params.campaignRoundId, batchData]);

  // Tự động chọn round "Screening" khi availableRounds được load
  useEffect(() => {
    if (availableRounds.length > 0 && !roundFilter) {
      // Tìm round có tên "Screening" (case-insensitive)
      const screeningRound = availableRounds.find(
        (round) =>
          round.roundName?.toLowerCase() === "screening" ||
          round.name?.toLowerCase() === "screening"
      );

      if (screeningRound) {
        const roundId = screeningRound.roundId || screeningRound.id;
        setRoundFilter(String(roundId));
      } else if (availableRounds.length > 0) {
        // Nếu không tìm thấy "Screening", chọn round đầu tiên
        const roundId = availableRounds[0].roundId || availableRounds[0].id;
        setRoundFilter(String(roundId));
      }
    }
  }, [availableRounds, roundFilter]);

  // Gọi API để lấy danh sách participants theo roundId cụ thể
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!isViewingBatch) {
        setParticipants([]);
        return;
      }

      // Nếu chọn "final" hoặc chưa có roundFilter, không gọi API
      if (roundFilter === "final" || !roundFilter) {
        setParticipants([]);
        return;
      }

      // Lấy roundId từ roundFilter
      const roundId = roundFilter;

      // Kiểm tra roundId hợp lệ
      if (!roundId || roundId === "final") {
        setParticipants([]);
        return;
      }

      setLoadingParticipants(true);
      try {
        // Gọi API cho round cụ thể
        const result = await getRoundParticipants(roundId);
        if (result.success && result.data && Array.isArray(result.data)) {
          // Map dữ liệu từ API sang format hiển thị
          const mappedParticipants = result.data.map((participant) => ({
            id: participant.userId || participant.activityId,
            activityId: participant.activityId || 0,
            userId: participant.userId || 0,
            name: participant.fullName || "No full name",
            email: participant.email || "No email",
            phone: participant.phoneNumber || "No phone number",
            photo: participant.imgURL || "No photo",
            status: participant.status || "pending",
            roundId: participant.roundId || 0,
            roundName: participant.roundName || "No round name",
            appliedDate:
              participant.appliedDate || new Date().toISOString().split("T")[0],
            education: participant.education || "No education",
          }));
          setParticipants(mappedParticipants);
        } else {
          console.error(
            "Error when fetching applicant list:",
            result.error || "Invalid data"
          );
          setParticipants([]);
        }
      } catch (error) {
        console.error("Error when calling API getRoundParticipants:", error);
        setParticipants([]);
      } finally {
        setLoadingParticipants(false);
      }
    };

    fetchParticipants();
  }, [isViewingBatch, roundFilter, availableRounds]);

  useEffect(() => {
    let filtered = campaigns;

    // Mặc định chỉ xem campaign đang hoạt động trên Screening
    filtered = filtered.filter((c) => c.status === "active");

    if (searchTerm) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (campaign) => campaign.status === statusFilter
      );
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (campaign) => campaign.department === departmentFilter
      );
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchTerm, statusFilter, departmentFilter]);

  // const getStatusBadge = (status) => {
  //   const statusConfig = {
  //     active: { color: 'bg-green-100 text-green-800', text: 'Đang hoạt động' },
  //     completed: { color: 'bg-blue-100 text-blue-800', text: 'Hoàn thành' },
  //     paused: { color: 'bg-yellow-100 text-yellow-800', text: 'Tạm dừng' }
  //   }
  //   const config = statusConfig[status] || statusConfig.active
  //   return (
  //     <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
  //       {config.text}
  //     </span>
  //   )
  // }

  // const percent = (current, target) => {
  //   if (!target || target <= 0) return 0
  //   const p = Math.round((Number(current || 0) / Number(target)) * 100)
  //   return Math.max(0, Math.min(100, p))
  // }

  // const getBatchStatusCfg = (status) => {
  //   const map = {
  //     ongoing: { text: 'Đang diễn ra', color: 'bg-green-100 text-green-700' },
  //     completed: { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-700' },
  //     planned: { text: 'Đã lên kế hoạch', color: 'bg-slate-100 text-slate-700' },
  //     upcoming: { text: 'Sắp diễn ra', color: 'bg-yellow-100 text-yellow-800' },
  //     paused: { text: 'Tạm dừng', color: 'bg-orange-100 text-orange-700' },
  //     cancelled: { text: 'Hủy', color: 'bg-red-100 text-red-700' },
  //   }
  //   return map[status] || map.planned
  // }

  // const buildBatches = (campaign) => {
  //   // Lấy thông tin giống DetailInfo.jsx khi thiếu dữ liệu
  //   if (Array.isArray(campaign?.batches) && campaign.batches.length) return campaign.batches
  //   const current = Number(campaign?.currentHires ?? 0)
  //   const target = campaign?.targetHires
  //   return [
  //     { name: 'Đợt 1', time: `${campaign?.startDate || '—'} - ${campaign?.endDate || '—'}`, location: '—', method: 'Trực tiếp', owner: '—', status: 'ongoing', current, target, note: 'Phỏng vấn vòng 1' },
  //   ]
  // }

  // // Tổng quan để làm header metrics
  // const overview = useMemo(() => {
  //   const list = filteredCampaigns
  //     .map(c => ({ ...c, batches: buildBatches(c).filter(b => b.status === 'ongoing') }))
  //     .filter(c => c.batches.length > 0)
  //   const totalCampaigns = list.length
  //   const totalBatches = list.reduce((acc, c) => acc + c.batches.length, 0)
  //   const totalApplicants = list.reduce((acc, c) => acc + c.batches.reduce((s, b) => s + Number(b.current || 0), 0), 0)
  //   return { totalCampaigns, totalBatches, totalApplicants }
  // }, [filteredCampaigns])

  // Filter applicants for specific batch
  const filteredApplicants = useMemo(() => {
    if (!isViewingBatch) return [];

    // Chỉ sử dụng participants từ API, không dùng mock data
    let list = [...participants];

    // Filter theo roundFilter (nếu có)
    if (roundFilter === "final") {
      // Lọc theo kết quả cuối cùng: đã có quyết định cuối (đã duyệt hoặc từ chối)
      list = list.filter(
        (a) => a.status === "approved" || a.status === "rejected"
      );
    } else if (roundFilter) {
      // Filter theo roundId được chọn (đảm bảo chỉ hiển thị participants của round đã chọn)
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
    roundFilter,
    availableRounds,
    participants,
    applicantSearchTerm,
  ]);

  // const getRoundText = (rounds) => {
  //   const map = {
  //     screening: 'Vòng sàng lọc',
  //     grooming: 'Vòng grooming',
  //     test: 'Vòng kiểm tra',
  //     interview: 'Vòng phỏng vấn'
  //   }
  //   return map[rounds] || 'Vòng sàng lọc'
  // }

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
          Final result
        </span>
      );
    }

    // Fallback mặc định nếu không tìm thấy
    return (
      <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
        {round || "Not determined"}
      </span>
    );
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

  // const handleStatusChange = (applicantId, newStatus) => {
  //   // Handle status change logic here
  //   console.log(`Changing status of applicant ${applicantId} to ${newStatus}`)
  // }

  const goBackToCampaigns = () => {
    const campaignId = params.id || campaignRoundData?.campaignId;
    navigate(`/admin/campaigns/${campaignId}`);
  };

  if (isViewingBatch) {
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
                  Applicant list -{" "}
                  {campaignRoundData?.roundName ||
                    batchData?.batchName ||
                    "Recruitment batch"}
                </h1>
                <p className="mt-1 text-sm text-white/90">
                  Filter and evaluate applicants for the recruitment batch
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 mx-auto max-w-7xl">
          {/* Batch Info */}
          <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              Recruitment batch information
            </h3>
            {loadingRoundData ? (
              <div className="py-8 text-center">
                <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-gray-600">
                  Loading campaign list...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div>
                  <span className="text-sm text-slate-600">Name:</span>
                  <p className="font-medium text-slate-800">
                    {campaignRoundData?.roundName ||
                      batchData?.batchName ||
                      "No round name"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Start date:</span>
                  <p className="font-medium text-slate-800">
                    {campaignRoundData?.startDate ||
                      batchData.batch?.time?.split(" - ")[0] ||
                      "No start date"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">End date:</span>
                  <p className="font-medium text-slate-800">
                    {campaignRoundData?.endDate ||
                      batchData.batch?.time?.split(" - ")[1] ||
                      "No end date"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Description:</span>
                  <p className="font-medium text-slate-800">
                    {campaignRoundData?.description || "No description"}
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
                      : `${batchData.batch?.current || 0}/${
                          batchData.batch?.target || 0
                        } applicants`}
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
                  Applicant list ({filteredApplicants.length})
                </h3>
                <div className="flex items-center w-full gap-3 md:w-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Round:</label>
                    <select
                      className="px-3 py-2 text-sm border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={roundFilter || ""}
                      onChange={(e) => setRoundFilter(e.target.value)}
                      disabled={loadingRoundData}
                    >
                      {loadingRoundData ? (
                        <option value="" disabled>
                          Loading...
                        </option>
                      ) : availableRounds.length > 0 ? (
                        availableRounds.map((round) => (
                          <option
                            key={round.roundId}
                            value={String(round.roundId)}
                          >
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
                <div className="py-8 text-center">
                  <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  <p className="mt-4 text-sm text-gray-600">
                    Loading campaign list...
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                        Photo 4x6
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
                        Action
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
                          {applicant.appliedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getApplicantStatusBadge(applicant.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoundBadge(
                            applicant.roundId ||
                              applicant.roundName ||
                              applicant.round,
                            applicant
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                          <button
                            className="p-1 text-blue-600 transition-colors rounded hover:text-blue-900 hover:bg-blue-50"
                            title="View details"
                            onClick={() => {
                              // Lấy thông tin round từ roundFilter hoặc từ applicant
                              const roundFromFilter =
                                roundFilter === "final"
                                  ? { roundId: "final", roundName: "Final" }
                                  : availableRounds.find(
                                      (r) =>
                                        String(r.roundId) ===
                                        String(roundFilter)
                                    ) ||
                                    (availableRounds.length > 0
                                      ? availableRounds[0]
                                      : null);

                              const stageId =
                                mapRoundToStageId(roundFromFilter, applicant) ||
                                mapRoundToStageId(
                                  { roundName: applicant?.roundName },
                                  applicant
                                ) ||
                                "screening";

                              navigate(
                                `/admin/campaigns/candidate/${applicant.activityId}`,
                                {
                                  state: {
                                    candidate: applicant,
                                    batchData: batchData,
                                    viewingRound: {
                                      stageId,
                                      roundId:
                                        roundFromFilter?.roundId ||
                                        roundFilter ||
                                        applicant?.roundId,
                                      roundName:
                                        roundFromFilter?.roundName ||
                                        applicant?.roundName ||
                                        "",
                                    },
                                  },
                                }
                              );
                            }}
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
            </div>

            {!loadingParticipants && filteredApplicants.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-slate-500">No applicant for this round</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default AdminApplyListPage;
