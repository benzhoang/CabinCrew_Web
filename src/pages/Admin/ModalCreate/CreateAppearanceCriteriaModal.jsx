import React, { useEffect, useState } from "react";

const CreateAppearanceCriteriaModal = ({ isOpen, title, onClose, onSubmit, initial }) => {
    const [titleText, setTitleText] = useState(initial?.title || "");
    const [itemText, setItemText] = useState(initial?.text || "");
    const [itemType, setItemType] = useState(initial?.itemType || "");
    const [detailText, setDetailText] = useState(initial?.detailText || "");

    useEffect(() => {
        if (isOpen) {
            setTitleText(initial?.title || "");
            setItemText(initial?.text || "");
            setItemType(initial?.itemType || "");
            setDetailText(initial?.detailText || "");
        }
    }, [isOpen, initial]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Group title</label>
                        <input
                            value={titleText}
                            onChange={(e) => setTitleText(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. Appearance"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Item text</label>
                        <input
                            value={itemText}
                            onChange={(e) => setItemText(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Criterion text"
                        />
                    </div>
                    {/* Item type removed per request */}
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Detail text</label>
                        <input
                            value={detailText}
                            onChange={(e) => setDetailText(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Optional detail"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit({ titleText, itemText, itemType, detailText })}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateAppearanceCriteriaModal;


