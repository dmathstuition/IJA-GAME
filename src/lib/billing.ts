// Plan catalogue — the source of truth for pricing UI and checkout.
// Price IDs come from Stripe (create the products/prices, then set the env vars).
export interface Plan {
  id: 'starter' | 'school';
  name: string;
  price: string;
  cadence: string;
  priceEnv: string; // env var holding the Stripe price id
  features: string[];
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    cadence: '/month',
    priceEnv: 'STRIPE_PRICE_STARTER',
    features: ['Standard + Speed modes', 'Up to 60 players', '1 theme preset'],
  },
  {
    id: 'school',
    name: 'School',
    price: '$49',
    cadence: '/month',
    priceEnv: 'STRIPE_PRICE_SCHOOL',
    features: ['All 4 game modes', 'Up to 200 players', 'Custom branding', 'CSV + PDF exports'],
    featured: true,
  },
];

export function priceIdFor(planId: string): string | undefined {
  const plan = PLANS.find((p) => p.id === planId);
  return plan ? process.env[plan.priceEnv] : undefined;
}

/** A school can host a live game only while trialing or paid-up. */
export function canHostLive(status: string | null | undefined): boolean {
  return status === 'trialing' || status === 'active';
}
