import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

export async function revokeUserSession(sessionId: string) {
  const response = await client.user.sessions[":sessionId"].$delete({
    param: { sessionId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}
