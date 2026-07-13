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
})
export type TriviaQuestion = z.infer<typeof TriviaQuestionSchema>

export const TriviaResultSchema = z.object({
  correct: z.boolean(),
  correct_option: z.string(),
  explanation: z.string().nullable(),
})
export type TriviaResult = z.infer<typeof TriviaResultSchema>

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
})
export type TriviaLeaderRow = z.infer<typeof TriviaLeaderRowSchema>

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
