import {
  BrainCircuit,
  Flame,
  Infinity as InfinityIcon,
  Languages,
  LogOut,
  Swords,
  Trophy,
  User as UserIcon,
} from 'lucide-react'
import type { Mode } from '@/types/game'
import { displayName, useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { useI18n } from '@/i18n/useI18n'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MODES: { id: Mode; icon: typeof Flame }[] = [
  { id: 'daily', icon: Flame },
  { id: 'arcade', icon: InfinityIcon },
  { id: 'trivia', icon: BrainCircuit },
]

interface Props {
  mode: Mode
  onModeChange: (m: Mode) => void
  onOpenAuth: () => void
  onOpenLeaderboard: () => void
}

export function Header({
  mode,
  onModeChange,
  onOpenAuth,
  onOpenLeaderboard,
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
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_6px_18px_-6px_var(--primary)] sm:size-9">
            <Swords className="size-4 sm:size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-glow sm:text-xl">
            SMASH<span className="text-primary">DLE</span>
          </span>
        </a>

        <div className="flex items-center gap-1.5">
          <div
            className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 px-2 py-1.5"
            title={t('header.streakTitle')}
          >
            <Flame
              className={cn(
                'size-4',
                streak > 0 ? 'text-primary' : 'text-muted-foreground',
              )}
            />
            <span className="font-display text-sm font-bold tabular-nums">
              {streak}
            </span>
          </div>

          <Button
            variant="secondary"
            size="icon"
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            aria-label={t('header.switchLanguage')}
            title={t('header.switchLanguage')}
          >
            <Languages />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={onOpenLeaderboard}
            aria-label={t('header.leaderboards')}
          >
            <Trophy />
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
          {MODES.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onModeChange(id)}
              aria-pressed={mode === id}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                mode === id
                  ? 'bg-primary text-primary-foreground shadow-[0_6px_18px_-8px_var(--primary)]'
                  : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {t('header.' + id)}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}
