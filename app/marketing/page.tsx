import MarketingClient from "@/components/MarketingClient";

export const metadata = {
  title: "Marketing engine — Respondo",
  description:
    "Brand system, target persona, landing copy, ten social posts, three video scripts, a 14-day campaign and the live A/B test running on the landing page.",
};

/**
 * Server shell. The page itself is a client component — the language toggle,
 * the copy buttons, the saved list and the variant readout are all per-viewer
 * state — but metadata can only be exported from a server component, so the
 * route keeps a thin server wrapper.
 */
export default function MarketingPage() {
  return <MarketingClient />;
}
