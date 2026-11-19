'use client';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface PricingTierFrequency {
  id: string;
  value: string;
  label: string;
  priceSuffix: string;
  discount?: string;
}

export interface PricingTier {
  name: string;
  id: string;
  href: string;
  discountPrice: string | Record<string, string>;
  price: string | Record<string, string>;
  description: string | React.ReactNode;
  features: string[];
  featured?: boolean;
  highlighted?: boolean;
  cta: string;
  soldOut?: boolean;
  tag?: string;
}

export const frequencies: PricingTierFrequency[] = [
  { id: '1', value: '1', label: 'Monthly', priceSuffix: '/mo' },
  { id: '2', value: '2', label: 'Quarterly', priceSuffix: '/qtr', discount: 'Save 10%' },
  { id: '3', value: '3', label: 'Annually', priceSuffix: '/yr', discount: 'Save 20%' },
];

export const tiers: PricingTier[] = [
  {
    name: 'Free',
    id: '0',
    href: '/h-panel',
    price: { '1': '₹0', '2': '₹0', '3': '₹0' },
    discountPrice: { '1': '', '2': '', '3': '' },
    description: 'Get all essentials for free, no credit card required.',
    features: [
      '5 Domains',
      '300 emails per day',
      '10 Mailboxes',
      '1 GB of storage per mailbox',
      '100 MB Email Attachments',
      '10 Email Templates',
      'Basic Analytics & 24/7 Support',
      'SMTP & Web Client Access',
      'API Access (3-10 reqs/min)',
      'Queued Delivery',
      'Tasks & Cloud Files Access',
      'Workflows & Automations (Upcoming)',
    ],
    featured: false,
    highlighted: false,
    soldOut: false,
    cta: 'Sign Up Free',
  },
  {
    name: 'Startup',
    id: '1',
    href: '/h-panel',
    price: { '1': '₹29.9', '2': '₹99', '3': '₹225' },
    discountPrice: { '1': '₹49', '2': '₹149', '3': '₹349' },
    description: 'When you grow and need more power, domains, and speed.',
    tag: 'MOST POPULAR',
    features: [
      'Unlimited Domains',
      '600 emails per day',
      '25 Mailboxes',
      '25 GB storage per mailbox',
      '500 MB Email Attachments',
      '25 Email Templates',
      'Incoming & Outgoing Delivery Logs',
      'Full SMTP & Web Client',
      'API Access (25-50 reqs/min)',
      'Real-Time Mail Delivery',
      'Airsend Meet & Workspace Channels',
      'Workflows & Automations (Upcoming)',
    ],
    featured: true,
    highlighted: true,
    soldOut: false,
    cta: 'Get Started with Startup',
  },
  {
    name: 'Scaler',
    id: '2',
    href: '/h-panel',
    price: { '1': '₹44.99', '2': '₹179.88', '3': '₹499' },
    discountPrice: { '1': '₹79', '2': '₹299', '3': '₹799' },
    description: 'Higher volume, complete IMAP sync, and analytics.',
    features: [
      'Unlimited Domains',
      '850 emails per day',
      '50 Mailboxes',
      '50 GB storage per mailbox',
      'No Limit on Attachments',
      'Unlimited Email Templates',
      'Mail Event & Tracking Analytics',
      'Incoming & Outgoing Audit Logs',
      'Full SMTP & IMAP Client Support',
      'High-Throughput API Access',
      'Airsend Meet with Meeting Bot',
      'Workflows & Automations (Upcoming)',
    ],
    featured: false,
    highlighted: false,
    soldOut: false,
    cta: 'Upgrade to Scaler',
  },
  {
    name: 'Professional',
    id: '3',
    href: '/h-panel',
    price: { '1': '₹149.99', '2': '₹449', '3': '₹1,499' },
    discountPrice: { '1': '₹249', '2': '₹749', '3': '₹2,499' },
    description: 'Complete workspace power for teams & high-deliverability ops.',
    tag: 'PRO SUITE',
    features: [
      'Unlimited Domains & Mailboxes',
      'Unlimited Storage Quota',
      'Calendar & Multi-User Scheduling',
      'Workspace Team Chat & Voice Lounges',
      'Dedicated IP & Bounce Isolation',
      'DKIM, DMARC & BIMI Verification',
      'ReBAC Roles & Permissions',
      'Airsend Meet + Meeting Bot Included',
      'Priority Support SLA',
      'Workflows & Automations (Upcoming)',
    ],
    featured: false,
    highlighted: false,
    soldOut: false,
    cta: 'Start Pro Trial',
  },
];

export const CheckIcon = ({ className }: { className?: string }) => {
  return <CheckCircle2 className={cn('size-4 shrink-0', className)} />;
};

export default function PricingPage() {
  const [frequency, setFrequency] = useState(frequencies[0]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* ── Top Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-4 shadow-sm">
            <Sparkles className="size-3.5" />
            <span>Transparent Pricing • All Features Included</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Simple, Predictable Plans for{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Every Team
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            From solo creators to fast-scaling engineering teams. Full access to Webmail, Tasks, Files, Workspace, Airsend Meet, and our upcoming Workflow Automation engine.
          </p>

          {/* ── Frequency Toggle ── */}
          <div className="mt-8 inline-flex items-center p-1 rounded-2xl bg-[#14161f] border border-white/10 shadow-lg">
            {frequencies.map((option) => {
              const isSelected = frequency.value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFrequency(option)}
                  className={cn(
                    'relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5',
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <span>{option.label}</span>
                  {option.discount && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.2 rounded-full border',
                        isSelected
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      )}
                    >
                      {option.discount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Pricing Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {tiers.map((tier) => {
            const currentPrice =
              typeof tier.price === 'string'
                ? tier.price
                : tier.price[frequency.value] || tier.price['1'];
            const currentDiscount =
              typeof tier.discountPrice === 'object'
                ? tier.discountPrice[frequency.value]
                : tier.discountPrice;

            return (
              <div
                key={tier.id}
                className={cn(
                  'relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 shadow-xl',
                  tier.highlighted
                    ? 'border-2 border-blue-500/60 bg-gradient-to-b from-[#181d2e]/95 via-[#13151f]/95 to-[#0f1118]/95 shadow-blue-950/40 ring-1 ring-blue-500/30 -translate-y-1'
                    : 'border border-white/10 bg-[#12141a]/90 hover:border-white/20 hover:bg-[#151720]/95'
                )}
              >
                {/* Popular Pill */}
                {tier.tag && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px] tracking-wider uppercase px-3 py-0.5 shadow-md shadow-blue-600/30 border border-blue-400/40">
                      {tier.tag}
                    </Badge>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {tier.name}
                    </h3>
                  </div>

                  <p className="text-xs text-neutral-400 min-h-[36px] leading-relaxed">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="my-5 pt-4 border-t border-white/10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                        {currentPrice}
                      </span>
                      {currentDiscount && (
                        <span className="text-xs text-neutral-500 line-through">
                          {currentDiscount}
                        </span>
                      )}
                      <span className="text-xs text-neutral-400 font-medium">
                        {tier.price === '₹0' ? 'forever' : frequency.priceSuffix}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      Billed {frequency.label.toLowerCase()} in INR
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Button
                    asChild
                    className={cn(
                      'w-full h-11 rounded-xl text-xs font-semibold shadow-md transition-all',
                      tier.highlighted
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    )}
                  >
                    <Link href={tier.href}>
                      {tier.cta}
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </Link>
                  </Button>

                  {/* Feature Checklist */}
                  <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                      Included in {tier.name}
                    </span>
                    {tier.features.map((feature) => {
                      const isUpcoming = feature.toLowerCase().includes('upcoming');
                      return (
                        <div
                          key={feature}
                          className="flex items-start gap-2 text-xs text-neutral-300 leading-relaxed"
                        >
                          <CheckCircle2 className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span className={cn(isUpcoming && 'text-purple-300 font-medium')}>
                            {feature}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3 text-emerald-400" />
                    <span>No hidden fees</span>
                  </span>
                  <span>Instant setup</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Enterprise Custom Note ── */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-[#14161f]/80 p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[10px]">
                Teams & Custom Volume
              </Badge>
              <span className="text-xs text-neutral-400">• Dedicated Infrastructure</span>
            </div>
            <h4 className="text-lg font-bold text-white">
              Need custom limits, multi-tenant setups, or on-premise relay?
            </h4>
            <p className="text-xs text-neutral-400 max-w-xl">
              We offer bespoke plans with dedicated IP pools, custom rate limits, custom SLA guarantees, and enterprise webhook integrations.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 px-6 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold shrink-0"
          >
            <Link href="/contact-us">Talk to Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
