import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { translations, type Lang } from '@/i18n/translations'

function detectLang(): Lang {
  if (typeof navigator !== 'undefined') {
    const l = navigator.language?.toLowerCase() ?? ''
    if (l.startsWith('es')) return 'es'
  }
  return 'en'
}

interface LangState {
  lang: Lang
  setLang: (l: Lang) => void
}

export const useLangStore = create<LangState>()(
  persist((set) => ({ lang: detectLang(), setLang: (lang) => set({ lang }) }), {
    name: 'smashdle-lang',
  }),
)

type Vars = Record<string, string | number>

function resolve(lang: Lang, path: string): string | undefined {
  const parts = path.split('.')
  let node: unknown = translations[lang]
  for (const p of parts) {
    if (
      node &&
      typeof node === 'object' &&
      p in (node as Record<string, unknown>)
    ) {
      node = (node as Record<string, unknown>)[p]
    } else {
      return undefined
    }
  }
  return typeof node === 'string' ? node : undefined
}

export function translate(lang: Lang, path: string, vars?: Vars): string {
  let str = resolve(lang, path) ?? resolve('en', path) ?? path
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace('{' + k + '}', String(v))
    }
  }
  return str
}

export type TFn = (path: string, vars?: Vars) => string

export function useI18n() {
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)
  const t: TFn = (path, vars) => translate(lang, path, vars)
  return { lang, setLang, t }
}

/** Translate a backend enum value (gender / fighter_type); pass others through. */
export function translateValue(
  lang: Lang,
  key: string,
  value: string | number,
): string | number {
  if (key === 'gender') return translate(lang, 'values.gender.' + value)
  if (key === 'fighter_type') return translate(lang, 'values.fighterType.' + value)
  return value
}
