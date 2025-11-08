import React, { useEffect, useState } from 'react';
import { t, onLangChange } from '../../i18n';
import { toast } from 'react-toastify';
import { getUserProfile } from '../../service/api';
import PersonalInformation from '../../components/SettingsComponents/PersonalInformation';
import AccountInformation from '../../components/SettingsComponents/AccountInformation';
import AddressInformation from '../../components/SettingsComponents/AddressInformation';
import UpdateProfileButton from '../../components/SettingsComponents/UpdateProfileButton';

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

    const genders = [
        { value: '1', label: t('male') },
        { value: '2', label: t('female') },
        { value: '3', label: t('other') }
    ];

    const decodeJwt = (token) => {
        if (!token) {
            return null;
        }

        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.warn('[Settings] Token không đúng định dạng JWT');
                return null;
            }

            const payload = parts[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
            const decoded = atob(paddedPayload);
            return JSON.parse(decoded);
        } catch (error) {
            console.error('[Settings] Lỗi khi decode JWT:', error);
            return null;
        }
    };

    const getStoredUser = () => {
        const rawUser = localStorage.getItem('user');
        if (!rawUser) {
            console.warn('[Settings] localStorage user is missing');
            return null;
        }

        try {
            const parsed = JSON.parse(rawUser);
            console.log('[Settings] Parsed user from localStorage:', parsed);
            return parsed;
        } catch (error) {
            console.error('Không thể parse dữ liệu người dùng từ localStorage:', error);
            return null;
        }
    };

    const extractUserId = (userData) => {
        if (!userData) {
            return null;
        }

        const candidates = [
            userData.userId,
            userData.userID,
            userData.id,
            userData.user?.userId,
            userData.user?.id,
            userData.data?.userId,
            userData.data?.id
        ];

        const found = candidates.find((value) => value !== undefined && value !== null && value !== '');

        if (found === undefined || found === null) {
            console.warn('[Settings] Không tìm thấy userId trong danh sách candidates', candidates);
            return null;
        }

        if (typeof found === 'string') {
            const trimmed = found.trim();
            if (trimmed === '') {
                console.warn('[Settings] userId chuỗi nhưng rỗng sau khi trim');
                return null;
            }

            const numeric = Number(trimmed);
            return Number.isNaN(numeric) ? trimmed : numeric;
        }

        return found;
    };

    const normalizeUserIdForRequest = (userId) => {
        if (userId === undefined || userId === null) {
            return null;
        }

        if (typeof userId === 'number') {
            console.log('[Settings] userId là số, dùng trực tiếp:', userId);
            return userId;
        }

        if (typeof userId === 'string') {
            const trimmed = userId.trim();
            if (trimmed === '') {
                console.warn('[Settings] userId chuỗi nhưng rỗng sau khi trim trong normalize');
                return null;
            }

            const numeric = Number(trimmed);
            if (!Number.isNaN(numeric)) {
                console.log('[Settings] userId chuỗi nhưng chuyển được sang số:', numeric);
            } else {
                console.log('[Settings] userId chuỗi và giữ nguyên:', trimmed);
            }
            return Number.isNaN(numeric) ? trimmed : numeric;
        }

        return userId;
    };

    useEffect(() => {
        const off = onLangChange(() => setTick((v) => v + 1));
        return () => off();
    }, []);

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                // Lấy userId từ localStorage
                const userData = getStoredUser();

                if (!userData) {
                    console.warn('Không tìm thấy thông tin người dùng trong localStorage');
                    return;
                }

                const rawUserId = extractUserId(userData);
                console.log('[Settings] rawUserId tìm được:', rawUserId);
                let userId = normalizeUserIdForRequest(rawUserId);
                console.log('[Settings] userId sau normalize:', userId);

                if (!userId) {
                    console.warn('Không tìm thấy userId trong thông tin người dùng');

                    const tokenFromUser = userData.accessToken;
                    const tokenFromStorage = localStorage.getItem('token');
                    const decoded = decodeJwt(tokenFromUser || tokenFromStorage);
                    console.log('[Settings] decode từ token:', decoded);

                    if (decoded) {
                        const tokenCandidates = [
                            decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
                            decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier'],
                            decoded.sub,
                            decoded.userId,
                            decoded.id,
                        ];

                        const tokenUserId = tokenCandidates.find((value) => value !== undefined && value !== null && value !== '');
                        if (tokenUserId) {
                            userId = normalizeUserIdForRequest(tokenUserId);
                            console.log('[Settings] userId lấy từ token:', userId);
                            if (userId) {
                                userData.userId = userId;
                                localStorage.setItem('user', JSON.stringify(userData));
                            }
                        }
                    }

                    if (!userId) {
                        // Fallback: load từ localStorage như cũ
                        // Format dateOfBirth từ localStorage nếu có
                        let formattedDateOfBirth = '';
                        if (userData.dateOfBirth) {
                            const birthDate = new Date(userData.dateOfBirth);
                            if (!isNaN(birthDate.getTime())) {
                                const year = birthDate.getFullYear();
                                const month = String(birthDate.getMonth() + 1).padStart(2, '0');
                                const day = String(birthDate.getDate()).padStart(2, '0');
                                formattedDateOfBirth = `${year}-${month}-${day}`;
                            }
                        }

                        // Convert gender từ localStorage (có thể là integer hoặc string)
                        let genderValue = '';
                        if (userData.gender !== undefined && userData.gender !== null) {
                            genderValue = String(userData.gender);
                        }

                        setFormData(prev => ({
                            ...prev,
                            avatar: userData.avatar || '',
                            fullname: userData.fullname || '',
                            gender: genderValue,
                            dateOfBirth: formattedDateOfBirth || userData.dateOfBirth || '',
                            age: userData.age || '',
                            username: userData.username || '',
                            email: userData.email || '',
                            phone: userData.phone || '',
                            address: userData.address || (userData.houseNumber && userData.street ? `${userData.houseNumber} ${userData.street}` : ''),
                            city: userData.city || '',
                            ward: userData.ward || '',
                            role: userData.role || ''
                        }));
                        return;
                    }
                }

                setIsLoading(true);

                // Gọi API để lấy thông tin profile
                const result = await getUserProfile(userId);
                console.log('[Settings] Kết quả gọi getUserProfile:', result);

                if (result.success && result.data) {
                    const profileData = result.data;

                    // Tính toán age nếu có dateOfBirth
                    let age = '';
                    let formattedDateOfBirth = '';
                    if (profileData.dateOfBirth) {
                        const birthDate = new Date(profileData.dateOfBirth);
                        if (!isNaN(birthDate.getTime())) {
                            // Format dateOfBirth thành YYYY-MM-DD cho input type="date"
                            const year = birthDate.getFullYear();
                            const month = String(birthDate.getMonth() + 1).padStart(2, '0');
                            const day = String(birthDate.getDate()).padStart(2, '0');
                            formattedDateOfBirth = `${year}-${month}-${day}`;

                            // Tính toán age
                            const today = new Date();
                            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                            const monthDiff = today.getMonth() - birthDate.getMonth();
                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                calculatedAge--;
                            }
                            age = calculatedAge.toString();
                        }
                    }

                    // Convert gender từ integer sang string để khớp với radio buttons
                    let genderValue = '';
                    if (profileData.gender !== undefined && profileData.gender !== null) {
                        // Gender từ API là integer (1, 2, 3), chuyển sang string
                        genderValue = String(profileData.gender);
                    }

                    // Map dữ liệu từ API vào formData
                    setFormData(prev => ({
                        ...prev,
                        avatar: profileData.avatar || profileData.imageUrl || '',
                        fullname: profileData.fullname || profileData.fullName || profileData.name || '',
                        gender: genderValue,
                        dateOfBirth: formattedDateOfBirth || profileData.dateOfBirth || '',
                        age: age || profileData.age || '',
                        username: profileData.username || userData.username || '',
                        email: profileData.email || '',
                        phone: profileData.phone || profileData.phoneNumber || '',
                        address: profileData.address || (profileData.houseNumber && profileData.street ? `${profileData.houseNumber} ${profileData.street}` : ''),
                        city: profileData.city || '',
                        ward: profileData.ward || profileData.commune || '',
                        role: profileData.role || userData.role || ''
                    }));

                    // Cập nhật localStorage với dữ liệu mới từ API
                    const updatedUser = {
                        ...userData,
                        ...profileData,
                        userId: profileData.userId ?? userId,
                        age: age || profileData.age || ''
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                } else {
                    // Nếu API thất bại, fallback về localStorage
                    console.warn('Không thể lấy thông tin từ API:', result.error);

                    // Format dateOfBirth từ localStorage nếu có
                    let formattedDateOfBirth = '';
                    if (userData.dateOfBirth) {
                        const birthDate = new Date(userData.dateOfBirth);
                        if (!isNaN(birthDate.getTime())) {
                            const year = birthDate.getFullYear();
                            const month = String(birthDate.getMonth() + 1).padStart(2, '0');
                            const day = String(birthDate.getDate()).padStart(2, '0');
                            formattedDateOfBirth = `${year}-${month}-${day}`;
                        }
                    }

                    // Convert gender từ localStorage (có thể là integer hoặc string)
                    let genderValue = '';
                    if (userData.gender !== undefined && userData.gender !== null) {
                        genderValue = String(userData.gender);
                    }

                    setFormData(prev => ({
                        ...prev,
                        avatar: userData.avatar || '',
                        fullname: userData.fullname || '',
                        gender: genderValue,
                        dateOfBirth: formattedDateOfBirth || userData.dateOfBirth || '',
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
            } catch (error) {
                console.error('Lỗi khi load profile:', error);
                toast.error('Không thể tải thông tin profile. Vui lòng thử lại.');

                // Fallback: load từ localStorage
                const userData = getStoredUser();
                if (userData) {
                    // Format dateOfBirth từ localStorage nếu có
                    let formattedDateOfBirth = '';
                    if (userData.dateOfBirth) {
                        const birthDate = new Date(userData.dateOfBirth);
                        if (!isNaN(birthDate.getTime())) {
                            const year = birthDate.getFullYear();
                            const month = String(birthDate.getMonth() + 1).padStart(2, '0');
                            const day = String(birthDate.getDate()).padStart(2, '0');
                            formattedDateOfBirth = `${year}-${month}-${day}`;
                        }
                    }

                    // Convert gender từ localStorage (có thể là integer hoặc string)
                    let genderValue = '';
                    if (userData.gender !== undefined && userData.gender !== null) {
                        genderValue = String(userData.gender);
                    }

                    setFormData(prev => ({
                        ...prev,
                        avatar: userData.avatar || '',
                        fullname: userData.fullname || '',
                        gender: genderValue,
                        dateOfBirth: formattedDateOfBirth || userData.dateOfBirth || '',
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
            } finally {
                setIsLoading(false);
            }
        };

        loadUserProfile();
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
                        <PersonalInformation
                            formData={formData}
                            errors={errors}
                            handleChange={handleChange}
                            handleAvatarChange={handleAvatarChange}
                            genders={genders}
                        />
                    </div>

                    {/* Right Column - Detailed Information */}
                    <div className="lg:col-span-2 space-y-8">
                        <AccountInformation formData={formData} errors={errors} />

                        <AddressInformation
                            formData={formData}
                            errors={errors}
                            handleChange={handleChange}
                            setFormData={setFormData}
                        />

                        <UpdateProfileButton isLoading={isLoading} />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;