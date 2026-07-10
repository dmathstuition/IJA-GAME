import { NextResponse, type NextRequest } from 'next/server';

// ── Tenant resolution ────────────────────────────────────────────────────────
// Resolve the school from the subdomain ({slug}.quizarena.app) and expose it to
// the app as the `x-tenant-slug` header. The apex + `www` are the marketing site.
//
// Next step (P1): after resolving the tenant, also refresh the Supabase auth
// session here and gate `/host/*` on an active subscription.
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get('host') ?? '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'quizarena.app';

  const hostname = host.split(':')[0];
  const isApex = hostname === rootDomain || hostname === `www.${rootDomain}`;
  const isLocal = hostname === 'localhost' || hostname.endsWith('.localhost');

  let slug: string | null = null;
  if (!isApex) {
    if (hostname.endsWith(`.${rootDomain}`)) {
      slug = hostname.replace(`.${rootDomain}`, '');
    } else if (isLocal && hostname.endsWith('.localhost')) {
      slug = hostname.replace('.localhost', '');
    }
  }

  const res = NextResponse.next();
  if (slug) res.headers.set('x-tenant-slug', slug);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
