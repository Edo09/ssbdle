import type { GuessResult } from '@/types/game'
import { AttributeCell } from '@/components/game/AttributeCell'
import { CharacterAvatar } from '@/components/game/CharacterAvatar'

const COLUMN_LABELS = [
  'Universe',
  'Gender',
  'Type',
  'Debut',
  'Weight',
  'No.',
  'Year',
]

function GuessRow({ result }: { result: GuessResult }) {
  const universe = String(
    result.attributes.find((a) => a.key === 'universe')?.guess ?? '',
  )
  return (
    <div className="flex gap-1.5">
      <div
        className="tile-reveal flex h-[70px] min-w-[116px] flex-1 items-center gap-2 rounded-lg border border-border bg-card px-2.5"
        style={{ animationDelay: '0ms' }}
      >
        <CharacterAvatar
          name={result.guess.name}
          gameName={result.guess.game_name}
          universe={universe}
          className="size-10 shrink-0"
        />
        <span className="line-clamp-2 text-left text-xs font-semibold leading-tight">
          {result.guess.name}
        </span>
      </div>
      {result.attributes.map((attr, i) => (
        <AttributeCell key={attr.key} attr={attr} index={i + 1} />
      ))}
    </div>
  )
}

export function GuessGrid({ guesses }: { guesses: GuessResult[] }) {
  if (guesses.length === 0) return null
  const ordered = [...guesses].reverse() // newest on top

  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-max space-y-1.5">
        <div className="flex gap-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="min-w-[116px] flex-1 pl-1">Fighter</div>
          {COLUMN_LABELS.map((label) => (
            <div key={label} className="min-w-[76px] flex-1 text-center">
              {label}
            </div>
          ))}
        </div>
        {ordered.map((result) => (
          <GuessRow key={result.guess.id} result={result} />
        ))}
      </div>
    </div>
  )
}
