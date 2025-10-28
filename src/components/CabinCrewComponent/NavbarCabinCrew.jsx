
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../../images/Logo.png';
import { t, getLang, setLang, onLangChange } from '../../i18n';
import flagVI from '../../assets/flags/vi.svg';
import flagGB from '../../assets/flags/gb.svg';

const NavbarCabinCrew = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lang, setLangState] = useState(getLang());
    const [user, setUser] = useState(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    useEffect(() => {
        const off = onLangChange((l) => setLangState(l));
        return () => off();
    }, []);

    useEffect(() => {
        const readUser = () => {
            const raw = localStorage.getItem('user');
            setUser(raw ? JSON.parse(raw) : null);
        };
        readUser();
        const onAuth = () => readUser();
        window.addEventListener('storage', onAuth);
        window.addEventListener('auth-changed', onAuth);
        return () => {
            window.removeEventListener('storage', onAuth);
            window.removeEventListener('auth-changed', onAuth);
        };
    }, []);

    const toggleLang = () => {
        setLang(lang === 'vi' ? 'en' : 'vi');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-changed'));
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
        navigate('/');
    };

    return (
        <nav className="bg-gradient-to-r from-airline-blue-900 via-airline-blue-800 to-sky-700 shadow-xl sticky top-0 z-50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-20">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link to="/cabin-crew/home" className="flex items-center hover:opacity-80 transition-opacity duration-300">
                            <img
                                src={logoImage}
                                alt="SkyCabin Airlines"
                                className="h-10 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    <div className="hidden lg:flex items-center justify-center flex-1 space-x-5">
                        <Link
                            to="/cabin-crew/home"
                            className="nav-link px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                        >
                            {t('home')}
                        </Link>
                        <Link
                            to="/cabin-crew/promotion"
                            className="nav-link px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                        >
                            {t('promotion')}
                        </Link>
                        <Link
                            to="/cabin-crew/appointment"
                            className="nav-link px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                        >
                            {t('appointment')}
                        </Link>
                        <Link
                            to="/cabin-crew/score-report"
                            className="nav-link px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                        >
                            {t('score_report')}
                        </Link>
                        <Link
                            to="/cabin-crew/test"
                            className="nav-link px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                        >
                            {t('test')}
                        </Link>
                        <Link
                            to="/cabin-crew/contact"
                            className="nav-link px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                        >
                            {t('contact')}
                        </Link>
                    </div>

                    {/* Lang + Auth Buttons / User */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <button
                            onClick={toggleLang}
                            className="px-2 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
                            aria-label="Toggle language"
                            title={t(lang === 'vi' ? 'en' : 'vi')}
                        >
                            <img src={lang === 'vi' ? flagVI : flagGB} alt="flag" className="w-6 h-6 rounded-sm shadow-sm" />
                        </button>
                        {user ? (
                            <div className="relative text-white">
                                <button
                                    type="button"
                                    onClick={() => setIsUserMenuOpen((v) => !v)}
                                    className="flex items-center gap-3 px-2 py-1 rounded-md hover:bg-white/10 focus:outline-none"
                                    aria-haspopup="menu"
                                    aria-expanded={isUserMenuOpen ? 'true' : 'false'}
                                >
                                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                                        {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden md:inline">{t('hello')}, {user.displayName || user.username}</span>
                                </button>
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white text-gray-700 rounded-lg shadow-xl ring-1 ring-black/5 overflow-hidden">
                                        <Link
                                            to="/cabin-crew/settings"
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 3.4l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51.32.13.67.2 1.02.2H21a2 2 0 1 1 0 4h-.09c-.35 0-.7.07-1.02.2-.61.25-1 .85-1 1.51z" />
                                            </svg>
                                            {t('settings')}
                                        </Link>
                                        <Link
                                            to="/cabin-crew/profile"
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            {t('profile')}
                                        </Link>
                                                <Link
                                                    to="/cabin-crew/promotion-history"
                                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14,2 14,8 20,8" />
                                                        <line x1="16" y1="13" x2="8" y2="13" />
                                                        <line x1="16" y1="17" x2="8" y2="17" />
                                                        <polyline points="10,9 9,9 8,9" />
                                                    </svg>
                                                    {t('promotion_history')}
                                                </Link>
                                                <Link
                                                    to="/cabin-crew/promotion-stages"
                                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                        <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" />
                                                        <path d="M9 11V9a3 3 0 0 1 6 0v2" />
                                                        <path d="M12 15v2" />
                                                        <path d="M12 19h.01" />
                                                    </svg>
                                                    {t('promotion_stages')}
                                                </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <path d="M16 17l5-5-5-5" />
                                                <path d="M21 12H9" />
                                            </svg>
                                            {t('signout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-white border border-white/30 rounded-lg hover:bg-white/10 transition-all duration-300 font-medium"
                                >
                                    {t('signin')}
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium"
                                >
                                    {t('signup')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white hover:text-sky-200 focus:outline-none focus:text-sky-200 p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                        >
                            {isMenuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="lg:hidden animate-slide-down">
                        <div className="px-4 pt-4 pb-6 space-y-2 bg-airline-blue-800/95 backdrop-blur-sm rounded-xl mt-4 shadow-2xl border border-white/10">
                            <Link
                                to="/home"
                                className="block px-4 py-3 text-white hover:text-sky-200 hover:bg-white/10 transition-all duration-300 rounded-lg font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('home')}
                            </Link>
                            <Link
                                to="/recruitment"
                                className="block px-4 py-3 text-white hover:text-sky-200 hover:bg-white/10 transition-all duration-300 rounded-lg font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('recruitment')}
                            </Link>
                            <Link
                                to="/appointment"
                                className="block px-4 py-3 text-white hover:text-sky-200 hover:bg-white/10 transition-all duration-300 rounded-lg font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('appointment')}
                            </Link>
                            <Link
                                to="/score-report"
                                className="block px-4 py-3 text-white hover:text-sky-200 hover:bg-white/10 transition-all duration-300 rounded-lg font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('score_report')}
                            </Link>
                            <Link
                                to="/test"
                                className="block px-4 py-3 text-white hover:text-sky-200 hover:bg-white/10 transition-all duration-300 rounded-lg font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('test')}
                            </Link>
                            <Link
                                to="/contact"
                                className="block px-4 py-3 text-white hover:text-sky-200 hover:bg-white/10 transition-all duration-300 rounded-lg font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('contact')}
                            </Link>
                            <div className="border-t border-white/20 pt-4 mt-4 space-y-2">
                                <button
                                    onClick={() => { toggleLang(); setIsMenuOpen(false); }}
                                    className="block w-full px-4 py-3 text-white hover:text-sky-200 hover:bg-white/10 transition-all duration-300 rounded-lg font-medium text-left"
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <img src={lang === 'vi' ? flagGB : flagVI} alt="flag" className="w-5 h-5 rounded-sm" />
                                        <span>({t('language')})</span>
                                    </span>
                                </button>
                                {user ? (
                                    <div className="flex items-center justify-between px-2 text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                                                {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <span>{t('hello')}, {user.displayName || user.username}</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Link
                                                to="/settings"
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 3.4l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51.32.13.67.2 1.02.2H21a2 2 0 1 1 0 4h-.09c-.35 0-.7.07-1.02.2-.61.25-1 .85-1 1.51z" />
                                                </svg>
                                                {t('settings')}
                                            </Link>
                                            <Link
                                                to="/profile"
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                                {t('profile')}
                                            </Link>
                                            {user?.role === 'candidate' && (
                                                <>
                                                    <Link
                                                        to="/recruitment-history"
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                            <polyline points="14,2 14,8 20,8" />
                                                            <line x1="16" y1="13" x2="8" y2="13" />
                                                            <line x1="16" y1="17" x2="8" y2="17" />
                                                            <polyline points="10,9 9,9 8,9" />
                                                        </svg>
                                                        {t('recruitment_history')}
                                                    </Link>
                                                    <Link
                                                        to="/recruitment-stages"
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                            <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" />
                                                            <path d="M9 11V9a3 3 0 0 1 6 0v2" />
                                                            <path d="M12 15v2" />
                                                            <path d="M12 19h.01" />
                                                        </svg>
                                                        {t('recruitment_stages')}
                                                    </Link>
                                                </>
                                            )}
                                            {user?.role === 'cabin-crew' && (
                                                <>
                                                    <Link
                                                        to="/promotion-history"
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                            <polyline points="14,2 14,8 20,8" />
                                                            <line x1="16" y1="13" x2="8" y2="13" />
                                                            <line x1="16" y1="17" x2="8" y2="17" />
                                                            <polyline points="10,9 9,9 8,9" />
                                                        </svg>
                                                        {t('promotion_history')}
                                                    </Link>
                                                    <Link
                                                        to="/promotion-stages"
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                            <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" />
                                                            <path d="M9 11V9a3 3 0 0 1 6 0v2" />
                                                            <path d="M12 15v2" />
                                                            <path d="M12 19h.01" />
                                                        </svg>
                                                        {t('promotion_stages')}
                                                    </Link>
                                                </>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                    <path d="M16 17l5-5-5-5" />
                                                    <path d="M21 12H9" />
                                                </svg>
                                                {t('signout')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-2">
                                        <Link
                                            to="/login"
                                            className="block px-4 py-3 text-white hover:text-sky-200 hover:bg-white/10 transition-all duration-300 rounded-lg font-medium text-center border border-white/30"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {t('signin')}
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="block px-4 py-3 bg-white text-blue-600 hover:bg-gray-50 transition-all duration-300 rounded-lg font-medium text-center"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {t('signup')}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavbarCabinCrew;
