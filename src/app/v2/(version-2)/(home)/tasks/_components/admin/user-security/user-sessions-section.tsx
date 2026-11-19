import { LogOutIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RevokeSessionDialog } from "@tasks/_components/account/sessions/revoke-session-dialog";
import { SessionRow } from "@tasks/_components/account/sessions/session-row";
import { ConfirmDialog } from "@tasks/_components/settings/confirm-dialog";
import { SettingsCard } from "@tasks/_components/settings/settings-card";
import { SettingsRowsSkeleton } from "@tasks/_components/settings/settings-rows-skeleton";
import { SettingsSection } from "@tasks/_components/settings/settings-section";
import { Button } from "@tasks/_components/ui/button";
import type { AdminUser } from "@tasks/_fetchers/admin/types";
import type { ActiveSession } from "@tasks/_fetchers/user/session-types";
import useRevokeAdminUserSession from "@tasks/_hooks/mutations/admin/use-revoke-admin-user-session";
import useRevokeAdminUserSessions from "@tasks/_hooks/mutations/admin/use-revoke-admin-user-sessions";
import useAdminUserSessions from "@tasks/_hooks/queries/admin/use-admin-user-sessions";
import { toast } from "@tasks/_lib/toast";

type Props = {
  user: AdminUser;
  isSelf: boolean;
};

export function UserSessionsSection({ user, isSelf }: Props) {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useAdminUserSessions(user.id);
  const revokeOne = useRevokeAdminUserSession();
  const revokeAll = useRevokeAdminUserSessions();
  const [revoking, setRevoking] = useState<ActiveSession | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const sessions = data?.sessions ?? [];
  const canRevokeAll = sessions.some((session) => !session.current);

  const handleRevoke = async () => {
    if (!revoking) return;
    try {
      await revokeOne.mutateAsync({ userId: user.id, sessionId: revoking.id });
      toast.success(t("settings:sessions.toastRevoked"), { icon: LogOutIcon });
      setRevoking(null);
    } catch {
      toast.error(t("settings:sessions.toastRevokeError"));
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAll.mutateAsync(user.id);
      toast.success(t("settings:adminUsers.security.toastRevokedAll"), {
        icon: LogOutIcon,
      });
      setConfirmAll(false);
    } catch {
      toast.error(t("settings:sessions.toastRevokeError"));
    }
  };

  const renderSessions = () => {
    if (isPending) return <SettingsRowsSkeleton rows={2} withDescription />;
    if (isError) {
      return (
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <p role="alert" className="text-destructive-foreground text-sm">
            {t("settings:sessions.loadError")}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
          >
            {t("settings:adminUsers.retry")}
          </Button>
        </div>
      );
    }
    if (sessions.length === 0) {
      return (
        <p className="px-4 py-3.5 text-muted-foreground text-sm">
          {t("settings:adminUsers.security.sessionsEmpty")}
        </p>
      );
    }
    return sessions.map((session) => (
      <SessionRow
        key={session.id}
        session={session}
        onRevoke={() => setRevoking(session)}
      />
    ));
  };

  return (
    <SettingsSection
      title={t("settings:adminUsers.security.sessionsTitle")}
      action={
        canRevokeAll ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirmAll(true)}
          >
            {t("settings:adminUsers.security.revokeAll")}
          </Button>
        ) : null
      }
    >
      <SettingsCard>{renderSessions()}</SettingsCard>

      <RevokeSessionDialog
        session={revoking}
        pending={revokeOne.isPending}
        onConfirm={handleRevoke}
        onClose={() => setRevoking(null)}
      />
      <ConfirmDialog
        open={confirmAll}
        onOpenChange={(open) => {
          if (open || !revokeAll.isPending) setConfirmAll(open);
        }}
        title={t("settings:adminUsers.security.revokeAllConfirmTitle", {
          name: user.name,
        })}
        description={t(
          isSelf
            ? "settings:adminUsers.security.revokeAllSelfDescription"
            : "settings:adminUsers.security.revokeAllConfirmDescription",
        )}
        confirmLabel={t("settings:adminUsers.security.revokeAll")}
        pendingLabel={t("settings:sessions.revoking")}
        pending={revokeAll.isPending}
        onConfirm={handleRevokeAll}
      />
    </SettingsSection>
  );
}
