import React, { useState } from "react";
import { exportFlightHoursConfirmation } from "../../service/api";
import ImportFlightHoursModal from "./ImportFlightHoursModal";
import { toast } from "react-toastify";

const FlightHoursActions = ({
  roundId,
  campaignRoundId,
  onExport,
  onImport,
}) => {
  const [exporting, setExporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleExport = async () => {
    if (!roundId) {
      toast.error("Round ID not found");
      return;
    }

    console.log(
      "Export flight hours - roundId:",
      roundId,
      "campaignRoundId:",
      campaignRoundId
    );

    // Nếu có callback tùy chỉnh, dùng callback
    if (onExport) {
      await onExport(roundId, campaignRoundId);
      return;
    }

    // Gọi API export mặc định
    setExporting(true);
    try {
      console.log(
        "Calling exportFlightHoursConfirmation with roundId:",
        roundId
      );
      const result = await exportFlightHoursConfirmation(roundId);
      console.log("Export result:", result);
      if (!result.success) {
        toast.error(result.error || "Export failed");
      } else {
        toast.success("Export successful, file: " + result.filename);
      }
    } catch (error) {
      console.error("Error when exporting:", error);
      toast.error(
        "Error when exporting file: " + (error.message || "Unknown error")
      );
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    if (!roundId) {
      toast.error("Round ID not found");
      return;
    }
    setIsImportModalOpen(true);
  };

  const handleImportFile = async (file, roundId, campaignRoundId) => {
    if (onImport) {
      return await onImport(file, roundId, campaignRoundId);
    } else {
      // Default import logic - có thể gọi API import ở đây
      console.log(
        "Import flight hours data from file:",
        file.name,
        "for round:",
        roundId
      );
      // TODO: Implement import API call
      return {
        success: false,
        error: "Import function is not implemented",
      };
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={handleExport}
          disabled={exporting || !roundId}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export
            </>
          )}
        </button>

        <button
          onClick={handleImportClick}
          disabled={!roundId}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Import
        </button>
      </div>

      <ImportFlightHoursModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        roundId={roundId}
        campaignRoundId={campaignRoundId}
        onImport={handleImportFile}
      />
    </>
  );
};

export default FlightHoursActions;
