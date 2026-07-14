import { Fragment, useRef } from 'react'
import type { GuessResult } from '@/types/game'
import { useI18n } from '@/i18n/useI18n'
import { COLUMN_LABEL_KEY, VISIBLE_ATTRIBUTE_KEYS } from '@/lib/columns'
import { AttributeCell } from '@/components/game/AttributeCell'
import { CharacterAvatar } from '@/components/game/CharacterAvatar'
import { GuessCard } from '@/components/game/GuessCard'
import { cn } from '@/lib/utils'

const GRID_COLS = 'minmax(4.5rem, 1.3fr) repeat(6, minmax(0, 1fr))'

function FighterTile({ result, animate = true }: { result: GuessResult; animate?: boolean }) {
  const universe = String(
    result.attributes.find((a) => a.key === 'universe')?.guess ?? '',
  )
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border bg-card px-1.5 py-1.5",
        animate && "tile-reveal"
      )}
      style={animate ? { animationDelay: '0ms' } : undefined}
    >
      <CharacterAvatar
        name={result.guess.name}
        universe={universe}
        className="size-9 shrink-0"
      />
      <span className="line-clamp-2 text-left text-sm font-semibold leading-tight">
        {result.guess.name}
      </span>
    </div>
  )
}

export function GuessGrid({ guesses }: { guesses: GuessResult[] }) {
  const { t } = useI18n()
  const initialIdsRef = useRef<Set<number>>(new Set())

  if (guesses.length === 0) {
    if (initialIdsRef.current.size > 0) {
      initialIdsRef.current.clear()
    }
    return null
  }

  if (initialIdsRef.current.size === 0 && guesses.length > 0) {
    initialIdsRef.current = new Set(guesses.map((g) => g.guess.id))
  }

  const ordered = [...guesses].reverse()

  return (
    <>
      {/* Mobile: one card per guess */}
      <div className="space-y-2 sm:hidden">
        {ordered.map((result) => {
          const animate = !initialIdsRef.current.has(result.guess.id)
          return <GuessCard key={result.guess.id} result={result} animate={animate} />
        })}
      </div>

      {/* Desktop: attribute table */}
      <div className="hidden sm:block">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: GRID_COLS }}>
          <div className="self-end pb-0.5 pl-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('columns.fighter')}
          </div>
          {VISIBLE_ATTRIBUTE_KEYS.map((key) => (
            <div
              key={'h-' + key}
              className="self-end pb-0.5 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground"
            >
              {t('columns.' + COLUMN_LABEL_KEY[key])}
            </div>
          ))}

          {ordered.map((result) => {
            const animate = !initialIdsRef.current.has(result.guess.id)
            return (
              <Fragment key={result.guess.id}>
                <FighterTile result={result} animate={animate} />
                {VISIBLE_ATTRIBUTE_KEYS.map((key, i) => {
                  const attr = result.attributes.find((a) => a.key === key)
                  return attr ? (
                    <AttributeCell key={key} attr={attr} index={i + 1} animate={animate} />
                  ) : (
                    <div key={key} />
                  )
                })}
              </Fragment>
            )
          })}
        </div>
      </div>
    </>
  )
}
