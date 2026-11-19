"use client";

import React, { Suspense } from "react";
import { type ApiResponse, type DriveProvider } from "@nimbus/_lib/files-types";
import { useEffect, useState, type ChangeEvent } from "react";
import { authClient } from "@nimbus/_lib/auth-shim";
import env from "@nimbus/_lib/env-shim";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useDefaultAccountProvider } from "@nimbus/_components/providers/default-account-provider";
import { useUserInfoProvider } from "@nimbus/_components/providers/user-info-provider";
import { useUnlinkAccount } from "@nimbus/_hooks/useUnlinkAccount";
import { protectedClient } from "@nimbus/_utils/client";

import { ConnectedAccountsSection } from "@nimbus/_components/settings/connected-accounts-section";
import { SubscriptionInfo } from "@nimbus/_components/subscription/subscription-info";
import { UpgradeDialog } from "@nimbus/_components/subscription/upgrade-dialog";
import { ProfileSection } from "@nimbus/_components/settings/profile-section";
import { SettingsHeader } from "@nimbus/_components/settings/header";

function SettingsPageContent() {
  const { user, accounts, refreshUser, refreshAccounts } = useUserInfoProvider();
  const { defaultAccountId } = useDefaultAccountProvider();
  const { unlinkAccount } = useUnlinkAccount();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image || null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPreviewUrl(user.image || null);
    }
  }, [user]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      let isUpdated = false;

      if (user?.email !== email) {
        await authClient.changeEmail({
          newEmail: email,
          callbackURL: `${env.VITE_FRONTEND_URL}/verify-email`,
        });
        isUpdated = true;
      }

      if (user?.name !== name || user?.image !== previewUrl) {
        await authClient.updateUser({
          name,
          image: previewUrl,
        });
        isUpdated = true;
      }

      if (isUpdated) {
        await refreshUser();
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectAccount = async (provider: DriveProvider, accountId: string) => {
    const toastErrorMessage = `Failed to disconnect account. Account ID: ${accountId}`;

    try {
      const response: any = await unlinkAccount(provider, accountId);
      if (response?.error) {
        throw new Error(response.error.message || toastErrorMessage);
      }
      await refreshAccounts();
      toast.success(`Disconnected account`);
    } catch (error) {
      console.error(`Failed to disconnect account`, error);
      toast.error(toastErrorMessage);
    }
  };

  const handleSetDefaultAccount = async (provider: DriveProvider, accountId: string) => {
    setIsSettingDefault(accountId);
    const toastErrorMessage = `Failed to set default account. Account ID: ${accountId}`;

    try {
      const response = await (protectedClient as any).api.user.$put({
        json: {
          defaultProviderId: provider,
          defaultAccountId: accountId,
        },
      });
      if (!response.ok) {
        const data = (await response.json()) as unknown as ApiResponse;
        throw new Error(data.message || toastErrorMessage);
      }
      await refreshAccounts();
      toast.success(`Account set as default`);
    } catch (error) {
      console.error("Failed to set default account:", error);
      toast.error(toastErrorMessage);
    } finally {
      setIsSettingDefault(null);
    }
  };

  const handleUpdateAccount = async (
    provider: DriveProvider,
    accountId: string,
    tableAccountId: string,
    nickname: string
  ) => {
    const toastErrorMessage = `Failed to update account. Account ID: ${accountId}`;

    try {
      const response = await (protectedClient as any).api.account.$put({
        json: {
          id: tableAccountId,
          nickname,
        },
      });
      if (!response.ok) {
        const data = (await response.json()) as unknown as ApiResponse;
        throw new Error(data.message || toastErrorMessage);
      }
      await refreshAccounts();
      toast.success(`Account updated`);
    } catch (error) {
      console.error("Failed to update account:", error);
      toast.error(toastErrorMessage);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <SettingsHeader />
      <div className="container mx-auto max-w-4xl flex-1 space-y-6 p-6">
        <ProfileSection
          name={name}
          email={email}
          previewUrl={previewUrl}
          onNameChange={setName}
          onEmailChange={setEmail}
          onFileChange={handleFileChange}
          onSave={handleSaveProfile}
          isSaving={isSaving}
        />

        <SubscriptionInfo />

        <ConnectedAccountsSection
          accounts={accounts}
          defaultAccountId={defaultAccountId}
          isSettingDefault={isSettingDefault}
          onDisconnect={handleDisconnectAccount}
          onSetDefault={handleSetDefaultAccount}
          onUpdateAccount={handleUpdateAccount}
        />
      </div>

      <UpgradeDialog />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
