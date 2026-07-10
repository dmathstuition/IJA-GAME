import { type ReactNode } from 'react';
import { resolveTheme, themeToCssVars, type Theme } from '@/lib/themes';

// Wraps a tenant surface and paints the school's palette as CSS variables.
// Everything below reads `var(--primary)` etc. — so a school's whole game
// re-skins from one JSON blob with no component edits.
export function ThemeProvider({
  theme,
  children,
}: {
  theme?: Parameters<typeof resolveTheme>[0];
  children: ReactNode;
}) {
  const resolved: Theme = resolveTheme(theme);
  const vars = themeToCssVars(resolved);

  return (
    <div
      data-animation={resolved.animation}
      style={{
        ...(vars as React.CSSProperties),
        minHeight: '100vh',
        background: `linear-gradient(160deg, var(--bg-from), var(--bg-to))`,
        color: 'var(--text)',
      }}
    >
      {children}
    </div>
  );
}
