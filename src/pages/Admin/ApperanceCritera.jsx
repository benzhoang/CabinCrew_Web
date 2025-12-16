import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiLoader } from "react-icons/fi";
import { getScoringCriterias } from "../../service/api";
import CreateAppearanceCriteriaModal from "./ModalCreate/CreateAppearanceCriteriaModal";

const EmptyState = ({ message }) => (
    <div className="p-6 text-center text-slate-500 border border-dashed border-slate-200 rounded-lg bg-white">
        {message}
    </div>
);

const ApperanceCritera = () => {
    const [criterias, setCriterias] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [selectedGroupTitle, setSelectedGroupTitle] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await getScoringCriterias();
                if (res.success) {
                    setCriterias(res.data || []);
                } else if (Array.isArray(res)) {
                    setCriterias(res);
                } else {
                    setError(res.error || "Unable to load criterias");
                }
            } catch (e) {
                setError(e.message || "Unable to load criterias");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const grouped = useMemo(() => {
        return (criterias || []).map((group) => ({
            title: group.title || "Criteria",
            items: (group.items || []).map((item) => ({
                ...item,
                details: item.details || [],
            })),
        }));
    }, [criterias]);

    const handleAdd = (groupTitle) => {
        setEditing(null);
        setSelectedGroupTitle(groupTitle);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditing(item);
        setShowModal(true);
    };

    const handleSubmit = () => {
        // Placeholder: UI only, no API calls yet
        setShowModal(false);
        setEditing(null);
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Appearance Criteria</h1>
                <p className="text-slate-600">View and manage appearance scoring criteria.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                {isLoading ? (
                    <div className="p-6 flex items-center gap-2 text-slate-600">
                        <FiLoader className="w-5 h-5 animate-spin" />
                        Loading criterias...
                    </div>
                ) : error ? (
                    <div className="p-6 text-red-600">{error}</div>
                ) : grouped.length === 0 ? (
                    <EmptyState message="No criteria found." />
                ) : (
                    <div className="divide-y divide-slate-100">
                        {grouped.map((group) => (
                            <div key={group.title} className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="uppercase text-xs font-semibold text-slate-500 tracking-wide">
                                        {group.title}
                                    </div>
                                    <button
                                        onClick={() => handleAdd(group.title)}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                                    >
                                        <FiPlus className="w-4 h-4" />
                                        Add criteria
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {group.items.map((item) => (
                                        <div
                                            key={`${group.title}-${item.scoringCriteriaItemId}-${item.text}`}
                                            className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50"
                                        >
                                            <div className="flex justify-between gap-3">
                                                <div>
                                                    <div className="text-base font-semibold text-slate-900">
                                                        {item.text || "—"}
                                                    </div>
                                                    {item.englishText && (
                                                        <div className="text-sm italic text-slate-500">
                                                            {item.englishText}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit({ ...item, groupTitle: group.title })}
                                                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { }}
                                                        className="p-2 rounded-lg border border-slate-200 text-red-600 hover:bg-red-50"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-3 space-y-1 text-sm text-slate-700">
                                                {(item.details || []).map((d, idx) => (
                                                    <div key={idx} className="flex items-start gap-2">
                                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                        <span>{d.detailText || d}</span>
                                                    </div>
                                                ))}
                                                {(!item.details || item.details.length === 0) && (
                                                    <div className="text-xs text-slate-500">No details</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateAppearanceCriteriaModal
                isOpen={showModal}
                title={editing ? "Edit criteria" : "Add criteria"}
                initial={
                    editing
                        ? {
                            title: editing.groupTitle,
                            text: editing.text,
                            itemType: editing.itemType,
                            detailText: editing.details?.[0]?.detailText,
                        }
                        : {
                            title: selectedGroupTitle || "",
                        }
                }
                onClose={() => {
                    setShowModal(false);
                    setEditing(null);
                    setSelectedGroupTitle(null);
                }}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default ApperanceCritera;
