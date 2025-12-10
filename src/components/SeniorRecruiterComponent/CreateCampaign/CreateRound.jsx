import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import { toast } from "react-toastify";

// Helper functions
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

const getRoundsCountByCampaignType = (campaignType) => {
  if (campaignType === "Recruitment") {
    return 6; // Screening, Appearance, English Listening Test, English Speaking Test, Interview, Final
  } else if (campaignType === "Promotion") {
    return 5; // Screening, Flight Hours Confirmation, Practical Test, Interview, Final
  }
  return 6; // Default to Recruitment
};

const CreateRound = forwardRef(
  (
    {
      rounds,
      errors,
      campaignDetail,
      roundsData,
      setRoundsData,
      onRoundsChange,
      onErrorChange,
      startDate,
      endDate,
      todayString,
      campaignTarget,
    },
    ref
  ) => {
    // Tự động cập nhật roundsData khi roundStartDate hoặc roundEndDate thay đổi
    useEffect(() => {
      rounds.forEach((round, index) => {
        const campaignType = campaignDetail?.campaignType || "Recruitment";
        const roundsCount = getRoundsCountByCampaignType(campaignType);
        const expectedRoundNames = Array.from(
          { length: roundsCount },
          (_, idx) => getRoundNameByIndex(idx, campaignType)
        );

        if (round.roundStartDate || round.roundEndDate) {
          setRoundsData((prevRoundsData) => {
            const updatedRoundsData = [...prevRoundsData];

            // Tìm rounds liên quan - chỉ rounds của đợt này
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

            // Helper function để tìm round trong phạm vi đúng của đợt này
            const findRoundInBatch = (roundName, updatedRoundsData) => {
              if (round.campaignRoundId) {
                return updatedRoundsData.findIndex(
                  (r) =>
                    r.campaignRoundId === round.campaignRoundId &&
                    r.roundName === roundName
                );
              } else {
                const batchStartIdx = index * roundsCount;
                const batchEndIdx = batchStartIdx + roundsCount;

                for (
                  let i = batchStartIdx;
                  i < batchEndIdx && i < updatedRoundsData.length;
                  i++
                ) {
                  if (
                    updatedRoundsData[i].roundName === roundName &&
                    !updatedRoundsData[i].campaignRoundId
                  ) {
                    return i;
                  }
                }
                return -1;
              }
            };

            // Cập nhật startDate của round đầu tiên
            if (round.roundStartDate) {
              const firstRoundName = expectedRoundNames[0];
              const foundRound = relatedRounds.find(
                (r) => r.roundName === firstRoundName
              );

              if (foundRound) {
                const roundIdx = findRoundInBatch(
                  firstRoundName,
                  updatedRoundsData
                );

                if (roundIdx !== -1) {
                  updatedRoundsData[roundIdx] = {
                    ...updatedRoundsData[roundIdx],
                    startDate: round.roundStartDate,
                  };
                }
              } else {
                const existingRoundIdx = findRoundInBatch(
                  firstRoundName,
                  updatedRoundsData
                );

                if (existingRoundIdx === -1) {
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
                  updatedRoundsData[existingRoundIdx] = {
                    ...updatedRoundsData[existingRoundIdx],
                    startDate: round.roundStartDate,
                  };
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
                const roundIdx = findRoundInBatch(
                  lastRoundName,
                  updatedRoundsData
                );

                if (roundIdx !== -1) {
                  updatedRoundsData[roundIdx] = {
                    ...updatedRoundsData[roundIdx],
                    endDate: round.roundEndDate,
                  };
                }
              } else {
                const existingRoundIdx = findRoundInBatch(
                  lastRoundName,
                  updatedRoundsData
                );

                if (existingRoundIdx === -1) {
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
                  updatedRoundsData[existingRoundIdx] = {
                    ...updatedRoundsData[existingRoundIdx],
                    endDate: round.roundEndDate,
                  };
                }
              }
            }

            return updatedRoundsData;
          });
        }
      });
    }, [rounds, campaignDetail?.campaignType, setRoundsData]);

    const handleRoundChange = (index, field, value) => {
      let updatedRound = null;

      // Update parent rounds state
      const updatedRounds = rounds.map((round, i) => {
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
      if (field === "roundEndDate" && index < rounds.length - 1) {
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

      onRoundsChange(updatedRounds);

      // Cập nhật roundsData khi thay đổi roundStartDate hoặc roundEndDate
      if (
        (field === "roundStartDate" || field === "roundEndDate") &&
        updatedRound
      ) {
        const campaignType = campaignDetail?.campaignType || "Recruitment";
        const roundsCount = getRoundsCountByCampaignType(campaignType);
        const expectedRoundNames = Array.from(
          { length: roundsCount },
          (_, idx) => getRoundNameByIndex(idx, campaignType)
        );

        setRoundsData((prevRoundsData) => {
          const updatedRoundsData = [...prevRoundsData];

          // Tìm rounds liên quan - chỉ rounds của đợt này
          let relatedRounds = [];

          if (updatedRound.campaignRoundId) {
            relatedRounds = updatedRoundsData.filter(
              (r) => r.campaignRoundId === updatedRound.campaignRoundId
            );
          } else {
            const startIdx = index * roundsCount;
            const endIdx = startIdx + roundsCount;

            relatedRounds = updatedRoundsData
              .slice(startIdx, endIdx)
              .filter((r) => expectedRoundNames.includes(r.roundName));
          }

          // Helper function để tìm round trong phạm vi đúng của đợt này
          const findRoundInBatch = (roundName, updatedRoundsData) => {
            if (updatedRound.campaignRoundId) {
              return updatedRoundsData.findIndex(
                (r) =>
                  r.campaignRoundId === updatedRound.campaignRoundId &&
                  r.roundName === roundName
              );
            } else {
              const batchStartIdx = index * roundsCount;
              const batchEndIdx = batchStartIdx + roundsCount;

              for (
                let i = batchStartIdx;
                i < batchEndIdx && i < updatedRoundsData.length;
                i++
              ) {
                if (
                  updatedRoundsData[i].roundName === roundName &&
                  !updatedRoundsData[i].campaignRoundId
                ) {
                  return i;
                }
              }
              return -1;
            }
          };

          if (field === "roundStartDate" && value) {
            const firstRoundName = expectedRoundNames[0];
            const foundRound = relatedRounds.find(
              (r) => r.roundName === firstRoundName
            );

            if (foundRound) {
              const roundIdx = findRoundInBatch(
                firstRoundName,
                updatedRoundsData
              );

              if (roundIdx !== -1) {
                updatedRoundsData[roundIdx] = {
                  ...updatedRoundsData[roundIdx],
                  startDate: value,
                };
              }
            } else {
              const existingRoundIdx = findRoundInBatch(
                firstRoundName,
                updatedRoundsData
              );

              if (existingRoundIdx === -1) {
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
                updatedRoundsData[existingRoundIdx] = {
                  ...updatedRoundsData[existingRoundIdx],
                  startDate: value,
                };
              }
            }
          }

          if (field === "roundEndDate" && value) {
            const lastRoundName =
              expectedRoundNames[expectedRoundNames.length - 1];
            const foundRound = relatedRounds.find(
              (r) => r.roundName === lastRoundName
            );

            if (foundRound) {
              const roundIdx = findRoundInBatch(
                lastRoundName,
                updatedRoundsData
              );

              if (roundIdx !== -1) {
                updatedRoundsData[roundIdx] = {
                  ...updatedRoundsData[roundIdx],
                  endDate: value,
                };
              }
            } else {
              const existingRoundIdx = findRoundInBatch(
                lastRoundName,
                updatedRoundsData
              );

              if (existingRoundIdx === -1) {
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
                updatedRoundsData[existingRoundIdx] = {
                  ...updatedRoundsData[existingRoundIdx],
                  endDate: value,
                };
              }
            }
          }

          return updatedRoundsData;
        });
      }

      // Clear error khi thay đổi
      if (errors[`rounds.${index}.${field}`]) {
        onErrorChange((prev) => ({
          ...prev,
          [`rounds.${index}.${field}`]: "",
        }));
      }
    };

    const addRound = () => {
      const newRounds = [
        ...rounds,
        {
          roundName: `Round ${rounds.length + 1}`,
          roundStartDate: "",
          roundEndDate: "",
          targetQuantity: "",
          description: "",
        },
      ];
      onRoundsChange(newRounds);
    };

    const removeRound = (index) => {
      if (rounds.length > 1) {
        const newRounds = rounds.filter((_, i) => i !== index);
        onRoundsChange(newRounds);
      }
    };

    // Validation functions
    const validateRounds = (
      roundsToValidate,
      errorsToValidate,
      startDateToValidate,
      endDateToValidate
    ) => {
      const newErrors = { ...errorsToValidate };

      // Validate ngày của các đợt
      if (startDateToValidate && endDateToValidate) {
        roundsToValidate.forEach((round, index) => {
          // Validate roundStartDate
          if (round.roundStartDate) {
            if (round.roundStartDate < startDateToValidate) {
              newErrors[`rounds.${index}.roundStartDate`] =
                "Start date of round must be within the campaign date range";
            }
            if (round.roundStartDate > endDateToValidate) {
              newErrors[`rounds.${index}.roundStartDate`] =
                "Start date of round must be before the end date of campaign";
            }

            // Từ đợt 2 trở đi, ngày bắt đầu phải >= ngày kết thúc đợt trước
            if (index > 0) {
              const previousRound = roundsToValidate[index - 1];
              if (previousRound.roundEndDate) {
                if (round.roundStartDate < previousRound.roundEndDate) {
                  newErrors[`rounds.${index}.roundStartDate`] =
                    "Start date of round must be after or equal to the end date of previous round";
                }
              }
            }
          }

          // Validate roundEndDate
          if (round.roundEndDate) {
            if (round.roundEndDate < startDateToValidate) {
              newErrors[`rounds.${index}.roundEndDate`] =
                "End date of round must be within the campaign date range";
            }
            if (round.roundEndDate > endDateToValidate) {
              newErrors[`rounds.${index}.roundEndDate`] =
                "End date of round must be before the end date of campaign";
            }

            // Ngày kết thúc phải >= ngày bắt đầu của đợt
            if (
              round.roundStartDate &&
              round.roundEndDate < round.roundStartDate
            ) {
              newErrors[`rounds.${index}.roundEndDate`] =
                "End date of round must be after or equal to the start date of round";
            }
          }
        });
      }

      roundsToValidate.forEach((round, index) => {
        if (!round.roundName || !round.roundName.trim()) {
          newErrors[`rounds.${index}.roundName`] = "Round name is required";
        }
        if (!round.roundStartDate) {
          newErrors[`rounds.${index}.roundStartDate`] =
            "Start date of round is required";
        }
        if (!round.roundEndDate) {
          newErrors[`rounds.${index}.roundEndDate`] =
            "End date of round is required";
        }
        if (
          round.roundStartDate &&
          round.roundEndDate &&
          round.roundStartDate >= round.roundEndDate
        ) {
          newErrors[`rounds.${index}.roundEndDate`] =
            "End date of round must be after the start date of round";
        }
        if (!round.targetQuantity || parseInt(round.targetQuantity, 10) <= 0) {
          newErrors[`rounds.${index}.targetQuantity`] =
            "Target quantity must be greater than 0 for each round";
        }
        if (!round.description.trim()) {
          newErrors[`rounds.${index}.description`] =
            "Description of round is required";
        }
      });

      return newErrors;
    };

    const validateRoundTargets = () => {
      if (campaignTarget <= 0) {
        toast.error("Please enter a valid campaign target quantity.");
        return false;
      }

      if (rounds.length === 0) {
        toast.error("At least one round is required.");
        return false;
      }

      return true;
    };

    const validateRoundDatesBeforeSave = () => {
      for (let i = 0; i < roundsData.length; i++) {
        const round = roundsData[i];
        if (round.startDate && round.endDate) {
          let startDateStr = round.startDate;
          let endDateStr = round.endDate;

          if (startDateStr.includes("T")) {
            startDateStr = startDateStr.split("T")[0];
          }
          if (endDateStr.includes("T")) {
            endDateStr = endDateStr.split("T")[0];
          }

          const startDate = new Date(startDateStr);
          const endDate = new Date(endDateStr);

          if (startDate >= endDate) {
            return false;
          }
        }
      }
      return true;
    };

    const validateRoundDates = (roundsPayload) => {
      for (let i = 0; i < roundsPayload.length; i++) {
        const round = roundsPayload[i];
        if (round.roundDates && round.roundDates.length > 0) {
          for (let j = 0; j < round.roundDates.length; j++) {
            const roundDate = round.roundDates[j];
            if (roundDate.startDate && roundDate.endDate) {
              let startDateStr = roundDate.startDate;
              let endDateStr = roundDate.endDate;

              if (startDateStr.includes("T")) {
                startDateStr = startDateStr.split("T")[0];
              }
              if (endDateStr.includes("T")) {
                endDateStr = endDateStr.split("T")[0];
              }

              const startDate = new Date(startDateStr);
              const endDate = new Date(endDateStr);

              if (startDate >= endDate) {
                return false;
              }
            }
          }
        }
      }
      return true;
    };

    const mapRoundsToPayload = (roundsToMap, errorsToMap) => {
      return roundsToMap
        .map((round, roundIndex) => {
          const hasError =
            errorsToMap[`rounds.${roundIndex}.roundName`] ||
            errorsToMap[`rounds.${roundIndex}.roundStartDate`] ||
            errorsToMap[`rounds.${roundIndex}.roundEndDate`] ||
            errorsToMap[`rounds.${roundIndex}.targetQuantity`] ||
            errorsToMap[`rounds.${roundIndex}.description`];

          if (hasError) {
            return null;
          }

          if (
            !round.roundName ||
            !round.roundStartDate ||
            !round.roundEndDate ||
            !round.targetQuantity ||
            !round.description
          ) {
            return null;
          }

          let roundDates = [];
          const campaignType = campaignDetail?.campaignType || "Recruitment";
          const roundsCount = getRoundsCountByCampaignType(campaignType);
          const expectedRoundNames = Array.from(
            { length: roundsCount },
            (_, idx) => getRoundNameByIndex(idx, campaignType)
          );

          let relatedRounds = [];

          if (round.campaignRoundId) {
            relatedRounds = roundsData.filter(
              (r) => r.campaignRoundId === round.campaignRoundId
            );
          } else {
            const startIdx = roundIndex * roundsCount;
            const endIdx = startIdx + roundsCount;

            relatedRounds = roundsData
              .slice(startIdx, endIdx)
              .filter((r) => expectedRoundNames.includes(r.roundName));
          }

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
        .filter((round) => round !== null);
    };

    // Expose functions to parent via ref
    useImperativeHandle(ref, () => ({
      validateRounds,
      validateRoundTargets,
      validateRoundDatesBeforeSave,
      validateRoundDates,
      mapRoundsToPayload,
      getRoundNameByIndex,
      getRoundsCountByCampaignType,
    }));

    return (
      <div className="bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="font-semibold text-slate-800">
            Recruitment rounds plan
          </div>
          <button
            type="button"
            onClick={addRound}
            className={`px-3 py-1 text-sm text-white rounded-md bg-blue-600 hover:bg-blue-700
                  `}
          >
            + Add round
          </button>
        </div>

        <div className="p-5">
          <div className="space-y-4">
            {rounds.map((round, index) => (
              <div
                key={index}
                className="pb-10 overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-800">
                      {round.roundName}
                    </span>
                    {rounds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRound(index)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        ✕ Delete
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700">
                        Round name *
                      </label>
                      <input
                        type="text"
                        value={round.roundName}
                        onChange={(e) =>
                          handleRoundChange(index, "roundName", e.target.value)
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
                        Start date *
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
                          index > 0 && rounds[index - 1]?.roundEndDate
                            ? rounds[index - 1].roundEndDate
                            : startDate || todayString
                        }
                        max={endDate || undefined}
                      />
                      {errors[`rounds.${index}.roundStartDate`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`rounds.${index}.roundStartDate`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700">
                        End date *
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
                          (index > 0 && rounds[index - 1]?.roundEndDate
                            ? rounds[index - 1].roundEndDate
                            : startDate || todayString)
                        }
                        max={endDate || undefined}
                      />
                      {errors[`rounds.${index}.roundEndDate`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`rounds.${index}.roundEndDate`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700">
                        Target quantity *
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
                        Description
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
                  const campaignType =
                    campaignDetail?.campaignType || "Recruitment";
                  const roundsCount =
                    getRoundsCountByCampaignType(campaignType);
                  const expectedRoundNames = Array.from(
                    { length: roundsCount },
                    (_, idx) => getRoundNameByIndex(idx, campaignType)
                  );

                  let relatedRounds = [];

                  if (round.campaignRoundId) {
                    relatedRounds = roundsData.filter(
                      (r) => r.campaignRoundId === round.campaignRoundId
                    );
                  } else {
                    const startIdx = index * roundsCount;
                    const endIdx = startIdx + roundsCount;

                    relatedRounds = roundsData
                      .slice(startIdx, endIdx)
                      .filter((r) => expectedRoundNames.includes(r.roundName));
                  }

                  const defaultRounds = expectedRoundNames.map(
                    (roundName, roundIdx) => {
                      const foundRound = relatedRounds.find(
                        (r) => r.roundName === roundName
                      );

                      let startDate = foundRound?.startDate || "";
                      if (
                        roundIdx === 0 &&
                        !startDate &&
                        round.roundStartDate
                      ) {
                        startDate = round.roundStartDate;
                      }

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

                  const minDate = round.roundStartDate || undefined;
                  const maxDate = round.roundEndDate || undefined;

                  const checkDateOverlap = (
                    newStartDate,
                    newEndDate,
                    currentRoundName,
                    currentCampaignRoundId,
                    allRoundsData,
                    isCheckingStartDate = false
                  ) => {
                    if (!newStartDate && !newEndDate) {
                      return false;
                    }

                    let otherRounds = [];

                    if (round.campaignRoundId) {
                      otherRounds = allRoundsData.filter(
                        (r) =>
                          r.campaignRoundId === round.campaignRoundId &&
                          r.roundName !== currentRoundName &&
                          (r.startDate || r.endDate)
                      );
                    } else {
                      const startIdx = index * roundsCount;
                      const endIdx = startIdx + roundsCount;

                      const roundsInBatch = allRoundsData.slice(
                        startIdx,
                        endIdx
                      );

                      otherRounds = roundsInBatch.filter(
                        (r) =>
                          r.roundName !== currentRoundName &&
                          !r.campaignRoundId &&
                          (r.startDate || r.endDate)
                      );
                    }

                    for (const otherRound of otherRounds) {
                      const otherStart = otherRound.startDate;
                      const otherEnd = otherRound.endDate;

                      if (!otherStart && !otherEnd) {
                        continue;
                      }

                      if (isCheckingStartDate && newStartDate && !newEndDate) {
                        if (otherStart && otherEnd) {
                          if (
                            (otherStart <= newStartDate &&
                              newStartDate <= otherEnd) ||
                            newStartDate === otherStart ||
                            newStartDate === otherEnd
                          ) {
                            return true;
                          }
                        } else if (otherStart && !otherEnd) {
                          if (newStartDate === otherStart) {
                            return true;
                          }
                        } else if (!otherStart && otherEnd) {
                          if (newStartDate === otherEnd) {
                            return true;
                          }
                        }
                      } else if (
                        !isCheckingStartDate &&
                        newEndDate &&
                        !newStartDate
                      ) {
                        if (otherStart && otherEnd) {
                          if (
                            (otherStart <= newEndDate &&
                              newEndDate <= otherEnd) ||
                            newEndDate === otherStart ||
                            newEndDate === otherEnd
                          ) {
                            return true;
                          }
                        } else if (otherStart && !otherEnd) {
                          if (newEndDate === otherStart) {
                            return true;
                          }
                        } else if (!otherStart && otherEnd) {
                          if (newEndDate === otherEnd) {
                            return true;
                          }
                        }
                      } else if (newStartDate && newEndDate) {
                        if (otherStart && otherEnd) {
                          if (
                            (otherStart <= newStartDate &&
                              newStartDate < otherEnd) ||
                            (otherStart < newEndDate &&
                              newEndDate <= otherEnd) ||
                            (newStartDate <= otherStart &&
                              otherStart < newEndDate) ||
                            (newStartDate < otherEnd &&
                              otherEnd <= newEndDate) ||
                            newStartDate === otherStart ||
                            newStartDate === otherEnd ||
                            newEndDate === otherStart ||
                            newEndDate === otherEnd
                          ) {
                            return true;
                          }
                        } else if (otherStart && !otherEnd) {
                          if (
                            newStartDate <= otherStart &&
                            otherStart < newEndDate
                          ) {
                            return true;
                          }
                        } else if (!otherStart && otherEnd) {
                          if (
                            newStartDate < otherEnd &&
                            otherEnd <= newEndDate
                          ) {
                            return true;
                          }
                        }
                      }
                    }

                    return false;
                  };

                  return (
                    <div className="mt-4 space-y-4">
                      {defaultRounds.map((dotRound, roundIndex) => {
                        let startDateMin = minDate;
                        if (roundIndex > 0) {
                          const previousRound = defaultRounds[roundIndex - 1];
                          startDateMin =
                            previousRound.endDate || minDate || undefined;
                        }

                        return (
                          <div
                            key={`${round.campaignRoundId}-${roundIndex}`}
                            className="mx-4 overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200"
                          >
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
                                    Start date
                                  </label>
                                  <input
                                    type="date"
                                    value={dotRound.startDate || ""}
                                    min={startDateMin}
                                    max={maxDate}
                                    onChange={(e) => {
                                      const newStartDate = e.target.value;
                                      const currentEndDate =
                                        dotRound.endDate || "";

                                      if (
                                        currentEndDate &&
                                        newStartDate >= currentEndDate
                                      ) {
                                        toast.error(
                                          `Start date must be before the end date of this round. Please select a different date.`
                                        );
                                        return;
                                      }

                                      if (roundIndex > 0) {
                                        const previousRound =
                                          defaultRounds[roundIndex - 1];
                                        if (
                                          previousRound.endDate &&
                                          newStartDate <= previousRound.endDate
                                        ) {
                                          toast.error(
                                            `Start date of this round must be after the end date of previous round (${previousRound.roundName}). Please select a different date.`
                                          );
                                          return;
                                        }
                                      }

                                      const hasOverlap = checkDateOverlap(
                                        newStartDate,
                                        currentEndDate,
                                        dotRound.roundName,
                                        round.campaignRoundId,
                                        roundsData,
                                        true
                                      );

                                      if (hasOverlap) {
                                        toast.error(
                                          `Start date overlaps with the time range of another round in this campaign. Please select a different date.`
                                        );
                                        return;
                                      }

                                      let existingRoundIdx = -1;

                                      if (round.campaignRoundId) {
                                        existingRoundIdx = roundsData.findIndex(
                                          (r) =>
                                            r.campaignRoundId ===
                                              round.campaignRoundId &&
                                            r.roundName === dotRound.roundName
                                        );
                                      } else {
                                        const startIdx = index * roundsCount;
                                        const endIdx = startIdx + roundsCount;

                                        const roundsInRange = roundsData.slice(
                                          startIdx,
                                          endIdx
                                        );

                                        existingRoundIdx =
                                          roundsInRange.findIndex(
                                            (r) =>
                                              r.roundName === dotRound.roundName
                                          );

                                        if (existingRoundIdx !== -1) {
                                          existingRoundIdx += startIdx;
                                        }
                                      }

                                      const updatedRounds = [...roundsData];

                                      if (existingRoundIdx !== -1) {
                                        updatedRounds[existingRoundIdx] = {
                                          ...updatedRounds[existingRoundIdx],
                                          startDate: newStartDate,
                                        };
                                        if (
                                          updatedRounds[existingRoundIdx]
                                            .endDate &&
                                          updatedRounds[existingRoundIdx]
                                            .endDate <= newStartDate
                                        ) {
                                          const nextDay = new Date(
                                            newStartDate
                                          );
                                          nextDay.setDate(
                                            nextDay.getDate() + 1
                                          );
                                          updatedRounds[
                                            existingRoundIdx
                                          ].endDate = nextDay
                                            .toISOString()
                                            .split("T")[0];
                                        }
                                      } else {
                                        updatedRounds.push({
                                          roundId: null,
                                          roundName: dotRound.roundName,
                                          campaignRoundId:
                                            round.campaignRoundId,
                                          startDate: newStartDate,
                                          endDate: currentEndDate,
                                        });
                                      }
                                      setRoundsData(updatedRounds);
                                    }}
                                    className="w-full px-2 py-1 text-xs border rounded border-slate-300"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-slate-700">
                                    End date
                                  </label>
                                  <input
                                    type="date"
                                    value={dotRound.endDate || ""}
                                    min={
                                      dotRound.startDate
                                        ? (() => {
                                            const startDate = new Date(
                                              dotRound.startDate
                                            );
                                            startDate.setDate(
                                              startDate.getDate() + 1
                                            );
                                            return startDate
                                              .toISOString()
                                              .split("T")[0];
                                          })()
                                        : startDateMin || undefined
                                    }
                                    max={maxDate || undefined}
                                    onChange={(e) => {
                                      const newEndDate = e.target.value;
                                      const currentStartDate =
                                        dotRound.startDate || "";

                                      if (
                                        currentStartDate &&
                                        newEndDate <= currentStartDate
                                      ) {
                                        toast.error(
                                          `End date must be after the start date of this round. Please select a different date.`
                                        );
                                        return;
                                      }

                                      const hasOverlap = checkDateOverlap(
                                        currentStartDate,
                                        newEndDate,
                                        dotRound.roundName,
                                        round.campaignRoundId,
                                        roundsData,
                                        false
                                      );

                                      if (hasOverlap) {
                                        toast.error(
                                          `End date overlaps with the time range of another round in this campaign. Please select a different date.`
                                        );
                                        return;
                                      }

                                      let existingRoundIdx = -1;

                                      if (round.campaignRoundId) {
                                        existingRoundIdx = roundsData.findIndex(
                                          (r) =>
                                            r.campaignRoundId ===
                                              round.campaignRoundId &&
                                            r.roundName === dotRound.roundName
                                        );
                                      } else {
                                        const startIdx = index * roundsCount;
                                        const endIdx = startIdx + roundsCount;

                                        const roundsInRange = roundsData.slice(
                                          startIdx,
                                          endIdx
                                        );

                                        existingRoundIdx =
                                          roundsInRange.findIndex(
                                            (r) =>
                                              r.roundName === dotRound.roundName
                                          );

                                        if (existingRoundIdx !== -1) {
                                          existingRoundIdx += startIdx;
                                        }
                                      }

                                      const updatedRounds = [...roundsData];

                                      if (existingRoundIdx !== -1) {
                                        updatedRounds[existingRoundIdx] = {
                                          ...updatedRounds[existingRoundIdx],
                                          endDate: newEndDate,
                                        };
                                        if (
                                          updatedRounds[existingRoundIdx]
                                            .startDate &&
                                          updatedRounds[existingRoundIdx]
                                            .startDate >= newEndDate
                                        ) {
                                          const prevDay = new Date(newEndDate);
                                          prevDay.setDate(
                                            prevDay.getDate() - 1
                                          );
                                          updatedRounds[
                                            existingRoundIdx
                                          ].startDate = prevDay
                                            .toISOString()
                                            .split("T")[0];
                                        }
                                      } else {
                                        updatedRounds.push({
                                          roundId: null,
                                          roundName: dotRound.roundName,
                                          campaignRoundId:
                                            round.campaignRoundId,
                                          startDate: currentStartDate,
                                          endDate: newEndDate,
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
    );
  }
);

CreateRound.displayName = "CreateRound";

export default CreateRound;
