import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Sign the organiser out. Status 303 turns the POST into a GET redirect —
// a default (307) redirect would re-POST to /login, which only serves GET
// and returns a 405, showing the user an error instead of the login page.
async function signOut(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', req.url), { status: 303 });
}

export async function POST(req: NextRequest) {
  return signOut(req);
}

// Also allow GET so a plain link (or a browser retry) can sign out too.
export async function GET(req: NextRequest) {
  return signOut(req);
}
