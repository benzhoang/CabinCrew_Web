import React, { useState } from "react";
import PromotionInterview from "./PromotionInterview";
import RecruitmentInterview from "./RecruitmentInterview";

const InterviewIndex = () => {
    const [tab, setTab] = useState("recruitment");

    const tabs = [
        { id: "recruitment", label: "Recruitment" },
        { id: "promotion", label: "Promotion" },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Interview Criteria
                    </h1>
                    <p className="text-slate-600">
                        View criteria for recruitment and promotion interviews.
                    </p>
                </div>
            </div>

            <div className="flex gap-3">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2 rounded-lg border transition-all ${tab === t.id
                            ? "bg-blue-50 text-blue-600 border-blue-300 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                {tab === "recruitment" ? (
                    <RecruitmentInterview />
                ) : (
                    <PromotionInterview />
                )}
            </div>
        </div>
    );
};

export default InterviewIndex;