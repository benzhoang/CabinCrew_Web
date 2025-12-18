import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../i18n';
import { register } from '../service/api';
import { toast } from 'react-toastify';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        gender: 1,
        dateOfBirth: '',
        mobileNumber: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setShowConfirmPassword((v) => v));
        return () => off();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'gender' ? Number(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate username length (minimum 8 characters)
        if (formData.username.length < 8) {
            toast.error('Username must be at least 8 characters long.');
            setIsLoading(false);
            return;
        }

        // Validate password length (minimum 8 characters)
        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long.');
            setIsLoading(false);
            return;
        }

        // Validate password and confirmPassword
        if (formData.password !== formData.confirmPassword) {
            toast.error('Password and Confirm Password do not match.');
            setIsLoading(false);
            return;
        }

        // Chuẩn hoá payload theo API backend
        const payload = {
            username: formData.username,
            password: formData.password,
            confirmedPassword: formData.confirmPassword,
            fullName: formData.fullName,
            gender: Number(formData.gender),
            dateOfBirth: formData.dateOfBirth,
            phoneNumber: formData.mobileNumber,
            email: formData.email
        };

        try {
            const response = await register(payload);
            if (response.success) {
                // On successful registration, show toast and navigate to login
                toast.success('Registration successful. You can now log in with your account.');
                navigate('/login');
            } else {
                // Display API error message with clear English reason
                toast.error(
                    response.error ||
                    'Registration failed. Please check your information and try again.'
                );
            }
        } catch (err) {
            // Handle unexpected errors with clear English message
            const message =
                err.response?.data?.message ||
                err.message ||
                'An unexpected error occurred during registration. Please try again later.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-600 via-blue-700 to-indigo-700 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Cloud Animation Background (unchanged) */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <div className="absolute top-20 left-10 w-32 h-16 bg-white/30 rounded-full animate-cloud-float-1">
                    <div className="absolute top-4 left-4 w-8 h-8 bg-white/40 rounded-full"></div>
                    <div className="absolute top-2 left-8 w-12 h-10 bg-white/40 rounded-full"></div>
                    <div className="absolute top-6 left-12 w-10 h-8 bg-white/40 rounded-full"></div>
                </div>
                <div className="absolute top-40 right-20 w-40 h-20 bg-white/25 rounded-full animate-cloud-float-2">
                    <div className="absolute top-6 left-6 w-10 h-10 bg-white/35 rounded-full"></div>
                    <div className="absolute top-3 left-12 w-16 h-12 bg-white/35 rounded-full"></div>
                    <div className="absolute top-8 left-16 w-12 h-10 bg-white/35 rounded-full"></div>
                </div>
                <div className="absolute bottom-32 left-1/4 w-36 h-18 bg-white/20 rounded-full animate-cloud-float-3">
                    <div className="absolute top-5 left-5 w-12 h-10 bg-white/30 rounded-full"></div>
                    <div className="absolute top-2 left-10 w-14 h-12 bg-white/30 rounded-full"></div>
                    <div className="absolute top-7 left-14 w-10 h-8 bg-white/30 rounded-full"></div>
                </div>
                <div className="absolute top-60 right-1/3 w-28 h-14 bg-white/35 rounded-full animate-cloud-float-4">
                    <div className="absolute top-3 left-3 w-8 h-8 bg-white/45 rounded-full"></div>
                    <div className="absolute top-1 left-8 w-10 h-8 bg-white/45 rounded-full"></div>
                    <div className="absolute top-5 left-10 w-8 h-6 bg-white/45 rounded-full"></div>
                </div>
                <div className="absolute bottom-20 right-10 w-44 h-22 bg-white/25 rounded-full animate-cloud-float-5">
                    <div className="absolute top-6 left-8 w-12 h-10 bg-white/35 rounded-full"></div>
                    <div className="absolute top-3 left-14 w-18 h-14 bg-white/35 rounded-full"></div>
                    <div className="absolute top-9 left-20 w-14 h-10 bg-white/35 rounded-full"></div>
                </div>
            </div>
            <div className="max-w-4xl w-full relative z-10">
                {/* Back to Home Button */}
                <div className="mb-6">
                    <Link
                        to="/home"
                        className="inline-flex items-center text-white hover:text-blue-200 transition-colors duration-200 font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 mr-2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        {t('back_to_home')}
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-2">{t('signup_title').toUpperCase()}</h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* PERSONAL INFORMATION Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">{t('personal_information_title')}</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('fullname_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="fullName"
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={t('fullname_label')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('gender_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        required
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={1}>{t('male')}</option>
                                        <option value={2}>{t('female')}</option>
                                        <option value={3}>{t('other')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('date_of_birth_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="dateOfBirth"
                                        type="date"
                                        required
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        max="2003-12-31"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('mobile_number_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="mobileNumber"
                                        type="tel"
                                        required
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={t('mobile_number_placeholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('email_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={t('email_placeholder')}
                                    />
                                </div>
                            </div>

                            {/* LOGIN INFORMATION Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">{t('login_information_title')}</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('account_username_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={t('username_placeholder')}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">{t('username_helper')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('password_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={t('password_placeholder')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                                    <path d="M3 3l18 18" />
                                                    <path d="M10.584 10.59a2 2 0 102.828 2.83" />
                                                    <path d="M16.681 16.69A10.941 10.941 0 0112 18c-5 0-9-4.5-10-6 0 0 1.273-1.947 3.5-3.6M14.12 5.11A10.94 10.94 0 0112 6c5 0 9 4.5 10 6 0 0-1.055 1.615-2.94 3.17" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">{t('password_helper')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('password_confirm_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={t('password_confirm_placeholder')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((v) => !v)}
                                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                                    <path d="M3 3l18 18" />
                                                    <path d="M10.584 10.59a2 2 0 102.828 2.83" />
                                                    <path d="M16.681 16.69A10.941 10.941 0 0112 18c-5 0-9-4.5-10-6 0 0 1.273-1.947 3.5-3.6M14.12 5.11A10.94 10.94 0 0112 6c5 0 9 4.5 10 6 0 0-1.055 1.615-2.94 3.17" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end mt-8">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 bg-blue-400 hover:bg-blue-500 text-white font-semibold rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? t('creating_account') : t('submit_button')}
                            </button>
                        </div>

                        {/* Link to Signin */}
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600">
                                {t('have_account')}{' '}
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                                >
                                    {t('sign_in_link')}
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;