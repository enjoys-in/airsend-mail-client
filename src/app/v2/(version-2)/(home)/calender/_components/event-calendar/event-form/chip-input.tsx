"use client";

import { RiCloseLine } from "@remixicon/react";
import { Input } from "@/components/ui/input";
import { bareInputClass } from "./primitives";

/** Inline tag editor: chips followed by a borderless input (Enter adds). */
export function ChipInput({
  values,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
  placeholder,
  ariaLabel,
}: {
  values: string[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <div className="flex min-h-9 flex-wrap items-center gap-1.5">
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex h-7 items-center gap-1 rounded-md bg-muted/80 pl-2.5 pr-1 text-xs font-medium"
        >
          {v}
          <button
            type="button"
            onClick={() => onRemove(v)}
            className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label={`Remove ${v}`}
          >
            <RiCloseLine size={12} />
          </button>
        </span>
      ))}
      <Input
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
        placeholder={values.length ? "" : placeholder}
        aria-label={ariaLabel}
        className={`${bareInputClass} w-auto min-w-[8rem] flex-1`}
      />
    </div>
  );
}
