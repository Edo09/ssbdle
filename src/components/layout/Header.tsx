import {
  BrainCircuit,
  Flame,
  Infinity as InfinityIcon,
  LogOut,
  Swords,
  Trophy,
  User as UserIcon,
} from 'lucide-react'
import type { Mode } from '@/types/game'
import { displayName, useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MODES: { id: Mode; label: string; icon: typeof Flame }[] = [
  { id: 'daily', label: 'Daily', icon: Flame },
  { id: 'arcade', label: 'Arcade', icon: InfinityIcon },
  { id: 'trivia', label: 'Trivia', icon: BrainCircuit },
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
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const serverStats = useGameStore((s) => s.serverStats)
  const localStats = useGameStore((s) => s.localStats)

  const streak =
    user && serverStats ? serverStats.daily_current_streak : localStats.currentStreak
  const name = displayName(user)

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <a href="/" className="group flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_6px_18px_-6px_var(--primary)]">
            <Swords className="size-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-glow">
            SMASH<span className="text-primary">DLE</span>
          </span>
        </a>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5"
            title="Current daily streak"
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
            onClick={onOpenLeaderboard}
            aria-label="Open leaderboards"
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
                aria-label="Sign out"
              >
                <LogOut />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={onOpenAuth}>
              <UserIcon /> Sign in
            </Button>
          )}
        </div>
      </div>

      <nav className="mx-auto max-w-3xl px-4 pb-3">
        <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-border bg-secondary/30 p-1.5">
          {MODES.map(({ id, label, icon: Icon }) => (
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
              {label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}
