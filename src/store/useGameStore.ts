import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import {
  MAX_GUESSES,
  type Character,
  type GuessResult,
  type LocalStats,
  type PlayerStats,
} from '@/types/game'
import {
  checkArcadeGuess,
  checkGuess,
  fetchCharacters,
  fetchPlayerStats,
  recordResult,
  revealAnswer,
  revealArcadeAnswer,
  startArcadeRound,
} from '@/lib/api'
import { todayUTC } from '@/lib/date'
import { useAuthStore } from '@/store/useAuthStore'

export type BoardStatus = 'playing' | 'won' | 'lost'

interface Board {
  guesses: GuessResult[]
  status: BoardStatus
  answer: Character | null
}

const emptyBoard = (): Board => ({ guesses: [], status: 'playing', answer: null })

const emptyStats = (): LocalStats => ({
  played: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastSolved: null,
})

function isConsecutive(prev: string | null, date: string): boolean {
  if (!prev) return false
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10) === prev
}

function applyResult(s: LocalStats, solved: boolean, date: string): LocalStats {
  const currentStreak = solved ? (isConsecutive(s.lastSolved, date) ? s.currentStreak + 1 : 1) : 0
  return {
    played: s.played + 1,
    wins: s.wins + (solved ? 1 : 0),
    currentStreak,
    bestStreak: Math.max(s.bestStreak, currentStreak),
    lastSolved: solved ? date : s.lastSolved,
  }
}

interface GameState {
  // roster
  characters: Character[]
  charById: Map<number, Character>
  loadingChars: boolean
  charsError: string | null
  loadCharacters: () => Promise<void>

  // daily
  dailyDate: string
  daily: Board
  submittingDaily: boolean
  submitDailyGuess: (c: Character) => Promise<void>
  giveUpDaily: () => Promise<void>

  // arcade
  arcadeRoundId: string | null
  arcade: Board
  startingArcade: boolean
  submittingArcade: boolean
  startArcade: () => Promise<void>
  submitArcadeGuess: (c: Character) => Promise<void>
  giveUpArcade: () => Promise<void>

  // stats
  localStats: LocalStats
  serverStats: PlayerStats | null
  refreshServerStats: () => Promise<void>

  // internal
  _finishDaily: (solved: boolean, guesses: GuessResult[]) => Promise<void>
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      characters: [],
      charById: new Map(),
      loadingChars: false,
      charsError: null,

      loadCharacters: async () => {
        // Roll over to a fresh board if the stored day is stale.
        const today = todayUTC()
        if (get().dailyDate !== today) {
          set({ dailyDate: today, daily: emptyBoard() })
        }
        if (get().characters.length > 0 || get().loadingChars) return
        set({ loadingChars: true, charsError: null })
        try {
          const chars = await fetchCharacters()
          set({
            characters: chars,
            charById: new Map(chars.map((c) => [c.id, c])),
            loadingChars: false,
          })
        } catch (e) {
          set({ loadingChars: false, charsError: (e as Error).message })
        }
      },

      dailyDate: todayUTC(),
      daily: emptyBoard(),
      submittingDaily: false,

      submitDailyGuess: async (c) => {
        const st = get()
        if (st.daily.status !== 'playing' || st.submittingDaily) return
        if (st.daily.guesses.some((g) => g.guess.id === c.id)) return
        set({ submittingDaily: true })
        try {
          const result = await checkGuess(c.id, st.dailyDate)
          const guesses = [...get().daily.guesses, result]
          let status: BoardStatus = 'playing'
          let answer: Character | null = null
          if (result.correct) {
            status = 'won'
            answer = c
          } else if (guesses.length >= MAX_GUESSES) {
            status = 'lost'
          }
          set({ daily: { guesses, status, answer } })
          if (status !== 'playing') await get()._finishDaily(status === 'won', guesses)
        } catch (e) {
          toast.error((e as Error).message)
        } finally {
          set({ submittingDaily: false })
        }
      },

      giveUpDaily: async () => {
        const st = get()
        if (st.daily.status !== 'playing') return
        set({ daily: { ...st.daily, status: 'lost' } })
        await get()._finishDaily(false, st.daily.guesses)
      },

      _finishDaily: async (solved, guesses) => {
        const date = get().dailyDate
        set((s) => ({ localStats: applyResult(s.localStats, solved, date) }))
        const user = useAuthStore.getState().user
        if (!user) return
        try {
          await recordResult({
            date,
            solved,
            guesses: guesses.length,
            guessedIds: guesses.map((g) => g.guess.id),
          })
          if (!solved) {
            const ans = await revealAnswer(date)
            set((s) => ({ daily: { ...s.daily, answer: ans } }))
          }
          await get().refreshServerStats()
        } catch (e) {
          console.warn('[smashdle] finish daily sync failed:', (e as Error).message)
        }
      },

      arcadeRoundId: null,
      arcade: emptyBoard(),
      startingArcade: false,
      submittingArcade: false,

      startArcade: async () => {
        set({ startingArcade: true, arcade: emptyBoard(), arcadeRoundId: null })
        try {
          const roundId = await startArcadeRound()
          set({ arcadeRoundId: roundId })
        } catch (e) {
          toast.error((e as Error).message)
        } finally {
          set({ startingArcade: false })
        }
      },

      submitArcadeGuess: async (c) => {
        const st = get()
        if (!st.arcadeRoundId || st.arcade.status !== 'playing' || st.submittingArcade) return
        if (st.arcade.guesses.some((g) => g.guess.id === c.id)) return
        set({ submittingArcade: true })
        try {
          const result = await checkArcadeGuess(st.arcadeRoundId, c.id)
          const guesses = [...get().arcade.guesses, result]
          const won = result.correct
          set({
            arcade: {
              guesses,
              status: won ? 'won' : 'playing',
              answer: won ? c : null,
            },
          })
          if (won && useAuthStore.getState().user) await get().refreshServerStats()
        } catch (e) {
          toast.error((e as Error).message)
        } finally {
          set({ submittingArcade: false })
        }
      },

      giveUpArcade: async () => {
        const st = get()
        if (!st.arcadeRoundId || st.arcade.status !== 'playing') return
        try {
          const ans = await revealArcadeAnswer(st.arcadeRoundId)
          set((s) => ({ arcade: { ...s.arcade, status: 'lost', answer: ans } }))
        } catch (e) {
          toast.error((e as Error).message)
        }
      },

      localStats: emptyStats(),
      serverStats: null,

      refreshServerStats: async () => {
        const user = useAuthStore.getState().user
        if (!user) {
          set({ serverStats: null })
          return
        }
        try {
          const stats = await fetchPlayerStats(user.id)
          set({ serverStats: stats })
        } catch {
          /* non-fatal */
        }
      },
    }),
    {
      name: 'smashdle-game',
      version: 1,
      partialize: (s) => ({
        dailyDate: s.dailyDate,
        daily: s.daily,
        localStats: s.localStats,
      }),
    },
  ),
)
