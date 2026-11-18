"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useSettingsPersist } from "@/hooks/use-settings-persist";
import type { IComposingSettings, IDisplay, IPersonalization } from "@/lib/types/get-user-settings-response";
import {
  SettingsPageHeader,
  SettingsSection,
  SettingToggleRow,
  SettingSelectRow,
  SaveSettingsBar,
} from "./shared";
import { Paintbrush, Layout, Type, Columns, Rows, Maximize2, Minimize2, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ---- defaults ---- */
const DEFAULT_COMPOSING: IComposingSettings = {
  composer_mode: "normal",
  conversations_per_page: 50,
  text_direction: "ltr",
  default_font: "Arial",
  default_font_size: 14,
};

const FONT_OPTIONS = [
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Calibri", label: "Calibri" },
  { value: "Georgia", label: "Georgia" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Verdana", label: "Verdana" },
];

const FONT_SIZE_OPTIONS = [
  { value: "12", label: "12 px" },
  { value: "14", label: "14 px" },
  { value: "16", label: "16 px" },
  { value: "18", label: "18 px" },
  { value: "20", label: "20 px" },
];

const CONVERSATION_OPTIONS = [
  { value: "25", label: "25 conversations" },
  { value: "50", label: "50 conversations" },
  { value: "100", label: "100 conversations" },
];

const DIRECTION_OPTIONS = [
  { value: "ltr", label: "Left to Right (LTR)" },
  { value: "rtl", label: "Right to Left (RTL)" },
];

const COMPOSER_MODE_OPTIONS = [
  { value: "normal", label: "Normal (Standard)" },
  { value: "rich", label: "Rich Text (Full formatting)" },
  { value: "plain", label: "Plain Text (Markdown friendly)" },
];

export default function MailAppearance({ email }: { email: string }) {
  const { settings, saveMultiple, isSaving } = useSettingsPersist(email);

  /* local copies for dirty-tracking */
  const [composing, setComposing] = useState<IComposingSettings>(DEFAULT_COMPOSING);
  const [dailyEmails, setDailyEmails] = useState(true);
  const [inboxLayout, setInboxLayout] = useState<"column" | "row">("column");
  const [composerLayout, setComposerLayout] = useState<"normal" | "maximized">("normal");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [dirty, setDirty] = useState(false);

  /* sync from store with safe fallbacks */
  useEffect(() => {
    if (!settings) return;
    if (settings.composing) {
      setComposing({
        composer_mode: settings.composing.composer_mode || DEFAULT_COMPOSING.composer_mode,
        conversations_per_page: Number(settings.composing.conversations_per_page) || DEFAULT_COMPOSING.conversations_per_page,
        text_direction: settings.composing.text_direction || DEFAULT_COMPOSING.text_direction,
        default_font: settings.composing.default_font || DEFAULT_COMPOSING.default_font,
        default_font_size: Number(settings.composing.default_font_size) || DEFAULT_COMPOSING.default_font_size,
      });
    }
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

  const handleReset = () => {
    if (settings?.composing) {
      setComposing({
        composer_mode: settings.composing.composer_mode || DEFAULT_COMPOSING.composer_mode,
        conversations_per_page: Number(settings.composing.conversations_per_page) || DEFAULT_COMPOSING.conversations_per_page,
        text_direction: settings.composing.text_direction || DEFAULT_COMPOSING.text_direction,
        default_font: settings.composing.default_font || DEFAULT_COMPOSING.default_font,
        default_font_size: Number(settings.composing.default_font_size) || DEFAULT_COMPOSING.default_font_size,
      });
    } else {
      setComposing(DEFAULT_COMPOSING);
    }
    setInboxLayout(settings?.display?.showRightSidebar ? "column" : "row");
    setDailyEmails(settings?.personalization?.theme === "dark");
    setDirty(false);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Appearance"
        description="Customize the layout, message density, typography, and composing environment."
        icon={<Paintbrush className="size-5" />}
        badge={<Badge variant="outline" className="text-xs font-normal">Interface</Badge>}
      />

      {/* ---- General Section ---- */}
      <SettingsSection
        title="General Preferences"
        description="Daily summaries and appearance preferences"
        icon={<Sparkles className="size-4" />}
      >
        <SettingToggleRow
          label="Daily email digest & highlights"
          description="Receive a consolidated daily summary of notable emails"
          tooltip="Receive a daily summary of your messages"
          checked={dailyEmails}
          onCheckedChange={(v) => { setDailyEmails(v); markDirty(); }}
        />
      </SettingsSection>

      {/* ---- Composing Section ---- */}
      <SettingsSection
        title="Typography & Composing"
        description="Default text editor mode, fonts, and pagination"
        icon={<Type className="size-4" />}
      >
        <SettingSelectRow
          label="Composer editor mode"
          description="Standard rich text or lightweight markdown-style editor"
          value={composing.composer_mode || DEFAULT_COMPOSING.composer_mode}
          onValueChange={(v) => updateComposing("composer_mode", v as IComposingSettings["composer_mode"])}
          placeholder="Normal (Standard)"
          options={COMPOSER_MODE_OPTIONS}
        />
        <SettingSelectRow
          label="Conversations per page"
          description="How many threads to show per mailbox page"
          value={String(composing.conversations_per_page || DEFAULT_COMPOSING.conversations_per_page)}
          onValueChange={(v) => updateComposing("conversations_per_page", Number(v))}
          placeholder="50 conversations"
          options={CONVERSATION_OPTIONS}
          triggerClassName="sm:w-[170px]"
        />
        <SettingSelectRow
          label="Reading & text direction"
          description="Default direction for message viewing and typing"
          value={composing.text_direction || DEFAULT_COMPOSING.text_direction}
          onValueChange={(v) => updateComposing("text_direction", v as "ltr" | "rtl")}
          placeholder="Left to Right (LTR)"
          options={DIRECTION_OPTIONS}
          triggerClassName="sm:w-[170px]"
        />

        {/* Font family & Font size */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-2 rounded-xl hover:bg-muted/40 transition-colors">
          <div className="space-y-0.5">
            <span className="text-sm sm:text-base font-medium text-foreground">
              Default font family & size
            </span>
            <p className="text-xs text-muted-foreground">
              Applied automatically to newly composed emails
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none">
              <SettingSelectRow
                value={composing.default_font || DEFAULT_COMPOSING.default_font}
                onValueChange={(v) => updateComposing("default_font", v)}
                placeholder="Arial"
                options={FONT_OPTIONS}
                triggerClassName="w-full sm:w-[140px]"
              />
            </div>
            <div className="w-24 sm:w-[95px]">
              <SettingSelectRow
                value={String(composing.default_font_size || DEFAULT_COMPOSING.default_font_size)}
                onValueChange={(v) => updateComposing("default_font_size", Number(v))}
                placeholder="14 px"
                options={FONT_SIZE_OPTIONS}
                triggerClassName="w-full sm:w-[95px]"
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* ---- Layout Section ---- */}
      <SettingsSection
        title="Layout & Panes"
        description="Configure your inbox view split and default composer sizing"
        icon={<Layout className="size-4" />}
      >
        <div className="space-y-6 pt-2">
          {/* Inbox layout */}
          <div className="space-y-3">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Inbox Layout
            </span>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg">
              <VisualLayoutCard
                title="Column Split"
                description="List and reading pane side-by-side"
                icon={<Columns className="size-5" />}
                selected={inboxLayout === "column"}
                onSelect={() => { setInboxLayout("column"); markDirty(); }}
                preview={
                  <div className="w-full h-16 rounded-md bg-muted/60 p-1.5 flex gap-1.5 border border-border/50">
                    <div className="w-1/3 h-full rounded bg-muted-foreground/20 space-y-1 p-1">
                      <div className="w-full h-1.5 bg-muted-foreground/30 rounded" />
                      <div className="w-3/4 h-1.5 bg-muted-foreground/20 rounded" />
                    </div>
                    <div className="flex-1 h-full rounded bg-muted-foreground/10 p-1 space-y-1">
                      <div className="w-1/2 h-2 bg-muted-foreground/30 rounded" />
                      <div className="w-full h-1.5 bg-muted-foreground/20 rounded" />
                      <div className="w-4/5 h-1.5 bg-muted-foreground/20 rounded" />
                    </div>
                  </div>
                }
              />
              <VisualLayoutCard
                title="Row View"
                description="Full-width thread list"
                icon={<Rows className="size-5" />}
                selected={inboxLayout === "row"}
                onSelect={() => { setInboxLayout("row"); markDirty(); }}
                preview={
                  <div className="w-full h-16 rounded-md bg-muted/60 p-1.5 flex flex-col gap-1 border border-border/50 justify-center">
                    <div className="w-full h-2 rounded bg-muted-foreground/25" />
                    <div className="w-full h-2 rounded bg-muted-foreground/20" />
                    <div className="w-full h-2 rounded bg-muted-foreground/15" />
                  </div>
                }
              />
            </div>
          </div>

          {/* Composer layout */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Composer Sizing
            </span>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg">
              <VisualLayoutCard
                title="Normal Window"
                description="Floating bottom-right drawer"
                icon={<Minimize2 className="size-5" />}
                selected={composerLayout === "normal"}
                onSelect={() => { setComposerLayout("normal"); markDirty(); }}
                preview={
                  <div className="w-full h-16 rounded-md bg-muted/60 p-1.5 relative border border-border/50">
                    <div className="absolute bottom-1.5 right-1.5 w-1/2 h-4/5 rounded bg-primary/20 border border-primary/40 flex flex-col p-1 gap-0.5">
                      <div className="w-full h-1 bg-primary/40 rounded" />
                      <div className="w-3/4 h-1 bg-primary/30 rounded" />
                    </div>
                  </div>
                }
              />
              <VisualLayoutCard
                title="Maximized Modal"
                description="Centered modal with focus"
                icon={<Maximize2 className="size-5" />}
                selected={composerLayout === "maximized"}
                onSelect={() => { setComposerLayout("maximized"); markDirty(); }}
                preview={
                  <div className="w-full h-16 rounded-md bg-muted/60 p-1.5 flex items-center justify-center border border-border/50">
                    <div className="w-4/5 h-4/5 rounded bg-primary/20 border border-primary/40 p-1 space-y-1">
                      <div className="w-1/2 h-1 bg-primary/40 rounded" />
                      <div className="w-full h-1 bg-primary/30 rounded" />
                      <div className="w-3/4 h-1 bg-primary/20 rounded" />
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* ---- Density Section ---- */}
      <SettingsSection
        title="Display Density"
        description="Choose the compact spacing between list items and table rows"
        icon={<Paintbrush className="size-4" />}
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg pt-1">
          <VisualLayoutCard
            title="Comfortable"
            description="Generous padding for clarity"
            selected={density === "comfortable"}
            onSelect={() => { setDensity("comfortable"); markDirty(); }}
            preview={
              <div className="w-full h-16 rounded-md bg-muted/60 p-2 flex flex-col justify-around border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary/60 shrink-0" />
                  <div className="h-2 w-full bg-muted-foreground/30 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
                  <div className="h-2 w-3/4 bg-muted-foreground/20 rounded" />
                </div>
              </div>
            }
          />
          <VisualLayoutCard
            title="Compact"
            description="Dense layout for large inboxes"
            selected={density === "compact"}
            onSelect={() => { setDensity("compact"); markDirty(); }}
            preview={
              <div className="w-full h-16 rounded-md bg-muted/60 p-1 flex flex-col justify-between border border-border/50">
                <div className="h-1.5 w-full bg-muted-foreground/30 rounded" />
                <div className="h-1.5 w-5/6 bg-muted-foreground/25 rounded" />
                <div className="h-1.5 w-4/5 bg-muted-foreground/20 rounded" />
                <div className="h-1.5 w-full bg-muted-foreground/15 rounded" />
              </div>
            }
          />
        </div>
      </SettingsSection>

      <SaveSettingsBar onSave={handleSave} onReset={handleReset} show={dirty} isSaving={isSaving} />
    </div>
  );
}

/* ---- Visual layout selector card ---- */
interface VisualLayoutCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  preview: React.ReactNode;
}

const VisualLayoutCard = memo(function VisualLayoutCard({
  title,
  description,
  icon,
  selected,
  onSelect,
  preview,
}: VisualLayoutCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col text-left p-3 rounded-2xl border transition-all duration-150 focus:outline-hidden",
        selected
          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
          : "border-border/70 bg-card/60 hover:border-border hover:bg-muted/40"
      )}
    >
      <div className="mb-2.5 overflow-hidden rounded-lg">
        {preview}
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
          <span className="text-xs sm:text-sm font-semibold truncate text-foreground">
            {title}
          </span>
        </div>
        <div
          className={cn(
            "size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/80 bg-background"
          )}
        >
          {selected && <Check className="size-2.5 stroke-[3]" />}
        </div>
      </div>
      {description && (
        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
          {description}
        </p>
      )}
    </button>
  );
});
