import Link from "next/link";
import Ghost from "./Ghost";

/**
 * The footer carries the one statement a reseller should be able to find on
 * every page: what the product stores, and what it never does.
 */
export default function Footer() {
  return (
    <footer className="relative z-[1] mt-16 border-t border-[var(--line)] bg-[var(--bone)]">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="m-0 flex items-center gap-2 font-medium text-[var(--indigo)]">
            <Ghost size={24} motion="none" label="Bastilla logo" /> Bastilla
          </p>
          <p className="m-0 mt-3 max-w-[36ch] text-sm leading-relaxed text-[var(--muted)]">
            Built for small clothing resellers in Mexico City.
          </p>
        </div>
        <div>
          <p className="mono m-0 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">What we store</p>
          <p className="m-0 mt-2 text-[13px] leading-relaxed">
            Baskets you send for review, chat sessions without names, and anonymous A/B counts.
          </p>
        </div>
        <div>
          <p className="mono m-0 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">What we never do</p>
          <p className="m-0 mt-2 text-[13px] leading-relaxed">
            Confirm an order for you, invent stock, or receive your{" "}
            <Link href="/inventory" className="underline underline-offset-4">inventory</Link>, which stays on your device.
          </p>
        </div>
      </div>
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-2 border-t border-[var(--line)] px-6 py-5">
        <p className="mono m-0 text-xs text-[var(--muted)]">AI-101 · IBERO · 2026</p>
        <Link href="/docs" className="mono text-xs text-[var(--muted)] underline underline-offset-4">How it was built</Link>
      </div>
    </footer>
  );
}
