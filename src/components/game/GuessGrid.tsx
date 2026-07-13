import { Fragment } from 'react'
import type { GuessResult } from '@/types/game'
import { useI18n } from '@/i18n/useI18n'
import { COLUMN_LABEL_KEY, VISIBLE_ATTRIBUTE_KEYS } from '@/lib/columns'
import { AttributeCell } from '@/components/game/AttributeCell'
import { CharacterAvatar } from '@/components/game/CharacterAvatar'
import { GuessCard } from '@/components/game/GuessCard'

const GRID_COLS = 'minmax(4.5rem, 1.3fr) repeat(5, minmax(0, 1fr))'

function FighterTile({ result }: { result: GuessResult }) {
  const universe = String(
    result.attributes.find((a) => a.key === 'universe')?.guess ?? '',
  )
  return (
    <div
      className="tile-reveal flex items-center gap-1.5 rounded-lg border border-border bg-card px-1.5 py-1.5"
      style={{ animationDelay: '0ms' }}
    >
      <CharacterAvatar
        name={result.guess.name}
        gameName={result.guess.game_name}
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
  if (guesses.length === 0) return null
  const ordered = [...guesses].reverse()

  return (
    <>
      {/* Mobile: one card per guess */}
      <div className="space-y-2 sm:hidden">
        {ordered.map((result) => (
          <GuessCard key={result.guess.id} result={result} />
        ))}
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

          {ordered.map((result) => (
            <Fragment key={result.guess.id}>
              <FighterTile result={result} />
              {VISIBLE_ATTRIBUTE_KEYS.map((key, i) => {
                const attr = result.attributes.find((a) => a.key === key)
                return attr ? (
                  <AttributeCell key={key} attr={attr} index={i + 1} />
                ) : (
                  <div key={key} />
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  )
}
