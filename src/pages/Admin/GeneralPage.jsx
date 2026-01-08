import { useEffect, useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { getConfigurations } from "../../service/api2";
import EditGeneralModal from "./ModalCreate/EditGeneralModal";

const GeneralPage = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);

    const fetchConfigurations = useMemo(
        () => async () => {
            setIsLoading(true);
            setError("");
            try {
                const res = await getConfigurations();
                if (res.success && Array.isArray(res.data)) {
                    const mapped = res.data
                        .map((item, index) => {
                            const id =
                                item?.roundConfigurationId ??
                                item?.id ??
                                item?.code ??
                                index + 1;
                            const configurationType =
                                item?.configurationType || "";
                            const campaignType =
                                item?.campaignType || "";
                            const benchmark =
                                item?.benchmark ?? 0;
                            const effectiveDate =
                                item?.effectiveDate || "";
                            return {
                                id,
                                configurationType,
                                campaignType,
                                benchmark,
                                effectiveDate,
                            };
                        })
                        .filter(Boolean);
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
        []
    );

    useEffect(() => {
        fetchConfigurations();
    }, [fetchConfigurations]);

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">General</h1>
                    <p className="text-sm text-slate-600">List of configurations.</p>
                </div>
            </header>

            <section className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                {error && (
                    <div className="flex items-center justify-between gap-3 p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={fetchConfigurations}
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
                                <th className="px-4 py-3 text-xs font-semibold text-right uppercase text-slate-600">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center">
                                        <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                                        <p className="mt-4 text-sm text-gray-600">
                                            Loading data...
                                        </p>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
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
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingConfig(item);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium transition border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <EditGeneralModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingConfig(null);
                }}
                configId={editingConfig?.id}
                onSuccess={fetchConfigurations}
            />
        </div>
    );
};

export default GeneralPage;

