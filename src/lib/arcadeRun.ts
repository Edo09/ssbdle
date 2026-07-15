/**
 * Arcade "Run" mode — chain fighters back-to-back for a high score.
 * Three challenge variants share one engine, differing only by config.
 */

export type RunVariant = 'sudden_death' | 'lives' | 'time_attack'

export const RUN_VARIANTS: readonly RunVariant[] = [
  'sudden_death',
  'lives',
  'time_attack',
] as const

export interface RunConfig {
  variant: RunVariant
  /** Guesses allowed per fighter before it counts as failed. */
  guessesPerFighter: number
  /** Failed-fighter tolerance (only used when `endOnFail`). */
  lives: number
  /** Whether failing a fighter costs a life / can end the run. */
  endOnFail: boolean
  /** Time-attack starting clock in seconds (null = no clock). */
  startSeconds: number | null
  /** Seconds added to the clock per solved fighter (time attack). */
  bonusSeconds: number
}

export const RUN_CONFIG: Record<RunVariant, RunConfig> = {
  sudden_death: {
    variant: 'sudden_death',
    guessesPerFighter: 6,
    lives: 1,
    endOnFail: true,
    startSeconds: null,
    bonusSeconds: 0,
  },
  lives: {
    variant: 'lives',
    guessesPerFighter: 6,
    lives: 3,
    endOnFail: true,
    startSeconds: null,
    bonusSeconds: 0,
  },
  time_attack: {
    variant: 'time_attack',
    guessesPerFighter: 8,
    lives: 0,
    endOnFail: false,
    startSeconds: 120,
    bonusSeconds: 25,
  },
}

/** Points earned for solving a fighter in `guesses` tries (fewer = more). */
export function fighterPoints(guesses: number): number {
  return Math.max(25, 100 - (guesses - 1) * 15)
}

/** lucide-flavored accent per variant, reused across the UI. */
export const RUN_ACCENT: Record<RunVariant, string> = {
  sudden_death: 'var(--primary)',
  lives: 'var(--green)',
  time_attack: 'var(--accent)',
}

/** i18n key for each variant's display name — shared across all Run UI. */
export const RUN_VARIANT_NAME_KEY: Record<RunVariant, string> = {
  sudden_death: 'run.suddenDeath',
  lives: 'run.livesName',
  time_attack: 'run.timeAttack',
}
