import { useEffect, useState } from 'react'
import { Flame, Trophy } from 'lucide-react'
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

function RankBadge({ rank }: { rank: number }) {
  const medal =
    rank === 1
      ? 'bg-accent/20 text-accent'
      : rank === 2
        ? 'bg-muted-foreground/20 text-foreground'
        : rank === 3
          ? 'bg-primary/20 text-primary'
          : 'bg-secondary text-muted-foreground'
  return (
    <span
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold',
        medal,
      )}
    >
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

function Row({
  rank,
  name,
  me,
  meLabel,
  cells,
}: {
  rank: number
  name: string
  me: boolean
  meLabel: string
  cells: { label: string; value: string | number }[]
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-3 py-2',
        me
          ? 'border-primary/50 bg-primary/10'
          : 'border-transparent bg-secondary/30',
      )}
    >
      <RankBadge rank={rank} />
      <span className="flex-1 truncate font-semibold">
        {name}
        {me && <span className="ml-1.5 text-xs text-primary">{meLabel}</span>}
      </span>
      {cells.map((c) => (
        <span key={c.label} className="w-14 text-right font-display text-sm">
          <span className="tabular-nums">{c.value}</span>
        </span>
      ))}
    </div>
  )
}

export function LeaderboardDialog({ open, onOpenChange }: Props) {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const me = displayName(user)

  const [loading, setLoading] = useState(true)
  const [daily, setDaily] = useState<DailyLeaderRow[]>([])
  const [arcade, setArcade] = useState<ArcadeLeaderRow[]>([])
  const [trivia, setTrivia] = useState<TriviaLeaderRow[]>([])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    Promise.allSettled([
      fetchDailyLeaderboard(),
      fetchArcadeLeaderboard(),
      fetchTriviaLeaderboard(),
    ]).then((res) => {
      if (cancelled) return
      if (res[0].status === 'fulfilled') setDaily(res[0].value)
      if (res[1].status === 'fulfilled') setArcade(res[1].value)
      if (res[2].status === 'fulfilled') setTrivia(res[2].value)
      setLoading(false)
    })
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-accent" />
            <DialogTitle>{t('leaderboard.title')}</DialogTitle>
          </div>
          <DialogDescription>{t('leaderboard.subtitle')}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="daily">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">
              <Flame className="size-4" /> {t('header.daily')}
            </TabsTrigger>
            <TabsTrigger value="arcade">{t('header.arcade')}</TabsTrigger>
            <TabsTrigger value="trivia">{t('header.trivia')}</TabsTrigger>
          </TabsList>

          <div className="mt-3 max-h-[52vh] overflow-y-auto pr-1">
            <TabsContent value="daily" className="space-y-1.5">
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
                    cells={[
                      { label: 'streak', value: r.current_streak },
                      { label: 'best', value: r.best_streak },
                      { label: 'wins', value: r.wins },
                    ]}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="arcade" className="space-y-1.5">
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
                    cells={[
                      { label: 'wins', value: r.wins },
                      { label: 'best', value: r.best_guesses ?? '—' },
                    ]}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="trivia" className="space-y-1.5">
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
                    cells={[
                      { label: 'correct', value: r.correct },
                      {
                        label: 'acc',
                        value: r.accuracy_pct != null ? `${r.accuracy_pct}%` : '—',
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
