import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@tasks/_components/settings/profile/profile-page";
import { prefetchManagedProfileFields } from "@tasks/_hooks/queries/user/prefetch-managed-profile-fields";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/account/information",
)({
  loader: {
    handler: ({ context }) =>
      prefetchManagedProfileFields(
        context.queryClient,
        context.session?.user.id,
      ),
    staleReloadMode: "blocking",
  },
  component: ProfilePage,
});
