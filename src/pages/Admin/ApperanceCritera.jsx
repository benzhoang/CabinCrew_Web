import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  getScoringCriterias,
  deleteScoringCriteriaItem,
} from "../../service/api";
import CreateAppearanceCriteriaModal from "./ModalCreate/CreateAppearanceCriteriaModal";
import DeleteScoringCriteriaItemModal from "./ModalCreate/DeleteScoringCriteriaItemModal";

const EmptyState = ({ message }) => (
  <div className="p-6 text-center bg-white border border-dashed rounded-lg text-slate-500 border-slate-200">
    {message}
  </div>
);

const ApperanceCritera = () => {
  const [criterias, setCriterias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedGroupTitle, setSelectedGroupTitle] = useState(null);
  const [selectedScoringCriteriaId, setSelectedScoringCriteriaId] =
    useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [groupOfItemToDelete, setGroupOfItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getScoringCriterias();
        if (res.success) {
          setCriterias(res.data || []);
        } else if (Array.isArray(res)) {
          setCriterias(res);
        } else {
          setError(res.error || "Unable to load criterias");
        }
      } catch (e) {
        setError(e.message || "Unable to load criterias");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const grouped = useMemo(() => {
    return (criterias || []).map((group) => ({
      ...group,
      id: group.scoringCriteriaId || group.id || group.scoringCriteriaId,
      title: group.title || "Criteria",
      items: (group.items || []).map((item) => ({
        ...item,
        details: item.details || [],
      })),
    }));
  }, [criterias]);

  const handleAdd = (group) => {
    setEditing(null);
    setSelectedGroupTitle(group.title);
    // Tìm scoringCriteriaId từ criterias gốc dựa trên title
    const groupIndex = criterias.findIndex(
      (c) =>
        c.title === group.title ||
        (c.scoringCriteriaId &&
          c.scoringCriteriaId === group.scoringCriteriaId) ||
        (group.scoringCriteriaId &&
          c.scoringCriteriaId === group.scoringCriteriaId)
    );
    const originalGroup = groupIndex >= 0 ? criterias[groupIndex] : null;

    // Lấy scoringCriteriaId: từ group gốc, từ group hiện tại, hoặc index + 1 (từ 1 trở đi)
    const scoringId =
      originalGroup?.scoringCriteriaId ||
      originalGroup?.id ||
      group.scoringCriteriaId ||
      group.id ||
      (groupIndex >= 0 ? groupIndex + 1 : criterias.length + 1);

    console.log("Selected Group:", group);
    console.log("Scoring Criteria ID:", scoringId);
    console.log("All Criterias:", criterias);

    setSelectedScoringCriteriaId(scoringId);
    setSelectedGroup(group);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setShowModal(true);
  };

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getScoringCriterias();
      if (res.success) {
        setCriterias(res.data || []);
      } else if (Array.isArray(res)) {
        setCriterias(res);
      } else {
        setError(res.error || "Unable to load criterias");
      }
    } catch (e) {
      setError(e.message || "Unable to load criterias");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Refresh data after successful creation
    await refreshData();
    setShowModal(false);
    setEditing(null);
    setSelectedGroupTitle(null);
    setSelectedScoringCriteriaId(null);
    setSelectedGroup(null);
  };

  const handleDeleteClick = (item, group) => {
    setItemToDelete(item);
    setGroupOfItemToDelete(group);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !groupOfItemToDelete) {
      return;
    }

    // Tìm scoringCriteriaId từ group
    const groupIndex = criterias.findIndex(
      (c) =>
        c.title === groupOfItemToDelete.title ||
        (c.scoringCriteriaId &&
          c.scoringCriteriaId === groupOfItemToDelete.scoringCriteriaId) ||
        (groupOfItemToDelete.scoringCriteriaId &&
          c.scoringCriteriaId === groupOfItemToDelete.scoringCriteriaId)
    );
    const originalGroup = groupIndex >= 0 ? criterias[groupIndex] : null;

    const scoringId =
      originalGroup?.scoringCriteriaId ||
      originalGroup?.id ||
      groupOfItemToDelete.scoringCriteriaId ||
      groupOfItemToDelete.id ||
      (groupIndex >= 0 ? groupIndex + 1 : null);

    const itemId = itemToDelete.scoringCriteriaItemId || itemToDelete.id;

    if (!scoringId || !itemId) {
      setError("Cannot delete: Missing scoring criteria ID or item ID");
      setShowDeleteModal(false);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteScoringCriteriaItem(scoringId, itemId);

      if (result.success) {
        // Refresh data after successful deletion
        await refreshData();
        setShowDeleteModal(false);
        setItemToDelete(null);
        setGroupOfItemToDelete(null);
      } else {
        setError(result.error || "Cannot delete criteria");
      }
    } catch (err) {
      setError(err.message || "An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Appearance Criteria
        </h1>
        <p className="text-slate-600">
          View and manage appearance scoring criteria.
        </p>
      </div>

      <div className="bg-white border shadow-sm border-slate-200 rounded-xl">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-600">Loading criterias...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : grouped.length === 0 ? (
          <EmptyState message="No criteria found." />
        ) : (
          <div className="divide-y divide-slate-100">
            {grouped.map((group) => (
              <div key={group.title} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold tracking-wide uppercase text-slate-500">
                    {group.title}
                  </div>
                  <button
                    onClick={() => handleAdd(group)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add criteria
                  </button>
                </div>
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div
                      key={`${group.title}-${item.scoringCriteriaItemId}-${item.text}`}
                      className="p-4 border rounded-lg border-slate-200 hover:bg-slate-50"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-slate-900">
                            {item.englishText || item.text || "No title"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleEdit({ ...item, groupTitle: group.title })
                            }
                            className="p-2 border rounded-lg border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item, group)}
                            className="p-2 text-red-600 border rounded-lg border-slate-200 hover:bg-red-50"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        {(item.details || []).map((d, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{d.detailText || d}</span>
                          </div>
                        ))}
                        {(!item.details || item.details.length === 0) && (
                          <div className="text-xs text-slate-500">
                            No details
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateAppearanceCriteriaModal
        isOpen={showModal}
        title={editing ? "Edit criteria" : "Add criteria"}
        scoringCriteriaId={selectedScoringCriteriaId}
        initial={
          editing
            ? {
                title: editing.groupTitle,
                text: editing.text,
                englishText: editing.englishText,
                details: editing.details || [],
              }
            : {
                title: selectedGroupTitle || "",
              }
        }
        onClose={() => {
          setShowModal(false);
          setEditing(null);
          setSelectedGroupTitle(null);
          setSelectedScoringCriteriaId(null);
          setSelectedGroup(null);
        }}
        onSubmit={handleSubmit}
      />

      <DeleteScoringCriteriaItemModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
          setGroupOfItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemTitle={
          itemToDelete?.text ||
          itemToDelete?.scoringCriteriaItemId ||
          "this criteria"
        }
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ApperanceCritera;
