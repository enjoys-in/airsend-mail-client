import type React from "react";
import { X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type Chip = {
  id: string;
  email: string;
  isValid: boolean;
};

export type RecipientType = "to" | "cc" | "bcc";

type Props = {
  label: string; // "To", "Cc", "Bcc"
  chips: Chip[];
  inputValue: string;
  setInputValue: (val: string) => void;
  removeChip: (id: string, type: RecipientType) => void;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: RecipientType
  ) => void;
  handleBlur: (value: string, type: RecipientType) => void;
  type: RecipientType;
  /** DOM id for the text input (the send button focuses `to-input` when empty) */
  inputId?: string;
  placeholder?: string;
  /** Extra controls rendered on the right of the row (e.g. Cc / Bcc toggles) */
  trailing?: React.ReactNode;
};

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

const getChipDisplay = (raw: string) => parseEmailChip(raw).name || raw;

const getChipInitial = (raw: string) => {
  const { name, address } = parseEmailChip(raw);
  return (name || address).charAt(0).toUpperCase();
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
const avatarColor = (raw: string) => {
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
}: Props) {
  return (
    <div className="group flex items-start gap-3 px-4 py-1.5 border-b border-border/60 transition-colors focus-within:bg-muted/30">
      {/* Label */}
      <label
        htmlFor={inputId}
        className="w-14 shrink-0 pt-[7px] text-xs font-medium text-muted-foreground select-none"
      >
        {label}
      </label>

      <div className="flex flex-1 min-w-0 flex-wrap items-center gap-1.5 min-h-8">
        {chips.map((chip) => {
          const { name, address } = parseEmailChip(chip.email);
          return (
            <Popover key={chip.id}>
              <PopoverTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className={`inline-flex h-6 max-w-[240px] items-center gap-1.5 rounded-full border pl-0.5 pr-1 text-xs font-medium cursor-pointer transition-colors
                    ${
                      chip.isValid
                        ? "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30 text-violet-900 dark:text-violet-100 hover:bg-violet-100 dark:hover:bg-violet-500/20"
                        : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-500/20"
                    }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${
                      chip.isValid ? avatarColor(chip.email) : "bg-red-500"
                    }`}
                  >
                    {getChipInitial(chip.email)}
                  </span>
                  <span className="truncate">{getChipDisplay(chip.email)}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChip(chip.id, type);
                    }}
                    className="shrink-0 rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition"
                    aria-label={`Remove ${chip.email}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" side="bottom" align="start">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback
                      className={`${
                        chip.isValid ? avatarColor(chip.email) : "bg-red-500"
                      } text-lg text-white`}
                    >
                      {getChipInitial(chip.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    {name && <p className="text-sm font-semibold">{name}</p>}
                    <p className="break-all text-xs text-muted-foreground">
                      {address}
                    </p>
                    {!chip.isValid && (
                      <p className="mt-1 text-xs text-red-500">
                        This address looks invalid
                      </p>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}

        {/* Input */}
        <input
          type="email"
          id={inputId}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, type)}
          onBlur={(e) => handleBlur(e.target.value, type)}
          placeholder={
            chips.length === 0
              ? placeholder ?? `Add ${label.toLowerCase()} recipients`
              : ""
          }
          className="h-6 flex-1 min-w-[140px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none"
        />
      </div>

      {trailing && <div className="shrink-0 pt-0.5">{trailing}</div>}
    </div>
  );
}
