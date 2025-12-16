import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { createRequirementItem } from "../../../service/api";
import { toast } from "react-toastify";

const CreateRequirementItemModal = ({ isOpen, onClose, requirementId, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({ title: "", description: "" });
            setErrors({});
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createRequirementItem(requirementId, {
                title: formData.title.trim(),
                description: formData.description.trim() || "",
            });

            if (result.success) {
                toast.success("Create requirement item successfully!");
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
            } else {
                toast.error(result.error || "Cannot create requirement item");
            }
        } catch (error) {
            toast.error("An error occurred while creating requirement item");
            console.error("Error creating requirement item:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Create New Requirement Item
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 transition-colors"
                        aria-label="Close"
                        disabled={isSubmitting}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter requirement item title"
                            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? "border-red-500" : "border-slate-300"
                                }`}
                            disabled={isSubmitting}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter description (optional)"
                            rows={4}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRequirementItemModal;