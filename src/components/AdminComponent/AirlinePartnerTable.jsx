import { useMemo, useState } from "react";
import { FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const defaultAirlines = [
  {
    id: 1,
    name: "Vietnam Airlines",
    phone: "024-38320320",
    email: "support@vietnamairlines.com",
    address: "200 Nguyễn Sơn, Long Biên, Hà Nội",
  },
  {
    id: 2,
    name: "Bamboo Airways",
    phone: "024-3233-3233",
    email: "care@bambooairways.com",
    address: "265 Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội",
  },
  {
    id: 3,
    name: "VietJet Air",
    phone: "028-3526-68-68",
    email: "19001886@vietjetair.com",
    address: "60A Trường Sơn, Tân Bình, TP. Hồ Chí Minh",
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

const AirlinePartnerTable = ({ airlines = defaultAirlines, onDelete }) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") { setSortField(null); setSortDirection(null); }
      else setSortDirection("asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedAirlines = useMemo(() => {
    if (!sortField || !sortDirection) return airlines;
    const copy = [...airlines];
    const getValue = (a) => {
      const v = a?.[sortField];
      if (v == null) return "";
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
  }, [airlines, sortField, sortDirection]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-sm text-gray-600">
            <th className="px-5 py-3 font-semibold w-60">
              <SortButton field="name" label="Tên hãng hàng không" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            </th>
            <th className="px-5 py-3 font-semibold w-40">
              <SortButton field="phone" label="Số điện thoại" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            </th>
            <th className="px-5 py-3 font-semibold w-64">
              <SortButton field="email" label="Email" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            </th>
            <th className="px-5 py-3 font-semibold">
              <SortButton field="address" label="Địa chỉ" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            </th>
            <th className="px-5 py-3 w-24 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedAirlines.map((a, idx) => (
            <tr key={a.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-5 py-4 text-sm text-gray-800 truncate">{a.name}</td>
              <td className="px-5 py-4 text-sm text-gray-700 truncate">{a.phone}</td>
              <td className="px-5 py-4 text-sm text-gray-700 truncate">{a.email}</td>
              <td className="px-5 py-4 text-sm text-gray-700 truncate">{a.address}</td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    aria-label="Delete airline"
                    className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 text-red-600 hover:text-red-700"
                    onClick={() => onDelete && onDelete(a)}
                  >
                    <FaTrash />
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

export default AirlinePartnerTable;


