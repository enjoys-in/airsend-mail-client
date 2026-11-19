import { createFileRoute, redirect } from "@tanstack/react-router";
import { getPendingInvitations } from "@tasks/_fetchers/invitation/get-pending-invitations";
import getWorkspaces from "@tasks/_fetchers/workspace/get-workspaces";
import { authClient } from "@tasks/_lib/auth-client";
import { handleUnauthorized, isUnauthorizedError } from "@tasks/_lib/http-error";
import type Workspace from "@tasks/_types/workspace";

export const Route = createFileRoute("/_layout/_authenticated/dashboard/")({
  beforeLoad: async () => {
    let workspaces: Workspace[];
    let invitations: Awaited<ReturnType<typeof getPendingInvitations>>;
    let session: Awaited<ReturnType<typeof authClient.getSession>>;
    try {
      [workspaces, invitations, session] = await Promise.all([
        getWorkspaces(),
        getPendingInvitations(),
        authClient.getSession(),
      ]);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }
      throw error;
    }

    if (invitations && invitations.length > 0 && !workspaces.length) {
      throw redirect({ to: "/invitations" });
    }

    const activeWorkspaceId = session?.data?.session?.activeOrganizationId;

    if (workspaces && workspaces.length > 0) {
      if (
        activeWorkspaceId &&
        workspaces.some((ws) => ws.id === activeWorkspaceId)
      ) {
        throw redirect({
          to: "/dashboard/workspace/$workspaceId",
          params: { workspaceId: activeWorkspaceId },
        });
      }

      const firstWorkspace = workspaces[0];

      authClient.organization.setActive({
        organizationId: firstWorkspace.id,
      });

      throw redirect({
        to: "/dashboard/workspace/$workspaceId",
        params: { workspaceId: firstWorkspace.id },
      });
    }
    throw redirect({ to: "/onboarding" });
  },
});
