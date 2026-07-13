import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PartyPopper, RotateCcw, Share2, Skull } from 'lucide-react'
import type { Character, GuessResult, Mode } from '@/types/game'
import { MAX_GUESSES } from '@/types/game'
import { Button } from '@/components/ui/button'
import { CharacterAvatar } from '@/components/game/CharacterAvatar'
import {
  formatCountdown,
  msUntilNextUTCMidnight,
  todayUTC,
} from '@/lib/date'

function buildShare(guesses: GuessResult[], mode: Mode, solved: boolean): string {
  const header =
    mode === 'daily' ? `SMASHDLE ${todayUTC()}` : 'SMASHDLE • Arcade'
  const score =
    mode === 'daily'
      ? solved
        ? `${guesses.length}/${MAX_GUESSES}`
        : `X/${MAX_GUESSES}`
      : solved
        ? `solved in ${guesses.length}`
        : 'gave up'
  const grid = guesses
    .map((g) =>
      g.attributes.map((a) => (a.status === 'correct' ? '🟩' : '⬛')).join(''),
    )
    .join('\n')
  return `${header} ${score}\n${grid}\n\nplay at smashdle`
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
  const won = status === 'won'

  async function share() {
    const text = buildShare(guesses, mode, won)
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Result copied to clipboard')
    } catch {
      toast.error('Could not copy result')
    }
  }

  return (
    <div className="animate-pop-in hud-panel mt-4 rounded-xl p-5">
      <div className="flex items-center gap-2">
        {won ? (
          <PartyPopper className="size-5 text-accent" />
        ) : (
          <Skull className="size-5 text-muted-foreground" />
        )}
        <h3 className="font-display text-lg font-bold">
          {won ? 'Nailed it!' : 'Out of guesses'}
        </h3>
      </div>

      {answer ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3">
          <CharacterAvatar
            name={answer.name}
            gameName={answer.game_name}
            universe={answer.universe}
            className="size-14"
          />
          <div className="leading-tight">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {won ? 'You guessed' : 'The fighter was'}
            </div>
            <div className="font-display text-xl font-bold">{answer.name}</div>
            <div className="text-sm text-muted-foreground">
              {answer.universe} · #{answer.fighter_number} · {answer.smash_debut}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to reveal the fighter and save your streak.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={share} variant="secondary" size="sm">
          <Share2 /> Share
        </Button>
        {mode === 'arcade' && onPlayAgain && (
          <Button onClick={onPlayAgain} size="sm">
            <RotateCcw /> Play again
          </Button>
        )}
        {mode === 'daily' && (
          <span className="ml-auto text-sm text-muted-foreground">
            Next fighter in <Countdown />
          </span>
        )}
      </div>
    </div>
  )
}
