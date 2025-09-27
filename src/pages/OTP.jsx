import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../i18n';

const OTP = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setIsSubmitting((v) => v));
        return () => off();
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return; // chỉ cho phép 1 chữ số
        const next = [...otp];
        next[index] = value;
        setOtp(next);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return;
        setIsSubmitting(true);
        // Giả lập verify OTP
        setTimeout(() => {
            setIsSubmitting(false);
            // Sau khi xác thực OTP thành công chuyển sang đăng nhập
            navigate('/signin');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-600 via-blue-700 to-indigo-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-white">{t('otp_title')}</h2>
                    <p className="mt-2 text-sm text-gray-200">{t('otp_subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-200">
                    <div className="flex justify-between gap-2">
                        {otp.map((v, idx) => (
                            <input
                                key={idx}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={v}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || otp.join('').length !== 6}
                        className="w-full py-3 rounded-lg text-white font-medium bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? t('otp_verifying') : t('otp_confirm')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/signin')}
                        className="w-full py-2 rounded-lg text-blue-800 font-medium bg-blue-50 hover:bg-blue-100"
                    >
                        {t('otp_skip')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OTP;

