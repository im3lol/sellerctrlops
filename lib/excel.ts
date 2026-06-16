import * as XLSX from "xlsx";

/**
 * Excel import for products. The client fills a template (locked columns),
 * the team uploads it. Column headers are Arabic and matched by name.
 */
export const TEMPLATE_COLUMNS: { header: string; field: ParsedField }[] = [
  { header: "لينك صورة العرض", field: "imageUrl" },
  { header: "اسم المنتج", field: "name" },
  { header: "وصف المنتج", field: "description" },
  { header: "مميزات المنتج", field: "features" },
  { header: "مقاسات المنتج", field: "sizes" },
  { header: "لينك المنتج على الموقع", field: "productUrl" },
  { header: "السعر", field: "price" },
  { header: "صور المنتج (لينك درايف)", field: "galleryUrl" },
];

export type ParsedField =
  | "imageUrl"
  | "name"
  | "description"
  | "sizes"
  | "features"
  | "productUrl"
  | "galleryUrl"
  | "price";

export type ParsedProduct = Partial<Record<ParsedField, string>>;

/** Build the downloadable .xlsx template (headers + one example row). */
export function buildTemplateBuffer(): Buffer {
  const headers = TEMPLATE_COLUMNS.map((c) => c.header);
  const example = [
    "https://example.com/product.jpg",
    "سماعة بلوتوث لاسلكية",
    "سماعة بلوتوث عالية الجودة مع إلغاء الضوضاء",
    "بطارية 30 ساعة، مقاومة للماء، صوت نقي",
    "مقاس واحد",
    "https://www.amazon.sa/dp/B0XXXX",
    "199.00",
    "https://drive.google.com/folder/...",
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);
  ws["!cols"] = headers.map(() => ({ wch: 24 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "المنتجات");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

/** Parse an uploaded .xlsx into product rows. Matches columns by Arabic header. */
export function parseProductsBuffer(buffer: Buffer): ParsedProduct[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const headerToField = new Map(TEMPLATE_COLUMNS.map((c) => [c.header.trim(), c.field]));

  const out: ParsedProduct[] = [];
  for (const row of rows) {
    const product: ParsedProduct = {};
    for (const [key, value] of Object.entries(row)) {
      const field = headerToField.get(String(key).trim());
      if (field) {
        const v = String(value ?? "").trim();
        if (v) product[field] = v;
      }
    }
    // Skip empty rows / rows without a name.
    if (product.name) out.push(product);
  }
  return out;
}
