// Plan catalogue — the source of truth for pricing UI and PayPal checkout.
// One-time activation model: a school pays once to unlock live hosting for a
// period (durationDays), rather than a recurring subscription.
export interface Plan {
  id: 'term' | 'annual';
  name: string;
  price: string; // display string
  amount: string; // PayPal amount, e.g. "99.00"
  currency: string;
  cadence: string; // display, e.g. "per term"
  durationDays: number; // how long the activation lasts
  features: string[];
  featured?: boolean;
}

export const CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? 'USD';

export const PLANS: Plan[] = [
  {
    id: 'term',
    name: 'Term pass',
    price: '$99',
    amount: '99.00',
    currency: CURRENCY,
    cadence: 'one-time · 120 days',
    durationDays: 120,
    features: ['All 4 game modes', 'Up to 120 players', 'JSON import & exports'],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$249',
    amount: '249.00',
    currency: CURRENCY,
    cadence: 'one-time · 365 days',
    durationDays: 365,
    features: ['All 4 game modes', 'Up to 250 players', 'Custom branding', 'Priority email support'],
    featured: true,
  },
];

export function planById(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}

/** A school can host a live game while paid-up or in an unexpired trial. */
export function canHostLive(
  status: string | null | undefined,
  paidUntil?: string | null,
  trialEndsAt?: string | null,
): boolean {
  if (status === 'trialing') {
    // A trial only unlocks hosting until it ends. No end date → treat as open.
    if (!trialEndsAt) return true;
    return new Date(trialEndsAt).getTime() > Date.now();
  }
  if (status === 'active') {
    if (!paidUntil) return true;
    return new Date(paidUntil).getTime() > Date.now();
  }
  return false;
}

/** True when the org is on a trial whose end date has already passed. */
export function isTrialExpired(status: string | null | undefined, trialEndsAt?: string | null): boolean {
  return status === 'trialing' && !!trialEndsAt && new Date(trialEndsAt).getTime() <= Date.now();
}
