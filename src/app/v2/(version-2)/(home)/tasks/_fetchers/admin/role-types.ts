import type { CustomRolePermission } from "@tasks/_packages/permissions";
import type { getAdminRoles } from "./get-admin-roles";

export type AdminRole = Awaited<ReturnType<typeof getAdminRoles>>[number];

export type AdminRoleValues = {
  name: string;
  permissions: CustomRolePermission[];
};
