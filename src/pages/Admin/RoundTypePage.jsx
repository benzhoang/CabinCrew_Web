import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { getRoundTypes } from "../../service/api";
import CreateRoundTypeModal from "./ModalCreate/CreateRoundTypeModal";
import EditRoundTypeModal from "./ModalCreate/EditRoundTypeModal";
import DeleteRoundTypeModal from "./ModalCreate/DeleteRoundTypeModal";

const RoundTypePage = () => {
    const [selectedType, setSelectedType] = useState(1); // 1: Recruitement, 2: Promotion
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRound, setEditingRound] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingRound, setDeletingRound] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchRoundTypes = useMemo(
        () => async (typeValue) => {
            setIsLoading(true);
            setError("");
            try {
                const res = await getRoundTypes(typeValue);
                if (res.success && Array.isArray(res.data)) {
                    const mapped = res.data
                        .map((item, index) => {
                            const id =
                                item?.id ??
                                item?.roundTypeId ??
                                item?.code ??
                                item?.value ??
                                index + 1;
                            const name =
                                item?.roundTypeName ||
                                item?.name ||
                                item?.typeName ||
                                `Round ${id}`;
                            return { id, name };
                        })
                        .filter(Boolean);
                    setItems(mapped);
                } else {
                    setError(res.error || "Không thể tải danh sách vòng");
                    setItems([]);
                }
            } catch (err) {
                setError(err.message || "Không thể tải danh sách vòng");
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchRoundTypes(selectedType);
    }, [fetchRoundTypes, selectedType]);

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Round Types</h1>
                    <p className="text-sm text-slate-600">
                        Select the campaign type to view the corresponding rounds.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <FaPlus className="w-4 h-4" />
                        Add round
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
                            onClick={() => fetchRoundTypes(selectedType)}
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
                                    Round name
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
                                        className="px-4 py-6 text-center"
                                    >
                                        <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                                        <p className="mt-4 text-sm text-gray-600">Loading data...</p>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-6 text-sm text-center text-slate-500"
                                    >
                                        No data for the selected type.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm text-slate-700">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            {item.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingRound(item);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium transition border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDeletingRound(item);
                                                        setIsDeleteModalOpen(true);
                                                    }}
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

            <CreateRoundTypeModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                campaignType={selectedType}
                onSuccess={() => fetchRoundTypes(selectedType)}
            />
            <EditRoundTypeModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingRound(null);
                }}
                roundType={editingRound}
                onSuccess={() => fetchRoundTypes(selectedType)}
            />
            <DeleteRoundTypeModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    if (isDeleting) return;
                    setIsDeleteModalOpen(false);
                    setDeletingRound(null);
                }}
                roundType={deletingRound}
                onSuccess={() => fetchRoundTypes(selectedType)}
                isDeleting={isDeleting}
                setIsDeleting={setIsDeleting}
            />
        </div>
    );
};

export default RoundTypePage;
