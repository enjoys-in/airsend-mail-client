"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { NavItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { useClickAway } from "@/hooks/use-click-away";
import { cn } from "@/lib/utils";
import {
  ProductsMegaMenu,
  MobileProductsAccordion,
} from "./products-mega-menu";

const data: NavItem[] = [
  {
    route: "/pricing",
    label: "Pricing",
  },
  {
    route: "/features",
    label: "Features",
  },
  {
    route: "/about",
    label: "About",
  },
  {
    route: "https://github.com/Mullayam/node-mail-server",
    label: "Github",
  },
];

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  const { currAccount } = useAppSelector((state) => state.accounts);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setIsMobileProductsOpen(false);
    }
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsProductsOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsProductsOpen(false);
    }, 180);
  };

  useClickAway(navContainerRef, () => {
    setIsProductsOpen(false);
    setIsMenuOpen(false);
    setIsMobileProductsOpen(false);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProductsOpen(false);
        setIsMenuOpen(false);
        setIsMobileProductsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const menuVariants = {
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <nav className="relative mx-auto flex items-center justify-center bg-transparent px-4 pt-3 md:pt-6">
      <div
        ref={navContainerRef}
        className="relative flex items-center rounded-full border-secondary/30 border-[1px] bg-[#31343cfe] max-w-[92vw] md:max-w-4xl pl-3 pr-0.5 py-0.5 shadow-lg backdrop-blur-md"
      >
        <Link
          href="/"
          className="pr-3 pl-1 md:border-r-2 md:border-secondary flex items-center shrink-0"
        >
          <Image
            src="/navbar-logo.png"
            height={64}
            width={180}
            alt="logo"
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2.5 ml-auto">
          {/* Products Mega Menu Trigger (Beside Pricing) */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIsProductsOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full hover:scale-105 text-sm lg:text-base text-white transition-all duration-150 cursor-pointer select-none",
                isProductsOpen && "bg-white/10"
              )}
              aria-expanded={isProductsOpen}
            >
              <span>Products</span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-neutral-400 transition-transform duration-200",
                  isProductsOpen && "rotate-180 text-white"
                )}
              />
            </button>
          </div>

          {/* Pricing, Features, About, Github */}
          {data.map(({ route, label }) => (
            <Link
              key={label}
              href={route}
              className="px-3 py-2 rounded-full hover:scale-105 text-sm lg:text-base text-white transition-all duration-150"
            >
              {label}
            </Link>
          ))}

          <Link href={currAccount ? "/v2/u/mail/inbox" : "/v2"}>
            <Button className="min-w-[80px] rounded-full bg-[#5a61ff] py-2 dark:text-white dark:bg-pink-500 hover:bg-blue-500 text-sm font-medium truncate max-w-[120px]">
              {currAccount ? currAccount.name : "Login"}
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center ml-auto">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Mega Menu Dropdown */}
        <ProductsMegaMenu
          isOpen={isProductsOpen}
          onClose={() => setIsProductsOpen(false)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-1/2 -translate-x-1/2 max-w-sm w-[92vw] bg-[#31343cfe] border-secondary/30 border-[1px] rounded-2xl mt-2 px-4 py-4 shadow-xl z-50 backdrop-blur-xl"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <div className="flex flex-col space-y-2">
              {/* Products Accordion for Mobile */}
              <MobileProductsAccordion
                isOpen={isMobileProductsOpen}
                onToggle={() => setIsMobileProductsOpen((prev) => !prev)}
                onItemClick={() => {
                  setIsMenuOpen(false);
                  setIsMobileProductsOpen(false);
                }}
              />

              {/* Regular Navigation Links */}
              {data.map(({ route, label }) => (
                <Link
                  key={label}
                  href={route}
                  className="block px-4 py-2 rounded-lg text-white hover:bg-gray-700 hover:text-blue-400 transition-colors text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              <Link
                href={currAccount ? "/v2/u/mail/inbox" : "/v2"}
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full rounded-full bg-blue-700 dark:text-white dark:bg-pink-500 hover:bg-blue-500 text-sm font-medium py-2">
                  {currAccount ? currAccount.name : "Login"}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
