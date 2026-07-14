/**
 * Fighter artwork bundled from `src/assets`, resolved at build time via
 * Vite glob imports (only URLs are inlined; images load on demand).
 *
 *  - portraits/small  180×100 roster thumbnails  → avatars, suggestion lists
 *  - portraits/full   512×512 square art         → large avatars (reveal)
 *  - fighters/NN[e]   full-body official renders → result banner splash
 *  - series-symbols   monochrome series marks    → universe chips (CSS mask)
 *  - stock-icons      monochrome head icons      → small badges (CSS mask)
 */

const SMALL_PORTRAITS = byBasename(
  import.meta.glob<string>('../assets/portraits/small/*.png', {
    eager: true,
    import: 'default',
  }),
)
const FULL_PORTRAITS = byBasename(
  import.meta.glob<string>('../assets/portraits/full/*.png', {
    eager: true,
    import: 'default',
  }),
)
const STOCK_ICONS = byBasename(
  import.meta.glob<string>('../assets/stock-icons/svg/*.svg', {
    eager: true,
    import: 'default',
  }),
)
/**
 * Series symbols ship with `opacity:0.5` baked into their path style, which
 * makes CSS-masked icons render washed out. Import the raw markup, strip the
 * opacity, and serve as data URIs so masks paint at full strength.
 */
const SERIES_SYMBOLS = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>('../assets/series-symbols/svg/*.svg', {
      eager: true,
      query: '?raw',
      import: 'default',
    }),
  ).map(([path, src]) => [
    path.split('/').pop()!.replace('.svg', ''),
    'data:image/svg+xml,' +
      encodeURIComponent(src.replace(/opacity:0\.5;?/g, '')),
  ]),
)

/** Renders keyed by official fighter number folder: "04", "04e", "21e"… */
const RENDERS: Record<string, string> = {}
for (const [path, url] of Object.entries(
  import.meta.glob<string>('../assets/fighters/*/01.png', {
    eager: true,
    import: 'default',
  }),
)) {
  const folder = path.match(/fighters\/([^/]+)\//)?.[1]
  if (folder) RENDERS[folder] = url
}

/**
 * DLC fighters ship as per-character folders (Square/ + Icons/) with a
 * different layout from the flat portraits. Use their square art, keyed by
 * fighter slug. Pyra & Mythra share one folder; Steve/Byleth have skin
 * variants, so prefer the "(1)" file.
 */
const DLC_PORTRAITS: Record<string, string> = {}
for (const [path, url] of Object.entries(
  import.meta.glob<string>("../assets/dlc's/*/Square/*.png", {
    eager: true,
    import: 'default',
  }),
)) {
  const folder = path.match(/\/([^/]+)\/Square\//)?.[1]
  if (!folder) continue
  const slug = characterSlug(folder)
  if (!DLC_PORTRAITS[slug] || /\(1\)\.png$/.test(path)) DLC_PORTRAITS[slug] = url
}

function dlcPortrait(slug: string): string | undefined {
  return (
    DLC_PORTRAITS[slug] ??
    (slug === 'pyra' || slug === 'mythra'
      ? DLC_PORTRAITS['pyra_and_mythra']
      : undefined)
  )
}

function byBasename(mods: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [path, url] of Object.entries(mods)) {
    out[path.split('/').pop()!.replace(/\.(png|svg)$/, '')] = url
  }
  return out
}

/**
 * Display name → asset file slug.
 * "King K. Rool" → "king_k_rool", "R.O.B." → "rob",
 * "Mr. Game & Watch" → "mr_game_and_watch", "Pac-Man" → "pac_man".
 */
export function characterSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['.’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/** Universes whose symbol file name differs from their plain slug. */
const SERIES_ALIAS: Record<string, string> = {
  'Super Mario': 'mario',
  'Donkey Kong': 'dk',
  'The Legend of Zelda': 'zelda',
  'Xenoblade Chronicles': 'xenoblade',
}

/** 180×100 roster thumbnail. */
export function smallPortrait(name: string): string | undefined {
  const slug = characterSlug(name)
  return SMALL_PORTRAITS[slug] ?? dlcPortrait(slug)
}

/** 512×512 square art; falls back to the small thumbnail. */
export function fullPortrait(name: string): string | undefined {
  const slug = characterSlug(name)
  return FULL_PORTRAITS[slug] ?? dlcPortrait(slug) ?? SMALL_PORTRAITS[slug]
}

/** Monochrome stock-icon URL (black fill — render through a CSS mask). */
export function stockIcon(name: string): string | undefined {
  const slug = characterSlug(name)
  if (STOCK_ICONS[slug]) return STOCK_ICONS[slug]
  // The three Mii fighters share one combined icon…
  if (slug.startsWith('mii_')) return STOCK_ICONS['mii_fighter']
  // …and the Pokémon Trainer's mons share the trainer's.
  if (slug === 'charizard' || slug === 'ivysaur' || slug === 'squirtle')
    return STOCK_ICONS['pokemon_trainer']
  return undefined
}

/** Monochrome series-symbol URL (black fill — render through a CSS mask). */
export function seriesSymbol(universe: string): string | undefined {
  return SERIES_SYMBOLS[SERIES_ALIAS[universe] ?? characterSlug(universe)]
}

/** The Smash Bros. cross symbol — used for app branding. */
export const SMASH_SYMBOL: string = SERIES_SYMBOLS['smash_bros']

/**
 * Full-body official render, keyed by fighter number (+ echo flag).
 * Large files (~2 MB) — reserve for the result-banner reveal.
 */
export function fighterRender(
  fighterNumber: number,
  isEcho?: boolean,
): string | undefined {
  const base = String(fighterNumber).padStart(2, '0')
  return (isEcho ? RENDERS[base + 'e'] : undefined) ?? RENDERS[base]
}
