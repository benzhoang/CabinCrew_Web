import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onLangChange } from "../../../i18n";
import {
  getInterviewCriteriasPromotion,
  submitInterviewResult,
  getInterviewResults,
} from "../../../service/api2";
import { formatDateFromAPI } from "../../../config/formatDate";
import { toast } from "react-toastify";

const ExaminerCabinCrewEvaluationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [, setLangVersion] = useState(0);

  // Get candidate and batch data from location state
  const candidate = location.state?.candidate || location.state;
  const batchData = location.state?.batchData;

  // Evaluation criteria state - dynamically initialized from API
  const [evaluations, setEvaluations] = useState({});

  const [generalComments, setGeneralComments] = useState("");
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const [criteriaData, setCriteriaData] = useState(null);
  const [submittedCount, setSubmittedCount] = useState(0); // Number of times already evaluated
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [checkingCount, setCheckingCount] = useState(true); // Checking submitted count

  // Countdown timer state (30 minutes = 1800 seconds)
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [isTimerExpired, setIsTimerExpired] = useState(false);

  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  const navigateBackToApplications = () => {
    if (batchData?.campaignId && batchData?.campaignRoundId) {
      navigate(
        `/examiner/campaigns/${batchData.campaignId}/applications/${batchData.campaignRoundId}`,
        {
          state: {
            roundId: batchData.roundId,
          },
        }
      );
    } else {
      navigate(-1);
    }
  };

  // Fetch interview criteria data
  useEffect(() => {
    const fetchCriteria = async () => {
      setIsLoadingCriteria(true);
      try {
        const response = await getInterviewCriteriasPromotion();
        if (response.success) {
          setCriteriaData(response.data);
          // Initialize evaluations state from API data
          // Filter interviewCriteriaItemId from 18 to 27
          const initialEvaluations = {};
          if (Array.isArray(response.data)) {
            response.data.forEach((section) => {
              if (Array.isArray(section.items)) {
                section.items.forEach((item) => {
                  const criteriaId = item.interviewCriteriaItemId;
                  // Only include criteria with ID from 18 to 27
                  if (criteriaId >= 18 && criteriaId <= 27) {
                    initialEvaluations[criteriaId] = {
                      score: 10,
                      comment: "",
                      criteria: item.criteria,
                    };
                  }
                });
              }
            });
          }
          setEvaluations(initialEvaluations);
        } else {
          console.error("Error fetching criteria:", response.error);
          toast.error(response.error || "Failed to load evaluation criteria");
        }
      } catch (error) {
        console.error("Error fetching criteria:", error);
        toast.error("Failed to load evaluation criteria");
      } finally {
        setIsLoadingCriteria(false);
      }
    };

    fetchCriteria();
  }, []);

  // Check submitted count
  useEffect(() => {
    const checkSubmittedCount = async () => {
      if (!candidate?.activityId) {
        setCheckingCount(false);
        return;
      }

      try {
        const response = await getInterviewResults(candidate.activityId);
        if (response.success && Array.isArray(response.data)) {
          setSubmittedCount(response.data.length);
        } else {
          setSubmittedCount(0);
        }
      } catch (error) {
        console.error("Error checking submitted count:", error);
        setSubmittedCount(0);
      } finally {
        setCheckingCount(false);
      }
    };

    checkSubmittedCount();
  }, [candidate?.activityId]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Only run once on mount

  // Format time remaining to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleScoreChange = (criteriaItemId, score) => {
    setEvaluations((prev) => ({
      ...prev,
      [criteriaItemId]: {
        ...prev[criteriaItemId],
        score: parseInt(score) || 0,
      },
    }));
  };

  const handleCommentChange = (criteriaItemId, comment) => {
    setEvaluations((prev) => ({
      ...prev,
      [criteriaItemId]: {
        ...prev[criteriaItemId],
        comment: comment,
      },
    }));
  };

  const formatEvaluationsForSubmit = () => {
    return Object.entries(evaluations)
      .filter(([criteriaId]) => {
        const id = Number(criteriaId);
        return id >= 18 && id <= 27;
      })
      .map(([criterionId, value]) => {
        const parsedId = Number(criterionId);
        return {
          interviewCriteriaItemId: Number.isNaN(parsedId)
            ? criterionId
            : parsedId,
          score: value?.score || 0,
          comment: value?.comment || "",
        };
      });
  };

  const handleSubmit = async () => {
    // Check if already submitted 3 times
    if (submittedCount >= 3) {
      toast.error("Already evaluated 3 times. Cannot submit more evaluations.");
      return;
    }

    // Check activityId
    const activityId = candidate?.activityId;
    if (!activityId) {
      toast.error("Activity ID not found. Please try again.");
      return;
    }

    // Type is 2 for Promotion
    const type = 2;

    // Prepare data to submit
    const choices = formatEvaluationsForSubmit();

    if (choices.length === 0) {
      toast.error("Please evaluate at least one criterion.");
      return;
    }

    setLoadingSubmit(true);
    try {
      const response = await submitInterviewResult({
        activityId: activityId,
        comment: generalComments || "",
        type: type,
        choices: choices,
      });

      if (response.success) {
        // Show appropriate message for evaluation submission
        toast.success("Evaluation submitted successfully!");
        // Increment submitted count
        const newCount = submittedCount + 1;
        setSubmittedCount(newCount);
        // Sau khi chấm (kể cả lần cuối) đều quay về danh sách applications của round
        navigateBackToApplications();
      } else {
        toast.error(
          response.error || "Failed to submit evaluation. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error(
        "An error occurred while submitting evaluation. Please try again."
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!candidate) {
    return (
      <div className="p-6">
        <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
          <p className="text-slate-500">Cabin crew information not found</p>
          <button
            onClick={() => navigate("/examiner/applications")}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="text-white bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="px-6 py-6 mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={navigateBackToApplications}
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
                  Evaluate Cabin Crew
                </h1>
                <p className="mt-1 text-sm text-white/90">
                  Evaluate interview criteria for cabin crew
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Timer (fixed, follows scroll) */}
      <div className="fixed z-50 top-4 right-4">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-white border-2 ${
            isTimerExpired
              ? "border-red-500"
              : timeRemaining <= 300
              ? "border-orange-500"
              : "border-slate-300"
          } transition-all duration-300`}
        >
          <svg
            className={`w-5 h-5 ${
              isTimerExpired
                ? "text-red-500"
                : timeRemaining <= 300
                ? "text-orange-500"
                : "text-slate-700"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex flex-col">
            <span className="text-xs text-slate-600">Time remaining</span>
            <span className="text-2xl font-bold tracking-wider text-black">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Candidate Information */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            Cabin Crew Information
          </h2>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-24 h-32 overflow-hidden rounded-md bg-slate-100">
              <img
                src={
                  candidate.photo ||
                  "https://via.placeholder.com/96x128/cccccc/666666?text=No+Photo"
                }
                alt={candidate.name}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/96x128/cccccc/666666?text=No+Photo";
                }}
              />
            </div>
            <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <span className="block mb-1 text-sm text-slate-600">
                  Full Name:
                </span>
                <p className="font-medium text-slate-800">
                  {candidate.name || "—"}
                </p>
              </div>
              <div>
                <span className="block mb-1 text-sm text-slate-600">
                  Email:
                </span>
                <p className="font-medium text-slate-800">
                  {candidate.email || "—"}
                </p>
              </div>
              <div>
                <span className="block mb-1 text-sm text-slate-600">
                  Phone:
                </span>
                <p className="font-medium text-slate-800">
                  {candidate.phone || "—"}
                </p>
              </div>
              <div>
                <span className="block mb-1 text-sm text-slate-600">
                  Applied date:
                </span>
                <p className="font-medium text-slate-800">
                  {formatDateFromAPI(candidate.appliedDate || "") || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Scorecard Header */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
          <h2 className="mb-6 text-2xl font-bold text-center text-slate-800">
            CABIN CREW INTERVIEW SCORECARD
          </h2>
          {/* Assessment Values Legend */}
          <div className="p-4 mb-6 rounded-lg bg-slate-50">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Assessment Values / Scoring Legend:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              <div>
                <span className="font-medium">Excellent:</span> 9-10 points
              </div>
              <div>
                <span className="font-medium">Good:</span> 7-8 points
              </div>
              <div>
                <span className="font-medium">Fair:</span> 5-6 points
              </div>
              <div>
                <span className="font-medium">Unsatisfactory:</span> 1-4 points
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Assessment Sections from API */}
        {isLoadingCriteria ? (
          <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Loading evaluation criteria...
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Please wait a moment.
                </p>
              </div>
              <div className="w-6 h-6 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />
            </div>
          </div>
        ) : criteriaData &&
          Array.isArray(criteriaData) &&
          criteriaData.length > 0 ? (
          criteriaData.map((section, sectionIndex) => {
            // Filter items to only show interviewCriteriaItemId from 18 to 27
            const filteredItems =
              section.items && Array.isArray(section.items)
                ? section.items.filter(
                    (item) =>
                      item.interviewCriteriaItemId >= 18 &&
                      item.interviewCriteriaItemId <= 27
                  )
                : [];

            if (filteredItems.length === 0) {
              return null;
            }

            return (
              <div
                key={sectionIndex}
                className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200"
              >
                <h2 className="mb-4 text-xl font-semibold text-slate-800">
                  {section.title || `Section ${sectionIndex + 1}`}
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-[45%]" />
                      <col className="w-[15%]" />
                      <col className="w-[40%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-slate-300">
                        <th className="px-4 py-3 text-sm font-semibold text-left text-slate-700">
                          Criteria
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-center text-slate-700">
                          Assessment Score
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-left text-slate-700">
                          Comments / Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, itemIndex) => {
                        const criteriaId = item.interviewCriteriaItemId;
                        const evaluation = evaluations[criteriaId] || {
                          score: 10,
                          comment: "",
                        };

                        return (
                          <tr
                            key={criteriaId}
                            className="border-b border-slate-200 hover:bg-slate-50"
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-800">
                                {itemIndex + 1}. {item.criteria}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select
                                value={evaluation.score}
                                onChange={(e) =>
                                  handleScoreChange(criteriaId, e.target.value)
                                }
                                className="w-20 px-2 py-1 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                  <option key={num} value={num}>
                                    {num}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={evaluation.comment || ""}
                                onChange={(e) =>
                                  handleCommentChange(
                                    criteriaId,
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter comments/remarks..."
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
            <p className="text-center text-slate-500">
              No evaluation criteria data
            </p>
          </div>
        )}

        {/* Total Score and Result */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Comments/Remarks
            </label>
            <textarea
              placeholder="Enter general comments/remarks about the candidate..."
              value={generalComments}
              onChange={(e) => setGeneralComments(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="5"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {!checkingCount && submittedCount < 3 && (
            <button
              onClick={handleSubmit}
              disabled={loadingSubmit}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingSubmit ? "Submitting..." : "Submit Evaluation"}
            </button>
          )}
          {!checkingCount && submittedCount >= 3 && (
            <div className="px-6 py-2.5 bg-slate-100 text-slate-500 rounded-lg font-medium">
              Already evaluated 3 times
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExaminerCabinCrewEvaluationPage;
