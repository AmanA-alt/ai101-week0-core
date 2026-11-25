import { describe, it, expect } from "vitest";
import { CATALOG } from "@/lib/catalog";
import {
  INTAKE,
  KIND_OF,
  answer,
  basketTotal,
  classify,
  isComplete,
  isGuardrail,
  nearMisses,
  needsHuman,
  recommend,
  summarize,
  type Intake,
  type Size,
  type Verdict,
} from "@/lib/guided";

const ALL_SIZES: Size[] = ["S", "M", "L", "XL"];

describe("intake", () => {
  it("asks exactly three questions", () => {
    expect(INTAKE).toHaveLength(3);
  });

  it("offers every option in both languages", () => {
    for (const step of INTAKE) {
      expect(step.question.es.length).toBeGreaterThan(0);
      expect(step.question.en.length).toBeGreaterThan(0);
      for (const o of step.options) {
        expect(o.label.es.length).toBeGreaterThan(0);
        expect(o.label.en.length).toBeGreaterThan(0);
      }
    }
  });

  it("is only complete once all three are answered", () => {
    expect(isComplete({})).toBe(false);
    expect(isComplete({ kind: "blouse" })).toBe(false);
    expect(isComplete({ kind: "blouse", size: "M" })).toBe(false);
    expect(isComplete({ kind: "blouse", size: "M", budget: "low" })).toBe(true);
  });
});

describe("recommend", () => {
  it("honours all three answers at once", () => {
    const intake: Intake = { kind: "blouse", size: "M", budget: "low" };
    const got = recommend(intake);
    expect(got.map((i) => i.id)).toEqual(["BL-001"]);
  });

  it("never returns an item in a size that is not in stock", () => {
    for (const size of ALL_SIZES) {
      for (const kind of ["blouse", "trousers", "dress", "jacket"] as const) {
        for (const item of recommend({ kind, size, budget: "any" })) {
          expect(item.sizesInStock).toContain(size);
        }
      }
    }
  });

  it("never returns an item over the stated budget", () => {
    // The sage dress is 1150, so a 'low' budget must exclude it even in its
    // one stocked size.
    expect(recommend({ kind: "dress", size: "S", budget: "low" })).toEqual([]);
    expect(recommend({ kind: "dress", size: "S", budget: "mid" }).map((i) => i.id)).toEqual(["DR-003"]);
  });

  it("offers the right kind as a near miss rather than going silent", () => {
    const intake: Intake = { kind: "dress", size: "L", budget: "any" };
    expect(recommend(intake)).toEqual([]);
    expect(nearMisses(intake).map((i) => i.id)).toEqual(["DR-003"]);
  });

  it("never lists the same item as both a match and a near miss", () => {
    for (const size of ALL_SIZES) {
      const intake: Intake = { kind: "jacket", size, budget: "any" };
      const matched = new Set(recommend(intake).map((i) => i.id));
      for (const miss of nearMisses(intake)) {
        expect(matched.has(miss.id)).toBe(false);
      }
    }
  });
});

describe("the guardrail", () => {
  /*
    The property the whole feature exists for. For every item and every size,
    the verdict must agree with the catalog, and it must never be in_catalog
    for a size that is not stocked. This is the failure that costs the sale
    twice, so it is tested exhaustively rather than by example.
  */
  it("never affirms a size that is not in stock, for any item", () => {
    for (const item of CATALOG) {
      const kind = KIND_OF[item.id];
      for (const size of ALL_SIZES) {
        const v = classify(`do you have the ${kind} in ${size}?`);
        if (v.kind === "in_catalog" && v.size) {
          expect(item.sizesInStock).toContain(v.size);
        }
        if (v.kind === "size_unavailable") {
          expect(v.item.sizesInStock).not.toContain(v.size);
        }
      }
    }
  });

  it("says no plainly when the size is out of stock", () => {
    const v = classify("¿tienes la blusa en G?");
    expect(v.kind).toBe("size_unavailable");
    const text = answer(v, "es");
    expect(text.startsWith("No,")).toBe(true);
    expect(text).toContain("S, M");
  });

  it("refuses to invent care instructions the catalog does not hold", () => {
    const v = classify("¿cómo lavo el vestido?");
    expect(v.kind).toBe("not_on_file");
    expect(needsHuman(v)).toBe(true);
  });

  it("answers care normally when the catalog does hold it", () => {
    const v = classify("¿cómo lavo la blusa?");
    expect(v.kind).toBe("in_catalog");
    expect(isGuardrail(v)).toBe(false);
  });

  it("treats an off-topic question as off-topic even when it names an item", () => {
    // The hard case: this sentence contains "blusa", so an item-first check
    // would have answered the half it recognised and ignored the actual ask.
    const v = classify("¿me das descuento en la blusa?");
    expect(v.kind).toBe("outside_catalog");
    if (v.kind === "outside_catalog") expect(v.topic).toBe("discount");
    expect(needsHuman(v)).toBe(true);
  });

  it("hands over returns and made-to-measure rather than guessing", () => {
    expect(classify("quiero devolver esto").kind).toBe("outside_catalog");
    expect(classify("¿lo hacen a la medida?").kind).toBe("outside_catalog");
  });

  it("answers shipping, which the catalog does know", () => {
    const v = classify("¿cuándo llega mi pedido?");
    expect(v.kind).toBe("shipping");
    expect(isGuardrail(v)).toBe(false);
  });

  it("hands over anything it does not recognise at all", () => {
    const v = classify("¿tienes zapatos?");
    expect(v.kind).toBe("outside_catalog");
    if (v.kind === "outside_catalog") expect(v.topic).toBe("other");
  });

  it("ignores accents and case", () => {
    expect(classify("¿TIENES EL PANTALÓN EN M?").kind).toBe("in_catalog");
    expect(classify("tienes el pantalon en m").kind).toBe("in_catalog");
  });

  it("does not read a size out of the middle of a word", () => {
    // "me" and "la" contain size letters; only a standalone token counts.
    const v = classify("me gusta la blusa de lino");
    expect(v.kind).toBe("in_catalog");
    if (v.kind === "in_catalog") expect(v.size).toBeNull();
  });
});

describe("the session summary", () => {
  it("counts only the turns the guardrail caught", () => {
    const verdicts: Verdict[] = [
      classify("¿tienes la blusa en M?"),
      classify("¿tienes la blusa en G?"),
      classify("¿me das descuento?"),
    ];
    const s = summarize({ kind: "blouse", size: "M", budget: "low" }, verdicts, []);
    expect(s.turns).toBe(3);
    expect(s.guardrailHits).toBe(2);
  });

  it("totals the basket and keeps the assumptions beside it", () => {
    const basket = [
      { id: "BL-001", name: "blouse", priceMxn: 690, size: "M" as Size },
      { id: "TR-002", name: "trousers", priceMxn: 890, size: "M" as Size },
    ];
    expect(basketTotal(basket)).toBe(1580);
    const s = summarize({ kind: "blouse", size: "M", budget: "any" }, [], basket);
    expect(s.totalMxn).toBe(1580);
    expect(s.intake?.size).toBe("M");
  });

  it("totals an empty basket as zero rather than failing", () => {
    expect(basketTotal([])).toBe(0);
  });
});
