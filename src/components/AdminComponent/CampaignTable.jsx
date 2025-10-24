import { useMemo, useState } from "react";
import { FaEye, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const defaultCampaigns = [
  {
    id: 1,
    name: "Chiến dịch tuyển dụng Mùa Hè",
    quantity: { current: 120, total: 200 },
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    airline: "Vietnam Airlines",
    status: "completed",
  },
  {
    id: 2,
    name: "Chiến dịch tuyển dụng Mùa Thu",
    quantity: { current: 80, total: 100 },
    startDate: "2025-09-15",
    endDate: "2025-10-30",
    airline: "Bamboo Airways",
    status: "not completed",
  },
  {
    id: 3,
    name: "Chiến dịch tuyển dụng Năm Mới",
    quantity: { current: 200, total: 250 },
    startDate: "2025-12-20",
    endDate: "2026-01-10",
    airline: "VietJet Air",
    status: "completed",
  },
];

const SortButton = ({ field, label, sortField, sortDirection, onSort }) => {
  const getIcon = () => {
    if (sortField !== field || !sortDirection) return <FaSort className="ms-1 text-gray-400" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="ms-1 text-blue-600" />
    ) : (
      <FaSortDown className="ms-1 text-blue-600" />
    );
  };
  return (
    <button type="button" onClick={() => onSort(field)} className="flex items-center hover:text-gray-900">
      {label} {getIcon()}
    </button>
  );
};

const CampaignTable = ({ campaigns = defaultCampaigns, onDelete }) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedCampaigns = useMemo(() => {
    if (!sortField || !sortDirection) return campaigns;
    const copy = [...campaigns];
    const getValue = (c) => {
      const v = c?.[sortField];
      if (v == null) return "";
      if (sortField === "quantity") {
        const current = typeof v === "object" ? v.current ?? 0 : Number(v) || 0;
        const total = typeof v === "object" ? v.total ?? 0 : 0;
        // Sort by completion ratio, fallback to current if total is 0
        return total > 0 ? current / total : current;
      }
      if (["startDate", "endDate"].includes(sortField)) return new Date(v).getTime();
      return typeof v === "string" ? v.toLowerCase() : v;
    };
    copy.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sortDirection === "asc" ? -1 : 1;
      if (va > vb) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [campaigns, sortField, sortDirection]);

  const formatDate = (value) => {
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value ?? "";
      return d.toLocaleDateString();
    } catch {
      return value ?? "";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-sm text-gray-600">
            <th className="px-5 py-3 font-semibold w-52">Campaign Name</th>
            <th className="px-5 py-3 font-semibold w-28">
              <SortButton field="quantity" label="Quantity" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            </th>
            <th className="px-5 py-3 font-semibold w-40">
              <SortButton field="startDate" label="Start Date" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            </th>
            <th className="px-5 py-3 font-semibold w-40">
              <SortButton field="endDate" label="End Date" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            </th>
            <th className="px-5 py-3 font-semibold w-60">
              <SortButton field="airline" label="Airline" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            </th>
            <th className="px-5 py-3 font-semibold w-36">Status</th>
            <th className="px-5 py-3 w-24 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedCampaigns.map((c, idx) => (
            <tr key={c.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-5 py-4 text-sm text-gray-800 truncate">{c.name}</td>
              <td className="px-5 py-4 text-sm text-gray-700 truncate">{`${c.quantity?.current ?? 0}/${c.quantity?.total ?? 0}`}</td>
              <td className="px-5 py-4 text-sm text-gray-700 truncate">{formatDate(c.startDate)}</td>
              <td className="px-5 py-4 text-sm text-gray-700 truncate">{formatDate(c.endDate)}</td>
              <td className="px-5 py-4 text-sm text-gray-700 truncate">{c.airline}</td>
              <td className="px-5 py-4 text-sm text-gray-700 truncate">
                <span
                  className={
                    (c.status === "completed"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-700 border-gray-200") +
                    " inline-block rounded-full border px-2 py-0.5 text-xs font-medium"
                  }
                >
                  {c.status === "completed" ? "Completed" : "Not completed"}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    aria-label="View detail"
                    className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 text-yellow-300 hover:text-yellow-400"
                  >
                    <FaEye />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignTable;


