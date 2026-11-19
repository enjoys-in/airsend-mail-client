import { client } from "@tasks/_packages/libs";

import { HttpError } from "@tasks/_lib/http-error";

async function getGiteaIntegration(projectId: string) {
  const response = await client["gitea-integration"].project[":projectId"].$get(
    {
      param: { projectId },
    },
  );

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  const data = await response.json();
  return data;
}

export type GiteaIntegration = NonNullable<
  Awaited<ReturnType<typeof getGiteaIntegration>>
>;

export default getGiteaIntegration;
