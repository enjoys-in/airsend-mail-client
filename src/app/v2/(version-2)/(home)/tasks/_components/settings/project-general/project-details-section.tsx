import { type UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ProjectBackgroundRow } from "@tasks/_components/settings/project-general/project-background-row";
import type { ProjectFormValues } from "@tasks/_components/settings/project-general/project-form-values";
import { ProjectIconPicker } from "@tasks/_components/settings/project-general/project-icon-picker";
import { SettingsCard } from "@tasks/_components/settings/settings-card";
import { SettingsFormRow } from "@tasks/_components/settings/settings-form-row";
import { SettingsRow } from "@tasks/_components/settings/settings-row";
import { SettingsSection } from "@tasks/_components/settings/settings-section";
import { Form, FormField } from "@tasks/_components/ui/form";
import { Switch } from "@tasks/_components/ui/switch";
import { Input } from "@tasks/_components/ui/input";
import type { ProjectWithTasks } from "@tasks/_types/project";

type ProjectDetailsSectionProps = {
  form: UseFormReturn<ProjectFormValues>;
  project: ProjectWithTasks | undefined;
  canEdit: boolean;
};

export function ProjectDetailsSection({
  form,
  project,
  canEdit,
}: ProjectDetailsSectionProps) {
  const { t } = useTranslation();
  const slug = useWatch({ control: form.control, name: "slug" });
  const icon = useWatch({ control: form.control, name: "icon" });

  return (
    <SettingsSection title={t("settings:projectGeneral.projectInfoTitle")}>
      <Form {...form}>
        <form onSubmit={(event) => event.preventDefault()}>
          <SettingsCard>
            <FormField
              control={form.control}
              name="includeSubtasks"
              render={({ field }) => (
                <SettingsFormRow label={t("tasks:display.includeSubtasks")}>
                  <Switch
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                    disabled={!canEdit}
                  />
                </SettingsFormRow>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <SettingsFormRow
                  label={t("settings:projectGeneral.projectNameLabel")}
                >
                  <Input
                    size="sm"
                    className="sm:w-64"
                    placeholder={t(
                      "settings:projectGeneral.projectNamePlaceholder",
                    )}
                    disabled={!canEdit}
                    {...field}
                  />
                </SettingsFormRow>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <SettingsFormRow
                  label={t("settings:projectGeneral.keyLabel")}
                  description={t("settings:projectGeneral.keyHint", {
                    slug: slug?.trim() || "ABC",
                  })}
                >
                  <Input
                    size="sm"
                    className="font-mono sm:w-64"
                    placeholder={t("settings:projectGeneral.keyPlaceholder")}
                    disabled={!canEdit}
                    {...field}
                  />
                </SettingsFormRow>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <SettingsFormRow
                  label={t("settings:projectGeneral.descriptionLabel")}
                >
                  <Input
                    size="sm"
                    className="sm:w-64"
                    placeholder={t(
                      "settings:projectGeneral.descriptionPlaceholder",
                    )}
                    disabled={!canEdit}
                    {...field}
                  />
                </SettingsFormRow>
              )}
            />
            <SettingsRow
              title={t("settings:projectGeneral.iconLabel")}
              description={t("settings:projectGeneral.iconHint")}
            >
              <ProjectIconPicker
                value={icon}
                disabled={!canEdit}
                onChange={(next) =>
                  form.setValue("icon", next, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </SettingsRow>
            <ProjectBackgroundRow project={project} canEdit={canEdit} />
          </SettingsCard>
        </form>
      </Form>
    </SettingsSection>
  );
}
