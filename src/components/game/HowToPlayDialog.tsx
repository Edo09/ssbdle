import { HelpCircle, ArrowUp, ArrowDown, Sparkles } from 'lucide-react'
import { useI18n } from '@/i18n/useI18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HowToPlayDialog({ open, onOpenChange }: Props) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 max-h-[85vh] flex flex-col">
        <DialogHeader className="border-b border-border/70 px-5 pb-4 pt-5 pr-12 sm:px-6 sm:pt-6 shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-accent animate-pulse" />
            <DialogTitle className="font-display text-xl font-bold">
              {t('help.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t('help.intro')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 space-y-5">
          {/* Basic Rules */}
          <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">1</span>
              <p>{t('help.rule1')}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">2</span>
              <p>{t('help.rule2')}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">3</span>
              <p>{t('help.rule3')}</p>
            </div>
          </div>

          {/* Color Indicators Legend */}
          <div className="space-y-2.5">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('help.colorsTitle')}
            </h3>
            <div className="grid gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/15 p-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-correct/40 bg-correct text-correct-foreground font-display font-bold text-xs uppercase">
                  OK
                </div>
                <p className="text-muted-foreground"><strong className="text-foreground">{t('legend.correct')}</strong>: {t('help.correct')}</p>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/15 p-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-partial/40 bg-partial text-partial-foreground font-display font-bold text-xs uppercase">
                  PART
                </div>
                <p className="text-muted-foreground"><strong className="text-foreground">{t('legend.partial')}</strong>: {t('help.partial')}</p>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/15 p-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-absent text-absent-foreground font-display font-bold text-xs uppercase">
                  NO
                </div>
                <p className="text-muted-foreground"><strong className="text-foreground">{t('legend.wrong')}</strong>: {t('help.wrong')}</p>
              </div>
            </div>
          </div>

          {/* Attributes List */}
          <div className="space-y-2.5">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-yellow" />
              {t('help.columnsTitle')}
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
              <div className="rounded-lg border border-border/50 bg-background/40 p-2.5">
                <h4 className="font-bold text-foreground mb-0.5">{t('columns.universe')}</h4>
                <p className="text-muted-foreground leading-relaxed">{t('help.universe')}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/40 p-2.5">
                <h4 className="font-bold text-foreground mb-0.5">{t('columns.platform')}</h4>
                <p className="text-muted-foreground leading-relaxed">{t('help.platform')}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/40 p-2.5">
                <h4 className="font-bold text-foreground mb-0.5">{t('columns.gender')}</h4>
                <p className="text-muted-foreground leading-relaxed">{t('help.gender')}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/40 p-2.5">
                <h4 className="font-bold text-foreground mb-0.5">{t('columns.debut')}</h4>
                <p className="text-muted-foreground leading-relaxed">{t('help.debut')}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/40 p-2.5 col-span-1 sm:col-span-2">
                <h4 className="font-bold text-foreground mb-0.5 flex items-center gap-1">
                  {t('columns.weight')}
                  <span className="inline-flex gap-0.5">
                    <ArrowUp className="size-3 text-orange" />
                    <ArrowDown className="size-3 text-accent" />
                  </span>
                </h4>
                <p className="text-muted-foreground leading-relaxed">{t('help.weight')}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/40 p-2.5 col-span-1 sm:col-span-2">
                <h4 className="font-bold text-foreground mb-0.5 flex items-center gap-1">
                  {t('columns.year')}
                  <span className="inline-flex gap-0.5">
                    <ArrowUp className="size-3 text-orange" />
                    <ArrowDown className="size-3 text-accent" />
                  </span>
                </h4>
                <p className="text-muted-foreground leading-relaxed">{t('help.year')}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
