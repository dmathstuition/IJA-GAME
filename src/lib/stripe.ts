import Stripe from 'stripe';

// Server-only Stripe client. Used by the checkout + customer-portal route
// handlers (P1) and the webhook that keeps organizations.subscription_status
// in sync.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  school: process.env.STRIPE_PRICE_SCHOOL!,
};
