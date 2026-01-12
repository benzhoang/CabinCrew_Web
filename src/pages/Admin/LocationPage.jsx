import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { getLocations } from "../../service/api";
import EditLocationModal from "./ModalCreate/EditLocationModal";

const LocationPage = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState(null);

    const fetchLocations = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await getLocations();
            if (res.success && Array.isArray(res.data)) {
                const mapped = res.data
                    .map((item, index) => {
                        const id =
                            item?.locationId ??
                            item?.id ??
                            index + 1;
                        const locationId = item?.locationId ?? null;
                        const campaignType = item?.campaignType || "";
                        const address = item?.address || "";
                        return {
                            id,
                            locationId,
                            campaignType,
                            address,
                        };
                    })
                    .filter(Boolean);
                setItems(mapped);
            } else {
                setError(res.error || "Cannot load locations");
                setItems([]);
            }
        } catch (err) {
            setError(err.message || "Cannot load locations");
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Location</h1>
                    <p className="text-sm text-slate-600">List of locations.</p>
                </div>
            </header>

            <section className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                {error && (
                    <div className="flex items-center justify-between gap-3 p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => fetchLocations()}
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
                                <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600">
                                    No.
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600">
                                    Campaign Type
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600">
                                    Address
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-right uppercase text-slate-600">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center">
                                        <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                                        <p className="mt-4 text-sm text-gray-600">
                                            Loading data...
                                        </p>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-6 text-sm text-center text-slate-500"
                                    >
                                        No data for locations.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {(() => {
                                                const campaignTypeLabel =
                                                    item.campaignType === "All" ||
                                                    item.campaignType === "0" ||
                                                    item.campaignType === 0
                                                        ? "Recruitment & Promotion"
                                                        : item.campaignType || "N/A";

                                                const badgeClass =
                                                    campaignTypeLabel?.toLowerCase() === "promotion"
                                                        ? "bg-[#F2E8FF] text-[#6B21A8] border border-[#E9D5FF]"
                                                        : campaignTypeLabel?.toLowerCase() === "recruitment"
                                                            ? "bg-[#E0F2FE] text-[#1D4ED8] border border-[#BFDBFE]"
                                                            : "bg-slate-100 text-slate-700 border border-slate-200";

                                                return (
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                                                        {campaignTypeLabel}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {item.address || "N/A"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (item.locationId) {
                                                            setSelectedLocationId(item.locationId);
                                                            setIsEditModalOpen(true);
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium transition border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50"
                                                    disabled={!item.locationId}
                                                >
                                                    <FaEdit className="w-4 h-4" />
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

            <EditLocationModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedLocationId(null);
                }}
                locationId={selectedLocationId}
                onSuccess={() => {
                    fetchLocations();
                    setIsEditModalOpen(false);
                    setSelectedLocationId(null);
                }}
            />
        </div>
    );
};

export default LocationPage;

