import type { CSSProperties } from 'react'
import { seriesSymbol } from '@/lib/assets'
import { cn } from '@/lib/utils'

/**
 * Renders a monochrome asset (series symbol / stock icon) as a CSS mask so
 * it inherits the current text color, like a lucide icon.
 */
export function MaskIcon({
  src,
  className,
}: {
  src?: string
  className?: string
}) {
  if (!src) return null
  const mask: CSSProperties = {
    maskImage: `url("${src}")`,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskImage: `url("${src}")`,
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
  }
  return (
    <span
      aria-hidden
      className={cn('inline-block shrink-0 bg-current', className)}
      style={mask}
    />
  )
}

/** Series symbol for a universe, tinted to the current text color. */
export function SeriesIcon({
  universe,
  className,
}: {
  universe: string
  className?: string
}) {
  return <MaskIcon src={seriesSymbol(universe)} className={className} />
}
