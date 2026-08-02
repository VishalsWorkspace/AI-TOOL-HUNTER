import Link from "next/link";
import type { Metadata } from "next";
import { Check, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "List your AI tool for free, or get discovered faster with a Verified Badge or Featured Placement on AI Tool Hunter.",
};

interface Tier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Free Listing",
    price: "₹0",
    description: "Get your tool discovered by the community, no strings attached.",
    features: [
      "Standard tool listing",
      "Appears in search & category pages",
      "Basic tool profile (description, link, tags)",
      "Community reviews & ratings",
    ],
    cta: "Submit Your Tool",
    href: "/#submit",
  },
  {
    name: "Verified Badge",
    price: "$49",
    period: "/mo",
    description: "Build trust instantly with a verified checkmark on your listing.",
    features: [
      "Everything in Free Listing",
      "Verified badge on your tool card",
      "Priority placement in category results",
      "Direct listing update requests",
      "Email support",
    ],
    cta: "Get Verified",
    href: "https://checkout.stripe.com/pay/PLACEHOLDER_VERIFIED_BADGE",
  },
  {
    name: "Featured Placement",
    price: "$149",
    period: "/mo",
    description: "Maximum visibility — front and center where hunters look first.",
    features: [
      "Everything in Verified Badge",
      "Featured on homepage trending row",
      "Top placement in relevant searches",
      "Included in weekly newsletter shoutout",
      "Priority support",
    ],
    cta: "Get Featured",
    href: "https://checkout.stripe.com/pay/PLACEHOLDER_FEATURED_PLACEMENT",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 mb-4">
            <Terminal className="h-3 w-3 text-emerald-500" /> Pricing
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Get your tool in front of the right hunters.
          </h1>
          <p className="mt-3 text-zinc-400">
            Free to list. Pay only if you want more visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative flex flex-col rounded-xl border bg-zinc-950 p-8 transition-colors",
                tier.highlighted
                  ? "border-emerald-500/50 shadow-[0_0_40px_-12px_rgba(16,185,129,0.35)]"
                  : "border-zinc-800 hover:border-zinc-700"
              )}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] uppercase font-bold tracking-wide">
                  Most Popular
                </span>
              )}

              <h2 className="text-sm uppercase font-bold tracking-wide text-zinc-400">
                {tier.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                {tier.period && <span className="text-zinc-500 text-sm">{tier.period}</span>}
              </div>

              <p className="mt-3 text-sm text-zinc-400 min-h-[40px]">{tier.description}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={cn(
                  "mt-8 inline-flex items-center justify-center rounded-md h-10 px-6 text-sm font-medium transition-colors",
                  tier.highlighted
                    ? "bg-emerald-500 text-black hover:bg-emerald-400"
                    : "bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800"
                )}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-zinc-600">
          Prices in USD unless noted. Cancel anytime. Questions? Reach out via the submit form.
        </p>
      </div>
    </main>
  );
}
