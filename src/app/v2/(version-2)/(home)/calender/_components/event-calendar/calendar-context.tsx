"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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
  const [colorsInitialized, setColorsInitialized] = useState(false);

  // Sync visible colors from CalDev calendars — only on FIRST load
  // so manual user toggles are preserved after that.
  useEffect(() => {
    if (calendars.length > 0 && !colorsInitialized) {
      const colors = calendars
        .filter((c) => c.is_visible)
        .map((c) => hexToEventColor(c.color));
      setVisibleColors([...new Set(colors)]);
      setColorsInitialized(true);
    }
  }, [calendars, colorsInitialized]);

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
