import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { t, onLangChange } from '../i18n';

const Signin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setShowPassword((v) => v));
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
            const { username, password } = formData;
            // Fake account
            const mockAccount = { username: 'testuser', password: '123456', displayName: 'Test User' };

            if (
                (username === mockAccount.username || username === mockAccount.displayName) &&
                password === mockAccount.password
            ) {
                const mockUser = {
                    username: mockAccount.username,
                    displayName: mockAccount.displayName,
                    avatarUrl: ''
                };
                localStorage.setItem('user', JSON.stringify(mockUser));
                // notify other tabs/components
                window.dispatchEvent(new Event('auth-changed'));
                toast.success(t('logging_in'));
                navigate('/home');
            } else {
                toast.error(t('invalid_credentials') || 'Thông tin đăng nhập không hợp lệ');
            }
            setIsLoading(false);
        }, 800);
    };

    const handleGoogleLogin = () => {
        try {
            window.location.href = '/auth/google';
        } catch (error) {
            console.error('Google login error:', error);
        }
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
                {/* Airplanes removed */}
            </div>
            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-white">{t('signin_title')}</h2>
                    <p className="mt-2 text-sm text-gray-300">{t('signin_subtitle')}</p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-300">
                        <div className="space-y-6">
                            {/* Username Field */}
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                    placeholder={t('username_placeholder')}
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">{t('password_label')}</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pr-12 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                        placeholder={t('password_placeholder')}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? t('password_hide') : t('password_show')}
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            // Eye-off icon
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                                                <path d="M3 3l18 18" />
                                                <path d="M10.584 10.59a2 2 0 102.828 2.83" />
                                                <path d="M16.681 16.69A10.941 10.941 0 0112 18c-5 0-9-4.5-10-6 0 0 1.273-1.947 3.5-3.6M14.12 5.11A10.94 10.94 0 0112 6c5 0 9 4.5 10 6 0 0-1.055 1.615-2.94 3.17" />
                                            </svg>
                                        ) : (
                                            // Eye icon
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">{t('remember_me')}</label>
                                </div>

                                <div className="text-sm">
                                    <Link
                                        to="/forgot-password"
                                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                    >
                                        {t('forgot_password')}
                                    </Link>
                                </div>
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
                                            {t('logging_in')}
                                        </div>
                                    ) : (
                                        t('signin')
                                    )}
                                </button>
                            </div>
                            <div className="flex items-center my-2">
                                <div className="flex-1 h-px bg-gray-300"></div>
                                <span className="px-3 text-xs text-gray-500">{t('or')}</span>
                                <div className="flex-1 h-px bg-gray-300"></div>
                            </div>
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.046,6.053,28.723,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.046,6.053,28.723,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                    <path fill="#4CAF50" d="M24,44c4.646,0,8.867-1.773,12.076-4.663l-5.579-4.711C28.492,36.91,26.354,38,24,38 c-5.202,0-9.613-3.317-11.271-7.946l-6.5,5.017C9.539,39.556,16.227,44,24,44z" />
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.106,5.626 c0.001-0.001,0.002-0.001,0.003-0.002l5.579,4.711C35.525,39.066,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                </svg>
                                {t('login_with_google')}
                            </button>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center">
                        <p className="text-sm text-white">
                            {t('no_account')}{' '}
                            <Link
                                to="/signup"
                                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-200"
                            >
                                {t('signup_now')}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signin;
