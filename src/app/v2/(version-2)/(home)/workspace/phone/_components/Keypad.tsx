"use client";

import { Delete, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { looksCallable, sanitizeNumber } from "../_lib/number";

const keys: { digit: string; letters: string }[] = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "*", letters: "" },
  { digit: "0", letters: "+" },
  { digit: "#", letters: "" },
];

interface KeypadProps {
  value: string;
  onChange: (value: string) => void;
  onDial: () => void;
  onDigit?: (digit: string) => void;
  disabled?: boolean;
  showDial?: boolean;
  error?: string;
  pstnEnabled?: boolean;
}

export default function Keypad({ value, onChange, onDial, onDigit, disabled, showDial = true, error, pstnEnabled = true }: KeypadProps) {
  const dialable = looksCallable(value, pstnEnabled);

  const press = (digit: string, letters: string) => {
    onDigit?.(digit);
    if (onDigit) return;
    if (digit === "0" && letters === "+" && value === "") {
      onChange("+");
      return;
    }
    onChange(sanitizeNumber(value + digit));
  };

  return (
    <div className="space-y-3" data-testid="phone-keypad">
      {showDial && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Input
              data-testid="phone-number-input"
              inputMode="tel"
              autoComplete="off"
              placeholder={pstnEnabled ? "Extension or +1 555 010 0100" : "Colleague's extension"}
              value={value}
              disabled={disabled}
              onChange={(event) => onChange(sanitizeNumber(event.target.value))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && dialable && !disabled) onDial();
              }}
              className="h-11 text-center font-mono text-lg tracking-wide"
              aria-label="Phone number"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 shrink-0"
              onClick={() => onChange(value.slice(0, -1))}
              disabled={disabled || value === ""}
              aria-label="Delete last digit"
              data-testid="phone-backspace"
            >
              <Delete className="size-4" />
            </Button>
          </div>
          {error ? (
            <p className="text-xs text-destructive" data-testid="phone-error">
              {error}
            </p>
          ) : value !== "" && !dialable ? (
            <p className="text-xs text-muted-foreground">
              {pstnEnabled
                ? "Enter a colleague's extension, or an outside number in international format such as +14155550100"
                : "Enter a colleague's extension"}
            </p>
          ) : null}
        </div>
      )}

      <div className="mx-auto grid max-w-64 grid-cols-3 gap-2">
        {keys.map(({ digit, letters }) => (
          <Button
            key={digit}
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => press(digit, letters)}
            className="h-14 flex-col gap-0 rounded-xl"
            data-testid={`key-${digit === "*" ? "star" : digit === "#" ? "hash" : digit}`}
          >
            <span className="text-lg font-semibold leading-none">{digit}</span>
            <span className="mt-0.5 h-3 text-[9px] font-medium tracking-widest text-muted-foreground">{letters}</span>
          </Button>
        ))}
      </div>

      {showDial && (
        <Button
          type="button"
          onClick={onDial}
          disabled={disabled || !dialable}
          className="h-12 w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          data-testid="phone-dial"
        >
          <Phone className="size-4" />
          Call
        </Button>
      )}
    </div>
  );
}
