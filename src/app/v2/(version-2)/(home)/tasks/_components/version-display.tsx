export function VersionDisplay() {
  const version = process.env.NEXT_PUBLIC_TASKS_VERSION || "2.49.0";
  const changelogUrl =
    "https://github.com/usekaneo/kaneo/blob/main/CHANGELOG.md";

  return (
    <div className="flex items-center justify-center px-2 py-1.5">
      <a
        href={changelogUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
      >
        v{version}
      </a>
    </div>
  );
}
