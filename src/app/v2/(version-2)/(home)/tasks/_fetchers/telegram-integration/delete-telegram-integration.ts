import { getApiUrl } from "@tasks/_fetchers/get-api-url";

import { HttpError } from "@tasks/_lib/http-error";

async function deleteTelegramIntegration(projectId: string) {
  const response = await fetch(
    getApiUrl(`/telegram-integration/project/${projectId}`),
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return (await response.json()) as { success: boolean };
}

export default deleteTelegramIntegration;
