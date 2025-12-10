import React from "react";

const Approvers = ({ reviewedBy }) => {
  return (
    <div className="bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="px-5 py-4 font-semibold border-b border-slate-200 text-slate-800">
        Approvers
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full h-9 w-9 bg-slate-200" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-800">
              {reviewedBy || "No one has reviewed yet"}
            </div>
          </div>
          {reviewedBy && (
            <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded-full">
              Approved
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Approvers;
