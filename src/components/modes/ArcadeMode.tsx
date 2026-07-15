import { useState } from 'react'
import { Infinity as InfinityIcon, Swords } from 'lucide-react'
import { useI18n } from '@/i18n/useI18n'
import { ArcadeEndless } from '@/components/modes/ArcadeEndless'
import { RunMode } from '@/components/modes/RunMode'
import { cn } from '@/lib/utils'

type Sub = 'run' | 'endless'

const SUBS: { id: Sub; icon: typeof Swords }[] = [
  { id: 'run', icon: Swords },

  { id: 'endless', icon: InfinityIcon },
]

export function ArcadeMode() {
  const { t } = useI18n()
  const [sub, setSub] = useState<Sub>('run')

  return (
    <section aria-labelledby="arcade-mode-heading">
      <h2 id="arcade-mode-heading" className="sr-only">
        {t('header.arcade')}
      </h2>

      <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-secondary/30 p-1.5">
        {SUBS.map(({ id, icon: Icon }) => {
          const active = sub === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSub(id)}
              aria-pressed={active}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                active
                  ? 'bg-accent text-accent-foreground shadow-[0_6px_18px_-8px_var(--accent)]'
                  : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {t('run.' + id)}
            </button>
          )
        })}
      </div>

      {sub === 'endless' ? <ArcadeEndless /> : <RunMode />}
    </section>
  )
}
