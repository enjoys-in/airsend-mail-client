import { type ReactNode, useId } from "react";
import { SettingsRow } from "@tasks/_components/settings/settings-row";
import { Label } from "@tasks/_components/ui/label";
import { Switch } from "@tasks/_components/ui/switch";

type PreferenceSwitchRowProps = {
  title: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function PreferenceSwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
}: PreferenceSwitchRowProps) {
  const id = useId();

  return (
    <SettingsRow
      className="flex-row items-center gap-6"
      title={<Label htmlFor={id}>{title}</Label>}
      description={description}
    >
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </SettingsRow>
  );
}
