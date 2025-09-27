import React, { useEffect, useState } from 'react';
import { t, onLangChange } from '../../i18n';
import { toast } from 'react-toastify';

const Settings = () => {
    const [tick, setTick] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        avatar: '',
        fullname: '',
        gender: '',
        dateOfBirth: '',
        age: '',
        username: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        ward: '',
        role: ''
    });
    const [errors, setErrors] = useState({});

    // Vietnamese cities/provinces and wards/communes data
    const cities = [
        'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
        'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
        'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
        'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
        'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
        'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
        'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
        'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
        'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
        'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
        'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
        'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
        'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
    ];

    const wards = {
        'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai', 'Thanh Xuân', 'Sóc Sơn', 'Đông Anh', 'Gia Lâm', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Mê Linh', 'Hà Đông', 'Sơn Tây', 'Ba Vì', 'Phúc Thọ', 'Đan Phượng', 'Hoài Đức', 'Quốc Oai', 'Thạch Thất', 'Chương Mỹ', 'Thanh Oai', 'Thường Tín', 'Phú Xuyên', 'Ứng Hòa', 'Mỹ Đức'],
        'TP. Hồ Chí Minh': ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Thủ Đức', 'Gò Vấp', 'Bình Thạnh', 'Tân Bình', 'Tân Phú', 'Phú Nhuận', 'Bình Tân', 'Củ Chi', 'Hóc Môn', 'Bình Chánh', 'Nhà Bè', 'Cần Giờ'],
        'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang', 'Hoàng Sa'],
        'Hải Phòng': ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An', 'Đồ Sơn', 'Dương Kinh', 'Thuỷ Nguyên', 'An Dương', 'An Lão', 'Kiến Thuỵ', 'Tiên Lãng', 'Vĩnh Bảo', 'Cát Hải', 'Bạch Long Vĩ'],
        'Cần Thơ': ['Ninh Kiều', 'Ô Môn', 'Bình Thuỷ', 'Cái Răng', 'Thốt Nốt', 'Vĩnh Thạnh', 'Cờ Đỏ', 'Phong Điền', 'Thới Lai']
    };

    const roles = [
        'Cabin Crew',
        'Senior Cabin Crew',
        'Purser',
        'Senior Purser',
        'Cabin Service Director',
        'Ground Staff',
        'Customer Service Agent',
        'Check-in Agent',
        'Baggage Handler',
        'Security Officer',
        'Maintenance Technician',
        'Pilot',
        'Co-pilot',
        'Flight Engineer',
        'Air Traffic Controller',
        'Other'
    ];

    const genders = [
        { value: 'male', label: t('male') },
        { value: 'female', label: t('female') },
        { value: 'other', label: t('other') }
    ];

    useEffect(() => {
        const off = onLangChange(() => setTick((v) => v + 1));
        return () => off();
    }, []);

    useEffect(() => {
        // Load user data from localStorage
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setFormData(prev => ({
                ...prev,
                avatar: userData.avatar || '',
                fullname: userData.fullname || '',
                gender: userData.gender || '',
                dateOfBirth: userData.dateOfBirth || '',
                age: userData.age || '',
                username: userData.username || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || (userData.houseNumber && userData.street ? `${userData.houseNumber} ${userData.street}` : ''),
                city: userData.city || '',
                ward: userData.ward || '',
                role: userData.role || ''
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Calculate age when date of birth changes
        if (name === 'dateOfBirth' && value) {
            const today = new Date();
            const birthDate = new Date(value);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            setFormData(prev => ({
                ...prev,
                age: age.toString()
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    avatar: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullname.trim()) {
            newErrors.fullname = t('required_field');
        }

        if (!formData.gender) {
            newErrors.gender = t('required_field');
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = t('required_field');
        }

        if (!formData.username.trim()) {
            newErrors.username = t('required_field');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('required_field');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t('invalid_email');
        }

        if (!formData.phone.trim()) {
            newErrors.phone = t('required_field');
        } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
            newErrors.phone = t('invalid_phone');
        }

        if (!formData.address.trim()) {
            newErrors.address = t('required_field');
        }

        if (!formData.city) {
            newErrors.city = t('required_field');
        }

        if (!formData.ward) {
            newErrors.ward = t('required_field');
        }

        if (!formData.role) {
            newErrors.role = t('required_field');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Update user data in localStorage
            const updatedUser = {
                ...JSON.parse(localStorage.getItem('user') || '{}'),
                ...formData
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Notify other components
            window.dispatchEvent(new Event('auth-changed'));

            toast.success(t('profile_updated'));
            setIsLoading(false);
        }, 1000);
    };

    const getWardsForCity = () => {
        return wards[formData.city] || [];
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t('user_profile')}</h1>
                    <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân của bạn</p>
                </div>

                {/* CV Layout - 2 Columns */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Personal Info & Contact */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                            {/* Avatar Section */}
                            <div className="text-center mb-8">
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg mx-auto">
                                        {formData.avatar ? (
                                            <img
                                                src={formData.avatar}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                                <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <label htmlFor="avatar" className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </label>
                                    <input
                                        type="file"
                                        id="avatar"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
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
                        </div>
                    </div>

                    {/* Right Column - Detailed Information */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Account Information */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                {t('account_information')}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('username')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder={t('username')}
                                    />
                                    {errors.username && (
                                        <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('role')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">{t('select_role')}</option>
                                        {roles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                    {errors.role && (
                                        <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {t('address')}
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('full_address')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="123 Nguyễn Văn A"
                                    />
                                    {errors.address && (
                                        <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('city_province')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFormData(prev => ({ ...prev, ward: '' })); // Reset ward when city changes
                                            }}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="">{t('select_city')}</option>
                                            {cities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        {errors.city && (
                                            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('ward_commune')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="ward"
                                            name="ward"
                                            value={formData.ward}
                                            onChange={handleChange}
                                            disabled={!formData.city}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.ward ? 'border-red-500' : 'border-gray-300'} ${!formData.city ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">{t('select_ward')}</option>
                                            {getWardsForCity().map(ward => (
                                                <option key={ward} value={ward}>{ward}</option>
                                            ))}
                                        </select>
                                        {errors.ward && (
                                            <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Đang cập nhật...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <path d="M17 21v-8H7v8" />
                                                <path d="M7 3v5h8" />
                                            </svg>
                                            {t('update_profile')}
                                        </>
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

export default Settings;
