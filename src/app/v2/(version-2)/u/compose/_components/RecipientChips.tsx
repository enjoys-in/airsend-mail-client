import type React from "react";
import { X, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type Chip = {
  id: string;
  email: string;
  isValid: boolean;
};

export type RecipientType = "to" | "cc" | "bcc" | string;

export interface RecipientChipsProps {
  label: string; // "To", "Cc", "Bcc", etc.
  chips: Chip[];
  inputValue: string;
  setInputValue: (val: string) => void;
  removeChip: (id: string, type: any) => void;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: any
  ) => void;
  handleBlur: (value: string, type: any) => void;
  type: RecipientType;
  /** DOM id for the text input */
  inputId?: string;
  placeholder?: string;
  /** Extra controls rendered on the right of the row (e.g. Cc / Bcc toggles) */
  trailing?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/** Parse "Name <email>" format — returns { name, address } or just { address } for plain emails */
export function parseEmailChip(raw: string): {
  name: string | null;
  address: string;
} {
  const match = raw.match(/^(.+?)\s*<([^\s@]+@[^\s@]+\.[^\s@]+)>$/);
  if (match) {
    return { name: match[1].trim(), address: match[2] };
  }
  return { name: null, address: raw };
}

export const getChipDisplay = (raw: string) => parseEmailChip(raw).name || raw;

export const getChipInitial = (raw: string) => {
  const { name, address } = parseEmailChip(raw);
  return (name || address || "?").charAt(0).toUpperCase();
};

/** Stable avatar colour per address so the same person always looks the same */
const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-fuchsia-500",
  "bg-teal-500",
  "bg-indigo-500",
];

export const avatarColor = (raw: string) => {
  const key = parseEmailChip(raw).address;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function RecipientChips({
  label,
  chips,
  inputValue,
  setInputValue,
  removeChip,
  handleKeyDown,
  handleBlur,
  type,
  inputId,
  placeholder,
  trailing,
  className,
  disabled = false,
}: RecipientChipsProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-3.5 py-1.5 border-b border-border/50 transition-colors duration-150 focus-within:bg-muted/20",
        className
      )}
    >
      {/* Label */}
      <label
        htmlFor={inputId}
        className="w-12 shrink-0 pt-1 text-xs font-medium text-muted-foreground/80 select-none tracking-tight"
      >
        {label}
      </label>

      {/* Chips container & input */}
      <div className="flex flex-1 min-w-0 flex-wrap items-center gap-1.5 min-h-[30px]">
        {chips.map((chip) => {
          const { name, address } = parseEmailChip(chip.email);
          return (
            <Popover key={chip.id}>
              <PopoverTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "inline-flex h-[26px] max-w-[260px] items-center gap-1.5 rounded-full border pl-1 pr-1.5 text-xs font-medium cursor-pointer transition-all duration-150 select-none shadow-xs",
                    chip.isValid
                      ? "bg-muted/60 dark:bg-muted/30 border-border/70 text-foreground hover:bg-muted hover:border-border"
                      : "bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/15"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white",
                      chip.isValid ? avatarColor(chip.email) : "bg-destructive"
                    )}
                  >
                    {chip.isValid ? (
                      getChipInitial(chip.email)
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                  </span>
                  <span className="truncate max-w-[180px] text-xs">
                    {getChipDisplay(chip.email)}
                  </span>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChip(chip.id, type);
                    }}
                    className="shrink-0 rounded-full p-0.5 text-muted-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-colors"
                    aria-label={`Remove ${chip.email}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-68 p-3 shadow-lg rounded-xl border-border/80" side="bottom" align="start">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Avatar className="h-12 w-12 ring-2 ring-border/50">
                    <AvatarFallback
                      className={cn(
                        "text-lg font-semibold text-white",
                        chip.isValid ? avatarColor(chip.email) : "bg-destructive"
                      )}
                    >
                      {getChipInitial(chip.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 w-full">
                    {name && (
                      <p className="text-sm font-semibold truncate text-foreground">
                        {name}
                      </p>
                    )}
                    <p className="break-all text-xs text-muted-foreground mt-0.5">
                      {address}
                    </p>
                    {!chip.isValid && (
                      <p className="mt-1.5 text-xs text-destructive font-medium flex items-center justify-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        This email address appears invalid
                      </p>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}

        {/* Text input */}
        <input
          type="email"
          id={inputId}
          disabled={disabled}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, type)}
          onBlur={(e) => handleBlur(e.target.value, type)}
          placeholder={
            chips.length === 0
              ? placeholder ?? `Add ${label.toLowerCase()} recipients`
              : ""
          }
          className="h-6.5 flex-1 min-w-[140px] bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 outline-none disabled:cursor-not-allowed"
        />
      </div>

      {trailing && <div className="shrink-0 pt-0.5">{trailing}</div>}
    </div>
  );
}
