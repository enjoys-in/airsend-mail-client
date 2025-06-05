"use client";

import { useState } from "react";
import { cn } from "@/lib/utils"; // or just use clsx/classnames if you don't have a helper

export default function TabSlideTransition() {
  const [activeTab, setActiveTab] = useState<"Mailbox" | "Settings">("Mailbox");

  return (
    <div className="relative w-full max-w-3xl h-96 overflow-hidden border rounded shadow bg-white dark:bg-neutral-900">
      {/* Tab Buttons */}
      <div className="flex space-x-2 p-2 bg-gray-100 dark:bg-neutral-800 border-b">
        <button
          onClick={() => setActiveTab("Mailbox")}
          className={cn(
            "px-4 py-2 text-sm rounded",
            activeTab === "Mailbox" ? "bg-blue-500 text-white" : "bg-white dark:bg-neutral-800 text-gray-700"
          )}
        >
          Mailbox
        </button>
        <button
          onClick={() => setActiveTab("Settings")}
          className={cn(
            "px-4 py-2 text-sm rounded",
            activeTab === "Settings" ? "bg-blue-500 text-white" : "bg-white dark:bg-neutral-800 text-gray-700"
          )}
        >
          Settings
        </button>
      </div>

      {/* Sliding Panels */}
      <div className="relative w-full h-full">
        <div
          className={cn(
            "absolute w-full h-full transition-transform duration-500 ease-in-out",
            activeTab === "Mailbox" ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Mailbox Panel */}
          <div className="p-6 w-full h-full bg-white dark:bg-neutral-900">
            <h2 className="text-xl font-semibold">Mailbox</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Here are your folders and messages.</p>
          </div>
        </div>

        <div
          className={cn(
            "absolute w-full h-full transition-transform duration-500 ease-in-out",
            activeTab === "Settings" ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Settings Panel */}
          <div className="p-6 w-full h-full bg-white dark:bg-neutral-900">
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Here are your preferences.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
