// Fun, school-friendly avatars players pick when they join a game.
export const AVATARS = ['🦊', '🐼', '🦉', '🐯', '🐸', '🦁', '🐵', '🐨', '🐧', '🦄', '🐢', '🐝', '🐙', '🦖', '🐬', '🦋'];

/** A stable fallback avatar derived from an id/name when none was chosen. */
export function avatarFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATARS[h % AVATARS.length];
}
