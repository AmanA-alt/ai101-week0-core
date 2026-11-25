# Bastilla — AI sales agent for clothing resellers

An AI agent for one-person clothing resellers in Mexico. Customers ask about items in a
chat; the agent answers only from real catalog data and assembles a basket. Nothing
becomes an order until a human confirms it.

Built for the AI-101 Summer Intensive at IBERO.

## Pages

| Route | Week | What it is |
|---|---|---|
| `/` | 0, 4, 6 | Landing page with the mascot, how it works, pricing and roadmap |
| `/docs` | 0, 6 | Stack, prompt library by module, build log |
| `/core` | 1 | The chat agent, basket and human handoff, with live mascot status |
| `/core/prompts` | 1 | Prompt library: every prompt version and why it changed |
| `/research` | 2 | Benchmarks, competitors, risk map, research log |
| `/product`, `/pricing` | 3 | Product architecture, tiers (middle tier recommended), revenue simulator |
| `/marketing` | 4 | Brand, persona, content library, A/B tests |
| `/chat` | 5 | Public guided assistant |
| `/demo` | 6 | Guided walkthrough, agent map, testing summary, impact check, version 2 roadmap |
| `/dashboard` | 6 | Every stored record, server rendered, masked, no transcripts |
| `/inventory` | 6 | Reseller stock from CSV or by hand, saved only in the browser |

Every page has a light and a dark appearance. The site follows the system
setting on a first visit; the switch in the navigation overrides it.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · zod · Vitest ·
Groq (`openai/gpt-oss-120b`) · Supabase · Vercel

## Environment variables

Copy `.env.example` to `.env.local` and fill in your own values. `.env.local` is
gitignored and must never be committed.

| Variable | What it is |
|---|---|
| `MODEL_PROVIDER` | `groq` or `gemini` — selects which client to use |
| `MODEL_ID` | Model identifier, e.g. `openai/gpt-oss-120b` |
| `GROQ_API_KEY` | Groq API key, from console.groq.com |
| `GEMINI_API_KEY` | Google AI Studio API key (optional fallback) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key — server-side only, never `NEXT_PUBLIC_` |

The same six must be set in Vercel under Settings → Environment Variables. Vercel
cannot read `.env.local`.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run dev
```

Open the forwarded port. `/` redirects nowhere — it is the homepage.

Database schema is in `supabase/schema.sql`. Run it in the Supabase SQL editor; every statement is safe to run more than once. Week 6 adds `user_tests`. The inventory has no table on purpose: it never leaves the reseller's browser.
Row-level security is intentionally off: every database call runs server-side through
Route Handlers using the secret key, which bypasses RLS regardless.

## Tests

```bash
npm test          # Vitest, no network required
npx tsc --noEmit  # type check across every file
node scripts/regression.mjs https://ai101-week0-core.vercel.app   # live-site regression
```

The contrast test reads `app/globals.css` directly and fails if any text colour
drops below WCAG AA (4.5:1) in either appearance.

## Notes

The WhatsApp conversation at `/core` is simulated in the browser and labelled as such.
The Meta Cloud API requires Business verification and template approval, and its free
tier only messages pre-verified numbers — so a real integration could not be used by
anyone evaluating this. The conversation logic is real; only the transport is simulated.
