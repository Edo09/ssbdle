import { CalendarDays } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { MAX_GUESSES } from '@/types/game'
import { useI18n } from '@/i18n/useI18n'
import { GuessBoard } from '@/components/game/GuessBoard'
import { MaskIcon } from '@/components/game/SeriesIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { SMASH_SYMBOL } from '@/lib/assets'
import { todayUTC } from '@/lib/date'

export function DailyMode() {
  const { t, lang } = useI18n()
  const characters = useGameStore((s) => s.characters)
  const loadingChars = useGameStore((s) => s.loadingChars)
  const daily = useGameStore((s) => s.daily)
  const submitting = useGameStore((s) => s.submittingDaily)
  const submitGuess = useGameStore((s) => s.submitDailyGuess)
  const giveUp = useGameStore((s) => s.giveUpDaily)

  const prettyDate = new Date(todayUTC() + 'T00:00:00Z').toLocaleDateString(
    lang === 'es' ? 'es-ES' : 'en-US',
    { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' },
  )

  return (
    <section aria-labelledby="daily-mode-heading">
      <h2
        id="daily-mode-heading"
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <CalendarDays className="size-4 text-primary" />
        <span>
          {t('daily.label')} ·{' '}
          <span className="text-foreground">{prettyDate}</span>
        </span>
      </h2>

      {loadingChars && characters.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-32" />
          <div className="flex justify-center py-10">
            <MaskIcon
              src={SMASH_SYMBOL}
              className="size-14 animate-pulse text-muted-foreground/40"
            />
          </div>
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
          giveUpAnytime
        />
      )}
    </section>
  )
}
