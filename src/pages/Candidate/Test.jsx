import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { t, onLangChange } from '../../i18n';

// Mock data - Danh sách đề thi
const mockExams = [
    {
        id: 1,
        name: 'Đề thi kiến thức tổng hợp - Kỳ 1',
        code: 'EXAM001',
        duration: 30, // phút
        totalQuestions: 15,
        description: 'Bài thi đánh giá kiến thức tổng hợp về dịch vụ hàng không'
    },
    {
        id: 2,
        name: 'Đề thi tiếng Anh chuyên ngành',
        code: 'EXAM002',
        duration: 45,
        totalQuestions: 20,
        description: 'Bài thi đánh giá trình độ tiếng Anh chuyên ngành hàng không'
    },
    {
        id: 3,
        name: 'Đề thi kỹ năng giao tiếp',
        code: 'EXAM003',
        duration: 25,
        totalQuestions: 10,
        description: 'Bài thi đánh giá kỹ năng giao tiếp và xử lý tình huống'
    }
];

const Test = () => {
    const navigate = useNavigate();
    const [expandedExamId, setExpandedExamId] = useState(null); // ID của đề thi đang mở dropdown
    const [passwords, setPasswords] = useState({}); // Lưu mật khẩu cho từng đề thi
    const [isLoading, setIsLoading] = useState({}); // Loading state cho từng đề thi
    const [langVersion, setLangVersion] = useState(0); // Force re-render when language changes

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1));
        return () => off();
    }, []);

    const handlePasswordChange = (examId, value) => {
        setPasswords({
            ...passwords,
            [examId]: value
        });
    };

    const toggleDropdown = (examId) => {
        if (expandedExamId === examId) {
            setExpandedExamId(null);
        } else {
            setExpandedExamId(examId);
            // Reset password khi mở dropdown mới
            if (!passwords[examId]) {
                setPasswords({ ...passwords, [examId]: '' });
            }
        }
    };

    const handleSubmit = async (examId) => {
        const password = passwords[examId] || '';

        // Validate password
        if (!password.trim()) {
            toast.error(t('exam_password_required') || 'Vui lòng nhập mật khẩu đề thi');
            return;
        }

        setIsLoading({ ...isLoading, [examId]: true });

        // Simulate API call - validate exam password
        setTimeout(() => {
            // TODO: Replace with actual API call
            // const response = await validateExamPassword(examId, password);

            // Simulate successful validation
            toast.success(t('exam_login_success') || 'Đăng nhập thành công. Chuyển đến trang làm bài...');
            setIsLoading({ ...isLoading, [examId]: false });

            // Navigate to exam page
            setTimeout(() => {
                navigate('/exam');
            }, 1500);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">{t('exam_list_title') || 'Danh sách đề thi'}</h2>
                    <p className="mt-2 text-sm text-gray-600">{t('exam_list_subtitle') || 'Chọn đề thi và nhập mật khẩu để bắt đầu làm bài'}</p>
                </div>

                {/* Exam List */}
                <div className="space-y-4">
                    {mockExams.map((exam) => (
                        <div
                            key={exam.id}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-xl"
                        >
                            {/* Exam Info */}
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{exam.name}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{exam.description}</p>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">{t('exam_code') || 'Mã đề:'}</span>
                                                <span className="ml-2 font-semibold text-gray-800">{exam.code}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">{t('exam_duration') || 'Thời gian:'}</span>
                                                <span className="ml-2 font-semibold text-gray-800">{exam.duration} {t('minutes') || 'phút'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">{t('total_questions') || 'Số câu:'}</span>
                                                <span className="ml-2 font-semibold text-gray-800">{exam.totalQuestions}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleDropdown(exam.id)}
                                        className="ml-4 px-6 py-3 bg-gradient-to-r from-blue-800 to-indigo-800 text-white rounded-lg hover:from-blue-900 hover:to-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium whitespace-nowrap"
                                    >
                                        {expandedExamId === exam.id
                                            ? (t('close') || 'Đóng')
                                            : (t('enter_exam') || 'Vào làm bài')
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Password Dropdown */}
                            {expandedExamId === exam.id && (
                                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                    <div className="flex items-end gap-4">
                                        <div className="flex-1">
                                            <label htmlFor={`password-${exam.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('exam_password_label') || 'Mật khẩu đề thi'}
                                            </label>
                                            <input
                                                id={`password-${exam.id}`}
                                                type="password"
                                                value={passwords[exam.id] || ''}
                                                onChange={(e) => handlePasswordChange(exam.id, e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSubmit(exam.id);
                                                    }
                                                }}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                                placeholder={t('exam_password_placeholder') || 'Nhập mật khẩu đề thi'}
                                                autoFocus
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSubmit(exam.id)}
                                            disabled={isLoading[exam.id]}
                                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium whitespace-nowrap"
                                        >
                                            {isLoading[exam.id] ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    {t('loading') || 'Đang xử lý...'}
                                                </div>
                                            ) : (
                                                t('confirm') || 'Xác nhận'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Test;
