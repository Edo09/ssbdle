import { ArrowDown, ArrowUp, Check } from 'lucide-react'
import type { Attribute } from '@/types/game'
import { translateValue, useI18n } from '@/i18n/useI18n'
import { SeriesIcon } from '@/components/game/SeriesIcon'
import { cn } from '@/lib/utils'

const KEY_TO_COL: Record<string, string> = {
  universe: 'universe',
  source_platform: 'platform',
  gender: 'gender',
  fighter_type: 'type',
  smash_debut: 'debut',
  weight: 'weight',
  fighter_number: 'number',
  debut_year: 'year',
}

export function AttributeCell({
  attr,
  index,
}: {
  attr: Attribute
  index: number
}) {
  const { t, lang } = useI18n()
  const isCorrect = attr.status === 'correct'
  const isPartial = attr.status === 'partial'
  const arrow = !isCorrect && (attr.direction === 'up' || attr.direction === 'down')
  const shown = translateValue(lang, attr.key, attr.guess)
  const label = t('columns.' + (KEY_TO_COL[attr.key] ?? attr.key))

  const dir =
    attr.direction === 'up'
      ? t('a11y.higher')
      : attr.direction === 'down'
        ? t('a11y.lower')
        : ''
  const srHint = isCorrect
    ? t('a11y.correct')
    : isPartial
      ? dir
        ? `${t('a11y.partial')}, ${dir}`
        : t('a11y.partial')
      : dir || t('a11y.incorrect')

  return (
    <div
      className={cn(
        'tile-reveal relative flex min-h-12 items-center justify-center rounded-lg border px-1 py-1.5 text-center sm:min-h-14',
        isCorrect
          ? 'border-correct/40 bg-correct/90 text-correct-foreground'
          : isPartial
            ? 'border-partial/40 bg-partial/90 text-partial-foreground'
            : 'border-border bg-absent text-absent-foreground',
      )}
      style={{ animationDelay: `${index * 400}ms` }}
    >
      {isCorrect && (
        <Check className="absolute right-1 top-1 size-3 opacity-80" aria-hidden />
      )}
      <span className="inline-flex items-center justify-center gap-1">
        <span className="font-display text-xs font-semibold leading-[1.1] [overflow-wrap:anywhere] sm:text-sm">
          {attr.key === 'universe' && (
            <SeriesIcon
              universe={String(attr.guess)}
              className="mr-1 size-3.5 align-[-0.2em] opacity-90 sm:size-4"
            />
          )}
          {shown}
        </span>
        {arrow &&
          (attr.direction === 'up' ? (
            <ArrowUp className="size-3.5 shrink-0 sm:size-4" aria-hidden />
          ) : (
            <ArrowDown className="size-3.5 shrink-0 sm:size-4" aria-hidden />
          ))}
      </span>
      <span className="sr-only">
        {label}: {shown}, {srHint}
      </span>
    </div>
  )
}
