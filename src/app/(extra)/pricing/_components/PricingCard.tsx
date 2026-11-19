import React from "react";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PricingPlan {
  title: string;
  description: string;
  popular: boolean;
  price: {
    amount: number;
    currency: string;
    billingCycle: string;
  };
  features: {
    name: string;
    available: boolean;
  }[];
  terms: string[];
  cta: {
    text: string;
    primary?: boolean;
  };
}

const PAY_AS_YOU_GO: PricingPlan[] = [
  {
    title: "Professional On-Demand",
    description: "Everything a small startup or growing team needs with flexible monthly scaling.",
    popular: true,
    price: {
      amount: 149.99,
      currency: "INR",
      billingCycle: "monthly",
    },
    features: [
      { name: "Up to 10-50 team members", available: true },
      { name: "Calendar & Scheduling with RSVP", available: true },
      { name: "Workspace Team Chat & Voice Lounges", available: true },
      { name: "Airsend Meet & AI Meeting Bot", available: true },
      { name: "Tasks Ticket Kanban & Cloud Files", available: true },
      { name: "Workflows & Automations (Upcoming)", available: true },
      { name: "Reports & Advanced Deliverability Analytics", available: false },
      { name: "Dedicated IP Whitelist & Relay Cluster", available: false },
    ],
    terms: ["3 days free trial", "No credit card required", "Instant setup"],
    cta: {
      text: "Start free trial",
      primary: true,
    },
  },
  {
    title: "Teams Custom Scale",
    description: "For growing businesses needing enterprise governance and high-volume limits.",
    popular: false,
    price: {
      amount: 260.99,
      currency: "INR",
      billingCycle: "monthly",
    },
    features: [
      { name: "Up to 50-100+ team members", available: true },
      { name: "Service desk & ticket queue management", available: true },
      { name: "Custom domain branding & whitelabeling", available: true },
      { name: "Unlimited AI Meeting Bot hours", available: true },
      { name: "Dedicated relay & IP warm-up support", available: true },
      { name: "Priority 24/7 engineering response", available: true },
      { name: "Workflows & DAG Automation (Upcoming)", available: true },
      { name: "Comprehensive audit logging & retention", available: true },
    ],
    terms: ["1 day free setup trial", "No credit card required", "Custom SLA"],
    cta: {
      text: "Scale with Teams",
      primary: false,
    },
  },
];

export const PricingCard = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {PAY_AS_YOU_GO.map((plan, index) => (
        <div
          key={index}
          className={`relative rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 ${
            plan.popular
              ? "bg-gradient-to-b from-blue-600/10 via-[#12151d] to-[#0d0f14] border-2 border-blue-500/40 shadow-2xl shadow-blue-500/10 ring-1 ring-blue-500/20"
              : "bg-white/80 dark:bg-[#111317]/80 backdrop-blur-md border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 shadow-lg"
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-3.5 right-6">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white px-3 py-1 rounded-full shadow-md">
                <Sparkles className="size-3" /> Most Popular
              </span>
            </div>
          )}

          <div>
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {plan.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {plan.description}
              </p>
            </div>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                ₹{Math.floor(plan.price.amount)}
              </span>
              <span className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">
                .{(plan.price.amount % 1).toFixed(2).split(".")[1]}
              </span>
              <span className="ml-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {plan.price.currency} / {plan.price.billingCycle}
              </span>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-white/5 space-y-3">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  {feature.available ? (
                    <span className="shrink-0 size-5 flex justify-center items-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <Check className="size-3 stroke-[2.5]" />
                    </span>
                  ) : (
                    <span className="shrink-0 size-5 flex justify-center items-center rounded-full text-neutral-400 dark:text-neutral-600">
                      <X className="size-3.5" />
                    </span>
                  )}
                  <span
                    className={
                      feature.available
                        ? "text-neutral-800 dark:text-neutral-200"
                        : "text-neutral-400 dark:text-neutral-500 line-through"
                    }
                  >
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap gap-x-3 gap-y-1">
              {plan.terms.map((term, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  &bull; {term}
                </span>
              ))}
            </div>
            <Button
              asChild
              className={`w-full sm:w-auto px-6 ${
                plan.cta.primary
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-neutral-800 hover:bg-neutral-700 text-white dark:bg-white/10 dark:hover:bg-white/20"
              }`}
            >
              <Link href="/auth/register">
                {plan.cta.text} <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PricingCard;