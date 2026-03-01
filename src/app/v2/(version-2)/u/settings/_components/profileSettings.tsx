"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCurrentUser, setAccounts } from "@/store/slices/account";
import { useSettingsPersist } from "@/hooks/use-settings-persist";
import { formatBytes } from "@/lib/utils";
import {
  SettingsPageHeader,
  SettingsSection,
  SettingToggleRow,
  SaveSettingsBar,
} from "./shared";

export default function ProfileSettings({ email }: { email: string }) {
  const { currAccount, accounts } = useAppSelector((state) => state.accounts);
  const dispatch = useAppDispatch();

  const [selectedEmail, setSelectedEmail] = useState(
    currAccount?.email || email,
  );

  const selectedAccount = useMemo(
    () => accounts.find((acc) => acc.email === selectedEmail) || currAccount,
    [selectedEmail, accounts, currAccount],
  );

  const { settings, saveMultiple, isSaving } =
    useSettingsPersist(selectedEmail);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<{ display_name: string }>({ defaultValues: { display_name: "" } });

  const [footerEnabled, setFooterEnabled] = useState(false);
  const [secureEmailEnabled, setSecureEmailEnabled] = useState(false);

  /* ---- sync from store on load / account switch ---- */
  useEffect(() => {
    if (settings) {
      reset({
        display_name:
          settings.user?.display_name || selectedAccount?.name || "",
      });
      setFooterEnabled(
        settings.email_settings?.email_footer?.footer_enabled ?? false,
      );
      setSecureEmailEnabled(
        settings.email_settings?.secure_email_enabled ?? false,
      );
    }
  }, [settings, selectedAccount, reset]);

  /* ---- dirty tracking ---- */
  const watchedName = watch("display_name");
  const storedName =
    settings?.user?.display_name || selectedAccount?.name || "";
  const nameChanged = watchedName !== storedName;
  const footerChanged =
    footerEnabled !==
    (settings?.email_settings?.email_footer?.footer_enabled ?? false);
  const secureChanged =
    secureEmailEnabled !==
    (settings?.email_settings?.secure_email_enabled ?? false);
  const dirty = nameChanged || footerChanged || secureChanged;

  /* ---- save handler ---- */
  const onSave = async (data: { display_name: string }) => {
    if (!selectedAccount) return;

    const updates: Record<string, any> = {};
    const storeUpdates: Record<string, any> = {};

    if (nameChanged) {
      const updatedUser = { ...settings?.user, display_name: data.display_name };
      updates["settings.user"] = updatedUser;
      storeUpdates.user = updatedUser;
    }

    if (footerChanged || secureChanged) {
      const updatedEmail = {
        ...settings?.email_settings,
        secure_email_enabled: secureEmailEnabled,
        email_footer: {
          ...settings?.email_settings?.email_footer,
          footer_enabled: footerEnabled,
        },
      };
      updates["settings.email_settings"] = updatedEmail;
      storeUpdates.email_settings = updatedEmail;
    }

    if (Object.keys(updates).length > 0) {
      await saveMultiple(updates, storeUpdates);
    }

    if (nameChanged) {
      dispatch(fetchCurrentUser());
      dispatch(
        setAccounts(
          accounts.map((acc) =>
            acc.email === selectedAccount.email
              ? { ...acc, name: data.display_name }
              : acc,
          ),
        ),
      );
    }
  };

  const usage = settings?.usage ?? 0;
  const limit = settings?.mailbox_size ?? 0;

  return (
    <div className="p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <SettingsPageHeader title="Display name and signature" />

        {/* Email address selector */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="w-full md:w-40 text-sm font-medium">
            Email address
          </Label>
          <div className="flex-1">
            {accounts.length === 0 ? (
              <Input
                value={currAccount?.email || email || ""}
                readOnly
                className="w-full"
              />
            ) : (
              <Select value={selectedEmail} onValueChange={setSelectedEmail}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      currAccount?.email || email || "Select email"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.email} value={acc.email}>
                      {acc.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Display Name */}
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label
              htmlFor="display-name"
              className="w-full md:w-40 text-sm font-medium"
            >
              Display Name
            </Label>
            <div className="flex-1">
              <Input
                id="display-name"
                {...register("display_name", { required: true })}
                className="w-full"
              />
              {errors.display_name && (
                <p className="text-red-500 text-sm mt-1">
                  Display name is required.
                </p>
              )}
            </div>
          </div>

          {/* Usage & Limit (read-only) */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="w-full md:w-40 text-sm font-medium">
              Current Usage
            </Label>
            <Input
              className="flex-1"
              value={formatBytes(+usage || 0)}
              readOnly
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="w-full md:w-40 text-sm font-medium">Limit</Label>
            <Input
              className="flex-1"
              value={formatBytes(+limit || 0)}
              readOnly
            />
          </div>
        </form>

        {/* Branding toggles */}
        <SettingsSection title="Email Branding">
          <SettingToggleRow
            label="Airsend Mail footer"
            tooltip="Adds 'Sent with Airsend Mail' to outgoing messages"
            checked={footerEnabled}
            onCheckedChange={setFooterEnabled}
          />
          <SettingToggleRow
            label="Secure email badge"
            tooltip="Shows 'Sent with Airsend Mail secure email' in the footer"
            checked={secureEmailEnabled}
            onCheckedChange={setSecureEmailEnabled}
          />
        </SettingsSection>

        <SaveSettingsBar
          onSave={handleSubmit(onSave)}
          show={dirty}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
