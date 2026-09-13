# Prompt log — Prenda a Post

Five coding prompts, one per step of the implementation plan. Prompts are written in advance; the **response** and **what I changed** fields are filled in after each run. Commit this file after every session so the timestamps line up with the code commits.

---

## Prompt 1 — Scaffold, schemas, tests

**Date:**
**Tool:**
**Commits produced:**

**Prompt sent:**

> Set up a Next.js 15 project with the App Router, TypeScript, a `src/` directory, Tailwind CSS v4, zod, and Vitest. Nothing else.
>
> Then create two files and their tests, and stop.
>
> `src/lib/schema.ts` — zod schemas for a garment-copy generator:
> - `GenerateInput`: prenda (string, min 1), tela (string, optional), detalle (string, optional), colores (string, optional), tallas (string array), precio_mxn (number, positive), tono (enum: Casual | Elegante | Juvenil).
> - `GeneratedItem`: `instagram.caption` (40–90 words, must contain at least one emoji), `instagram.hashtags` (exactly 10 strings, each matching `/^#[\p{L}\p{N}_]+$/u`), `whatsapp.message` (25–50 words, must NOT contain `#`), `marketplace.title` (1–100 chars), `marketplace.description` (30–70 words, no `#`, no emoji), `source` ("simulated" | "model"), `model_name` (string or null).
>
> `src/lib/prompt.ts` — a pure `buildPrompt(input: GenerateInput): string` function. It imports nothing from the AI layer. It must neutralise `{` and `}` in user input so odd supplier text can't break the template.
>
> `src/lib/__tests__/prompt.test.ts` and `src/lib/__tests__/schema.test.ts` — eight tests: prompt includes prenda/tela/tono; prompt neutralises braces; schema rejects 9 and 11 hashtags; schema rejects a WhatsApp message containing `#`; schema rejects a Marketplace title over 100 chars; schema rejects captions under 40 and over 90 words.
>
> Do not create components, routes, or providers yet. Report when `npm run test` and `tsc --noEmit` both pass.

**What came back:**

**What I changed and why:**

---

## Prompt 2 — Provider layer and generate route

**Date:**
**Tool:**
**Commits produced:**

**Prompt sent:**

> Now the AI layer. Create:
>
> `src/lib/ai/types.ts`:
> ```ts
> export interface Provider {
>   name: string;
>   generate(prompt: string): Promise<{
>     text: string;
>     source: "simulated" | "model";
>     model_name: string | null;
>   }>;
> }
> ```
>
> `src/lib/ai/mock.ts` — deterministic output built from the input attributes, with an awaited 600ms delay so loading states are exercised. Returns `source: "simulated"`, `model_name: null`. It must satisfy every rule in `GeneratedItem` so it passes the same schema as a real provider.
>
> `src/lib/ai/index.ts` — `getProvider()` reads `process.env.AI_PROVIDER` and returns mock unless the value is exactly `"gemini"`. Any unrecognised value falls back to mock.
>
> `src/app/api/generate/route.ts` — POST. Validate the body with `GenerateInput` (400 on failure), call `buildPrompt`, call `getProvider().generate()`, parse the result with `GeneratedItem`. If parsing fails, return 502 with the zod issue list. Do not repair, pad, or truncate model output to force it through.
>
> Skip `gemini.ts` for now. No component may import `mock.ts` directly. Report with a working curl example against the running dev server.

**What came back:**

**What I changed and why:**

---

## Prompt 3 — Mobile-first UI

**Date:**
**Tool:**
**Commits produced:**

**Prompt sent:**

> Build the UI. Mobile-first: design at 390px and widen from there. Tap targets 44px minimum. All user-facing strings in Spanish (Mexico); code and comments in English.
>
> - `src/components/GarmentForm.tsx` — the seven input fields. Disable the submit button and show an inline error naming the field when prenda is empty or precio_mxn is not positive. No request fires while invalid.
> - `src/components/ProvenanceBadge.tsx` — takes `source` and `model_name` as props and renders the label from them. Never hardcode the string "Simulado" in any component.
> - `src/components/ChannelSection.tsx` — one collapsible section per channel, with its own copy button.
> - `src/components/CopyButton.tsx` — writes to the clipboard and shows a checkmark confirmation within 300ms.
> - `src/components/ResultCard.tsx` — composes the three channel sections plus the badge.
> - `src/app/page.tsx` — wires the form to `/api/generate`. Include a loading skeleton and an error state with a Retry button that preserves every value the user already entered.
>
> Add a one-sentence purpose statement above the fold explaining what the app does and whether output is simulated.

**What came back:**

**What I changed and why:**

---

## Prompt 4 — Supabase persistence

**Date:**
**Tool:**
**Commits produced:**

**Prompt sent:**

> Add persistence.
>
> Write `supabase/schema.sql` for a table `items`: `id uuid primary key default gen_random_uuid()`, `created_at timestamptz not null default now()`, `edited_at timestamptz`, `prenda text not null`, `tela text`, `detalle text`, `colores text`, `tallas text[]`, `precio_mxn numeric not null`, `tono text not null`, `ig_caption text not null`, `ig_hashtags text[] not null`, `wa_message text not null`, `mp_title text not null`, `mp_description text not null`, `source text not null check (source in ('simulated','model'))`, `model_name text`. Do not run migrations — I will paste this into the Supabase SQL editor myself.
>
> `src/lib/supabase.ts` — browser client from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The service role key must not appear anywhere under `src/`.
>
> `src/app/api/items/route.ts` — GET returns the 50 newest, newest first. POST saves a generated item.
>
> `src/app/api/items/[id]/route.ts` — PATCH updates any of the five text fields and sets `edited_at`.
>
> Add the feed to `page.tsx` and make each channel section editable in place. Render an explicit "base de datos no disponible" state if the Supabase call fails, rather than crashing.

**What came back:**

**What I changed and why:**

---

## Prompt 5 — Real provider and ship

**Date:**
**Tool:**
**Commits produced:**

**Prompt sent:**

> Last step.
>
> `src/lib/ai/gemini.ts` — implement `Provider` against the Google AI Studio `generateContent` endpoint using `GEMINI_API_KEY`. Instruct the model to return JSON only, no markdown fences. Parse with the same `GeneratedItem` schema. On malformed JSON, throw — never silently fall back to the mock provider, because that would mislabel provenance. Return `source: "model"` and populate `model_name`.
>
> No UI file may change to accommodate this. If any does, the provider abstraction is wrong and I want to know before you edit it.
>
> Then: `.env.example` with `AI_PROVIDER`, `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, all values blank. A `README.md` with setup steps. Finish with `tsc --noEmit` and the full test run, and report both.

**What came back:**

**What I changed and why:**

---

## Quality gate

Five real garments run through the app. Rating per channel: *usable as-is* / *light edit* / *rewrite*.

| Garment | Instagram | WhatsApp | Marketplace |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

Three or more rewrites on any channel means the prompt is wrong, not the code. Fix `buildPrompt()` before adding anything.

## Throughput measurement

| | Median time per garment |
|---|---|
| By hand, before building | |
| Through the app, including edits | |

If the difference is under two minutes across five garments, the manpower premise does not hold for this task, and the writeup says so.
