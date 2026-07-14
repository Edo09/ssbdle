import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Search } from 'lucide-react'
import type { Character } from '@/types/game'
import { useI18n } from '@/i18n/useI18n'
import { CharacterAvatar } from '@/components/game/CharacterAvatar'
import { MaskIcon, SeriesIcon } from '@/components/game/SeriesIcon'
import { stockIcon } from '@/lib/assets'
import { cn } from '@/lib/utils'

interface Props {
  characters: Character[]
  excludeIds: Set<number>
  onGuess: (c: Character) => void
  disabled?: boolean
  placeholder?: string
}

const MAX_RESULTS = 8

export function GuessInput({
  characters,
  excludeIds,
  onGuess,
  disabled,
  placeholder,
}: Props) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const deferredQuery = useDeferredValue(query)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()

  const index = useMemo(
    () => characters.map((c) => ({ c, key: c.name.toLowerCase() })),
    [characters],
  )

  const matches = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase()
    if (!q) return []
    const starts: Character[] = []
    const includes: Character[] = []
    for (const { c, key } of index) {
      if (excludeIds.has(c.id)) continue
      if (key.startsWith(q)) starts.push(c)
      else if (key.includes(q)) includes.push(c)
    }
    return [...starts, ...includes].slice(0, MAX_RESULTS)
  }, [deferredQuery, index, excludeIds])

  useEffect(() => setActive(0), [deferredQuery])

  function choose(c: Character) {
    onGuess(c)
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const m = matches[active]
      if (m) choose(m)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && matches.length > 0 && !disabled

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList ? `${listboxId}-opt-${active}` : undefined
          }
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          value={query}
          placeholder={placeholder ?? t('board.placeholder')}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          className={cn(
            'h-12 w-full rounded-xl border border-input bg-secondary/50 pl-10 pr-4 text-base text-foreground shadow-sm transition-colors',
            'placeholder:text-muted-foreground/70',
            'focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
      </div>

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          className="hud-panel absolute z-30 mt-2 w-full overflow-hidden rounded-xl p-1.5"
        >
          {matches.map((c, i) => (
            <li
              key={c.id}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                choose(c)
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors',
                i === active ? 'bg-primary/15' : 'hover:bg-secondary/60',
              )}
            >
              <CharacterAvatar
                name={c.name}
                universe={c.universe}
                className="size-9"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-semibold text-foreground">{c.name}</span>
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <SeriesIcon universe={c.universe} className="size-3" />
                  {c.universe}
                </span>
              </span>
              <span className="ml-auto flex items-center gap-1.5 font-display text-xs text-muted-foreground">
                <MaskIcon src={stockIcon(c.name)} className="size-3.5 opacity-70" />
                #{c.fighter_number}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
