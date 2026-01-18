import { useState, useEffect, useMemo } from "react";
import { FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";
import { toast } from "react-toastify";
import { getAllUsers, disableAccount } from "../../service/api2";
import ModalConfirm from "./ModalConfirm";
import { formatDateFromAPI } from "../../config/formatDate";

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

// Hàm lấy màu cho Partner (các airline khác nhau với màu khác nhau)
const getPartnerColor = (partnerName) => {
  if (!partnerName) return "bg-gray-100 text-gray-600";

  const partner = partnerName.toLowerCase();
  // Có thể thêm các airline cụ thể với màu riêng
  if (
    partner.includes("vietnam airlines") ||
    partner.includes("vietnamairlines")
  ) {
    return "bg-yellow-100 text-yellow-700";
  } else if (partner.includes("vietjet") || partner.includes("viet jet")) {
    return "bg-red-100 text-red-700";
  } else if (partner.includes("bamboo") || partner.includes("bamboo airways")) {
    return "bg-green-100 text-green-700";
  } else if (partner.includes("jetstar") || partner.includes("sun phuquoc")) {
    return "bg-indigo-100 text-indigo-700";
  }
  // Màu mặc định cho các partner khác
  return "bg-cyan-100 text-cyan-700";
};

const PartnerBadge = ({ value }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getPartnerColor(
        value
      )}`}
    >
      {value || "—"}
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
        // Fetch only the current page
        const currentPageValue = page ?? 1;
        const pageSizeValue = pageSize || 5;

        const baseParams = {
          searchTerm: searchTerm?.trim() || undefined,
          roleId: roleId ?? undefined,
          partnerId: partnerId ?? undefined,
          isActive: typeof isActive === "boolean" ? isActive : undefined,
          page: currentPageValue,
          pageSize: pageSizeValue,
        };

        // Add server-side sorting if sortField and sortDirection are set
        if (sortField && sortDirection && sortField !== "no") {
          baseParams.sortColumn = sortField;
          baseParams.sortOrder = sortDirection === "asc" ? "asc" : "desc";
        }

        const result = await getAllUsers(baseParams);

        if (!result.success) {
          console.error("Error fetching users:", result.error);
          setAllUsers([]);
          if (onDataLoad) {
            onDataLoad({
              currentPage: currentPageValue,
              pageSize: pageSizeValue,
              totalRecords: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            });
          }
          return;
        }

        let items = result.data.items || [];
        const paginationInfo = result.data.pagination || {};

        // Filter by roleName if provided (client-side filter)
        if (roleName) {
          const normalizedRole = roleName.toLowerCase();
          items = items.filter(
            (user) => user.role?.toLowerCase() === normalizedRole
          );
        }

        const mappedUsers = items.map((user) => ({
          userId: user.userId,
          fullName: user.fullName,
          imgURL: user.imgURL || user.imgUrl || "",
          dateOfBirth: user.dateOfBirth || "",
          gender: user.gender || "",
          position: user.role,
          email: user.email,
          phone: user.phoneNumber,
          status: user.isActive,
          airlinePartner: user.airlinePartner,
          originalData: user,
        }));

        // Store users for current page
        setAllUsers(mappedUsers);

        // Update pagination info for parent component
        if (onDataLoad) {
          onDataLoad({
            currentPage: paginationInfo.currentPage ?? currentPageValue,
            pageSize: paginationInfo.pageSize ?? pageSizeValue,
            totalRecords: paginationInfo.totalRecords ?? 0,
            totalPages: paginationInfo.totalPages ?? 0,
            hasNextPage: paginationInfo.hasNextPage ?? false,
            hasPreviousPage: paginationInfo.hasPreviousPage ?? false,
          });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setAllUsers([]);
        if (onDataLoad) {
          onDataLoad({
            currentPage: page ?? 1,
            pageSize: pageSize || 5,
            totalRecords: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          });
        }
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

  // Client-side sorting (fallback if server-side sorting is not available)
  // Note: Server-side sorting is preferred and should be used via API params
  const sortedUsers = useMemo(() => {
    // If server-side sorting is being used (sortField and sortDirection are set),
    // the data is already sorted by the server, so we just return allUsers
    // Otherwise, apply client-side sorting as fallback
    if (!sortField || !sortDirection || sortField === "no") return allUsers;

    // Server-side sorting is preferred, but if needed, we can do client-side sorting
    // For now, return allUsers as server should handle sorting
    return allUsers;
  }, [allUsers, sortField, sortDirection]);

  // No need for client-side pagination since server handles it
  // allUsers already contains only the current page's data
  const paginatedUsers = sortedUsers;

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
            ? "Reactivate account successfully"
            : "Disable account successfully";
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
            ? "Reactivate account failed"
            : "Disable account failed";
        toast.error(errorMessage);
      }
    } catch {
      const errorMessage =
        actionType === "enable"
          ? "Error when reactivating account"
          : "Error when disabling account";
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

  // Check if Partner column should be shown
  const showPartnerColumn =
    roleName === "Airline Partner" || roleName === "Cabin Crew";

  return (
    <div className="mt-10 overflow-hidden bg-white border border-gray-200 rounded-xl">
      <table className="min-w-full border-collapse table-fixed">
        <thead>
          <tr className="text-sm text-left text-gray-600 bg-gray-50">
            <th className="w-16 px-5 py-3 font-semibold">No.</th>
            <th className="w-20 px-5 py-3 font-semibold">Avatar</th>
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
            <th className="px-5 py-3 font-semibold">Date of Birth</th>
            <th className="px-5 py-3 font-semibold">Gender</th>
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
            {showPartnerColumn && (
              <th className="px-5 py-3 font-semibold">Partner</th>
            )}
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold text-right w-28">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.length === 0 ? (
            <tr>
              <td
                colSpan={showPartnerColumn ? 11 : 10}
                className="px-5 py-8 text-center text-gray-500"
              >
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
                  <td className="px-5 py-4">
                    {u.imgURL ? (
                      <img
                        src={u.imgURL}
                        alt={u.fullName || "Avatar"}
                        className="object-cover w-10 h-10 rounded-full"
                        onError={(e) => {
                          e.target.src =
                            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                        <span className="text-xs text-gray-400">
                          {u.fullName?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-800 truncate">
                    {u.fullName}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {u.dateOfBirth ? formatDateFromAPI(u.dateOfBirth) : "—"}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {u.gender || "—"}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 truncate">
                    {u.email}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{u.phone}</td>
                  <td className="px-5 py-4">
                    <PositionBadge value={u.position} />
                  </td>
                  {showPartnerColumn && (
                    <td className="px-5 py-4">
                      <PartnerBadge value={u.airlinePartner} />
                    </td>
                  )}
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
