"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// GifPicker — search & select GIFs via Tenor API
// ---------------------------------------------------------------------------

const TENOR_API_KEY = (typeof window !== 'undefined' && (window as any).__RUNTIME_CONFIG__?.TENOR_API_KEY) || process.env.TENOR_API_KEY || "";

interface TenorGif {
  id: string;
  title: string;
  media_formats: {
    tinygif?: { url: string; dims: [number, number] };
    gif?: { url: string; dims: [number, number] };
    mediumgif?: { url: string; dims: [number, number] };
  };
}

interface TenorResponse {
  results: TenorGif[];
  next: string;
}

// Trending tags to show when no search
const TRENDING_TAGS = [
  "Excited", "LOL", "Thank you", "Thumbs up", "Sad",
  "Clapping", "Mind blown", "Deal with it", "High five", "Mic drop",
];

interface GifPickerProps {
  onSelect: (url: string, alt: string) => void;
  trigger?: React.ReactNode;
}

export default function GifPicker({ onSelect, trigger }: GifPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGifs = useCallback(async (query: string) => {
    if (!TENOR_API_KEY) {
      setError("Tenor API key not configured");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = query.trim()
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=24&media_filter=tinygif,gif`
        : `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=24&media_filter=tinygif,gif`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch GIFs");

      const data: TenorResponse = await res.json();
      setGifs(data.results ?? []);
    } catch (err) {
      setError("Failed to load GIFs");
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load featured on open
  useEffect(() => {
    if (open && TENOR_API_KEY) fetchGifs("");
  }, [open, fetchGifs]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGifs(search);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, open, fetchGifs]);

  const handleSelect = (gif: TenorGif) => {
    const url =
      gif.media_formats.gif?.url ??
      gif.media_formats.mediumgif?.url ??
      gif.media_formats.tinygif?.url ??
      "";
    onSelect(url, gif.title);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="size-7" title="GIF">
            <span className="text-[10px] font-bold">GIF</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-96 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Search */}
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Tenor..."
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

        {/* Trending tags */}
        {!search && (
          <div className="flex flex-wrap gap-1.5 border-b px-2 py-1.5">
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearch(tag)}
                className="rounded-full border border-border/40 px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* GIF grid */}
        <ScrollArea className="h-72">
          {!TENOR_API_KEY ? (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  GIF search not configured
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Add NEXT_PUBLIC_TENOR_API_KEY to your environment
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex h-full items-center justify-center p-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : gifs.length === 0 ? (
            <div className="flex h-full items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">No GIFs found</p>
            </div>
          ) : (
            <div className="columns-2 gap-1 p-2">
              {gifs.map((gif) => {
                const preview =
                  gif.media_formats.tinygif?.url ?? gif.media_formats.gif?.url;
                if (!preview) return null;
                return (
                  <button
                    key={gif.id}
                    onClick={() => handleSelect(gif)}
                    className="mb-1 w-full overflow-hidden rounded-md transition-opacity hover:opacity-80"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={gif.title}
                      loading="lazy"
                      className="w-full rounded-md"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Powered by Tenor */}
        {TENOR_API_KEY && (
          <div className="border-t px-3 py-1 text-right">
            <span className="text-[9px] text-muted-foreground/60">
              Powered by Tenor
            </span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
