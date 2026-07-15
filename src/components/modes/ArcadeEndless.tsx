import { useEffect } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { GuessBoard } from '@/components/game/GuessBoard'
import { MaskIcon } from '@/components/game/SeriesIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { SMASH_SYMBOL } from '@/lib/assets'

/** Original Arcade behavior: one random fighter at a time, unlimited guesses. */
export function ArcadeEndless() {
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

  if (starting && !roundId) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-4 w-24" />
        <div className="flex justify-center py-10">
          <MaskIcon
            src={SMASH_SYMBOL}
            className="size-14 animate-pulse text-muted-foreground/40"
          />
        </div>
      </div>
    )
  }

  return (
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
  )
}
