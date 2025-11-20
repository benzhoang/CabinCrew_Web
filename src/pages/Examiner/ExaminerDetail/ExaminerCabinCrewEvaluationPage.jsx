import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { onLangChange } from "../../../i18n";

const ExaminerCabinCrewEvaluationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [, setLangVersion] = useState(0);

  // Get candidate and batch data from location state
  const candidate = location.state?.candidate || location.state;
  const batchData = location.state?.batchData;

  // Interview Scorecard header info
  const [headerInfo, setHeaderInfo] = useState({
    date: new Date().toISOString().split("T")[0],
    applicantName: "",
    department: "",
    position: candidate?.position || "",
    availabilityDate: "",
  });

  // Evaluation criteria state - 10 criteria with scores (1-10) and comments
  const [evaluations, setEvaluations] = useState({
    // A. TALENT SHOW ASSESSMENT (3 criteria)
    maturityAndConfidenceLevel: { score: 1, comment: "" },
    funAndFriendlyAttitude: { score: 1, comment: "" },
    teamworkSpirit: { score: 1, comment: "" },
    // B. PERSONALITY ASSESSMENT (7 criteria)
    appearance: { score: 1, comment: "" },
    listeningAndAnsweringSkills: { score: 1, comment: "" },
    honestStraightforwardAndTrustworthy: { score: 1, comment: "" },
    customerServiceMindset: { score: 1, comment: "" },
    relevantExperience: { score: 1, comment: "" },
    careerGoalAndIntention: { score: 1, comment: "" },
    englishProficiency: { score: 1, comment: "" },
  });

  const [result] = useState(""); // PASS, FAIL, or RESERVED
  const [generalComments, setGeneralComments] = useState("");

  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  useEffect(() => {
    if (candidate) {
      setHeaderInfo((prev) => ({
        ...prev,
        applicantName: candidate.name || "",
        position: candidate.position || prev.position,
      }));
    }
  }, [candidate]);

  // Calculate total score
  const totalScore = Object.values(evaluations).reduce((sum, criterion) => {
    return sum + (criterion.score || 0);
  }, 0);

  const handleScoreChange = (criterionKey, score) => {
    setEvaluations((prev) => ({
      ...prev,
      [criterionKey]: {
        ...prev[criterionKey],
        score: parseInt(score) || 0,
      },
    }));
  };

  const handleCommentChange = (criterionKey, comment) => {
    setEvaluations((prev) => ({
      ...prev,
      [criterionKey]: {
        ...prev[criterionKey],
        comment: comment,
      },
    }));
  };

  const handleHeaderInfoChange = (key, value) => {
    setHeaderInfo((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // Save evaluation logic here
    const evaluationData = {
      headerInfo,
      evaluations,
      totalScore,
      result,
      generalComments,
      candidateId: id || candidate?.id,
    };
    console.log("Evaluation Data:", evaluationData);
    alert("Đã lưu đánh giá thành công!");
  };

  const handleSubmit = () => {
    // Submit evaluation logic here
    const evaluationData = {
      headerInfo,
      evaluations,
      totalScore,
      result,
      generalComments,
      candidateId: id || candidate?.id,
    };
    console.log("Submitting evaluation...", evaluationData);
    alert("Đã gửi đánh giá thành công!");
    navigate("/examiner/applications", { state: batchData });
  };

  if (!candidate) {
    return (
      <div className="p-6">
        <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
          <p className="text-slate-500">Không tìm thấy thông tin tiếp viên</p>
          <button
            onClick={() => navigate("/examiner/applications")}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Quay lại
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
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                navigate("/examiner/applications", { state: batchData })
              }
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
                Đánh giá tiếp viên
              </h1>
              <p className="mt-1 text-sm text-white/90">
                Đánh giá tiêu chí phỏng vấn cho tiếp viên
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Candidate Information */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            Thông tin Tiếp viên
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-4">
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
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {candidate.name}
                </h3>
                <p className="text-sm text-slate-600">
                  {candidate.position || "Flight Attendant"}
                </p>
                <p className="mt-1 text-xs text-slate-500">Ảnh 4x6</p>
              </div>
            </div>
            <div>
              <span className="block mb-1 text-sm text-slate-600">Email:</span>
              <p className="font-medium text-slate-800">
                {candidate.email || "—"}
              </p>
            </div>
            <div>
              <span className="block mb-1 text-sm text-slate-600">
                Số điện thoại:
              </span>
              <p className="font-medium text-slate-800">
                {candidate.phone || "—"}
              </p>
            </div>
            <div>
              <span className="block mb-1 text-sm text-slate-600">
                Ngày ứng tuyển:
              </span>
              <p className="font-medium text-slate-800">
                {candidate.appliedDate || "—"}
              </p>
            </div>
            <div>
              <span className="block mb-1 text-sm text-slate-600">
                Học vấn:
              </span>
              <p className="font-medium text-slate-800">
                {candidate.education || "—"}
              </p>
            </div>
            <div>
              <span className="block mb-1 text-sm text-slate-600">
                Kinh nghiệm:
              </span>
              <p className="font-medium text-slate-800">
                {candidate.experience || "—"}
              </p>
            </div>
            <div>
              <span className="block mb-1 text-sm text-slate-600">
                Ngôn ngữ:
              </span>
              <p className="font-medium text-slate-800">
                {candidate.languages && Array.isArray(candidate.languages)
                  ? candidate.languages.join(", ")
                  : candidate.languages || "Tiếng Việt"}
              </p>
            </div>
            <div>
              <span className="block mb-1 text-sm text-slate-600">
                Đợt tuyển:
              </span>
              <p className="font-medium text-slate-800">
                {candidate.batchName || batchData?.batchName || "—"}
              </p>
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

        {/* A. TALENT SHOW ASSESSMENT */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            A. TALENT SHOW ASSESSMENT
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
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
                {/* 1. MATURITY & CONFIDENCE LEVEL */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      1. MATURITY & CONFIDENCE LEVEL
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={evaluations.maturityAndConfidenceLevel.score}
                      onChange={(e) =>
                        handleScoreChange(
                          "maturityAndConfidenceLevel",
                          e.target.value
                        )
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
                      value={evaluations.maturityAndConfidenceLevel.comment}
                      onChange={(e) =>
                        handleCommentChange(
                          "maturityAndConfidenceLevel",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú..."
                    />
                  </td>
                </tr>

                {/* 2. FUN & FRIENDLY ATTITUDE */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      2. FUN & FRIENDLY ATTITUDE
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={evaluations.funAndFriendlyAttitude.score}
                      onChange={(e) =>
                        handleScoreChange(
                          "funAndFriendlyAttitude",
                          e.target.value
                        )
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
                      value={evaluations.funAndFriendlyAttitude.comment}
                      onChange={(e) =>
                        handleCommentChange(
                          "funAndFriendlyAttitude",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú..."
                    />
                  </td>
                </tr>

                {/* 3. TEAMWORK SPIRIT */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      3. TEAMWORK SPIRIT
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={evaluations.teamworkSpirit.score}
                      onChange={(e) =>
                        handleScoreChange("teamworkSpirit", e.target.value)
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
                      value={evaluations.teamworkSpirit.comment}
                      onChange={(e) =>
                        handleCommentChange("teamworkSpirit", e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú..."
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* B. PERSONALITY ASSESSMENT */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            B. PERSONALITY ASSESSMENT
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
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
                {/* 4. APPEARANCE */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      4. APPEARANCE
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      (neat & groomed? Appropriately dressed?)
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={evaluations.appearance.score}
                      onChange={(e) =>
                        handleScoreChange("appearance", e.target.value)
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
                      value={evaluations.appearance.comment}
                      onChange={(e) =>
                        handleCommentChange("appearance", e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú..."
                    />
                  </td>
                </tr>

                {/* 5. LISTENING & ANSWERING SKILLS */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      5. LISTENING & ANSWERING SKILLS
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={evaluations.listeningAndAnsweringSkills.score}
                      onChange={(e) =>
                        handleScoreChange(
                          "listeningAndAnsweringSkills",
                          e.target.value
                        )
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
                      value={evaluations.listeningAndAnsweringSkills.comment}
                      onChange={(e) =>
                        handleCommentChange(
                          "listeningAndAnsweringSkills",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú..."
                    />
                  </td>
                </tr>

                {/* 6. HONEST, STRAIGHTFORWARD & TRUSTWORTHY */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      6. HONEST, STRAIGHTFORWARD & TRUSTWORTHY
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={
                        evaluations.honestStraightforwardAndTrustworthy.score
                      }
                      onChange={(e) =>
                        handleScoreChange(
                          "honestStraightforwardAndTrustworthy",
                          e.target.value
                        )
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
                      value={
                        evaluations.honestStraightforwardAndTrustworthy.comment
                      }
                      onChange={(e) =>
                        handleCommentChange(
                          "honestStraightforwardAndTrustworthy",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú..."
                    />
                  </td>
                </tr>

                {/* 7. CUSTOMER SERVICE MINDSET */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      7. CUSTOMER SERVICE MINDSET
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={evaluations.customerServiceMindset.score}
                      onChange={(e) =>
                        handleScoreChange(
                          "customerServiceMindset",
                          e.target.value
                        )
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
                      value={evaluations.customerServiceMindset.comment}
                      onChange={(e) =>
                        handleCommentChange(
                          "customerServiceMindset",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú..."
                    />
                  </td>
                </tr>

                {/* 8. RELEVANT EXPERIENCE */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      8. RELEVANT EXPERIENCE
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      (Airline, Hospitality...)
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={evaluations.relevantExperience.score}
                      onChange={(e) =>
                        handleScoreChange("relevantExperience", e.target.value)
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
                      value={evaluations.relevantExperience.comment}
                      onChange={(e) =>
                        handleCommentChange(
                          "relevantExperience",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú..."
                    />
                  </td>
                </tr>

                {/* 9. CAREER GOAL & INTENTION */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      9. CAREER GOAL & INTENTION
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={evaluations.careerGoalAndIntention.score}
                      onChange={(e) =>
                        handleScoreChange(
                          "careerGoalAndIntention",
                          e.target.value
                        )
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
                      value={evaluations.careerGoalAndIntention.comment}
                      onChange={(e) =>
                        handleCommentChange(
                          "careerGoalAndIntention",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú..."
                    />
                  </td>
                </tr>

                {/* 10. ENGLISH PROFICIENCY */}
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      10. ENGLISH PROFICIENCY
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={evaluations.englishProficiency.score}
                      onChange={(e) =>
                        handleScoreChange("englishProficiency", e.target.value)
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
                      value={evaluations.englishProficiency.comment}
                      onChange={(e) =>
                        handleCommentChange(
                          "englishProficiency",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú..."
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Score and Result */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="text-lg font-semibold text-slate-800">
              TOTAL SCORE
            </div>
            <div className="text-2xl font-bold text-blue-600">
              Total score (max 100) = {totalScore}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Comments/Remarks
            </label>
            <textarea
              placeholder="Ghi chú tổng quan về ứng viên..."
              value={generalComments}
              onChange={(e) => setGeneralComments(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="5"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() =>
              navigate("/examiner/applications", { state: batchData })
            }
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExaminerCabinCrewEvaluationPage;
