'use client';

// Browser Supabase client — used by the live game surfaces (host / play / display)
// for Realtime subscriptions and player writes.
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
