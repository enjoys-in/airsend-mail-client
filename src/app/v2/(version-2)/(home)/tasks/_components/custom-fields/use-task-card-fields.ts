import { useMemo } from "react";
import useGetCustomFieldValuesByProject from "@tasks/_hooks/queries/custom-field/use-get-custom-field-values-by-project";
import { useUserPreferencesStore } from "@tasks/_store/user-preferences";
import { cardFieldsForTask } from "./card-fields";

export function useTaskCardFields(projectId: string, taskId: string) {
  const { data } = useGetCustomFieldValuesByProject(projectId);
  const hiddenFieldIds = useUserPreferencesStore(
    (state) => state.hiddenCardFieldIds,
  );
  return useMemo(
    () => cardFieldsForTask(data, taskId, hiddenFieldIds),
    [data, taskId, hiddenFieldIds],
  );
}
