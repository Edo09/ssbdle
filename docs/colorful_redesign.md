# Smashdle — Colorful Nintendo Redesign

A guide for applying the multi-color, Nintendo-flavored theme to the app. This
is almost entirely a **color change** — no layout, spacing, or structural edits.
Most of the work lives in `src/index.css`; a few component tweaks in
`src/components/layout/Header.tsx` add the per-tab colors and logo gradient.

## Palette

| Role            | Hex       | Used for                                   |
| :-------------- | :-------- | :----------------------------------------- |
| Red (Mario)     | `#ff4655` | Primary, Daily tab, sign-in button         |
| Crimson         | `#e4002b` | Red gradient end                           |
| Blue (Switch)   | `#00a6ff` | Accent, Arcade tab, language control        |
| Green (Luigi)   | `#35d07f` | Trivia tab                                 |
| Yellow (coin)   | `#ffc93c` | Trophy control, logo gradient end          |
| Orange          | `#ff8a3d` | Streak flame                               |
| Purple (Kirby)  | `#b06bff` | Ambient background glow                    |
| Cyan (highlight)| `#8cefff` | Text glow                                  |
| Text light      | `#f0f6fc` | Headings / body                            |
| Background      | `#0d1117` | Page                                       |
| Card / surface  | `#161b22` | Panels, nav                                |

---

## 1. `src/index.css` — add accent colors to `:root`

Add these alongside the existing variables (and optionally brighten `--primary`
and `--accent`):

```css
:root {
  /* …existing vars… */
  --primary: #ff4655; /* was #de1a22 — brighter red */
  --accent: #00a6ff;  /* keep Chrono Blue */

  /* new Nintendo accents */
  --green: #35d07f;
  --yellow: #ffc93c;
  --purple: #b06bff;
  --orange: #ff8a3d;
}
```

## 2. `src/index.css` — register the new colors for Tailwind

Add these to the `@theme inline` block so utilities like `bg-yellow/10` and
`text-green` work:

```css
@theme inline {
  /* …existing mappings… */
  --color-green: var(--green);
  --color-yellow: var(--yellow);
  --color-purple: var(--purple);
  --color-orange: var(--orange);
}
```

## 3. `src/index.css` — multi-hue background

Replace the `background` value inside `.app-bg`:

```css
.app-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(52rem 34rem at 26% -10%, rgba(255, 70, 85, 0.2), transparent 60%),
    radial-gradient(44rem 30rem at 88% 2%, rgba(0, 166, 255, 0.18), transparent 58%),
    radial-gradient(40rem 34rem at 4% 96%, rgba(53, 208, 127, 0.14), transparent 56%),
    radial-gradient(38rem 30rem at 96% 96%, rgba(176, 107, 255, 0.14), transparent 56%),
    radial-gradient(30rem 24rem at 50% 118%, rgba(255, 201, 60, 0.1), transparent 60%),
    var(--background);
}
```

The `.app-bg::after` grid overlay stays unchanged.

---

## 4. `src/components/layout/Header.tsx` — per-tab colors

Give each mode its own color. Extend the `MODES` array:

```tsx
const MODES: { id: Mode; icon: typeof Flame; color: string }[] = [
  { id: 'daily', icon: Flame, color: 'var(--primary)' },
  { id: 'arcade', icon: InfinityIcon, color: 'var(--accent)' },
  { id: 'trivia', icon: BrainCircuit, color: 'var(--green)' },
]
```

In the mode-switcher `.map`, use the color for both the active fill and the
(always-tinted) icon:

```tsx
{MODES.map(({ id, icon: Icon, color }) => {
  const active = mode === id
  return (
    <button
      key={id}
      type="button"
      onClick={() => onModeChange(id)}
      aria-pressed={active}
      style={active ? { background: color, boxShadow: `0 6px 18px -8px ${color}` } : undefined}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        active
          ? 'text-primary-foreground'
          : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
      )}
    >
      <Icon className="size-4" style={active ? undefined : { color }} />
      {t('header.' + id)}
    </button>
  )
})}
```

## 5. `src/components/layout/Header.tsx` — header control tints

Streak pill — point the flame at `--orange` and tint the container:

```tsx
<div
  className="flex items-center gap-1 rounded-lg border border-orange/30 bg-orange/10 px-2 py-1.5"
  title={t('header.streakTitle')}
>
  <Flame
    className={cn('size-4', streak > 0 ? 'text-orange' : 'text-muted-foreground')}
  />
  <span className="font-display text-sm font-bold tabular-nums">{streak}</span>
</div>
```

Language button — blue:

```tsx
<Button
  variant="secondary"
  size="icon"
  onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
  className="border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
  aria-label={t('header.switchLanguage')}
  title={t('header.switchLanguage')}
>
  <Languages />
</Button>
```

Trophy button — gold:

```tsx
<Button
  variant="secondary"
  size="icon"
  onClick={onOpenLeaderboard}
  className="border-yellow/30 bg-yellow/10 text-yellow hover:bg-yellow/20"
  aria-label={t('header.leaderboards')}
>
  <Trophy />
</Button>
```

The sign-in button keeps the default (red) `Button` variant — already on-palette.

## 6. `src/components/layout/Header.tsx` — logo gradient

Mark box → red-to-blue gradient; `DLE` → red-to-yellow clipped text:

```tsx
<span className="flex size-9 items-center justify-center rounded-lg border border-primary/40 bg-gradient-to-br from-primary/30 to-accent/30 shadow-[0_6px_18px_-6px_var(--primary)] sm:size-10">
  <MaskIcon src={SMASH_SYMBOL} className="size-5 text-foreground sm:size-6" />
</span>
<span className="font-display text-lg font-bold tracking-tight text-glow sm:text-xl">
  SMASH
  <span className="bg-gradient-to-r from-[#ff4655] to-[#ffc93c] bg-clip-text text-transparent">
    DLE
  </span>
</span>
```

> Note: the mark's `MaskIcon` now needs an explicit `text-foreground` so the
> Smash symbol renders white against the gradient box (it previously inherited
> `text-primary`).

---

## Summary

- **Steps 1–3** (`index.css` only) deliver ~70% of the effect with zero
  component edits — brighter accents + multi-hue background.
- **Steps 4–6** (`Header.tsx`) add the per-tab character colors, tinted header
  controls, and the gradient logo.
- No changes needed to `DailyMode`, `GuessInput`, `GuessBoard`, or any game
  component — they inherit the palette through the CSS variables.
