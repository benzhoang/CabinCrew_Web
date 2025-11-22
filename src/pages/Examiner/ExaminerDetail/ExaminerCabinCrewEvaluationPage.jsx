import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { onLangChange } from "../../../i18n";
import { getInterviewCriteriasPromotion } from "../../../service/api2";
import Loading from "../../../components/Loading";

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

  // Evaluation criteria state - dynamically initialized from API
  const [evaluations, setEvaluations] = useState({});

  const [result] = useState(""); // PASS, FAIL, or RESERVED
  const [generalComments, setGeneralComments] = useState("");
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const [criteriaData, setCriteriaData] = useState(null);

  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  // Fetch interview criteria data
  useEffect(() => {
    const fetchCriteria = async () => {
      setIsLoadingCriteria(true);
      try {
        const response = await getInterviewCriteriasPromotion();
        if (response.success) {
          setCriteriaData(response.data);
          // Initialize evaluations state from API data
          const initialEvaluations = {};
          if (Array.isArray(response.data)) {
            response.data.forEach((section) => {
              if (Array.isArray(section.items)) {
                section.items.forEach((item) => {
                  initialEvaluations[item.interviewCriteriaItemId] = {
                    score: 1,
                    comment: "",
                    criteria: item.criteria,
                  };
                });
              }
            });
          }
          setEvaluations(initialEvaluations);
        } else {
          console.error("Error fetching criteria:", response.error);
        }
      } catch (error) {
        console.error("Error fetching criteria:", error);
      } finally {
        setIsLoadingCriteria(false);
      }
    };

    fetchCriteria();
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

  // Show loading while fetching criteria
  if (isLoadingCriteria) {
    return <Loading message="Đang tải tiêu chí đánh giá..." />;
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

        {/* Dynamic Assessment Sections from API */}
        {criteriaData &&
        Array.isArray(criteriaData) &&
        criteriaData.length > 0 ? (
          criteriaData.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200"
            >
              <h2 className="mb-4 text-xl font-semibold text-slate-800">
                {section.title || `Section ${sectionIndex + 1}`}
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
                    {section.items && Array.isArray(section.items) ? (
                      section.items.map((item, itemIndex) => {
                        const criteriaId = item.interviewCriteriaItemId;
                        const evaluation = evaluations[criteriaId] || {
                          score: 1,
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
                                placeholder="Ghi chú..."
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-3 text-center text-slate-500"
                        >
                          Không có tiêu chí nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
            <p className="text-slate-500 text-center">
              Không có dữ liệu tiêu chí đánh giá
            </p>
          </div>
        )}

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
