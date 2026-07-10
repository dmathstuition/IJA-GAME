import { headers } from 'next/headers';
import { resolveTheme, type Theme } from '@/lib/themes';

/** The school slug for the current request, set by middleware from the subdomain. */
export async function getTenantSlug(): Promise<string | null> {
  const h = await headers();
  return h.get('x-tenant-slug');
}

export interface TenantContext {
  id: string;
  slug: string;
  name: string;
  theme: Theme;
  subscriptionStatus: string;
}

/** Public tenant lookup (no auth needed) — used to theme player/display surfaces. */
export async function getTenantBySlug(
  supabase: { from: (t: string) => any },
  slug: string,
): Promise<TenantContext | null> {
  const { data } = await supabase
    .from('organizations')
    .select('id, slug, name, theme, subscription_status')
    .eq('slug', slug)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    theme: resolveTheme(data.theme ?? undefined),
    subscriptionStatus: data.subscription_status,
  };
}
