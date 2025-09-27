import { useMemo, useState } from "react";
import { FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const defaultUsers = [
  {
    id: 1,
    fullName: "Alice Johns",
    position: "Software Eng",
    email: "alice.johnson@example.com",
    phone: "123-456-7890",
    status: "Active",
  },
  {
    id: 2,
    fullName: "Bob Smith",
    position: "Marketing Sp",
    email: "bob.smith@example.com",
    phone: "234-567-8901",
    status: "Active",
  },
  {
    id: 3,
    fullName: "Charlie Brown",
    position: "Sales Manage",
    email: "charlie.brown@example.com",
    phone: "345-678-9012",
    status: "Inactive",
  },
  {
    id: 4,
    fullName: "Diana Prince",
    position: "HR Coordinator",
    email: "diana.prince@example.com",
    phone: "456-789-0123",
    status: "Active",
  },
];

const StatusBadge = ({ value }) => {
  const isActive = value?.toLowerCase() === "active";
  return (
    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${
      isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
    }`}>
      <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`}></span>
      {value}
    </span>
  );
};

const AccountTable = ({ users = defaultUsers, onDelete }) => {
  const [sortField, setSortField] = useState(null); // null = default (no sort)
  const [sortDirection, setSortDirection] = useState(null);

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        // Third click: reset to default (no sort)
        setSortField(null);
        setSortDirection(null);
      } else {
        // Was default -> go to asc
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column headers
  const getSortIcon = (field) => {
    if (sortField !== field || !sortDirection) {
      return <FaSort className="ms-1 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <FaSortUp className="ms-1 text-blue-600" />
      : <FaSortDown className="ms-1 text-blue-600" />;
  };

  const sortedUsers = useMemo(() => {
    if (!sortField || !sortDirection) return users;
    const copy = [...users];
    const getValue = (u) => {
      const v = u?.[sortField];
      if (v == null) return "";
      return typeof v === 'string' ? v.toLowerCase() : v;
    };
    copy.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sortDirection === 'asc' ? -1 : 1;
      if (va > vb) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [users, sortField, sortDirection]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-sm text-gray-600">
            <th className="px-5 py-3 font-semibold">
              <button type="button" onClick={() => handleSort('fullName')} className="flex items-center hover:text-gray-900">
                Full Name {getSortIcon('fullName')}
              </button>
            </th>
            <th className="px-5 py-3 font-semibold">
              <button type="button" onClick={() => handleSort('position')} className="flex items-center hover:text-gray-900">
                Position {getSortIcon('position')}
              </button>
            </th>
            <th className="px-5 py-3 font-semibold">
              <button type="button" onClick={() => handleSort('email')} className="flex items-center hover:text-gray-900">
                Contact Email {getSortIcon('email')}
              </button>
            </th>
            <th className="px-5 py-3 font-semibold">
              <button type="button" onClick={() => handleSort('phone')} className="flex items-center hover:text-gray-900">
                Phone Number {getSortIcon('phone')}
              </button>
            </th>
            <th className="px-5 py-3 font-semibold">
              <button type="button" onClick={() => handleSort('status')} className="flex items-center hover:text-gray-900">
                Status {getSortIcon('status')}
              </button>
            </th>
            <th className="px-5 py-3 w-28 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((u, idx) => (
            <tr key={u.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-5 py-4 text-sm text-gray-800 truncate">{u.fullName}</td>
              <td className="px-5 py-4 text-sm text-gray-700 truncate">{u.position}</td>
              <td className="px-5 py-4 text-sm text-gray-700 truncate">{u.email}</td>
              <td className="px-5 py-4 text-sm text-gray-700">{u.phone}</td>
              <td className="px-5 py-4"><StatusBadge value={u.status} /></td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    aria-label="Delete user"
                    className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 text-red-600 hover:text-red-700"
                    onClick={() => onDelete && onDelete(u)}
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

export default AccountTable