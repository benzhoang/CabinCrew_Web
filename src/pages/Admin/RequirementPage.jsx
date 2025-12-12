import React, { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiLoader, FiPlus, FiTrash2 } from "react-icons/fi";
import { getRequirementItems } from "../../service/api";

const EmptyState = ({ message }) => (
    <div className="p-6 text-center text-slate-500 border border-dashed border-slate-200 rounded-lg bg-white">
        {message}
    </div>
);

const RequirementPage = () => {
    const [selectedType, setSelectedType] = useState(1); // 1: Recruitment, 2: Promotion
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchRequirementItems = useMemo(
        () => async (typeValue) => {
            setIsLoading(true);
            setError("");
            try {
                const res = await getRequirementItems(typeValue);
                const groups = Array.isArray(res?.data) ? res.data : [];

                if (res.success && groups.length > 0) {
                    const normalized = groups.flatMap((group, groupIndex) => {
                        const groupItems =
                            group?.requirementItems ||
                            group?.requirementitems ||
                            group?.items ||
                            [];

                        if (!Array.isArray(groupItems)) return [];

                        return groupItems.map((item, idx) => ({
                            id:
                                item?.requirementItemId ??
                                item?.id ??
                                item?.code ??
                                `${group?.requirementId ?? groupIndex + 1}-${idx + 1}`,
                            title: item?.title || item?.name || "Requirement item",
                            description: item?.description || item?.detail || "",
                        }));
                    });
                    setItems(normalized);
                    setError("");
                } else {
                    setError(res?.error || "Không thể tải yêu cầu");
                    setItems([]);
                }
            } catch (err) {
                setError(err.message || "Không thể tải yêu cầu");
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchRequirementItems(selectedType);
    }, [fetchRequirementItems, selectedType]);

    const handlePlaceholderAction = (action, payload) => {
        console.log(`TODO: ${action}`, payload);
    };

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Requirements</h1>
                    <p className="text-sm text-slate-600">
                        View and manage requirement items for Recruitment or Promotion.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            handlePlaceholderAction("create", {
                                type: selectedType,
                            })
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <FiPlus className="w-4 h-4" />
                        Add requirement item
                    </button>
                </div>
            </header>

            <section className="flex flex-wrap gap-3">
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
            </section>

            <section className="p-6 bg-white border rounded-2xl border-slate-200 shadow-sm">
                {error && (
                    <div className="flex items-center justify-between gap-3 p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => fetchRequirementItems(selectedType)}
                            className="text-xs font-medium underline"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center gap-2 text-slate-600">
                        <FiLoader className="w-5 h-5 animate-spin" />
                        Đang tải dữ liệu...
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState message="Không có requirement item nào cho loại chiến dịch này." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 uppercase">
                                        No.
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 uppercase">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 uppercase">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-right text-slate-600 uppercase">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm text-slate-700">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            {item.title || "Requirement item"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {item.description || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handlePlaceholderAction("edit", {
                                                            id: item.id,
                                                            type: selectedType,
                                                        })
                                                    }
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium transition border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handlePlaceholderAction("delete", {
                                                            id: item.id,
                                                            type: selectedType,
                                                        })
                                                    }
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 transition border rounded-lg border-red-200 hover:bg-red-50"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default RequirementPage;

