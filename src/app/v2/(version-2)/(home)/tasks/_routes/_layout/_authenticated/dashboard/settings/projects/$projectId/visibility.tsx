import { createFileRoute } from "@tanstack/react-router";
import { ProjectVisibilityPage } from "@tasks/_components/settings/project-visibility/project-visibility-page";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/projects/$projectId/visibility",
)({
  component: ProjectVisibilityPage,
});
