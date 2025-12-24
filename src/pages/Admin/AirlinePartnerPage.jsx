import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { getAirlinePartners } from "../../service/api";
import Pagination from "../../components/AdminComponent/Pagination";
import CreateAirlinePartnerModal from "./ModalCreate/CreateAirlinePartnerModal";

const AirlinePartnerPage = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchAirlinePartners = useMemo(
        () => async () => {
            setIsLoading(true);
            setError("");
            try {
                const res = await getAirlinePartners();
                if (res.success && Array.isArray(res.data)) {
                    setItems(res.data);
                    setCurrentPage(1);
                } else {
                    setError(res.error || "Không thể tải danh sách đối tác hàng không");
                    setItems([]);
                    setCurrentPage(1);
                }
            } catch (err) {
                setError(err.message || "Không thể tải danh sách đối tác hàng không");
                setItems([]);
                setCurrentPage(1);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchAirlinePartners();
    }, [fetchAirlinePartners]);

    const totalPages = Math.max(1, Math.ceil((items?.length || 0) / pageSize));
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const displayedItems = items.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Airline Partners
                    </h1>
                    <p className="text-sm text-slate-600">
                        List of airline partners
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <FaPlus className="w-4 h-4" />
                        Add Airline Partners
                    </button>
                </div>
            </header>

            <section className="p-6 bg-white border rounded-2xl border-slate-200 shadow-sm">
                {error && (
                    <div className="flex items-center justify-between gap-3 p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={fetchAirlinePartners}
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
                                <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 uppercase">
                                    No.
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 uppercase">
                                    Partner Name
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 uppercase">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 uppercase">
                                    Address
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
                            ) : displayedItems.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-6 text-sm text-center text-slate-500"
                                    >
                                        No airline partners found.
                                    </td>
                                </tr>
                            ) : (
                                displayedItems.map((item, index) => {
                                    const stt = (currentPage - 1) * pageSize + index + 1;
                                    const partnerId =
                                        item?.partnerId ?? item?.id ?? index + 1;
                                    const partnerName =
                                        item?.partnerName || item?.name || "N/A";
                                    const description = item?.description || "N/A";
                                    const address = item?.address || "N/A";

                                    return (
                                        <tr key={partnerId}>
                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                {stt}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                {partnerName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                {description}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                {address}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {items.length > 0 && (
                    <div className="mt-4">
                        <Pagination
                            totalItems={items.length}
                            itemsPerPage={pageSize}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </section>

            <CreateAirlinePartnerModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchAirlinePartners}
            />
        </div>
    );
};

export default AirlinePartnerPage;

