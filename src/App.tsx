import { useEffect, useState } from 'react'
import type { Mode } from '@/types/game'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { useI18n } from '@/i18n/useI18n'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/Header'
import { PageTransition } from '@/components/layout/PageTransition'
import { DailyMode } from '@/components/modes/DailyMode'
import { ArcadeMode } from '@/components/modes/ArcadeMode'
import { TriviaMode } from '@/components/modes/TriviaMode'
import { AuthDialog } from '@/components/auth/AuthDialog'
import { LeaderboardDialog } from '@/components/leaderboard/LeaderboardDialog'

function App() {
  const { t, lang } = useI18n()
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

  useEffect(() => {
    refreshServerStats()
  }, [user, refreshServerStats])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

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

        <main className="mx-auto w-full max-w-4xl flex-1 px-2.5 py-4 sm:px-4 sm:py-6">
          <div className="hud-panel animate-fade-up rounded-2xl p-2.5 sm:p-6">
            <PageTransition pageKey={mode}>
              {mode === 'daily' && <DailyMode />}
              {mode === 'arcade' && <ArcadeMode />}
              {mode === 'trivia' && <TriviaMode />}
            </PageTransition>
          </div>

          <p className="mt-6 px-2 text-center text-xs text-muted-foreground">
            {t('footer')}
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
