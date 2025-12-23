import { useState, useEffect, useMemo } from "react";
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
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
        }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"
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
  const [allUsers, setAllUsers] = useState([]); // Store all users for client-side sorting
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
        // Always fetch all data for client-side sorting and pagination
        const baseParams = {
          searchTerm: searchTerm?.trim() || undefined,
          roleId: roleId ?? undefined,
          partnerId: partnerId ?? undefined,
          isActive: typeof isActive === "boolean" ? isActive : undefined,
          page: 1, // Always fetch from page 1 to get all data
          pageSize: 5, // Fetch large pageSize to get all users for client-side sorting
        };

        // Remove server-side sorting - we'll do client-side sorting instead

        let aggregatedItems = [];
        let lastPagination = null;

        // Fetch all pages if needed (limit to reasonable number to avoid too many requests)
        const MAX_PAGES_TO_FETCH = 10;
        let currentPage = 1;
        let totalPages = 1;

        while (currentPage <= totalPages && currentPage <= MAX_PAGES_TO_FETCH) {
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

        // Store all users for client-side sorting and pagination
        setAllUsers(mappedUsers);

        // Update pagination info for parent component
        if (onDataLoad) {
          const totalRecords = mappedUsers.length;
          const effectivePageSize = pageSize || 5;
          const totalPages = Math.max(
            1,
            Math.ceil(totalRecords / effectivePageSize)
          );

          onDataLoad({
            currentPage: page ?? 1,
            pageSize: effectivePageSize,
            totalRecords,
            totalPages,
            hasNextPage: (page ?? 1) < totalPages,
            hasPreviousPage: (page ?? 1) > 1,
          });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setAllUsers([]);
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

  // Client-side sorting (similar to CampaignList and ExamList)
  const sortedUsers = useMemo(() => {
    if (!sortField || !sortDirection || sortField === "no") return allUsers;
    const copy = [...allUsers];
    const getValue = (u) => {
      const v = u?.[sortField];
      if (v == null) return "";
      if (typeof v === "string") return v.toLowerCase();
      return v;
    };
    copy.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sortDirection === "asc" ? -1 : 1;
      if (va > vb) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [allUsers, sortField, sortDirection]);

  // Client-side pagination
  const paginatedUsers = useMemo(() => {
    const pageSizeValue = pageSize || 5;
    const currentPageValue = page ?? 1;
    const startIndex = (currentPageValue - 1) * pageSizeValue;
    const endIndex = startIndex + pageSizeValue;
    return sortedUsers.slice(startIndex, endIndex);
  }, [sortedUsers, page, pageSize]);

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
            ? result.message || "Reactivate account successfully"
            : result.message || "Disable account successfully";
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
            ? result.error || "Reactivate account failed"
            : result.error || "Disable account failed";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        actionType === "enable"
          ? error.response?.data?.message ||
          error.message ||
          "Error when reactivating account"
          : error.response?.data?.message ||
          error.message ||
          "Error when disabling account";
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

  if (loading && allUsers.length === 0) {
    return (
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
        <div className="py-8 text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 overflow-hidden bg-white border border-gray-200 rounded-xl">
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
            <th className="px-5 py-3 font-semibold">Phone Number</th>
            <th className="px-5 py-3 font-semibold">Position</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold text-right w-28">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-5 py-8 text-center text-gray-500">
                No data
              </td>
            </tr>
          ) : (
            paginatedUsers.map((u, idx) => {
              // Calculate row number based on current page and position in filtered/sorted list
              const rowNumber = (page - 1) * pageSize + idx + 1;
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
            ? "Confirm reactivate account"
            : "Confirm disable account"
        }
        message={
          selectedUser
            ? actionType === "enable"
              ? `Do you want to reactivate account ${selectedUser.email}?`
              : `Do you want to disable account ${selectedUser.email}?`
            : actionType === "enable"
              ? "Do you want to reactivate account?"
              : "Do you want to disable account?"
        }
        confirmText={actionType === "enable" ? "Reactivate" : "Disable"}
        cancelText="Cancel"
        isLoading={isDeleting || isEnabling}
      />
    </div>
  );
};

export default AccountTable;
