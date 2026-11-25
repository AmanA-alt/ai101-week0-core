/**
 * Static content for /demo and /docs.
 *
 * Typed so that a missing field is a compile error rather than a blank card.
 * The agent map, the walkthrough and the prompt library all render from here,
 * so the diagram and its description cannot drift apart.
 */

/* ------------------------------------------------------------- agent map */

export type StageKind = "model" | "code" | "database" | "human";

export type Stage = { id: string; title: string; kind: StageKind; detail: string };

export const KIND_LABEL: Record<StageKind, string> = {
  model: "Model",
  code: "Code",
  database: "Database",
  human: "Human",
};

export const AGENT_MAP: Stage[] = [
  { id: "msg", title: "Customer message", kind: "code", detail: "A question in Spanish or English, typed into the chat." },
  { id: "parse", title: "Guardrail", kind: "code", detail: "Pure functions judge the question and hand anything off-catalog to a person." },
  { id: "catalog", title: "Stock lookup", kind: "code", detail: "Whether a size exists is decided here, by a lookup. Never by a model." },
  { id: "llm", title: "Wording", kind: "model", detail: "On /core, Groq (openai/gpt-oss-120b) phrases the reply from those rows. /chat uses no model at all." },
  { id: "validate", title: "Validation", kind: "code", detail: "zod checks the reply. A size not in the catalog is rejected, never hedged." },
  { id: "basket", title: "Basket, repriced", kind: "code", detail: "The server recalculates every price instead of trusting the browser." },
  { id: "store", title: "Saved as pending review", kind: "database", detail: "One row in Supabase. The status can never start as confirmed." },
  { id: "human", title: "You confirm", kind: "human", detail: "Nothing becomes an order until a person decides." },
];

/* ---------------------------------------------------------- walkthrough */

export type DemoStep = { n: string; claim: string; body: string; href: string; cta: string };

export const DEMO_STEPS: DemoStep[] = [
  {
    n: "01",
    claim: "Resellers lose sales answering the same questions by hand.",
    body: "A woman selling clothes on Instagram answers size, price and stock questions one by one on WhatsApp, often late at night. Every slow answer is a customer who buys elsewhere.",
    href: "/research",
    cta: "See the research",
  },
  {
    n: "02",
    claim: "The agent answers only from the catalog.",
    body: "Ask it for a size that does not exist and it says no, instead of inventing stock. The conversation beside this is an example built on the agent's real rules; the live chat is one click away.",
    href: "/chat",
    cta: "Open the live chat",
  },
  {
    n: "03",
    claim: "Every basket waits for a human.",
    body: "The agent assembles the basket and stores it as pending review. The dashboard shows it, and nothing becomes an order on its own.",
    href: "/dashboard",
    cta: "Open the dashboard",
  },
  {
    n: "04",
    claim: "Her stock stays on her phone.",
    body: "The inventory page loads a spreadsheet or takes rows by hand and saves them only in her browser. No route receives it and no table stores it.",
    href: "/inventory",
    cta: "Open the inventory",
  },
  {
    n: "05",
    claim: "Tested by people who are not me.",
    body: "Five external users ran the same four tasks, and an automated regression test checks every page and route on the live site.",
    href: "#testing",
    cta: "See the results",
  },
  {
    n: "06",
    claim: "Checked for harm, with a plan for what comes next.",
    body: "The impact check names what the product is worth and what it could get wrong. The version 2 roadmap comes straight out of it.",
    href: "#impact",
    cta: "Read the impact check",
  },
];

export type Bubble = { from: "customer" | "agent"; text: string };

/** An example conversation following the agent's real rules, labelled as an example on the page. */
export const RECORDING: Bubble[] = [
  { from: "customer", text: "Hola, ¿tienes la blusa de lino en M?" },
  { from: "agent", text: "Sí, la blusa de lino de manga corta está en M, a $690. ¿Te la agrego?" },
  { from: "customer", text: "Sí. ¿Y la tienes en L?" },
  { from: "agent", text: "En L no la tengo, solo en S y M. Tu pedido: 1 blusa de lino M, $690. Queda pendiente de que la dueña lo confirme." },
];

/* --------------------------------------------------------- impact check */

export type ImpactItem = { title: string; body: string; guard: string };

export const VALUE: ImpactItem = {
  title: "What it is worth",
  body: "It takes the repetitive half of a WhatsApp sale: whether an item exists in her size, what it costs, and the running total. It does not take the decision, which stays with her.",
  guard: "Measured with five external testers on the same four tasks.",
};

export const RISKS: ImpactItem[] = [
  {
    title: "Invented stock",
    body: "An agent that says an item is available when it is not breaks a promise to a real customer.",
    guard: "Answers only from catalog rows; output validated; an unknown size is refused, never guessed.",
  },
  {
    title: "An order nobody approved",
    body: "If the agent could confirm, a mistake would become a sale.",
    guard: "Every basket starts as pending review. The dashboard has no approve button while the site has no login.",
  },
  {
    title: "Customer conversations",
    body: "Until this module, the orders route returned full transcripts to anyone who asked.",
    guard: "The route now returns only status, item count and subtotal. The dashboard masks labels and never shows transcripts.",
  },
  {
    title: "A reseller's commercial data",
    body: "Her stock list shows what she paid, what she charges and how much she holds.",
    guard: "Saved only in her browser. No route, no table. She can export a backup and delete everything.",
  },
  {
    title: "One model provider",
    body: "If Groq changes its free tier, the agent stops answering.",
    guard: "The provider sits in one file and can be swapped without touching the rest of the site.",
  },
  {
    title: "Prices nobody has paid",
    body: "The three tiers trace to competitor prices, but no reseller has paid one yet.",
    guard: "Stated on the pricing page as unvalidated, not presented as proven demand.",
  },
];

/* ------------------------------------------------------- version 2 plan */

export type RoadmapItem = { title: string; why: string; source: string };

export const ROADMAP_V2: RoadmapItem[] = [
  { title: "Login and an approval queue", why: "Approve or reject baskets from the dashboard without giving that power to the public.", source: "Impact check: an order nobody approved" },
  { title: "Connect her inventory to the agent", why: "Answer from her real stock, as an explicit choice that states which rows go to the model.", source: "Inventory page limit" },
  { title: "Encrypted sync across devices", why: "Open the same stock list on a second phone without the server being able to read it.", source: "Inventory page limit" },
  { title: "Official WhatsApp connection", why: "Answer where customers already are. Needs a verified business account and review.", source: "Simulated transport" },
  { title: "Apartado (layaway)", why: "Common in Mexican retail and supported by no competitor studied.", source: "Research" },
  { title: "Animated mascot states everywhere", why: "Let the ghost show what the agent is doing on every page, not only the agent screen.", source: "UX" },
];

/* ------------------------------------------------------ prompt library */

export type PromptEntry = { module: string; title: string; prompt: string; outcome: string };

export const PROMPT_LIBRARY: PromptEntry[] = [
  {
    module: "Module 0",
    title: "Build Discipline Packet before any code",
    prompt: "Act as a disciplined product architect. Do not let me code before the plan is clear. Free tools only: Next.js, Tailwind, Vercel, GitHub, Supabase. Small, testable features, no paid APIs, acceptance criteria before implementation.",
    outcome: "The assistant refused to write the packet until the build target was specified, which showed that \"a tool for my business\" was not a spec.",
  },
  {
    module: "Module 1",
    title: "A multi-turn sales agent that cannot confirm",
    prompt: "Rewrite the prompt builder from single-shot copy into a conversation with basket extraction. A size not listed is unavailable, never hedge. Restate the whole basket every turn. The agent can never confirm an order.",
    outcome: "Rules 7, 8 and 12 of the agent prompt. The basket is stored as pending_review, never confirmed.",
  },
  {
    module: "Module 2",
    title: "Research with honest substitutes",
    prompt: "Build /research with global benchmarks, competitors and substitutes, including doing nothing and hiring an assistant, a risk map and Mexico specific localisation notes.",
    outcome: "Eight competitors and substitutes, with apartado identified as a gap nobody serves.",
  },
  {
    module: "Module 3",
    title: "Pricing arithmetic as pure functions",
    prompt: "Keep every revenue calculation in lib/pricing.ts with no React and no network, and test it before any page uses it.",
    outcome: "The tests caught churn being counted twice before it reached the simulator.",
  },
  {
    module: "Module 4",
    title: "A/B assignment that trusts nobody",
    prompt: "Assignment is a pure deterministic function of visitor and experiment. The events route recalculates the variant from the visitor id and rejects any event where the browser disagrees.",
    outcome: "The independence test caught both experiments silently using the same split.",
  },
  {
    module: "Module 5",
    title: "A guided assistant with a tested guardrail",
    prompt: "Guided intake and the guardrail as pure functions. The server re-judges every question and reprices the basket instead of trusting the browser.",
    outcome: "The stock property is tested exhaustively across the catalog.",
  },
  {
    module: "Module 6",
    title: "Integrate, prove, and protect",
    prompt: "Add /dashboard as a server component that selects only public safe columns, /inventory that never makes a network request, /demo with an agent map generated from typed stages, two appearances with contrast checked by a test, and a regression script for the live site. No login, no approve button, no public write routes.",
    outcome: "The contrast test failed the muted grey at 4.2:1 on the very first run; the orders route was found returning transcripts and fixed.",
  },
];

/* ------------------------------------------------------------ build log */

export type BuildModule = { module: string; title: string; note: string; commits: [string, string][] };

export const BUILD_LOG: BuildModule[] = [
  {
    module: "Module 0",
    title: "Builder infrastructure",
    note: "GitHub to Vercel to Supabase, the shell, navigation and README.",
    commits: [
      ["833b9a0", "scaffold next app and tailwind"],
      ["949dd03", "shared layout with navbar and footer"],
    ],
  },
  {
    module: "Module 1",
    title: "The core agent",
    note: "Catalog, chat prompt builder, basket parser and human handoff. Self-test 3 found missing care instructions.",
    commits: [
      ["75fd9b4", "catalog, chat prompt builder and basket parser"],
      ["d39b3a2", "chat agent screen, basket and human handoff"],
      ["8651b9a", "add care instructions after self-test 3"],
    ],
  },
  {
    module: "Module 2",
    title: "Research",
    note: "Benchmarks, competitors, substitutes and a risk map.",
    commits: [
      ["42f6651", "research data and intake route"],
      ["f3c947d", "research dashboard with filter, search and risk map"],
    ],
  },
  {
    module: "Module 3",
    title: "Product and pricing",
    note: "Pricing model tested before the simulator existed.",
    commits: [
      ["ccd65be", "pricing model: tiers, mix split, revenue"],
      ["a6f6877", "pricing logic tests"],
      ["59914ae", "/pricing: tiers, revenue simulator, saved list"],
    ],
  },
  {
    module: "Module 4",
    title: "Marketing engine",
    note: "Brand system, content library and two A/B tests. Fixed a hash that made both tests share one split.",
    commits: [
      ["707c7b7", "brand system"],
      ["2602736", "A/B assignment as pure functions"],
      ["2e00cf2", "A/B tests: determinism, distribution, independence"],
      ["105f085", "/marketing"],
    ],
  },
  {
    module: "Module 5",
    title: "Guided assistant",
    note: "Renamed the product to Bastilla and added the public guided chat.",
    commits: [
      ["051e367", "rename the product to Bastilla"],
      ["c91974d", "guided intake and guardrail as pure functions"],
      ["1403945", "/chat, the public guided assistant"],
    ],
  },
];
