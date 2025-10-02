import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../images/Logo.png';
import { t, getLang, setLang, onLangChange } from '../i18n';
import flagVI from '../assets/flags/vi.svg';
import flagGB from '../assets/flags/gb.svg';
import Loading from '../components/Loading';

const MainPage = () => {
    const navigate = useNavigate();

    // Data giả để test login
    const testUsers = {
        candidate: {
            username: 'testuser',
            password: '123456',
            displayName: 'Test Candidate',
            role: 'candidate'
        },
        admin: {
            username: 'admin',
            password: 'admin123',
            displayName: 'System Admin',
            role: 'admin'
        },
        recruiter: {
            username: 'recruiter',
            password: 'recruiter123',
            displayName: 'HR Recruiter',
            role: 'recruiter'
        },
        'airline-partner': {
            username: 'airline',
            password: 'airline123',
            displayName: 'Airline Partner',
            role: 'airline-partner'
        }
    };

    const [candidateLoginData, setCandidateLoginData] = useState({
        username: '',
        password: ''
    });
    const [adminLoginData, setAdminLoginData] = useState({
        username: '',
        password: ''
    });
    const [lang, setLangState] = useState(getLang());
    const [showPassword, setShowPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    useEffect(() => {
        const off = onLangChange((l) => setLangState(l));
        return () => off();
    }, []);

    const toggleLang = () => {
        setLang(lang === 'vi' ? 'en' : 'vi');
    };

    // Hàm helper để kiểm tra login
    const checkLogin = (username, password) => {
        for (const [, userData] of Object.entries(testUsers)) {
            if (userData.username === username && userData.password === password) {
                return userData;
            }
        }
        return null;
    };

    const handleCandidateInputChange = (e) => {
        setCandidateLoginData({
            ...candidateLoginData,
            [e.target.name]: e.target.value
        });
    };

    const handleAdminInputChange = (e) => {
        setAdminLoginData({
            ...adminLoginData,
            [e.target.name]: e.target.value
        });
    };

    const handleCandidateLogin = (e) => {
        e.preventDefault();

        // Kiểm tra thông tin đăng nhập cơ bản
        if (!candidateLoginData.username || !candidateLoginData.password) {
            alert('Vui lòng điền đầy đủ thông tin đăng nhập');
            return;
        }

        // Kiểm tra với data giả
        const userData = checkLogin(candidateLoginData.username, candidateLoginData.password);

        if (userData && userData.role === 'candidate') {
            // Lưu thông tin user vào localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            window.dispatchEvent(new Event('auth-changed'));

            // Hiển thị loading
            setIsLoading(true);
            setLoadingMessage(t('loading_authenticating'));

            // Chờ 3 giây trước khi chuyển trang
            setTimeout(() => {
                setIsLoading(false);
                navigate('/home');
            }, 3000);
        } else {
            alert('Thông tin đăng nhập không đúng hoặc không phải tài khoản Candidate');
        }
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();

        // Kiểm tra thông tin đăng nhập cơ bản
        if (!adminLoginData.username || !adminLoginData.password) {
            alert('Vui lòng điền đầy đủ thông tin đăng nhập');
            return;
        }

        // Kiểm tra với data giả
        const userData = checkLogin(adminLoginData.username, adminLoginData.password);

        if (userData && ['admin', 'recruiter', 'airline-partner'].includes(userData.role)) {
            // Lưu thông tin user vào localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            window.dispatchEvent(new Event('auth-changed'));

            // Hiển thị loading
            setIsLoading(true);
            setLoadingMessage(t('loading_authenticating'));

            // Chờ 3 giây trước khi chuyển trang
            setTimeout(() => {
                setIsLoading(false);
                // Chuyển hướng theo role
                switch (userData.role) {
                    case 'admin':
                        navigate('/admin/dashboard/cabin-crews');
                        break;
                    case 'recruiter':
                        navigate('/recruiter/campaigns');
                        break;
                    case 'airline-partner':
                        navigate('/airline-partner/campaigns');
                        break;
                    default:
                        alert('Role không được hỗ trợ');
                }
            }, 3000);
        } else {
            alert('Thông tin đăng nhập không đúng hoặc không phải tài khoản Admin/HR');
        }
    };

    return (
        <>
            {isLoading && <Loading message={loadingMessage} />}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="w-full max-w-6xl">
                    {/* Language Toggle */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={toggleLang}
                            className="p-2 rounded-lg bg-white/80 text-gray-700 hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg"
                            aria-label="Toggle language"
                            title={t(lang === 'vi' ? 'en' : 'vi')}
                        >
                            <img src={lang === 'vi' ? flagVI : flagGB} alt="flag" className="w-6 h-6 rounded-sm" />
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <img
                            src={logoImage}
                            alt="SkyCabin Airlines"
                            className="h-16 w-auto mx-auto mb-4"
                        />
                        <p className="text-gray-600 mt-2">{t('mainpage_subtitle')}</p>
                    </div>

                    {/* Main Content */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Candidate Section */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <h2 className="text-xl font-bold text-white">{t('candidate_title')}</h2>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <div className="mb-6">
                                    <p className="text-gray-600 text-lg mb-2 text-center">{t('candidate_desc')}</p>
                                    <p className="text-gray-500 text-sm text-center">{t('candidate_desc_detail')}</p>
                                </div>

                                <form onSubmit={handleCandidateLogin} className="space-y-4">
                                    {/* Username Field */}
                                    <div>
                                        <label htmlFor="candidate-username" className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('username_label')}
                                        </label>
                                        <input
                                            id="candidate-username"
                                            name="username"
                                            type="text"
                                            autoComplete="username"
                                            value={candidateLoginData.username}
                                            onChange={handleCandidateInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                            placeholder={t('username_placeholder')}
                                        />
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="candidate-password" className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('password_label')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="candidate-password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                value={candidateLoginData.password}
                                                onChange={handleCandidateInputChange}
                                                className="w-full pr-12 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                                placeholder={t('password_placeholder')}
                                            />
                                            <button
                                                type="button"
                                                aria-label={showPassword ? t('password_hide') : t('password_show')}
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                            >
                                                {showPassword ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                                                        <path d="M3 3l18 18" />
                                                        <path d="M10.584 10.59a2 2 0 102.828 2.83" />
                                                        <path d="M16.681 16.69A10.941 10.941 0 0112 18c-5 0-9-4.5-10-6 0 0 1.273-1.947 3.5-3.6M14.12 5.11A10.94 10.94 0 0112 6c5 0 9 4.5 10 6 0 0-1.055 1.615-2.94 3.17" />
                                                    </svg>
                                                ) : (
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
                                                id="candidate-remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="candidate-remember-me" className="ml-2 block text-sm text-gray-700">
                                                {t('remember_me')}
                                            </label>
                                        </div>
                                        <div className="text-sm">
                                            <Link
                                                to="/forgot-password"
                                                className="text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                                            >
                                                {t('forgot_password')}
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                    >
                                        {t('signin')}
                                    </button>

                                    {/* Divider */}
                                    <div className="flex items-center my-4">
                                        <div className="flex-1 h-px bg-gray-300"></div>
                                        <span className="px-3 text-xs text-gray-500 font-medium">{t('or')}</span>
                                        <div className="flex-1 h-px bg-gray-300"></div>
                                    </div>

                                    {/* Google Login Button */}
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.046,6.053,28.723,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.046,6.053,28.723,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                            <path fill="#4CAF50" d="M24,44c4.646,0,8.867-1.773,12.076-4.663l-5.579-4.711C28.492,36.91,26.354,38,24,38 c-5.202,0-9.613-3.317-11.271-7.946l-6.5,5.017C9.539,39.556,16.227,44,24,44z" />
                                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.106,5.626 c0.001-0.001,0.002-0.001,0.003-0.002l5.579,4.711C35.525,39.066,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                        </svg>
                                        {t('login_with_google')}
                                    </button>
                                </form>

                                {/* Sign Up Link */}
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        {t('no_account')}{' '}
                                        <Link
                                            to="/signup"
                                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                                        >
                                            {t('signup_now')}
                                        </Link>
                                    </p>
                                </div>


                            </div>
                        </div>

                        {/* Admin-HR Section */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                                <h2 className="text-xl font-bold text-white">{t('admin_hr_title')}</h2>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <div className="mb-6">
                                    <p className="text-gray-600 text-lg mb-2 text-center">{t('admin_hr_desc')}</p>
                                    <p className="text-gray-500 text-sm text-center">{t('admin_hr_desc_detail')}</p>
                                </div>

                                <form onSubmit={handleAdminLogin} className="space-y-4">
                                    {/* Username */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('username_label')}
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={adminLoginData.username}
                                            onChange={handleAdminInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                                            placeholder={t('username_placeholder')}

                                        />
                                    </div>

                                    {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('password_label')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="password"
                                            type={showAdminPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            value={adminLoginData.password}
                                            onChange={handleAdminInputChange}
                                            className="w-full pr-12 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                            placeholder={t('password_placeholder')}
                                        />
                                        <button
                                            type="button"
                                            aria-label={showAdminPassword ? t('password_hide') : t('password_show')}
                                            onClick={() => setShowAdminPassword((v) => !v)}
                                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                        >
                                            {showAdminPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                                                    <path d="M3 3l18 18" />
                                                    <path d="M10.584 10.59a2 2 0 102.828 2.83" />
                                                    <path d="M16.681 16.69A10.941 10.941 0 0112 18c-5 0-9-4.5-10-6 0 0 1.273-1.947 3.5-3.6M14.12 5.11A10.94 10.94 0 0112 6c5 0 9 4.5 10 6 0 0-1.055 1.615-2.94 3.17" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                                                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>


                                    {/* Login Button */}
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                    >
                                        {t('login_button')}
                                    </button>
                                </form>

                                {/* Additional Info */}
                                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <p className="text-orange-800 text-sm">
                                        <strong>{t('admin_login_note')}</strong> {t('admin_login_note_detail')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-center mt-8 text-gray-500 text-sm">
                        <p>{t('copyright')}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MainPage;
