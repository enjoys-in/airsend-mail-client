import { useTranslation } from "react-i18next";
import { CheckboxDefaultSelect } from "@tasks/_components/project/custom-fields/field-dialog/checkbox-default-select";
import { ChoiceDefaultSelect } from "@tasks/_components/project/custom-fields/field-dialog/choice-default-select";
import { DateDefaultPicker } from "@tasks/_components/project/custom-fields/field-dialog/date-default-picker";
import {
  type FieldFormState,
  visibleOptions,
} from "@tasks/_components/project/custom-fields/field-dialog/field-form";
import { MultiChoiceDefaultSelect } from "@tasks/_components/project/custom-fields/field-dialog/multi-choice-default-select";
import { Input } from "@tasks/_components/ui/input";

type FieldDefaultInputProps = {
  form: FieldFormState;
  labelledBy: string;
  onChange: (
    defaults: Pick<FieldFormState, "defaultValue" | "defaultValues">,
  ) => void;
};

export function FieldDefaultInput({
  form,
  labelledBy,
  onChange,
}: FieldDefaultInputProps) {
  const { t } = useTranslation();
  const setValue = (defaultValue: string) =>
    onChange({ defaultValue, defaultValues: form.defaultValues });

  switch (form.kind) {
    case "boolean":
      return (
        <CheckboxDefaultSelect
          value={form.defaultValue}
          labelledBy={labelledBy}
          onChange={setValue}
        />
      );
    case "date":
      return (
        <DateDefaultPicker
          value={form.defaultValue}
          labelledBy={labelledBy}
          clearable={!form.required}
          onChange={setValue}
        />
      );
    case "dropdown":
      return form.multiple ? (
        <MultiChoiceDefaultSelect
          options={visibleOptions(form)}
          value={form.defaultValues}
          labelledBy={labelledBy}
          onChange={(defaultValues) =>
            onChange({ defaultValue: "", defaultValues })
          }
        />
      ) : (
        <ChoiceDefaultSelect
          options={visibleOptions(form)}
          value={form.defaultValue}
          labelledBy={labelledBy}
          clearable={!form.required}
          onChange={setValue}
        />
      );
    default:
      return (
        <Input
          size="sm"
          type={form.kind === "number" ? "number" : "text"}
          value={form.defaultValue}
          aria-labelledby={labelledBy}
          placeholder={t("settings:customFields.noDefault")}
          onChange={(event) => setValue(event.target.value)}
          className="sm:w-48"
        />
      );
  }
}
