// notstrangers-metrics: counts learning-module completions, anonymously.
// Privacy: no IPs, user agents, cookies or identifiers are stored. Deduplication happens in the
// visitor's own browser (localStorage). Stored data is just integers per module and per day.
import { DurableObject } from 'cloudflare:workers';

const pad = (n) => String(n).padStart(2, '0');
const MODULES = new Set([
  ...Array.from({ length: 8 }, (_, i) => `parents-${pad(i + 1)}`),
  ...Array.from({ length: 3 }, (_, i) => `kids-${pad(i + 1)}`),
  ...Array.from({ length: 3 }, (_, i) => `teens-${pad(i + 1)}`),
  'family-safety-plan',
]);
// module_complete: one module finished (counted once per browser per module).
// learner: first module ever finished in this browser (a "people learning" proxy).
const EVENTS = new Set(['module_complete', 'learner']);
const day = () => new Date().toISOString().slice(0, 10);

export class Counter extends DurableObject {
  // A single Durable Object instance serialises all writes, so increments are atomic.
  async record(event, module) {
    const d = day();
    const keys = event === 'learner' ? ['learners', `day:${d}:learners`] : ['total', `module:${module}`, `day:${d}`];
    const cur = await this.ctx.storage.get(keys);
    const next = {};
    for (const k of keys) next[k] = (cur.get(k) || 0) + 1;
    await this.ctx.storage.put(next);
  }

  async counts() {
    const all = await this.ctx.storage.list();
    const byModule = {};
    const days = {};
    for (const [k, v] of all) {
      if (k.startsWith('module:')) byModule[k.slice(7)] = v;
      else if (/^day:\d{4}-\d{2}-\d{2}$/.test(k)) days[k.slice(4)] = v;
    }
    const last30 = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      last30.push({ day: d, count: days[d] || 0 });
    }
    return {
      updated_at: new Date().toISOString(),
      total: all.get('total') || 0,
      learners: all.get('learners') || 0,
      by_module: byModule,
      last_30_days: last30,
    };
  }
}

function cors(origin, allowed) {
  const ok = origin && allowed.includes(origin);
  return ok ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' } : {};
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const origin = req.headers.get('Origin');
    const stub = env.COUNTER.get(env.COUNTER.idFromName('global'));

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...cors(origin, allowed), 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' } });
    }

    if (url.pathname === '/event' && req.method === 'POST') {
      if (!origin || !allowed.includes(origin)) return new Response('forbidden', { status: 403 });
      if (env.LIMITER) {
        // Rate-limit key is used in memory at the edge only; it is never stored.
        const { success } = await env.LIMITER.limit({ key: req.headers.get('CF-Connecting-IP') || 'anon' });
        if (!success) return new Response(null, { status: 429, headers: cors(origin, allowed) });
      }
      let body;
      try { body = JSON.parse((await req.text()).slice(0, 500)); } catch { return new Response('bad json', { status: 400, headers: cors(origin, allowed) }); }
      const ev = body && body.event;
      const mod = body && body.module;
      if (!EVENTS.has(ev) || (ev === 'module_complete' && !MODULES.has(mod))) {
        return new Response('bad event', { status: 400, headers: cors(origin, allowed) });
      }
      await stub.record(ev, mod);
      return new Response(null, { status: 204, headers: cors(origin, allowed) });
    }

    if (url.pathname === '/counts' && req.method === 'GET') {
      const cache = caches.default;
      const key = new Request(url.origin + '/counts', { method: 'GET' });
      let res = await cache.match(key);
      if (!res) {
        const data = await stub.counts();
        res = new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
        });
        ctx.waitUntil(cache.put(key, res.clone()));
      }
      const out = new Response(res.body, res);
      out.headers.set('Access-Control-Allow-Origin', '*');
      return out;
    }

    return new Response('not found', { status: 404 });
  },
};
