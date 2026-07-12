import { NextResponse, type NextRequest } from 'next/server';
import { planById } from '@/lib/billing';
import { captureOrder } from '@/lib/paypal';
import { createClient } from '@/lib/supabase/server';
import { notify } from '@/lib/notify';

export const dynamic = 'force-dynamic';

// PayPal redirects the payer back here after approval (?token=ORDER_ID&plan=..).
// We capture the order and, on success, activate the school for the plan window.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get('token');
  const planId = url.searchParams.get('plan') ?? '';
  const plan = planById(planId);
  if (!orderId || !plan) {
    return NextResponse.redirect(new URL('/dashboard/billing?error=Missing+order', req.url), { status: 303 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login?next=/dashboard/billing', req.url), { status: 303 });

  const { data: org } = await supabase.from('organizations').select('id, name').maybeSingle();
  if (!org) return NextResponse.redirect(new URL('/onboarding', req.url), { status: 303 });

  try {
    const result = await captureOrder(orderId);
    // Guard against tampering: the captured order must reference this org.
    if (!result.completed || (result.referenceId && result.referenceId !== org.id)) {
      return NextResponse.redirect(new URL('/dashboard/billing?error=Payment+not+completed', req.url), { status: 303 });
    }

    const paidUntil = new Date(Date.now() + plan.durationDays * 86400_000).toISOString();
    await supabase
      .from('organizations')
      .update({
        subscription_status: 'active',
        plan: plan.id,
        paid_until: paidUntil,
        paypal_order_id: orderId,
      })
      .eq('id', org.id);

    // Email a receipt (best-effort; no-op if the mailer isn't configured).
    if (user.email) {
      await notify('receipt', {
        to: user.email,
        school: org.name ?? undefined,
        amount: plan.amount,
        currency: plan.currency,
        plan: plan.name,
        orderId,
        paidUntil,
      });
    }

    return NextResponse.redirect(new URL('/dashboard/billing?success=1', req.url), { status: 303 });
  } catch (e) {
    return NextResponse.redirect(new URL(`/dashboard/billing?error=${encodeURIComponent((e as Error).message)}`, req.url), { status: 303 });
  }
}
