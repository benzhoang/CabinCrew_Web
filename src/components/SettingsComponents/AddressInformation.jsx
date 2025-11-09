import React, { useEffect, useState } from 'react';
import { t } from '../../i18n';
import { toast } from 'react-toastify';
import { getCities, getWardsForCity } from '../../service/api';
import SearchableDropdown from './SearchableDropdown';

const AddressInformation = ({
    formData,
    errors,
    handleChange,
    setFormData
}) => {
    const [cities, setCities] = useState([]); // Store cities as [{ id, name }]
    const [wards, setWards] = useState([]); // Store wards as [{ id, name }] or [name]
    const [wardsData, setWardsData] = useState([]); // Store full ward objects with id and name
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [isWardsLoading, setIsWardsLoading] = useState(false);

    // Fetch cities
    useEffect(() => {
        const fetchCities = async () => {
            console.log('[AddressInformation] Starting to fetch cities...');
            setIsCitiesLoading(true);
            try {
                const result = await getCities();
                console.log('[AddressInformation] API response for cities:', result);
                if (result.success && result.data) {
                    const rawCities = Array.isArray(result.data)
                        ? result.data
                        : Array.isArray(result.data.items)
                            ? result.data.items
                            : Array.isArray(result.data.results)
                                ? result.data.results
                                : [];
                    console.log('[AddressInformation] Raw cities data:', rawCities);

                    const normalizeCity = (city) => {
                        if (!city) return null;
                        const name = (city.name ?? city.cityName ?? city.provinceName ?? city.title ?? city.label ?? city.value)?.trim();
                        const id = city.id ?? city.cityId ?? city.provinceId;
                        if (name && id) {
                            return { id, name };
                        }
                        return null;
                    };

                    const normalized = rawCities
                        .map(normalizeCity)
                        .filter((city) => city && city.name && city.id);
                    console.log('[AddressInformation] Normalized cities:', normalized);

                    if (normalized.length) {
                        normalized.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
                        setCities(normalized);
                        console.log('[AddressInformation] Cities set successfully:', normalized);
                    } else {
                        console.warn('[AddressInformation] Danh sách thành phố từ API rỗng hoặc không hợp lệ.');
                        toast.error('Không thể tải danh sách thành phố. Vui lòng thử lại sau.');
                    }
                } else {
                    console.warn('[AddressInformation] Không thể lấy danh sách thành phố:', result.error);
                    toast.error('Không thể tải danh sách thành phố. Vui lòng thử lại sau.');
                }
            } catch (error) {
                console.error('[AddressInformation] Lỗi khi tải danh sách thành phố:', error);
                toast.error('Không thể tải danh sách thành phố. Vui lòng thử lại sau.');
            } finally {
                setIsCitiesLoading(false);
                console.log('[AddressInformation] Finished fetching cities, isCitiesLoading:', isCitiesLoading);
            }
        };

        fetchCities();
    }, []);

    // Fetch wards when cityId changes
    useEffect(() => {
        const fetchWards = async () => {
            console.log('[AddressInformation] Starting to fetch wards, cityId:', formData.cityId);
            if (!formData.cityId) {
                setWards([]);
                console.log('[AddressInformation] No cityId, wards reset to empty.');
                return;
            }

            setIsWardsLoading(true);
            try {
                const result = await getWardsForCity(formData.cityId);
                console.log('[AddressInformation] API response for wards:', result);
                if (result.success && result.data) {
                    const rawWards = Array.isArray(result.data)
                        ? result.data
                        : Array.isArray(result.data.items)
                            ? result.data.items
                            : Array.isArray(result.data.results)
                                ? result.data.results
                                : [];
                    console.log('[AddressInformation] Raw wards data:', rawWards);

                    const normalizeWard = (ward) => {
                        if (!ward) return null;
                        
                        // Nếu ward là string, chỉ có tên
                        if (typeof ward === 'string') {
                            const trimmed = ward.trim();
                            return trimmed.length ? { id: null, name: trimmed } : null;
                        }
                        
                        // Nếu ward là object, lấy id và name
                        const name = ward.name ?? ward.wardName ?? ward.title ?? ward.label ?? ward.value;
                        const id = ward.id ?? ward.wardId ?? ward.value;
                        
                        if (typeof name === 'string') {
                            const trimmed = name.trim();
                            if (trimmed.length) {
                                return { id: id || null, name: trimmed };
                            }
                        }
                        return null;
                    };

                    const normalized = rawWards
                        .map(normalizeWard)
                        .filter((ward) => ward && ward.name && ward.name.length > 0);
                    console.log('[AddressInformation] Normalized wards:', normalized);

                    if (normalized.length) {
                        // Lưu full ward objects với id và name
                        setWardsData(normalized);
                        
                        // Lưu danh sách tên để hiển thị
                        const wardNames = normalized.map(w => w.name);
                        const uniqueWardNames = Array.from(new Set(wardNames));
                        uniqueWardNames.sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
                        setWards(uniqueWardNames);
                        console.log('[AddressInformation] Wards set successfully:', uniqueWardNames);
                        console.log('[AddressInformation] Wards data with IDs:', normalized);
                    } else {
                        console.warn('[AddressInformation] Danh sách phường/xã từ API rỗng hoặc không hợp lệ.');
                        toast.error('Không thể tải danh sách phường/xã. Vui lòng thử lại sau.');
                    }
                } else {
                    console.warn('[AddressInformation] Không thể lấy danh sách phường/xã:', result.error);
                    toast.error('Không thể tải danh sách phường/xã. Vui lòng thử lại sau.');
                }
            } catch (error) {
                console.error('[AddressInformation] Lỗi khi tải danh sách phường/xã:', error);
                toast.error('Không thể tải danh sách phường/xã. Vui lòng thử lại sau.');
            } finally {
                setIsWardsLoading(false);
                console.log('[AddressInformation] Finished fetching wards, isWardsLoading:', isWardsLoading);
            }
        };

        fetchWards();
    }, [formData.cityId]);

    // Ensure the selected city is in the cities list and update cityId
    useEffect(() => {
        console.log('[AddressInformation] Checking city sync, formData.city:', formData.city, 'cities:', cities);
        if (formData.city && cities.length > 0) {
            const selectedCity = cities.find((c) => c.name === formData.city);
            console.log('[AddressInformation] Selected city:', selectedCity);
            if (selectedCity && formData.cityId !== selectedCity.id) {
                console.log('[AddressInformation] Updating cityId to:', selectedCity.id);
                setFormData((prev) => ({
                    ...prev,
                    cityId: selectedCity.id,
                    ward: '', // Reset ward when city changes
                    wardId: '' // Reset wardId when city changes
                }));
            } else if (!selectedCity && formData.city) {
                console.log('[AddressInformation] Adding new city to list, cityId:', formData.cityId);
                setCities((prev) => [...prev, { id: formData.cityId || '', name: formData.city }]);
            }
        }
    }, [formData.city, cities, formData.cityId, setFormData]);

    return (
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
                        <SearchableDropdown
                            options={cities.map((city) => city.name)}
                            value={formData.city}
                            onChange={(e) => {
                                console.log('[AddressInformation] City changed to:', e.target.value);
                                const selectedCity = cities.find((c) => c.name === e.target.value);
                                handleChange({ target: { name: 'city', value: e.target.value } });
                                setFormData((prev) => ({
                                    ...prev,
                                    city: e.target.value,
                                    cityId: selectedCity ? selectedCity.id : '',
                                    ward: '', // Reset ward when city changes
                                    wardId: '' // Reset wardId when city changes
                                }));
                            }}
                            placeholder={isCitiesLoading ? 'Đang tải...' : t('select_city')}
                            error={!!errors.city}
                            label="thành phố/tỉnh"
                            disabled={isCitiesLoading}
                        />
                        {errors.city && (
                            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('ward_commune')} <span className="text-red-500">*</span>
                        </label>
                        <SearchableDropdown
                            options={wards}
                            value={formData.ward}
                            onChange={(e) => {
                                console.log('[AddressInformation] Ward changed to:', e.target.value);
                                // Tìm ward ID từ tên ward
                                const selectedWard = wardsData.find(w => w.name === e.target.value);
                                const wardId = selectedWard?.id || null;
                                
                                handleChange({ target: { name: 'ward', value: e.target.value } });
                                setFormData((prev) => ({
                                    ...prev,
                                    ward: e.target.value,
                                    wardId: wardId
                                }));
                            }}
                            placeholder={isWardsLoading ? 'Đang tải...' : t('select_ward')}
                            disabled={!formData.cityId || isWardsLoading}
                            error={!!errors.ward}
                            label="phường/xã"
                        />
                        {errors.ward && (
                            <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressInformation;