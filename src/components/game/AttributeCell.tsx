import { ArrowDown, ArrowUp, Check } from 'lucide-react'
import type { Attribute } from '@/types/game'
import { cn } from '@/lib/utils'

export function AttributeCell({
  attr,
  index,
}: {
  attr: Attribute
  index: number
}) {
  const correct = attr.status === 'correct'
  const arrow = !correct && (attr.direction === 'up' || attr.direction === 'down')

  const srHint = correct
    ? 'correct'
    : arrow
      ? attr.direction === 'up'
        ? 'answer is higher'
        : 'answer is lower'
      : 'incorrect'

  return (
    <div
      className={cn(
        'tile-reveal relative flex h-[70px] min-w-[76px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border px-1 text-center',
        correct
          ? 'border-correct/40 bg-correct/90 text-correct-foreground'
          : 'border-border bg-absent text-absent-foreground',
      )}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {correct && (
        <Check className="absolute right-1 top-1 size-3 opacity-80" aria-hidden />
      )}
      <span className="font-display text-[11px] font-semibold leading-tight sm:text-xs">
        {attr.guess}
      </span>
      {arrow &&
        (attr.direction === 'up' ? (
          <ArrowUp className="size-4" aria-hidden />
        ) : (
          <ArrowDown className="size-4" aria-hidden />
        ))}
      <span className="sr-only">
        {attr.label}: {attr.guess}, {srHint}
      </span>
    </div>
  )
}
