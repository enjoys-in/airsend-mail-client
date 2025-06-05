"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";

const data: NavItem[] = [
  {
    route: "/temp-mail",
    label: "Temp Mail",
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
  const { currAccount } = useAppSelector((state) => state.accounts);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuVariants = {
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <nav className="mx-auto sticky z-20 top-0 pt-4 md:pt-8 flex items-center justify-center bg-transparent">
      <div className="flex items-center rounded-full border-secondary/30 border-[1px] bg-[#31343cfe] max-w-[90vw] md:max-w-3xl">
        <Link href="/" className="pr-2 md:border-r-2 md:border-secondary">
          <Image
            src="/navbar-logo.png"
            height={64}
            width={180}
            alt="logo"
          />
        </Link>

        <div className="hidden md:flex items-center gap-3 ml-auto">
          {data.map(({ route, label }) => (
            <Link
              key={label}
              href={route}
              className="px-3 py-2 rounded-full hover:scale-105 text-base text-white"
            >
              {label}
            </Link>
          ))}

          <Link href={currAccount ? "/v2/u/mail/inbox" : "/v2"}>
            <Button className="w-full rounded-full bg-[#5a61ff] py-2 dark:text-white dark:bg-pink-500 hover:bg-blue-500 text-sm font-medium ">
              {currAccount ? currAccount.name : "Login"}
            </Button>
          </Link>
        </div>

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
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full -translate-x-1/2 max-w-sm w-full bg-[#31343cfe] border-secondary/30 border-[1px] rounded-b-2xl mt-1 px-4 py-4 shadow-lg"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <div className="flex flex-col space-y-2">
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
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full rounded-full bg-blue-700 dark:text-white dark:bg-pink-500 hover:bg-blue-500 text-sm font-medium py-2">
                  Login
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};