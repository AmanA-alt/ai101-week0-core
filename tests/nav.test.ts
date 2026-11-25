import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { NAV_LINKS } from "@/components/NavBar";

// Every link in the menu must point at a page that exists, so a page cannot
// be added to the navigation without being built, or deleted without the
// menu noticing.
describe("navigation", () => {
  it.each(NAV_LINKS.map((l) => [l.href]))("%s has a page file", (href) => {
    const dir = href === "/" ? "app" : join("app", href);
    expect(existsSync(join(process.cwd(), dir, "page.tsx"))).toBe(true);
  });
});
