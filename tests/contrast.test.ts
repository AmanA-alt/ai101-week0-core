import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AA_TEXT, contrast } from "@/lib/contrast";
import { resolveTheme } from "@/lib/theme";

/**
 * Reads the palettes straight out of globals.css, so the test checks what
 * actually ships rather than a copy that could drift.
 */
const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`No ${selector} block`);
  const body = css.slice(start, css.indexOf("}", start));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) out[m[1]] = m[2];
  return out;
}

const light = block(":root");
const dark = { ...light, ...block('[data-theme="dark"]') };

// Every text colour the site uses, against every surface it sits on.
const TEXT = ["ink", "muted", "indigo", "cochineal", "caution"];
const SURFACES = ["bone", "surface"];

describe("contrast function", () => {
  it("matches the WCAG reference values", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#777777", "#777777")).toBe(1);
  });
});

describe.each([
  ["light", light],
  ["dark", dark],
])("%s appearance", (_name, p) => {
  for (const fg of TEXT) {
    for (const bg of SURFACES) {
      it(`${fg} on ${bg} passes AA`, () => {
        expect(contrast(p[fg], p[bg])).toBeGreaterThanOrEqual(AA_TEXT);
      });
    }
  }
});

describe("panels that stay dark in both appearances", () => {
  it("bone on indigo and bone on deep pass AA", () => {
    expect(contrast(light.bone, light.indigo)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(light.bone, light.deep)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

describe("resolveTheme", () => {
  it("a saved choice wins over the system", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("falls back to the system setting", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
    expect(resolveTheme("purple", false)).toBe("light");
  });
});
