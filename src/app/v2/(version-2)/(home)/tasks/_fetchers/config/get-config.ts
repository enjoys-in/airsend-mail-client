import { client } from "@tasks/_packages/libs";
import type { InferResponseType } from "hono/client";
import { HttpError } from "@tasks/_lib/http-error";

export type GetConfigResponse = InferResponseType<
  (typeof client)["config"]["$get"],
  200
>;

export async function getConfig() {
  const response = await client.config.$get();

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  const data = await response.json();
  return data;
}
