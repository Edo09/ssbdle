import { z } from 'zod'

/** Game modes available in the UI. */
export type Mode = 'daily' | 'arcade' | 'trivia'

/** How many guesses a daily / arcade board allows before it's a loss. */
export const MAX_GUESSES = 8

/* ----------------------------- Characters ----------------------------- */

export const CharacterSchema = z.object({
  id: z.number(),
  name: z.string(),
  game_name: z.string(),
  universe: z.string(),
  gender: z.string(),
  smash_debut: z.string(),
  fighter_type: z.string(),
  fighter_number: z.number(),
  is_echo: z.boolean(),
  weight: z.number(),
  weight_class: z.string(),
  debut_year: z.number(),
  source_platform: z.string().nullable().optional(),
  smash_debut_num: z.coerce.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
})
export type Character = z.infer<typeof CharacterSchema>

/* --------------------------- Guess results ---------------------------- */

export const AttrStatusSchema = z.enum(['correct', 'partial', 'wrong'])
export type AttrStatus = z.infer<typeof AttrStatusSchema>

export const DirectionSchema = z.enum(['up', 'down', 'equal'])
export type Direction = z.infer<typeof DirectionSchema>

export const AttributeSchema = z.object({
  key: z.string(),
  label: z.string(),
  guess: z.union([z.string(), z.number()]),
  status: AttrStatusSchema,
  direction: DirectionSchema.optional(),
})
export type Attribute = z.infer<typeof AttributeSchema>

export const GuessResultSchema = z.object({
  correct: z.boolean(),
  guess: z.object({
    id: z.number(),
    name: z.string(),
    game_name: z.string(),
  }),
  attributes: z.array(AttributeSchema),
  puzzle_date: z.string().optional(),
  round_id: z.string().optional(),
  guesses: z.number().optional(),
})
export type GuessResult = z.infer<typeof GuessResultSchema>

/** A signed-in player's stored daily outcome (from user_daily_results). */
export const DailyResultSchema = z.object({
  puzzle_date: z.string(),
  guesses: z.number(),
  solved: z.boolean(),
  finished: z.boolean(),
  guessed_ids: z.array(z.number()),
  started_at: z.string().nullable().optional(),
  solve_ms: z.coerce.number().nullable().optional(),
})
export type DailyResult = z.infer<typeof DailyResultSchema>

/* ------------------------------ Trivia -------------------------------- */

export const TriviaQuestionSchema = z.object({
  id: z.coerce.number(),
  question: z.string(),
  option_a: z.string(),
  option_b: z.string(),
  option_c: z.string().nullable(),
  option_d: z.string().nullable(),
  category: z.string().nullable(),
  difficulty: z.string().nullable(),
  question_es: z.string().nullable().optional(),
  option_a_es: z.string().nullable().optional(),
  option_b_es: z.string().nullable().optional(),
  option_c_es: z.string().nullable().optional(),
  option_d_es: z.string().nullable().optional(),
  category_es: z.string().nullable().optional(),
})
export type TriviaQuestion = z.infer<typeof TriviaQuestionSchema>

export const TriviaResultSchema = z.object({
  correct: z.boolean(),
  correct_option: z.string(),
  explanation: z.string().nullable(),
})
export type TriviaResult = z.infer<typeof TriviaResultSchema>

/* --------------------------- Trivia runs ------------------------------ */

/** Response of start_trivia_run — a fresh run with its first question. */
export const TriviaStartSchema = z.object({
  session_id: z.coerce.number(),
  token: z.string(),
  length: z.coerce.number(),
  index: z.coerce.number(),
  score: z.coerce.number(),
  skips_left: z.coerce.number().optional(),
  question: TriviaQuestionSchema,
})
export type TriviaStart = z.infer<typeof TriviaStartSchema>

/** Response of submit_trivia_guess. correct_option only present when solved. */
export const TriviaSubmitSchema = z.object({
  status: z.string(),
  correct: z.boolean(),
  attempts: z.coerce.number(),
  score: z.coerce.number().optional(),
  session_score: z.coerce.number(),
  can_next: z.boolean(),
  correct_option: z.string().optional(),
  explanation: z.string().nullable().optional(),
  explanation_es: z.string().nullable().optional(),
  eliminated: z.array(z.string()).optional(),
})
export type TriviaSubmit = z.infer<typeof TriviaSubmitSchema>

/** Response of giveup_trivia — reveals the answer for 0 points. */
export const TriviaRevealSchema = z.object({
  status: z.string(),
  correct_option: z.string(),
  explanation: z.string().nullable().optional(),
  explanation_es: z.string().nullable().optional(),
  score: z.coerce.number(),
  can_next: z.boolean(),
})
export type TriviaReveal = z.infer<typeof TriviaRevealSchema>

/** Response of skip_trivia. */
export const TriviaSkipSchema = z.object({
  status: z.string(),
  can_next: z.boolean(),
  skips_left: z.coerce.number().optional(),
})
export type TriviaSkip = z.infer<typeof TriviaSkipSchema>

/** Response of next_trivia — either the next question or the run summary. */
export const TriviaNextSchema = z.object({
  finished: z.boolean(),
  skips_left: z.coerce.number().optional(),
  index: z.coerce.number().optional(),
  score: z.coerce.number().optional(),
  question: TriviaQuestionSchema.optional(),
  summary: z
    .object({
      score: z.coerce.number(),
      length: z.coerce.number(),
      correct: z.coerce.number(),
    })
    .optional(),
})
export type TriviaNext = z.infer<typeof TriviaNextSchema>

/* ---------------------------- Leaderboards ---------------------------- */

export const DailyLeaderRowSchema = z.object({
  rank: z.number(),
  username: z.string(),
  current_streak: z.number(),
  best_streak: z.number(),
  wins: z.number(),
  games_played: z.number(),
  win_pct: z.coerce.number().nullable(),
})
export type DailyLeaderRow = z.infer<typeof DailyLeaderRowSchema>

export const DailyTimeLeaderRowSchema = z.object({
  rank: z.number(),
  username: z.string(),
  best_ms: z.coerce.number(),
  wins: z.number(),
})
export type DailyTimeLeaderRow = z.infer<typeof DailyTimeLeaderRowSchema>

export const ArcadeLeaderRowSchema = z.object({
  rank: z.number(),
  username: z.string(),
  wins: z.number(),
  best_guesses: z.number().nullable(),
  games_played: z.number(),
})
export type ArcadeLeaderRow = z.infer<typeof ArcadeLeaderRowSchema>

export const TriviaLeaderRowSchema = z.object({
  rank: z.number(),
  username: z.string(),
  correct: z.number(),
  answered: z.number(),
  accuracy_pct: z.coerce.number().nullable(),
  // Added by the trivia-runs migration; optional so the UI still parses
  // rows from the older view until that migration is applied.
  best_run: z.coerce.number().nullable().optional(),
  total_points: z.coerce.number().nullable().optional(),
  runs: z.coerce.number().nullable().optional(),
})
export type TriviaLeaderRow = z.infer<typeof TriviaLeaderRowSchema>

export const RunVariantSchema = z.enum(['sudden_death', 'lives', 'time_attack'])
export type RunVariantValue = z.infer<typeof RunVariantSchema>

export const RunLeaderRowSchema = z.object({
  rank: z.number(),
  username: z.string(),
  fighters: z.number(),
  points: z.number(),
})
export type RunLeaderRow = z.infer<typeof RunLeaderRowSchema>

/* --------------------------- Player stats ----------------------------- */

export const PlayerStatsSchema = z.object({
  user_id: z.string(),
  daily_played: z.number(),
  daily_wins: z.number(),
  daily_current_streak: z.number(),
  daily_best_streak: z.number(),
  daily_last_solved: z.string().nullable(),
  arcade_played: z.number(),
  arcade_wins: z.number(),
  arcade_best_guesses: z.number().nullable(),
  trivia_answered: z.number(),
  trivia_correct: z.number(),
})
export type PlayerStats = z.infer<typeof PlayerStatsSchema>

/** Local (guest / offline) stats mirror for the header when signed out. */
export interface LocalStats {
  played: number
  wins: number
  currentStreak: number
  bestStreak: number
  lastSolved: string | null
}
