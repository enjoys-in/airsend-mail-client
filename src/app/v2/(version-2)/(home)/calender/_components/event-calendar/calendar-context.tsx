"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

  // Initialize visible colors from CalDev calendars (visible ones)
  const [visibleColors, setVisibleColors] = useState<string[]>([
    "blue", "orange", "violet", "emerald", "rose",
  ]);

  // Sync visible colors when calendars load from API
  useEffect(() => {
    if (calendars.length > 0) {
      const colors = calendars
        .filter((c) => c.is_visible)
        .map((c) => hexToEventColor(c.color));
      // Deduplicate
      setVisibleColors([...new Set(colors)]);
    }
  }, [calendars]);

  // Toggle visibility of a color
  const toggleColorVisibility = (color: string) => {
    setVisibleColors((prev) => {
      if (prev.includes(color)) {
        return prev.filter((c) => c !== color);
      } else {
        return [...prev, color];
      }
    });
  };

  // Check if a color is visible
  const isColorVisible = (color: string | undefined) => {
    if (!color) return true;
    return visibleColors.includes(color);
  };

  const value = {
    currentDate,
    setCurrentDate,
    visibleColors,
    toggleColorVisibility,
    isColorVisible,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}
