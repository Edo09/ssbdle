/** Per-universe accent colors for avatar monograms + tags. */
const UNIVERSE_COLORS: Record<string, string> = {
  'Super Mario': '#e8402b',
  'Donkey Kong': '#c06a24',
  'The Legend of Zelda': '#2e9d5b',
  Metroid: '#e6812f',
  Yoshi: '#43ae4a',
  Kirby: '#f28cb1',
  'Star Fox': '#7f8cff',
  Pokemon: '#f6c945',
  EarthBound: '#e05a7a',
  'F-Zero': '#4aa3ff',
  'Ice Climber': '#7fd3ff',
  'Fire Emblem': '#5b7cff',
  'Game & Watch': '#9aa0aa',
  'Kid Icarus': '#e9b949',
  Wario: '#f2c53d',
  Pikmin: '#e2596b',
  'R.O.B.': '#9aa0aa',
  'Duck Hunt': '#c98a3a',
  'Wii Fit': '#39c6c0',
  'Punch-Out!!': '#3fae4a',
  'Animal Crossing': '#57c98a',
  'Xenoblade Chronicles': '#d23f5a',
  'Metal Gear': '#8b8f7a',
  Sonic: '#2f6bd6',
  'Mega Man': '#2aa3e6',
  'Pac-Man': '#f6c945',
  'Street Fighter': '#e0902f',
  'Final Fantasy': '#6f7bd6',
  Bayonetta: '#a06fd6',
  Splatoon: '#6fd23f',
  Castlevania: '#8a5a3a',
  Persona: '#e5352b',
  'Dragon Quest': '#4aa3ff',
  'Banjo-Kazooie': '#e0b23d',
  'Fatal Fury': '#d23f3f',
  ARMS: '#39b6c6',
  Minecraft: '#5a9e4a',
  Tekken: '#c05a2f',
  'Kingdom Hearts': '#c9b03a',
  Mii: '#4fbf8f',
}

export function universeColor(universe: string): string {
  const known = UNIVERSE_COLORS[universe]
  if (known) return known
  let hash = 0
  for (let i = 0; i < universe.length; i++) {
    hash = (hash * 31 + universe.charCodeAt(i)) % 360
  }
  return `hsl(${hash} 55% 58%)`
}

/** 1-2 letter monogram used when a fighter image is unavailable. */
export function initials(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
