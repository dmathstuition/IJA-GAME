import { NextResponse, type NextRequest } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Open the Stripe Customer Portal so a school can change plan, update card, or
// cancel — no billing UI for us to build.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', req.url));

  const { data: org } = await supabase.from('organizations').select('stripe_customer_id').maybeSingle();
  if (!org?.stripe_customer_id) return NextResponse.redirect(new URL('/pricing', req.url));

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const portal = await getStripe().billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${origin}/dashboard/billing`,
  });

  return NextResponse.redirect(portal.url, { status: 303 });
}
