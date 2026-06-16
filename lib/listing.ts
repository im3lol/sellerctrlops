/** Product fields needed to build the AI listing prompt. */
export type ListingProduct = {
  name: string;
  description: string | null;
  features: string | null;
  sizes: string | null;
  colors: string | null;
  brand: string | null;
  price: string | null;
  productUrl: string | null;
  imageUrl: string | null;
};

/**
 * Build a self-contained Markdown prompt+data document, ready to send directly
 * to any AI platform to generate a full product listing IN ENGLISH. The rules
 * forbid the AI from inventing anything not present in the provided data.
 */
export function buildListingMarkdown(p: ListingProduct): string {
  const row = (label: string, v: string | null) => `- **${label}:** ${v && v.trim() ? v.trim() : "N/A"}`;
  const imageBlock = p.imageUrl
    ? `\n![product image](${p.imageUrl})\n`
    : "";

  return `# Task: Write a complete, professional product listing (in English)

You are an expert e-commerce copywriter. Write a complete product listing **in English** for the product described under "Product Data" below.

## ⚠️ STRICT MANDATORY RULES — follow them exactly:
1. Use ONLY the information provided in the "Product Data" section below.
2. Do NOT add or invent any feature, specification, material, size, number, or claim that is not explicitly stated.
3. If a piece of information is missing ("N/A"), ignore it — do not assume or guess.
4. Do not exaggerate or promise anything that is not present in the data.
5. Any violation of these rules is a serious error — follow them literally.

## Output (in English):
- **Title:** catchy and clear (max 200 characters).
- **Key Features:** 3–5 bullet points, derived only from the data.
- **Marketing Description:** one or two paragraphs based only on the available data.
- **Suggested Keywords:** derived only from the product name and stated specifications.

---

## Product Data
${row("Product Name", p.name)}
${row("Main Image", p.imageUrl)}
${row("Description", p.description)}
${row("Features", p.features)}
${row("Sizes", p.sizes)}
${row("Colors", p.colors)}
${row("Brand", p.brand)}
${row("Price", p.price)}
${row("Product URL", p.productUrl)}
${imageBlock}`;
}
