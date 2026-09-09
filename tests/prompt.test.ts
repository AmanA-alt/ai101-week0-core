import { describe, it, expect } from "vitest";
import { buildPrompt } from "@/lib/prompt";

describe("buildPrompt", () => {
  it("includes every supplied field", () => {
    const p = buildPrompt({ itemName: "Blouse", fabric: "linen", colors: "bone" });
    expect(p).toContain("Blouse");
    expect(p).toContain("linen");
    expect(p).toContain("bone");
  });

  it("omits blank fields entirely", () => {
    const p = buildPrompt({ itemName: "Blouse", fabric: "", colors: "   " });
    expect(p).not.toContain("Fabric:");
    expect(p).not.toContain("Colors:");
  });

  it("is deterministic", () => {
    const attrs = { itemName: "Blouse", fabric: "linen" };
    expect(buildPrompt(attrs)).toBe(buildPrompt(attrs));
  });

  it("forbids inventing attributes", () => {
    const p = buildPrompt({ itemName: "Blouse" });
    expect(p).toContain("Do not invent");
    expect(p).toContain("artisanal");
  });
});
