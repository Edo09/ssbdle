import { supabase } from '@/lib/supabase'
import { todayUTC } from '@/lib/date'
import {
  ArcadeLeaderRowSchema,
  CharacterSchema,
  DailyLeaderRowSchema,
  DailyResultSchema,
  GuessResultSchema,
  PlayerStatsSchema,
  RunLeaderRowSchema,
  TriviaLeaderRowSchema,
  TriviaNextSchema,
  TriviaQuestionSchema,
  TriviaResultSchema,
  TriviaRevealSchema,
  TriviaSkipSchema,
  TriviaStartSchema,
  TriviaSubmitSchema,
  type ArcadeLeaderRow,
  type Character,
  type DailyLeaderRow,
  type DailyResult,
  type GuessResult,
  type PlayerStats,
  type RunLeaderRow,
  type RunVariantValue,
  type TriviaLeaderRow,
  type TriviaNext,
  type TriviaQuestion,
  type TriviaReveal,
  type TriviaResult,
  type TriviaSkip,
  type TriviaStart,
  type TriviaSubmit,
} from '@/types/game'
import { z } from 'zod'

function unwrap<T>(data: unknown, error: { message: string } | null, schema: z.ZodType<T>): T {
  if (error) throw new Error(error.message)
  return schema.parse(data)
}

/* ------------------------------ Roster -------------------------------- */

export async function fetchCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .order('name', { ascending: true })
  return unwrap(data, error, z.array(CharacterSchema))
}

/* ------------------------------- Daily -------------------------------- */

export async function checkGuess(
  characterId: number,
  date: string = todayUTC(),
): Promise<GuessResult> {
  const { data, error } = await supabase.rpc('check_guess', {
    p_character_id: characterId,
    p_date: date,
  })
  return unwrap(data, error, GuessResultSchema)
}

export async function recordResult(input: {
  date?: string
  solved: boolean
  guesses: number
  guessedIds: number[]
}): Promise<void> {
  const { error } = await supabase.rpc('record_result', {
    p_date: input.date ?? todayUTC(),
    p_solved: input.solved,
    p_guesses: input.guesses,
    p_guessed_ids: input.guessedIds,
  })
  if (error) throw new Error(error.message)
}

export async function revealAnswer(date: string = todayUTC()): Promise<Character> {
  const { data, error } = await supabase.rpc('reveal_answer', { p_date: date })
  return unwrap(data, error, CharacterSchema)
}

/** The signed-in player's stored result for a day (null if none). RLS-scoped. */
export async function fetchDailyResult(
  date: string = todayUTC(),
): Promise<DailyResult | null> {
  const { data, error } = await supabase
    .from('user_daily_results')
    .select('puzzle_date, guesses, solved, finished, guessed_ids')
    .eq('puzzle_date', date)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return DailyResultSchema.parse(data)
}

/** Persist the signed-in player's in-progress daily guesses (best-effort). */
export async function saveDailyProgress(
  date: string,
  guessedIds: number[],
): Promise<void> {
  const { error } = await supabase.rpc('save_daily_progress', {
    p_date: date,
    p_guessed_ids: guessedIds,
  })
  if (error) throw new Error(error.message)
}

/* ------------------------------ Arcade -------------------------------- */

export async function startArcadeRound(): Promise<string> {
  const { data, error } = await supabase.rpc('start_arcade_round')
  return unwrap(data, error, z.string())
}

export async function checkArcadeGuess(
  roundId: string,
  characterId: number,
): Promise<GuessResult> {
  const { data, error } = await supabase.rpc('check_arcade_guess', {
    p_round_id: roundId,
    p_character_id: characterId,
  })
  return unwrap(data, error, GuessResultSchema)
}

export async function revealArcadeAnswer(roundId: string): Promise<Character> {
  const { data, error } = await supabase.rpc('reveal_arcade_answer', {
    p_round_id: roundId,
  })
  return unwrap(data, error, CharacterSchema)
}

/** Retroactively attributes an already-finished anonymous round on sign-in. */
export async function claimArcadeRound(roundId: string): Promise<void> {
  const { error } = await supabase.rpc('claim_arcade_round', {
    p_round_id: roundId,
  })
  if (error) throw new Error(error.message)
}

/* --------------------------- Arcade Run mode --------------------------- */

export async function submitArcadeRun(input: {
  variant: RunVariantValue
  fighters: number
  points: number
  endedReason: 'dead' | 'time' | 'quit'
}): Promise<void> {
  const { error } = await supabase.rpc('submit_arcade_run', {
    p_variant: input.variant,
    p_fighters: input.fighters,
    p_points: input.points,
    p_ended_reason: input.endedReason,
  })
  if (error) throw new Error(error.message)
}

export async function fetchArcadeRunLeaderboard(
  variant: RunVariantValue,
  limit = 50,
): Promise<RunLeaderRow[]> {
  const { data, error } = await supabase
    .from('leaderboard_arcade_runs')
    .select('*')
    .eq('variant', variant)
    .order('rank', { ascending: true })
    .limit(limit)
  return unwrap(data, error, z.array(RunLeaderRowSchema))
}

/* ------------------------------ Trivia -------------------------------- */

export async function getRandomTrivia(opts?: {
  category?: string
  difficulty?: string
  exclude?: number[]
}): Promise<TriviaQuestion | null> {
  const { data, error } = await supabase.rpc('get_random_trivia', {
    p_category: opts?.category ?? null,
    p_difficulty: opts?.difficulty ?? null,
    p_exclude: opts?.exclude ?? [],
  })
  if (error) throw new Error(error.message)
  const rows = z.array(TriviaQuestionSchema).parse(data ?? [])
  return rows[0] ?? null
}

export async function checkTriviaAnswer(
  questionId: number,
  choice: string,
): Promise<TriviaResult> {
  const { data, error } = await supabase.rpc('check_trivia_answer', {
    p_question_id: questionId,
    p_choice: choice,
  })
  return unwrap(data, error, TriviaResultSchema)
}

/* --------------------------- Trivia Run mode -------------------------- */

export async function startTriviaRun(opts?: {
  length?: number
  category?: string
  difficulty?: string
}): Promise<TriviaStart> {
  const { data, error } = await supabase.rpc('start_trivia_run', {
    p_length: opts?.length ?? 10,
    p_category: opts?.category ?? null,
    p_difficulty: opts?.difficulty ?? null,
  })
  return unwrap(data, error, TriviaStartSchema)
}

export async function submitTriviaGuess(
  sessionId: number,
  token: string,
  choice: string,
): Promise<TriviaSubmit> {
  const { data, error } = await supabase.rpc('submit_trivia_guess', {
    p_session: sessionId,
    p_token: token,
    p_choice: choice,
  })
  return unwrap(data, error, TriviaSubmitSchema)
}

export async function giveUpTrivia(
  sessionId: number,
  token: string,
): Promise<TriviaReveal> {
  const { data, error } = await supabase.rpc('giveup_trivia', {
    p_session: sessionId,
    p_token: token,
  })
  return unwrap(data, error, TriviaRevealSchema)
}

export async function skipTrivia(
  sessionId: number,
  token: string,
): Promise<TriviaSkip> {
  const { data, error } = await supabase.rpc('skip_trivia', {
    p_session: sessionId,
    p_token: token,
  })
  return unwrap(data, error, TriviaSkipSchema)
}

export async function nextTrivia(
  sessionId: number,
  token: string,
): Promise<TriviaNext> {
  const { data, error } = await supabase.rpc('next_trivia', {
    p_session: sessionId,
    p_token: token,
  })
  return unwrap(data, error, TriviaNextSchema)
}

/* --------------------------- Leaderboards ----------------------------- */

export async function fetchDailyLeaderboard(limit = 50): Promise<DailyLeaderRow[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })
    .limit(limit)
  return unwrap(data, error, z.array(DailyLeaderRowSchema))
}

export async function fetchArcadeLeaderboard(limit = 50): Promise<ArcadeLeaderRow[]> {
  const { data, error } = await supabase
    .from('leaderboard_arcade')
    .select('*')
    .order('rank', { ascending: true })
    .limit(limit)
  return unwrap(data, error, z.array(ArcadeLeaderRowSchema))
}

export async function fetchTriviaLeaderboard(limit = 50): Promise<TriviaLeaderRow[]> {
  const { data, error } = await supabase
    .from('leaderboard_trivia')
    .select('*')
    .order('rank', { ascending: true })
    .limit(limit)
  return unwrap(data, error, z.array(TriviaLeaderRowSchema))
}

/* --------------------------- Player stats ----------------------------- */

export async function fetchPlayerStats(userId: string): Promise<PlayerStats | null> {
  const { data, error } = await supabase
    .from('player_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return PlayerStatsSchema.parse(data)
}
