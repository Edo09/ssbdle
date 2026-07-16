import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Flag,
  Heart,
  PartyPopper,
  RotateCcw,
  Share2,
  Timer,
  Trophy,
} from 'lucide-react'
import {
  RUN_ACCENT,
  RUN_CONFIG,
  RUN_VARIANT_NAME_KEY,
  type RunVariant,
} from '@/lib/arcadeRun'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { useI18n } from '@/i18n/useI18n'
import { Button } from '@/components/ui/button'
import { CharacterAvatar } from '@/components/game/CharacterAvatar'
import { GuessGrid } from '@/components/game/GuessGrid'
import { GuessInput } from '@/components/game/GuessInput'
import { RunChallengeSelect } from '@/components/game/RunChallengeSelect'
import { cn } from '@/lib/utils'

function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function RunMode() {
  const status = useGameStore((s) => s.run.status)
  const runBest = useGameStore((s) => s.runBest)
  const startRun = useGameStore((s) => s.startRun)

  if (status === 'idle')
    return <RunChallengeSelect best={runBest} onPick={startRun} />
  if (status === 'over') return <RunSummary />
  return <RunPlaying />
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: string
}) {
  return (
    <div className="flex flex-col leading-none">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        key={value}
        className="animate-pop-in font-display text-xl font-bold tabular-nums"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </span>
    </div>
  )
}

function RunHud({
  variant,
  fighters,
  points,
  lives,
  remainingMs,
  onBack,
}: {
  variant: RunVariant
  fighters: number
  points: number
  lives: number
  remainingMs: number | null
  onBack: () => void
}) {
  const { t } = useI18n()
  const cfg = RUN_CONFIG[variant]
  const accent = RUN_ACCENT[variant]
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        aria-label={t('run.changeChallenge')}
        title={t('run.changeChallenge')}
      >
        <ArrowLeft />
      </Button>
      <Stat label={t('run.fighters')} value={fighters} accent={accent} />
      <Stat label={t('run.points')} value={points} />
      {cfg.endOnFail ? (
        <div
          className="ml-auto flex items-center gap-1"
          title={t('run.livesLabel')}
        >
          {Array.from({ length: cfg.lives }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                'size-5',
                i < lives ? 'fill-current text-primary' : 'text-muted-foreground/25',
              )}
            />
          ))}
        </div>
      ) : remainingMs != null ? (
        <div
          className={cn(
            'ml-auto flex items-center gap-1.5 font-display text-lg font-bold tabular-nums',
            remainingMs < 15000 ? 'text-destructive' : 'text-foreground',
          )}
          title={t('run.timeLabel')}
        >
          <Timer className="size-5" />
          {formatClock(remainingMs)}
        </div>
      ) : null}
    </div>
  )
}

function RunPlaying() {
  const { t } = useI18n()
  const characters = useGameStore((s) => s.characters)
  const run = useGameStore((s) => s.run)
  const submitting = useGameStore((s) => s.runSubmitting)
  const startingRound = useGameStore((s) => s.runStartingRound)
  const submitRunGuess = useGameStore((s) => s.submitRunGuess)
  const endRun = useGameStore((s) => s.endRun)
  const exitRun = useGameStore((s) => s.exitRun)

  const variant = run.variant as RunVariant
  const cfg = RUN_CONFIG[variant]
  const excludeIds = new Set(run.guesses.map((g) => g.guess.id))
  const guessesLeft = cfg.guessesPerFighter - run.guesses.length

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!run.deadline) return
    const id = window.setInterval(() => {
      const tick = Date.now()
      setNow(tick)
      if (tick > run.deadline!) endRun('time')
    }, 250)
    return () => window.clearInterval(id)
  }, [run.deadline, endRun])
  const remainingMs = run.deadline ? Math.max(0, run.deadline - now) : null

  return (
    <div className="space-y-3">
      <RunHud
        variant={variant}
        fighters={run.fighters}
        points={run.points}
        lives={run.lives}
        remainingMs={remainingMs}
        onBack={exitRun}
      />

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <GuessInput
            characters={characters}
            excludeIds={excludeIds}
            onGuess={submitRunGuess}
            disabled={submitting || startingRound || characters.length === 0}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => endRun('quit')}
          aria-label={t('run.quit')}
          title={t('run.quit')}
        >
          <Flag />
        </Button>
      </div>

      <p className="text-[11px] -mt-1 text-muted-foreground/60 px-1">
        {t('board.hintText')}
      </p>

      <div className="px-0.5 text-sm text-muted-foreground">
        <span className="font-display font-semibold text-foreground">
          {t('run.fighterN', { n: run.fighters + 1 })}
        </span>{' '}
        ·{' '}
        {t(guessesLeft === 1 ? 'run.guessesLeftOne' : 'run.guessesLeftMany', {
          n: guessesLeft,
        })}
      </div>

      <GuessGrid guesses={run.guesses} />
    </div>
  )
}

function BigStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-xl border border-border bg-secondary/40 px-5 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-3xl font-bold tabular-nums">{value}</div>
    </div>
  )
}

function RunSummary() {
  const { t } = useI18n()
  const run = useGameStore((s) => s.run)
  const startRun = useGameStore((s) => s.startRun)
  const exitRun = useGameStore((s) => s.exitRun)
  const user = useAuthStore((s) => s.user)
  const variant = run.variant as RunVariant
  const title = run.endedReason === 'time' ? t('run.timeUp') : t('run.runOver')

  async function share() {
    const label = t(RUN_VARIANT_NAME_KEY[variant])
    const text = `SSBUDLE Arcade · ${label}\n🏆 ${run.fighters} ${t('run.fighters')} · ${run.points} ${t('run.points')}\n${t('result.shareFooter')}`
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('result.shareCopied'))
    } catch {
      toast.error(t('result.shareFailed'))
    }
  }

  return (
    <div className="animate-pop-in text-center">
      <div className="flex items-center justify-center gap-2">
        <PartyPopper className="size-6 text-highlight" />
        <h3 className="font-display text-2xl font-bold">{title}</h3>
      </div>

      {run.newBest && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-highlight/15 px-3 py-1 text-sm font-semibold text-highlight">
          <Trophy className="size-4" />
          {t('run.newBest')}
        </div>
      )}

      <p className="mt-3 text-muted-foreground">
        {t('run.solvedFighters', { n: run.fighters })}
      </p>

      <div className="mt-4 flex justify-center gap-3">
        <BigStat label={t('run.fighters')} value={run.fighters} />
        <BigStat label={t('run.points')} value={run.points} />
      </div>

      {run.lastAnswer && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-2 pr-3">
          <CharacterAvatar
            name={run.lastAnswer.name}
            universe={run.lastAnswer.universe}
            className="size-9"
          />
          <span className="text-sm font-semibold">
            {t('run.itWas', { name: run.lastAnswer.name })}
          </span>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={() => startRun(variant)}>
          <RotateCcw /> {t('common.playAgain')}
        </Button>
        <Button variant="secondary" onClick={exitRun}>
          {t('run.changeChallenge')}
        </Button>
        <Button variant="secondary" onClick={share}>
          <Share2 /> {t('common.share')}
        </Button>
      </div>

      {!user && (
        <p className="mt-3 text-xs text-muted-foreground">
          {t('run.signInGlobal')}
        </p>
      )}
    </div>
  )
}
