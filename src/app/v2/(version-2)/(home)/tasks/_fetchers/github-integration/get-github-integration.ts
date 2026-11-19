import { client } from "@tasks/_packages/libs";

import { HttpError } from "@tasks/_lib/http-error";

async function getGithubIntegration(projectId: string) {
  const response = await client["github-integration"].project[
    ":projectId"
  ].$get({
    param: { projectId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  const data = await response.json();
  return data;
}

export type GithubIntegration = NonNullable<
  Awaited<ReturnType<typeof getGithubIntegration>>
>;

export default getGithubIntegration;
