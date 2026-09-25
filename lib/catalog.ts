export type CatalogItem = {
  id: string;
  name: string;
  sizesInStock: string[];
  priceMxn: number;
  fabric: string;
  measurements: string;
};

export const CATALOG: CatalogItem[] = [
  {
    id: "BL-001",
    name: "Short-sleeve linen blouse",
    sizesInStock: ["S", "M"],
    priceMxn: 690,
    fabric: "linen",
    measurements: "M: bust 96cm, length 62cm",
  },
  {
    id: "TR-002",
    name: "Wide-leg trousers, black",
    sizesInStock: ["M", "L", "XL"],
    priceMxn: 890,
    fabric: "viscose blend",
    measurements: "L: waist 78cm, inseam 74cm",
  },
  {
    id: "DR-003",
    name: "Midi wrap dress, sage",
    sizesInStock: ["S"],
    priceMxn: 1150,
    fabric: "cotton poplin",
    measurements: "S: bust 88cm, length 118cm",
  },
  {
    id: "JK-004",
    name: "Cropped denim jacket",
    sizesInStock: ["S", "M", "L"],
    priceMxn: 1290,
    fabric: "cotton denim",
    measurements: "M: chest 100cm, length 48cm",
  },
];

export const SHIPPING = "Same-day delivery in CDMX, 2 to 3 days nationwide.";

export function catalogAsText(): string {
  return CATALOG.map(
    (i) =>
      `- ${i.id} | ${i.name} | sizes in stock: ${i.sizesInStock.join(", ")} | ` +
      `$${i.priceMxn} MXN | ${i.fabric} | ${i.measurements}`
  ).join("\n");
}
