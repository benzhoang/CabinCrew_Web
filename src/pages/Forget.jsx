import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { t, onLangChange } from '../i18n';

const Forget = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setFormData((v) => v));
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

        // Simulate API call
        setTimeout(() => {
            const { email } = formData;

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                toast.error(t('invalid_email') || 'Email không hợp lệ');
                setIsLoading(false);
                return;
            }

            // Simulate successful password reset request
            toast.success(t('reset_email_sent') || 'Email đặt lại mật khẩu đã được gửi');
            setIsLoading(false);

            // Navigate back to signin after 2 seconds
            setTimeout(() => {
                navigate('/signin');
            }, 2000);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-600 via-blue-700 to-indigo-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Cloud Animation Background */}
            <div className="absolute inset-0 overflow-hidden z-0">
                {/* Cloud 1 */}
                <div className="absolute top-20 left-10 w-32 h-16 bg-white/30 rounded-full animate-cloud-float-1">
                    <div className="absolute top-4 left-4 w-8 h-8 bg-white/40 rounded-full"></div>
                    <div className="absolute top-2 left-8 w-12 h-10 bg-white/40 rounded-full"></div>
                    <div className="absolute top-6 left-12 w-10 h-8 bg-white/40 rounded-full"></div>
                </div>

                {/* Cloud 2 */}
                <div className="absolute top-40 right-20 w-40 h-20 bg-white/25 rounded-full animate-cloud-float-2">
                    <div className="absolute top-6 left-6 w-10 h-10 bg-white/35 rounded-full"></div>
                    <div className="absolute top-3 left-12 w-16 h-12 bg-white/35 rounded-full"></div>
                    <div className="absolute top-8 left-16 w-12 h-10 bg-white/35 rounded-full"></div>
                </div>

                {/* Cloud 3 */}
                <div className="absolute bottom-32 left-1/4 w-36 h-18 bg-white/20 rounded-full animate-cloud-float-3">
                    <div className="absolute top-5 left-5 w-12 h-10 bg-white/30 rounded-full"></div>
                    <div className="absolute top-2 left-10 w-14 h-12 bg-white/30 rounded-full"></div>
                    <div className="absolute top-7 left-14 w-10 h-8 bg-white/30 rounded-full"></div>
                </div>

                {/* Cloud 4 */}
                <div className="absolute top-60 right-1/3 w-28 h-14 bg-white/35 rounded-full animate-cloud-float-4">
                    <div className="absolute top-3 left-3 w-8 h-8 bg-white/45 rounded-full"></div>
                    <div className="absolute top-1 left-8 w-10 h-8 bg-white/45 rounded-full"></div>
                    <div className="absolute top-5 left-10 w-8 h-6 bg-white/45 rounded-full"></div>
                </div>

                {/* Cloud 5 */}
                <div className="absolute bottom-20 right-10 w-44 h-22 bg-white/25 rounded-full animate-cloud-float-5">
                    <div className="absolute top-6 left-8 w-12 h-10 bg-white/35 rounded-full"></div>
                    <div className="absolute top-3 left-14 w-18 h-14 bg-white/35 rounded-full"></div>
                    <div className="absolute top-9 left-20 w-14 h-10 bg-white/35 rounded-full"></div>
                </div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-white">{t('forgot_password_title') || 'Quên mật khẩu'}</h2>
                    <p className="mt-2 text-sm text-gray-300">{t('forgot_password_subtitle') || 'Nhập email của bạn để nhận liên kết đặt lại mật khẩu'}</p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-300">
                        <div className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('email_label') || 'Email'}
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                    placeholder={t('email_placeholder') || 'Nhập địa chỉ email của bạn'}
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
                                            {t('sending') || 'Đang gửi...'}
                                        </div>
                                    ) : (
                                        t('send_reset_link') || 'Gửi liên kết đặt lại'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Back to Sign In Link */}
                    <div className="text-center">
                        <p className="text-sm text-white">
                            {t('remember_password') || 'Nhớ mật khẩu?'}{' '}
                            <Link
                                to="/signin"
                                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-200"
                            >
                                {t('back_to_signin') || 'Đăng nhập ngay'}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Forget;
