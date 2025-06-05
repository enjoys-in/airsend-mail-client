"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  setActiveTab: (id: string) => void
}

export function Tabs({ tabs, activeTab, setActiveTab }: TabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const checkForArrows = () => {
    if (!tabsRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth)
  }

  useEffect(() => {
    checkForArrows()
    window.addEventListener("resize", checkForArrows)
    return () => window.removeEventListener("resize", checkForArrows)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (!tabsRef.current) return

    const scrollAmount = 200
    const newScrollLeft =
      direction === "left" ? tabsRef.current.scrollLeft - scrollAmount : tabsRef.current.scrollLeft + scrollAmount

    tabsRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    })
  }

  const handleTabClick = (id: string) => {
    setActiveTab(id)

    // Scroll the active tab into view if needed
    if (tabsRef.current) {
      const tabElement = tabsRef.current.querySelector(`[data-tab-id="${id}"]`) as HTMLElement
      if (tabElement) {
        const tabRect = tabElement.getBoundingClientRect()
        const containerRect = tabsRef.current.getBoundingClientRect()

        if (tabRect.left < containerRect.left) {
          tabsRef.current.scrollLeft += tabRect.left - containerRect.left - 20
        } else if (tabRect.right > containerRect.right) {
          tabsRef.current.scrollLeft += tabRect.right - containerRect.right + 20
        }
      }
    }
  }

  return (
    <div className="relative border-b">
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div ref={tabsRef} className="flex overflow-x-auto scrollbar-hide" onScroll={checkForArrows}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            className={`px-4 py-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-blue-500 border-b-2 border-blue-500 font-medium"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  )
}
