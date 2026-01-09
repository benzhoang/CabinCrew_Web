import React, { useEffect, useState, useRef } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";
import {
    getLocationById,
    updateLocation,
    getCities,
    getWardsForCity,
} from "../../../service/api";

const EditLocationModal = ({ isOpen, onClose, locationId, onSuccess }) => {
    const [address, setAddress] = useState("");
    const [selectedCityId, setSelectedCityId] = useState("");
    const [selectedWardId, setSelectedWardId] = useState("");
    const [cities, setCities] = useState([]);
    const [wards, setWards] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [errors, setErrors] = useState({
        address: "",
        city: "",
        ward: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Searchable dropdown states
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);
    const [citySearchTerm, setCitySearchTerm] = useState("");
    const [wardSearchTerm, setWardSearchTerm] = useState("");
    const cityDropdownRef = useRef(null);
    const wardDropdownRef = useRef(null);
    const cityInputRef = useRef(null);
    const wardInputRef = useRef(null);

    // Fetch location data when modal opens
    useEffect(() => {
        if (isOpen && locationId) {
            setIsLoadingLocation(true);
            setAddress("");
            setSelectedCityId("");
            setSelectedWardId("");
            fetchLocationData();
            fetchCities();
        }
    }, [isOpen, locationId]);

    const fetchLocationData = async () => {
        if (!locationId) return;
        setIsLoadingLocation(true);
        try {
            const res = await getLocationById(locationId);
            if (res.success && res.data) {
                const data = res.data;
                setAddress(data.address || "");
                const cityId = data.cityId ?? null;
                const wardId = data.wardId ?? null;

                if (cityId) {
                    setSelectedCityId(String(cityId));
                    // Fetch wards for this city and set wardId after wards are loaded
                    await fetchWards(cityId, wardId);
                } else {
                    setSelectedCityId("");
                    setSelectedWardId("");
                }
            } else {
                toast.error(res.error || "Cannot load location data");
            }
        } catch (err) {
            console.error("Error fetching location:", err);
            toast.error("Cannot load location data");
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const fetchCities = async () => {
        setIsLoadingCities(true);
        try {
            const res = await getCities();
            if (res.success && Array.isArray(res.data)) {
                setCities(res.data);
            } else {
                toast.error(res.error || "Cannot load city list");
            }
        } catch {
            toast.error("Cannot load city list");
        } finally {
            setIsLoadingCities(false);
        }
    };

    const fetchWards = async (cityId, wardIdToSelect = null) => {
        if (!cityId) {
            setWards([]);
            setSelectedWardId("");
            return;
        }
        setIsLoadingWards(true);
        try {
            const res = await getWardsForCity(cityId);
            if (res.success && Array.isArray(res.data)) {
                setWards(res.data);
                // Set wardId after wards are loaded if provided
                if (wardIdToSelect !== null && wardIdToSelect !== undefined) {
                    setSelectedWardId(String(wardIdToSelect));
                }
            } else {
                toast.error(res.error || "Cannot load ward list");
                setWards([]);
            }
        } catch {
            toast.error("Cannot load ward list");
            setWards([]);
        } finally {
            setIsLoadingWards(false);
        }
    };

    useEffect(() => {
        // Only fetch wards when city changes (not during initial load from location data)
        if (selectedCityId && isOpen && !isLoadingLocation) {
            fetchWards(Number(selectedCityId));
        } else if (!selectedCityId) {
            setWards([]);
            setSelectedWardId("");
        }
    }, [selectedCityId, isOpen]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                cityDropdownRef.current &&
                !cityDropdownRef.current.contains(event.target)
            ) {
                setIsCityDropdownOpen(false);
                setCitySearchTerm("");
            }
            if (
                wardDropdownRef.current &&
                !wardDropdownRef.current.contains(event.target)
            ) {
                setIsWardDropdownOpen(false);
                setWardSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter cities based on search term
    const filteredCities = cities.filter((city) => {
        const name = (city?.cityName || city?.name || "").toLowerCase();
        return name.includes(citySearchTerm.toLowerCase());
    });

    // Filter wards based on search term
    const filteredWards = wards.filter((ward) => {
        const name = (ward?.wardName || ward?.name || "").toLowerCase();
        return name.includes(wardSearchTerm.toLowerCase());
    });

    // Get selected city name
    const selectedCityName =
        cities.find(
            (city) =>
                String(city?.cityId ?? city?.id ?? "") === String(selectedCityId)
        )?.cityName ||
        cities.find(
            (city) =>
                String(city?.cityId ?? city?.id ?? "") === String(selectedCityId)
        )?.name ||
        "";

    // Get selected ward name
    const selectedWardName =
        wards.find(
            (ward) =>
                String(ward?.wardId ?? ward?.id ?? "") === String(selectedWardId)
        )?.wardName ||
        wards.find(
            (ward) =>
                String(ward?.wardId ?? ward?.id ?? "") === String(selectedWardId)
        )?.name ||
        "";

    const handleCitySelect = (cityId) => {
        setSelectedCityId(cityId);
        setSelectedWardId("");
        setCitySearchTerm("");
        setIsCityDropdownOpen(false);
        if (errors.city) {
            setErrors((prev) => ({ ...prev, city: "" }));
        }
    };

    const handleWardSelect = (wardId) => {
        setSelectedWardId(wardId);
        setWardSearchTerm("");
        setIsWardDropdownOpen(false);
        if (errors.ward) {
            setErrors((prev) => ({ ...prev, ward: "" }));
        }
    };

    if (!isOpen || !locationId) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedAddress = address.trim();

        // Validate all fields
        const newErrors = {
            address: "",
            city: "",
            ward: "",
        };

        let hasError = false;

        if (!trimmedAddress) {
            newErrors.address = "Address is required";
            hasError = true;
        }

        if (!selectedCityId) {
            newErrors.city = "City is required";
            hasError = true;
        }

        if (!selectedWardId || selectedWardId <= 0) {
            newErrors.ward = "Ward is required";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({
            address: "",
            city: "",
            ward: "",
        });

        try {
            const result = await updateLocation(locationId, {
                address: trimmedAddress,
                wardId: Number(selectedWardId),
            });

            if (result.success) {
                toast.success(result.message || "Update location successfully");
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
            } else {
                toast.error(result.error || "Cannot update location");
            }
        } catch (err) {
            console.error("Error updating location:", err);
            toast.error("An error occurred while updating location");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-lg p-6 space-y-4 bg-white shadow-xl rounded-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            Update Location
                        </h3>
                        <p className="text-sm text-slate-500">
                            Update location information.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="transition-colors text-slate-500 hover:text-slate-700"
                        aria-label="Close"
                        disabled={isSubmitting || isLoadingLocation}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {isLoadingLocation ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                        <p className="ml-3 text-sm text-slate-600">Loading location data...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => {
                                    setAddress(e.target.value);
                                    if (errors.address) {
                                        setErrors((prev) => ({ ...prev, address: "" }));
                                    }
                                }}
                                placeholder="Enter address"
                                className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? "border-red-500" : "border-slate-300"
                                    }`}
                                disabled={isSubmitting}
                            />
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                                City <span className="text-red-500">*</span>
                            </label>
                            <div className="relative" ref={cityDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isSubmitting && !isLoadingCities) {
                                            setIsCityDropdownOpen(!isCityDropdownOpen);
                                            if (!isCityDropdownOpen) {
                                                setTimeout(() => cityInputRef.current?.focus(), 100);
                                            }
                                        }
                                    }}
                                    className={`w-full rounded-lg border px-3 py-2 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? "border-red-500" : "border-slate-300"
                                        } ${isSubmitting || isLoadingCities
                                            ? "bg-slate-100 cursor-not-allowed"
                                            : "bg-white"
                                        }`}
                                    disabled={isSubmitting || isLoadingCities}
                                >
                                    <span
                                        className={
                                            selectedCityName ? "text-slate-900" : "text-slate-500"
                                        }
                                    >
                                        {selectedCityName || "-- Select city --"}
                                    </span>
                                    <FiChevronDown
                                        className={`w-5 h-5 text-slate-400 transition-transform ${isCityDropdownOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                {isCityDropdownOpen && !isSubmitting && !isLoadingCities && (
                                    <div className="absolute z-50 w-full mt-1 overflow-hidden bg-white border rounded-lg shadow-lg border-slate-300 max-h-60">
                                        <div className="p-2 border-b border-slate-200">
                                            <input
                                                ref={cityInputRef}
                                                type="text"
                                                value={citySearchTerm}
                                                onChange={(e) => setCitySearchTerm(e.target.value)}
                                                placeholder="Search city..."
                                                className="w-full px-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className="overflow-y-auto max-h-48">
                                            {filteredCities.length > 0 ? (
                                                filteredCities.map((city) => {
                                                    const id = city?.cityId ?? city?.id ?? "";
                                                    const name =
                                                        city?.cityName || city?.name || `City ${id}`;
                                                    return (
                                                        <button
                                                            key={id}
                                                            type="button"
                                                            onClick={() => handleCitySelect(String(id))}
                                                            className={`w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm ${selectedCityId === String(id)
                                                                ? "bg-blue-100 text-blue-900"
                                                                : "text-slate-900"
                                                                }`}
                                                        >
                                                            {name}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-slate-500">
                                                    No results found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {isLoadingCities && (
                                <p className="mt-1 text-xs text-slate-500">Loading cities...</p>
                            )}
                            {errors.city && (
                                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-slate-700">
                                Ward <span className="text-red-500">*</span>
                            </label>
                            <div className="relative" ref={wardDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isSubmitting && !isLoadingWards && selectedCityId) {
                                            setIsWardDropdownOpen(!isWardDropdownOpen);
                                            if (!isWardDropdownOpen) {
                                                setTimeout(() => wardInputRef.current?.focus(), 100);
                                            }
                                        }
                                    }}
                                    className={`w-full rounded-lg border px-3 py-2 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ward ? "border-red-500" : "border-slate-300"
                                        } ${isSubmitting || isLoadingWards || !selectedCityId
                                            ? "bg-slate-100 cursor-not-allowed"
                                            : "bg-white"
                                        }`}
                                    disabled={isSubmitting || isLoadingWards || !selectedCityId}
                                >
                                    <span
                                        className={
                                            selectedWardName ? "text-slate-900" : "text-slate-500"
                                        }
                                    >
                                        {selectedWardName || "-- Select ward --"}
                                    </span>
                                    <FiChevronDown
                                        className={`w-5 h-5 text-slate-400 transition-transform ${isWardDropdownOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                {isWardDropdownOpen &&
                                    !isSubmitting &&
                                    !isLoadingWards &&
                                    selectedCityId && (
                                        <div className="absolute z-50 w-full mt-1 overflow-hidden bg-white border rounded-lg shadow-lg border-slate-300 max-h-60">
                                            <div className="p-2 border-b border-slate-200">
                                                <input
                                                    ref={wardInputRef}
                                                    type="text"
                                                    value={wardSearchTerm}
                                                    onChange={(e) => setWardSearchTerm(e.target.value)}
                                                    placeholder="Search ward..."
                                                    className="w-full px-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className="overflow-y-auto max-h-48">
                                                {filteredWards.length > 0 ? (
                                                    filteredWards.map((ward) => {
                                                        const id = ward?.wardId ?? ward?.id ?? "";
                                                        const name =
                                                            ward?.wardName || ward?.name || `Ward ${id}`;
                                                        return (
                                                            <button
                                                                key={id}
                                                                type="button"
                                                                onClick={() => handleWardSelect(String(id))}
                                                                className={`w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm ${selectedWardId === String(id)
                                                                    ? "bg-blue-100 text-blue-900"
                                                                    : "text-slate-900"
                                                                    }`}
                                                            >
                                                                {name}
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="px-4 py-2 text-sm text-slate-500">
                                                        No results found
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                            {isLoadingWards && selectedCityId && (
                                <p className="mt-1 text-xs text-slate-500">Loading wards...</p>
                            )}
                            {!selectedCityId && (
                                <p className="mt-1 text-xs text-slate-500">
                                    Please select a city first
                                </p>
                            )}
                            {errors.ward && (
                                <p className="mt-1 text-sm text-red-600">{errors.ward}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 transition-colors border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditLocationModal;

