import React from "react";
import { PricingCard } from "./PricingCard";
import { Badge } from "@/components/ui/badge";

const MainPricing = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-white dark:bg-[#0c0e12]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto relative z-10">
        <div className="mx-auto max-w-2xl mb-12 text-center">
          <Badge
            variant="outline"
            className="mb-3 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
          >
            Flexible Capacity
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Pay As You Grow
          </h2>
          <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
            Need dedicated capacity, specialized SLA support, or on-demand scale without upfront lock-in? Choose our flexible billing packages.
          </p>
        </div>

        <div className="relative xl:w-10/12 xl:mx-auto">
          <PricingCard />
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Prices in INR. Applicable local taxes may apply. 14-day money-back satisfaction guarantee on paid subscriptions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MainPricing;