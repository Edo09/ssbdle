import { useEffect } from 'react'
import { Infinity as InfinityIcon } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { GuessBoard } from '@/components/game/GuessBoard'
import { Skeleton } from '@/components/ui/skeleton'

export function ArcadeMode() {
  const characters = useGameStore((s) => s.characters)
  const arcade = useGameStore((s) => s.arcade)
  const roundId = useGameStore((s) => s.arcadeRoundId)
  const starting = useGameStore((s) => s.startingArcade)
  const submitting = useGameStore((s) => s.submittingArcade)
  const startArcade = useGameStore((s) => s.startArcade)
  const submitGuess = useGameStore((s) => s.submitArcadeGuess)
  const giveUp = useGameStore((s) => s.giveUpArcade)

  // Kick off the first round when entering the mode.
  useEffect(() => {
    if (!roundId && !starting) startArcade()
  }, [roundId, starting, startArcade])

  return (
    <section aria-label="Arcade mode">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <InfinityIcon className="size-4 text-primary" />
        <span>
          Endless mode · a{' '}
          <span className="text-foreground">random fighter</span> every round
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
