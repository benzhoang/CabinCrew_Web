import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast } from "react-toastify";
import {
  getCampaignDetail,
  updateCampaignAndCreateRounds,
} from "../../service/api2";
import Loading from "../../components/Loading";

const SeniorCreateCampaignPage = () => {
  const { id: campaignId } = useParams();
  const todayString = new Date().toISOString().split("T")[0];
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

  // Hàm lấy round name dựa trên campaignType và index
  const getRoundNameByIndex = (index, campaignType) => {
    const recruitmentRounds = [
      "Screening",
      "Appearance",
      "English Listening Test",
      "English Speaking Test",
      "Interview",
      "Final",
    ];

    const promotionRounds = [
      "Screening",
      "Flight Hours Confirmation",
      "Practical Test",
      "Interview",
      "Final",
    ];

    if (campaignType === "Recruitment") {
      return recruitmentRounds[index] || `Round ${index + 1}`;
    } else if (campaignType === "Promotion") {
      return promotionRounds[index] || `Round ${index + 1}`;
    }
    return `Round ${index + 1}`;
  };

  // Hàm lấy số lượng rounds dựa trên campaignType
  const getRoundsCountByCampaignType = (campaignType) => {
    if (campaignType === "Recruitment") {
      return 6; // Screening, Appearance, English Listening Test, English Speaking Test, Interview, Final
    } else if (campaignType === "Promotion") {
      return 5; // Screening, Flight Hours Confirmation, Practical Test, Interview, Final
    }
    return 6; // Default to Recruitment
  };

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
          }));
        } else {
          setDetailError(result.error || "Không thể tải chi tiết yêu cầu");
        }
      } catch (err) {
        if (!isMounted) return;
        setDetailError(err.message || "Không thể tải chi tiết yêu cầu");
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

  // Tự động cập nhật roundsData khi roundStartDate hoặc roundEndDate thay đổi
  useEffect(() => {
    formData.rounds.forEach((round, index) => {
      const campaignType = campaignDetail?.campaignType || "Recruitment";
      const roundsCount = getRoundsCountByCampaignType(campaignType);
      const expectedRoundNames = Array.from({ length: roundsCount }, (_, idx) =>
        getRoundNameByIndex(idx, campaignType)
      );

      if (round.roundStartDate || round.roundEndDate) {
        setRoundsData((prevRoundsData) => {
          const updatedRoundsData = [...prevRoundsData];

          // Tìm rounds liên quan
          let relatedRounds = [];

          if (round.campaignRoundId) {
            relatedRounds = updatedRoundsData.filter(
              (r) => r.campaignRoundId === round.campaignRoundId
            );
          } else {
            const startIdx = index * roundsCount;
            const endIdx = startIdx + roundsCount;

            relatedRounds = updatedRoundsData
              .slice(startIdx, endIdx)
              .filter((r) => expectedRoundNames.includes(r.roundName));
          }

          // Cập nhật startDate của round đầu tiên
          if (round.roundStartDate) {
            const firstRoundName = expectedRoundNames[0];
            const foundRound = relatedRounds.find(
              (r) => r.roundName === firstRoundName
            );

            if (foundRound) {
              const roundIdx = updatedRoundsData.findIndex(
                (r) =>
                  r === foundRound ||
                  (r.roundName === firstRoundName &&
                    ((round.campaignRoundId &&
                      r.campaignRoundId === round.campaignRoundId) ||
                      (!round.campaignRoundId && !r.campaignRoundId)))
              );

              if (roundIdx !== -1) {
                updatedRoundsData[roundIdx] = {
                  ...updatedRoundsData[roundIdx],
                  startDate: round.roundStartDate,
                };
              }
            } else {
              // Kiểm tra xem round đã tồn tại chưa (tránh trùng lặp)
              const existingRound = updatedRoundsData.find(
                (r) =>
                  r.roundName === firstRoundName &&
                  ((round.campaignRoundId &&
                    r.campaignRoundId === round.campaignRoundId) ||
                    (!round.campaignRoundId && !r.campaignRoundId))
              );

              if (!existingRound) {
                // Tạo round đầu tiên mới nếu chưa tồn tại
                const newRound = {
                  roundId: null,
                  roundName: firstRoundName,
                  campaignRoundId: round.campaignRoundId,
                  startDate: round.roundStartDate,
                  endDate: "",
                };

                if (round.campaignRoundId) {
                  updatedRoundsData.push(newRound);
                } else {
                  const insertIdx = index * roundsCount;
                  updatedRoundsData.splice(insertIdx, 0, newRound);
                }
              } else {
                // Cập nhật round đã tồn tại
                const existingIdx = updatedRoundsData.findIndex(
                  (r) => r === existingRound
                );
                if (existingIdx !== -1) {
                  updatedRoundsData[existingIdx] = {
                    ...updatedRoundsData[existingIdx],
                    startDate: round.roundStartDate,
                  };
                }
              }
            }
          }

          // Cập nhật endDate của round cuối cùng
          if (round.roundEndDate) {
            const lastRoundName =
              expectedRoundNames[expectedRoundNames.length - 1];
            const foundRound = relatedRounds.find(
              (r) => r.roundName === lastRoundName
            );

            if (foundRound) {
              const roundIdx = updatedRoundsData.findIndex(
                (r) =>
                  r === foundRound ||
                  (r.roundName === lastRoundName &&
                    ((round.campaignRoundId &&
                      r.campaignRoundId === round.campaignRoundId) ||
                      (!round.campaignRoundId && !r.campaignRoundId)))
              );

              if (roundIdx !== -1) {
                updatedRoundsData[roundIdx] = {
                  ...updatedRoundsData[roundIdx],
                  endDate: round.roundEndDate,
                };
              }
            } else {
              // Kiểm tra xem round đã tồn tại chưa (tránh trùng lặp)
              const existingRound = updatedRoundsData.find(
                (r) =>
                  r.roundName === lastRoundName &&
                  ((round.campaignRoundId &&
                    r.campaignRoundId === round.campaignRoundId) ||
                    (!round.campaignRoundId && !r.campaignRoundId))
              );

              if (!existingRound) {
                // Tạo round cuối cùng mới nếu chưa tồn tại
                const newRound = {
                  roundId: null,
                  roundName: lastRoundName,
                  campaignRoundId: round.campaignRoundId,
                  startDate: "",
                  endDate: round.roundEndDate,
                };

                if (round.campaignRoundId) {
                  updatedRoundsData.push(newRound);
                } else {
                  const insertIdx = index * roundsCount + roundsCount - 1;
                  updatedRoundsData.splice(insertIdx, 0, newRound);
                }
              } else {
                // Cập nhật round đã tồn tại
                const existingIdx = updatedRoundsData.findIndex(
                  (r) => r === existingRound
                );
                if (existingIdx !== -1) {
                  updatedRoundsData[existingIdx] = {
                    ...updatedRoundsData[existingIdx],
                    endDate: round.roundEndDate,
                  };
                }
              }
            }
          }

          return updatedRoundsData;
        });
      }
    });
  }, [formData.rounds, campaignDetail?.campaignType]);

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
    let updatedRound = null;

    setFormData((prev) => {
      const updatedRounds = prev.rounds.map((round, i) => {
        if (i === index) {
          updatedRound = { ...round, [field]: value };

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

    // Cập nhật roundsData khi thay đổi roundStartDate hoặc roundEndDate
    if (
      (field === "roundStartDate" || field === "roundEndDate") &&
      updatedRound
    ) {
      const campaignType = campaignDetail?.campaignType || "Recruitment";
      const roundsCount = getRoundsCountByCampaignType(campaignType);
      const expectedRoundNames = Array.from({ length: roundsCount }, (_, idx) =>
        getRoundNameByIndex(idx, campaignType)
      );

      setRoundsData((prevRoundsData) => {
        const updatedRoundsData = [...prevRoundsData];

        // Tìm rounds liên quan - sử dụng logic tương tự như trong render
        let relatedRounds = [];

        if (updatedRound.campaignRoundId) {
          // Trường hợp có campaignRoundId: Tìm theo campaignRoundId
          relatedRounds = updatedRoundsData.filter(
            (r) => r.campaignRoundId === updatedRound.campaignRoundId
          );
        } else {
          // Trường hợp chưa có campaignRoundId: Tìm theo index
          const startIdx = index * roundsCount;
          const endIdx = startIdx + roundsCount;

          relatedRounds = updatedRoundsData
            .slice(startIdx, endIdx)
            .filter((r) => expectedRoundNames.includes(r.roundName));
        }

        if (field === "roundStartDate" && value) {
          // Cập nhật startDate của round đầu tiên
          const firstRoundName = expectedRoundNames[0];
          const foundRound = relatedRounds.find(
            (r) => r.roundName === firstRoundName
          );

          if (foundRound) {
            // Tìm index trong updatedRoundsData
            const roundIdx = updatedRoundsData.findIndex(
              (r) =>
                r === foundRound ||
                (r.roundName === firstRoundName &&
                  ((updatedRound.campaignRoundId &&
                    r.campaignRoundId === updatedRound.campaignRoundId) ||
                    (!updatedRound.campaignRoundId && !r.campaignRoundId)))
            );

            if (roundIdx !== -1) {
              updatedRoundsData[roundIdx] = {
                ...updatedRoundsData[roundIdx],
                startDate: value,
              };
            }
          } else {
            // Kiểm tra xem round đã tồn tại chưa (tránh trùng lặp)
            const existingRound = updatedRoundsData.find(
              (r) =>
                r.roundName === firstRoundName &&
                ((updatedRound.campaignRoundId &&
                  r.campaignRoundId === updatedRound.campaignRoundId) ||
                  (!updatedRound.campaignRoundId && !r.campaignRoundId))
            );

            if (!existingRound) {
              // Tạo round đầu tiên mới
              const newRound = {
                roundId: null,
                roundName: firstRoundName,
                campaignRoundId: updatedRound.campaignRoundId,
                startDate: value,
                endDate: "",
              };

              if (updatedRound.campaignRoundId) {
                updatedRoundsData.push(newRound);
              } else {
                const insertIdx = index * roundsCount;
                updatedRoundsData.splice(insertIdx, 0, newRound);
              }
            } else {
              // Cập nhật round đã tồn tại
              const existingIdx = updatedRoundsData.findIndex(
                (r) => r === existingRound
              );
              if (existingIdx !== -1) {
                updatedRoundsData[existingIdx] = {
                  ...updatedRoundsData[existingIdx],
                  startDate: value,
                };
              }
            }
          }
        }

        if (field === "roundEndDate" && value) {
          // Cập nhật endDate của round cuối cùng
          const lastRoundName =
            expectedRoundNames[expectedRoundNames.length - 1];
          const foundRound = relatedRounds.find(
            (r) => r.roundName === lastRoundName
          );

          if (foundRound) {
            // Tìm index trong updatedRoundsData
            const roundIdx = updatedRoundsData.findIndex(
              (r) =>
                r === foundRound ||
                (r.roundName === lastRoundName &&
                  ((updatedRound.campaignRoundId &&
                    r.campaignRoundId === updatedRound.campaignRoundId) ||
                    (!updatedRound.campaignRoundId && !r.campaignRoundId)))
            );

            if (roundIdx !== -1) {
              updatedRoundsData[roundIdx] = {
                ...updatedRoundsData[roundIdx],
                endDate: value,
              };
            }
          } else {
            // Kiểm tra xem round đã tồn tại chưa (tránh trùng lặp)
            const existingRound = updatedRoundsData.find(
              (r) =>
                r.roundName === lastRoundName &&
                ((updatedRound.campaignRoundId &&
                  r.campaignRoundId === updatedRound.campaignRoundId) ||
                  (!updatedRound.campaignRoundId && !r.campaignRoundId))
            );

            if (!existingRound) {
              // Tạo round cuối cùng mới
              const newRound = {
                roundId: null,
                roundName: lastRoundName,
                campaignRoundId: updatedRound.campaignRoundId,
                startDate: "",
                endDate: value,
              };

              if (updatedRound.campaignRoundId) {
                updatedRoundsData.push(newRound);
              } else {
                const insertIdx = index * roundsCount + roundsCount - 1;
                updatedRoundsData.splice(insertIdx, 0, newRound);
              }
            } else {
              // Cập nhật round đã tồn tại
              const existingIdx = updatedRoundsData.findIndex(
                (r) => r === existingRound
              );
              if (existingIdx !== -1) {
                updatedRoundsData[existingIdx] = {
                  ...updatedRoundsData[existingIdx],
                  endDate: value,
                };
              }
            }
          }
        }

        return updatedRoundsData;
      });
    }

    // Clear error khi thay đổi
    if (errors[`rounds.${index}.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`rounds.${index}.${field}`]: "",
      }));
    }
  };

  const addRound = () => {
    setFormData((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          roundName: `Đợt ${prev.rounds.length + 1}`,
          roundStartDate: "",
          roundEndDate: "",
          targetQuantity: "",
          description: "",
        },
      ],
    }));
  };

  const removeRound = (index) => {
    if (formData.rounds.length > 1) {
      setFormData((prev) => ({
        ...prev,
        rounds: prev.rounds.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }
    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    // Validate ngày của các đợt
    if (formData.startDate && formData.endDate) {
      formData.rounds.forEach((round, index) => {
        // Validate roundStartDate
        if (round.roundStartDate) {
          if (round.roundStartDate < formData.startDate) {
            newErrors[`rounds.${index}.roundStartDate`] =
              "Ngày bắt đầu đợt phải nằm trong khoảng ngày chiến dịch";
          }
          if (round.roundStartDate > formData.endDate) {
            newErrors[`rounds.${index}.roundStartDate`] =
              "Ngày bắt đầu đợt không được vượt quá ngày kết thúc chiến dịch";
          }

          // Từ đợt 2 trở đi, ngày bắt đầu phải >= ngày kết thúc đợt trước
          if (index > 0) {
            const previousRound = formData.rounds[index - 1];
            if (previousRound.roundEndDate) {
              if (round.roundStartDate < previousRound.roundEndDate) {
                newErrors[`rounds.${index}.roundStartDate`] =
                  "Ngày bắt đầu đợt này phải sau hoặc bằng ngày kết thúc đợt trước";
              }
            }
          }
        }

        // Validate roundEndDate
        if (round.roundEndDate) {
          if (round.roundEndDate < formData.startDate) {
            newErrors[`rounds.${index}.roundEndDate`] =
              "Ngày kết thúc đợt phải nằm trong khoảng ngày chiến dịch";
          }
          if (round.roundEndDate > formData.endDate) {
            newErrors[`rounds.${index}.roundEndDate`] =
              "Ngày kết thúc đợt không được vượt quá ngày kết thúc chiến dịch";
          }

          // Ngày kết thúc phải >= ngày bắt đầu của đợt
          if (
            round.roundStartDate &&
            round.roundEndDate < round.roundStartDate
          ) {
            newErrors[`rounds.${index}.roundEndDate`] =
              "Ngày kết thúc đợt phải sau hoặc bằng ngày bắt đầu đợt";
          }
        }
      });
    }
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả nhu cầu là bắt buộc";
    }

    formData.rounds.forEach((round, index) => {
      if (!round.roundName || !round.roundName.trim()) {
        newErrors[`rounds.${index}.roundName`] = "Tên đợt là bắt buộc";
      }
      if (!round.roundStartDate) {
        newErrors[`rounds.${index}.roundStartDate`] =
          "Thời gian bắt đầu là bắt buộc";
      }
      if (!round.roundEndDate) {
        newErrors[`rounds.${index}.roundEndDate`] =
          "Thời gian kết thúc là bắt buộc";
      }
      if (
        round.roundStartDate &&
        round.roundEndDate &&
        round.roundStartDate >= round.roundEndDate
      ) {
        newErrors[`rounds.${index}.roundEndDate`] =
          "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
      if (!round.targetQuantity || parseInt(round.targetQuantity, 10) <= 0) {
        newErrors[`rounds.${index}.targetQuantity`] =
          "Chỉ tiêu phải lớn hơn 0 cho mỗi đợt";
      }
      if (!round.description.trim()) {
        newErrors[`rounds.${index}.description`] = "Mô tả đợt là bắt buộc";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapRoundsToPayload = () => {
    // Chỉ map rounds hợp lệ (không có error)
    return formData.rounds
      .map((round, roundIndex) => {
        // Kiểm tra round có error không - bỏ qua nếu có
        const hasError =
          errors[`rounds.${roundIndex}.roundName`] ||
          errors[`rounds.${roundIndex}.roundStartDate`] ||
          errors[`rounds.${roundIndex}.roundEndDate`] ||
          errors[`rounds.${roundIndex}.targetQuantity`] ||
          errors[`rounds.${roundIndex}.description`];

        if (hasError) {
          return null; // Bỏ qua rounds có error
        }

        // Kiểm tra round có đầy đủ thông tin cần thiết
        if (
          !round.roundName ||
          !round.roundStartDate ||
          !round.roundEndDate ||
          !round.targetQuantity ||
          !round.description
        ) {
          return null; // Bỏ qua rounds thiếu thông tin
        }

        // Tìm tất cả rounds con (Screening, Appearance, etc.) từ roundsData
        let roundDates = [];

        // Lấy campaignType để biết số lượng rounds
        const campaignType = campaignDetail?.campaignType || "Recruitment";
        const roundsCount = getRoundsCountByCampaignType(campaignType);

        // Tạo danh sách round names theo thứ tự
        const expectedRoundNames = Array.from(
          { length: roundsCount },
          (_, idx) => getRoundNameByIndex(idx, campaignType)
        );

        // Tìm rounds liên quan
        let relatedRounds = [];

        if (round.campaignRoundId) {
          // Trường hợp có campaignRoundId (edit): Tìm rounds theo campaignRoundId
          relatedRounds = roundsData.filter(
            (r) => r.campaignRoundId === round.campaignRoundId
          );
        } else {
          // Trường hợp chưa có campaignRoundId (tạo mới):
          // Tìm rounds trong roundsData dựa trên index của round trong formData.rounds
          // Sử dụng index để nhóm rounds (giả sử rounds được tạo theo thứ tự)
          const startIdx = roundIndex * roundsCount;
          const endIdx = startIdx + roundsCount;

          // Lấy rounds từ roundsData theo index và filter theo roundName
          relatedRounds = roundsData
            .slice(startIdx, endIdx)
            .filter((r) => expectedRoundNames.includes(r.roundName));
        }

        // Sắp xếp theo thứ tự roundName để đảm bảo đúng thứ tự
        roundDates = expectedRoundNames
          .map((roundName) => {
            const foundRound = relatedRounds.find(
              (r) => r.roundName === roundName
            );
            if (foundRound && foundRound.startDate && foundRound.endDate) {
              return {
                startDate: foundRound.startDate,
                endDate: foundRound.endDate,
              };
            }
            return null;
          })
          .filter((item) => item !== null);

        return {
          roundName: round.roundName || "",
          description: round.description || "",
          targetQuantity: parseInt(round.targetQuantity, 10) || 0,
          roundStartDate: round.roundStartDate
            ? `${round.roundStartDate}T00:00:00Z`
            : null,
          roundEndDate: round.roundEndDate
            ? `${round.roundEndDate}T23:59:59Z`
            : null,
          roundDates: roundDates.length > 0 ? roundDates : [],
        };
      })
      .filter((round) => round !== null); // Loại bỏ rounds null (có error)
  };

  const validateRoundTargets = () => {
    const campaignTarget = parseInt(formData.targetQuantity, 10) || 0;
    if (campaignTarget <= 0) {
      toast.error("Vui lòng nhập chỉ tiêu campaign hợp lệ.");
      return false;
    }

    const rounds = formData.rounds;
    if (rounds.length === 0) {
      toast.error("Cần ít nhất một đợt tuyển.");
      return false;
    }

    // // Round 1 must be 60-70% of campaign target
    // const firstTarget = parseInt(rounds[0].targetQuantity, 10) || 0;
    // if (
    //   firstTarget < campaignTarget * 0.6 ||
    //   firstTarget > campaignTarget * 0.7
    // ) {
    //   toast.error(
    //     "Đợt 1 phải có chỉ tiêu 60% - 70% tổng chỉ tiêu của campaign."
    //   );
    //   return false;
    // }

    // // Remaining target after round 1
    // let remaining = campaignTarget - firstTarget;

    // // Middle rounds (excluding first and last if there are >=2 rounds)
    // if (rounds.length > 2) {
    //   for (let i = 1; i < rounds.length - 1; i += 1) {
    //     const roundTarget = parseInt(rounds[i].targetQuantity, 10) || 0;
    //     if (roundTarget < remaining * 0.6 || roundTarget > remaining * 0.7) {
    //       toast.error(
    //         `Đợt ${
    //           i + 1
    //         } phải có chỉ tiêu 60% - 70% của số lượng còn lại sau các đợt trước.`
    //       );
    //       return false;
    //     }
    //     remaining -= roundTarget;
    //   }
    // }

    // // Last round must be >=80% of remaining
    // if (rounds.length > 1) {
    //   const lastTarget =
    //     parseInt(rounds[rounds.length - 1].targetQuantity, 10) || 0;
    //   if (lastTarget < remaining * 0.8) {
    //     toast.error(
    //       "Đợt cuối phải có chỉ tiêu tối thiểu 80% số lượng còn lại."
    //     );
    //     return false;
    //   }
    // } else {
    //   // If only one round, remaining was campaignTarget - firstTarget; ensure nothing left
    //   if (remaining > 0) {
    //     toast.error("Tổng chỉ tiêu các đợt chưa đạt 100% campaign target.");
    //     return false;
    //   }
    // }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form trước
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    // Validate chỉ tiêu các đợt
    if (!validateRoundTargets()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Map rounds và kiểm tra có rounds hợp lệ không
      const validRounds = mapRoundsToPayload();

      // Nếu không có rounds hợp lệ, không gửi request
      if (validRounds.length === 0) {
        toast.error(
          "Không có đợt tuyển hợp lệ để lưu. Vui lòng kiểm tra lại thông tin."
        );
        setIsSubmitting(false);
        return;
      }

      const payload = {
        startDate: formData.startDate
          ? `${formData.startDate}T00:00:00Z`
          : null,
        endDate: formData.endDate ? `${formData.endDate}T23:59:59Z` : null,
        rounds: validRounds,
      };

      const response = await updateCampaignAndCreateRounds(campaignId, payload);
      console.log("Updating campaign:", payload);
      console.log("API Response:", response);

      if (response.success) {
        toast.success(response.message || "Cập nhật campaign thành công!");

        setTimeout(() => {
          navigate(`/senior-recruiter/campaigns`);
        }, 2000);
      } else {
        // Nếu API trả về error, không lưu rounds
        toast.error(response.error || "Cập nhật campaign thất bại");
        console.error("API Error - Rounds were not saved:", response);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Có lỗi xảy ra khi tạo campaign. Rounds không được lưu.");
      // Không lưu rounds khi có exception
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
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.startDate ? "border-red-300" : "border-slate-300"
                      }`}
                      min={todayString}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.startDate}
                      </p>
                    )}
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
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.endDate ? "border-red-300" : "border-slate-300"
                      }`}
                      min={formData.startDate || todayString}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.endDate}
                      </p>
                    )}
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
                <button
                  type="button"
                  onClick={addRound}
                  className={`px-3 py-1 text-sm text-white rounded-md bg-blue-600 hover:bg-blue-700
                  `}
                >
                  + Thêm đợt
                </button>
              </div>

              <div className="p-5">
                <div className="space-y-4">
                  {formData.rounds.map((round, index) => (
                    <div
                      key={index}
                      className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200 pb-10"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-800">
                            {round.roundName}
                          </span>
                          {formData.rounds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRound(index)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              ✕ Xóa
                            </button>
                          )}
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
                              value={round.roundName}
                              onChange={(e) =>
                                handleRoundChange(
                                  index,
                                  "roundName",
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1 text-xs border rounded ${
                                errors[`rounds.${index}.roundName`]
                                  ? "border-red-300"
                                  : "border-slate-300"
                              }`}
                              placeholder="Round 1"
                            />
                            {errors[`rounds.${index}.roundName`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`rounds.${index}.roundName`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                              Thời gian bắt đầu *
                            </label>
                            <input
                              type="date"
                              value={round.roundStartDate}
                              onChange={(e) =>
                                handleRoundChange(
                                  index,
                                  "roundStartDate",
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1 text-xs border rounded ${
                                errors[`rounds.${index}.roundStartDate`]
                                  ? "border-red-300"
                                  : "border-slate-300"
                              }`}
                              min={
                                index > 0 &&
                                formData.rounds[index - 1]?.roundEndDate
                                  ? formData.rounds[index - 1].roundEndDate
                                  : formData.startDate || todayString
                              }
                              max={formData.endDate || undefined}
                            />
                            {errors[`rounds.${index}.roundStartDate`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`rounds.${index}.roundStartDate`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                              Thời gian kết thúc *
                            </label>
                            <input
                              type="date"
                              value={round.roundEndDate}
                              onChange={(e) =>
                                handleRoundChange(
                                  index,
                                  "roundEndDate",
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1 text-xs border rounded ${
                                errors[`rounds.${index}.roundEndDate`]
                                  ? "border-red-300"
                                  : "border-slate-300"
                              }`}
                              min={
                                round.roundStartDate ||
                                (index > 0 &&
                                formData.rounds[index - 1]?.roundEndDate
                                  ? formData.rounds[index - 1].roundEndDate
                                  : formData.startDate || todayString)
                              }
                              max={formData.endDate || undefined}
                            />
                            {errors[`rounds.${index}.roundEndDate`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`rounds.${index}.roundEndDate`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                              Chỉ tiêu *
                            </label>
                            <input
                              type="number"
                              value={round.targetQuantity}
                              onChange={(e) =>
                                handleRoundChange(
                                  index,
                                  "targetQuantity",
                                  e.target.value
                                )
                              }
                              min="0"
                              step="1"
                              className={`w-full px-2 py-1 text-xs border rounded ${
                                errors[`rounds.${index}.targetQuantity`]
                                  ? "border-red-300"
                                  : "border-slate-300"
                              }`}
                              placeholder="Nhập chỉ tiêu..."
                            />
                            {errors[`rounds.${index}.targetQuantity`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`rounds.${index}.targetQuantity`]}
                              </p>
                            )}
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                              Mô tả
                            </label>
                            <textarea
                              value={round.description}
                              onChange={(e) =>
                                handleRoundChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              rows="3"
                              className="w-full px-2 py-1 text-xs border rounded border-slate-300"
                              placeholder="Mô tả về đợt tuyển dụng này..."
                            />
                            {errors[`rounds.${index}.description`] && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors[`rounds.${index}.description`]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Hiển thị rounds của đợt này */}
                      {(() => {
                        // Lấy campaignType từ campaignDetail
                        const campaignType =
                          campaignDetail?.campaignType || "Recruitment";

                        // Lấy số lượng rounds dựa trên campaignType
                        const roundsCount =
                          getRoundsCountByCampaignType(campaignType);

                        // Tạo danh sách round names theo thứ tự
                        const expectedRoundNames = Array.from(
                          { length: roundsCount },
                          (_, idx) => getRoundNameByIndex(idx, campaignType)
                        );

                        // Tìm rounds liên quan từ roundsData
                        let relatedRounds = [];

                        if (round.campaignRoundId) {
                          // Trường hợp có campaignRoundId (edit): Tìm rounds theo campaignRoundId
                          relatedRounds = roundsData.filter(
                            (r) => r.campaignRoundId === round.campaignRoundId
                          );
                        } else {
                          // Trường hợp chưa có campaignRoundId (tạo mới):
                          // Tìm rounds trong roundsData dựa trên index của round trong formData.rounds
                          const startIdx = index * roundsCount;
                          const endIdx = startIdx + roundsCount;

                          // Lấy rounds từ roundsData theo index và filter theo roundName
                          relatedRounds = roundsData
                            .slice(startIdx, endIdx)
                            .filter((r) =>
                              expectedRoundNames.includes(r.roundName)
                            );
                        }

                        // Tạo mảng rounds dựa trên campaignType và dữ liệu từ roundsData
                        const defaultRounds = expectedRoundNames.map(
                          (roundName, roundIdx) => {
                            const foundRound = relatedRounds.find(
                              (r) => r.roundName === roundName
                            );

                            // Round đầu tiên: tự động điền startDate từ round.roundStartDate nếu chưa có
                            let startDate = foundRound?.startDate || "";
                            if (
                              roundIdx === 0 &&
                              !startDate &&
                              round.roundStartDate
                            ) {
                              startDate = round.roundStartDate;
                            }

                            // Round cuối cùng: tự động điền endDate từ round.roundEndDate nếu chưa có
                            let endDate = foundRound?.endDate || "";
                            if (
                              roundIdx === expectedRoundNames.length - 1 &&
                              !endDate &&
                              round.roundEndDate
                            ) {
                              endDate = round.roundEndDate;
                            }

                            return {
                              roundId: foundRound?.roundId || null,
                              roundName: roundName,
                              campaignRoundId: round.campaignRoundId,
                              startDate: startDate,
                              endDate: endDate,
                            };
                          }
                        );

                        // Min date = roundStartDate của đợt (startDate của round đầu tiên phải khớp với đây)
                        const minDate = round.roundStartDate || undefined;

                        // Max date = roundEndDate của đợt (endDate của round cuối cùng phải khớp với đây)
                        const maxDate = round.roundEndDate || undefined;

                        return (
                          <div className="mt-4 space-y-4">
                            {defaultRounds.map((dotRound, roundIndex) => {
                              // Tính min date cho startDate của round này
                              // Round đầu tiên: min = roundStartDate của đợt
                              // Round tiếp theo: min = endDate của round trước (hoặc roundStartDate nếu chưa có)
                              let startDateMin = minDate;
                              if (roundIndex > 0) {
                                const previousRound =
                                  defaultRounds[roundIndex - 1];
                                startDateMin =
                                  previousRound.endDate || minDate || undefined;
                              }

                              return (
                                <div
                                  key={`${round.campaignRoundId}-${roundIndex}`}
                                  className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200 mx-4"
                                >
                                  {/* Header của round - luôn hiển thị */}
                                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-semibold text-slate-800">
                                        {dotRound.roundName}
                                      </span>
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
                                          min={startDateMin}
                                          max={maxDate}
                                          onChange={(e) => {
                                            // Tìm hoặc tạo round trong roundsData
                                            let existingRoundIdx = -1;

                                            if (round.campaignRoundId) {
                                              // Trường hợp có campaignRoundId: Tìm theo campaignRoundId và roundName
                                              existingRoundIdx =
                                                roundsData.findIndex(
                                                  (r) =>
                                                    r.campaignRoundId ===
                                                      round.campaignRoundId &&
                                                    r.roundName ===
                                                      dotRound.roundName
                                                );
                                            } else {
                                              // Trường hợp chưa có campaignRoundId: Tìm theo index và roundName
                                              const startIdx =
                                                index * roundsCount;
                                              const endIdx =
                                                startIdx + roundsCount;

                                              const roundsInRange =
                                                roundsData.slice(
                                                  startIdx,
                                                  endIdx
                                                );

                                              existingRoundIdx =
                                                roundsInRange.findIndex(
                                                  (r) =>
                                                    r.roundName ===
                                                    dotRound.roundName
                                                );

                                              // Nếu tìm thấy, cần điều chỉnh index về index trong roundsData
                                              if (existingRoundIdx !== -1) {
                                                existingRoundIdx += startIdx;
                                              }
                                            }

                                            const updatedRounds = [
                                              ...roundsData,
                                            ];

                                            if (existingRoundIdx !== -1) {
                                              // Cập nhật round đã tồn tại
                                              updatedRounds[existingRoundIdx] =
                                                {
                                                  ...updatedRounds[
                                                    existingRoundIdx
                                                  ],
                                                  startDate: e.target.value,
                                                };
                                              // Đảm bảo endDate >= startDate
                                              if (
                                                updatedRounds[existingRoundIdx]
                                                  .endDate &&
                                                updatedRounds[existingRoundIdx]
                                                  .endDate < e.target.value
                                              ) {
                                                updatedRounds[
                                                  existingRoundIdx
                                                ].endDate = e.target.value;
                                              }
                                            } else {
                                              // Tạo round mới
                                              updatedRounds.push({
                                                roundId: null,
                                                roundName: dotRound.roundName,
                                                campaignRoundId:
                                                  round.campaignRoundId,
                                                startDate: e.target.value,
                                                endDate: dotRound.endDate || "",
                                              });
                                            }
                                            setRoundsData(updatedRounds);
                                          }}
                                          className="w-full px-2 py-1 text-xs border rounded border-slate-300"
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
                                            startDateMin ||
                                            undefined
                                          }
                                          max={maxDate || undefined}
                                          onChange={(e) => {
                                            // Tìm hoặc tạo round trong roundsData
                                            let existingRoundIdx = -1;

                                            if (round.campaignRoundId) {
                                              // Trường hợp có campaignRoundId: Tìm theo campaignRoundId và roundName
                                              existingRoundIdx =
                                                roundsData.findIndex(
                                                  (r) =>
                                                    r.campaignRoundId ===
                                                      round.campaignRoundId &&
                                                    r.roundName ===
                                                      dotRound.roundName
                                                );
                                            } else {
                                              // Trường hợp chưa có campaignRoundId: Tìm theo index và roundName
                                              const startIdx =
                                                index * roundsCount;
                                              const endIdx =
                                                startIdx + roundsCount;

                                              const roundsInRange =
                                                roundsData.slice(
                                                  startIdx,
                                                  endIdx
                                                );

                                              existingRoundIdx =
                                                roundsInRange.findIndex(
                                                  (r) =>
                                                    r.roundName ===
                                                    dotRound.roundName
                                                );

                                              // Nếu tìm thấy, cần điều chỉnh index về index trong roundsData
                                              if (existingRoundIdx !== -1) {
                                                existingRoundIdx += startIdx;
                                              }
                                            }

                                            const updatedRounds = [
                                              ...roundsData,
                                            ];

                                            if (existingRoundIdx !== -1) {
                                              // Cập nhật round đã tồn tại
                                              updatedRounds[existingRoundIdx] =
                                                {
                                                  ...updatedRounds[
                                                    existingRoundIdx
                                                  ],
                                                  endDate: e.target.value,
                                                };
                                              // Đảm bảo startDate <= endDate
                                              if (
                                                updatedRounds[existingRoundIdx]
                                                  .startDate &&
                                                updatedRounds[existingRoundIdx]
                                                  .startDate > e.target.value
                                              ) {
                                                updatedRounds[
                                                  existingRoundIdx
                                                ].startDate = e.target.value;
                                              }
                                            } else {
                                              // Tạo round mới
                                              updatedRounds.push({
                                                roundId: null,
                                                roundName: dotRound.roundName,
                                                campaignRoundId:
                                                  round.campaignRoundId,
                                                startDate:
                                                  dotRound.startDate || "",
                                                endDate: e.target.value,
                                              });
                                            }
                                            setRoundsData(updatedRounds);
                                          }}
                                          className="w-full px-2 py-1 text-xs border rounded border-slate-300"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thông tin tổng kết */}
            <div className="bg-white border rounded-lg shadow-sm border-slate-200">
              <div className="px-5 py-4 font-semibold border-b border-slate-200 text-slate-800">
                Tổng quan Campaign
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tổng đợt tuyển:</span>
                  <span className="font-medium text-slate-800">
                    {formData.rounds.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Chỉ tiêu các đợt:</span>
                  <span className="font-medium text-slate-800">
                    {formData.rounds.reduce(
                      (sum, round) =>
                        sum + (parseInt(round.targetQuantity, 10) || 0),
                      0
                    )}{" "}
                    người
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Thời gian dự kiến:</span>
                  <span className="font-medium text-slate-800">
                    {formData.startDate && formData.endDate
                      ? (() => {
                          const start = new Date(formData.startDate);
                          const end = new Date(formData.endDate);
                          const diffTime = Math.abs(end - start);
                          const diffDays =
                            Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 để bao gồm cả ngày bắt đầu và kết thúc
                          return `${diffDays} ngày`;
                        })()
                      : "Chưa xác định"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-5 bg-white border rounded-lg shadow-sm border-slate-200">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full px-4 py-2 font-medium transition-colors border rounded-md border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                    isSubmitting
                      ? "bg-slate-400 cursor-not-allowed text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật Campaign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SeniorCreateCampaignPage;
