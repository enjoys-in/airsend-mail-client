import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import CommandPalette from "@tasks/_components/command-palette";
import SearchCommandMenu from "@tasks/_components/search-command-menu";

// layout for the main app
export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <>
      <Outlet />
      <CommandPalette />
      <SearchCommandMenu open={searchOpen} setOpen={setSearchOpen} />
    </>
  );
}
