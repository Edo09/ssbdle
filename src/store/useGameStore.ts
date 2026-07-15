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
  claimArcadeRound,
  fetchCharacters,
  fetchPlayerStats,
  recordResult,
  revealArcadeAnswer,
  startArcadeRound,
  submitArcadeRun,
} from '@/lib/api'
import {
  RUN_CONFIG,
  RUN_VARIANTS,
  fighterPoints,
  type RunVariant,
} from '@/lib/arcadeRun'
import { todayUTC } from '@/lib/date'
import { translate, useLangStore } from '@/i18n/useI18n'
import { useAuthStore } from '@/store/useAuthStore'

export type BoardStatus = 'playing' | 'won' | 'lost'

export type RunStatus = 'idle' | 'playing' | 'over'

/** Live state of an Arcade run (not persisted — a run is a live session). */
export interface RunState {
  variant: RunVariant | null
  status: RunStatus
  roundId: string | null
  guesses: GuessResult[] // current fighter only
  fighters: number // solved this run
  points: number
  lives: number
  deadline: number | null // epoch ms (time attack)
  lastAnswer: Character | null // last failed / final fighter
  endedReason: 'dead' | 'time' | 'quit' | null
  newBest: boolean
  submitted: boolean
}

export interface RunBest {
  fighters: number
  points: number
}

const emptyRun = (): RunState => ({
  variant: null,
  status: 'idle',
  roundId: null,
  guesses: [],
  fighters: 0,
  points: 0,
  lives: 0,
  deadline: null,
  lastAnswer: null,
  endedReason: null,
  newBest: false,
  submitted: false,
})

const emptyRunBest = (): Record<RunVariant, RunBest> =>
  RUN_VARIANTS.reduce(
    (acc, v) => ({ ...acc, [v]: { fighters: 0, points: 0 } }),
    {} as Record<RunVariant, RunBest>,
  )

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
  dailySynced: boolean
  submittingDaily: boolean
  submitDailyGuess: (c: Character) => Promise<void>
  giveUpDaily: () => Promise<void>

  // arcade
  arcadeRoundId: string | null
  arcade: Board
  arcadeSynced: boolean
  startingArcade: boolean
  submittingArcade: boolean
  startArcade: () => Promise<void>
  submitArcadeGuess: (c: Character) => Promise<void>
  giveUpArcade: () => Promise<void>

  // arcade run
  run: RunState
  runStartingRound: boolean
  runSubmitting: boolean
  runBest: Record<RunVariant, RunBest>
  startRun: (variant: RunVariant) => Promise<void>
  submitRunGuess: (c: Character) => Promise<void>
  endRun: (reason: 'dead' | 'time' | 'quit') => Promise<void>
  exitRun: () => void

  // stats
  localStats: LocalStats
  serverStats: PlayerStats | null
  refreshServerStats: () => Promise<void>

  /**
   * Retroactively pushes any already-finished Daily/Run result that
   * happened while signed out. Call whenever the user signs in — it's a
   * no-op if there's nothing pending.
   */
  syncPendingResults: () => Promise<void>

  // internal
  _finishDaily: (solved: boolean, guesses: GuessResult[]) => Promise<void>
  _syncDailyToServer: (
    date: string,
    solved: boolean,
    guesses: GuessResult[],
  ) => Promise<void>
  _nextRunFighter: () => Promise<void>
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
          set({ dailyDate: today, daily: emptyBoard(), dailySynced: false })
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
      dailySynced: false,
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
        await get()._syncDailyToServer(date, solved, guesses)
      },

      _syncDailyToServer: async (date, solved, guesses) => {
        const user = useAuthStore.getState().user
        if (!user || get().dailySynced) return
        try {
          await recordResult({
            date,
            solved,
            guesses: guesses.length,
            guessedIds: guesses.map((g) => g.guess.id),
          })
          set({ dailySynced: true })
          // Daily never reveals the answer on a loss — keep today's fighter
          // a surprise so there's a reason to come back tomorrow.
          await get().refreshServerStats()
        } catch (e) {
          console.warn('[smashdle] daily sync failed:', (e as Error).message)
        }
      },

      arcadeRoundId: null,
      arcade: emptyBoard(),
      arcadeSynced: false,
      startingArcade: false,
      submittingArcade: false,

      startArcade: async () => {
        set({
          startingArcade: true,
          arcade: emptyBoard(),
          arcadeRoundId: null,
          arcadeSynced: false,
        })
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
          if (won && useAuthStore.getState().user) {
            set({ arcadeSynced: true })
            await get().refreshServerStats()
          }
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

      // ---- arcade run ----
      run: emptyRun(),
      runStartingRound: false,
      runSubmitting: false,
      runBest: emptyRunBest(),

      startRun: async (variant) => {
        const cfg = RUN_CONFIG[variant]
        set({
          run: {
            ...emptyRun(),
            variant,
            status: 'playing',
            lives: cfg.lives,
            deadline: cfg.startSeconds
              ? Date.now() + cfg.startSeconds * 1000
              : null,
          },
          runStartingRound: true,
        })
        try {
          const roundId = await startArcadeRound()
          set((s) => ({ run: { ...s.run, roundId }, runStartingRound: false }))
        } catch (e) {
          toast.error((e as Error).message)
          set({ run: emptyRun(), runStartingRound: false })
        }
      },

      _nextRunFighter: async () => {
        set({ runStartingRound: true })
        try {
          const roundId = await startArcadeRound()
          set((s) => ({
            run: { ...s.run, roundId, guesses: [] },
            runStartingRound: false,
          }))
        } catch (e) {
          toast.error((e as Error).message)
          set({ runStartingRound: false })
        }
      },

      submitRunGuess: async (c) => {
        const st = get()
        const run = st.run
        if (run.status !== 'playing' || !run.roundId || st.runSubmitting) return
        if (run.guesses.some((g) => g.guess.id === c.id)) return
        if (run.deadline && Date.now() > run.deadline) {
          await get().endRun('time')
          return
        }
        const cfg = RUN_CONFIG[run.variant!]
        set({ runSubmitting: true })
        try {
          const result = await checkArcadeGuess(run.roundId, c.id)
          const guesses = [...get().run.guesses, result]

          if (result.correct) {
            const gained = fighterPoints(guesses.length)
            const lang = useLangStore.getState().lang
            toast.success(translate(lang, 'run.solved', { n: gained }))
            set((s) => ({
              run: {
                ...s.run,
                guesses,
                fighters: s.run.fighters + 1,
                points: s.run.points + gained,
                deadline: s.run.deadline
                  ? s.run.deadline + cfg.bonusSeconds * 1000
                  : null,
                lastAnswer: null,
              },
            }))
            await get()._nextRunFighter()
          } else if (guesses.length >= cfg.guessesPerFighter) {
            // fighter failed — reveal it
            let ans: Character | null = null
            try {
              ans = await revealArcadeAnswer(run.roundId)
            } catch {
              /* non-fatal */
            }
            const lives = cfg.endOnFail ? get().run.lives - 1 : get().run.lives
            if (cfg.endOnFail && lives <= 0) {
              set((s) => ({
                run: { ...s.run, guesses, lives: 0, lastAnswer: ans },
              }))
              await get().endRun('dead')
            } else {
              if (ans) {
                const lang = useLangStore.getState().lang
                toast(translate(lang, 'run.itWas', { name: ans.name }))
              }
              set((s) => ({ run: { ...s.run, lives, lastAnswer: ans } }))
              await get()._nextRunFighter()
            }
          } else {
            set((s) => ({ run: { ...s.run, guesses } }))
          }
        } catch (e) {
          toast.error((e as Error).message)
        } finally {
          set({ runSubmitting: false })
        }
      },

      endRun: async (reason) => {
        const st = get()
        if (st.run.status === 'over' || !st.run.variant) return
        let lastAnswer = st.run.lastAnswer
        if (!lastAnswer && st.run.roundId) {
          try {
            lastAnswer = await revealArcadeAnswer(st.run.roundId)
          } catch {
            /* non-fatal */
          }
        }
        const variant = st.run.variant
        const { fighters, points } = st.run
        const prev = get().runBest[variant]
        const newBest = fighters > prev.fighters || points > prev.points
        set((s) => ({
          run: { ...s.run, status: 'over', endedReason: reason, lastAnswer, newBest },
          runBest: {
            ...s.runBest,
            [variant]: {
              fighters: Math.max(prev.fighters, fighters),
              points: Math.max(prev.points, points),
            },
          },
        }))
        if (useAuthStore.getState().user) {
          try {
            await submitArcadeRun({ variant, fighters, points, endedReason: reason })
            set((s) => ({ run: { ...s.run, submitted: true } }))
          } catch (e) {
            console.warn('[smashdle] submit arcade run failed:', (e as Error).message)
          }
        }
      },

      exitRun: () =>
        set({ run: emptyRun(), runSubmitting: false, runStartingRound: false }),

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

      syncPendingResults: async () => {
        if (!useAuthStore.getState().user) return

        const daily = get().daily
        if (daily.status !== 'playing' && !get().dailySynced) {
          await get()._syncDailyToServer(
            get().dailyDate,
            daily.status === 'won',
            daily.guesses,
          )
        }

        const arcadeRoundId = get().arcadeRoundId
        if (arcadeRoundId && get().arcade.status !== 'playing' && !get().arcadeSynced) {
          try {
            await claimArcadeRound(arcadeRoundId)
            set({ arcadeSynced: true })
            await get().refreshServerStats()
          } catch (e) {
            console.warn('[smashdle] claim arcade round failed:', (e as Error).message)
          }
        }

        const run = get().run
        if (run.status === 'over' && run.variant && !run.submitted) {
          try {
            await submitArcadeRun({
              variant: run.variant,
              fighters: run.fighters,
              points: run.points,
              endedReason: run.endedReason ?? 'quit',
            })
            set((s) => ({ run: { ...s.run, submitted: true } }))
          } catch (e) {
            console.warn('[smashdle] pending run sync failed:', (e as Error).message)
          }
        }
      },
    }),
    {
      name: 'smashdle-game',
      version: 1,
      partialize: (s) => ({
        dailyDate: s.dailyDate,
        daily: s.daily,
        dailySynced: s.dailySynced,
        localStats: s.localStats,
        runBest: s.runBest,
      }),
    },
  ),
)
