import { describe, expect, it } from "vitest";
import { detectDelimiter, fromStorage, importCsv, mapHeadings, parseCsv, toCsv, toNumber, totals, validate } from "@/lib/inventory";

const COMMA = `Prenda,Talla,Color,Cantidad,Costo,Precio
Blusa de lino,M,Blanco,4,320,690
"Vestido midi, cruzado",S,Salvia,2,540,1290
`;
const SEMI = `Prenda;Talla;Color;Cantidad;Costo;Precio
Blusa de lino;M;Blanco;4;320;690
"Vestido midi, cruzado";S;Salvia;2;540;1290
`;

describe("parsing", () => {
  it("detects comma and semicolon files", () => {
    expect(detectDelimiter(COMMA)).toBe(",");
    expect(detectDelimiter(SEMI)).toBe(";");
  });
  it("comma and semicolon versions of the same sheet give the same rows", () => {
    expect(parseCsv(COMMA)).toEqual(parseCsv(SEMI));
  });
  it("keeps commas inside quoted fields and unescapes doubled quotes", () => {
    const rows = parseCsv('a,b\r\n"x, y","say ""hi"""\r\n');
    expect(rows[1]).toEqual(["x, y", 'say "hi"']);
  });
  it("strips a byte order mark", () => {
    expect(parseCsv("﻿Prenda,Talla\nA,M")[0][0]).toBe("Prenda");
  });
});

describe("headings", () => {
  it("maps Spanish and English headings, ignoring accents and case", () => {
    expect(mapHeadings(["Prenda", "TALLA", "Color", "Cantidad", "Artículo extra"])).toEqual(["name", "size", "colour", "quantity", null]);
    expect(mapHeadings(["Item", "Size", "Colour", "Qty", "Price"])).toEqual(["name", "size", "colour", "quantity", "price"]);
  });
});

describe("numbers", () => {
  it("reads the formats resellers type", () => {
    expect(toNumber("$1,290")).toBe(1290);
    expect(toNumber("1.290")).toBe(1290);
    expect(toNumber("12,5")).toBe(12.5);
    expect(toNumber(" 45 ")).toBe(45);
    expect(toNumber("")).toBeNull();
    expect(toNumber("cuatro")).toBeNaN();
  });
});

describe("validation", () => {
  it("flags a missing quantity, a negative price and a duplicated variant", () => {
    const { items } = importCsv(`Prenda,Talla,Color,Cantidad,Precio
Blusa,M,Blanco,,690
Falda,S,Negro,3,-100
Blusa,M,blanco,2,690
`);
    const msgs = validate(items).map((f) => f.message);
    expect(msgs).toContain("Missing quantity");
    expect(msgs).toContain("Negative price");
    expect(msgs).toContain("Same garment, size and colour listed twice");
    expect(msgs).toHaveLength(3);
  });
  it("flags sizes it does not know but accepts numeric sizes", () => {
    const { items } = importCsv("Prenda,Talla,Cantidad,Precio\nA,MM,1,10\nB,28,1,10\nC,CH,1,10\n");
    expect(validate(items).map((f) => f.message)).toEqual(['Unrecognised size "MM"']);
  });
  it("skips rows with no garment name", () => {
    expect(importCsv("Prenda,Talla\n,M\nBlusa,S\n").skipped).toBe(1);
  });
});

describe("round trip and storage", () => {
  it("exporting and importing gives back the same list", () => {
    const { items } = importCsv(COMMA);
    const again = importCsv(toCsv(items)).items;
    const strip = (xs: typeof items) => xs.map(({ id: _id, ...rest }) => rest);
    expect(strip(again)).toEqual(strip(items));
  });
  it("totals units and value", () => {
    const { items } = importCsv(COMMA);
    expect(totals(items)).toEqual({ rows: 2, units: 6, value: 4 * 690 + 2 * 1290 });
  });
  it("discards malformed storage instead of crashing", () => {
    expect(fromStorage("not json")).toEqual([]);
    expect(fromStorage('{"a":1}')).toEqual([]);
    expect(fromStorage(null)).toEqual([]);
  });
});
