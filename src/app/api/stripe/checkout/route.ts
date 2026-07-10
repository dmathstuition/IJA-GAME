import { NextResponse, type NextRequest } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { priceIdFor } from '@/lib/billing';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Start a subscription: ensure a Stripe customer for the school, then open a
// Checkout session for the chosen plan. Called from the pricing page.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login?next=/pricing', req.url));

  const form = await req.formData();
  const planId = String(form.get('plan') ?? '');
  const priceId = priceIdFor(planId);
  if (!priceId) return NextResponse.json({ error: `Unknown or unconfigured plan: ${planId}` }, { status: 400 });

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, stripe_customer_id')
    .maybeSingle();
  if (!org) return NextResponse.redirect(new URL('/onboarding', req.url));

  const stripe = getStripe();

  let customerId = org.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: org.name,
      metadata: { org_id: org.id },
    });
    customerId = customer.id;
    await supabase.from('organizations').update({ stripe_customer_id: customerId }).eq('id', org.id);
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { metadata: { org_id: org.id, plan: planId } },
    success_url: `${origin}/dashboard/billing?success=1`,
    cancel_url: `${origin}/pricing`,
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
