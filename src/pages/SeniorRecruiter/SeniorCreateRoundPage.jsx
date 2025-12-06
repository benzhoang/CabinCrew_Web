import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import {
  getCampaignDetail,
  getCampaignRoundById,
  updateRoundDates,
} from "../../service/api2";
import Loading from "../../components/Loading";

const SeniorCreateRoundPage = () => {
  const { id: campaignId } = useParams();
  //const todayString = new Date().toISOString().split("T")[0];

  // Hàm format date từ "DD/MM/YYYY HH:mm" sang "YYYY-MM-DD"
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      // Format: "DD/MM/YYYY HH:mm" -> "YYYY-MM-DD"
      const parts = dateString.split(" ");
      if (parts.length > 0) {
        const datePart = parts[0]; // "DD/MM/YYYY"
        const [day, month, year] = datePart.split("/");
        if (day && month && year) {
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }
      return "";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const [formData, setFormData] = useState({
    campaignName: "",
    targetQuantity: "",
    startDate: "",
    endDate: "",
    description: "",
    requirements: "",
    jobDescription: "",
    jobRequirement: "",
    rounds: [
      {
        roundName: "Đợt 1",
        roundStartDate: "",
        roundEndDate: "",
        targetQuantity: "",
        description: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [detailError, setDetailError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roundsData, setRoundsData] = useState([]); // State để lưu rounds data cho UI mới
  const navigate = useNavigate();
  const isRequestDataLocked = Boolean(campaignDetail);

  useEffect(() => {
    let isMounted = true;

    const fetchCampaignDetail = async () => {
      if (!campaignId) {
        setIsLoadingDetail(false);
        return;
      }

      setIsLoadingDetail(true);
      setDetailError(null);

      try {
        const result = await getCampaignDetail(campaignId);

        if (!isMounted) return;

        if (result.success && result.data) {
          const detailData = result.data;
          setCampaignDetail(detailData);

          console.log("CampaignDetail data:", detailData);
          console.log("Rounds in campaignDetail:", detailData.rounds);

          // Format dates từ API
          const formattedStartDate = formatDateForInput(detailData.startDate);
          const formattedEndDate = formatDateForInput(detailData.endDate);

          // Xử lý rounds từ getCampaignDetail
          let formattedRounds = [];
          if (
            detailData.rounds &&
            Array.isArray(detailData.rounds) &&
            detailData.rounds.length > 0
          ) {
            formattedRounds = detailData.rounds.map((round) => {
              console.log("Processing round:", round);
              console.log("campaignRoundId:", round.campaignRoundId);
              return {
                campaignRoundId: round.campaignRoundId || null,
                roundName: round.roundName || "",
                roundStartDate: formatDateForInput(round.startDate),
                roundEndDate: formatDateForInput(round.endDate),
                targetQuantity:
                  round.targetQuantity !== undefined &&
                  round.targetQuantity !== null
                    ? String(round.targetQuantity)
                    : "",
                description: round.description || "",
              };
            });
            console.log("Formatted rounds:", formattedRounds);
            console.log(
              "campaignRoundIds in formattedRounds:",
              formattedRounds.map((r) => r.campaignRoundId)
            );

            // Cập nhật roundsData cho UI mới
            const roundsForDateUI = detailData.rounds.map((round) => ({
              roundId: round.campaignRoundId || round.roundId || round.id,
              roundName: round.roundName || "",
              campaignRoundId: round.campaignRoundId,
              dotName: round.roundName || `Đợt ${round.campaignRoundId || ""}`,
              startDate: formatDateForInput(round.startDate),
              endDate: formatDateForInput(round.endDate),
            }));
            setRoundsData(roundsForDateUI);
            console.log(
              "Set roundsData from getCampaignDetail:",
              roundsForDateUI
            );
          }

          setFormData((prev) => ({
            ...prev,
            campaignName: detailData.campaignName || "",
            targetQuantity:
              detailData.targetQuantity !== undefined &&
              detailData.targetQuantity !== null
                ? String(detailData.targetQuantity)
                : "",
            description: detailData.description || "",
            jobDescription: detailData.jobDescription || "",
            jobRequirement: detailData.jobRequirement || "",
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            rounds: formattedRounds.length > 0 ? formattedRounds : prev.rounds,
          }));
        } else {
          setDetailError(result.error || "Không thể tải chi tiết yêu cầu");
        }
      } catch (error) {
        if (!isMounted) return;
        setDetailError(error.message || "Không thể tải chi tiết yêu cầu");
      } finally {
        if (isMounted) {
          setIsLoadingDetail(false);
        }
      }
    };

    fetchCampaignDetail();

    return () => {
      isMounted = false;
    };
  }, [campaignId]);

  // Fetch rounds từ campaignRoundId để lấy mảng rounds như trong hình
  useEffect(() => {
    let isMounted = true;

    const fetchRoundsFromCampaignRoundIds = async () => {
      if (!campaignId || !campaignDetail || !formData.rounds) return;

      // Lấy tất cả campaignRoundId từ formData.rounds
      const campaignRoundIds = formData.rounds
        .map((round) => round.campaignRoundId)
        .filter((id) => id !== null && id !== undefined);

      if (campaignRoundIds.length === 0) {
        console.log("No campaignRoundIds found in formData.rounds");
        return;
      }

      console.log("Fetching rounds for campaignRoundIds:", campaignRoundIds);

      try {
        // Gọi API cho từng campaignRoundId và lấy mảng rounds
        const allRoundsPromises = campaignRoundIds.map(
          async (campaignRoundId) => {
            try {
              const result = await getCampaignRoundById(campaignRoundId);
              if (result.success && result.data) {
                const roundsData = result.data;
                let roundsArray = [];

                // Xử lý response - có thể là array trực tiếp hoặc object có property rounds
                if (Array.isArray(roundsData)) {
                  roundsArray = roundsData;
                } else if (
                  roundsData.rounds &&
                  Array.isArray(roundsData.rounds)
                ) {
                  roundsArray = roundsData.rounds;
                } else if (roundsData && typeof roundsData === "object") {
                  roundsArray = roundsData.rounds || [];
                }

                console.log(
                  `Fetched rounds for campaignRoundId ${campaignRoundId}:`,
                  roundsArray
                );

                return {
                  campaignRoundId,
                  rounds: roundsArray,
                };
              }
              return { campaignRoundId, rounds: [] };
            } catch (error) {
              console.error(
                `Error fetching rounds for campaignRoundId ${campaignRoundId}:`,
                error
              );
              return { campaignRoundId, rounds: [] };
            }
          }
        );

        const allRoundsResults = await Promise.all(allRoundsPromises);

        if (!isMounted) return;

        // Gộp tất cả rounds từ các campaignRoundId và thêm thông tin đợt
        const allRounds = [];
        allRoundsResults.forEach((result) => {
          if (result.rounds && Array.isArray(result.rounds)) {
            // Tìm thông tin đợt từ formData.rounds
            const campaignRoundInfo = formData.rounds.find(
              (r) => r.campaignRoundId === result.campaignRoundId
            );
            const dotName =
              campaignRoundInfo?.roundName || `Đợt ${result.campaignRoundId}`;

            // Thêm thông tin đợt vào mỗi round
            result.rounds.forEach((round) => {
              allRounds.push({
                ...round,
                campaignRoundId: result.campaignRoundId,
                dotName: dotName,
              });
            });
          }
        });

        console.log("All fetched rounds with dot info:", allRounds);

        // Cập nhật roundsData cho UI với rounds từ API
        if (allRounds.length > 0) {
          const roundsForDateUI = allRounds.map((round) => ({
            roundId: round.roundId || round.id,
            roundName: round.roundName || "",
            campaignRoundId: round.campaignRoundId,
            dotName: round.dotName || "",
            startDate: formatDateForInput(round.startDate),
            endDate: formatDateForInput(round.endDate),
          }));

          setRoundsData(roundsForDateUI);
          console.log("Set roundsData from campaignRoundIds:", roundsForDateUI);
        }
      } catch (error) {
        console.error("Error fetching rounds from campaignRoundIds:", error);
      }
    };

    // Chỉ fetch khi đã có campaignRoundIds trong formData.rounds
    if (
      formData.rounds &&
      formData.rounds.length > 0 &&
      formData.rounds.some((round) => round.campaignRoundId)
    ) {
      fetchRoundsFromCampaignRoundIds();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.rounds, campaignDetail]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleEditorChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleRoundChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedRounds = prev.rounds.map((round, i) => {
        if (i === index) {
          const updatedRound = { ...round, [field]: value };

          // Nếu thay đổi roundStartDate, đảm bảo roundEndDate >= roundStartDate
          if (field === "roundStartDate" && updatedRound.roundEndDate) {
            if (updatedRound.roundEndDate < value) {
              updatedRound.roundEndDate = value;
            }
          }

          // Nếu thay đổi roundEndDate, đảm bảo roundEndDate >= roundStartDate
          if (field === "roundEndDate" && updatedRound.roundStartDate) {
            if (value < updatedRound.roundStartDate) {
              updatedRound.roundStartDate = value;
            }
          }

          return updatedRound;
        }
        return round;
      });

      // Nếu thay đổi roundEndDate của đợt trước, cập nhật min của roundStartDate đợt sau
      if (field === "roundEndDate" && index < prev.rounds.length - 1) {
        const nextRoundIndex = index + 1;
        const nextRound = updatedRounds[nextRoundIndex];
        if (
          nextRound &&
          nextRound.roundStartDate &&
          nextRound.roundStartDate < value
        ) {
          updatedRounds[nextRoundIndex] = {
            ...nextRound,
            roundStartDate: value,
          };
        }
      }

      return {
        ...prev,
        rounds: updatedRounds,
      };
    });

    // Clear error khi thay đổi
    if (errors[`rounds.${index}.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`rounds.${index}.${field}`]: "",
      }));
    }
  };

  // Hàm format date từ YYYY-MM-DD sang ISO format
  const formatDateToISO = (dateString) => {
    if (!dateString) return null;
    // Nếu đã có time, giữ nguyên; nếu không, thêm time
    if (dateString.includes("T")) {
      return dateString;
    }
    // Format: YYYY-MM-DD -> YYYY-MM-DDTHH:MM:SS.sssZ
    return `${dateString}T00:00:00.000Z`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra roundsData có dữ liệu không
    if (!roundsData || roundsData.length === 0) {
      toast.error("Không có rounds để cập nhật");
      return;
    }

    setIsSubmitting(true);

    try {
      const results = [];
      const errors = [];

      // Gọi API cho từng round trong roundsData
      for (const round of roundsData) {
        if (!round.roundId) {
          errors.push({
            roundName: round.roundName || "Unknown",
            error: "Round ID không hợp lệ",
          });
          continue;
        }

        // Format dates từ roundsData (startDate và endDate)
        const startDateISO = formatDateToISO(round.startDate);
        const endDateISO = formatDateToISO(round.endDate);

        if (!startDateISO || !endDateISO) {
          errors.push({
            roundName: round.roundName || "Unknown",
            error: "StartDate và EndDate là bắt buộc",
          });
          continue;
        }

        try {
          const response = await updateRoundDates(
            round.roundId,
            startDateISO,
            endDateISO
          );

          if (response.success) {
            results.push({
              roundId: round.roundId,
              roundName: round.roundName,
              success: true,
            });
          } else {
            errors.push({
              roundId: round.roundId,
              roundName: round.roundName || "Unknown",
              error: response.error || "Cập nhật thất bại",
            });
          }
        } catch (error) {
          errors.push({
            roundId: round.roundId,
            roundName: round.roundName || "Unknown",
            error: error.message || "Có lỗi xảy ra khi cập nhật",
          });
        }
      }

      console.log("Update rounds dates results:", { results, errors });

      // Hiển thị kết quả
      if (errors.length === 0) {
        toast.success(
          `Cập nhật dates thành công cho tất cả ${results.length} rounds!`
        );
        setTimeout(() => {
          navigate(`/senior-recruiter/campaigns/${campaignId}/create-round`);
        }, 2000);
      } else if (results.length > 0) {
        toast.warning(
          `Cập nhật thành công ${results.length} rounds, thất bại ${errors.length} rounds`
        );
      } else {
        toast.error("Cập nhật dates thất bại cho tất cả rounds");
      }
    } catch (error) {
      console.error("Error updating rounds dates:", error);
      toast.error("Có lỗi xảy ra khi cập nhật dates");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm("Bạn có chắc chắn muốn hủy? Tất cả thông tin sẽ bị mất.")
    ) {
      navigate("/senior-recruiter/campaigns");
    }
  };

  return (
    <div className="relative p-6">
      {isLoadingDetail && <Loading message="Đang tải thông tin yêu cầu..." />}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 mr-50">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Tiêu đề *
            </label>
            <input
              type="text"
              name="campaignName"
              value={formData.campaignName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-300 ${
                isRequestDataLocked ? "bg-slate-100 cursor-not-allowed" : ""
              }`}
              placeholder="Nhập tiêu đề yêu cầu tuyển dụng"
              disabled={isRequestDataLocked}
            />
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Đăng công khai tuyển dụng - Cabin Crew
          </p>
        </div>
        <button
          onClick={() => navigate("/senior-recruiter/campaigns")}
          className="flex-shrink-0 px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Quay lại
        </button>
      </div>

      {detailError && (
        <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded bg-red-50">
          {detailError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Thông tin cơ bản */}
            <div className="bg-white border rounded-lg shadow-sm border-slate-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500">
                    Thông tin đề xuất
                  </div>
                  <div className="font-semibold text-slate-800">
                    {campaignDetail?.partnerName
                      ? campaignDetail.partnerName
                      : isLoadingDetail
                      ? "Đang tải..."
                      : "N/A"}
                  </div>
                </div>
                <div className="text-xs text-right text-slate-500">
                  Mã số:{" "}
                  {campaignDetail?.campaignId ||
                    campaignId ||
                    (isLoadingDetail ? "Đang tải..." : "—")}
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Số lượng tuyển *
                    </label>
                    <input
                      type="number"
                      name="targetQuantity"
                      value={formData.targetQuantity}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-300 ${
                        isRequestDataLocked
                          ? "bg-slate-100 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="Nhập số lượng cần tuyển"
                      disabled={isRequestDataLocked}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Ngày bắt đầu *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      disabled={true}
                      className="w-full px-3 py-2 border rounded-md cursor-not-allowed border-slate-300 bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Ngày kết thúc *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      disabled={true}
                      className="w-full px-3 py-2 border rounded-md cursor-not-allowed border-slate-300 bg-slate-100"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Mô tả chung *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-300 ${
                      isRequestDataLocked
                        ? "bg-slate-100 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="Mô tả chung về chiến dịch..."
                    disabled={isRequestDataLocked}
                  />
                </div>

                <div className="mt-6">
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Mô tả công việc *
                  </label>
                  <div className={`rounded-md border border-slate-300`}>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.jobDescription}
                      onChange={(_, editor) =>
                        handleEditorChange("jobDescription", editor.getData())
                      }
                      config={{ placeholder: "Mô tả chi tiết về công việc..." }}
                      disabled={isRequestDataLocked}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium text-slate-700">
                    Yêu cầu công việc *
                  </label>
                  <div className={`rounded-md border border-slate-300`}>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.jobRequirement}
                      onChange={(_, editor) =>
                        handleEditorChange("jobRequirement", editor.getData())
                      }
                      config={{
                        placeholder: "Liệt kê các yêu cầu cho ứng viên...",
                      }}
                      disabled={isRequestDataLocked}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Kế hoạch các đợt tuyển */}
            <div className="bg-white border rounded-lg shadow-sm border-slate-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                <div className="font-semibold text-slate-800">
                  Kế hoạch các đợt tuyển
                </div>
              </div>

              <div className="p-5">
                {formData.rounds.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    <p>Đang tải dữ liệu các đợt tuyển...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.rounds.map((round, index) => (
                      <div
                        key={`round-${round.roundName}-${index}`}
                        className="space-y-4"
                      >
                        <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-slate-800">
                                {round.roundName}
                              </span>
                            </div>
                          </div>

                          <div className="p-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label className="block mb-1 text-sm font-medium text-slate-700">
                                  Tên đợt *
                                </label>
                                <input
                                  type="text"
                                  value={round.roundName || ""}
                                  onChange={(e) =>
                                    handleRoundChange(
                                      index,
                                      "roundName",
                                      e.target.value
                                    )
                                  }
                                  disabled={true}
                                  className="w-full px-2 py-1 text-xs border rounded cursor-not-allowed border-slate-300 bg-slate-100"
                                  placeholder="Tên đợt tuyển dụng"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-sm font-medium text-slate-700">
                                  Chỉ tiêu *
                                </label>
                                <input
                                  type="number"
                                  value={round.targetQuantity || ""}
                                  onChange={(e) =>
                                    handleRoundChange(
                                      index,
                                      "targetQuantity",
                                      e.target.value
                                    )
                                  }
                                  disabled={true}
                                  min="0"
                                  step="1"
                                  className="w-full px-2 py-1 text-xs border rounded cursor-not-allowed border-slate-300 bg-slate-100"
                                  placeholder="Nhập chỉ tiêu..."
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-sm font-medium text-slate-700">
                                  Thời gian bắt đầu *
                                </label>
                                <input
                                  type="date"
                                  value={round.roundStartDate || ""}
                                  onChange={(e) =>
                                    handleRoundChange(
                                      index,
                                      "roundStartDate",
                                      e.target.value
                                    )
                                  }
                                  disabled={true}
                                  className="w-full px-2 py-1 text-xs border rounded cursor-not-allowed border-slate-300 bg-slate-100"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-sm font-medium text-slate-700">
                                  Thời gian kết thúc *
                                </label>
                                <input
                                  type="date"
                                  value={round.roundEndDate || ""}
                                  onChange={(e) =>
                                    handleRoundChange(
                                      index,
                                      "roundEndDate",
                                      e.target.value
                                    )
                                  }
                                  disabled={true}
                                  className="w-full px-2 py-1 text-xs border rounded cursor-not-allowed border-slate-300 bg-slate-100"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block mb-1 text-sm font-medium text-slate-700">
                                  Mô tả
                                </label>
                                <textarea
                                  value={round.description || ""}
                                  onChange={(e) =>
                                    handleRoundChange(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  disabled={true}
                                  rows="3"
                                  className="w-full px-2 py-1 text-xs border rounded cursor-not-allowed border-slate-300 bg-slate-100"
                                  placeholder="Mô tả về đợt tuyển dụng này..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Hiển thị rounds của đợt này */}
                        {(() => {
                          // Lọc rounds theo campaignRoundId của đợt hiện tại
                          const dotRounds = roundsData.filter(
                            (r) => r.campaignRoundId === round.campaignRoundId
                          );

                          if (dotRounds.length === 0) {
                            return null;
                          }

                          // Min date = roundStartDate của đợt (startDate của round đầu tiên phải khớp với đây)
                          const minDate = round.roundStartDate || undefined;

                          // Max date = roundEndDate của đợt (endDate của round cuối cùng phải khớp với đây)
                          const maxDate = round.roundEndDate || undefined;

                          return (
                            <div className="mt-4 space-y-3">
                              {dotRounds.map((dotRound, roundIndex) => (
                                <div
                                  key={dotRound.roundId || roundIndex}
                                  className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200"
                                >
                                  {/* Header của round - luôn hiển thị */}
                                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                                    <div className="flex items-center gap-3">
                                      <span className="text-base font-semibold text-slate-800">
                                        {dotRound.roundName &&
                                        dotRound.roundName.trim()
                                          ? dotRound.roundName
                                          : `Round ${roundIndex + 1}`}
                                      </span>
                                    </div>
                                    {/* Hiển thị 2 nút ở góc phải của tất cả rounds */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-3 py-1.5 text-xs font-medium transition-colors border rounded-md border-slate-300 text-slate-700 hover:bg-slate-50"
                                      >
                                        Hủy
                                      </button>
                                      <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                                          isSubmitting
                                            ? "bg-slate-400 cursor-not-allowed text-white"
                                            : "bg-red-600 hover:bg-red-700 text-white"
                                        }`}
                                      >
                                        {isSubmitting
                                          ? "Đang cập nhật..."
                                          : "Cập nhật Campaign"}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="p-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                      <div>
                                        <label className="block mb-1 text-sm font-medium text-slate-700">
                                          Ngày bắt đầu
                                        </label>
                                        <input
                                          type="date"
                                          value={dotRound.startDate || ""}
                                          min={minDate}
                                          max={maxDate}
                                          onChange={(e) => {
                                            const updatedRounds = [
                                              ...roundsData,
                                            ];
                                            const roundIdx =
                                              roundsData.findIndex(
                                                (r) =>
                                                  r.roundId === dotRound.roundId
                                              );
                                            if (roundIdx !== -1) {
                                              updatedRounds[roundIdx] = {
                                                ...updatedRounds[roundIdx],
                                                startDate: e.target.value,
                                              };
                                              // Đảm bảo endDate >= startDate
                                              if (
                                                updatedRounds[roundIdx]
                                                  .endDate &&
                                                updatedRounds[roundIdx]
                                                  .endDate < e.target.value
                                              ) {
                                                updatedRounds[
                                                  roundIdx
                                                ].endDate = e.target.value;
                                              }
                                              setRoundsData(updatedRounds);
                                            }
                                          }}
                                          className="w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-300"
                                        />
                                      </div>
                                      <div>
                                        <label className="block mb-1 text-sm font-medium text-slate-700">
                                          Ngày kết thúc
                                        </label>
                                        <input
                                          type="date"
                                          value={dotRound.endDate || ""}
                                          min={
                                            dotRound.startDate ||
                                            minDate ||
                                            undefined
                                          }
                                          max={maxDate || undefined}
                                          onChange={(e) => {
                                            const updatedRounds = [
                                              ...roundsData,
                                            ];
                                            const roundIdx =
                                              roundsData.findIndex(
                                                (r) =>
                                                  r.roundId === dotRound.roundId
                                              );
                                            if (roundIdx !== -1) {
                                              updatedRounds[roundIdx] = {
                                                ...updatedRounds[roundIdx],
                                                endDate: e.target.value,
                                              };
                                              // Đảm bảo startDate <= endDate
                                              if (
                                                updatedRounds[roundIdx]
                                                  .startDate &&
                                                updatedRounds[roundIdx]
                                                  .startDate > e.target.value
                                              ) {
                                                updatedRounds[
                                                  roundIdx
                                                ].startDate = e.target.value;
                                              }
                                              setRoundsData(updatedRounds);
                                            }
                                          }}
                                          className="w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-300"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SeniorCreateRoundPage;
