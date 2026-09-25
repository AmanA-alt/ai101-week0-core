import { describe, it, expect } from "vitest";
import { parseChatResponse, ParseError } from "@/lib/parse";

const valid = {
  reply: "Yes, M is in stock.",
  basket: [{ itemId: "BL-001", name: "Blouse", size: "M", qty: 1, priceMxn: 690 }],
  gaps: "none",
};

describe("parseChatResponse", () => {
  it("accepts bare JSON", () => {
    expect(parseChatResponse(JSON.stringify(valid))).toEqual(valid);
  });

  it("accepts JSON wrapped in markdown fences", () => {
    expect(parseChatResponse("```json\n" + JSON.stringify(valid) + "\n```")).toEqual(valid);
  });

  it("accepts an empty basket", () => {
    const empty = { ...valid, basket: [] };
    expect(parseChatResponse(JSON.stringify(empty)).basket).toEqual([]);
  });

  it("rejects a missing key", () => {
    expect(() => parseChatResponse('{"reply":"hi","gaps":"none"}')).toThrow(ParseError);
  });

  it("rejects a basket line without a size", () => {
    const bad = { ...valid, basket: [{ itemId: "BL-001", name: "Blouse", qty: 1, priceMxn: 690 }] };
    expect(() => parseChatResponse(JSON.stringify(bad))).toThrow(ParseError);
  });

  it("rejects a zero quantity", () => {
    const bad = { ...valid, basket: [{ ...valid.basket[0], qty: 0 }] };
    expect(() => parseChatResponse(JSON.stringify(bad))).toThrow(ParseError);
  });

  it("rejects non-JSON", () => {
    expect(() => parseChatResponse("sorry, I cannot")).toThrow(ParseError);
  });
});
