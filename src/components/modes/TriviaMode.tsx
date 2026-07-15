import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import {
  BrainCircuit,
  Check,
  Flag,
  RotateCcw,
  SkipForward,
  Trophy,
  X,
} from 'lucide-react'
import type { TriviaQuestion } from '@/types/game'
import {
  giveUpTrivia,
  nextTrivia,
  skipTrivia,
  startTriviaRun,
  submitTriviaGuess,
} from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { useI18n } from '@/i18n/useI18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MaskIcon } from '@/components/game/SeriesIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { SMASH_SYMBOL } from '@/lib/assets'
import { cn } from '@/lib/utils'

const RUN_LENGTH = 10

type Phase = 'idle' | 'starting' | 'playing' | 'finished'
type QStatus = 'unanswered' | 'incorrect' | 'correct' | 'revealed' | 'skipped'
type Session = { id: number; token: string; length: number }
type Reveal = { correctOption: string; explanation: string | null; gained: number }
type Option = { letter: string; text: string }
type Summary = { score: number; length: number; correct: number }

export function TriviaMode() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const refreshStats = useGameStore((s) => s.refreshServerStats)

  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [session, setSession] = useState<Session | null>(null)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState<TriviaQuestion | null>(null)

  const [qStatus, setQStatus] = useState<QStatus>('unanswered')
  const [eliminated, setEliminated] = useState<string[]>([])
  const [reveal, setReveal] = useState<Reveal | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)

  const terminal =
    qStatus === 'correct' || qStatus === 'revealed' || qStatus === 'skipped'

  const startRun = useCallback(async () => {
    setPhase('starting')
    setError(null)
    setSummary(null)
    try {
      const run = await startTriviaRun({ length: RUN_LENGTH })
      setSession({ id: run.session_id, token: run.token, length: run.length })
      setIndex(run.index)
      setScore(run.score)
      setQuestion(run.question)
      setQStatus('unanswered')
      setEliminated([])
      setReveal(null)
      setPhase('playing')
    } catch (e) {
      setError((e as Error).message)
      setPhase('idle')
    }
  }, [])

  async function answer(letter: string) {
    if (!session || busy || terminal || eliminated.includes(letter)) return
    setBusy(true)
    try {
      const r = await submitTriviaGuess(session.id, session.token, letter)
      if (r.correct) {
        setScore(r.session_score)
        setQStatus('correct')
        setReveal({
          correctOption: r.correct_option ?? letter,
          explanation: r.explanation ?? null,
          gained: r.score ?? 0,
        })
      } else {
        setEliminated(r.eliminated ?? [...eliminated, letter])
        setQStatus('incorrect')
      }
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function giveUp() {
    if (!session || busy || terminal) return
    setBusy(true)
    try {
      const r = await giveUpTrivia(session.id, session.token)
      setQStatus('revealed')
      setReveal({
        correctOption: r.correct_option,
        explanation: r.explanation ?? null,
        gained: 0,
      })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function skip() {
    if (!session || busy || terminal) return
    setBusy(true)
    try {
      await skipTrivia(session.id, session.token)
      setQStatus('skipped')
      setReveal(null)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function next() {
    if (!session || busy) return
    setBusy(true)
    try {
      const r = await nextTrivia(session.id, session.token)
      if (r.finished) {
        setSummary(r.summary ?? { score, length: session.length, correct: 0 })
        setPhase('finished')
        if (user) refreshStats()
      } else {
        setIndex(r.index ?? index + 1)
        setScore(r.score ?? score)
        setQuestion(r.question ?? null)
        setQStatus('unanswered')
        setEliminated([])
        setReveal(null)
      }
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
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

      {error && phase === 'idle' && (
        <p className="mb-3 text-sm text-destructive">{error}</p>
      )}

      {phase === 'idle' && (
        <div className="hud-panel rounded-2xl p-6 text-center">
          <MaskIcon
            src={SMASH_SYMBOL}
            className="mx-auto size-16 text-primary opacity-80"
          />
          <h3 className="mt-3 font-display text-xl font-bold">
            {t('trivia.startTitle')}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {t('trivia.startBody')}
          </p>
          <Button onClick={startRun} className="mt-4">
            <BrainCircuit /> {t('trivia.startBtn')}
          </Button>
          {!user && (
            <p className="mt-3 text-xs text-muted-foreground">
              {t('trivia.signInHint')}
            </p>
          )}
        </div>
      )}

      {phase === 'starting' && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="flex justify-center py-8">
            <MaskIcon
              src={SMASH_SYMBOL}
              className="size-14 animate-pulse text-muted-foreground/40"
            />
          </div>
        </div>
      )}

      {phase === 'playing' && question && (
        <div>
          <div className="mb-3 flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-muted-foreground">
              {t('trivia.question')}{' '}
              <span className="font-display font-bold tabular-nums text-foreground">
                {index + 1}
              </span>{' '}
              / {session?.length ?? RUN_LENGTH}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-yellow/30 bg-yellow/10 px-2 py-1">
              <Trophy className="size-3.5 text-yellow" />
              <span className="font-display text-sm font-bold tabular-nums">
                {score}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {t('trivia.score')}
              </span>
            </span>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {question.category && <Badge variant="muted">{question.category}</Badge>}
            {question.difficulty && (
              <Badge variant="accent">{question.difficulty}</Badge>
            )}
          </div>

          <h3 className="font-display text-xl font-bold leading-snug">
            {question.question}
          </h3>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {options.map((opt) => {
              const isEliminated = eliminated.includes(opt.letter)
              const isAnswer = reveal?.correctOption === opt.letter
              const showAnswer = terminal && isAnswer && qStatus !== 'skipped'
              return (
                <button
                  key={opt.letter}
                  type="button"
                  disabled={terminal || isEliminated || busy}
                  onClick={() => answer(opt.letter)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all outline-none',
                    'focus-visible:ring-2 focus-visible:ring-ring/50',
                    !terminal &&
                      !isEliminated &&
                      'border-border bg-secondary/40 hover:border-primary/50 hover:bg-secondary/70',
                    showAnswer && 'border-correct/50 bg-correct/20 text-foreground',
                    isEliminated && 'border-destructive/50 bg-destructive/10 opacity-70',
                    terminal && !showAnswer && !isEliminated && 'opacity-60',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold',
                      showAnswer
                        ? 'bg-correct text-correct-foreground'
                        : isEliminated
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {showAnswer ? (
                      <Check className="size-4" />
                    ) : isEliminated ? (
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

          {qStatus === 'incorrect' && (
            <p className="mt-3 text-sm font-medium text-destructive">
              {t('trivia.tryAgain')}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2">
            {!terminal ? (
              <>
                <Button
                  onClick={giveUp}
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  className="border border-destructive bg-destructive/25 text-destructive-foreground hover:bg-destructive/40"
                >
                  <Flag /> {t('common.giveUp')}
                </Button>
                <Button
                  onClick={skip}
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  className="border border-border"
                >
                  <SkipForward /> {t('trivia.skip')}
                </Button>
              </>
            ) : (
              <Button onClick={next} disabled={busy}>
                <RotateCcw /> {t('trivia.next')}
              </Button>
            )}
          </div>

          {terminal && (
            <div className="animate-fade-up mt-4 hud-panel rounded-xl p-4">
              <p className="font-display font-semibold">
                {qStatus === 'correct' ? (
                  <span className="text-correct">
                    {t('trivia.correct')} +{reveal?.gained ?? 0} {t('trivia.pts')}
                  </span>
                ) : qStatus === 'revealed' ? (
                  <span className="text-destructive">{t('trivia.notQuite')}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {t('trivia.skipped')}
                  </span>
                )}
              </p>
              {reveal && qStatus !== 'skipped' && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('trivia.revealed')}:{' '}
                  <span className="font-semibold text-foreground">
                    {options.find((o) => o.letter === reveal.correctOption)?.text ??
                      reveal.correctOption}
                  </span>
                </p>
              )}
              {reveal?.explanation && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {reveal.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {phase === 'finished' && summary && (
        <div className="hud-panel animate-fade-up rounded-2xl p-6 text-center">
          <Trophy className="mx-auto size-14 text-yellow" />
          <h3 className="mt-3 font-display text-2xl font-bold">
            {t('trivia.runComplete')}
          </h3>
          <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
            {t('trivia.finalScore')}
          </p>
          <p className="font-display text-4xl font-black tabular-nums text-yellow">
            {summary.score}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">
              {summary.correct}
            </span>{' '}
            / {summary.length} {t('trivia.outOf')}
          </p>
          <Button onClick={startRun} className="mt-4">
            <RotateCcw /> {t('trivia.playAgain')}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {user ? t('trivia.saved') : t('trivia.signInHint')}
          </p>
        </div>
      )}
    </section>
  )
}
