"use client";

import React from "react";
import { Check, X, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Competitor {
  name: string;
  badge?: string;
  plan_name: string;
  monthlyCost: string;
  domains: string;
  mailboxes: string;
  perDayEmail: string;
  storage: string;
  suiteCollab: string;
  workflows: string;
  highlight?: boolean;
}

const COMPARISON_DATA: Competitor[] = [
  {
    name: "Airsend Suite",
    badge: "All-in-One",
    plan_name: "Startup / Scaler",
    monthlyCost: "₹29 / mo",
    domains: "Up to 50",
    mailboxes: "Unlimited",
    perDayEmail: "600 – 1,000+",
    storage: "25 – 50 GB+",
    suiteCollab: "Included (Workspace + Meet + Tasks + Files)",
    workflows: "Upcoming (Included)",
    highlight: true,
  },
  {
    name: "Google Workspace",
    plan_name: "Business Starter",
    monthlyCost: "₹650+ / user/mo",
    domains: "1",
    mailboxes: "1 per user seat",
    perDayEmail: "2,000",
    storage: "30 GB pooled",
    suiteCollab: "Separate licensing",
    workflows: "Scripting / add-on",
  },
  {
    name: "MS Office 365",
    plan_name: "Business Basic",
    monthlyCost: "₹500+ / user/mo",
    domains: "1",
    mailboxes: "1 per user seat",
    perDayEmail: "10,000 (Internal)",
    storage: "50 GB",
    suiteCollab: "Teams bundled",
    workflows: "Power Automate (Complex)",
  },
  {
    name: "Zoho Mail",
    plan_name: "Mail Lite",
    monthlyCost: "₹99+ / user/mo",
    domains: "1",
    mailboxes: "Up to 5",
    perDayEmail: "300",
    storage: "5 GB",
    suiteCollab: "Add-on fees",
    workflows: "Zoho Flow (Separate)",
  },
  {
    name: "Resend",
    plan_name: "Hobby / Pro",
    monthlyCost: "$20+ (₹1,600+)",
    domains: "1 – 5",
    mailboxes: "API only (No Webmail)",
    perDayEmail: "100 / day (Hobby)",
    storage: "Log storage only",
    suiteCollab: "None (Developer API only)",
    workflows: "Webhooks only",
  },
  {
    name: "Hostinger / GoDaddy",
    plan_name: "Business Email",
    monthlyCost: "₹150+ / user/mo",
    domains: "1",
    mailboxes: "Per mailbox cost",
    perDayEmail: "250 – 500",
    storage: "10 GB",
    suiteCollab: "Basic webmail only",
    workflows: "Not supported",
  },
];

export const CompetionPricing = () => {
  return (
    <section className="relative py-16 md:py-24 bg-white dark:bg-[#0c0e12] overflow-hidden">
      {/* Background glow for SaaS aesthetic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto relative z-10">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <Badge
            variant="outline"
            className="mb-3 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
          >
            Market Comparison
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Why teams choose Airsend over legacy providers
          </h2>
          <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
            Stop paying per-seat tax across 5 different subscriptions. Get mail delivery, Slack-style workspace, Google Meet-grade calls, tasks, files, and upcoming workflows in one unified hub.
          </p>
        </div>

        {/* Matrix comparison cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPARISON_DATA.map((item, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between ${
                item.highlight
                  ? "bg-gradient-to-b from-blue-600/10 via-[#11141c] to-[#0e1015] border-2 border-blue-500/40 shadow-2xl shadow-blue-500/10 ring-1 ring-blue-500/20"
                  : "bg-white/80 dark:bg-[#111317]/80 backdrop-blur-md border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 shadow-sm"
              }`}
            >
              {item.highlight && (
                <div className="absolute -top-3 left-6">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white px-3 py-1 rounded-full shadow-md">
                    <Sparkles className="size-3" /> {item.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      {item.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Tier: {item.plan_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-base font-bold ${item.highlight ? "text-blue-500 dark:text-blue-400" : "text-neutral-900 dark:text-white"}`}>
                      {item.monthlyCost}
                    </div>
                  </div>
                </div>

                {/* Features breakdown */}
                <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-white/5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 dark:text-neutral-400">Custom Domains</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-200">{item.domains}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 dark:text-neutral-400">Mailboxes</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-200">{item.mailboxes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 dark:text-neutral-400">Daily Email Volume</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-200">{item.perDayEmail}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 dark:text-neutral-400">Storage Included</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-200">{item.storage}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2 pt-2 border-t border-neutral-100 dark:border-white/5">
                    <span className="text-neutral-500 dark:text-neutral-400">Team Collab Suite</span>
                    <span className={`text-right font-medium ${item.highlight ? "text-emerald-500 dark:text-emerald-400" : "text-neutral-700 dark:text-neutral-300"}`}>
                      {item.suiteCollab}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-neutral-500 dark:text-neutral-400">Workflows &amp; Automation</span>
                    <span className={`text-right font-medium ${item.highlight ? "text-amber-500 dark:text-amber-400" : "text-neutral-500 dark:text-neutral-400"}`}>
                      {item.workflows}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom CTA / Status */}
              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-white/5">
                {item.highlight ? (
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25">
                    <Link href="/auth/register">
                      Get Started with Airsend <ArrowRight className="size-4 ml-1.5" />
                    </Link>
                  </Button>
                ) : (
                  <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 py-1">
                    Requires multiple separate add-ons
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompetionPricing;