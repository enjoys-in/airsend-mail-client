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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, HardDrive, ShieldCheck, Mail, Sparkles } from "lucide-react";

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

  const usage = Number(settings?.usage ?? 0);
  const limit = Number(settings?.mailbox_size ?? 0);
  const percentUsed = limit > 0 ? Math.min(100, Math.round((usage / limit) * 100)) : 0;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Account and password"
        description="Manage your profile information, display name, mailbox quota, and outgoing email branding."
        icon={<User className="size-5" />}
        badge={<Badge variant="outline" className="text-xs font-normal">Profile</Badge>}
      />

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        {/* Account Identity Section */}
        <SettingsSection
          title="Account Identity"
          description="Your public display name and currently active sending mailbox."
          icon={<Mail className="size-4" />}
        >
          <div className="space-y-4 pt-1">
            {/* Email Address */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
              <div className="space-y-0.5">
                <Label className="text-sm sm:text-base font-medium text-foreground">
                  Active Account
                </Label>
                <p className="text-xs text-muted-foreground">
                  Switch account to configure separate display preferences
                </p>
              </div>
              <div className="w-full sm:w-[280px]">
                {accounts.length === 0 ? (
                  <Input
                    value={currAccount?.email || email || ""}
                    readOnly
                    className="w-full text-xs sm:text-sm bg-muted/40 font-mono"
                  />
                ) : (
                  <Select value={selectedEmail} onValueChange={setSelectedEmail}>
                    <SelectTrigger className="w-full text-xs sm:text-sm bg-background/80 border-border/80 rounded-xl shadow-2xs">
                      <SelectValue
                        placeholder={currAccount?.email || email || "Select email"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.email} value={acc.email} className="text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{acc.email}</span>
                            {acc.email === currAccount?.email && (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-auto">
                                Active
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Display Name */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 py-2 border-t border-border/40">
              <div className="space-y-0.5 max-w-sm">
                <Label htmlFor="display-name" className="text-sm sm:text-base font-medium text-foreground">
                  Display Name
                </Label>
                <p className="text-xs text-muted-foreground">
                  The sender name that recipients will see on incoming emails
                </p>
              </div>
              <div className="w-full sm:w-[280px] space-y-1">
                <Input
                  id="display-name"
                  placeholder="e.g. John Doe"
                  {...register("display_name", { required: true })}
                  className="w-full text-xs sm:text-sm bg-background/80 border-border/80 rounded-xl shadow-2xs"
                />
                {errors.display_name && (
                  <p className="text-destructive text-xs font-medium">
                    Display name is required.
                  </p>
                )}
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Storage Quota Section */}
        <SettingsSection
          title="Mailbox Storage"
          description="Storage space allocated for your emails, attachments, and synced files."
          icon={<HardDrive className="size-4" />}
          badge={
            <Badge
              variant={percentUsed > 85 ? "destructive" : "secondary"}
              className="text-[11px] font-medium"
            >
              {percentUsed}% Used
            </Badge>
          }
        >
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Used: <strong className="text-foreground">{formatBytes(usage)}</strong></span>
                <span className="text-muted-foreground">Total: <strong className="text-foreground">{limit > 0 ? formatBytes(limit) : "Unlimited"}</strong></span>
              </div>
              <Progress value={percentUsed} className="h-2 rounded-full" />
              <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                <span>0 MB</span>
                <span>{limit > 0 ? `${formatBytes(Math.max(0, limit - usage))} remaining` : "No limit set"}</span>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Email Branding Section */}
        <SettingsSection
          title="Email Branding"
          description="Configure signatures, footers, and verification badges appended to outgoing emails."
          icon={<Sparkles className="size-4" />}
        >
          <div className="space-y-1">
            <SettingToggleRow
              label="Airsend Mail footer"
              description="Appends 'Sent with Airsend Mail' to outgoing messages"
              tooltip="Includes a subtle footer on outgoing emails highlighting secure delivery"
              checked={footerEnabled}
              onCheckedChange={setFooterEnabled}
            />
            <SettingToggleRow
              label="Secure email badge"
              description="Includes a verified secure transport badge in the footer"
              tooltip="Shows 'Sent with Airsend Mail secure email' in the footer"
              checked={secureEmailEnabled}
              onCheckedChange={setSecureEmailEnabled}
              badge={
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="size-3" />
                  Verified
                </span>
              }
            />
          </div>
        </SettingsSection>

        <SaveSettingsBar
          onSave={handleSubmit(onSave)}
          show={dirty}
          isSaving={isSaving}
        />
      </form>
    </div>
  );
}
