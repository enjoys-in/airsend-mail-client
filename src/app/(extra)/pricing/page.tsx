import React from "react";
import MainPricing from "./_components/MainPricing";
import PricingPage from "./_components/NewPlans";
import CompetionPricing from "./_components/CompetionPricing";
import ComparePlanDetails from "./_components/ComparePlanDetails";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, HelpCircle, Sparkles, Workflow } from "lucide-react";

export const metadata = {
  title: "Pricing Plans & Comparison - Airsend Suite",
  description:
    "Transparent pricing for Airsend Suite: Mail, Tasks, Files, Workspace, Meet, AI Meeting Bot, and upcoming Workflows automation engine.",
};

const FAQS = [
  {
    q: "Can I connect multiple custom domains?",
    a: "Yes. Even our Free tier supports up to 10 domains, and Startup/Scaler tiers support 25 to 50 domains with full automated DNS validation for MX, SPF, DKIM, and DMARC.",
  },
  {
    q: "How are Tasks, Files, Workspace, and Meet included?",
    a: "Starting in v2.9.0, Airsend bundles ticket management (Tasks), cloud drive storage (Files), Slack + Teams style chat (Workspace), and Google Meet-grade video conferencing directly into your plan with no separate per-seat license fees.",
  },
  {
    q: "What does the AI Meeting Bot do?",
    a: "The AI Meeting Bot joins scheduled or instant Airsend Meet calls, produces real-time transcriptions, summarizes discussions, and automatically logs action items directly into your Tasks boards.",
  },
  {
    q: "When will Workflows & Automation be available?",
    a: "Workflows is currently in active preview (Upcoming) and will roll out to all Scaler, Professional, and Teams tier users with visual low-code DAG pipelines, webhooks, and multi-service connectors.",
  },
  {
    q: "Is there any lock-in or setup fee?",
    a: "No setup fees, no hidden costs. You can switch between monthly and discounted annual billing or cancel at any time directly from your billing settings.",
  },
  {
    q: "Do you offer migration support from Google Workspace or Office 365?",
    a: "Yes! Our team provides automated IMAP migration tools and one-on-one DNS onboarding assistance to ensure zero email downtime during switchover.",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0e12] text-neutral-900 dark:text-neutral-100">
      {/* 1. Core Plans Hero + Tiers */}
      <PricingPage />

      {/* 2. Pay As You Grow / Flexible Scale */}
      <MainPricing />

      {/* 3. Detailed Matrix Feature Comparison */}
      <ComparePlanDetails />

      {/* 4. Competitor Market Comparison */}
      <CompetionPricing />

      {/* 5. Workflows Teaser Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-[85rem] mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-[#141210] to-[#0c0e12] p-8 md:p-12">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-4">
              <Workflow className="size-3.5" /> Upcoming Feature
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
              Visual Workflow Automation &amp; DAG Pipelines
            </h3>
            <p className="mt-3 text-sm md:text-base text-neutral-600 dark:text-neutral-400">
              Trigger automated tasks across emails, webhooks, Slack channels, and database jobs with zero code. All Scaler and Professional accounts will receive early access upon release.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold shadow-md">
                <Link href="/v2/features">
                  Explore Roadmap <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Included in your subscription at no extra cost.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Production SaaS FAQ Section */}
      <section className="py-16 md:py-24 border-t border-neutral-200/60 dark:border-white/5 bg-neutral-50/50 dark:bg-[#0b0d11]">
        <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <Badge
              variant="outline"
              className="mb-3 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
            >
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Got questions? We&apos;ve got answers.
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Everything you need to know about billing, quotas, and suite capabilities.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-6 bg-white dark:bg-[#12141a] border border-neutral-200 dark:border-white/10 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-base font-semibold text-neutral-900 dark:text-white flex items-start gap-2">
                    <HelpCircle className="size-4 text-blue-500 shrink-0 mt-1" />
                    <span>{faq.q}</span>
                  </h4>
                  <p className="mt-2.5 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support CTA */}
          <div className="mt-12 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Have a custom question or need enterprise SLA terms?{" "}
            <a href="mailto:support@airsend.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Talk to our infrastructure team &rarr;
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}