import { useState, useEffect } from "react";
import { FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { getAllUsers } from "../../service/api2";

const StatusBadge = ({ value }) => {
  const isActive =
    typeof value === "boolean" ? value : value?.toLowerCase() === "active";
  return (
    <span
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${
        isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isActive ? "bg-green-500" : "bg-gray-400"
        }`}
      ></span>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

const AccountTable = ({
  searchTerm = "",
  roleId = null,
  roleName = null,
  partnerId = null,
  isActive = null,
  page = 1,
  pageSize = 10,
  onDelete,
  onDataLoad,
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = {
          searchTerm: searchTerm?.trim() || undefined,
          roleId: roleId ?? undefined,
          partnerId: partnerId ?? undefined,
          isActive: typeof isActive === "boolean" ? isActive : undefined,
          page: page ?? undefined,
          pageSize: pageSize ?? undefined,
        };

        const sortColumnMap = {
          fullName: "fullName",
          position: "role",
          email: "email",
          phone: "phoneNumber",
          status: "isActive",
        };

        if (sortField && sortDirection) {
          params.sortColumn = sortColumnMap[sortField] || sortField;
          params.sortOrder = sortDirection;
        }

        const result = await getAllUsers(params);

        if (result.success) {
          let apiItems = result.data.items || [];

          if (roleName) {
            const normalizedRole = roleName.toLowerCase();
            apiItems = apiItems.filter(
              (user) => user.role?.toLowerCase() === normalizedRole
            );
          }

          const mappedUsers = apiItems.map((user) => ({
            userId: user.userId,
            fullName: user.fullName,
            position: user.role,
            email: user.email,
            phone: user.phoneNumber,
            status: user.isActive,
            originalData: user,
          }));

          setUsers(mappedUsers);

          if (onDataLoad) {
            const hasServerRoleFilter =
              params.roleId !== undefined && params.roleId !== null;
            const effectivePageSize =
              params.pageSize ??
              result.data.pagination.pageSize ??
              (mappedUsers.length || 1);
            const totalRecords = hasServerRoleFilter
              ? result.data.pagination.totalRecords
              : mappedUsers.length;
            const totalPages = hasServerRoleFilter
              ? result.data.pagination.totalPages
              : Math.max(1, Math.ceil(totalRecords / effectivePageSize));

            onDataLoad({
              ...result.data.pagination,
              currentPage:
                result.data.pagination.currentPage ?? params.page ?? 1,
              pageSize: effectivePageSize,
              totalRecords,
              totalPages,
            });
          }
        } else {
          console.error("Error fetching users:", result.error);
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    roleId,
    roleName,
    partnerId,
    isActive,
    page,
    pageSize,
    sortField,
    sortDirection,
  ]);

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        // Third click: reset to default (no sort)
        setSortField(null);
        setSortDirection(null);
      } else {
        // Was default -> go to asc
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon for column headers
  const getSortIcon = (field) => {
    if (sortField !== field || !sortDirection) {
      return <FaSort className="text-gray-400 ms-1" />;
    }
    return sortDirection === "asc" ? (
      <FaSortUp className="text-blue-600 ms-1" />
    ) : (
      <FaSortDown className="text-blue-600 ms-1" />
    );
  };

  if (loading) {
    return (
      <div className="p-8 overflow-hidden text-center bg-white border border-gray-200 rounded-xl">
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
      <table className="min-w-full border-collapse table-fixed">
        <thead>
          <tr className="text-sm text-left text-gray-600 bg-gray-50">
            <th className="w-16 px-5 py-3 font-semibold">No.</th>
            <th className="px-5 py-3 font-semibold">
              <button
                type="button"
                onClick={() => handleSort("fullName")}
                className="flex items-center hover:text-gray-900"
              >
                Full Name {getSortIcon("fullName")}
              </button>
            </th>
            <th className="px-5 py-3 font-semibold">
              <button
                type="button"
                onClick={() => handleSort("position")}
                className="flex items-center hover:text-gray-900"
              >
                Position {getSortIcon("position")}
              </button>
            </th>
            <th className="px-5 py-3 font-semibold">
              <button
                type="button"
                onClick={() => handleSort("email")}
                className="flex items-center hover:text-gray-900"
              >
                Contact Email {getSortIcon("email")}
              </button>
            </th>
            <th className="px-5 py-3 font-semibold">
              <button
                type="button"
                onClick={() => handleSort("phone")}
                className="flex items-center hover:text-gray-900"
              >
                Phone Number {getSortIcon("phone")}
              </button>
            </th>
            <th className="px-5 py-3 font-semibold">
              <button
                type="button"
                onClick={() => handleSort("status")}
                className="flex items-center hover:text-gray-900"
              >
                Status {getSortIcon("status")}
              </button>
            </th>
            <th className="px-5 py-3 font-semibold text-right w-28">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-5 py-8 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            users.map((u, idx) => (
              <tr
                key={u.userId || idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-5 py-4 text-sm text-center text-gray-700">
                  {idx + 1}
                </td>
                <td className="px-5 py-4 text-sm text-gray-800 truncate">
                  {u.fullName}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700 truncate">
                  {u.position}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700 truncate">
                  {u.email}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">{u.phone}</td>
                <td className="px-5 py-4">
                  <StatusBadge value={u.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      aria-label="Delete user"
                      className="p-2 text-red-600 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-red-700"
                      onClick={() => onDelete && onDelete(u)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AccountTable;
