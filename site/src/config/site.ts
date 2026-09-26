// ─────────────────────────────────────────────────────────────────────────────
// Everything you'll want to change at launch lives here.
// ─────────────────────────────────────────────────────────────────────────────

/** Working title — swap for the final name/domain. Used in <title>, header, share cards. */
export const SITE_NAME = 'Not Strangers';
export const SITE_NAME_TA = 'அந்நியர்கள் அல்ல';

/** Final domain, no trailing slash. Used for canonical URLs, OG tags and share cards. */
export const SITE_URL = 'https://notstrangers.org';

/** Public Instagram account (plain link only: no embeds, no tracking pixels). */
export const INSTAGRAM = { handle: 'notstrangers_org', url: 'https://www.instagram.com/notstrangers_org/' };

/**
 * Anonymous learning-module counter (metrics/ Cloudflare Worker, see docs/METRICS.md).
 * Empty = counting and count display are switched off (no network requests at all).
 */
export const METRICS_URL = 'https://notstrangers-metrics.vaikunthln.workers.dev';
/** Public count lines stay hidden until the real count reaches this number. Real counts only. */
export const COUNTER_SHOW_FROM = 108;

/** Cloudflare Web Analytics (cookie-free, no fingerprinting). Empty = off. */
export const CF_ANALYTICS_TOKEN = 'f3073e5b1be143f8b971a4ccf0d590c3';

/** Where "Found an error?" goes. */
export const CONTACT_EMAIL = 'hello@notstrangers.org';

/**
 * Keep `true` until content review is done (spec §9). Emits
 * <meta name="robots" content="noindex,nofollow"> on every page and a disallow-all robots.txt.
 */
export const NOINDEX = true;

/** Prevention content stays visibly DRAFT until the child-protection partner has reviewed it (spec §7.1). */
export const PREVENTION_CONTENT_REVIEWED = false;

/** Tamil copy stays flagged until a native speaker has reviewed it (spec §2). */
export const TAMIL_REVIEWED = false;

/** Date the helplines block was last checked (spec §7.3). Update when you re-verify. */
export const HELPLINES_VERIFIED_ON = '2026-09-24';


export const LANGS = ['en', 'ta'] as const;
export type Lang = (typeof LANGS)[number];
