import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { t, onLangChange } from "../../i18n";
import { getMyTests } from "../../service/api2.js";

const TestListPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]); // Danh sách tests từ API
  const [isLoadingTests, setIsLoadingTests] = useState(true); // Loading state khi fetch tests
  const [expandedExamId, setExpandedExamId] = useState(null); // ID của đề thi đang mở dropdown
  const [passwords, setPasswords] = useState({}); // Lưu mật khẩu cho từng đề thi
  const [isLoading, setIsLoading] = useState({}); // Loading state cho từng đề thi
  const [, setLangVersion] = useState(0); // Force re-render when language changes

  // re-render on language change
  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  // Fetch tests from API
  useEffect(() => {
    const fetchTests = async () => {
      setIsLoadingTests(true);
      try {
        const response = await getMyTests();
        if (response.success) {
          // Handle different response structures
          let testsData = [];
          if (response.data?.tests && Array.isArray(response.data.tests)) {
            testsData = response.data.tests;
          } else if (Array.isArray(response.data)) {
            testsData = response.data;
          }
          setTests(testsData);
        } else {
          toast.error(response.error || "Cannot load the exam list");
          setTests([]);
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
        toast.error("An error occurred while loading the exam list");
        setTests([]);
      } finally {
        setIsLoadingTests(false);
      }
    };

    fetchTests();
  }, []);

  const handlePasswordChange = (examId, value) => {
    setPasswords({
      ...passwords,
      [examId]: value,
    });
  };

  const toggleDropdown = (examId) => {
    const selectedTest = tests.find((test) => test.testId === examId);
    // Không cho mở dropdown nếu đã hoàn thành
    if (selectedTest?.hasCompleted) {
      return;
    }

    if (expandedExamId === examId) {
      setExpandedExamId(null);
    } else {
      setExpandedExamId(examId);
      // Reset password khi mở dropdown mới
      if (!passwords[examId]) {
        setPasswords({ ...passwords, [examId]: "" });
      }
    }
  };

  const handleSubmit = async (testId) => {
    const password = passwords[testId] || "";

    // Validate password
    if (!password.trim()) {
      toast.error(
        t("exam_password_required") || "Please enter the exam password"
      );
      return;
    }

    setIsLoading({ ...isLoading, [testId]: true });

    // Find selected test
    const selectedTest = tests.find((test) => test.testId === testId);

    if (!selectedTest) {
      toast.error("Exam not found");
      setIsLoading({ ...isLoading, [testId]: false });
      return;
    }

    setTimeout(() => {
      setIsLoading({ ...isLoading, [testId]: false });

      // Navigate to exam page với thông tin exam
      setTimeout(() => {
        // Lưu examCode vào localStorage để có thể lấy lại nếu state bị mất
        if (selectedTest.joinCode || selectedTest.code) {
          localStorage.setItem(
            `examCode_${selectedTest.testId}`,
            selectedTest.joinCode || selectedTest.code
          );
        }

        navigate(`/cabin-crew/exams/${selectedTest.testId}`, {
          state: {
            examType: selectedTest.testType,
            examId: selectedTest.testId,
            examName: selectedTest.testName,
            examCode: selectedTest.joinCode || selectedTest.code || "",
            duration: selectedTest.durationInMinutes,
            totalQuestions: selectedTest.totalQuestions || 0,
            roundId: selectedTest.roundId,
            roundType: selectedTest.roundType,
            maxScore: selectedTest.maxScore,
          },
        });
      }, 1500);
    }, 1000);
  };

  if (isLoadingTests) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-gray-500">Loading exam list...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-blue-100 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => navigate("/cabin-crew/promotion-stages")}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </button>
          </div>

          {/* Title Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              {t("exam_list_title") || "Exam list"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t("exam_list_subtitle") ||
                "Select an exam and enter the password to start the exam"}
            </p>
          </div>
        </div>

        {/* Exam List */}
        {tests.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">
              {t("no_tests_available") || "No exams available"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <div
                key={test.testId}
                className="overflow-hidden transition-all duration-200 bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl"
              >
                {/* Exam Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {test.testName}
                        </h3>
                        {test.hasCompleted && (
                          <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                            {t("completed") || "Completed"}
                          </span>
                        )}
                      </div>
                      <p className="mb-4 text-sm text-gray-600">
                        Practical exam - Round {test.roundId}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-700">
                        <div>
                          <span>Time </span>
                          <span className="font-semibold">
                            {test.durationInMinutes} minutes
                          </span>
                        </div>
                        <div>
                          <span>Maximum score </span>
                          <span className="font-semibold">{test.maxScore}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDropdown(test.testId)}
                      disabled={test.hasCompleted}
                      className={`px-6 py-3 ml-4 font-medium text-white transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap ${
                        test.hasCompleted
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-800 hover:bg-blue-900"
                      }`}
                    >
                      {test.hasCompleted
                        ? t("completed") || "Completed"
                        : expandedExamId === test.testId
                        ? t("close") || "Close"
                        : t("enter_exam") || "Enter exam"}
                    </button>
                  </div>
                </div>

                {/* Password Dropdown - Chỉ hiển thị khi chưa hoàn thành */}
                {expandedExamId === test.testId && !test.hasCompleted && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <label
                          htmlFor={`password-${test.testId}`}
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          {t("exam_password_label") || "Exam password"}
                        </label>
                        <input
                          id={`password-${test.testId}`}
                          type="text"
                          value={passwords[test.testId] || ""}
                          onChange={(e) =>
                            handlePasswordChange(test.testId, e.target.value)
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSubmit(test.testId);
                            }
                          }}
                          className="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-500 transition-colors duration-200 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={
                            t("exam_password_placeholder") ||
                            "Enter the exam password"
                          }
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => handleSubmit(test.testId)}
                        disabled={isLoading[test.testId]}
                        className="px-6 py-3 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isLoading[test.testId] ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                            {t("loading") || "Processing..."}
                          </div>
                        ) : (
                          t("confirm") || "Confirm"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestListPage;
