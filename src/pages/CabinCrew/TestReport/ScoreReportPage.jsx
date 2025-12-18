import React, { useEffect, useState } from "react";
import { getMyTests } from "../../../service/api2";
import { useNavigate } from "react-router-dom";

const ScoreReportPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmptyState, setIsEmptyState] = useState(false); // Track if it's an empty state (0 tests) vs actual error
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      setError(null);
      setIsEmptyState(false);
      try {
        const result = await getMyTests();
        console.log("=== getMyTests result ===", result);

        if (result?.status === 401) {
          setError("Please login to view your test scores.");
          setTests([]);
          setIsEmptyState(false);
          return;
        }

        if (result.success) {
          // Lấy mảng tests từ result.data.tests
          const testsArray = result.data?.tests || [];

          if (testsArray.length === 0) {
            setTests([]);
            setError(null); // Clear any error when there are 0 tests (this is a valid state, not an error)
            setIsEmptyState(true); // Mark as empty state, not an error
            // Don't show any message when there are 0 tests, even if API returns a success message like "Retrieved 0 test(s) for user successfully"
            return;
          }

          // If we have tests, also clear any previous error state
          setError(null);
          setIsEmptyState(false);

          // Map dữ liệu từ API response
          const mappedTests = testsArray.map((test) => {
            // Xác định loại bài test (Listening / Speaking / Practical) từ test.testType
            // Giống logic ở pages/Candidate/Test.jsx để đồng bộ hiển thị
            let examType = "Listening";
            let examTypeClass = "bg-blue-100 text-blue-800";

            const rawTestType = test.testType;

            if (
              rawTestType === "English Listening" ||
              rawTestType === "EnglishListening"
            ) {
              examType = "Listening";
              examTypeClass = "bg-blue-100 text-blue-800";
            } else if (
              rawTestType === "English Speaking" ||
              rawTestType === "EnglishSpeaking"
            ) {
              examType = "Speaking";
              examTypeClass = "bg-purple-100 text-purple-800";
            } else if (rawTestType === "Practical") {
              examType = "Practical";
              examTypeClass = "bg-green-100 text-green-800";
            }

            return {
              id: test.testId,
              name: test.testName || "Test",
              code: test.joinCode || "",
              duration: test.durationInMinutes || 0,
              type: examType,
              typeClass: examTypeClass,
              maxScore: test.maxScore || 0,
              roundId: test.roundId,
              roundType: test.roundType,
              roundStartDate: test.roundStartDate,
              roundEndDate: test.roundEndDate,
              hasCompleted: test.hasCompleted || false,
            };
          });

          setTests(mappedTests);
          setIsEmptyState(false);
        } else {
          // Only set error if it's a real error, not just empty data
          const testsArray = result.data?.tests || [];
          if (testsArray.length === 0) {
            // If there are 0 tests, treat it as empty state, not error
            setTests([]);
            setError(null);
            setIsEmptyState(true);
          } else {
            setError(result.error || "Cannot load test list");
            setTests([]);
            setIsEmptyState(false);
          }
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          setError("Please login to view your test scores.");
        } else {
          setError(err.message || "Cannot load test list");
        }
        setTests([]);
        setIsEmptyState(false);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const handleViewDetail = (test) => {
    // Điều hướng đến trang kết quả chi tiết
    navigate(`/cabin-crew/score-report/${test.id}`, {
      state: {
        examType: test.type,
        examId: test.id,
        examName: test.name,
        examCode: test.code,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        roundId: test.roundId,
        roundType: test.roundType,
        maxScore: test.maxScore,
        score: test.score,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-white">
        <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="mt-4 text-gray-600">Loading test list...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            View test scores
          </h1>
          <p className="text-gray-600">View your test scores</p>
        </div>

        {error && !isEmptyState && (
          <div className="p-4 mb-6 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        {/* Tests List */}
        {tests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg shadow">
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
              No test found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You have no tests in the list
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className="transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-3">
                        <h3 className="mb-1 text-lg font-semibold text-gray-900">
                          {test.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${test.typeClass}`}
                        >
                          {test.type}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Time: {test.duration} minutes</span>
                        </div>
                        {test.roundStartDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
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
                            <span>
                              Start date: {formatDate(test.roundStartDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={() => handleViewDetail(test)}
                        className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreReportPage;
