import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';
import { getOngoingCampaign } from '../../service/api';

const appearanceKeywords = ['appearance', 'appearence', 'ngoại hình'];
const interviewKeywords = ['interview', 'phỏng vấn'];
const screeningKeywords = ['screening', 'sang loc', 'sàng lọc'];
const defaultStageTemplates = [
    {
        id: 'screening',
        name: 'Sàng lọc hồ sơ',
        nameEn: 'Screening',
        aliases: ['screening', 'sang loc']
    },
    {
        id: 'appearance',
        name: 'Vòng ngoại hình',
        nameEn: 'Appearance',
        aliases: ['appearance', 'ngoai hinh', 'appearence']
    },
    {
        id: 'english-listening',
        name: 'Bài kiểm tra Nghe tiếng Anh',
        nameEn: 'English Listening Test',
        aliases: ['listening', 'english listening', 'listening test']
    },
    {
        id: 'english-speaking',
        name: 'Bài kiểm tra Nói tiếng Anh',
        nameEn: 'English Speaking Test',
        aliases: ['speaking', 'english speaking', 'speaking test']
    },
    {
        id: 'interview',
        name: 'Interview',
        nameEn: 'Interview',
        aliases: ['interview', 'phong van']
    },
    {
        id: 'final',
        name: 'Final',
        nameEn: 'Final',
        aliases: ['final', 'chung ket', 'final round']
    },
];

const LINE_START_PERCENT = 5;
const LINE_END_PERCENT = 95;
const AXIS_SEGMENTS = 4;
const TIMELINE_HEIGHT = 240;
const BASELINE_Y = 110;
const BRANCH_OFFSET = 70;

const stageAxisPositionMap = {
    'screening': 0,
    'appearance': 1,
    'english-listening': 2,
    'english-speaking': 2,
    'interview': 3,
    'final': 4
};

const normalizeText = (text) => (text || '').toLowerCase().trim();

const doesRoundMatchStage = (round, stageTemplate) => {
    if (!round) return false;
    const roundName = normalizeText(round.roundName);
    const stageNames = [stageTemplate.name, stageTemplate.nameEn, ...(stageTemplate.aliases || [])]
        .map(normalizeText);
    return stageNames.some((name) => name && roundName.includes(name));
};

const matchesStageKeywords = (stage, keywords) => {
    const name = (stage?.name || '').toLowerCase();
    const nameEn = (stage?.nameEn || '').toLowerCase();
    return keywords.some(keyword => name.includes(keyword) || nameEn.includes(keyword));
};

const isStageReached = (stage, index, currentStage) => {
    if (!stage || typeof index !== 'number') return false;
    if (stage.completed) return true;
    return index + 1 <= currentStage;
};

const RecruitmentStages = () => {
    const navigate = useNavigate();

    // Tự động re-render khi đổi ngôn ngữ
    const [langTick, setLangTick] = useState(0);
    useEffect(() => {
        const off = onLangChange(() => setLangTick((v) => v + 1));
        return () => off();
    }, []);

    // State để lưu dữ liệu từ API
    const [recruitmentStages, setRecruitmentStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Gọi API để lấy chiến dịch đang ứng tuyển
    useEffect(() => {
        const fetchOngoingCampaign = async () => {
            try {
                setLoading(true);
                const result = await getOngoingCampaign();

                if (result.success && result.data) {
                    // Map dữ liệu từ API vào format của component
                    const campaignData = result.data;

                    // Xác định currentStage dựa trên rounds
                    const rounds = campaignData.rounds || [];

                    // Map rounds thành stages với thông tin completed, đảm bảo luôn đủ 6 vòng
                    const mappedStages = defaultStageTemplates.map((template, index) => {
                        const matchingRound = rounds.find((round) => doesRoundMatchStage(round, template));
                        const roundStatus = normalizeText(matchingRound?.status);
                        const isCompleted = ['completed', 'passed', 'finished'].some((status) => roundStatus.includes(status));

                        return {
                            activityId: matchingRound?.activityId || '',
                            applicationId: matchingRound?.applicationId || '',
                            id: matchingRound?.roundId || `${template.id}-${index}`,
                            templateId: template.id,
                            name: matchingRound?.roundName || template.name,
                            nameEn: matchingRound?.roundName || template.nameEn,
                            completed: Boolean(matchingRound) && isCompleted,
                            date: matchingRound?.date || null,
                            status: matchingRound?.status || 'On Going'
                        };
                    });

                    // Tính currentStage: số rounds đã hoàn thành + 1 (hoặc rounds.length nếu tất cả đã hoàn thành)
                    const completedCount = mappedStages.filter(stage => stage.completed).length;
                    let currentStageIndex = completedCount + 1;

                    // Nếu tất cả rounds đã hoàn thành, currentStage là tổng số stage
                    if (currentStageIndex > mappedStages.length) {
                        currentStageIndex = mappedStages.length;
                    }

                    // Đảm bảo currentStage ít nhất là 1
                    if (currentStageIndex < 1) {
                        currentStageIndex = 1;
                    }

                    // Map status từ roundStatus
                    let status = 'ongoing';
                    let statusText = 'On Going';
                    let statusTextEn = 'On Going';

                    if (campaignData.roundStatus) {
                        const roundStatus = campaignData.roundStatus.toLowerCase();
                        if (roundStatus.includes('completed') || roundStatus.includes('passed') || roundStatus.includes('finished')) {
                            status = 'accepted';
                            statusText = 'Đã hoàn thành';
                            statusTextEn = 'Completed';
                        } else if (roundStatus.includes('rejected') || roundStatus.includes('failed')) {
                            status = 'rejected';
                            statusText = 'Đã từ chối';
                            statusTextEn = 'Rejected';
                        }
                    }

                    // Lấy applicationId từ rounds (ưu tiên từ screening round, nếu không có thì lấy từ round đầu tiên)
                    const screeningRound = rounds.find((round) => {
                        const roundName = normalizeText(round.roundName);
                        return ['screening', 'sang loc'].some(keyword => roundName.includes(keyword));
                    });
                    const applicationId = screeningRound?.applicationId || rounds[0]?.applicationId || '';

                    const mappedData = {
                        id: campaignData.campaignRoundId || 1,
                        applicationId: applicationId,
                        position: campaignData.campaignName || 'Chiến dịch tuyển dụng',
                        company: campaignData.airlinePartner || 'Đối tác hàng không',
                        roundName: campaignData.roundName || '',
                        airlinePartner: campaignData.airlinePartner || '',
                        campaignName: campaignData.campaignName || '',
                        participatedDate: campaignData.participatedDate || '', // Có thể cập nhật nếu API trả về
                        status: status,
                        statusText: statusText,
                        statusTextEn: statusTextEn,
                        location: '', // Có thể cập nhật nếu API trả về
                        description: campaignData.description || '',
                        currentStage: currentStageIndex || 1,
                        stages: mappedStages
                    };

                    setRecruitmentStages([mappedData]);
                    setError(null);
                } else {
                    setRecruitmentStages([]);
                    setError(result.error || 'Không có chiến dịch đang ứng tuyển');
                }
            } catch (err) {
                console.error('Error fetching ongoing campaign:', err);
                setError('Đã xảy ra lỗi khi tải dữ liệu');
                setRecruitmentStages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOngoingCampaign();
    }, [langTick]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'ongoing':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (item) => {
        const lang = localStorage.getItem('lang') || 'vi';
        return lang === 'vi' ? item.statusText : item.statusTextEn;
    };

    // Hàm lấy tên giai đoạn theo ngôn ngữ
    const getStageName = (stage) => {
        const lang = localStorage.getItem('lang') || 'vi';
        return lang === 'vi' ? stage.name : stage.nameEn;
    };

    const isStageFailed = (stage) => {
        const status = normalizeText(stage?.status);
        return ['failed', 'fail', 'rejected', 'not passed', 'did not pass'].some(keyword =>
            status.includes(keyword)
        );
    };

    // Hàm lấy màu sắc cho giai đoạn
    const getStageColor = (stage, currentStage, stageIndex) => {
        if (isStageFailed(stage)) {
            return 'bg-red-500 text-white';
        }
        if (stage.completed) {
            return 'bg-green-500 text-white';
        }
        if (stageIndex + 1 === currentStage) {
            return 'bg-yellow-500 text-white';
        }
        return 'bg-gray-300 text-gray-600';
    };

    // Hàm lấy icon cho giai đoạn
    const getStageIcon = (stage, currentStage, stageIndex) => {
        if (isStageFailed(stage)) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-10.95a1 1 0 10-1.414-1.414L10 7.758 7.879 5.636a1 1 0 00-1.414 1.414L8.586 9l-2.121 2.121a1 1 0 101.414 1.414L10 10.414l2.121 2.121a1 1 0 001.414-1.414L11.414 9l2.122-2.121z" clipRule="evenodd" />
                </svg>
            );
        }
        if (stage.completed) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        } else if (stageIndex + 1 === currentStage) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
            );
        } else {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    const getProgressPercentage = (application) => {
        if (AXIS_SEGMENTS === 0) return 0;

        const completedPositions = application.stages
            .filter(stage => stage.completed)
            .map(stage => stageAxisPositionMap[stage.templateId])
            .filter(pos => typeof pos === 'number');

        const completedMax = completedPositions.length > 0 ? Math.max(...completedPositions) : 0;

        let currentPosition = completedMax;
        if (application.currentStage > 0 && application.currentStage <= application.stages.length) {
            const currentStageData = application.stages[application.currentStage - 1];
            if (currentStageData) {
                const axisPos = stageAxisPositionMap[currentStageData.templateId];
                if (typeof axisPos === 'number') {
                    currentPosition = axisPos;
                }
            }
        }

        const furthest = Math.max(completedMax, currentPosition);
        return (furthest / AXIS_SEGMENTS) * 100;
    };

    const getAxisPercent = (templateId) => {
        const axisPos = stageAxisPositionMap[templateId];
        if (typeof axisPos !== 'number') return LINE_START_PERCENT;
        return LINE_START_PERCENT + ((LINE_END_PERCENT - LINE_START_PERCENT) * (axisPos / AXIS_SEGMENTS));
    };

    const getStagePositionStyle = (templateId) => {
        // Hình tròn có kích thước w-12 h-12 = 48px, bán kính = 24px
        const circleRadius = 24;

        // Xác định các stage chính cần nằm trên baseline
        const isMainStage = ['screening', 'appearance', 'interview', 'final'].includes(templateId);

        if (isMainStage) {
            // Các stage chính: đáy hình tròn chạm baseline
            // Không dùng transform translate(-50%, -50%) để dễ kiểm soát vị trí
            // Đặt top = BASELINE_Y - 48px (chiều cao hình tròn) để đáy chạm baseline
            return {
                left: `${getAxisPercent(templateId)}%`,
                top: `${BASELINE_Y - 30}px`,
                transform: 'translateX(-50%)'
            };
        } else {
            // Các stage nhánh (english-listening, english-speaking): căn giữa với offset
            const verticalOffset = templateId === 'english-listening'
                ? -BRANCH_OFFSET
                : templateId === 'english-speaking'
                    ? BRANCH_OFFSET
                    : 0;
            return {
                left: `${getAxisPercent(templateId)}%`,
                top: `${BASELINE_Y + verticalOffset}px`,
                transform: 'translate(-50%, -50%)'
            };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('recruitment_stages_title')}
                    </h1>
                    <p className="text-gray-600">
                        {t('recruitment_stages_subtitle')}
                    </p>
                </div>

                {/* Recruitment Stages Section */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">{t('recruitment_progress_title')}</h2>
                        <p className="text-sm text-gray-600 mt-1">{t('recruitment_progress_subtitle')}</p>
                    </div>
                    <div className="p-6">
                        {loading && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-sm text-gray-600">{t('loading_data')}</p>
                            </div>
                        )}
                        {error && !loading && (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_ongoing_campaign_title')}</h3>
                                <p className="mt-1 text-sm text-gray-500">{t('no_ongoing_campaign_desc')}</p>
                            </div>
                        )}
                        {!loading && !error && recruitmentStages.map((application) => (
                            <div key={`stages-${application.id}`} className="mb-8 last:mb-0">
                                <div className="mb-4">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {application.campaignName || application.position}
                                        </h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                            {getStatusText(application)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                                        {application.roundName && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span className="font-medium">{t('application_round')}:</span>
                                                <span>{application.roundName}</span>
                                            </div>
                                        )}
                                        {application.airlinePartner && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span className="font-medium">{t('partner_label')}:</span>
                                                <span>{application.airlinePartner}</span>
                                            </div>
                                        )}
                                    </div>
                                    {application.description && (
                                        <p className="text-sm text-gray-500 mb-3">{application.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {application.location}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {t('applied_date')}: {application.participatedDate}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Timeline */}
                                <div className="relative" style={{ height: `${TIMELINE_HEIGHT}px` }}>
                                    {(() => {
                                        const stageMap = {};
                                        const stageIndexMap = {};
                                        application.stages.forEach((stage, index) => {
                                            if (stage.templateId) {
                                                stageMap[stage.templateId] = stage;
                                                stageIndexMap[stage.templateId] = index;
                                            }
                                        });

                                        const timelineStageIds = ['screening', 'appearance', 'english-listening', 'english-speaking', 'interview', 'final'];
                                        const renderStageInfo = (stage, stageIndex, stageReached, position) => (
                                            <div className={`${position === 'top' ? 'mb-3' : 'mt-3'} w-28 text-center`}>
                                                <p className="text-xs font-medium text-gray-900">
                                                    {getStageName(stage)}
                                                </p>
                                                {stage.date && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(stage.date).toLocaleDateString()}
                                                    </p>
                                                )}
                                                {stageReached && matchesStageKeywords(stage, screeningKeywords) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/profile/${application.activityId || stage.activityId || ''}`)}
                                                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        {t('view_profile')}
                                                    </button>
                                                )}
                                                {stageReached && matchesStageKeywords(stage, appearanceKeywords) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/appearance-result/${stage.activityId || stage.roundId || ''}`)}
                                                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        {t('view_result')}
                                                    </button>
                                                )}
                                                {stageReached && matchesStageKeywords(stage, interviewKeywords) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/interview-result/${stage.activityId || stage.roundId || ''}`)}
                                                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        {t('view_result')}
                                                    </button>
                                                )}
                                            </div>
                                        );

                                        return (
                                            <>
                                                {/* Horizontal progress line */}
                                                <div
                                                    className="absolute bg-gray-200"
                                                    style={{
                                                        top: `${BASELINE_Y}px`,
                                                        left: `${LINE_START_PERCENT}%`,
                                                        width: `${LINE_END_PERCENT - LINE_START_PERCENT}%`,
                                                        height: '2px'
                                                    }}
                                                >
                                                    <div
                                                        className="h-full bg-blue-500 transition-all duration-500"
                                                        style={{ width: `${getProgressPercentage(application)}%` }}
                                                    ></div>
                                                </div>

                                                {/* Vertical branch */}
                                                <div
                                                    className="absolute bg-gray-200"
                                                    style={{
                                                        left: `${getAxisPercent('english-listening')}%`,
                                                        top: `${BASELINE_Y - BRANCH_OFFSET}px`,
                                                        height: `${BRANCH_OFFSET * 2}px`,
                                                        width: '2px',
                                                        transform: 'translateX(-50%)'
                                                    }}
                                                ></div>

                                                {/* Stage nodes */}
                                                {timelineStageIds.map((templateId) => {
                                                    const stage = stageMap[templateId];
                                                    if (!stage) return null;
                                                    const stageIndex = stageIndexMap[templateId];
                                                    const stageReached = isStageReached(stage, stageIndex, application.currentStage);
                                                    // Chỉ english-listening hiển thị info ở trên, các stage khác hiển thị ở dưới
                                                    const infoPosition = templateId === 'english-listening' ? 'top' : 'bottom';

                                                    // Đảm bảo các stage chính (screening, appearance, interview, final) nằm trên baseline
                                                    const isMainStage = ['screening', 'appearance', 'interview', 'final'].includes(templateId);
                                                    const positionStyle = getStagePositionStyle(templateId);

                                                    return (
                                                        <div
                                                            key={templateId}
                                                            className="absolute flex flex-col items-center"
                                                            style={positionStyle}
                                                        >
                                                            {infoPosition === 'top' && renderStageInfo(stage, stageIndex, stageReached, 'top')}
                                                            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${getStageColor(stage, application.currentStage, stageIndex ?? 0)}`}>
                                                                {getStageIcon(stage, application.currentStage, stageIndex ?? 0)}
                                                            </div>
                                                            {infoPosition === 'bottom' && renderStageInfo(stage, stageIndex, stageReached, 'bottom')}
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Current Status */}
                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-yellow-800">
                                            <strong>{t('current_status')}:</strong> {
                                                application.stages.length > 0 && application.currentStage > 0 && application.currentStage <= application.stages.length
                                                    ? (() => {
                                                        const currentStageData = application.stages[application.currentStage - 1];
                                                        if (currentStageData?.completed) {
                                                            return `Complete ${getStageName(currentStageData)}`;
                                                        } else {
                                                            return `In progress ${getStageName(currentStageData)}`;
                                                        }
                                                    })()
                                                    : 'Đang chờ xử lý'
                                            }
                                        </p>
                                        {/* Nút Kiểm tra tiếng Anh - chỉ hiển thị khi đang ở giai đoạn này và có stage tương ứng */}
                                        {application.currentStage > 0 && application.currentStage <= application.stages.length &&
                                            application.stages[application.currentStage - 1] &&
                                            !application.stages[application.currentStage - 1].completed &&
                                            (application.stages[application.currentStage - 1].name?.toLowerCase().includes('tiếng anh') ||
                                                application.stages[application.currentStage - 1].name?.toLowerCase().includes('english')) && (
                                                <button
                                                    onClick={() => navigate(`/test/${application.id}`)}
                                                    className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 whitespace-nowrap"
                                                >
                                                    {t('english_test_cta')}
                                                </button>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Empty State (if no applications) */}
                {!loading && !error && recruitmentStages.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_applications_title')}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('no_applications_desc')}</p>
                        <div className="mt-6">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                {t('find_jobs_now')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruitmentStages;
