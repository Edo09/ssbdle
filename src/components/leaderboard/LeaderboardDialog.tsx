import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { BrainCircuit, Crosshair, Flame, Medal, Target, Trophy } from 'lucide-react'
import {
  fetchArcadeLeaderboard,
  fetchDailyLeaderboard,
  fetchTriviaLeaderboard,
} from '@/lib/api'
import type {
  ArcadeLeaderRow,
  DailyLeaderRow,
  TriviaLeaderRow,
} from '@/types/game'
import { displayName, useAuthStore } from '@/store/useAuthStore'
import { useI18n } from '@/i18n/useI18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type LeaderboardMode = 'daily' | 'arcade' | 'trivia'

function RankBadge({ rank }: { rank: number }) {
  const medal =
    rank === 1
      ? 'border-yellow/35 bg-yellow/15 text-yellow shadow-[0_0_18px_-8px_var(--yellow)]'
      : rank === 2
        ? 'border-foreground/15 bg-foreground/10 text-foreground'
      : rank === 3
          ? 'border-orange/35 bg-orange/15 text-orange'
          : 'border-border bg-secondary text-muted-foreground'
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center gap-0.5 rounded-lg border font-display text-sm font-bold',
        medal,
      )}
      aria-label={`Rank ${rank}`}
    >
      {rank <= 3 && <Medal className="size-3" aria-hidden />}
      {rank}
    </span>
  )
}

function LoadingRows() {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

interface Metric {
  icon: LucideIcon
  label: string
  value: string | number
  detail?: string
  tone: string
}

function Metric({ icon: Icon, label, value, detail, tone }: Metric) {
  const description = [label, String(value), detail]
    .filter((part) => part != null && part !== '')
    .join(' · ')

  return (
    <div
      className="min-w-[3.65rem] rounded-lg border border-border/70 bg-background/35 px-1.5 py-1.5 text-center sm:min-w-[4.4rem]"
      title={description}
      aria-label={description}
    >
      <div className="flex items-center justify-center gap-1">
        <Icon className={cn('size-3.5 shrink-0', tone)} aria-hidden />
        <span className="font-display text-base font-bold leading-none tabular-nums text-foreground">
          {value}
        </span>
      </div>
      <span className="mt-1 block text-[9px] font-bold uppercase leading-[1.05] tracking-[0.08em] text-muted-foreground sm:text-[10px]">
        {label}
      </span>
      {detail && (
        <span className="mt-0.5 block text-[9px] leading-none text-muted-foreground/75">
          {detail}
        </span>
      )}
    </div>
  )
}

function Row({
  rank,
  name,
  me,
  meLabel,
  metrics,
}: {
  rank: number
  name: string
  me: boolean
  meLabel: string
  metrics: Metric[]
}) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2.5 rounded-xl border p-2 transition-colors sm:gap-3',
        me
          ? 'border-primary/50 bg-primary/10 shadow-[0_0_0_1px_rgba(255,70,85,0.08)]'
          : 'border-border/50 bg-secondary/25 hover:border-border hover:bg-secondary/40',
      )}
    >
      <RankBadge rank={rank} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold leading-tight">
          {name}
          {me && (
            <span className="ml-1.5 align-middle text-[10px] font-bold uppercase tracking-wider text-primary">
              {meLabel}
            </span>
          )}
        </div>
        <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          #{rank}
        </span>
      </div>
      <div className="flex shrink-0 gap-1.5 sm:gap-2">
        {metrics.map((metric) => (
          <Metric key={metric.label} {...metric} />
        ))}
      </div>
    </div>
  )
}

export function LeaderboardDialog({ open, onOpenChange }: Props) {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const me = displayName(user)

  const [mode, setMode] = useState<LeaderboardMode>('daily')
  const [loading, setLoading] = useState(true)
  const [daily, setDaily] = useState<DailyLeaderRow[]>([])
  const [arcade, setArcade] = useState<ArcadeLeaderRow[]>([])
  const [trivia, setTrivia] = useState<TriviaLeaderRow[]>([])

  useEffect(() => {
    if (!open) return
    let cancelled = false

    async function loadLeaderboards() {
      setLoading(true)
      const res = await Promise.allSettled([
        fetchDailyLeaderboard(),
        fetchArcadeLeaderboard(),
        fetchTriviaLeaderboard(),
      ])
      if (cancelled) return
      if (res[0].status === 'fulfilled') setDaily(res[0].value)
      if (res[1].status === 'fulfilled') setArcade(res[1].value)
      if (res[2].status === 'fulfilled') setTrivia(res[2].value)
      setLoading(false)
    }

    void loadLeaderboards()

    return () => {
      cancelled = true
    }
  }, [open])

  const empty = (
    <p className="py-10 text-center text-sm text-muted-foreground">
      {t('leaderboard.empty')}
    </p>
  )
  const meLabel = t('common.you')
  const guides: Record<LeaderboardMode, string> = {
    daily: t('leaderboard.dailyGuide'),
    arcade: t('leaderboard.arcadeGuide'),
    trivia: t('leaderboard.triviaGuide'),
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border/70 px-5 pb-4 pt-5 pr-12 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-accent" />
            <DialogTitle>{t('leaderboard.title')}</DialogTitle>
          </div>
          <DialogDescription>{t('leaderboard.subtitle')}</DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => setMode(value as LeaderboardMode)}>
          <div className="space-y-3 px-5 pt-4 sm:px-6">
            <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">
              <Flame className="size-4" /> {t('header.daily')}
            </TabsTrigger>
            <TabsTrigger value="arcade">
              <Crosshair className="size-4" /> {t('header.arcade')}
            </TabsTrigger>
            <TabsTrigger value="trivia">
              <BrainCircuit className="size-4" /> {t('header.trivia')}
            </TabsTrigger>
            </TabsList>

            <div className="flex items-start gap-2 rounded-lg border border-accent/15 bg-accent/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              <Target className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
              <p>{guides[mode]}</p>
            </div>
          </div>

          <div className="mt-3 max-h-[52vh] overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
            <TabsContent value="daily" className="space-y-2">
              {loading ? (
                <LoadingRows />
              ) : daily.length === 0 ? (
                empty
              ) : (
                daily.map((r) => (
                  <Row
                    key={r.rank}
                    rank={r.rank}
                    name={r.username}
                    me={r.username === me}
                    meLabel={meLabel}
                    metrics={[
                      {
                        icon: Flame,
                        label: t('leaderboard.streak'),
                        value: r.current_streak,
                        tone: 'text-orange',
                      },
                      {
                        icon: Medal,
                        label: t('leaderboard.record'),
                        value: r.best_streak,
                        tone: 'text-yellow',
                      },
                      {
                        icon: Trophy,
                        label: t('leaderboard.wins'),
                        value: r.wins,
                        tone: 'text-accent',
                      },
                    ]}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="arcade" className="space-y-2">
              {loading ? (
                <LoadingRows />
              ) : arcade.length === 0 ? (
                empty
              ) : (
                arcade.map((r) => (
                  <Row
                    key={r.rank}
                    rank={r.rank}
                    name={r.username}
                    me={r.username === me}
                    meLabel={meLabel}
                    metrics={[
                      {
                        icon: Trophy,
                        label: t('leaderboard.wins'),
                        value: r.wins,
                        tone: 'text-accent',
                      },
                      {
                        icon: Crosshair,
                        label: t('leaderboard.bestRound'),
                        value: r.best_guesses ?? '—',
                        detail: t('leaderboard.guesses'),
                        tone: 'text-primary',
                      },
                    ]}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="trivia" className="space-y-2">
              {loading ? (
                <LoadingRows />
              ) : trivia.length === 0 ? (
                empty
              ) : (
                trivia.map((r) => (
                  <Row
                    key={r.rank}
                    rank={r.rank}
                    name={r.username}
                    me={r.username === me}
                    meLabel={meLabel}
                    metrics={[
                      {
                        icon: BrainCircuit,
                        label: t('leaderboard.correct'),
                        value: r.correct,
                        tone: 'text-green',
                      },
                      {
                        icon: Target,
                        label: t('leaderboard.accuracy'),
                        value: r.accuracy_pct != null ? `${r.accuracy_pct}%` : '—',
                        tone: 'text-purple',
                      },
                    ]}
                  />
                ))
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
