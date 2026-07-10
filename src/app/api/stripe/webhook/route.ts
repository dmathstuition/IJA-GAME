import { NextResponse, type NextRequest } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Stripe webhook → keep each school's subscription status current.
// Uses the service-role key (bypasses RLS) because there's no user session here.
const admin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  const db = admin();

  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as unknown as { customer: string | { id: string }; status: string; id: string };
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

      await db
        .from('organizations')
        .update({
          subscription_status: mapStatus(sub.status),
          stripe_subscription_id: sub.id,
        })
        .eq('stripe_customer_id', customerId);
      break;
    }
    default:
      // Unhandled event types are fine to ignore.
      break;
  }

  return NextResponse.json({ received: true });
}

function mapStatus(stripeStatus: string): string {
  const map: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'incomplete',
  };
  return map[stripeStatus] ?? 'incomplete';
}
