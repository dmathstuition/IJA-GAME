// ============================================================================
//  Outbound notifications via a Google Apps Script web app.
//  Deploy apps-script/Code.gs as a web app, then set:
//    APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/…/exec
//    APPS_SCRIPT_SECRET=<same shared secret as the script>
//  When unset, notify() is a no-op so the app works without it configured.
//  Server-only — never import from a client component.
// ============================================================================

export type NotifyType = 'welcome' | 'receipt';

export interface NotifyPayload {
  to: string; // recipient email
  name?: string; // recipient / school contact name
  school?: string;
  amount?: string;
  currency?: string;
  plan?: string;
  orderId?: string;
  paidUntil?: string;
}

/** Fire a notification. Best-effort: failures are logged, never thrown, so a
 *  mail hiccup can't break signup or a completed payment. */
export async function notify(type: NotifyType, payload: NotifyPayload): Promise<void> {
  const url = process.env.APPS_SCRIPT_WEBHOOK_URL;
  if (!url) return; // integration not configured
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ secret: process.env.APPS_SCRIPT_SECRET ?? '', type, ...payload }),
    });
  } catch (e) {
    console.error(`notify(${type}) failed:`, (e as Error).message);
  }
}
