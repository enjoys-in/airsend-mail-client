import { client } from "@tasks/_packages/libs";
import type { InferRequestType } from "hono/client";
import { HttpError } from "@tasks/_lib/http-error";

export type CreateCustomFieldRequest = InferRequestType<
  (typeof client)["custom-field"]["$post"]
>["json"];

async function createCustomField({
  projectId,
  name,
  type,
  required,
  defaultValue,
  options,
}: CreateCustomFieldRequest) {
  const response = await client["custom-field"].$post({
    json: {
      projectId,
      name,
      type,
      required,
      defaultValue,
      options,
    },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export default createCustomField;
