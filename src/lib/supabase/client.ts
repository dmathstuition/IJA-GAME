'use client';

// Browser Supabase client — Realtime subscriptions + player writes.
import { createBrowserClient } from '@supabase/ssr';

// Untyped for now; run `npm run db:types` and add the <Database> generic to get
// full table typing once the schema settles.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
