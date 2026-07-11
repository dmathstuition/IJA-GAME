// ============================================================================
//  PayPal Orders API (v2) helper — one-time activation checkout.
//  Server-only: uses client-credentials OAuth with the REST app secret.
//  Set PAYPAL_ENV=live for production; defaults to sandbox.
// ============================================================================

const BASE =
  (process.env.PAYPAL_ENV ?? 'sandbox').toLowerCase() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

function creds() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are not set');
  return { id, secret };
}

/** Fetch an OAuth access token via client credentials. */
async function accessToken(): Promise<string> {
  const { id, secret } = creds();
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export interface CreateOrderArgs {
  amount: string;
  currency: string;
  description: string;
  referenceId: string; // org id
  returnUrl: string;
  cancelUrl: string;
  brandName?: string;
}

/** Create a CAPTURE order and return { id, approveUrl }. */
export async function createOrder(a: CreateOrderArgs): Promise<{ id: string; approveUrl: string }> {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: a.referenceId,
          description: a.description,
          amount: { currency_code: a.currency, value: a.amount },
        },
      ],
      application_context: {
        brand_name: a.brandName ?? 'QuizArena',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
        return_url: a.returnUrl,
        cancel_url: a.cancelUrl,
      },
    }),
  });
  if (!res.ok) throw new Error(`PayPal create-order failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { id: string; links: { rel: string; href: string }[] };
  const approve = json.links.find((l) => l.rel === 'approve' || l.rel === 'payer-action');
  if (!approve) throw new Error('PayPal did not return an approval link');
  return { id: json.id, approveUrl: approve.href };
}

export interface CaptureResult {
  completed: boolean;
  orderId: string;
  referenceId?: string;
}

/** Capture an approved order. Returns whether it completed. */
export async function captureOrder(orderId: string): Promise<CaptureResult> {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`PayPal capture failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { status: string; purchase_units?: { reference_id?: string }[] };
  return {
    completed: json.status === 'COMPLETED',
    orderId,
    referenceId: json.purchase_units?.[0]?.reference_id,
  };
}
