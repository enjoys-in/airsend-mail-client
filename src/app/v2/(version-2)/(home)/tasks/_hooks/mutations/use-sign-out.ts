import { useMutation, useQueryClient } from "@tanstack/react-query";
import { replayShellEntrance } from "@tasks/_components/common/shell-entered";
import { getIdToken } from "@tasks/_fetchers/oauth/get-id-token";
import { withTasksBasePath } from "@tasks/_lib/base-path";
import { descriptionSaveQueue } from "@tasks/_lib/description-save-queue";
import { i18n } from "@tasks/_lib/i18n";
import { authClient } from "@tasks/_lib/auth-client";
import { signOutState } from "@tasks/_lib/sign-out-state";

function useSignOut(idpLogoutUrl?: string | null) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  return useMutation({
    mutationFn: async () => {
      const resume = descriptionSaveQueue.pause(session?.user.id ?? "");
      try {
        if (!(await descriptionSaveQueue.drain(session?.user.id ?? "")))
          throw new Error(i18n.t("tasks:detail.editor.saveFailed"));
        const url = idpLogoutUrl ? new URL(idpLogoutUrl) : null;
        if (url) {
          url.searchParams.set(
            "post_logout_redirect_uri",
            `${window.location.origin}${withTasksBasePath("/dashboard")}`,
          );
          signOutState.isRedirecting = true;
          try {
            const { idToken } = await getIdToken();
            if (idToken) url.searchParams.set("id_token_hint", idToken);
          } catch {
            // If we can't get the id_token, proceed without it.
          }
        } else {
          signOutState.isRedirecting = true;
          replayShellEntrance();
        }

        const result = await authClient.signOut();
        if (result.error) {
          throw new Error(result.error.message);
        }
        descriptionSaveQueue.clear();
        // Drop the signed-out user's data before leaving the app, but keep the
        // instance config and status that the auth pages reuse.
        queryClient.removeQueries({
          predicate: ({ queryKey }) =>
            queryKey[0] !== "config" && queryKey[0] !== "instance-status",
        });
        queryClient.getMutationCache().clear();
        // There is no sign-in screen: reload into the app, which opens a fresh session.
        if (url) window.location.href = url.toString();
        else window.location.assign(withTasksBasePath("/dashboard"));
        return result.data;
      } catch (error) {
        signOutState.isRedirecting = false;
        throw error;
      } finally {
        resume();
      }
    },
  });
}

export default useSignOut;
