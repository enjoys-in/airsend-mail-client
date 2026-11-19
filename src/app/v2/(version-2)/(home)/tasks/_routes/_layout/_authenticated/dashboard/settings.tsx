import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SettingsShell } from "@tasks/_components/settings/settings-shell";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings",
)({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <SettingsShell>
      <Outlet />
    </SettingsShell>
  );
}
