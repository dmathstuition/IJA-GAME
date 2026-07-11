-- ============================================================================
--  Billing: switch from Stripe subscriptions to one-time PayPal activation.
--  Adds a paid-until window and the PayPal order reference. The legacy
--  stripe_* columns are kept (harmless) so no data is lost.
-- ============================================================================

alter table organizations
  add column if not exists paid_until      timestamptz,
  add column if not exists paypal_order_id text;
