/**
 * Week 3 — product architecture content.
 *
 * Static and in the bundle for the same reason the Week 2 research data is:
 * this is my own analysis, so it changes with a code change, not with a form
 * submission. Only the saved pricing scenarios go to the database.
 */

import type { TierId } from "./pricing";

export type Segment = {
  name: string;
  rank: string;
  facts: { k: string; v: string }[];
  arguments: { heading: string; body: string }[];
};

export const SEGMENTS: Segment[] = [
  {
    name: "The solo reseller",
    rank: "Primary segment",
    facts: [
      { k: "Size", v: "One person, 20 to 200 items" },
      { k: "Finds", v: "Instagram and Facebook" },
      { k: "Closes", v: "WhatsApp, by hand" },
      { k: "Ceiling", v: "About MXN 500 a month" },
    ],
    arguments: [
      {
        heading: "Messages arrive when nobody is holding the phone",
        body: "Around 64% of small-business ecommerce in Mexico starts or closes on WhatsApp. The seller is one person, and a question at midnight waits until morning — by which point the customer has usually bought elsewhere.",
      },
      {
        heading: "A wrong answer costs more than no answer",
        body: "The most common question in apparel is availability in a size. A generic bot answers it confidently and sometimes wrongly, which loses the sale twice: the customer is disappointed and the seller looks unreliable.",
      },
      {
        heading: "Every tool here prices for a team",
        body: "Leadsales is about MXN 1,450 a month for three seats. Kommo charges per user. A one-person business pays for seats it will never fill, so it stays on manual WhatsApp and keeps the problem.",
      },
    ],
  },
  {
    name: "The small boutique",
    rank: "Secondary segment",
    facts: [
      { k: "Size", v: "Two to five people, 500+ items" },
      { k: "Finds", v: "Instagram and foot traffic" },
      { k: "Closes", v: "One shared phone, or an entry CRM" },
      { k: "Ceiling", v: "Will pay more, needs apartado" },
    ],
    arguments: [
      {
        heading: "The shared phone is the bottleneck",
        body: "Two or three people answering from one number means messages get answered twice or not at all. Existing shared inboxes solve this, which is why this segment is reachable but not where the opening is.",
      },
      {
        heading: "Apartado is the unserved part",
        body: "Layaway is standard in Mexican clothing retail and absent from every tool in the Week 2 study, because they were designed around US workflows. A boutique tracking it on paper is doing work no competitor has offered to take.",
      },
    ],
  },
];

export type Capability = {
  name: string;
  detail?: string;
  status: "live" | "planned";
  week?: number;
  mexico?: boolean;
  tiers: TierId[];
};

export type CapabilityGroup = {
  name: string;
  note: string;
  items: Capability[];
};

export const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    name: "Answering",
    note: "The core loop",
    items: [
      {
        name: "Catalog-grounded replies",
        detail: "Never states stock it cannot confirm",
        status: "live",
        tiers: ["solo", "negocio", "taller"],
      },
      {
        name: "Basket assembly",
        detail: "Restated in full on every turn",
        status: "live",
        tiers: ["solo", "negocio", "taller"],
      },
      {
        name: "Human confirmation gate",
        detail: "Nothing becomes an order on its own",
        status: "live",
        tiers: ["solo", "negocio", "taller"],
      },
    ],
  },
  {
    name: "Catalog",
    note: "What the agent is allowed to read",
    items: [
      { name: "Manual entry", status: "live", tiers: ["solo", "negocio", "taller"] },
      {
        name: "Fabric and care detail",
        detail: "Added after a self-test escalated every care question",
        status: "live",
        tiers: ["solo", "negocio", "taller"],
      },
      { name: "Bulk import from a sheet", status: "planned", week: 4, tiers: ["negocio", "taller"] },
    ],
  },
  {
    name: "Built for Mexico",
    note: "Absent from every competitor studied",
    items: [
      {
        name: "Apartado tracking",
        detail: "Layaway is standard here and in no US-built tool",
        status: "planned",
        week: 5,
        mexico: true,
        tiers: ["negocio", "taller"],
      },
      {
        name: "Same-day CDMX delivery logic",
        status: "planned",
        week: 5,
        mexico: true,
        tiers: ["negocio", "taller"],
      },
    ],
  },
  {
    name: "Scale",
    note: "Only once the core is proven",
    items: [
      { name: "Shared inbox, multiple numbers", status: "planned", week: 6, tiers: ["negocio", "taller"] },
      { name: "Monthly sales report", status: "planned", week: 7, tiers: ["taller"] },
    ],
  },
];
