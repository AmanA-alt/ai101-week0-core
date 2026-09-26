export type CatalogItem = {
  id: string;
  name: string;
  sizesInStock: string[];
  priceMxn: number;
  fabric: string;
  measurements: string;
  care?: string;
};

export const CATALOG: CatalogItem[] = [
  {
    id: "BL-001",
    name: "Short-sleeve linen blouse",
    sizesInStock: ["S", "M"],
    priceMxn: 690,
    fabric: "100% linen",
    measurements: "M: bust 96cm, length 62cm",
    care: "Machine wash cold on a gentle cycle, hang to dry, warm iron while slightly damp. Do not tumble dry.",
  },
  {
    id: "TR-002",
    name: "Wide-leg trousers, black",
    sizesInStock: ["M", "L", "XL"],
    priceMxn: 890,
    fabric: "70% viscose, 30% polyester",
    measurements: "L: waist 78cm, inseam 74cm",
    care: "Machine wash cold, hang to dry, cool iron on the reverse. Do not bleach.",
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
    fabric: "98% cotton denim, 2% elastane",
    measurements: "M: chest 100cm, length 48cm",
    care: "Machine wash cold inside out, wash separately the first few times, hang to dry.",
  },
];

export const SHIPPING = "Same-day delivery in CDMX, 2 to 3 days nationwide.";

export function catalogAsText(): string {
  return CATALOG.map((i) => {
    const care = i.care ? ` | care: ${i.care}` : " | care: NOT ON FILE";
    return (
      `- ${i.id} | ${i.name} | sizes in stock: ${i.sizesInStock.join(", ")} | ` +
      `$${i.priceMxn} MXN | ${i.fabric} | ${i.measurements}${care}`
    );
  }).join("\n");
}
