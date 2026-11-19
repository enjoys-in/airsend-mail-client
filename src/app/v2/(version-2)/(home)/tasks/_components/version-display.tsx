// The tasks app is part of AirSend, so it shows AirSend's own version (package.json, exposed as
// NEXT_PUBLIC_APP_VERSION by next.config.mjs) rather than the version of the Kaneo code it started
// from. Plain text: there is no upstream changelog to link to.
export function VersionDisplay() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  if (!version) return null;

  return (
    <div className="flex items-center justify-center px-2 py-1.5">
      <span className="text-xs text-muted-foreground">v{version}</span>
    </div>
  );
}
