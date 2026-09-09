import { describe, it, expect } from "vitest";
import { parseModelResponse, ParseError } from "@/lib/parse";

const valid = { instagram: "a", facebook: "b", whatsapp: "c" };

describe("parseModelResponse", () => {
  it("accepts bare JSON", () => {
    expect(parseModelResponse(JSON.stringify(valid))).toEqual(valid);
  });

  it("accepts JSON wrapped in markdown fences", () => {
    expect(parseModelResponse("```json\n" + JSON.stringify(valid) + "\n```")).toEqual(valid);
  });

  it("rejects a missing key", () => {
    expect(() => parseModelResponse('{"instagram":"a","facebook":"b"}')).toThrow(ParseError);
  });

  it("rejects a non-string value", () => {
    expect(() =>
      parseModelResponse('{"instagram":"a","facebook":"b","whatsapp":42}')
    ).toThrow(ParseError);
  });

  it("rejects an empty channel", () => {
    expect(() =>
      parseModelResponse('{"instagram":"a","facebook":"b","whatsapp":"  "}')
    ).toThrow(ParseError);
  });

  it("rejects non-JSON", () => {
    expect(() => parseModelResponse("sorry, I cannot")).toThrow(ParseError);
  });
});
