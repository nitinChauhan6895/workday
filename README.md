# WorkDay

Personal productivity PWA for client-facing ASR / TTS / STT deployment work —
deployments, bugs, action items, support threads, QA, meetings and dev standups.
Single user, desktop-first, installable.

**Live:** https://workday-six.vercel.app · **Dev:** `npm run dev` → http://localhost:3100

## Deploy

Hosted on Vercel (project `workday`, scope `vesmoenterprise-3198`), auto-deploys on
push to `main`. Env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
are set in Vercel for Production/Preview/Development. After a domain change, update
Supabase → Auth → URL Configuration (Site URL + `/auth/confirm` redirect).

Sibling of TrackItALl / SplitnPay / Kiraidari and shares their stack:
**Next.js 14 (App Router) · React 18 · TypeScript · Tailwind 3 · Supabase.**

## Status — Phase 1 (scaffold) ✅

- App shell: left sidebar nav + routing, calm light card-based design.
- All routes render from **in-memory mock data** (`lib/mock.ts`) — no backend yet.
- PWA: `public/manifest.webmanifest` + `public/sw.js` (network-first; never caches
  RSC/data requests — the sibling-app caching gotcha).

Pages: Dashboard, Items (+ detail), Clients (+ detail), Meetings (+ capture view),
Standup, Settings.

## Build order

1. **Scaffold** ✅ — shell, routing, mock data.
2. **Supabase** — schema + RLS, magic-link auth, realtime; replace mock data.
3. **Items** — new/edit/delete forms, filters, item detail with activity log.
4. **Clients** — forms, auto progress.
5. **Dashboard** — assemble from live data.
6. **Meetings** — capture view with manual action-item creation.
7. **Standup** — grouped-by-dev, tickable.
8. **AI extraction** (optional) — Supabase Edge Function → Anthropic API, server-side.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

Supabase keys (Phase 2) go in `.env.local` — see `.env.example`. Never commit them.

### Data model (Phase 2 target)

One shared `items` table (`type`: deploy | bug | action | support | qa) +
`clients` + `meetings`. See `lib/types.ts` for the full shape.
