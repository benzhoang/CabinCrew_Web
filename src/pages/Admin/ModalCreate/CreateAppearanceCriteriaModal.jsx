import React, { useEffect, useState } from "react";
import { createScoringCriteriaItem } from "../../../service/api";
import { FiPlus, FiX, FiLoader } from "react-icons/fi";

const CreateAppearanceCriteriaModal = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  initial,
  scoringCriteriaId,
}) => {
  const [titleText, setTitleText] = useState(initial?.title || "");
  const [itemText, setItemText] = useState(initial?.text || "");
  const [englishText, setEnglishText] = useState(initial?.englishText || "");
  const [details, setDetails] = useState(
    initial?.details?.length > 0
      ? initial.details.map((d) =>
          typeof d === "string" ? d : d.detailText || ""
        )
      : initial?.detailText
      ? [initial.detailText]
      : [""]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setTitleText(initial?.title || "");
      setItemText(initial?.text || "");
      setEnglishText(initial?.englishText || "");
      setDetails(
        initial?.details?.length > 0
          ? initial.details.map((d) =>
              typeof d === "string" ? d : d.detailText || ""
            )
          : initial?.detailText
          ? [initial.detailText]
          : [""]
      );
      setErrors({});
      // Debug: log scoringCriteriaId khi modal mở
      console.log("Modal opened with scoringCriteriaId:", scoringCriteriaId);
    }
  }, [isOpen, initial, scoringCriteriaId]);

  const handleAddDetail = () => {
    setDetails([...details, ""]);
  };

  const handleRemoveDetail = (index) => {
    if (details.length > 1) {
      setDetails(details.filter((_, i) => i !== index));
    }
  };

  const handleDetailChange = (index, value) => {
    const newDetails = [...details];
    newDetails[index] = value;
    setDetails(newDetails);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!itemText.trim()) {
      newErrors.itemText = "Item text is required";
    }

    if (!scoringCriteriaId) {
      console.error("Scoring criteria ID is missing. Props:", {
        scoringCriteriaId,
        initial,
        title,
      });
      newErrors.general = "Scoring criteria ID is missing. Please try again.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const requestData = {
        itemType: titleText || "Appearance",
        text: itemText.trim(),
        englishText: englishText.trim() || itemText.trim(),
        details: details
          .filter((d) => d.trim() !== "")
          .map((detailText) => ({ detailText: detailText.trim() })),
      };

      const result = await createScoringCriteriaItem(
        scoringCriteriaId,
        requestData
      );

      if (result.success) {
        if (onSubmit) {
          onSubmit(result.data);
        }
        onClose();
      } else {
        setErrors({
          general: result.error || "Failed to create scoring criteria item",
        });
      }
    } catch (err) {
      setErrors({ general: err.message || "An error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 space-y-4 bg-white shadow-xl rounded-2xl">
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
            <label className="block mb-1 text-sm text-slate-700">
              Group title
            </label>
            <input
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Appearance"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-slate-700">
              Item text <span className="text-red-500">*</span>
            </label>
            <input
              value={itemText}
              onChange={(e) => {
                setItemText(e.target.value);
                if (errors.itemText) {
                  setErrors((prev) => ({ ...prev, itemText: "" }));
                }
              }}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.itemText
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-indigo-500"
              }`}
              placeholder="Criterion text"
            />
            {errors.itemText && (
              <p className="mt-1 text-sm text-red-500">{errors.itemText}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm text-slate-700">
              English text
            </label>
            <input
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="English text"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm text-slate-700">
                Detail text
              </label>
              <button
                type="button"
                onClick={handleAddDetail}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <FiPlus className="w-3 h-3" />
                Add detail
              </button>
            </div>
            <div className="space-y-2">
              {details.map((detail, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={detail}
                    onChange={(e) => handleDetailChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Detail ${index + 1}`}
                  />
                  {details.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDetail(index)}
                      className="p-2 text-red-600 border rounded-lg border-slate-300 hover:bg-red-50"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {errors.general && (
            <p className="text-sm text-red-500">{errors.general}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <FiLoader className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAppearanceCriteriaModal;
