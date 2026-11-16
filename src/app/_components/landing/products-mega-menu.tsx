"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Mail,
  Terminal,
  Send,
  ShieldCheck,
  Users,
  Calendar,
  BookOpen,
  Sparkles,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductItem {
  id: string;
  title: string;
  tag?: string;
  description: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const PRODUCTS: ProductItem[] = [
  {
    id: "webmail",
    title: "Webmail Client",
    tag: "ENCRYPTED",
    description:
      "End-to-end encrypted inbox, sieve filters, smart categorization & custom aliases.",
    route: "/v2",
    icon: Mail,
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    id: "api",
    title: "Email API & Relay",
    tag: "DEVELOPERS",
    description:
      "High-deliverability REST API, webhooks, and custom SMTP relay for transactional emails.",
    route: "/docs/getting-started",
    icon: Terminal,
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "campaigns",
    title: "Email Campaigns",
    tag: "MARKETING",
    description:
      "Drag-and-drop template designer, automated drip sequences, and deliverability insights.",
    route: "/features",
    icon: Send,
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    id: "disposable",
    title: "Disposable Mail",
    tag: "PRIVACY",
    description:
      "Instant temporary inboxes and custom domain hosting for burner email addresses.",
    route: "/features",
    icon: ShieldCheck,
    iconBg: "bg-purple-500/10 border-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    id: "workspaces",
    title: "Workspaces & Teams",
    tag: "TEAMS",
    description:
      "Multi-domain management, ReBAC permissions, and shared team mailboxes.",
    route: "/features",
    icon: Users,
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    id: "calendar",
    title: "Calendar & Scheduling",
    tag: "CALDAV",
    description:
      "CalDAV integrated calendar, event reminders, and team meeting scheduling.",
    route: "/docs/calendar",
    icon: Calendar,
    iconBg: "bg-pink-500/10 border-pink-500/20",
    iconColor: "text-pink-400",
  },
];

interface ProductsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ProductsMegaMenu = ({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: ProductsMegaMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 w-[740px] max-w-[94vw]"
        >
          {/* Card Container with solid opaque background */}
          <div
            style={{ backgroundColor: "#1a1d26" }}
            className="rounded-2xl border border-white/10 bg-[#1a1d26] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] text-white"
          >
            {/* 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {PRODUCTS.map((product) => (
                <Link
                  key={product.id}
                  href={product.route}
                  onClick={onClose}
                  className="group/item flex items-start gap-3.5 p-3 rounded-xl transition-all duration-150 hover:bg-white/[0.06] hover:scale-[1.01]"
                >
                  <div
                    className={cn(
                      "p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover/item:scale-110",
                      product.iconBg
                    )}
                  >
                    <product.icon className={cn("w-5 h-5", product.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white group-hover/item:text-blue-400 transition-colors">
                        {product.title}
                      </span>
                      {product.tag && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                          {product.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Platform Quick Links Footer */}
            <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-2 font-medium text-neutral-300">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Airsend Platform</span>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/docs"
                  onClick={onClose}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Docs & API</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500" />
                </Link>
                <Link
                  href="/change-logs"
                  onClick={onClose}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Changelog</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500" />
                </Link>
                <Link
                  href="/how-we-handle-mails"
                  onClick={onClose}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Security</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface MobileProductsAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  onItemClick: () => void;
}

export const MobileProductsAccordion = ({
  isOpen,
  onToggle,
  onItemClick,
}: MobileProductsAccordionProps) => {
  return (
    <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm font-medium text-white hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>Products</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            6 Apps
          </span>
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-neutral-400 transition-transform duration-200",
            isOpen && "rotate-180 text-white"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5 px-2 py-2 space-y-1"
          >
            {PRODUCTS.map((product) => (
              <Link
                key={product.id}
                href={product.route}
                onClick={onItemClick}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs text-neutral-300 hover:text-white transition-colors"
              >
                <div
                  className={cn(
                    "p-1.5 rounded-md border shrink-0",
                    product.iconBg
                  )}
                >
                  <product.icon
                    className={cn("w-3.5 h-3.5", product.iconColor)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {product.title}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {product.tag}
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
