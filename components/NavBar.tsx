"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Ghost from "./Ghost";
import ThemeToggle from "./ThemeToggle";

/**
 * The product bar.
 *
 * Fixed and translucent, so the page reads underneath it. Links are grouped by
 * what they are for instead of nine equal words in a row. The current page
 * carries an underline that slides between tabs, and hover draws the same line
 * in from the centre. Everything moves on transform, so it stays smooth.
 *
 * Below 1280px the links fold behind a menu button into a full-height panel,
 * because wrapped links on three lines read as broken, not as navigation.
 */

type NavLink = { href: string; label: string };

const GROUPS: { label: string; links: NavLink[] }[] = [
  {
    label: "Tool",
    links: [
      { href: "/chat", label: "Chat" },
      { href: "/core", label: "Agent" },
      { href: "/inventory", label: "Inventory" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    label: "Venture",
    links: [
      { href: "/product", label: "Product" },
      { href: "/pricing", label: "Pricing" },
      { href: "/research", label: "Research" },
      { href: "/marketing", label: "Marketing" },
    ],
  },
  {
    label: "Project",
    links: [{ href: "/docs", label: "Docs" }],
  },
];

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  ...GROUPS.flatMap((g) => g.links),
  { href: "/demo", label: "Demo" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavBar() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  // The panel is open for the page it was opened on, so navigating closes it
  // without an effect having to reset state.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (fn: (o: boolean) => boolean) => setOpenOn(fn(open) ? pathname : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the panel while it is open.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6"
      >
        <Link href="/" className="nav-brand" aria-label="Bastilla, home">
          <Ghost size={30} motion="none" label="Bastilla logo" />
          <span>Bastilla</span>
        </Link>

        <div className="hidden items-center gap-0.5 xl:flex">
          {GROUPS.map((g, gi) => (
            <div key={g.label} className="flex items-center">
              {gi > 0 && <span aria-hidden="true" className="nav-sep" />}
              {g.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(pathname, l.href) ? "page" : undefined}
                  className="nav-tab"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/demo"
            aria-current={isActive(pathname, "/demo") ? "page" : undefined}
            className="nav-cta hidden sm:inline-flex"
          >
            Demo
            <span aria-hidden="true" className="nav-cta-arrow">→</span>
          </Link>
          <button
            type="button"
            className="nav-burger xl:hidden"
            aria-expanded={open}
            aria-controls="nav-panel"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div id="nav-panel" className={`nav-panel xl:hidden ${open ? "nav-panel--open" : ""}`} hidden={!open}>
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-4">
          {[{ label: "", links: [{ href: "/", label: "Home" }] }, ...GROUPS].map((g, gi) => (
            <div key={g.label || "home"} className="border-t border-[var(--line)] py-4 first:border-t-0">
              {g.label && <p className="mono m-0 mb-2 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">{g.label}</p>}
              {g.links.map((l, li) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(pathname, l.href) ? "page" : undefined}
                  className="nav-panel-link"
                  style={{ transitionDelay: open ? `${(gi * 2 + li) * 35}ms` : "0ms" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
          <Link href="/demo" className="nav-cta mt-4 flex w-full justify-center">
            Guided demo <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
