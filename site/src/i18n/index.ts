import en from './en.json';
import ta from './ta.json';
import type { Lang } from '../config/site';

type Dict = Record<string, any>;
const DICTS: Record<Lang, Dict> = { en, ta };

function lookup(d: Dict, key: string): string | undefined {
  const v = key.split('.').reduce<any>((o, k) => (o == null ? undefined : o[k]), d);
  return typeof v === 'string' ? v : undefined;
}

export function interpolate(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

/**
 * t('home.hook_title', { n: 97 }). Missing Tamil keys fall back to English.
 * Fallbacks are collected so the page can show a "translation pending" marker (spec §9 Phase 1).
 */
export function useT(lang: Lang) {
  const missing = new Set<string>();
  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = lookup(DICTS[lang], key);
    if (s === undefined) {
      s = lookup(DICTS.en, key);
      if (s === undefined) throw new Error(`i18n: missing key "${key}" in en.json`);
      if (lang !== 'en') missing.add(key);
    }
    return interpolate(s, vars);
  };
  return { t, missing, lang };
}

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'ta' : 'en');

/** Same page in the other language: /en/explore/india/ -> /ta/explore/india/ */
export function swapLangPath(pathname: string, to: Lang) {
  return pathname.replace(/^\/(en|ta)(?=\/|$)/, `/${to}`);
}
