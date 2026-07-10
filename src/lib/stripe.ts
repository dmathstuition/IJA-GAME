import Stripe from 'stripe';

// Lazily constructed so an unset STRIPE_SECRET_KEY doesn't crash the build or
// non-billing routes. Call getStripe() inside handlers, once billing is wired.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }
  return _stripe;
}

export const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER,
  school: process.env.STRIPE_PRICE_SCHOOL,
};
