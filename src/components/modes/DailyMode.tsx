import { CalendarDays } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { MAX_GUESSES } from '@/types/game'
import { GuessBoard } from '@/components/game/GuessBoard'
import { Skeleton } from '@/components/ui/skeleton'
import { todayUTC } from '@/lib/date'

export function DailyMode() {
  const characters = useGameStore((s) => s.characters)
  const loadingChars = useGameStore((s) => s.loadingChars)
  const daily = useGameStore((s) => s.daily)
  const submitting = useGameStore((s) => s.submittingDaily)
  const submitGuess = useGameStore((s) => s.submitDailyGuess)
  const giveUp = useGameStore((s) => s.giveUpDaily)

  const prettyDate = new Date(todayUTC() + 'T00:00:00Z').toLocaleDateString(
    undefined,
    { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' },
  )

  return (
    <section aria-label="Daily puzzle">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="size-4 text-primary" />
        <span>
          Daily fighter ·{' '}
          <span className="text-foreground">{prettyDate}</span>
        </span>
      </div>

      {loadingChars && characters.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : (
        <GuessBoard
          characters={characters}
          guesses={daily.guesses}
          status={daily.status}
          answer={daily.answer}
          submitting={submitting}
          maxGuesses={MAX_GUESSES}
          mode="daily"
          onGuess={submitGuess}
          onGiveUp={giveUp}
        />
      )}
    </section>
  )
}
