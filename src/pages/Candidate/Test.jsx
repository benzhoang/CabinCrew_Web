import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { t, onLangChange } from '../../i18n';

const Test = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        examCode: '', // Số báo danh
        examPassword: '' // Mật khẩu đề thi
    });
    const [isLoading, setIsLoading] = useState(false);
    const [langVersion, setLangVersion] = useState(0); // Force re-render when language changes

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1));
        return () => off();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate form
        if (!formData.examCode.trim()) {
            toast.error(t('exam_code_required') || 'Vui lòng nhập số báo danh');
            setIsLoading(false);
            return;
        }

        if (!formData.examPassword.trim()) {
            toast.error(t('exam_password_required') || 'Vui lòng nhập mật khẩu đề thi');
            setIsLoading(false);
            return;
        }

        // Simulate API call - validate exam code and password
        setTimeout(() => {
            // TODO: Replace with actual API call
            // const response = await validateExamCredentials(formData.examCode, formData.examPassword);

            // Simulate successful validation
            toast.success(t('exam_login_success') || 'Đăng nhập thành công. Chuyển đến trang làm bài...');
            setIsLoading(false);

            // Navigate to exam page
            setTimeout(() => {
                navigate('/exam');
            }, 1500);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-800">{t('exam_login_title') || 'Đăng nhập làm bài thi'}</h2>
                    <p className="mt-2 text-sm text-gray-600">{t('exam_login_subtitle') || 'Nhập số báo danh và mật khẩu đề thi để bắt đầu làm bài'}</p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                        <div className="space-y-6">
                            {/* Exam Code Field */}
                            <div>
                                <label htmlFor="examCode" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('exam_code_label') || 'Số báo danh'}
                                </label>
                                <input
                                    id="examCode"
                                    name="examCode"
                                    type="text"
                                    required
                                    value={formData.examCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                    placeholder={t('exam_code_placeholder') || 'Nhập số báo danh của bạn'}
                                />
                            </div>

                            {/* Exam Password Field */}
                            <div>
                                <label htmlFor="examPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('exam_password_label') || 'Mật khẩu đề thi'}
                                </label>
                                <input
                                    id="examPassword"
                                    name="examPassword"
                                    type="password"
                                    required
                                    value={formData.examPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                    placeholder={t('exam_password_placeholder') || 'Nhập mật khẩu đề thi'}
                                />
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-900 hover:to-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {t('loading') || 'Đang xử lý...'}
                                        </div>
                                    ) : (
                                        t('enter_exam') || 'Vào làm bài'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Test;
