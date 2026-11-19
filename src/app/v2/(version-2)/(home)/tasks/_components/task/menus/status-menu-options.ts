import type { OptionMenuItem } from "@tasks/_components/common/option-menu/option-menu-item";
import { getColumnIcon } from "@tasks/_lib/column";
import { getStatusDisplayLabel } from "@tasks/_lib/i18n/domain";

type StatusColumn = {
  slug: string;
  name: string;
  icon?: string | null;
  isFinal: boolean;
};

export function statusMenuOptions(
  columns: StatusColumn[],
  current: string | null | undefined,
): OptionMenuItem[] {
  return columns.map((column) => ({
    value: column.slug,
    label: getStatusDisplayLabel(column.slug, column.name),
    icon: getColumnIcon(column.slug, column.isFinal, column.icon),
    selected: column.slug === current,
  }));
}
