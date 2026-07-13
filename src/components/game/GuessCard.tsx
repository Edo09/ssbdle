import { ArrowDown, ArrowUp } from 'lucide-react'
import type { Attribute, GuessResult } from '@/types/game'
import { translateValue, useI18n } from '@/i18n/useI18n'
import { COLUMN_LABEL_KEY } from '@/lib/columns'
import { CharacterAvatar } from '@/components/game/CharacterAvatar'
import { cn } from '@/lib/utils'

function statusClasses(status: string) {
  return status === 'correct'
    ? 'border-correct/40 bg-correct/90 text-correct-foreground'
    : status === 'partial'
      ? 'border-partial/40 bg-partial/90 text-partial-foreground'
      : 'border-border bg-absent text-absent-foreground'
}

function Chip({ attr, span }: { attr?: Attribute; span?: boolean }) {
  const { t, lang } = useI18n()
  if (!attr) return null
  const shown = translateValue(lang, attr.key, attr.guess)
  const label = t('columns.' + (COLUMN_LABEL_KEY[attr.key] ?? attr.key))
  const arrow =
    attr.status !== 'correct' &&
    (attr.direction === 'up' || attr.direction === 'down')

  return (
    <div
      className={cn(
        'flex flex-col justify-center rounded-lg border px-2.5 py-1.5',
        span && 'col-span-2',
        statusClasses(attr.status),
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </span>
      <span className="flex items-center gap-1 font-display text-sm font-semibold leading-tight [overflow-wrap:anywhere]">
        {shown}
        {arrow &&
          (attr.direction === 'up' ? (
            <ArrowUp className="size-3.5 shrink-0" aria-hidden />
          ) : (
            <ArrowDown className="size-3.5 shrink-0" aria-hidden />
          ))}
      </span>
    </div>
  )
}

export function GuessCard({ result }: { result: GuessResult }) {
  const byKey = (k: string) => result.attributes.find((a) => a.key === k)
  const universe = String(byKey('universe')?.guess ?? '')

  return (
    <div className="tile-reveal rounded-xl border border-border bg-card p-2.5">
      <div className="mb-2 flex items-center gap-2">
        <CharacterAvatar
          name={result.guess.name}
          gameName={result.guess.game_name}
          universe={universe}
          className="size-9 shrink-0"
        />
        <span className="font-display text-base font-bold leading-tight">
          {result.guess.name}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Chip attr={byKey('universe')} span />
        <Chip attr={byKey('gender')} />
        <Chip attr={byKey('smash_debut')} />
        <Chip attr={byKey('weight')} />
        <Chip attr={byKey('debut_year')} />
      </div>
    </div>
  )
}
