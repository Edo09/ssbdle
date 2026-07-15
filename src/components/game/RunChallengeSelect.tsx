import type { CSSProperties } from 'react'
import { Heart, Skull, Timer } from 'lucide-react'
import {
  RUN_ACCENT,
  RUN_CONFIG,
  RUN_VARIANT_NAME_KEY,
  RUN_VARIANTS,
  type RunVariant,
} from '@/lib/arcadeRun'
import type { RunBest } from '@/store/useGameStore'
import { useI18n, type TFn } from '@/i18n/useI18n'

const ICON: Record<RunVariant, typeof Skull> = {
  sudden_death: Skull,
  lives: Heart,
  time_attack: Timer,
}

function describe(t: TFn, v: RunVariant): string {
  const c = RUN_CONFIG[v]
  if (v === 'sudden_death')
    return t('run.suddenDeathDesc', { n: c.guessesPerFighter })
  if (v === 'lives')
    return t('run.livesDesc', { lives: c.lives, n: c.guessesPerFighter })
  return t('run.timeAttackDesc', { bonus: c.bonusSeconds })
}

interface Props {
  best: Record<RunVariant, RunBest>
  onPick: (v: RunVariant) => void
}

export function RunChallengeSelect({ best, onPick }: Props) {
  const { t } = useI18n()
  return (
    <div>
      <h3 className="mb-3 text-center font-display text-lg font-bold">
        {t('run.pick')}
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {RUN_VARIANTS.map((v) => {
          const Icon = ICON[v]
          const b = best[v]
          return (
            <button
              key={v}
              type="button"
              onClick={() => onPick(v)}
              style={{ '--rc': RUN_ACCENT[v] } as CSSProperties}
              className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-secondary/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--rc)] hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc)]/50"
            >
              <span
                className="flex size-10 items-center justify-center rounded-lg"
                style={{
                  background: 'color-mix(in srgb, var(--rc) 18%, transparent)',
                  color: 'var(--rc)',
                }}
              >
                <Icon className="size-5" />
              </span>
              <span className="font-display text-base font-bold">
                {t(RUN_VARIANT_NAME_KEY[v])}
              </span>
              <span className="text-xs text-muted-foreground">
                {describe(t, v)}
              </span>
              {b.fighters > 0 && (
                <span
                  className="mt-1 text-xs font-semibold"
                  style={{ color: 'var(--rc)' }}
                >
                  {t('run.best')}: {b.fighters} · {b.points}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
