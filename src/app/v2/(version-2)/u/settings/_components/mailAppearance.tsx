"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSettingsPersist } from "@/hooks/use-settings-persist";
import type { IComposingSettings, IDisplay, IPersonalization } from "@/lib/types/get-user-settings-response";
import {
  SettingsPageHeader,
  SettingsSection,
  SettingToggleRow,
  SettingSelectRow,
  SaveSettingsBar,
} from "./shared";

/* ---- defaults ---- */
const DEFAULT_COMPOSING: IComposingSettings = {
  composer_mode: "normal",
  conversations_per_page: 50,
  text_direction: "ltr",
  default_font: "arial",
  default_font_size: 14,
};

/* ---- component ---- */
export default function MailAppearance({ email }: { email: string }) {
  const { settings, saveMultiple, isSaving } = useSettingsPersist(email);

  /* local copies for dirty-tracking */
  const [composing, setComposing] = useState<IComposingSettings>(DEFAULT_COMPOSING);
  const [dailyEmails, setDailyEmails] = useState(true);
  const [inboxLayout, setInboxLayout] = useState<"column" | "row">("column");
  const [composerLayout, setComposerLayout] = useState<"normal" | "maximized">("normal");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [dirty, setDirty] = useState(false);

  /* sync from store once */
  useEffect(() => {
    if (!settings) return;
    if (settings.composing) setComposing(settings.composing);
    setInboxLayout(settings.display?.showRightSidebar ? "column" : "row");
    setDailyEmails(settings.personalization?.theme === "dark");
  }, [settings]);

  const markDirty = useCallback(() => setDirty(true), []);

  /* helper for composing fields */
  const updateComposing = <K extends keyof IComposingSettings>(
    key: K,
    value: IComposingSettings[K],
  ) => {
    setComposing((prev) => ({ ...prev, [key]: value }));
    markDirty();
  };

  /* ---- save ---- */
  const handleSave = async () => {
    const displayUpdate = {
      ...settings?.display,
      showRightSidebar: inboxLayout === "column",
    } as IDisplay;
    const personUpdate = {
      ...settings?.personalization,
      layout: inboxLayout === "column" ? "2-column" : "list",
    } as IPersonalization;

    await saveMultiple(
      {
        "settings.composing": composing,
        "settings.display": displayUpdate,
        "settings.personalization": personUpdate,
      },
      {
        composing,
        display: displayUpdate,
        personalization: personUpdate,
      },
    );
    setDirty(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <SettingsPageHeader title="Messages and composing" />

        {/* ---- General ---- */}
        <SettingsSection title="General">
          <SettingToggleRow
            label="Daily email notifications"
            tooltip="Receive a daily summary of your messages"
            checked={dailyEmails}
            onCheckedChange={(v) => { setDailyEmails(v); markDirty(); }}
          />
        </SettingsSection>

        {/* ---- Composing ---- */}
        <SettingsSection title="Composing">
          <SettingSelectRow
            label="Composer mode"
            value={composing.composer_mode}
            onValueChange={(v) => updateComposing("composer_mode", v as IComposingSettings["composer_mode"])}
            options={[
              { value: "normal", label: "Normal" },
              { value: "rich", label: "Rich Text" },
              { value: "plain", label: "Plain Text" },
            ]}
          />
          <SettingSelectRow
            label="Conversations per page"
            value={String(composing.conversations_per_page)}
            onValueChange={(v) => updateComposing("conversations_per_page", Number(v))}
            options={[
              { value: "25", label: "25" },
              { value: "50", label: "50" },
              { value: "100", label: "100" },
            ]}
            triggerClassName="w-[100px]"
          />
          <SettingSelectRow
            label="Text direction"
            value={composing.text_direction}
            onValueChange={(v) => updateComposing("text_direction", v as "ltr" | "rtl")}
            options={[
              { value: "ltr", label: "Left to Right" },
              { value: "rtl", label: "Right to Left" },
            ]}
          />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Default font / size</span>
            <div className="flex gap-2">
              <SettingSelectRow
                label=""
                value={composing.default_font}
                onValueChange={(v) => updateComposing("default_font", v)}
                options={[
                  { value: "arial", label: "Arial" },
                  { value: "times", label: "Times New Roman" },
                  { value: "calibri", label: "Calibri" },
                ]}
                triggerClassName="w-[130px]"
              />
              <SettingSelectRow
                label=""
                value={String(composing.default_font_size)}
                onValueChange={(v) => updateComposing("default_font_size", Number(v))}
                options={[
                  { value: "12", label: "12" },
                  { value: "14", label: "14" },
                  { value: "16", label: "16" },
                  { value: "18", label: "18" },
                ]}
                triggerClassName="w-[70px]"
              />
            </div>
          </div>
        </SettingsSection>

        {/* ---- Layout ---- */}
        <SettingsSection title="Layout">
          <div className="space-y-6">
            {/* Inbox layout */}
            <div>
              <p className="text-sm mb-3">Inbox</p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <LayoutOption
                  id="column"
                  selected={inboxLayout === "column"}
                  onSelect={() => { setInboxLayout("column"); markDirty(); }}
                  label="Column"
                  imageSrc="/email-inbox-layout.png"
                />
                <LayoutOption
                  id="row"
                  selected={inboxLayout === "row"}
                  onSelect={() => { setInboxLayout("row"); markDirty(); }}
                  label="Row"
                  imageSrc="/email-inbox-row.png"
                />
              </div>
            </div>

            {/* Composer layout */}
            <div>
              <p className="text-sm mb-3">Composer</p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <LayoutOption
                  id="normal"
                  selected={composerLayout === "normal"}
                  onSelect={() => { setComposerLayout("normal"); markDirty(); }}
                  label="Normal"
                  imageSrc="/email-composer-normal.png"
                />
                <LayoutOption
                  id="maximized"
                  selected={composerLayout === "maximized"}
                  onSelect={() => { setComposerLayout("maximized"); markDirty(); }}
                  label="Maximized"
                  imageSrc="/maximized-email-composer.png"
                />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* ---- Density ---- */}
        <SettingsSection title="Density" description="Choose the spacing between elements">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <LayoutOption
              id="comfortable"
              selected={density === "comfortable"}
              onSelect={() => { setDensity("comfortable"); markDirty(); }}
              label="Comfortable"
              imageSrc="/comfortable-email-density.png"
            />
            <LayoutOption
              id="compact"
              selected={density === "compact"}
              onSelect={() => { setDensity("compact"); markDirty(); }}
              label="Compact"
              imageSrc="/placeholder.svg?height=150&width=150&query=email compact density"
            />
          </div>
        </SettingsSection>

        <SaveSettingsBar onSave={handleSave} show={dirty} isSaving={isSaving} />
      </div>
    </div>
  );
}

/* ---- LayoutOption sub-component ---- */
interface LayoutOptionProps {
  id: string;
  selected: boolean;
  onSelect: () => void;
  label: string;
  imageSrc: string;
}

function LayoutOption({ id, selected, onSelect, label, imageSrc }: LayoutOptionProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
      className={`relative rounded-md overflow-hidden cursor-pointer border transition-colors ${
        selected ? "border-blue-500" : "border-border"
      }`}
    >
      <div className="bg-muted aspect-square relative">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={`${label} layout`}
          fill
          className="object-contain p-2"
        />
      </div>
      <div className="text-center py-2 text-sm bg-muted/50">{label}</div>
    </div>
  );
}
