# Prompt log — Weeks 0 to 2

## Prompts used

### 1. Build Discipline Packet
Requested a disciplined product-architect role with a hard rule against coding before the
plan was clear. Constraints: free tools only, Next.js/Tailwind/Vercel/GitHub/Supabase,
small testable features, no paid APIs, acceptance criteria before implementation.
Result: the assistant refused to write the packet until the build target was specified,
which surfaced that "a tool for my business" was not a spec.

### 2. Implementation prompt
Full build spec: file order, API contract, zod validation on both inbound body and model
output, one strict retry on parse failure, 429 mapped to a structured response, database
write as a separate action, no auth, no ORM, no component library.
Result: 15 files, tsc clean on first run.

### 3. Reconciling against the course document
Asked the assistant to check its plan against the Week 1 setup guide. Found four
mismatches: route should be /core not /, table core_outputs not generations, save must be
its own action, and two required features were missing.
Result: four corrections applied before any code was written.

### 4. Dependency conflict
npm install -D vitest failed with ERESOLVE. Vitest 5 requires @types/node 22+, the
scaffold installed 20. npm suggested --force or --legacy-peer-deps.
Result: the assistant advised against both, because they suppress the conflict rather
than fix it. Upgrading @types/node resolved it properly.

### 5. Provider failure and swap
Gemini returned 401 ACCESS_TOKEN_TYPE_UNSUPPORTED. Google AI Studio was issuing OAuth
tokens (AQ. prefix) rather than API keys (AIza).
Result: switched to Groq. Because the model client took its provider from config, the
change was three environment variables and no code. Selected openai/gpt-oss-120b after
checking the models endpoint for json_mode support.

### 6. Design correction
The assistant flagged that its own earlier UX spec — cream background, serif display,
terracotta accent — is a recognisable AI-generated default.
Result: replaced with paper-grey, IBM Plex, deep green.

### 7. WhatsApp transport reality check
Asked whether the real WhatsApp API was viable inside the free-tools constraint.
Result: it is not. Business verification and template approval take days, and the free
tier only messages pre-verified numbers, so a grader could not use it. Decision: simulate
the transport in-browser and label it. Conversation logic is real; only the pipe is not.

### 8. Repointing to a multi-turn sales agent
Rewrote the prompt builder from single-shot copy to a conversation with basket extraction.
Added rule 8 (a size not listed is unavailable, never hedge), rule 7 (restate the whole
basket every turn so client and model cannot disagree about state), and rule 12 (the agent
can never confirm an order).

## Iteration log

| Week | Input | Expected | Actual | What failed | What I changed |
|---|---|---|---|---|---|
| 0 | Cold load of / | Hero + roadmap, no login | | | |
| 0 | Every nav link | All 200, navbar persists | | | |
| 0 | 375px width | No horizontal scroll | | | |
| 1 | Blouse in M | Confirms, quotes $690 | | | |
| 1 | Blouse in L | States unavailable, no hedge | | | |
| 1 | Fabric and care | Invents nothing, lists in gaps | | | |
| 2 | Search by name | Narrows on keystroke | | | |
| 2 | Filter + search | Compose; clearing restores 8 | | | |
| 2 | Save research record | Row appears after reload | | | |
