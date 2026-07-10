import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { canHostLive } from '@/lib/billing';

// Two jobs on every request:
//  1. Resolve the tenant (school) from the subdomain → `x-tenant-slug`.
//  2. Refresh the Supabase auth session cookies so server components see the user.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  // ── 1. Tenant ──────────────────────────────────────────────────────────────
  const host = (req.headers.get('host') ?? '').split(':')[0];
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'quizarena.app';
  const isApex = host === rootDomain || host === `www.${rootDomain}`;
  let slug: string | null = null;
  if (!isApex) {
    if (host.endsWith(`.${rootDomain}`)) slug = host.replace(`.${rootDomain}`, '');
    else if (host.endsWith('.localhost')) slug = host.replace('.localhost', '');
  }
  if (slug) res.headers.set('x-tenant-slug', slug);

  // ── 2. Auth session refresh ─────────────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Gate: hosting a live game needs an account + active plan ─────────────────
  const path = req.nextUrl.pathname;
  const needsOrganiser = path.startsWith('/dashboard') || path.startsWith('/host');
  if (needsOrganiser && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // Hosting a live game requires a trial or paid plan (question editing stays open).
  // Fail-open if the status can't be read, so a transient error never locks a host out.
  if (path.startsWith('/host') && user) {
    const { data: org } = await supabase.from('organizations').select('subscription_status').maybeSingle();
    if (org && !canHostLive(org.subscription_status)) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard/billing';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
