import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { formatSolveTime } from '@/lib/date'

/**
 * A live-updating stopwatch for the daily board. It starts counting from
 * `startedAt` (the first guess) and ticks each second while `running`.
 */
export function LiveTimer({
  startedAt,
  running,
}: {
  startedAt: number | null | undefined
  running: boolean
}) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!running || startedAt == null) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [running, startedAt])

  const elapsed = startedAt != null ? Math.max(0, now - startedAt) : 0
  return (
    <span
      className="flex items-center gap-1 tabular-nums text-muted-foreground"
      title="Elapsed time"
    >
      <Timer className="size-3.5" />
      <span className="font-display font-semibold text-foreground">
        {formatSolveTime(elapsed)}
      </span>
    </span>
  )
}
