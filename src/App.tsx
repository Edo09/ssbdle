import { useEffect, useState } from 'react'
import type { Mode } from '@/types/game'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/Header'
import { DailyMode } from '@/components/modes/DailyMode'
import { ArcadeMode } from '@/components/modes/ArcadeMode'
import { TriviaMode } from '@/components/modes/TriviaMode'
import { AuthDialog } from '@/components/auth/AuthDialog'
import { LeaderboardDialog } from '@/components/leaderboard/LeaderboardDialog'

function App() {
  const [mode, setMode] = useState<Mode>('daily')
  const [authOpen, setAuthOpen] = useState(false)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)

  const initAuth = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const loadCharacters = useGameStore((s) => s.loadCharacters)
  const refreshServerStats = useGameStore((s) => s.refreshServerStats)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  useEffect(() => {
    loadCharacters()
  }, [loadCharacters])

  // Pull streak/stats whenever the signed-in user changes.
  useEffect(() => {
    refreshServerStats()
  }, [user, refreshServerStats])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="app-bg" aria-hidden />
      <div className="flex min-h-dvh flex-col">
        <Header
          mode={mode}
          onModeChange={setMode}
          onOpenAuth={() => setAuthOpen(true)}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
        />

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          <div className="hud-panel animate-fade-up rounded-2xl p-5 sm:p-6">
            {mode === 'daily' && <DailyMode />}
            {mode === 'arcade' && <ArcadeMode />}
            {mode === 'trivia' && <TriviaMode />}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Fan-made · not affiliated with Nintendo. Fighter data from Super
            Smash Bros. Ultimate.
          </p>
        </main>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <LeaderboardDialog
        open={leaderboardOpen}
        onOpenChange={setLeaderboardOpen}
      />
      <Toaster />
    </TooltipProvider>
  )
}

export default App
