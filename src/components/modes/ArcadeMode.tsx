import { useEffect } from 'react'
import { Infinity as InfinityIcon } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { useI18n } from '@/i18n/useI18n'
import { GuessBoard } from '@/components/game/GuessBoard'
import { Skeleton } from '@/components/ui/skeleton'

export function ArcadeMode() {
  const { t } = useI18n()
  const characters = useGameStore((s) => s.characters)
  const arcade = useGameStore((s) => s.arcade)
  const roundId = useGameStore((s) => s.arcadeRoundId)
  const starting = useGameStore((s) => s.startingArcade)
  const submitting = useGameStore((s) => s.submittingArcade)
  const startArcade = useGameStore((s) => s.startArcade)
  const submitGuess = useGameStore((s) => s.submitArcadeGuess)
  const giveUp = useGameStore((s) => s.giveUpArcade)

  useEffect(() => {
    if (!roundId && !starting) startArcade()
  }, [roundId, starting, startArcade])

  return (
    <section aria-label={t('header.arcade')}>
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <InfinityIcon className="size-4 text-primary" />
        <span>
          {t('arcade.label')} ·{' '}
          <span className="text-foreground">{t('arcade.tagline')}</span>
        </span>
      </div>

      {starting && !roundId ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <GuessBoard
          characters={characters}
          guesses={arcade.guesses}
          status={arcade.status}
          answer={arcade.answer}
          submitting={submitting}
          starting={starting}
          mode="arcade"
          onGuess={submitGuess}
          onGiveUp={giveUp}
          onPlayAgain={startArcade}
        />
      )}
    </section>
  )
}
