import { client } from "@tasks/_packages/libs";

import { HttpError } from "@tasks/_lib/http-error";

async function reorderColumns(
  projectId: string,
  columns: Array<{ id: string; position: number }>,
) {
  const response = await client.column.reorder[":projectId"].$put({
    param: { projectId },
    json: { columns },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export default reorderColumns;
