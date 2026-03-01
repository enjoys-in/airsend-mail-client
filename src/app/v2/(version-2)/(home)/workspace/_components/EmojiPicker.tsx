"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// EmojiPicker — categorized emoji selection panel
// ---------------------------------------------------------------------------

interface EmojiCategory {
  name: string;
  icon: string;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: "Smileys",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
      "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
      "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫",
      "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏", "😒",
      "🙄", "😬", "😮‍💨", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷",
      "🤒", "🤕", "🤢", "🤮", "🥵", "🥶", "🥴", "😵", "🤯", "🤠",
    ],
  },
  {
    name: "Gestures",
    icon: "👋",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "👌",
      "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "🖕", "👇", "☝️", "🫵", "👍", "👎", "✊", "👊", "🤛",
      "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🙏", "💪", "🦾", "🦿",
    ],
  },
  {
    name: "Hearts",
    icon: "❤️",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
      "💟", "♥️", "🫀", "💋", "💯", "🔥", "⭐", "🌟", "✨", "💫",
    ],
  },
  {
    name: "Objects",
    icon: "🎉",
    emojis: [
      "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "⚽", "🏀",
      "🎯", "🎮", "🎲", "🧩", "🎪", "🎭", "🎨", "🎬", "🎤", "🎧",
      "🎵", "🎶", "🎸", "🥁", "🎹", "🎺", "🎷", "🪗", "💻", "📱",
      "📧", "✉️", "📝", "📌", "📎", "🔗", "📚", "📖", "🔔", "🔕",
    ],
  },
  {
    name: "Nature",
    icon: "🌿",
    emojis: [
      "🌿", "🍀", "🌱", "🌲", "🌳", "🌴", "🌵", "🌾", "🌻", "🌺",
      "🌹", "🌸", "🌼", "🌷", "💐", "🍄", "🐶", "🐱", "🐭", "🐹",
      "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸",
    ],
  },
  {
    name: "Food",
    icon: "🍕",
    emojis: [
      "🍕", "🍔", "🌭", "🍟", "🌮", "🌯", "🥗", "🍝", "🍜", "🍲",
      "🍣", "🍱", "🍩", "🍪", "🎂", "🍰", "🧁", "🍫", "🍬", "🍭",
      "☕", "🍵", "🧃", "🥤", "🍺", "🍻", "🥂", "🍷", "🍸", "🧊",
    ],
  },
];

const FREQUENTLY_USED = ["👍", "❤️", "😂", "😍", "🔥", "✅", "🎉", "🚀", "💯", "👀", "🙏", "💪"];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

export default function EmojiPicker({ onSelect, trigger }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return EMOJI_CATEGORIES;
    // Simple search — for a production app you'd use emoji-datasource
    return EMOJI_CATEGORIES.map((cat) => ({
      ...cat,
      emojis: cat.emojis.filter(() => true), // all match since we can't search by name with raw emojis
    })).filter((cat) => cat.emojis.length > 0);
  }, [search]);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="size-7">
            <span className="text-base">😀</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-80 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Search */}
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search emoji..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 pl-7 pr-7 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-0.5 border-b px-2 py-1">
          {EMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              title={cat.name}
              className={cn(
                "flex size-7 items-center justify-center rounded text-sm transition-colors",
                activeCategory === i
                  ? "bg-accent"
                  : "hover:bg-accent/50",
              )}
            >
              {cat.icon}
            </button>
          ))}
        </div>

        <ScrollArea className="h-56">
          <div className="p-2">
            {/* Frequently used */}
            {!search && (
              <>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Frequently Used
                </p>
                <div className="mb-3 grid grid-cols-8 gap-0.5">
                  {FREQUENTLY_USED.map((emoji) => (
                    <button
                      key={`freq-${emoji}`}
                      onClick={() => handleSelect(emoji)}
                      className="flex size-8 items-center justify-center rounded text-lg transition-colors hover:bg-accent"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Categories */}
            {filteredCategories.map((cat, i) => (
              <div
                key={cat.name}
                className={cn(!search && i !== activeCategory && "hidden")}
              >
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat.name}
                </p>
                <div className="mb-3 grid grid-cols-8 gap-0.5">
                  {cat.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSelect(emoji)}
                      className="flex size-8 items-center justify-center rounded text-lg transition-colors hover:bg-accent"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Quick reaction bar for message hover actions
export function QuickReactionBar({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
  return (
    <div className="flex items-center gap-0.5">
      {quickEmojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="flex size-6 items-center justify-center rounded text-sm transition-colors hover:bg-accent"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
