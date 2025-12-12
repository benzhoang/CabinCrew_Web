import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaSyncAlt, FaTrash } from "react-icons/fa";
import { getTestTypes } from "../../service/api2";

const TestTypePage = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchTestTypes = useMemo(
        () => async () => {
            setIsLoading(true);
            setError("");
            try {
                const res = await getTestTypes();
                if (res.success && Array.isArray(res.data)) {
                    const mapped = res.data
                        .map((item, index) => {
                            const id =
                                item?.id ??
                                item?.testTypeId ??
                                item?.code ??
                                item?.value ??
                                item?.testType ??
                                index + 1;
                            const name =
                                item?.name ||
                                item?.typeName ||
                                item?.testTypeName ||
                                `Type ${id}`;
                            const description =
                                item?.description ||
                                item?.note ||
                                item?.details ||
                                item?.purpose ||
                                "";
                            return { id, name, description };
                        })
                        .filter(Boolean);
                    setItems(mapped);
                } else {
                    setError(res.error || "Không thể tải loại đề thi");
                    setItems([]);
                }
            } catch (err) {
                setError(err.message || "Không thể tải loại đề thi");
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchTestTypes();
    }, [fetchTestTypes]);

    const handlePlaceholderAction = (action, payload) => {
        // Placeholder UI action for future API wiring
        console.log(`TODO: ${action}`, payload);
    };

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Test Types</h1>
                    <p className="text-sm text-slate-600">
                        List of test types.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => handlePlaceholderAction("create")}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <FaPlus className="w-4 h-4" />
                        Add test type
                    </button>
                </div>
            </header>

            <section className="p-6 bg-white border rounded-2xl border-slate-200 shadow-sm">
                {error && (
                    <div className="flex items-center justify-between gap-3 p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={fetchTestTypes}
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
                                    No.
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 uppercase">
                                    Test type name
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-right text-slate-600 uppercase">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-6 text-sm text-center text-slate-500"
                                    >
                                        Loading data...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-6 text-sm text-center text-slate-500"
                                    >
                                        No data for test types.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            {item.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handlePlaceholderAction("edit", { id: item.id })
                                                    }
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium transition border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handlePlaceholderAction("delete", { id: item.id })
                                                    }
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 transition border rounded-lg border-red-200 hover:bg-red-50"
                                                >
                                                    <FaTrash className="w-4 h-4" />
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
        </div>
    );
};

export default TestTypePage;
