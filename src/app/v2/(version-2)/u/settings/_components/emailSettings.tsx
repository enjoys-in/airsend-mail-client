"use client";

import { memo, useState, useEffect, useCallback } from "react";
import type { EmailSettings as EmailSettingsType } from "@/lib/types/get-user-settings-response";
import { useSettingsPersist } from "@/hooks/use-settings-persist";
import { SettingsPageHeader, SaveSettingsBar } from "./shared";
import MessageToggles from "./messages/message-toggles";
import FooterSystemEmail from "./messages/footer-system-email";

function EmailSettings({ email }: { email: string }) {
  const { settings, save, isSaving } = useSettingsPersist(email);

  const [local, setLocal] = useState<EmailSettingsType | undefined>(undefined);
  const [footerText, setFooterText] = useState("Sent with ❤️ by Airsend");
  const [systemReply, setSystemReply] = useState("This mailbox is read-only.");
  const [dirty, setDirty] = useState(false);

  // Sync from store on first load
  useEffect(() => {
    if (settings?.email_settings && !local) {
      setLocal(settings.email_settings);
      if (settings.email_settings.email_footer?.footer_text) {
        setFooterText(settings.email_settings.email_footer.footer_text);
      }
      if (settings.email_settings.system_email?.system_email_reply) {
        setSystemReply(settings.email_settings.system_email.system_email_reply);
      }
    }
  }, [settings?.email_settings, local]);

  const handleChange = useCallback(
    <K extends keyof EmailSettingsType>(key: K, value: EmailSettingsType[K]) => {
      setLocal((prev) => (prev ? { ...prev, [key]: value } : prev));
      setDirty(true);
    },
    [],
  );

  const handleSave = async () => {
    if (!local) return;
    const updated = {
      ...local,
      email_footer: { ...local.email_footer, footer_text: footerText.trim() },
      system_email: { ...local.system_email, system_email_reply: systemReply.trim() },
    };
    await save("email_settings", updated as EmailSettingsType);
    setLocal(updated as EmailSettingsType);
    setDirty(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-10">
        <SettingsPageHeader title="Messages and composing" />

        <MessageToggles local={local} onChange={handleChange} />

        <FooterSystemEmail
          local={local}
          footerText={footerText}
          systemReply={systemReply}
          onFooterTextChange={setFooterText}
          onSystemReplyChange={setSystemReply}
          onChange={handleChange}
        />

        <SaveSettingsBar onSave={handleSave} show={dirty} isSaving={isSaving} />
      </div>
    </div>
  );
}

export default memo(EmailSettings);
