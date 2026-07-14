import { useMemo } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import type { BoardStatus } from '@/store/useGameStore'
import type { Character, GuessResult, Mode } from '@/types/game'
import { useI18n } from '@/i18n/useI18n'
import { SMASH_SYMBOL } from '@/lib/assets'
import { Button } from '@/components/ui/button'
import { GuessInput } from '@/components/game/GuessInput'
import { GuessGrid } from '@/components/game/GuessGrid'
import { Legend } from '@/components/game/Legend'
import { MaskIcon } from '@/components/game/SeriesIcon'
import { ResultBanner } from '@/components/game/ResultBanner'

interface Props {
  characters: Character[]
  guesses: GuessResult[]
  status: BoardStatus
  answer: Character | null
  submitting?: boolean
  starting?: boolean
  maxGuesses?: number
  mode: Mode
  onGuess: (c: Character) => void
  onGiveUp?: () => void
  onPlayAgain?: () => void
}

export function GuessBoard({
  characters,
  guesses,
  status,
  answer,
  submitting,
  starting,
  maxGuesses,
  mode,
  onGuess,
  onGiveUp,
  onPlayAgain,
}: Props) {
  const { t } = useI18n()
  const excludeIds = useMemo(
    () => new Set(guesses.map((g) => g.guess.id)),
    [guesses],
  )
  const playing = status === 'playing'
  const remaining =
    maxGuesses != null ? Math.max(0, maxGuesses - guesses.length) : null

  return (
    <div>
      {playing && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <GuessInput
                characters={characters}
                excludeIds={excludeIds}
                onGuess={onGuess}
                disabled={submitting || starting || characters.length === 0}
              />
            </div>
            {submitting && (
              <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
            )}
          </div>

          <div className="flex items-center justify-between px-0.5 text-sm">
            <span className="text-muted-foreground">
              {remaining != null ? (
                <>
                  <span className="font-display font-semibold text-foreground">
                    {remaining}
                  </span>{' '}
                  {t(remaining === 1 ? 'board.leftOne' : 'board.leftMany')}
                </>
              ) : (
                <>
                  <span className="font-display font-semibold text-foreground">
                    {guesses.length}
                  </span>{' '}
                  {t(guesses.length === 1 ? 'board.countOne' : 'board.countMany')}
                </>
              )}
            </span>
            {onGiveUp && guesses.length > 0 && (
              <Button
                onClick={onGiveUp}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <Flag /> {t('common.giveUp')}
              </Button>
            )}
          </div>
        </div>
      )}

      {playing && guesses.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12">
          <MaskIcon
            src={SMASH_SYMBOL}
            className="size-28 text-foreground opacity-[0.07]"
          />
          <p className="text-sm text-muted-foreground/70">
            {t('board.emptyHint')}
          </p>
        </div>
      )}

      {!playing && (
        <ResultBanner
          status={status}
          answer={answer}
          guesses={guesses}
          mode={mode}
          onPlayAgain={onPlayAgain}
        />
      )}

      <div className="mt-4">
        <GuessGrid guesses={guesses} />
      </div>

      {guesses.length > 0 && <Legend />}
    </div>
  )
}
