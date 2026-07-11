// ============================================================================
//  Shared domain types — the shape of a quiz, ported from the Firebase game.
//  Kept framework-agnostic so host / play / display / dashboard all import it.
// ============================================================================

export type Choice = 'A' | 'B' | 'C' | 'D';

export type GameMode = 'standard' | 'team' | 'speed' | 'oral';

export type GameState =
  | 'lobby'
  | 'section_intro'
  | 'question_active'
  | 'time_up'
  | 'reveal'
  | 'leaderboard'
  | 'section_leaderboard'
  | 'ended';

export interface Question {
  text: string;
  options: Record<Choice, string>;
  answer: Choice;
  timeLimit: number; // seconds
  // Oral "theory" questions have no A–D options: the learner answers aloud and
  // the host judges it. `kind` defaults to 'mcq' when omitted; `solution` holds
  // the model answer shown on reveal.
  kind?: 'mcq' | 'theory';
  solution?: string;
}

/** A question as it sits live on the session (with server clock anchor). */
export interface ActiveQuestion extends Question {
  qIndex: number;
  startTime: number; // server ms — clients compute remaining from this
}

export interface Section {
  name: string;
  questions: Question[];
}

export interface QuestionSet {
  id: string;
  orgId: string;
  name: string;
  sections: Section[];
}

// ── Team battle ─────────────────────────────────────────────────────────────
export interface Team {
  name: string;
  score: number;
}

export interface TeamModeState {
  teams: [Team, Team];
  bank: Question[];
  used: number[];
  activeTeam: 0 | 1;
  isBonus: boolean;
  lock: { playerId: string; choice: Choice } | null;
}

// ── Speed battle ────────────────────────────────────────────────────────────
export interface SpeedModeState {
  bank: Question[];
  runnerId: string | null;
}

// ── Oral round ──────────────────────────────────────────────────────────────
export interface OralGroup {
  name: string;
  score: number;
}
export interface OralModeState {
  bank: Question[];
  groups: [OralGroup, OralGroup];
  used: number[];
  lastResult: unknown;
}

// ── Players ─────────────────────────────────────────────────────────────────
export interface Player {
  id: string;
  sessionId: string;
  name: string;
  score: number;
  answered: boolean;
  lastAnswer: Choice | null;
  lastCorrect: boolean | null;
  sectionScores: Record<number, number>;
  team: number; // 0 | 1 | -1
  spState: 'waiting' | 'running' | 'done';
}

// ── Session ─────────────────────────────────────────────────────────────────
export interface GameSession {
  id: string;
  orgId: string;
  joinCode: string;
  mode: GameMode;
  state: GameState;
  questionSetId: string | null;
  currentSection: number;
  currentQIndex: number;
  currentQuestion: ActiveQuestion | null;
  activeTeam: number;
  isBonus: boolean;
  modeState: TeamModeState | SpeedModeState | OralModeState | Record<string, never>;
  broadcast: { text: string; ts: number } | null;
  sessionToken: string;
}
