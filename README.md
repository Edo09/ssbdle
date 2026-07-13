# SMASHDLE

Guess the Super Smash Bros. Ultimate fighter. Built with React 19 + Vite,
TypeScript, Tailwind v4, shadcn-style UI, Zustand, Zod and Supabase.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle
```

Requires `.env` (already present):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

The Postgres backend (tables + RPCs) lives in `smashdle_schema.sql` — run it
once in the Supabase SQL editor.

## Modes

- **Daily** — one hidden fighter per day, 8 guesses, attribute hints
  (universe, gender, type, Smash debut, weight, roster #, debut year) with
  higher/lower arrows. Streaks + shareable result.
- **Arcade** — endless random fighters, unlimited guesses.
- **Trivia** — multiple-choice questions you author in the `trivia_questions`
  table; the correct answer stays hidden behind an RPC.

Sign-in (email + password) saves streaks and powers the Daily / Arcade /
Trivia leaderboards.

## Add your own content

- **Fighter art (optional):** drop PNGs in `public/fighters/<game_name>.png`
  (the `game_name` codename from the `characters` table, e.g. `mario.png`,
  `plizardon.png`). Missing images fall back to a colored monogram.
- **Trivia:** insert rows into `trivia_questions` (question, option_a..d,
  correct_option A-D, category, difficulty, explanation). Sample rows are
  included — delete them and add your own.

## Structure

```
src/
  lib/        supabase client, typed API layer, helpers
  types/      Zod schemas + inferred types
  store/      Zustand stores (auth, game)
  components/
    ui/       shadcn-style primitives
    game/     guess input, results grid, result banner
    modes/    Daily / Arcade / Trivia
    layout/   header + mode switcher
    auth/     sign in / sign up dialog
    leaderboard/
```
