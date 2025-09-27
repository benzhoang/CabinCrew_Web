import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../i18n';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setShowConfirmPassword((v) => v));
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

        // Giả lập gọi API
        setTimeout(() => {
            console.log('Signup data:', formData);
            setIsLoading(false);
            // Sau khi đăng ký thành công, chuyển đến trang OTP
            navigate('/otp');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-600 via-blue-700 to-indigo-700 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Cloud Animation Background (same as Signin) */}
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
            <div className="max-w-md w-full space-y-6 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-2 text-2xl font-semibold text-white">{t('signup_title')}</h2>
                    <p className="mt-1 text-sm text-gray-200">{t('signup_subtitle')}</p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200">
                        <div className="space-y-4">
                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">{t('username_label')}</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                    placeholder={t('username_placeholder')}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t('email_label')}</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                    placeholder={t('email_placeholder')}
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">{t('password_label')}</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pr-10 px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                        placeholder={t('password_placeholder')}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? t('password_hide') : t('password_show')}
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute inset-y-0 right-0 px-2.5 flex items-center text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            // Eye-off icon
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                                <path d="M3 3l18 18" />
                                                <path d="M10.584 10.59a2 2 0 102.828 2.83" />
                                                <path d="M16.681 16.69A10.941 10.941 0 0112 18c-5 0-9-4.5-10-6 0 0 1.273-1.947 3.5-3.6M14.12 5.11A10.94 10.94 0 0112 6c5 0 9 4.5 10 6 0 0-1.055 1.615-2.94 3.17" />
                                            </svg>
                                        ) : (
                                            // Eye icon
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">{t('password_confirm_label')}</label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pr-10 px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                        placeholder={t('password_confirm_placeholder')}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showConfirmPassword ? t('password_hide') : t('password_show')}
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        className="absolute inset-y-0 right-0 px-2.5 flex items-center text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? (
                                            // Eye-off icon
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                                <path d="M3 3l18 18" />
                                                <path d="M10.584 10.59a2 2 0 102.828 2.83" />
                                                <path d="M16.681 16.69A10.941 10.941 0 0112 18c-5 0-9-4.5-10-6 0 0 1.273-1.947 3.5-3.6M14.12 5.11A10.94 10.94 0 0112 6c5 0 9 4.5 10 6 0 0-1.055 1.615-2.94 3.17" />
                                            </svg>
                                        ) : (
                                            // Eye icon
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2.5 px-4 rounded-md shadow text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">{t('creating_account')}</div>
                                    ) : (
                                        t('create_account')
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Link to Signin */}
                    <div className="text-center">
                        <p className="text-sm text-white/95">
                            {t('have_account')}{' '}
                            <Link
                                to="/"
                                className="text-yellow-300 hover:text-yellow-200 font-medium transition-colors duration-200"
                            >
                                {t('signin')}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
