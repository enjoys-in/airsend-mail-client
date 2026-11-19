import { createFileRoute, Outlet } from "@tanstack/react-router";
import Layout from "@tasks/_components/common/layout";
import WorkspaceArchived from "@tasks/_components/common/workspace-archived";
import useWorkspaceArchived from "@tasks/_hooks/queries/workspace/use-workspace-archived";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceId } = Route.useParams();
  const isArchived = useWorkspaceArchived(workspaceId);

  if (isArchived) return <WorkspaceArchived />;

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
