import React from 'react';

// Constants for Recruitment timeline visualization (with branch)
const RECRUITMENT_LINE_START_PERCENT = 5;
const RECRUITMENT_LINE_END_PERCENT = 95;
const RECRUITMENT_TIMELINE_HEIGHT = 240;
const RECRUITMENT_BASELINE_Y = 110;
const RECRUITMENT_BRANCH_OFFSET = 70;

// Constants for Promotion timeline visualization (simple)
const PROMOTION_TIMELINE_HEIGHT = 120;

// Helper function to calculate axis position for each stage
const getAxisPercent = (index, total) => {
  if (total <= 1) return RECRUITMENT_LINE_START_PERCENT;
  return RECRUITMENT_LINE_START_PERCENT + ((RECRUITMENT_LINE_END_PERCENT - RECRUITMENT_LINE_START_PERCENT) * (index / (total - 1)));
};

// Helper function to check if a round type is English Listening
const isEnglishListening = (roundTypeName) => {
  if (!roundTypeName) return false;
  const nameLower = roundTypeName.toLowerCase();
  return nameLower.includes('listening') || nameLower.includes('english listening');
};

// Helper function to check if a round type is English Speaking
const isEnglishSpeaking = (roundTypeName) => {
  if (!roundTypeName) return false;
  const nameLower = roundTypeName.toLowerCase();
  return nameLower.includes('speaking') || nameLower.includes('english speaking');
};

// Recruitment Timeline Component (with branch for English tests)
const RecruitmentTimeline = ({ roundTypes }) => {
  if (!roundTypes || roundTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No process information available</p>
      </div>
    );
  }

  // Find English test indices
  const englishListeningIndex = roundTypes.findIndex(rt => isEnglishListening(rt.roundTypeName));
  const englishSpeakingIndex = roundTypes.findIndex(rt => isEnglishSpeaking(rt.roundTypeName));
  const hasEnglishTests = englishListeningIndex !== -1 || englishSpeakingIndex !== -1;

  // Calculate effective total: if both English tests exist, they share one position
  const hasBothEnglishTests = englishListeningIndex !== -1 && englishSpeakingIndex !== -1;
  const effectiveTotal = hasBothEnglishTests ? roundTypes.length - 1 : roundTypes.length;

  // Calculate effective index for each stage (English tests share position)
  const getEffectiveIndex = (index) => {
    if (!hasBothEnglishTests) return index;

    const minEnglishIndex = Math.min(englishListeningIndex, englishSpeakingIndex);
    const maxEnglishIndex = Math.max(englishListeningIndex, englishSpeakingIndex);

    // If this is an English test, use the min index (they share position)
    if (index === englishListeningIndex || index === englishSpeakingIndex) {
      return minEnglishIndex;
    }

    // If this stage is after both English tests, subtract 1
    if (index > maxEnglishIndex) {
      return index - 1;
    }

    // If this stage is between the two English tests, subtract 1
    if (index > minEnglishIndex && index < maxEnglishIndex) {
      return index - 1;
    }

    // Before both English tests, no adjustment
    return index;
  };

  // Find branch position (where English tests are)
  const branchIndex = hasEnglishTests
    ? (hasBothEnglishTests
      ? Math.min(englishListeningIndex, englishSpeakingIndex)
      : (englishListeningIndex !== -1 ? englishListeningIndex : englishSpeakingIndex))
    : -1;

  const effectiveBranchIndex = branchIndex !== -1 ? getEffectiveIndex(branchIndex) : -1;

  return (
    <div className="relative" style={{ height: `${RECRUITMENT_TIMELINE_HEIGHT}px` }}>
      {/* Horizontal progress line */}
      <div
        className="absolute bg-gray-200"
        style={{
          top: `${RECRUITMENT_BASELINE_Y}px`,
          left: `${RECRUITMENT_LINE_START_PERCENT}%`,
          width: `${RECRUITMENT_LINE_END_PERCENT - RECRUITMENT_LINE_START_PERCENT}%`,
          height: '2px'
        }}
      >
        <div
          className="h-full bg-purple-500 transition-all duration-500"
          style={{ width: '100%' }}
        ></div>
      </div>

      {/* Vertical branch for English tests */}
      {hasEnglishTests && effectiveBranchIndex !== -1 && (
        <div
          className="absolute bg-gray-200"
          style={{
            left: `${getAxisPercent(effectiveBranchIndex, effectiveTotal)}%`,
            top: `${RECRUITMENT_BASELINE_Y - RECRUITMENT_BRANCH_OFFSET}px`,
            height: `${RECRUITMENT_BRANCH_OFFSET * 2}px`,
            width: '2px',
            transform: 'translateX(-50%)'
          }}
        ></div>
      )}

      {/* Stage nodes */}
      {roundTypes.map((roundType, index) => {
        const isListening = isEnglishListening(roundType.roundTypeName);
        const isSpeaking = isEnglishSpeaking(roundType.roundTypeName);
        const isEnglishTestStage = isListening || isSpeaking;

        // Calculate axis position using effective index
        const effectiveIndex = getEffectiveIndex(index);
        const axisPercent = getAxisPercent(effectiveIndex, effectiveTotal);

        // Determine position style based on stage type
        let positionStyle;
        let infoPosition = 'bottom';

        if (isEnglishTestStage) {
          // English tests: on branch (listening on top, speaking on bottom)
          const verticalOffset = isListening ? -RECRUITMENT_BRANCH_OFFSET : RECRUITMENT_BRANCH_OFFSET;
          positionStyle = {
            left: `${axisPercent}%`,
            top: `${RECRUITMENT_BASELINE_Y + verticalOffset}px`,
            transform: 'translate(-50%, -50%)'
          };
          infoPosition = isListening ? 'top' : 'bottom';
        } else {
          // Main stages: on baseline
          positionStyle = {
            left: `${axisPercent}%`,
            top: `${RECRUITMENT_BASELINE_Y - 30}px`,
            transform: 'translateX(-50%)'
          };
          infoPosition = 'bottom';
        }

        return (
          <div
            key={roundType.roundTypeId || index}
            className="absolute flex flex-col items-center"
            style={positionStyle}
          >
            {/* Stage info above node (for English Listening) */}
            {infoPosition === 'top' && (
              <div className="mb-3 w-28 text-center">
                <p className="text-xs font-medium text-gray-800">
                  {roundType.roundTypeName || `Stage ${index + 1}`}
                </p>
              </div>
            )}
            {/* Stage node */}
            <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center bg-purple-500 text-white shadow-md">
              <span className="text-sm font-semibold">{index + 1}</span>
            </div>
            {/* Stage info below node */}
            {infoPosition === 'bottom' && (
              <div className="mt-3 w-28 text-center">
                <p className="text-xs font-medium text-gray-800">
                  {roundType.roundTypeName || `Stage ${index + 1}`}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Promotion Timeline Component (simple timeline)
const PromotionTimeline = ({ roundTypes }) => {
  if (!roundTypes || roundTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No process information available</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: `${PROMOTION_TIMELINE_HEIGHT}px` }}>
      {/* Horizontal progress line */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
        <div
          className="h-full transition-all duration-500 bg-purple-500"
          style={{
            width: roundTypes.length > 1 ? "100%" : "0%",
          }}
        ></div>
      </div>

      {/* Stage nodes */}
      <div className="relative flex justify-between">
        {roundTypes.map((roundType, index) => (
          <div
            key={roundType.roundTypeId || index}
            className="flex flex-col items-center"
          >
            {/* Stage node */}
            <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center bg-purple-500 text-white shadow-md">
              <span className="text-sm font-semibold">{index + 1}</span>
            </div>

            {/* Stage info below node */}
            <div className="mt-3 text-center max-w-24">
              <p className="text-xs font-medium text-gray-800">
                {roundType.roundTypeName || `Stage ${index + 1}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main ProcessTimeline Component
const ProcessTimeline = ({ campaignType, roundTypes, isLoading }) => {
  // Determine campaign type
  const campaignTypeStr = String(campaignType || '').trim().toLowerCase();
  let isRecruitment = false;
  let isPromotion = false;

  if (campaignTypeStr === 'recruitment' || campaignTypeStr === '1') {
    isRecruitment = true;
  } else if (campaignTypeStr === 'promotion' || campaignTypeStr === '2') {
    isPromotion = true;
  } else {
    // Try to parse as number for backward compatibility
    const parsed = Number(campaignType);
    if (parsed === 1) {
      isRecruitment = true;
    } else if (parsed === 2) {
      isPromotion = true;
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        <p className="mt-2 text-sm text-gray-500">Loading Process...</p>
      </div>
    );
  }

  // Render appropriate timeline based on campaign type
  if (isRecruitment) {
    return <RecruitmentTimeline roundTypes={roundTypes} />;
  } else if (isPromotion) {
    return <PromotionTimeline roundTypes={roundTypes} />;
  } else {
    // Default to simple timeline if type is unknown
    return <PromotionTimeline roundTypes={roundTypes} />;
  }
};

export default ProcessTimeline;

