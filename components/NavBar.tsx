import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/core", label: "Agent" },
  { href: "/research", label: "Research" },
  { href: "/docs", label: "Docs" },
];

export default function NavBar() {
  return (
    <nav className="border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="text-base font-medium tracking-tight">
          Respondo
        </Link>
        <div className="flex items-center gap-5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--muted)] hover:text-[var(--thread)]"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
