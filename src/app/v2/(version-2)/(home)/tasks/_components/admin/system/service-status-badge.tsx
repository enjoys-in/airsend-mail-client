import { useTranslation } from "react-i18next";
import { StatusBadge } from "@tasks/_components/settings/status-badge";
import type { ServiceStatus } from "@tasks/_fetchers/admin/system-types";
import { serviceStatusTone } from "./service-status-tone";

const SERVICE_LABELS = {
  ok: "settings:adminSystem.status.ok",
  warning: "settings:adminSystem.status.warning",
  not_configured: "settings:adminSystem.status.not_configured",
  down: "settings:adminSystem.status.down",
} as const satisfies Record<ServiceStatus, string>;

const SETUP_LABELS = {
  ok: "settings:adminSystem.setupStatus.ok",
  warning: "settings:adminSystem.setupStatus.warning",
  not_configured: "settings:adminSystem.setupStatus.not_configured",
  down: "settings:adminSystem.setupStatus.down",
} as const satisfies Record<ServiceStatus, string>;

type ServiceStatusBadgeProps = {
  status: ServiceStatus;
  variant?: "service" | "setup";
};

export function ServiceStatusBadge({
  status,
  variant = "service",
}: ServiceStatusBadgeProps) {
  const { t } = useTranslation();
  const label = t(
    variant === "setup" ? SETUP_LABELS[status] : SERVICE_LABELS[status],
  );

  return <StatusBadge tone={serviceStatusTone(status)}>{label}</StatusBadge>;
}
