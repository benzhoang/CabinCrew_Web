import { useState, useEffect } from "react";
import { FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";
import { toast } from "react-toastify";
import { getAllUsers, disableAccount } from "../../service/api2";
import ModalConfirm from "./ModalConfirm";

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

const PositionBadge = ({ value }) => {
  return (
    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 rounded-md bg-blue-50">
      {value || "N/A"}
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
  pageSize = 5,
  onDelete,
  onDataLoad,
  refreshKey = 0,
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [actionType, setActionType] = useState("delete"); // "delete" or "enable"
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);

  // Fetch data from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Only fetch all pages if roleName is provided but roleId is not available
        // AND we need to filter by roleName on client side
        // If roleId is provided, always use server-side pagination (only fetch current page)
        const shouldFetchAllForRole =
          roleId === null || roleId === undefined
            ? roleName && !searchTerm?.trim() // Only fetch all if no roleId, has roleName, and no search term
            : false; // If roleId exists, never fetch all pages

        const baseParams = {
          searchTerm: searchTerm?.trim() || undefined,
          roleId: roleId ?? undefined,
          partnerId: partnerId ?? undefined,
          isActive: typeof isActive === "boolean" ? isActive : undefined,
          page: shouldFetchAllForRole ? 1 : page ?? undefined,
          pageSize: shouldFetchAllForRole ? 100 : pageSize ?? undefined, // Use larger pageSize when fetching all
        };

        const sortColumnMap = {
          fullName: "fullName",
          position: "role",
          email: "email",
          phone: "phoneNumber",
          status: "isActive",
        };

        if (sortField && sortDirection && sortField !== "no") {
          baseParams.sortColumn = sortColumnMap[sortField] || sortField;
          baseParams.sortOrder = sortDirection;
        }

        let aggregatedItems = [];
        let lastPagination = null;

        if (shouldFetchAllForRole) {
          // Only fetch all if really necessary (no roleId and no search)
          // Limit to reasonable number of pages to avoid too many requests
          const MAX_PAGES_TO_FETCH = 10;
          let currentPage = 1;
          let totalPages = 1;

          while (
            currentPage <= totalPages &&
            currentPage <= MAX_PAGES_TO_FETCH
          ) {
            const result = await getAllUsers({
              ...baseParams,
              page: currentPage,
            });

            if (!result.success) {
              console.error("Error fetching users:", result.error);
              aggregatedItems = [];
              break;
            }

            aggregatedItems = aggregatedItems.concat(result.data.items || []);
            lastPagination = result.data.pagination;

            const nextTotalPages = lastPagination?.totalPages ?? totalPages;
            totalPages = Math.max(totalPages, nextTotalPages);

            if (
              !lastPagination?.hasNextPage ||
              currentPage >= MAX_PAGES_TO_FETCH
            ) {
              break;
            }

            currentPage += 1;
          }
        } else {
          // Normal pagination - only fetch current page
          const result = await getAllUsers(baseParams);

          if (result.success) {
            aggregatedItems = result.data.items || [];
            lastPagination = result.data.pagination;
          } else {
            console.error("Error fetching users:", result.error);
            aggregatedItems = [];
          }
        }

        if (roleName) {
          const normalizedRole = roleName.toLowerCase();
          aggregatedItems = aggregatedItems.filter(
            (user) => user.role?.toLowerCase() === normalizedRole
          );
        }

        const mappedUsers = aggregatedItems.map((user) => ({
          userId: user.userId,
          fullName: user.fullName,
          position: user.role,
          email: user.email,
          phone: user.phoneNumber,
          status: user.isActive,
          originalData: user,
        }));

        if (shouldFetchAllForRole) {
          const effectivePageSize =
            pageSize || mappedUsers.length || lastPagination?.pageSize || 1;
          const currentPage = page ?? 1;
          const startIndex = (currentPage - 1) * effectivePageSize;
          const paginatedUsers = mappedUsers.slice(
            startIndex,
            startIndex + effectivePageSize
          );

          setUsers(paginatedUsers);

          if (onDataLoad) {
            const totalRecords = mappedUsers.length;
            const totalPages = Math.max(
              1,
              Math.ceil(totalRecords / effectivePageSize)
            );

            onDataLoad({
              currentPage,
              pageSize: effectivePageSize,
              totalRecords,
              totalPages,
              hasNextPage: currentPage < totalPages,
              hasPreviousPage: currentPage > 1,
            });
          }
        } else {
          setUsers(mappedUsers);

          if (onDataLoad && lastPagination) {
            onDataLoad({
              ...lastPagination,
              currentPage: lastPagination.currentPage ?? baseParams.page ?? 1,
              pageSize:
                baseParams.pageSize ??
                lastPagination.pageSize ??
                (mappedUsers.length || 1),
              totalRecords: lastPagination.totalRecords ?? mappedUsers.length,
              totalPages:
                lastPagination.totalPages ||
                Math.max(
                  1,
                  Math.ceil(
                    (lastPagination.totalRecords ?? mappedUsers.length) /
                      (baseParams.pageSize ||
                        lastPagination.pageSize ||
                        mappedUsers.length ||
                        1)
                  )
                ),
            });
          }
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
    refreshKey,
    internalRefreshKey,
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

  // Handle delete button click
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setActionType("delete");
    setIsDeleteModalOpen(true);
  };

  // Handle enable button click
  const handleEnableClick = (user) => {
    setSelectedUser(user);
    setActionType("enable");
    setIsDeleteModalOpen(true);
  };

  // Handle confirm action (delete or enable)
  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    if (actionType === "enable") {
      setIsEnabling(true);
    } else {
      setIsDeleting(true);
    }

    try {
      const result = await disableAccount(selectedUser.userId);

      if (result.success) {
        const successMessage =
          actionType === "enable"
            ? result.message || "Kích hoạt lại tài khoản thành công"
            : result.message || "Vô hiệu hóa tài khoản thành công";
        toast.success(successMessage);

        // Call onDelete callback if provided (for backward compatibility)
        if (onDelete) {
          onDelete(selectedUser);
        }

        // Trigger refresh by incrementing internal refresh key
        setInternalRefreshKey((prev) => prev + 1);

        // Close modal
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      } else {
        const errorMessage =
          actionType === "enable"
            ? result.error || "Kích hoạt lại tài khoản thất bại"
            : result.error || "Vô hiệu hóa tài khoản thất bại";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        actionType === "enable"
          ? error.response?.data?.message ||
            error.message ||
            "Đã xảy ra lỗi khi kích hoạt lại tài khoản"
          : error.response?.data?.message ||
            error.message ||
            "Đã xảy ra lỗi khi vô hiệu hóa tài khoản";
      toast.error(errorMessage);
    } finally {
      if (actionType === "enable") {
        setIsEnabling(false);
      } else {
        setIsDeleting(false);
      }
    }
  };

  // Handle cancel action
  const handleCancelAction = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    setActionType("delete");
  };

  if (loading) {
    return (
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
        <div className="py-8 text-center text-gray-600">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  // Client-side sorting for "no" column
  const sortedUsers = [...users];
  if (sortField === "no" && sortDirection) {
    if (sortDirection === "desc") {
      sortedUsers.reverse();
    }
    // For "asc", keep original order (already sorted)
  }

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
      <table className="min-w-full border-collapse table-fixed">
        <thead>
          <tr className="text-sm text-left text-gray-600 bg-gray-50">
            <th className="w-16 px-5 py-3 font-semibold">
              <button
                type="button"
                onClick={() => handleSort("no")}
                className="flex items-center hover:text-gray-900"
              >
                No. {getSortIcon("no")}
              </button>
            </th>
            <th className="px-5 py-3 font-semibold">
              <button
                type="button"
                onClick={() => handleSort("fullName")}
                className="flex items-center hover:text-gray-900"
              >
                {roleName === "Airline Partner" ? "Name" : "Full Name"}{" "}
                {getSortIcon("fullName")}
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
                onClick={() => handleSort("position")}
                className="flex items-center hover:text-gray-900"
              >
                Position {getSortIcon("position")}
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
          {sortedUsers.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-5 py-8 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            sortedUsers.map((u, idx) => {
              // Calculate row number based on page and sort direction
              // Always calculate based on page and pageSize to reflect correct position
              let rowNumber;
              if (sortField === "no" && sortDirection === "desc") {
                // When sorting "no" column desc, reverse the numbers
                const totalInPage = sortedUsers.length;
                rowNumber = (page - 1) * pageSize + (totalInPage - idx);
              } else if (sortDirection === "asc") {
                // When sorting asc (any column), reverse the numbers
                const totalInPage = sortedUsers.length;
                rowNumber = (page - 1) * pageSize + (totalInPage - idx);
              } else {
                // For desc (other columns) or no sort, calculate normally
                rowNumber = (page - 1) * pageSize + idx + 1;
              }
              return (
                <tr
                  key={u.userId || idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-5 py-4 text-sm text-center text-gray-700">
                    {rowNumber}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-800 truncate">
                    {u.fullName}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 truncate">
                    {u.email}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{u.phone}</td>
                  <td className="px-5 py-4">
                    <PositionBadge value={u.position} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge value={u.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {(() => {
                        const isActive =
                          typeof u.status === "boolean"
                            ? u.status
                            : u.status?.toLowerCase() === "active";
                        return isActive ? (
                          <button
                            aria-label="Delete user"
                            className="p-2 text-red-600 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-red-700"
                            onClick={() => handleDeleteClick(u)}
                          >
                            <FaTrash />
                          </button>
                        ) : (
                          <button
                            aria-label="Enable user"
                            className="p-2 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-700"
                            onClick={() => handleEnableClick(u)}
                          >
                            <FaArrowsRotate />
                          </button>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Delete/Enable Confirmation Modal */}
      <ModalConfirm
        isOpen={isDeleteModalOpen}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={
          actionType === "enable"
            ? "Xác nhận kích hoạt lại tài khoản"
            : "Xác nhận vô hiệu hóa tài khoản"
        }
        message={
          selectedUser
            ? actionType === "enable"
              ? `Bạn có muốn kích hoạt lại tài khoản ${selectedUser.email}?`
              : `Bạn có muốn vô hiệu hóa tài khoản ${selectedUser.email}?`
            : actionType === "enable"
            ? "Bạn có muốn kích hoạt lại tài khoản này?"
            : "Bạn có muốn vô hiệu hóa tài khoản này?"
        }
        confirmText={actionType === "enable" ? "Kích hoạt" : "Vô hiệu hóa"}
        cancelText="Hủy"
        isLoading={isDeleting || isEnabling}
      />
    </div>
  );
};

export default AccountTable;
