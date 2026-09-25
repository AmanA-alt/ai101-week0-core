export type Benchmark = {
  name: string;
  region: string;
  what: string;
  pricing: string;
};

export type Competitor = {
  name: string;
  category: "CRM" | "Inbox" | "Platform" | "AI agent" | "Substitute";
  pricing: string;
  strength: string;
  gap: string;
};

export type Risk = {
  label: string;
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
};

export const BENCHMARKS: Benchmark[] = [
  {
    name: "Blip",
    region: "Brazil",
    what: "Conversational commerce platform. Ran a fully automated WhatsApp sales process with an interactive catalog for Nespresso.",
    pricing: "Enterprise, quote-based",
  },
  {
    name: "Respond.io",
    region: "Singapore",
    what: "Multichannel inbox across WhatsApp, Instagram, Messenger, Telegram and email, with visual workflow automation.",
    pricing: "~USD 15 / user / month",
  },
  {
    name: "Aurora Inbox",
    region: "LATAM",
    what: "AI agents replying in under three seconds, multi-agent shared inbox, conversational CRM with a visual pipeline.",
    pricing: "Per-seat subscription",
  },
  {
    name: "Whapi.Cloud",
    region: "United Kingdom",
    what: "Developer WhatsApp API with a flat price per connected number and no per-message fee. Free sandbox for testing.",
    pricing: "~USD 29 / month / channel",
  },
  {
    name: "Meta WhatsApp Cloud API",
    region: "Global",
    what: "The official platform. API access is free; Meta charges per 24-hour conversation window, with the first 1,000 service conversations free.",
    pricing: "Free tier, then per conversation",
  },
];

export const COMPETITORS: Competitor[] = [
  {
    name: "Leadsales",
    category: "CRM",
    pricing: "~USD 84/mo, 3 users",
    strength: "Mexican company, MXN billing, local support hours",
    gap: "Weaker automation than rivals; priced for a team, not one person",
  },
  {
    name: "Kommo",
    category: "CRM",
    pricing: "~USD 15/user/mo",
    strength: "Multiple sales pipelines, auto-tagging, built-in chatbots",
    gap: "Per-user pricing punishes a one-person business",
  },
  {
    name: "Callbell",
    category: "Inbox",
    pricing: "~USD 15/user/mo",
    strength: "Simple multichannel inbox, quick to set up",
    gap: "Basic reporting; no AI answering from inventory",
  },
  {
    name: "Respond.io",
    category: "Platform",
    pricing: "~USD 15/user/mo",
    strength: "Powerful visual workflows, integrated AI, 24/5 support",
    gap: "Built for teams of 5 to 15; setup is a project in itself",
  },
  {
    name: "Aurora Inbox",
    category: "AI agent",
    pricing: "Per-seat",
    strength: "Sub-three-second AI replies, conversational CRM",
    gap: "Generic across verticals; no apparel size or variant logic",
  },
  {
    name: "Manual WhatsApp Business",
    category: "Substitute",
    pricing: "Free",
    strength: "Zero cost, already installed, catalog and labels built in",
    gap: "Stops when the human sleeps — which is the actual problem",
  },
  {
    name: "Part-time assistant",
    category: "Substitute",
    pricing: "~MXN 6,000+/mo",
    strength: "Handles judgment, exceptions and apartado properly",
    gap: "Cost, training time and turnover",
  },
  {
    name: "Instagram auto-replies",
    category: "Substitute",
    pricing: "Free",
    strength: "Native to the channel, no setup at all",
    gap: "Canned text only; cannot answer about stock or price",
  },
];

export const RISKS: Risk[] = [
  { label: "Meta restricts unofficial automation", likelihood: "High", impact: "High" },
  { label: "Incumbent adds apparel size logic", likelihood: "Medium", impact: "High" },
  { label: "Free-tier model limits break the demo", likelihood: "High", impact: "Medium" },
  { label: "Resellers distrust AI with customers", likelihood: "Medium", impact: "High" },
  { label: "Catalog upkeep too manual to sustain", likelihood: "High", impact: "Medium" },
  { label: "Per-conversation cost exceeds willingness to pay", likelihood: "Medium", impact: "Medium" },
  { label: "Model invents stock despite prompt rules", likelihood: "Medium", impact: "High" },
];

export const LOCALIZATION = [
  {
    title: "WhatsApp is not a channel, it is the channel",
    body: "Roughly 64% of PyME ecommerce transactions in Mexico start, run or close on WhatsApp. A tool that treats it as one integration among several has the priorities backwards.",
  },
  {
    title: "Apartado has no equivalent in US-built tools",
    body: "Layaway is standard in Mexican clothing retail and absent from every competitor in this set, because they were designed around US SaaS workflows.",
  },
  {
    title: "Price sensitivity is structural, not preference",
    body: "A mid-size Mexican agency charges MXN 50,000 to 250,000 a month for strategy. For a PyME turning 6 million that consumes the whole budget. The same logic runs downward: MXN 1,450 a month for a CRM is a team purchase, not a solo one.",
  },
  {
    title: "Channel split varies by city",
    body: "Instagram dominates in CDMX and Guadalajara; Facebook holds in Monterrey and the industrial north. A single national message under-performs in one of them.",
  },
];
