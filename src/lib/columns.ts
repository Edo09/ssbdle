/** Attribute keys shown in the guess grid, in display order. */
export const VISIBLE_ATTRIBUTE_KEYS = [
  'universe',
  'source_platform',
  'gender',
  'smash_debut',
  'weight',
  'debut_year',
] as const

/** Fast membership test (used by the share-result grid). */
export const VISIBLE_ATTRIBUTE_KEY_SET: ReadonlySet<string> = new Set(
  VISIBLE_ATTRIBUTE_KEYS,
)

/** Maps an attribute key to its column label key in translations. */
export const COLUMN_LABEL_KEY: Record<string, string> = {
  universe: 'universe',
  source_platform: 'platform',
  gender: 'gender',
  smash_debut: 'debut',
  weight: 'weight',
  debut_year: 'year',
}
