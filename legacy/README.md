# Legacy reference — original Firebase game

The original single-school STEAM competition, kept for reference while the
Next.js + Supabase rewrite is ported mode-by-mode.

| Original file            | Surface                          | Ported to (new app)        |
| ------------------------ | -------------------------------- | -------------------------- |
| `landing.html`           | Portal / role picker             | `src/app/page.tsx`         |
| _controller_ (`index_3`) | Organiser control panel          | `/host/[sessionId]` (P3–4) |
| _display_ (`index_4`)    | Projector / big screen           | `/display/[code]` (P3)     |
| _participant_ (`index_5`)| Mobile buzzer                    | `/play/[code]` (P3)        |
| _champion_ (`index_6`)   | Winner celebration               | `/champion/[sessionId]` (P5) |

## Firebase → Postgres data map

The whole game lived under one Realtime tree, `quiz/`:

- `quiz/mode`, `quiz/state`, `quiz/currentQuestion` → `game_sessions`
- `quiz/sections` → `question_sets.sections`
- `quiz/players/{id}` → `players`
- `quiz/roundAnswers` → `round_answers`
- `quiz/tb`, `quiz/sp`, `quiz/oral` → `game_sessions.mode_state` (jsonb)
- `quiz/broadcast` → `game_sessions.broadcast`
- `quiz/sessionToken` → `game_sessions.session_token`

See `supabase/migrations/0001_init.sql` for the full schema and RLS policies.
