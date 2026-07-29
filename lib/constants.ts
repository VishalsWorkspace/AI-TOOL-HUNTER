export const CATEGORIES = [
  "All", "Coding", "Writing", "Design", "Video", "Business", "PDF", "Audio", "Research",
];

export const PRICING_FILTERS = ["ALL", "FREE", "FREEMIUM", "PAID"] as const;
export type PricingFilter = (typeof PRICING_FILTERS)[number];
export type PricingBucket = "FREE" | "FREEMIUM" | "PAID" | "UNKNOWN";

export function getPrimaryCategory(tags: string[] | undefined): string | undefined {
  if (!tags) return undefined;
  return CATEGORIES.slice(1).find((cat) =>
    tags.some((tag) => tag.toLowerCase().includes(cat.toLowerCase()))
  );
}

export function classifyPricing(pricing: string | undefined): PricingBucket {
  if (!pricing) return "UNKNOWN";
  const p = pricing.toLowerCase();
  if (p.includes("freemium")) return "FREEMIUM";
  if (p.includes("free")) return "FREE";
  return "PAID";
}

export const USE_CASE_CHIPS = [
  "I want to generate images from text",
  "I need to edit videos with AI",
  "Help me write better code",
];

const SEARCH_STOPWORDS = new Set([
  "i", "want", "to", "need", "help", "me", "the", "a", "an", "with",
  "for", "and", "of", "in", "on", "my", "please", "can", "you", "that",
]);

// Tokenizes a natural-language query into significant words so a chip like
// "I need to edit videos with AI" matches Video-tagged tools instead of
// requiring the full phrase as a literal substring.
export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 1 && !SEARCH_STOPWORDS.has(w));
}
