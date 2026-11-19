import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";
import type { SyncParams, SyncRules } from "./types";

export default async function saveSyncRules(
  param: SyncParams,
  rules: SyncRules,
  previewToken: string,
) {
  const response = await client["integration-sync"].project[":projectId"][
    ":provider"
  ].$patch({ param, json: { rules, previewToken } });
  if (!response.ok) throw await HttpError.fromResponse(response);
  return response.json();
}
