import { ArrowDown, ArrowUp } from 'lucide-react'
import { useI18n } from '@/i18n/useI18n'

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="size-3 rounded-sm border border-white/10"
        style={{ background: color }}
      />
      {label}
    </span>
  )
}

export function Legend() {
  const { t } = useI18n()
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <Swatch color="var(--correct)" label={t('legend.correct')} />
      <Swatch color="var(--partial)" label={t('legend.partial')} />
      <Swatch color="var(--absent)" label={t('legend.wrong')} />
      <span className="inline-flex items-center gap-1">
        <ArrowUp className="size-3.5 text-foreground" aria-hidden />
        <ArrowDown className="size-3.5 text-foreground" aria-hidden />
        {t('legend.higherLower')}
      </span>
    </div>
  )
}
