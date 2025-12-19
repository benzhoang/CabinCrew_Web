import React from 'react';

// Định nghĩa 5 stage cố định cho campaign type = promotion (giống PromotionStagesPage)
export const promotionStagesTemplates = [
    {
        id: 1,
        name: "Screening",
        nameEn: "Screening",
        keywords: ["screening", "sàng lọc"],
    },
    {
        id: 2,
        name: "Flight Hours Confirmation",
        nameEn: "Flight Hours Confirmation",
        keywords: ["flight hours", "giờ bay", "confirmation", "xác nhận"],
    },
    {
        id: 3,
        name: "Practical Test",
        nameEn: "Practical Test",
        keywords: ["practical", "thực hành", "test"],
    },
    {
        id: 4,
        name: "Interview",
        nameEn: "Interview",
        keywords: ["interview", "phỏng vấn"],
    },
    {
        id: 5,
        name: "Final",
        nameEn: "Final",
        keywords: ["final", "cuối cùng", "kết thúc"],
    },
];

// Helper function để render các action buttons (View profile, View result) cho promotion stages
export const renderPromotionStageActionButtons = (stage, navigate, t) => {
    if (!stage) return null;

    const buttons = [];

    // View profile cho Screening stage
    if (stage.name === "Screening" && stage.activityId) {
        buttons.push(
            <button
                key="view-profile"
                onClick={() => navigate(`/cabin-crew/profile/${stage.activityId}`)}
                className="mt-2 text-xs text-blue-600 underline hover:text-blue-800"
            >
                View profile
            </button>
        );
    }

    // View result cho Interview stage
    if (stage.name?.toLowerCase().includes("interview") && stage.activityId) {
        buttons.push(
            <button
                key="view-interview-result"
                onClick={() => navigate(`/cabin-crew/interview-result/${stage.activityId || stage.roundId || ""}`)}
                className="mt-2 text-xs font-semibold text-blue-600 underline hover:text-blue-800"
            >
                {t("view_result")}
            </button>
        );
    }

    return buttons.length > 0 ? buttons : null;
};

