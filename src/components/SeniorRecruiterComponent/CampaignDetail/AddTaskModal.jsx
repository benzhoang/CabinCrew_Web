import React, { useState } from "react";

// CSS animations for pop-up effect
const popupStyles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes pop-up {
    from { 
      opacity: 0; 
      transform: scale(0.8) translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  
  .animate-pop-up {
    animation: pop-up 0.3s ease-out;
  }
`;

// Inject styles into document head
if (
  typeof document !== "undefined" &&
  !document.querySelector("#popup-styles")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "popup-styles";
  styleSheet.textContent = popupStyles;
  document.head.appendChild(styleSheet);
}

const recruiterOptions = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    position: "Giám đốc Nhân sự",
    department: "HR",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    position: "Trưởng phòng Tuyển dụng",
    department: "HR",
  },
  {
    id: 3,
    name: "Lê Văn Cường",
    position: "Giám đốc Vận hành",
    department: "Operations",
  },
  {
    id: 4,
    name: "Phạm Thị Dung",
    position: "Trưởng phòng Cabin Crew",
    department: "Cabin Crew",
  },
  {
    id: 5,
    name: "Hoàng Văn Em",
    position: "Giám đốc Tài chính",
    department: "Finance",
  },
  {
    id: 6,
    name: "Vũ Thị Phương",
    position: "Trưởng phòng Đào tạo",
    department: "Training",
  },
];

const roundConfig = [
  {
    key: "screening",
    title: "Vòng sàng lọc",
    description: "Kiểm tra CV, kinh nghiệm và chứng chỉ cần thiết.",
    maxSelect: 1,
  },
  {
    key: "appearance",
    title: "Vòng ngoại hình",
    description: "Đánh giá tiêu chuẩn ngoại hình và tác phong.",
    maxSelect: 1,
  },
  {
    key: "assessment",
    title: "Vòng kiểm tra",
    description: "Tổ chức bài kiểm tra kỹ năng chuyên môn.",
    maxSelect: 1,
  },
  {
    key: "interview",
    title: "Vòng phỏng vấn",
    description: "Phỏng vấn chuyên sâu với hội đồng 3 người.",
    maxSelect: 3,
  },
];

const getDefaultAssignments = () => ({
  screening: null,
  appearance: null,
  assessment: null,
  interview: [],
});

const AddTaskModal = ({ isOpen, onClose, onSubmit, campaign }) => {
  const [assignments, setAssignments] = useState(getDefaultAssignments);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  //const campaignTitle = campaign?.name || "Campaign nào";

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSingleSelection = (roundKey, recruiter) => {
    setAssignments((prev) => ({ ...prev, [roundKey]: recruiter }));
    setOpenDropdown(null);
    clearError(roundKey);
  };

  const toggleInterviewRecruiter = (recruiter) => {
    setAssignments((prev) => {
      const exists = prev.interview.find((item) => item.id === recruiter.id);
      let updatedInterview = prev.interview;

      if (exists) {
        updatedInterview = prev.interview.filter(
          (item) => item.id !== recruiter.id
        );
      } else if (prev.interview.length < 3) {
        updatedInterview = [...prev.interview, recruiter];
      } else {
        return prev;
      }

      return { ...prev, interview: updatedInterview };
    });
    clearError("interview");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!assignments.screening) {
      newErrors.screening = "Vui lòng chọn người phụ trách vòng sàng lọc.";
    }
    if (!assignments.appearance) {
      newErrors.appearance = "Vui lòng chọn người phụ trách vòng ngoại hình.";
    }
    if (!assignments.assessment) {
      newErrors.assessment = "Vui lòng chọn người phụ trách vòng kiểm tra.";
    }
    if (assignments.interview.length !== 3) {
      newErrors.interview = "Vui lòng chọn đủ 3 người cho vòng phỏng vấn.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setAssignments(getDefaultAssignments());
    setErrors({});
    setOpenDropdown(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const selectedApprovers = [
        assignments.screening,
        assignments.appearance,
        assignments.assessment,
        ...assignments.interview,
      ].filter(Boolean);

      onSubmit({
        campaignId: campaign?.id,
        assignments,
        approvers: selectedApprovers,
        submittedAt: new Date().toISOString(),
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Error submitting approval:", error);
      alert("Có lỗi xảy ra khi giao việc");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderDropdownList = (roundKey, isMulti = false) => {
    const isOpen = openDropdown === roundKey;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setOpenDropdown((prev) => (prev === roundKey ? null : roundKey))
          }
          className="flex items-center justify-between w-full px-4 py-3 transition-colors bg-white border rounded-lg border-slate-200 hover:border-slate-300"
        >
          <div className="text-left">
            <p className="text-sm font-medium text-slate-800">
              {isMulti
                ? assignments[roundKey].length > 0
                  ? `${assignments[roundKey].length} người đã chọn`
                  : "Chọn recruiter"
                : assignments[roundKey]?.name || "Chọn recruiter"}
            </p>
            <p className="text-xs text-slate-500">
              {isMulti ? "Tối đa 3 người" : "1 người phụ trách"}
            </p>
          </div>
          <svg
            className={`w-5 h-5 text-slate-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 overflow-y-auto bg-white border shadow-xl border-slate-200 rounded-xl max-h-64">
            {recruiterOptions.map((recruiter) => {
              const isSelected = isMulti
                ? assignments[roundKey].some((item) => item.id === recruiter.id)
                : assignments[roundKey]?.id === recruiter.id;

              return (
                <button
                  key={recruiter.id}
                  type="button"
                  onClick={() =>
                    isMulti
                      ? toggleInterviewRecruiter(recruiter)
                      : handleSingleSelection(roundKey, recruiter)
                  }
                  className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 ${
                    isSelected ? "bg-slate-50" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {recruiter.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {recruiter.position} · {recruiter.department}
                    </p>
                  </div>
                  {isMulti ? (
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-slate-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  ) : (
                    <span
                      className={`w-4 h-4 border rounded ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-slate-300"
                      }`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderSelectedChips = (roundKey) => {
    if (assignments[roundKey].length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {assignments[roundKey].map((recruiter) => (
          <span
            key={recruiter.id}
            className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-blue-700 rounded-full bg-blue-50"
          >
            {recruiter.name}
            <button
              type="button"
              onClick={() => toggleInterviewRecruiter(recruiter)}
              className="text-blue-500 hover:text-blue-700"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[92vh] overflow-y-auto transform transition-all duration-300 animate-pop-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500 mb-2">
                GIAO VIỆC
              </p>
              <h2 className="text-2xl font-bold text-slate-900">Giao việc</h2>
              <p className="mt-1 text-sm text-slate-600">
                Phân công recruiter phụ trách từng vòng tuyển dụng của chiến
                dịch
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 transition-all duration-200 rounded-full text-slate-500 hover:text-slate-700 hover:bg-white/50"
              title="Đóng"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-slate-50/60">
          <div>
            <div className="p-5 bg-white border shadow-sm rounded-2xl border-amber-100">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Phân bổ nhiệm vụ cho từng vòng
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Mỗi vòng cần chọn đúng số lượng recruiter yêu cầu. Vòng
                    phỏng vấn cần đủ 3 người để đảm bảo hội đồng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {roundConfig.map((round) => (
              <div
                key={round.key}
                className="p-5 bg-white border shadow-sm rounded-2xl border-slate-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-wide uppercase text-slate-400">
                      Nhiệm vụ
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {round.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {round.description}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                    {round.maxSelect === 1 ? "1 người" : "3 người"}
                  </span>
                </div>

                <div className="mt-4">
                  {round.maxSelect === 1 ? (
                    renderDropdownList(round.key)
                  ) : (
                    <>
                      {renderDropdownList(round.key, true)}
                      {renderSelectedChips(round.key)}
                    </>
                  )}
                  {errors[round.key] && (
                    <p className="mt-3 text-sm text-red-600">
                      {errors[round.key]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-medium transition-all duration-200 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-slate-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  Đang giao...
                </>
              ) : (
                <>
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Xong
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
