import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { BrainCircuit, Check, RotateCcw, X } from 'lucide-react'
import type { TriviaQuestion, TriviaResult } from '@/types/game'
import { checkTriviaAnswer, getRandomTrivia } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { useI18n } from '@/i18n/useI18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MaskIcon } from '@/components/game/SeriesIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { SMASH_SYMBOL } from '@/lib/assets'
import { cn } from '@/lib/utils'

type Option = { letter: string; text: string }

export function TriviaMode() {
  const { t } = useI18n()
  const [question, setQuestion] = useState<TriviaQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [choice, setChoice] = useState<string | null>(null)
  const [result, setResult] = useState<TriviaResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const user = useAuthStore((s) => s.user)
  const refreshStats = useGameStore((s) => s.refreshServerStats)

  // Question ids already shown this session, so we don't repeat them.
  const seenRef = useRef<number[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setChoice(null)
    setResult(null)
    setError(null)
    try {
      const q = await getRandomTrivia({ exclude: seenRef.current })
      setQuestion(q)
      if (q) seenRef.current = [...seenRef.current, q.id].slice(-100)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function answer(letter: string) {
    if (result || !question) return
    setChoice(letter)
    try {
      const r = await checkTriviaAnswer(question.id, letter)
      setResult(r)
      if (user) refreshStats()
    } catch (e) {
      setChoice(null)
      toast.error((e as Error).message)
    }
  }

  const options: Option[] = question
    ? (
        [
          { letter: 'A', text: question.option_a },
          { letter: 'B', text: question.option_b },
          { letter: 'C', text: question.option_c },
          { letter: 'D', text: question.option_d },
        ] as { letter: string; text: string | null }[]
      ).filter((o): o is Option => Boolean(o.text))
    : []

  return (
    <section aria-labelledby="trivia-mode-heading">
      <h2
        id="trivia-mode-heading"
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <BrainCircuit className="size-4 text-primary" />
        <span>{t('trivia.tagline')}</span>
      </h2>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="flex justify-center py-10">
            <MaskIcon
              src={SMASH_SYMBOL}
              className="size-14 animate-pulse text-muted-foreground/40"
            />
          </div>
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : !question ? (
        <div className="hud-panel rounded-xl p-6 text-center">
          <p className="font-display text-lg">{t('trivia.noTrivia')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('trivia.noTriviaHintPre')}{' '}
            <code className="text-foreground">trivia_questions</code>{' '}
            {t('trivia.noTriviaHintPost')}
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {question.category && (
              <Badge variant="muted">{question.category}</Badge>
            )}
            {question.difficulty && (
              <Badge variant="accent">{question.difficulty}</Badge>
            )}
          </div>

          <h3 className="font-display text-xl font-bold leading-snug">
            {question.question}
          </h3>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {options.map((opt) => {
              const isCorrect = result?.correct_option === opt.letter
              const isChosenWrong =
                result != null && choice === opt.letter && !result.correct
              return (
                <button
                  key={opt.letter}
                  type="button"
                  disabled={result != null}
                  onClick={() => answer(opt.letter)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all outline-none',
                    'focus-visible:ring-2 focus-visible:ring-ring/50',
                    result == null &&
                      'border-border bg-secondary/40 hover:border-primary/50 hover:bg-secondary/70',
                    result != null &&
                      isCorrect &&
                      'border-correct/50 bg-correct/20 text-foreground',
                    isChosenWrong && 'border-destructive/50 bg-destructive/15',
                    result != null &&
                      !isCorrect &&
                      !isChosenWrong &&
                      'opacity-60',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold',
                      result != null && isCorrect
                        ? 'bg-correct text-correct-foreground'
                        : isChosenWrong
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {result != null && isCorrect ? (
                      <Check className="size-4" />
                    ) : isChosenWrong ? (
                      <X className="size-4" />
                    ) : (
                      opt.letter
                    )}
                  </span>
                  <span className="font-medium">{opt.text}</span>
                </button>
              )
            })}
          </div>

          {result && (
            <div className="animate-fade-up mt-4 hud-panel rounded-xl p-4">
              <p className="font-display font-semibold">
                {result.correct ? (
                  <span className="text-correct">{t('trivia.correct')}</span>
                ) : (
                  <span className="text-destructive">{t('trivia.notQuite')}</span>
                )}
              </p>
              {result.explanation && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.explanation}
                </p>
              )}
              <Button onClick={load} size="sm" className="mt-3">
                <RotateCcw /> {t('trivia.nextQuestion')}
              </Button>
            </div>
          )}

          {!user && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t('trivia.signInHint')}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
