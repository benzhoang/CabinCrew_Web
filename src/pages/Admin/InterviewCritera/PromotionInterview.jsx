import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FiLoader, FiAlertCircle, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { deleteInterviewCriteriaItem, getInterviewCriteriasPromotion } from "../../../service/api";
import CreateInterviewCriteriaItemModal from "../ModalCreate/CreateInterviewCriteriaItemModal";
import EditInterviewCriteriaItemModal from "../ModalCreate/EditInterviewCriteriaItemModal";
import DeleteConfirmModal from "../ModalCreate/DeleteConfirmModal";

const PromotionInterview = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [selectedCriteriaId, setSelectedCriteriaId] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editingCriteriaId, setEditingCriteriaId] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [deletingCriteriaId, setDeletingCriteriaId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getInterviewCriteriasPromotion();
            if (res?.success && Array.isArray(res.data)) {
                setData(res.data);
            } else if (Array.isArray(res)) {
                setData(res);
            } else {
                setError(res?.error || "Unable to load promotion interview criteria");
            }
        } catch (e) {
            setError(e.message || "Unable to load promotion interview criteria");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const groups = useMemo(() => {
        // Align mapping with Recruitment: prefer grouped response; fallback to flat list
        const mapped = (data || [])
            .map((group) => ({
                id:
                    group.interviewCriteriaGroupId ||
                    group.id ||
                    group.title ||
                    group.groupTitle ||
                    "group",
                title: group.title || group.groupTitle || "Criteria",
                items:
                    group.items ||
                    group.interviewCriteriaItems ||
                    group.children ||
                    [],
            }))
            .filter((g) => Array.isArray(g.items) && g.items.length > 0);

        if (mapped.length === 0 && Array.isArray(data) && data.length > 0) {
            return [
                {
                    id: "default",
                    title: "Criteria",
                    items: data,
                },
            ];
        }

        return mapped;
    }, [data]);

    const renderDetails = (item) => {
        const details =
            item.details ||
            item.interviewCriteriaDetails ||
            item.criterias ||
            item.interviewCriteriaDetailResponses ||
            [];
        return details.map((detail, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>{detail.detailText || detail.text || detail}</span>
            </div>
        ));
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Promotion</span>
                <span className="text-slate-400">Interview criteria</span>
            </div>

            {loading && (
                <div className="p-6 flex items-center gap-2 text-slate-600">
                    <FiLoader className="w-5 h-5 animate-spin" />
                    Loading...
                </div>
            )}

            {error && !loading && (
                <div className="p-6 flex items-center gap-2 text-red-600 text-sm">
                    <FiAlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {!loading && !error && groups.length === 0 && (
                <div className="p-6 text-center text-slate-500">No criteria found.</div>
            )}

            {!loading && !error && groups.length > 0 && (
                <div className="divide-y divide-slate-100">
                    {groups.map((group, index) => (
                        <div key={group.id} className="p-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="uppercase text-xs font-semibold text-slate-500 tracking-wide">
                                    {group.title}
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                                    onClick={() => {
                                        // Promotion: id 3 cho group đầu, id 4 cho group thứ 2
                                        const criteriaId = index === 0 ? 3 : 4;
                                        setSelectedGroupId(group.id);
                                        setSelectedCriteriaId(criteriaId);
                                    }}
                                >
                                    <FiPlus className="w-4 h-4" />
                                    Add criteria
                                </button>
                            </div>
                            <div className="space-y-4">
                                {group.items.map((item) => (
                                    <div
                                        key={`${group.id}-${item.id || item.interviewCriteriaItemId || item.text}`}
                                        className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50"
                                    >
                                        <div className="flex justify-between gap-3">
                                            <div>
                                                <div className="text-base font-semibold text-slate-900">
                                                    {item.criteria || item.text || item.title || "—"}
                                                </div>
                                                {item.englishText && (
                                                    <div className="text-sm italic text-slate-500">
                                                        {item.englishText}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const criteriaId = index === 0 ? 3 : 4;
                                                        setEditingCriteriaId(criteriaId);
                                                        setEditingItem({
                                                            id: item.interviewCriteriaItemId || item.id,
                                                            criteria:
                                                                item.criteria ||
                                                                item.text ||
                                                                item.title ||
                                                                "",
                                                        });
                                                    }}
                                                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const criteriaId = index === 0 ? 3 : 4;
                                                        setDeletingCriteriaId(criteriaId);
                                                        setDeletingItem({
                                                            id: item.interviewCriteriaItemId || item.id,
                                                            criteria:
                                                                item.criteria ||
                                                                item.text ||
                                                                item.title ||
                                                                "",
                                                        });
                                                    }}
                                                    className="p-2 rounded-lg border border-slate-200 text-red-600 hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-3 space-y-1">{renderDetails(item)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateInterviewCriteriaItemModal
                isOpen={!!selectedGroupId}
                interviewCriteriaId={selectedCriteriaId}
                onClose={() => {
                    setSelectedGroupId(null);
                    setSelectedCriteriaId(null);
                }}
                onSuccess={fetchData}
            />
            <DeleteConfirmModal
                isOpen={!!deletingItem}
                onClose={() => {
                    if (isDeleting) return;
                    setDeletingItem(null);
                    setDeletingCriteriaId(null);
                }}
                itemTitle={deletingItem?.criteria || "this criteria"}
                isDeleting={isDeleting}
                onConfirm={async () => {
                    if (!deletingItem || !deletingCriteriaId) return;
                    setIsDeleting(true);
                    try {
                        const result = await deleteInterviewCriteriaItem(
                            deletingCriteriaId,
                            deletingItem.id
                        );
                        if (result.success) {
                            await fetchData();
                            setDeletingItem(null);
                            setDeletingCriteriaId(null);
                        } else {
                            console.error(result.error || "Cannot delete interview criteria item");
                        }
                    } catch (error) {
                        console.error("Error deleting interview criteria item:", error);
                    } finally {
                        setIsDeleting(false);
                    }
                }}
            />
            <EditInterviewCriteriaItemModal
                isOpen={!!editingItem}
                interviewCriteriaId={editingCriteriaId}
                itemId={editingItem?.id}
                initialCriteria={editingItem?.criteria}
                onClose={() => {
                    setEditingItem(null);
                    setEditingCriteriaId(null);
                }}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default PromotionInterview;
