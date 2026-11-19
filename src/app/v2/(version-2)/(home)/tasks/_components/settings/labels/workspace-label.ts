import type useGetLabelsByWorkspace from "@tasks/_hooks/queries/label/use-get-labels-by-workspace";

export type WorkspaceLabel = NonNullable<
  ReturnType<typeof useGetLabelsByWorkspace>["data"]
>[number];
