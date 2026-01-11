import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { getConfigurations } from "../../service/api2";
import { getRoundTypes } from "../../service/api";
import CreateGeneralModal from "./ModalCreate/CreateGeneralModal";

const GeneralPage = () => {
    const [selectedType, setSelectedType] = useState(1); // 1: Recruitment, 2: Promotion
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [roundTypes, setRoundTypes] = useState([]);
    const [selectedRoundType, setSelectedRoundType] = useState(""); // Empty = All
    const [isLoadingRoundTypes, setIsLoadingRoundTypes] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5,
        totalPages: 0,
        totalRecords: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    // Fetch round types khi selectedType thay đổi
    useEffect(() => {
        const fetchRoundTypes = async () => {
            setIsLoadingRoundTypes(true);
            try {
                const res = await getRoundTypes(selectedType);
                if (res.success && Array.isArray(res.data)) {
                    // Filter bỏ "Screening", "Final", "Flight Hours Confirmation"
                    const excludedNames = ["Screening", "Final", "Flight Hours Confirmation"];
                    const filtered = res.data.filter(
                        (rt) => !excludedNames.includes(rt.roundTypeName)
                    );
                    setRoundTypes(filtered);
                    // Set round type đầu tiên làm mặc định nếu có
                    if (filtered.length > 0) {
                        setSelectedRoundType(filtered[0].roundTypeId);
                    } else {
                        setSelectedRoundType("");
                    }
                } else {
                    setRoundTypes([]);
                    setSelectedRoundType("");
                }
            } catch (err) {
                console.error("Error fetching round types:", err);
                setRoundTypes([]);
            } finally {
                setIsLoadingRoundTypes(false);
            }
        };
        fetchRoundTypes();
    }, [selectedType]);

    const fetchConfigurations = useMemo(
        () => async (campaignType, roundTypeId, page = 1) => {
            setIsLoading(true);
            setError("");
            try {
                // Luôn truyền cả campaignType và roundTypeId vào API
                if (!roundTypeId || roundTypeId === "" || roundTypeId === null || roundTypeId === undefined) {
                    setIsLoading(false);
                    setItems([]);
                    setPagination({
                        currentPage: 1,
                        pageSize: 5,
                        totalPages: 0,
                        totalRecords: 0,
                        hasNextPage: false,
                        hasPreviousPage: false,
                    });
                    return;
                }
                const res = await getConfigurations(campaignType, roundTypeId, page, pagination.pageSize);
                if (res.success && Array.isArray(res.data)) {
                    let mapped = res.data
                        .map((item, index) => {
                            const id =
                                item?.roundConfigurationId ??
                                item?.id ??
                                item?.code ??
                                index + 1;
                            // Map roundType thành configurationType vì API trả về roundType
                            const configurationType =
                                item?.configurationType || item?.roundType || "";
                            const itemCampaignType =
                                item?.campaignType || "";
                            const benchmark =
                                item?.benchmark ?? 0;
                            const effectiveDate =
                                item?.effectiveDate || "";
                            const expiredDate =
                                item?.expiredDate || "";
                            const status =
                                item?.status || "";
                            const roundTypeIdFromItem =
                                item?.roundTypeId || item?.configurationTypeId || null;
                            return {
                                id,
                                configurationType,
                                campaignType: itemCampaignType,
                                benchmark,
                                effectiveDate,
                                expiredDate,
                                status,
                                roundTypeId: roundTypeIdFromItem,
                            };
                        })
                        .filter(Boolean);

                    setItems(mapped);

                    // Cập nhật pagination info từ API response
                    if (res.pagination) {
                        setPagination((prev) => ({
                            ...res.pagination,
                            pageSize: res.pagination.pageSize || prev.pageSize,
                        }));
                    } else {
                        // Fallback khi API không trả về pagination
                        setPagination((prev) => ({
                            ...prev,
                            currentPage: page,
                            totalPages: Math.ceil(mapped.length / prev.pageSize) || 1,
                            totalRecords: mapped.length,
                            hasNextPage: false,
                            hasPreviousPage: page > 1,
                        }));
                    }
                } else {
                    setError(res.error || "Cannot load configurations");
                    setItems([]);
                    setPagination({
                        currentPage: 1,
                        pageSize: 5,
                        totalPages: 0,
                        totalRecords: 0,
                        hasNextPage: false,
                        hasPreviousPage: false,
                    });
                }
            } catch (err) {
                setError(err.message || "Cannot load configurations");
                setItems([]);
                setPagination({
                    currentPage: 1,
                    pageSize: 5,
                    totalPages: 0,
                    totalRecords: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                });
            } finally {
                setIsLoading(false);
            }
        },
        [pagination.pageSize]
    );

    useEffect(() => {
        // Reset về trang 1 khi selectedType hoặc selectedRoundType thay đổi
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, [selectedType, selectedRoundType]);

    useEffect(() => {
        // Chỉ gọi API khi có selectedRoundType (không rỗng)
        if (selectedRoundType !== "" && selectedRoundType !== null && selectedRoundType !== undefined) {
            fetchConfigurations(selectedType, selectedRoundType, pagination.currentPage);
        }
    }, [fetchConfigurations, selectedType, selectedRoundType, pagination.currentPage]);

    const handlePageChange = (page) => {
        // Kiểm tra page hợp lệ
        if (page === pagination.currentPage) return;
        if (pagination.totalPages && page > pagination.totalPages) return;
        if (page > pagination.currentPage && !pagination.hasNextPage) return;
        if (page < pagination.currentPage && !pagination.hasPreviousPage) return;
        if (page < 1) return;

        // Update pagination state, useEffect sẽ gọi API
        setPagination((prev) => ({ ...prev, currentPage: page }));
    };

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">General</h1>
                    <p className="text-sm text-slate-600">List of configurations.</p>
                </div>
            </header>

            <section className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3 items-center">
                    <button
                        type="button"
                        onClick={() => setSelectedType(1)}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition ${selectedType === 1
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        Recruitment
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedType(2)}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition ${selectedType === 2
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        Promotion
                    </button>
                </div>
            </section>

            <section className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                {error && (
                    <div className="flex items-center justify-between gap-3 p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => {
                                if (selectedRoundType !== "" && selectedRoundType !== null && selectedRoundType !== undefined) {
                                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                                    fetchConfigurations(selectedType, selectedRoundType, 1);
                                }
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
                                <th colSpan={7} className="px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-3">
                                            {roundTypes.map((rt) => {
                                                const isSelected = selectedRoundType === rt.roundTypeId ||
                                                    selectedRoundType === String(rt.roundTypeId) ||
                                                    Number(selectedRoundType) === rt.roundTypeId;
                                                return (
                                                    <button
                                                        key={rt.roundTypeId}
                                                        onClick={() => setSelectedRoundType(rt.roundTypeId)}
                                                        disabled={isLoadingRoundTypes}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${isSelected
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : "bg-white text-slate-700 border-slate-300 hover:bg-blue-50"
                                                            } ${isLoadingRoundTypes ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        {rt.roundTypeName}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                                        >
                                            <FaPlus className="w-3.5 h-3.5" />
                                            Create Configuration
                                        </button>
                                    </div>
                                </th>
                            </tr>
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600">
                                    No.
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600">
                                    Configuration Type
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600">
                                    Campaign Type
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600">
                                    Benchmark (%)
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600">
                                    Effective Date
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600">
                                    Expired Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center">
                                        <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                                        <p className="mt-4 text-sm text-gray-600">
                                            Loading data...
                                        </p>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-sm text-center text-slate-500"
                                    >
                                        No data for configurations.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            {item.configurationType}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {item.campaignType === "All" || item.campaignType === "0" || item.campaignType === 0
                                                ? "Recruitment & Promotion"
                                                : item.campaignType}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {item.benchmark}%
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status?.toLowerCase() === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : item.status?.toLowerCase() === "inactive"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-slate-100 text-slate-800"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {item.effectiveDate}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {item.expiredDate}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && items.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200">
                        <div className="text-sm text-slate-600">
                            Page <span className="font-semibold">{pagination.currentPage}</span>
                            {pagination.totalPages ? (
                                <>
                                    {' '}
                                    / <span className="font-semibold">{pagination.totalPages}</span>
                                </>
                            ) : null}
                            {typeof pagination.totalRecords === 'number' && (
                                <span className="ml-2">({pagination.totalRecords} records)</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPreviousPage}
                                className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasPreviousPage
                                    ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                    }`}
                            >
                                Previous
                            </button>

                            <span className="text-sm text-slate-600">
                                {pagination.currentPage}
                            </span>

                            <button
                                type="button"
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasNextPage
                                    ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <CreateGeneralModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    if (selectedRoundType !== "" && selectedRoundType !== null && selectedRoundType !== undefined) {
                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                        fetchConfigurations(selectedType, selectedRoundType, 1);
                    }
                }}
                roundTypeId={selectedRoundType}
            />
        </div>
    );
};

export default GeneralPage;

