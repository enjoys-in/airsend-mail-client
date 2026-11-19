import type useGetApiKeys from "@tasks/_hooks/queries/use-get-api-keys";

export type ApiKeyItem = NonNullable<
  ReturnType<typeof useGetApiKeys>["data"]
>[number];
