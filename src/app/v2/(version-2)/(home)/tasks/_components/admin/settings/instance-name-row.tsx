import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsRow } from "@tasks/_components/settings/settings-row";
import { Button } from "@tasks/_components/ui/button";
import { Input } from "@tasks/_components/ui/input";
import { Label } from "@tasks/_components/ui/label";

type InstanceNameRowProps = {
  value: string | null;
  pending: boolean;
  onSave: (name: string | null) => void;
};

export function InstanceNameRow({
  value,
  pending,
  onSave,
}: InstanceNameRowProps) {
  const { t } = useTranslation();
  const id = useId();
  const [draft, setDraft] = useState(value ?? "");
  const next = draft.trim() || null;
  const changed = next !== value;

  return (
    <SettingsRow
      stack
      title={
        <Label htmlFor={id}>{t("settings:adminSettings.instanceName")}</Label>
      }
    >
      <form
        className="flex w-full items-center gap-2 sm:w-72"
        onSubmit={(event) => {
          event.preventDefault();
          if (changed) onSave(next);
        }}
      >
        <Input
          id={id}
          value={draft}
          maxLength={60}
          placeholder="Kaneo"
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={!changed || pending}
        >
          {t("settings:adminSettings.save")}
        </Button>
      </form>
    </SettingsRow>
  );
}
