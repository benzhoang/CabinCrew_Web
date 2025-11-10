import React, { useEffect, useState } from 'react';
import { t, onLangChange } from '../../i18n';
import { toast } from 'react-toastify';
import { getUserProfile, getCities, getWardsForCity } from '../../service/api';
import PersonalInformation from '../../components/SettingsComponents/PersonalInformation';
import AccountInformation from '../../components/SettingsComponents/AccountInformation';
import AddressInformation from '../../components/SettingsComponents/AddressInformation';
import UpdateProfileButton from '../../components/SettingsComponents/UpdateProfileButton';
import Loading from '../../components/Loading';

const Settings = () => {
    const [tick, setTick] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        imgURL: '',
        fullname: '',
        gender: '',
        dateOfBirth: '',
        age: '',
        username: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        cityId: '',
        ward: '',
        wardId: '',
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
            setIsLoading(true);
            try {
                // Lấy userId từ localStorage
                const userData = getStoredUser();

                if (!userData) {
                    console.warn('Không tìm thấy thông tin người dùng trong localStorage');
                    setIsLoading(false);
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
                            imgURL: userData.imgURL || userData.avatar || '',
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
                            wardId: userData.wardId || (userData.ward && typeof userData.ward === 'number' ? userData.ward : null) || '',
                            role: userData.role || ''
                        }));
                        setIsLoading(false);
                        return;
                    }
                }

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

                    // Xử lý imgURL
                    let imgURL = '';
                    if (profileData.imgURL) {
                        imgURL = profileData.imgURL;
                        // Nếu là relative URL, thêm base URL
                        if (imgURL && !imgURL.startsWith('http') && !imgURL.startsWith('data:')) {
                            const API_BASE_URL = 'https://cabincrewcareer.azurewebsites.net';
                            imgURL = imgURL.startsWith('/')
                                ? `${API_BASE_URL}${imgURL}`
                                : `${API_BASE_URL}/${imgURL}`;
                        }
                    }

                    // Lấy cityId và wardId từ API
                    const cityId = profileData.cityId || profileData.cityID || profileData.city?.id || null;
                    const wardId = profileData.wardId || profileData.wardID || profileData.ward?.id || null;

                    // Fetch city name từ cityId
                    let cityName = profileData.city || profileData.cityName || '';
                    if (cityId && !cityName) {
                        try {
                            const citiesResult = await getCities();
                            if (citiesResult.success && citiesResult.data) {
                                const citiesList = Array.isArray(citiesResult.data)
                                    ? citiesResult.data
                                    : Array.isArray(citiesResult.data.items)
                                        ? citiesResult.data.items
                                        : Array.isArray(citiesResult.data.results)
                                            ? citiesResult.data.results
                                            : [];

                                const foundCity = citiesList.find(c =>
                                    (c.id || c.cityId || c.provinceId) == cityId
                                );
                                if (foundCity) {
                                    cityName = foundCity.name || foundCity.cityName || foundCity.provinceName || '';
                                }
                            }
                        } catch (error) {
                            console.error('[Settings] Lỗi khi lấy tên thành phố:', error);
                        }
                    }

                    // Fetch ward name từ wardId và cityId
                    let wardName = profileData.ward || profileData.commune || profileData.wardName || '';
                    if (wardId && cityId && !wardName) {
                        try {
                            const wardsResult = await getWardsForCity(cityId);
                            if (wardsResult.success && wardsResult.data) {
                                const wardsList = Array.isArray(wardsResult.data)
                                    ? wardsResult.data
                                    : Array.isArray(wardsResult.data.items)
                                        ? wardsResult.data.items
                                        : Array.isArray(wardsResult.data.results)
                                            ? wardsResult.data.results
                                            : [];

                                const foundWard = wardsList.find(w =>
                                    (w.id || w.wardId) == wardId
                                );
                                if (foundWard) {
                                    wardName = foundWard.name || foundWard.wardName || '';
                                }
                            }
                        } catch (error) {
                            console.error('[Settings] Lỗi khi lấy tên phường/xã:', error);
                        }
                    }

                    // Map dữ liệu từ API vào formData
                    setFormData(prev => ({
                        ...prev,
                        imgURL: imgURL,
                        fullname: profileData.fullname || profileData.fullName || profileData.name || '',
                        gender: genderValue,
                        dateOfBirth: formattedDateOfBirth || profileData.dateOfBirth || '',
                        age: age || profileData.age || '',
                        username: profileData.username || userData.username || '',
                        email: profileData.email || '',
                        phone: profileData.phone || profileData.phoneNumber || '',
                        address: profileData.address || (profileData.houseNumber && profileData.street ? `${profileData.houseNumber} ${profileData.street}` : ''),
                        city: cityName,
                        cityId: cityId || '',
                        ward: wardName,
                        wardId: wardId || '',
                        role: profileData.role || userData.role || ''
                    }));

                    // Cập nhật localStorage với dữ liệu mới từ API
                    const updatedUser = {
                        ...userData,
                        ...profileData,
                        userId: profileData.userId ?? userId,
                        age: age || profileData.age || '',
                        imgURL: imgURL,
                        city: cityName,
                        cityId: cityId,
                        ward: wardName,
                        wardId: wardId
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
                        imgURL: userData.imgURL || userData.avatar || '',
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
                        wardId: userData.wardId || (userData.ward && typeof userData.ward === 'number' ? userData.ward : null) || '',
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
                        imgURL: userData.imgURL || userData.avatar || '',
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
                        wardId: userData.wardId || (userData.ward && typeof userData.ward === 'number' ? userData.ward : null) || '',
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

    const handleAvatarChange = (e, imageUrl = null) => {
        // Nếu có imageUrl từ API (sau khi upload thành công), sử dụng nó
        if (imageUrl) {
            setFormData(prev => ({
                ...prev,
                imgURL: imageUrl
            }));
            return;
        }

        // Fallback: nếu không có imageUrl, đọc file local (cho preview trước khi upload)
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    imgURL: e.target.result
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

    // handleSubmit đã được xử lý trong UpdateProfileButton
    // Giữ lại để tương thích với form, nhưng không làm gì
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Form submission được xử lý trong UpdateProfileButton
    };

    return (
        <>
            {isLoading && <Loading message={t('loading_profile_data')} />}
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

                            <UpdateProfileButton
                                formData={formData}
                                validateForm={validateForm}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Settings;