import React, { useState, useEffect } from 'react';
import { t } from '../../i18n';
import AvatarUploadModal from './AvatarUploadModal';

const PersonalInformation = ({ formData, errors, handleChange, handleAvatarChange, genders }) => {
    const [avatarError, setAvatarError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Reset avatarError khi imgURL thay đổi
    useEffect(() => {
        setAvatarError(false);
    }, [formData.imgURL]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            {/* Avatar Section */}
            <div className="text-center mb-8">
                <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg mx-auto">
                        {formData.imgURL && !avatarError ? (
                            <img
                                src={formData.imgURL}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={() => {
                                    // Nếu ảnh không load được, hiển thị placeholder
                                    setAvatarError(true);
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                        type="button"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-4">{formData.fullname || 'Tên đầy đủ'}</h2>
                <p className="text-gray-600">{formData.role || 'Vai trò'}</p>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t('personal_information')}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('fullname')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="fullname"
                                name="fullname"
                                value={formData.fullname}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${errors.fullname ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Nguyễn Văn A"
                            />
                            {errors.fullname && (
                                <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {t('gender')} <span className="text-red-500">*</span>
                            </label>
                            <div className="flex space-x-4">
                                {genders.map(gender => (
                                    <label key={gender.value} className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={gender.value}
                                            checked={formData.gender === gender.value}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{gender.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.gender && (
                                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('date_of_birth')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    max="2003-12-31"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.dateOfBirth && (
                                    <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('age')}
                                </label>
                                <input
                                    type="text"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                                    placeholder="Tự động tính"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Liên hệ
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('email')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder={t('email')}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('phone')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="0123456789"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Avatar Upload Modal */}
            <AvatarUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAvatarChange}
                currentAvatar={formData.imgURL}
            />
        </div>
    );
};

export default PersonalInformation;