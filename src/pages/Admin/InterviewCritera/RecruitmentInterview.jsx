import React, { useEffect, useMemo, useState } from "react";
import { FiLoader, FiAlertCircle, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { getInterviewCriterias } from "../../../service/api";

const RecruitmentInterview = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getInterviewCriterias();
                if (res?.success && Array.isArray(res.data)) {
                    setData(res.data);
                } else if (Array.isArray(res)) {
                    setData(res);
                } else {
                    setError(res?.error || "Unable to load recruitment interview criteria");
                }
            } catch (e) {
                setError(e.message || "Unable to load recruitment interview criteria");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const groups = useMemo(() => {
        // The API sample returns an array of groups: [{ title, items: [{ interviewCriteriaItemId, criteria }] }]
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

        // Fallback: API returns flat list of items instead of groups
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Recruitment</span>
                    <span className="text-slate-400">Interview criteria</span>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                    onClick={() => { }}
                >
                    <FiPlus className="w-4 h-4" />
                    Add criteria
                </button>
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
                    {groups.map((group) => (
                        <div key={group.id} className="p-6 space-y-3">
                            <div className="uppercase text-xs font-semibold text-slate-500 tracking-wide">
                                {group.title}
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
                                                    onClick={() => { }}
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
                                        <div className="mt-3 space-y-1">{renderDetails(item)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecruitmentInterview;
