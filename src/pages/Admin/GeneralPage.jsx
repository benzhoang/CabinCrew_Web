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
                    // Reset selectedRoundType khi thay đổi selectedType
                    setSelectedRoundType("");
                } else {
                    setRoundTypes([]);
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
        () => async (campaignType, roundTypeId = null) => {
            setIsLoading(true);
            setError("");
            try {
                const res = await getConfigurations(campaignType);
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
                            const roundTypeIdFromItem =
                                item?.roundTypeId || item?.configurationTypeId || null;
                            return {
                                id,
                                configurationType,
                                campaignType: itemCampaignType,
                                benchmark,
                                effectiveDate,
                                roundTypeId: roundTypeIdFromItem,
                            };
                        })
                        .filter(Boolean);

                    // Filter theo selectedRoundType nếu có
                    if (roundTypeId && roundTypeId !== "") {
                        const parsedRoundTypeId = typeof roundTypeId === "string"
                            ? parseInt(roundTypeId, 10)
                            : Number(roundTypeId);
                        // Tìm round type được chọn
                        const selectedRoundTypeObj = roundTypes.find(rt => rt.roundTypeId === parsedRoundTypeId);

                        if (selectedRoundTypeObj) {
                            // Filter theo roundTypeId hoặc theo tên configurationType
                            mapped = mapped.filter(
                                (item) => item.roundTypeId === parsedRoundTypeId ||
                                    item.configurationType === selectedRoundTypeObj.roundTypeName
                            );
                        }
                    }

                    setItems(mapped);
                } else {
                    setError(res.error || "Cannot load configurations");
                    setItems([]);
                }
            } catch (err) {
                setError(err.message || "Cannot load configurations");
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        },
        [roundTypes]
    );

    useEffect(() => {
        fetchConfigurations(selectedType, selectedRoundType);
    }, [fetchConfigurations, selectedType, selectedRoundType]);

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

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">
                        Filter by Round Type:
                    </label>
                    <select
                        value={selectedRoundType}
                        onChange={(e) => setSelectedRoundType(e.target.value)}
                        disabled={isLoadingRoundTypes || roundTypes.length === 0}
                        className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                        <option value="">All Round Types</option>
                        {roundTypes.map((rt) => (
                            <option key={rt.roundTypeId} value={rt.roundTypeId}>
                                {rt.roundTypeName}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                {error && (
                    <div className="flex items-center justify-between gap-3 p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => fetchConfigurations(selectedType, selectedRoundType)}
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
                                <th colSpan={4} className="px-4 py-2"></th>
                                <th className="px-4 py-2 text-right">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        <FaPlus className="w-3.5 h-3.5" />
                                        Create Configuration
                                    </button>
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
                                    Benchmark
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600">
                                    Effective Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center">
                                        <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                                        <p className="mt-4 text-sm text-gray-600">
                                            Loading data...
                                        </p>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-6 text-sm text-center text-slate-500"
                                    >
                                        No data for configurations.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {index + 1}
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
                                            {item.benchmark}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {item.effectiveDate}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <CreateGeneralModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => fetchConfigurations(selectedType)}
            />
        </div>
    );
};

export default GeneralPage;

