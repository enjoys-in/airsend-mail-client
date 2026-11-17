"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useCalDevStore } from "../../_lib/caldev-store";
import { hexToEventColor } from "../../_lib/caldev-types";
import type { EventColor } from "./types";

interface CalendarContextType {
  // Date management
  currentDate: Date;
  setCurrentDate: (date: Date) => void;

  // Etiquette visibility management
  visibleColors: string[];
  toggleColorVisibility: (color: string) => void;
  isColorVisible: (color: string | undefined) => boolean;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined,
);

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error(
      "useCalendarContext must be used within a CalendarProvider",
    );
  }
  return context;
}

interface CalendarProviderProps {
  children: ReactNode;
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const calendars = useCalDevStore((s) => s.calendars);

  // Initialize visible colors — all default colors active
  const [visibleColors, setVisibleColors] = useState<string[]>([
    "blue", "orange", "violet", "emerald", "rose",
  ]);
  // Calendar ids whose colors have already been applied
  const seenCalendarIdsRef = useRef<Set<string> | null>(null);

  // Sync visible colors from CalDev calendars. The full list is applied on
  // FIRST load only (so manual toggles are preserved); calendars added later
  // (new calendar / subscription) get their color made visible — previously
  // their events stayed hidden until the user toggled the color manually.
  useEffect(() => {
    if (calendars.length === 0) return;

    if (!seenCalendarIdsRef.current) {
      seenCalendarIdsRef.current = new Set(calendars.map((c) => c.id));
      const colors = calendars
        .filter((c) => c.is_visible)
        .map((c) => hexToEventColor(c.color));
      setVisibleColors([...new Set(colors)]);
      return;
    }

    const seen = seenCalendarIdsRef.current;
    const added = calendars.filter((c) => !seen.has(c.id));
    if (added.length === 0) return;
    added.forEach((c) => seen.add(c.id));

    const newColors = added
      .filter((c) => c.is_visible !== false)
      .map((c) => hexToEventColor(c.color));
    if (newColors.length === 0) return;
    setVisibleColors((prev) => {
      const missing = newColors.filter((c) => !prev.includes(c));
      return missing.length ? [...prev, ...new Set(missing)] : prev;
    });
  }, [calendars]);

  // Stable toggle callback
  const toggleColorVisibility = useCallback((color: string) => {
    setVisibleColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color],
    );
  }, []);

  // Stable visibility check — depends on visibleColors
  const isColorVisible = useCallback(
    (color: string | undefined) => {
      if (!color) return true;
      return visibleColors.includes(color);
    },
    [visibleColors],
  );

  // Memoize the context value to prevent unnecessary consumer re-renders
  const value = useMemo(
    () => ({
      currentDate,
      setCurrentDate,
      visibleColors,
      toggleColorVisibility,
      isColorVisible,
    }),
    [currentDate, visibleColors, toggleColorVisibility, isColorVisible],
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}
