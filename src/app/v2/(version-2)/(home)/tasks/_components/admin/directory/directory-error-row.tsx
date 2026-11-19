import { CircleAlertIcon, RefreshCwIcon } from "lucide-react";
import { SettingsRow } from "@tasks/_components/settings/settings-row";
import { Button } from "@tasks/_components/ui/button";

type DirectoryErrorRowProps = {
  message: string;
  retryLabel: string;
  onRetry: () => void;
};

export function DirectoryErrorRow({
  message,
  retryLabel,
  onRetry,
}: DirectoryErrorRowProps) {
  return (
    <SettingsRow icon={<CircleAlertIcon />} title={message}>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <RefreshCwIcon aria-hidden="true" />
        {retryLabel}
      </Button>
    </SettingsRow>
  );
}
