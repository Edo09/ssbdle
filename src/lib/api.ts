import { supabase } from '@/lib/supabase'
import { todayUTC } from '@/lib/date'
import {
  ArcadeLeaderRowSchema,
  CharacterSchema,
  DailyLeaderRowSchema,
  GuessResultSchema,
  PlayerStatsSchema,
  TriviaLeaderRowSchema,
  TriviaQuestionSchema,
  TriviaResultSchema,
  type ArcadeLeaderRow,
  type Character,
  type DailyLeaderRow,
  type GuessResult,
  type PlayerStats,
  type TriviaLeaderRow,
  type TriviaQuestion,
  type TriviaResult,
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
