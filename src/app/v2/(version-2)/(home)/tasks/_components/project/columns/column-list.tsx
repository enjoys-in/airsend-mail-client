import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AddColumnRow } from "@tasks/_components/project/columns/add-column-row";
import { ColumnListHeader } from "@tasks/_components/project/columns/column-list-header";
import { ColumnListSkeleton } from "@tasks/_components/project/columns/column-list-skeleton";
import { ColumnRow } from "@tasks/_components/project/columns/column-row";
import type { ProjectColumn } from "@tasks/_components/project/columns/types";
import { errorMessage } from "@tasks/_components/project/error-message";
import { toPositions } from "@tasks/_components/project/sortable/apply-order";
import { SortableList } from "@tasks/_components/project/sortable/sortable-list";
import { useSortableOrder } from "@tasks/_components/project/sortable/use-sortable-order";
import { ConfirmDialog } from "@tasks/_components/settings/confirm-dialog";
import { SettingsCard } from "@tasks/_components/settings/settings-card";
import { useCreateColumn } from "@tasks/_hooks/mutations/column/use-create-column";
import { useDeleteColumn } from "@tasks/_hooks/mutations/column/use-delete-column";
import { useReorderColumns } from "@tasks/_hooks/mutations/column/use-reorder-columns";
import { useUpdateColumn } from "@tasks/_hooks/mutations/column/use-update-column";
import { useGetColumns } from "@tasks/_hooks/queries/column/use-get-columns";
import { useWorkspacePermission } from "@tasks/_hooks/use-workspace-permission";
import { toast } from "@tasks/_lib/toast";

type ColumnListProps = {
  projectId: string;
};

const NO_COLUMNS: ProjectColumn[] = [];

export function ColumnList({ projectId }: ColumnListProps) {
  const { t } = useTranslation();
  const { data: columns = NO_COLUMNS, isLoading } = useGetColumns(projectId);
  const { mutateAsync: createColumn } = useCreateColumn();
  const { mutateAsync: updateColumn } = useUpdateColumn();
  const { mutateAsync: deleteColumn, isPending: deleting } = useDeleteColumn();
  const { mutateAsync: reorderColumns } = useReorderColumns();
  const { canUpdateProjects } = useWorkspacePermission();
  const canEdit = canUpdateProjects();
  const [pendingDelete, setPendingDelete] = useState<ProjectColumn | null>(
    null,
  );

  const { ordered, move } = useSortableOrder(columns, async (next) => {
    try {
      await reorderColumns({ projectId, columns: toPositions(next) });
    } catch (error) {
      toast.error(errorMessage(error, t("settings:columnEditor.reorderError")));
    }
  });

  const update = async (
    id: string,
    data: { name?: string; icon?: string; isFinal?: boolean },
    fallbackKey: string,
  ) => {
    try {
      await updateColumn({ id, projectId, data });
      return true;
    } catch (error) {
      toast.error(errorMessage(error, t(fallbackKey)));
      return false;
    }
  };

  const create = async (data: { name: string; icon: string }) => {
    try {
      await createColumn({ projectId, data });
      return true;
    } catch (error) {
      toast.error(
        errorMessage(error, t("settings:columnEditor.toastCreateError")),
      );
      return false;
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteColumn({ id: pendingDelete.id, projectId });
      setPendingDelete(null);
    } catch (error) {
      toast.error(
        errorMessage(error, t("settings:columnEditor.toastDeleteError")),
      );
    }
  };

  if (isLoading) return <ColumnListSkeleton />;

  return (
    <>
      <SettingsCard>
        <ColumnListHeader />
        <SortableList ids={ordered.map((column) => column.id)} onMove={move}>
          {ordered.map((column) => (
            <ColumnRow
              key={column.id}
              column={column}
              canEdit={canEdit}
              onRename={(name) =>
                update(
                  column.id,
                  { name },
                  "settings:columnEditor.toastRenameError",
                )
              }
              onChangeIcon={(icon) =>
                void update(
                  column.id,
                  { icon },
                  "settings:columnEditor.toastUpdateError",
                )
              }
              onToggleFinal={async (isFinal) => {
                await update(
                  column.id,
                  { isFinal },
                  "settings:columnEditor.toastUpdateError",
                );
              }}
              onDelete={() => setPendingDelete(column)}
            />
          ))}
        </SortableList>
        {canEdit ? <AddColumnRow onCreate={create} /> : null}
      </SettingsCard>
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={t("settings:columnEditor.deleteTitle", {
          name: pendingDelete?.name ?? "",
        })}
        description={t("settings:columnEditor.deleteDescription")}
        confirmLabel={t("settings:columnEditor.deleteConfirm")}
        pendingLabel={t("common:actions.deleting")}
        pending={deleting}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
