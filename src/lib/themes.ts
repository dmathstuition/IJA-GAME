// ============================================================================
//  Theme registry — per-school branding.
//  A school stores { preset, palette?, animation? } on organizations.theme.
//  Presets give a one-click look; palette/animation let them override.
//  Colours are emitted as CSS custom properties by <ThemeProvider>, so the
//  entire game re-skins with zero component changes.
// ============================================================================

export type AnimationStyle = 'steam' | 'confetti' | 'bubbles' | 'neon' | 'minimal';

export interface Palette {
  bg: string; // page background base
  bgGradientFrom: string;
  bgGradientTo: string;
  primary: string; // main brand / buttons
  accent: string; // celebration / gold highlight
  correct: string;
  wrong: string;
  text: string;
  textDim: string;
}

export interface Theme {
  id: string;
  name: string;
  animation: AnimationStyle;
  palette: Palette;
}

export const THEME_PRESETS: Record<string, Theme> = {
  steam: {
    id: 'steam',
    name: 'STEAM Arena',
    animation: 'steam',
    palette: {
      bg: '#1a0006',
      bgGradientFrom: '#3d0010',
      bgGradientTo: '#1a0006',
      primary: '#CC0022',
      accent: '#FFD600',
      correct: '#00C853',
      wrong: '#E8192F',
      text: '#FFE8E8',
      textDim: '#A7788A',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Scholar',
    animation: 'bubbles',
    palette: {
      bg: '#04121f',
      bgGradientFrom: '#0a2b4a',
      bgGradientTo: '#04121f',
      primary: '#2563eb',
      accent: '#22d3ee',
      correct: '#a3e635',
      wrong: '#f43f5e',
      text: '#e6f4ff',
      textDim: '#6f97b8',
    },
  },
  savanna: {
    id: 'savanna',
    name: 'Savanna Gold',
    animation: 'confetti',
    palette: {
      bg: '#1a0f02',
      bgGradientFrom: '#3a2408',
      bgGradientTo: '#1a0f02',
      primary: '#f59e0b',
      accent: '#ef4444',
      correct: '#84cc16',
      wrong: '#dc2626',
      text: '#fff4e0',
      textDim: '#b39868',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Neon',
    animation: 'neon',
    palette: {
      bg: '#07060f',
      bgGradientFrom: '#160a2e',
      bgGradientTo: '#07060f',
      primary: '#8b5cf6',
      accent: '#22d3ee',
      correct: '#34d399',
      wrong: '#fb7185',
      text: '#ece8ff',
      textDim: '#8a83a8',
    },
  },
  slate: {
    id: 'slate',
    name: 'Clean Slate',
    animation: 'minimal',
    palette: {
      bg: '#0f1419',
      bgGradientFrom: '#1a222c',
      bgGradientTo: '#0f1419',
      primary: '#0ea5e9',
      accent: '#f59e0b',
      correct: '#22c55e',
      wrong: '#ef4444',
      text: '#e8eef5',
      textDim: '#7c8896',
    },
  },
};

export const DEFAULT_THEME = THEME_PRESETS.steam;

/** Resolve an organizations.theme JSON blob into a full Theme. */
export function resolveTheme(stored?: {
  preset?: string;
  palette?: Partial<Palette>;
  animation?: AnimationStyle;
}): Theme {
  const base = (stored?.preset && THEME_PRESETS[stored.preset]) || DEFAULT_THEME;
  return {
    ...base,
    animation: stored?.animation ?? base.animation,
    palette: { ...base.palette, ...(stored?.palette ?? {}) },
  };
}

/** Palette → CSS custom properties for injection into a style attribute. */
export function themeToCssVars(theme: Theme): Record<string, string> {
  const p = theme.palette;
  return {
    '--bg': p.bg,
    '--bg-from': p.bgGradientFrom,
    '--bg-to': p.bgGradientTo,
    '--primary': p.primary,
    '--accent': p.accent,
    '--correct': p.correct,
    '--wrong': p.wrong,
    '--text': p.text,
    '--text-dim': p.textDim,
  };
}
