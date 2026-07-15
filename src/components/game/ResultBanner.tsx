import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PartyPopper, RotateCcw, Share2, Skull } from 'lucide-react'
import type { Character, GuessResult, Mode } from '@/types/game'
import { MAX_GUESSES } from '@/types/game'
import { useI18n, type TFn } from '@/i18n/useI18n'
import { VISIBLE_ATTRIBUTE_KEY_SET } from '@/lib/columns'
import { Button } from '@/components/ui/button'
import { CharacterAvatar } from '@/components/game/CharacterAvatar'
import { SeriesIcon } from '@/components/game/SeriesIcon'
import { fighterRender, fullPortrait } from '@/lib/assets'
import { cn } from '@/lib/utils'
import {
  formatCountdown,
  msUntilNextUTCMidnight,
  todayUTC,
} from '@/lib/date'

const SHARE_URL = 'https://ssbdle.vercel.app/'
// First daily puzzle date (UTC). Only affects the "#N" shown when sharing —
// set this to your real launch date.
const DAILY_EPOCH = '2026-07-01'

/** Human-friendly puzzle number for the daily share (days since launch). */
function dailyPuzzleNumber(dateISO: string): number {
  const day = 86_400_000
  const start = Date.parse(`${DAILY_EPOCH}T00:00:00Z`)
  const today = Date.parse(`${dateISO}T00:00:00Z`)
  return Math.max(1, Math.floor((today - start) / day) + 1)
}

function buildShare(
  guesses: GuessResult[],
  mode: Mode,
  solved: boolean,
  t: TFn,
): string {
  const header =
    mode === 'daily'
      ? `SSBUDLE #${dailyPuzzleNumber(todayUTC())}`
      : 'SSBUDLE • Arcade'
  const score =
    mode === 'daily'
      ? solved
        ? `${guesses.length}/${MAX_GUESSES}`
        : `X/${MAX_GUESSES}`
      : solved
        ? t('result.shareSolvedIn', { n: guesses.length })
        : t('result.shareGaveUp')
  const grid = guesses
    .map((g) =>
      g.attributes
        .filter((a) => VISIBLE_ATTRIBUTE_KEY_SET.has(a.key))
        .map((a) => (a.status === 'correct' ? '🟩' : a.status === 'partial' ? '🟨' : '⬛'))
        .join(''),
    )
    .join('\n')
  return `${header} ${score}\n${grid}\n\n${t('result.shareFooter')} ${SHARE_URL}`
}

function Countdown() {
  const [ms, setMs] = useState(msUntilNextUTCMidnight())
  useEffect(() => {
    const id = window.setInterval(() => setMs(msUntilNextUTCMidnight()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span className="font-display tabular-nums text-foreground">
      {formatCountdown(ms)}
    </span>
  )
}

const CONFETTI_COLORS = ['#de1a22', '#009bff', '#8cefff', '#d29922', '#3fb950']

/** Deterministic CSS-only confetti shower for the victory banner. */
function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 26 }, (_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${(i * 41) % 100}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              borderRadius: i % 4 === 0 ? '50%' : undefined,
              '--cf-delay': `${((i * 53) % 140) / 100}s`,
              '--cf-duration': `${2.6 + ((i * 29) % 140) / 100}s`,
              '--cf-drift': `${((i * 61) % 120) - 60}px`,
              '--cf-spin': `${360 + ((i * 83) % 460)}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

/** Answer card with the fighter's full-body render as a reveal splash. */
function AnswerReveal({ answer, won }: { answer: Character; won: boolean }) {
  const { t } = useI18n()
  const render =
    fighterRender(answer.fighter_number, answer.is_echo) ??
    fullPortrait(answer.name)
  const glow = won ? 'rgba(140, 239, 255, 0.35)' : 'rgba(222, 26, 34, 0.45)'

  return (
    <div
      className={cn(
        'relative mt-4 flex items-center gap-3 overflow-hidden rounded-lg border p-3',
        won
          ? 'border-highlight/20 bg-secondary/60'
          : 'border-border bg-secondary/40',
        render && (won ? 'min-h-36 pr-32 sm:pr-44' : 'min-h-28 pr-28'),
      )}
    >
      <CharacterAvatar
        full
        name={answer.name}
        universe={answer.universe}
        className={won ? 'size-16 sm:size-20' : 'size-14'}
      />
      <div className="leading-tight">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {won ? t('result.youGuessed') : t('result.theFighterWas')}
        </div>
        <div
          className={cn(
            'font-display font-bold',
            won ? 'text-glow text-2xl sm:text-3xl' : 'text-xl',
          )}
        >
          {answer.name}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <SeriesIcon universe={answer.universe} className="size-3.5" />
          <span>
            {answer.universe} · #{answer.fighter_number} · {answer.smash_debut}
          </span>
        </div>
      </div>
      {render && (
        <>
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full',
              won ? '-right-8 size-44' : '-right-6 size-32',
            )}
            style={{
              background: `radial-gradient(closest-side, ${glow}, transparent)`,
            }}
          />
          <img
            src={render}
            alt=""
            aria-hidden
            className={cn(
              'pointer-events-none absolute bottom-0 object-contain object-bottom drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]',
              won ? 'right-1 h-[135%] w-28 sm:right-3 sm:w-36' : 'right-1 h-[125%] w-24',
            )}
          />
        </>
      )}
    </div>
  )
}

interface Props {
  status: 'won' | 'lost'
  answer: Character | null
  guesses: GuessResult[]
  mode: Mode
  onPlayAgain?: () => void
}

export function ResultBanner({
  status,
  answer,
  guesses,
  mode,
  onPlayAgain,
}: Props) {
  const { t } = useI18n()
  const won = status === 'won'

  async function share() {
    const text = buildShare(guesses, mode, won, t)
    // Prefer the native share sheet (great on mobile); fall back to clipboard.
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'SSBUDLE', text })
        return
      } catch (e) {
        // Dismissing the sheet rejects with AbortError — treat as a no-op.
        if ((e as Error).name === 'AbortError') return
        // Any other failure: fall through to the clipboard path below.
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('result.shareCopied'))
    } catch {
      toast.error(t('result.shareFailed'))
    }
  }

  return (
    <div
      className={cn(
        'animate-pop-in hud-panel relative mt-4 overflow-hidden rounded-xl p-5',
        won && 'border-highlight/25',
      )}
    >
      {won && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(38rem 16rem at 50% -6rem, rgba(140, 239, 255, 0.14), transparent 70%)',
            }}
          />
          <Confetti />
        </>
      )}

      <div
        className={cn(
          'relative flex items-center gap-2',
          won && 'justify-center py-1',
        )}
      >
        {won ? (
          <PartyPopper className="size-6 text-highlight sm:size-7" />
        ) : (
          <Skull className="size-5 text-muted-foreground" />
        )}
        <h3
          className={cn(
            'font-display font-bold',
            won
              ? 'text-glow text-2xl uppercase tracking-tight sm:text-3xl'
              : 'text-lg',
          )}
        >
          {won ? t('result.won') : t('result.lost')}
        </h3>
      </div>

      {answer ? (
        <AnswerReveal answer={answer} won={won} />
      ) : (
        <p className="relative mt-3 text-sm text-muted-foreground">
          {t('result.signInReveal')}
        </p>
      )}

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={share} variant="secondary" size="sm">
          <Share2 /> {t('common.share')}
        </Button>
        {mode === 'arcade' && onPlayAgain && (
          <Button onClick={onPlayAgain} size="sm">
            <RotateCcw /> {t('common.playAgain')}
          </Button>
        )}
        {mode === 'daily' && (
          <span className="ml-auto text-sm text-muted-foreground">
            {t('result.nextIn')} <Countdown />
          </span>
        )}
      </div>
    </div>
  )
}
