import type { AdminUser } from "@tasks/_hooks/queries/admin/use-admin-users";

export type UserActionType =
  | "sendPasswordReset"
  | "sendVerification"
  | "markEmailVerified"
  | "deactivate"
  | "reactivate"
  | "delete";

export type PendingUserAction = {
  type: UserActionType;
  user: AdminUser;
};
