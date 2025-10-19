import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';
import { FaCheck, FaClock, FaEllipsisH, FaTimes } from 'react-icons/fa';

const ApplicationDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Tự động re-render khi đổi ngôn ngữ
    const [, setLangTick] = useState(0);
    useEffect(() => {
        const off = onLangChange(() => setLangTick((v) => v + 1));
        return () => off();
    }, []);

    // Mock data nếu không có state được truyền vào
    const data = useMemo(() => {
        const fallback = {
            campaignTitle: 'Tuyển dụng Tiếp viên Hàng không - Quý 4/2025',
            quarter: 'Q4/2025',
            batchNumber: 2,
            eventDate: '2025-11-12', // Ngày diễn ra
            offlineDate: '2025-11-20', // Ngày offline
            reviewers: [
                { id: 1, name: 'Nguyễn Văn A' },
                { id: 2, name: 'Trần Thị B' },
                { id: 3, name: 'Lê Quốc C' }
            ],
            // Tiến trình vòng tuyển dụng
            // Chú ý: nếu rớt ở vòng nào thì đánh dấu completed cho các vòng trước đó, vòng rớt là currentStage và completed=false
            stages: [
                { id: 1, key: 'document', name: 'Kiểm tra hồ sơ', nameEn: 'Document Review', completed: true, date: '2025-10-05' },
                { id: 2, key: 'screening', name: 'Sàng lọc', nameEn: 'Screening', completed: false, date: '2025-10-10' },
                { id: 3, key: 'physical', name: 'Kiểm tra ngoại hình', nameEn: 'Physical Check', completed: false, date: null },
                { id: 4, key: 'english', name: 'Kiểm tra tiếng Anh', nameEn: 'English Test', completed: false, date: null },
                { id: 5, key: 'interview', name: 'Phỏng vấn', nameEn: 'Interview', completed: false, date: null },
                { id: 6, key: 'final', name: 'Kết quả cuối cùng', nameEn: 'Final Result', completed: false, date: null }
            ],
            currentStage: 2, // Đang ở vòng Sàng lọc
            failedStageId: 2, // Rớt ở vòng sàng lọc (ví dụ minh họa). Nếu đậu hết, set null và currentStage=stages.length
            failureReason: 'Không đạt yêu cầu về trình độ tiếng Anh và kỹ năng giao tiếp', // Lý do rớt
            candidateName: 'Đặng Văn Trí',
            profileId: 'CC-2025-00123'
        };

        // Nếu có state truyền vào, có thể map sang cấu trúc trên (tùy backend). Tạm thời merge cơ bản
        const state = (location && location.state) || {};
        return { ...fallback, ...state };
    }, [location]);

    const getStageName = (stage) => {
        const lang = localStorage.getItem('lang') || 'vi';
        return lang === 'vi' ? stage.name : stage.nameEn;
    };

    const getStageColor = (stage, currentStage, failedStageId) => {
        if (stage.completed) return 'bg-green-500 text-white';
        if (stage.id === currentStage) {
            // Nếu đang ở vòng hiện tại và bị rớt, dùng màu đỏ
            if (failedStageId && stage.id === failedStageId) {
                return 'bg-red-500 text-white';
            }
            // Nếu đang ở vòng hiện tại nhưng chưa rớt, dùng màu xanh
            return 'bg-blue-500 text-white';
        }
        return 'bg-gray-300 text-gray-600';
    };

    const getStageIcon = (stage, currentStage, failedStageId) => {
        if (stage.completed) {
            return (
                <FaCheck/>
            );
        }
        if (stage.id === currentStage) {
            // Nếu đang ở vòng hiện tại và bị rớt, hiển thị icon X
            if (failedStageId && stage.id === failedStageId) {
                return (
                    <FaTimes/>
                );
            }
            // Nếu đang ở vòng hiện tại nhưng chưa rớt, hiển thị ellipsis
            return (
                <FaEllipsisH/>
            );
        }
        return (
            <FaClock/>
        );
    };

    const progressPercent = useMemo(() => {
        const total = data.stages.length;
        const idx = Math.min(Math.max(data.currentStage, 1), total);
        return (idx / total) * 100;
    }, [data]);

    const statusSummary = useMemo(() => {
        const lang = localStorage.getItem('lang') || 'vi';
        const current = data.stages.find((s) => s.id === data.currentStage);
        const currentName = current ? (lang === 'vi' ? current.name : current.nameEn) : '';

        if (data.failedStageId) {
            const failed = data.stages.find((s) => s.id === data.failedStageId);
            const failedName = failed ? (lang === 'vi' ? failed.name : failed.nameEn) : '';
            return {
                resultText: `Rớt ở vòng ${failedName}`,
                profileProgress: `Hồ sơ đi đến vòng ${failedName}`,
                failingRound: failedName,
                isCompleted: false
            };
        }

        const finalStage = data.stages[data.stages.length - 1];
        const isDone = finalStage && finalStage.completed;
        return {
            resultText: isDone ? 'Hoàn thành' : `Đang ở vòng ${currentName}`,
            profileProgress: isDone ? 'Hồ sơ đã hoàn thành tất cả vòng' : `Hồ sơ đi đến vòng ${currentName}`,
            failingRound: isDone ? null : null,
            isCompleted: !!isDone
        };
    }, [data]);

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back */}
                <div className="mb-4">
                <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">{t('application_form_go_back')}</button>
                </div>

                {/* Progress */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử ứng tuyển</h2>
                    <div className="relative">
                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                            <div className={`h-full transition-all duration-500 ${data.failedStageId ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <div className="relative flex justify-between">
                            {data.stages.map((stage) => (
                                <div key={stage.id} className="flex flex-col items-center">
                                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${getStageColor(stage, data.currentStage, data.failedStageId)}`}>
                                        {getStageIcon(stage, data.currentStage, data.failedStageId)}
                                    </div>
                                    <div className="mt-3 text-center max-w-28">
                                        <p className="text-xs font-medium text-gray-900">{getStageName(stage)}</p>
                                        {stage.date && (
                                            <p className="text-xs text-gray-500 mt-1">{new Date(stage.date).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`mt-4 p-3 rounded-lg ${data.failedStageId ? 'bg-red-50' : 'bg-blue-50'}`}>
                        <p className={`text-sm ${data.failedStageId ? 'text-red-800' : 'text-blue-800'}`}>
                            <strong>Trạng thái hiện tại:</strong> {statusSummary.resultText}
                        </p>
                    </div>
                </div>

                {/* Campaign + Review info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
                        <h3 className="text-base font-semibold text-gray-900 mb-2">{data.campaignTitle}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                                <p className="text-gray-500">Quý</p>
                                <p className="font-medium">{data.quarter}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Đợt</p>
                                <p className="font-medium">{data.batchNumber}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Ngày diễn ra</p>
                                <p className="font-medium">{new Date(data.eventDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Ngày offline</p>
                                <p className="font-medium">{new Date(data.offlineDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Người review</h4>
                        <ul className="space-y-2">
                            {data.reviewers.map((r) => (
                                <li key={r.id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700">{r.name}</span>
                                    <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">Reviewer</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Kết quả theo vòng & hồ sơ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Kết quả theo vòng</h4>
                        <ul className="space-y-3">
                            {data.stages.map((stage) => {
                                const isFailed = data.failedStageId === stage.id;
                                const isCurrent = data.currentStage === stage.id;
                                const color = isFailed
                                    ? 'text-red-600'
                                    : stage.completed
                                        ? 'text-green-600'
                                        : isCurrent
                                            ? 'text-blue-600'
                                            : 'text-gray-600';
                                const label = isFailed
                                    ? 'Rớt'
                                    : stage.completed
                                        ? 'Hoàn thành'
                                        : isCurrent
                                            ? 'Đang diễn ra'
                                            : 'Chưa diễn ra';
                                return (
                                    <li key={stage.id} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-800">{getStageName(stage)}</span>
                                        <span className={`text-sm font-medium ${color}`}>{label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Hồ sơ ứng viên</h4>
                        <div className="space-y-2 text-sm">
                            <p className="text-gray-700"><span className="text-gray-500">Ứng viên:</span> <span className="font-medium">{data.candidateName}</span></p>
                            <p className="text-gray-700"><span className="text-gray-500">Mã hồ sơ:</span> <span className="font-medium">{data.profileId}</span></p>
                            <p className="text-gray-700"><span className="text-gray-500">Tiến độ:</span> <span className="font-medium">{statusSummary.profileProgress}</span></p>
                            {statusSummary.failingRound && (
                                <p className="text-gray-700"><span className="text-gray-500">Đang rớt ở:</span> <span className="font-medium">{statusSummary.failingRound}</span></p>
                            )}
                            {data.failureReason && (
                                <div className="mt-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                                    <p className="text-sm text-red-800">
                                        <span className="font-medium text-red-900">Lý do rớt:</span> {data.failureReason}
                                    </p>
                                </div>
                            )}
                            {statusSummary.isCompleted && (
                                <p className="text-green-700"><span className="text-gray-500">Kết luận:</span> <span className="font-medium">Hoàn thành</span></p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailPage;