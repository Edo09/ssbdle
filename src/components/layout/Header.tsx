import {
  BrainCircuit,
  Flame,
  HelpCircle,
  Infinity as InfinityIcon,
  Languages,
  LogOut,
  Trophy,
  User as UserIcon,
} from 'lucide-react'
import type { Mode } from '@/types/game'
import { SMASH_SYMBOL } from '@/lib/assets'
import { MaskIcon } from '@/components/game/SeriesIcon'
import { displayName, useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { useI18n } from '@/i18n/useI18n'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MODES: { id: Mode; icon: typeof Flame; color: string }[] = [
  { id: 'daily', icon: Flame, color: 'var(--primary)' },
  { id: 'arcade', icon: InfinityIcon, color: 'var(--accent)' },
  { id: 'trivia', icon: BrainCircuit, color: 'var(--green)' },
]

interface Props {
  mode: Mode
  onModeChange: (m: Mode) => void
  onOpenAuth: () => void
  onOpenLeaderboard: () => void
  onOpenHelp: () => void
}

export function Header({
  mode,
  onModeChange,
  onOpenAuth,
  onOpenLeaderboard,
  onOpenHelp,
}: Props) {
  const { t, lang, setLang } = useI18n()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const serverStats = useGameStore((s) => s.serverStats)
  const localStats = useGameStore((s) => s.localStats)

  const streak =
    user && serverStats ? serverStats.daily_current_streak : localStats.currentStreak
  const name = displayName(user)

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
        <a href="/" className="group flex shrink-0 items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg border border-primary/40 bg-gradient-to-br from-primary/30 to-accent/30 shadow-[0_6px_18px_-6px_var(--primary)] sm:size-10">
            <MaskIcon src={SMASH_SYMBOL} className="size-5 text-foreground sm:size-6" />
          </span>
          <h1 className="font-display text-lg font-bold tracking-tight text-glow sm:text-xl">
            SSBU
            <span className="bg-gradient-to-r from-[#ff4655] to-[#ffc93c] bg-clip-text text-transparent">
              DLE
            </span>
          </h1>
        </a>

        <div className="flex items-center gap-1.5">
          <div
            className="flex items-center gap-1 rounded-lg border border-orange/30 bg-orange/10 px-2 py-1.5"
            title={t('header.streakTitle')}
          >
            <Flame
              className={cn(
                'size-4',
                streak > 0 ? 'text-orange' : 'text-muted-foreground',
              )}
            />
            <span className="font-display text-sm font-bold tabular-nums">
              {streak}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="leaderboard-btn group flex items-center gap-1.5 rounded-lg border border-yellow/40 bg-yellow/10 px-2.5 py-1.5 text-sm font-semibold text-yellow transition-all hover:bg-yellow/20 hover:shadow-[0_0_16px_-4px_var(--yellow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow/50"
            aria-label={t('header.leaderboards')}
          >
            <Trophy className="size-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">{t('leaderboard.title')}</span>
          </button>

          <Button
            variant="secondary"
            size="icon"
            onClick={onOpenHelp}
            className="border-green/30 bg-green/10 text-green hover:bg-green/20"
            aria-label={t('header.help')}
            title={t('header.help')}
          >
            <HelpCircle />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
            aria-label={t('header.switchLanguage')}
            title={t('header.switchLanguage')}
          >
            <Languages />
          </Button>
          
          {user ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden max-w-28 truncate text-sm font-semibold sm:inline">
                {name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                aria-label={t('common.signOut')}
              >
                <LogOut />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={onOpenAuth} aria-label={t('common.signIn')}>
              <UserIcon />
              <span className="hidden sm:inline">{t('common.signIn')}</span>
            </Button>
          )}
        </div>
      </div>

      <nav className="mx-auto max-w-4xl px-3 pb-2.5 sm:px-4 sm:pb-3">
        <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-border bg-secondary/30 p-1.5">
          {MODES.map(({ id, icon: Icon, color }) => {
            const active = mode === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onModeChange(id)}
                aria-pressed={active}
                style={
                  active
                    ? { background: color, boxShadow: `0 6px 18px -8px ${color}` }
                    : undefined
                }
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  active
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                )}
              >
                <Icon className="size-4" style={active ? undefined : { color }} />
                {t('header.' + id)}
              </button>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
