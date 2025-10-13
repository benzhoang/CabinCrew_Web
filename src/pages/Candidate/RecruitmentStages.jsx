import React, { useEffect, useState } from 'react';
import { t, onLangChange } from '../../i18n';

const RecruitmentStages = () => {
    // Tự động re-render khi đổi ngôn ngữ
    const [langTick, setLangTick] = useState(0);
    useEffect(() => {
        const off = onLangChange(() => setLangTick((v) => v + 1));
        return () => off();
    }, []);

    // Mock data cho các giai đoạn tuyển dụng
    const recruitmentStages = [
        {
            id: 1,
            position: 'Tuyển dụng Tiếp viên Hàng không 2025',
            company: 'Vietnam Airlines',
            appliedDate: '2024-01-15',
            status: 'pending',
            statusText: 'Đang xem xét',
            statusTextEn: 'Under Review',
            location: 'Hà Nội, TP.HCM',
            salary: '$2,500 - $3,500/month',
            description: 'Cơ hội trở thành tiếp viên hàng không chuyên nghiệp.',
            currentStage: 2, // Đang ở giai đoạn "Kiểm tra ngoại hình"
            stages: [
                { id: 1, name: 'Kiểm tra hồ sơ', nameEn: 'Document Review', completed: true, date: '2024-01-16' },
                { id: 2, name: 'Kiểm tra ngoại hình', nameEn: 'Physical Check', completed: true, date: '2024-01-20' },
                { id: 3, name: 'Kiểm tra tiếng Anh', nameEn: 'English Test', completed: false, date: null },
                { id: 4, name: 'Phỏng vấn', nameEn: 'Interview', completed: false, date: null },
                { id: 5, name: 'Kết quả cuối cùng', nameEn: 'Final Result', completed: false, date: null }
            ]
        },
        {
            id: 2,
            position: 'Ground Staff Intake',
            company: 'Bamboo Airways',
            appliedDate: '2023-12-20',
            status: 'rejected',
            statusText: 'Không đạt yêu cầu',
            statusTextEn: 'Not Qualified',
            location: 'Đà Nẵng',
            salary: '$2,200 - $3,200/month',
            description: 'Tuyển dụng nhân viên mặt đất phụ trách làm thủ tục.',
            currentStage: 1, // Bị loại ở giai đoạn "Kiểm tra hồ sơ"
            stages: [
                { id: 1, name: 'Kiểm tra hồ sơ', nameEn: 'Document Review', completed: true, date: '2023-12-21' },
                { id: 2, name: 'Kiểm tra ngoại hình', nameEn: 'Physical Check', completed: false, date: null },
                { id: 3, name: 'Kiểm tra tiếng Anh', nameEn: 'English Test', completed: false, date: null },
                { id: 4, name: 'Phỏng vấn', nameEn: 'Interview', completed: false, date: null },
                { id: 5, name: 'Kết quả cuối cùng', nameEn: 'Final Result', completed: false, date: null }
            ]
        },
        {
            id: 3,
            position: 'Pilot Cadet Program',
            company: 'VietJet Air',
            appliedDate: '2023-11-10',
            status: 'accepted',
            statusText: 'Đã được chấp nhận',
            statusTextEn: 'Accepted',
            location: 'TP.HCM',
            salary: '$2,800 - $3,800/month',
            description: 'Chương trình học viên phi công đã kết thúc.',
            currentStage: 5, // Hoàn thành tất cả giai đoạn
            stages: [
                { id: 1, name: 'Kiểm tra hồ sơ', nameEn: 'Document Review', completed: true, date: '2023-11-12' },
                { id: 2, name: 'Kiểm tra ngoại hình', nameEn: 'Physical Check', completed: true, date: '2023-11-15' },
                { id: 3, name: 'Kiểm tra tiếng Anh', nameEn: 'English Test', completed: true, date: '2023-11-18' },
                { id: 4, name: 'Phỏng vấn', nameEn: 'Interview', completed: true, date: '2023-11-22' },
                { id: 5, name: 'Kết quả cuối cùng', nameEn: 'Final Result', completed: true, date: '2023-11-25' }
            ]
        },
        {
            id: 4,
            position: 'Customer Service Expansion',
            company: 'Pacific Airlines',
            appliedDate: '2023-10-05',
            status: 'rejected',
            statusText: 'Không đạt yêu cầu',
            statusTextEn: 'Not Qualified',
            location: 'Hà Nội',
            salary: '$800 - $1,200/month',
            description: 'Mở rộng đội ngũ chăm sóc khách hàng tại sân bay Nội Bài.',
            currentStage: 3, // Bị loại ở giai đoạn "Kiểm tra tiếng Anh"
            stages: [
                { id: 1, name: 'Kiểm tra hồ sơ', nameEn: 'Document Review', completed: true, date: '2023-10-07' },
                { id: 2, name: 'Kiểm tra ngoại hình', nameEn: 'Physical Check', completed: true, date: '2023-10-10' },
                { id: 3, name: 'Kiểm tra tiếng Anh', nameEn: 'English Test', completed: true, date: '2023-10-15' },
                { id: 4, name: 'Phỏng vấn', nameEn: 'Interview', completed: false, date: null },
                { id: 5, name: 'Kết quả cuối cùng', nameEn: 'Final Result', completed: false, date: null }
            ]
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'pending':
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

    // Hàm lấy màu sắc cho giai đoạn
    const getStageColor = (stage, currentStage) => {
        if (stage.completed) {
            return 'bg-green-500 text-white';
        } else if (stage.id === currentStage) {
            return 'bg-blue-500 text-white';
        } else {
            return 'bg-gray-300 text-gray-600';
        }
    };

    // Hàm lấy icon cho giai đoạn
    const getStageIcon = (stage, currentStage) => {
        if (stage.completed) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        } else if (stage.id === currentStage) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Giai đoạn tuyển dụng
                    </h1>
                    <p className="text-gray-600">
                        Theo dõi tiến trình ứng tuyển của bạn qua các giai đoạn
                    </p>
                </div>

                {/* Recruitment Stages Section */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Tiến trình ứng tuyển</h2>
                        <p className="text-sm text-gray-600 mt-1">Theo dõi tiến trình ứng tuyển của bạn</p>
                    </div>
                    <div className="p-6">
                        {recruitmentStages.map((application) => (
                            <div key={`stages-${application.id}`} className="mb-8 last:mb-0">
                                <div className="mb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {application.position}
                                        </h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                            {getStatusText(application)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{application.company}</p>
                                    <p className="text-sm text-gray-500 mb-3">{application.description}</p>
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            {application.salary}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Ngày ứng tuyển: {new Date(application.appliedDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Timeline */}
                                <div className="relative">
                                    {/* Progress Line */}
                                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500"
                                            style={{
                                                width: `${(application.currentStage / application.stages.length) * 100}%`
                                            }}
                                        ></div>
                                    </div>

                                    {/* Stages */}
                                    <div className="relative flex justify-between">
                                        {application.stages.map((stage, index) => (
                                            <div key={stage.id} className="flex flex-col items-center">
                                                {/* Stage Circle */}
                                                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${getStageColor(stage, application.currentStage)}`}>
                                                    {getStageIcon(stage, application.currentStage)}
                                                </div>

                                                {/* Stage Info */}
                                                <div className="mt-3 text-center max-w-24">
                                                    <p className="text-xs font-medium text-gray-900">
                                                        {getStageName(stage)}
                                                    </p>
                                                    {stage.date && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(stage.date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Current Status */}
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Trạng thái hiện tại:</strong> {
                                            application.stages.find(stage => stage.id === application.currentStage)?.completed
                                                ? `Hoàn thành ${getStageName(application.stages.find(stage => stage.id === application.currentStage))}`
                                                : `Đang trong giai đoạn ${getStageName(application.stages.find(stage => stage.id === application.currentStage))}`
                                        }
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Empty State (if no applications) */}
                {recruitmentStages.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có đơn ứng tuyển</h3>
                        <p className="mt-1 text-sm text-gray-500">Bạn chưa có đơn ứng tuyển nào để theo dõi tiến trình</p>
                        <div className="mt-6">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                Tìm việc ngay
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruitmentStages;
