import React, { useState, useEffect } from "react";
import { getUsersByRole, assignCampaignUsers } from "../../../service/api2";
import { toast } from "react-toastify";
//import { formatDate } from "../../../config/formatDate";

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

// Helper function to map API user data to component format
const mapUserData = (users) => {
  if (!users || !Array.isArray(users)) return [];
  return users.map((user) => ({
    id: user.userId || user.id,
    name:
      user.fullName ||
      user.name ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    position: user.position || user.roleName || "N/A",
    department: user.department || user.departmentName || "N/A",
    count: user.count || 0,
    assignedCampaigns: user.assignedCampaigns || [],
  }));
};

const roundConfig = [
  {
    key: "screening",
    title: "Vòng sàng lọc",
    description: "Kiểm tra CV, kinh nghiệm và chứng chỉ cần thiết.",
    maxSelect: null, // No limit
    taskType: 1, // Screening
  },
  {
    key: "appearance",
    title: "Vòng ngoại hình",
    description: "Đánh giá tiêu chuẩn ngoại hình và tác phong.",
    maxSelect: null, // No limit
    taskType: 4, // Appearance
  },
  {
    key: "assessment",
    title: "Vòng kiểm tra",
    description: "Tổ chức bài kiểm tra kỹ năng chuyên môn.",
    maxSelect: null, // No limit
    taskType: 3, // Assessment
  },
  {
    key: "interview",
    title: "Vòng phỏng vấn",
    description: "Phỏng vấn chuyên sâu với hội đồng 3 người.",
    maxSelect: 3,
    taskType: 2, // Interview
  },
];

const getDefaultAssignments = () => ({
  screening: [],
  appearance: [],
  assessment: [],
  interview: [],
});

const getSelectLabel = (roundKey) =>
  roundKey === "screening" ? "Chọn recruiter" : "Chọn examiner";

const AddTaskModal = ({ isOpen, onClose, onSubmit, campaign }) => {
  const [assignments, setAssignments] = useState(getDefaultAssignments);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [recruiterOptions, setRecruiterOptions] = useState([]);
  const [examinerOptions, setExaminerOptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [taskDescriptions, setTaskDescriptions] = useState({
    screening: "",
    appearance: "",
    assessment: "",
    interview: "",
  });

  // Load users by role when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        setLoadingUsers(true);
        try {
          // Load recruiters (roleId = 4) for screening round
          const recruiterResult = await getUsersByRole(4);
          if (recruiterResult.success && recruiterResult.data) {
            const users = Array.isArray(recruiterResult.data)
              ? recruiterResult.data
              : recruiterResult.data.items || [];
            setRecruiterOptions(mapUserData(users));
          }

          // Load examiners (roleId = 5) for other rounds
          const examinerResult = await getUsersByRole(5);
          if (examinerResult.success && examinerResult.data) {
            const users = Array.isArray(examinerResult.data)
              ? examinerResult.data
              : examinerResult.data.items || [];
            setExaminerOptions(mapUserData(users));
          }
        } catch (error) {
          console.error("Error loading users:", error);
        } finally {
          setLoadingUsers(false);
        }
      };

      loadUsers();
    }
  }, [isOpen]);

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleMultiSelection = (roundKey, user) => {
    setAssignments((prev) => {
      const currentList = prev[roundKey] || [];
      const exists = currentList.find((item) => item.id === user.id);
      let updatedList;

      if (exists) {
        updatedList = currentList.filter((item) => item.id !== user.id);
      } else {
        updatedList = [...currentList, user];
      }

      return { ...prev, [roundKey]: updatedList };
    });
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

  const handleDescriptionChange = (roundKey, value) => {
    setTaskDescriptions((prev) => ({
      ...prev,
      [roundKey]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!assignments.screening || assignments.screening.length === 0) {
      newErrors.screening = "Vui lòng chọn người phụ trách vòng sàng lọc.";
    }
    if (!assignments.appearance || assignments.appearance.length === 0) {
      newErrors.appearance = "Vui lòng chọn người phụ trách vòng ngoại hình.";
    }
    if (!assignments.assessment || assignments.assessment.length === 0) {
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
    setTaskDescriptions({
      screening: "",
      appearance: "",
      assessment: "",
      interview: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Lấy campaignId từ campaign prop (có thể là id hoặc campaignId)
      const campaignIdRaw = campaign?.id || campaign?.campaignId;
      const campaignId = campaignIdRaw ? Number(campaignIdRaw) : null;

      if (!campaignId || isNaN(campaignId)) {
        toast.error("Không tìm thấy ID chiến dịch hợp lệ");
        setIsSubmitting(false);
        return;
      }

      // Tạo assignments array theo format API
      const assignmentsArray = [];

      // Xử lý từng round
      roundConfig.forEach((round) => {
        const roundKey = round.key;
        const taskType = round.taskType;
        const assignment = assignments[roundKey];
        const description = taskDescriptions[roundKey] || "";

        // All rounds now use array format
        if (Array.isArray(assignment) && assignment.length > 0) {
          assignment.forEach((user) => {
            assignmentsArray.push({
              userId: user.id,
              taskType: taskType,
              taskDescription: description,
            });
          });
        }
      });

      // Gọi API assignCampaignUsers
      console.log("Data gửi đi:", {
        campaignId: campaignId,
        assignments: assignmentsArray,
      });

      const result = await assignCampaignUsers({
        campaignId: campaignId,
        assignments: assignmentsArray,
      });

      console.log("API Response:", result);

      if (result.success) {
        // Gọi callback onSubmit nếu có (để parent component có thể xử lý)
        if (onSubmit) {
          onSubmit({
            campaignId: campaignId,
            assignments: assignmentsArray,
            message: result.message,
          });
        }

        resetForm();
        onClose();
        toast.success(result.message || "Giao việc thành công!");
      } else {
        toast.error(result.error || "Có lỗi xảy ra khi giao việc");
      }
    } catch (error) {
      console.error("Error submitting approval:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi giao việc"
      );
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
    const round = roundConfig.find((r) => r.key === roundKey);
    const isUnlimited = round?.maxSelect === null;
    const isInterview = roundKey === "interview";

    const selectLabel = getSelectLabel(roundKey);

    // Get the appropriate user list based on round type
    // Screening uses recruiters (roleId = 4), others use examiners (roleId = 5)
    const userOptions =
      roundKey === "screening" ? recruiterOptions : examinerOptions;

    const selectedCount = Array.isArray(assignments[roundKey])
      ? assignments[roundKey].length
      : 0;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setOpenDropdown((prev) => (prev === roundKey ? null : roundKey))
          }
          disabled={loadingUsers}
          className="flex items-center justify-between w-full px-4 py-3 transition-colors bg-white border rounded-lg border-slate-200 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="text-left">
            <p className="text-sm font-medium text-slate-800">
              {loadingUsers
                ? "Đang tải..."
                : isMulti || isUnlimited
                ? selectedCount > 0
                  ? `${selectedCount} người đã chọn`
                  : selectLabel
                : assignments[roundKey]?.name || selectLabel}
            </p>
            {!isUnlimited && (
              <p className="text-xs text-slate-500">
                {isInterview ? "Tối đa 3 người" : ""}
              </p>
            )}
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

        {isOpen && !loadingUsers && (
          <div className="absolute z-10 w-full mt-2 overflow-y-auto bg-white border shadow-xl border-slate-200 rounded-xl max-h-64">
            {userOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-center text-slate-500">
                Không có dữ liệu
              </div>
            ) : (
              userOptions.map((user) => {
                const isSelected = Array.isArray(assignments[roundKey])
                  ? assignments[roundKey].some((item) => item.id === user.id)
                  : assignments[roundKey]?.id === user.id;

                // Disable logic: nếu là interview và đã chọn đủ 3 người và user này chưa được chọn
                const isDisabled =
                  isInterview &&
                  assignments[roundKey].length >= 3 &&
                  !isSelected;

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      if (isDisabled) return; // Không cho phép click nếu disabled
                      if (isInterview) {
                        toggleInterviewRecruiter(user);
                      } else {
                        toggleMultiSelection(roundKey, user);
                      }
                    }}
                    disabled={isDisabled}
                    className={`w-full px-4 py-3 flex items-center justify-between text-left ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-slate-50"
                    } ${isSelected ? "bg-slate-50" : ""}`}
                  >
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isDisabled ? "text-slate-400" : "text-slate-800"
                        }`}
                      >
                        {user.name}
                      </p>
                      {user.count !== undefined && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-slate-600">
                            <span className="font-medium">
                              Số lượng chiến dịch:
                            </span>{" "}
                            {user.count}
                          </p>
                          {/* {user.assignedCampaigns &&
                            user.assignedCampaigns.length > 0 && (
                              <div>
                                <p className="mb-1 text-xs font-medium text-slate-600">
                                  Ngày của những chiến dịch:
                                </p>
                                <div className="space-y-0.5">
                                  {user.assignedCampaigns.map(
                                    (campaign, idx) => (
                                      <p
                                        key={idx}
                                        className="text-xs text-slate-500"
                                      >
                                        {formatDate(campaign.startDate)} -{" "}
                                        {formatDate(campaign.endDate)}
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>
                            )} */}
                        </div>
                      )}
                    </div>
                    <span
                      className={`w-5 h-5 rounded border flex items-center justify-center ml-3 flex-shrink-0 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : isDisabled
                          ? "border-slate-200 bg-slate-50 text-transparent"
                          : "border-slate-300 text-transparent"
                      }`}
                    >
                      {isSelected && "✓"}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSelectedChips = (roundKey) => {
    if (
      !Array.isArray(assignments[roundKey]) ||
      assignments[roundKey].length === 0
    )
      return null;

    const toggleFunction =
      roundKey === "interview"
        ? toggleInterviewRecruiter
        : (user) => toggleMultiSelection(roundKey, user);

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {assignments[roundKey].map((user) => (
          <span
            key={user.id}
            className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-blue-700 rounded-full bg-blue-50"
          >
            {user.name}
            <button
              type="button"
              onClick={() => toggleFunction(user)}
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
              <h2 className="text-2xl font-bold text-slate-900">Giao việc</h2>
              <p className="mt-1 text-sm text-slate-600">
                Phân công nhân viên phụ trách từng vòng tuyển dụng của chiến
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
                    Mỗi vòng cần chọn đúng số lượng nhân viên yêu cầu. Vòng
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
                  {round.maxSelect !== null && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                      {round.maxSelect === 3 ? "3 người" : ""}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {renderDropdownList(round.key, round.maxSelect !== null)}
                  {renderSelectedChips(round.key)}

                  {/* Hiển thị input mô tả task khi đã chọn recruiter */}
                  {Array.isArray(assignments[round.key]) &&
                    assignments[round.key].length > 0 && (
                      <div className="mt-4">
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Ghi chú
                        </label>
                        <textarea
                          value={taskDescriptions[round.key]}
                          onChange={(e) =>
                            handleDescriptionChange(round.key, e.target.value)
                          }
                          placeholder="Nhập ghi chú cho nhiệm vụ này..."
                          rows={3}
                          className="w-full px-4 py-3 text-sm border rounded-lg resize-none border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
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
