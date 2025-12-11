import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaSyncAlt, FaTrash } from "react-icons/fa";
import { getCities, getWardsForCity } from "../../service/api";

const CityWardPage = () => {
    const [cities, setCities] = useState([]);
    const [selectedCityId, setSelectedCityId] = useState("");
    const [wards, setWards] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);
    const [error, setError] = useState("");
    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const fetchCities = useMemo(
        () => async () => {
            setIsLoadingCities(true);
            setError("");
            try {
                const res = await getCities();
                if (res.success && Array.isArray(res.data)) {
                    setCities(res.data);
                    // Preselect first city if none selected
                    if (!selectedCityId && res.data.length > 0) {
                        setSelectedCityId(res.data[0].cityId ?? res.data[0].id ?? "");
                    }
                } else {
                    setError(res.error || "Không thể tải danh sách thành phố");
                    setCities([]);
                }
            } catch (err) {
                setError(err.message || "Không thể tải danh sách thành phố");
                setCities([]);
            } finally {
                setIsLoadingCities(false);
            }
        },
        [selectedCityId]
    );

    const fetchWards = useMemo(
        () => async (cityId) => {
            if (!cityId) {
                setWards([]);
                return;
            }
            setIsLoadingWards(true);
            setError("");
            try {
                const res = await getWardsForCity(cityId);
                if (res.success && Array.isArray(res.data)) {
                    setWards(res.data);
                    setCurrentPage(1);
                } else {
                    setError(res.error || "Không thể tải danh sách phường/xã");
                    setWards([]);
                    setCurrentPage(1);
                }
            } catch (err) {
                setError(err.message || "Không thể tải danh sách phường/xã");
                setWards([]);
                setCurrentPage(1);
            } finally {
                setIsLoadingWards(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchCities();
    }, [fetchCities]);

    useEffect(() => {
        if (selectedCityId) {
            fetchWards(selectedCityId);
            setCurrentPage(1);
        }
    }, [fetchWards, selectedCityId]);

    const totalPages = Math.max(1, Math.ceil((wards?.length || 0) / pageSize));
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const displayedWards = wards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getPageNumbers = () => {
        if (!totalPages) return [];
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages = [];
        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, 5, "...", totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        }
        return pages;
    };

    const handlePlaceholderAction = (action, payload) => {
        console.log(`TODO: ${action}`, payload);
    };

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">City & Ward</h1>
                    <p className="text-sm text-slate-600">
                        Select city to view the list of wards.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => handlePlaceholderAction("create", { cityId: selectedCityId })}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <FaPlus className="w-4 h-4" />
                        Add ward
                    </button>
                </div>
            </header>

            <section className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="text-sm font-medium text-slate-700">Select city</label>
                    <select
                        className="w-full sm:w-80 px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedCityId}
                        onChange={(e) => setSelectedCityId(e.target.value)}
                        disabled={isLoadingCities}
                    >
                        <option value="">-- Select city --</option>
                        {cities.map((city) => {
                            const id = city?.cityId ?? city?.id ?? "";
                            const name = city?.cityName || city?.name || `City ${id}`;
                            return (
                                <option key={id} value={id}>
                                    {name}
                                </option>
                            );
                        })}
                    </select>
                </div>
                {isLoadingCities && (
                    <p className="text-sm text-slate-500">Loading city list...</p>
                )}
            </section>

            <section className="p-6 bg-white border rounded-2xl border-slate-200 shadow-sm">
                {error && (
                    <div className="flex items-center justify-between gap-3 p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => {
                                fetchCities();
                                if (selectedCityId) fetchWards(selectedCityId);
                            }}
                            className="text-xs font-medium underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 uppercase">
                                    ID
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 uppercase">
                                    Ward name
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-right text-slate-600 uppercase">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoadingWards ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-6 text-sm text-center text-slate-500"
                                    >
                                        Loading ward list...
                                    </td>
                                </tr>
                            ) : displayedWards.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-6 text-sm text-center text-slate-500"
                                    >
                                        No data for wards for the selected city.
                                    </td>
                                </tr>
                            ) : (
                                displayedWards.map((ward) => {
                                    const id = ward?.wardId ?? ward?.id ?? "";
                                    const name = ward?.wardName || ward?.name || `Ward ${id}`;
                                    return (
                                        <tr key={id}>
                                            <td className="px-4 py-3 text-sm text-slate-700">{id}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                {name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handlePlaceholderAction("edit", {
                                                                cityId: selectedCityId,
                                                                wardId: id,
                                                            })
                                                        }
                                                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium transition border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                                                    >
                                                        <FaEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handlePlaceholderAction("delete", {
                                                                cityId: selectedCityId,
                                                                wardId: id,
                                                            })
                                                        }
                                                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 transition border rounded-lg border-red-200 hover:bg-red-50"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
                    <div>
                        Page <span className="font-semibold">{currentPage}</span> /{" "}
                        <span className="font-semibold">{totalPages}</span>
                        {wards.length > 0 && (
                            <span className="ml-2 text-slate-500">({wards.length} wards)</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                            className={`px-3 py-1 rounded-md border text-xs font-medium transition-colors ${currentPage > 1
                                ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                }`}
                        >
                            Prev
                        </button>
                        {getPageNumbers().map((page, idx) =>
                            page === "..." ? (
                                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded-md border text-xs font-medium transition-colors ${page === currentPage
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        )}
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            className={`px-3 py-1 rounded-md border text-xs font-medium transition-colors ${currentPage < totalPages
                                ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CityWardPage;
