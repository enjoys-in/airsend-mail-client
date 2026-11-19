import useBulkSelectionStore from "@tasks/_store/bulk-selection";
import { useTaskActionShortcuts } from "@tasks/_components/project/task-view-keys/use-task-action-shortcuts";
import { BulkBar } from "./bulk-bar";

function BulkToolbar() {
  const { selectedTaskIds, clearSelection, selectAll } =
    useBulkSelectionStore();
  useTaskActionShortcuts(useBulkSelectionStore);
  return (
    <BulkBar
      variant="board"
      selectedTaskIds={selectedTaskIds}
      clearSelection={clearSelection}
      selectAll={selectAll}
      getFocusedTaskId={() => useBulkSelectionStore.getState().focusedTaskId}
    />
  );
}

export default BulkToolbar;
