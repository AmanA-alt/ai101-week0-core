import { describe, it, expect } from "vitest";
import { buildChatPrompt } from "@/lib/prompt";

const msgs = [{ role: "customer" as const, text: "do you have the blouse in M?" }];

describe("buildChatPrompt", () => {
  it("includes the catalog", () => {
    const p = buildChatPrompt(msgs);
    expect(p).toContain("Short-sleeve linen blouse");
    expect(p).toContain("BL-001");
  });

  it("includes the conversation history", () => {
    const p = buildChatPrompt(msgs);
    expect(p).toContain("do you have the blouse in M?");
  });

  it("is deterministic", () => {
    expect(buildChatPrompt(msgs)).toBe(buildChatPrompt(msgs));
  });

  it("forbids inventing stock and attributes", () => {
    const p = buildChatPrompt(msgs);
    expect(p).toContain("it is NOT available");
    expect(p).toContain("Never state a price");
  });

  it("forbids the agent confirming an order", () => {
    const p = buildChatPrompt(msgs);
    expect(p).toContain("Never confirm an order yourself");
  });
});
