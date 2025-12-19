import React from 'react';

// Template stage cho campaign type = recruitment (giống RecruitmentStages.jsx)
export const recruitmentStageTemplates = [
  {
    id: "screening",
    name: "Screening",
    nameEn: "Screening",
    aliases: ["screening", "sang loc", "sàng lọc"],
  },
  {
    id: "appearance",
    name: "Appearance",
    nameEn: "Appearance",
    aliases: ["appearance", "ngoai hinh", "appearence", "ngoại hình"],
  },
  {
    id: "english-listening",
    name: "English Listening Test",
    nameEn: "English Listening Test",
    aliases: ["listening", "english listening", "listening test"],
  },
  {
    id: "english-speaking",
    name: "English Speaking Test",
    nameEn: "English Speaking Test",
    aliases: ["speaking", "english speaking", "speaking test"],
  },
  {
    id: "interview",
    name: "Interview",
    nameEn: "Interview",
    aliases: ["interview", "phong van", "phỏng vấn"],
  },
  {
    id: "final",
    name: "Final",
    nameEn: "Final",
    aliases: ["final", "chung ket", "final round", "cuối cùng"],
  },
];

// Keywords để match các stage types (giống RecruitmentStages.jsx)
export const appearanceKeywords = ['appearance', 'appearence', 'ngoại hình'];
export const interviewKeywords = ['interview', 'phỏng vấn'];
export const screeningKeywords = ['screening', 'sang loc', 'sàng lọc'];

// Helper function để kiểm tra stage có match với keywords không
export const matchesStageKeywords = (stage, keywords) => {
  const name = (stage?.name || '').toLowerCase();
  const nameEn = (stage?.nameEn || '').toLowerCase();
  return keywords.some(keyword => name.includes(keyword) || nameEn.includes(keyword));
};

// Helper function để render các action buttons (View profile, View result) cho stage
export const renderStageActionButtons = (stage, stageReached, application, navigate, t) => {
  if (!stageReached) return null;

  const buttons = [];

  // View profile cho Screening stage
  if (matchesStageKeywords(stage, screeningKeywords)) {
    buttons.push(
      <button
        key="view-profile"
        type="button"
        onClick={() => navigate(`/profile/${application?.activityId || stage.activityId || ''}`)}
        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
      >
        {t('view_profile')}
      </button>
    );
  }

  // View result cho Appearance stage
  if (matchesStageKeywords(stage, appearanceKeywords)) {
    buttons.push(
      <button
        key="view-appearance-result"
        type="button"
        onClick={() => navigate(`/appearance-result/${stage.activityId || stage.roundId || stage.id || ''}`)}
        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
      >
        {t('view_result')}
      </button>
    );
  }

  // View result cho Interview stage
  if (matchesStageKeywords(stage, interviewKeywords)) {
    buttons.push(
      <button
        key="view-interview-result"
        type="button"
        onClick={() => navigate(`/interview-result/${stage.activityId || stage.roundId || stage.id || ''}`)}
        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
      >
        {t('view_result')}
      </button>
    );
  }

  return buttons.length > 0 ? buttons : null;
};

