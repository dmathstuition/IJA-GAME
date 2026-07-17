import { NextResponse, type NextRequest } from 'next/server';
import { planById } from '@/lib/billing';
import { createOrder } from '@/lib/paypal';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Start a one-time PayPal activation: create an order for the chosen plan and
// redirect the organiser to PayPal's approval page. Capture happens on return.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login?next=/pricing', req.url), { status: 303 });

  const form = await req.formData();
  const planId = String(form.get('plan') ?? '');
  const plan = planById(planId);
  if (!plan) return NextResponse.json({ error: `Unknown plan: ${planId}` }, { status: 400 });

  const { data: org } = await supabase.from('organizations').select('id, name').maybeSingle();
  if (!org) return NextResponse.redirect(new URL('/onboarding', req.url), { status: 303 });

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  try {
    const { approveUrl } = await createOrder({
      amount: plan.amount,
      currency: plan.currency,
      description: `Quizzard ${plan.name} — ${org.name}`,
      referenceId: org.id,
      brandName: 'Quizzard',
      returnUrl: `${origin}/api/paypal/capture?plan=${plan.id}`,
      cancelUrl: `${origin}/dashboard/billing?cancelled=1`,
    });
    return NextResponse.redirect(approveUrl, { status: 303 });
  } catch (e) {
    return NextResponse.redirect(new URL(`/dashboard/billing?error=${encodeURIComponent((e as Error).message)}`, req.url), { status: 303 });
  }
}
