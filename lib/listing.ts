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
  galleryUrl: string | null;
};

/**
 * Build a self-contained Markdown prompt+data document. The employee pastes it
 * into any AI platform to generate a full product listing. The rules forbid the
 * AI from inventing anything not present in the provided data.
 */
export function buildListingMarkdown(p: ListingProduct): string {
  const row = (label: string, v: string | null) => `- **${label}:** ${v && v.trim() ? v.trim() : "— (غير متوفر)"}`;

  return `# مهمة: إنشاء وصف منتج (Product Listing) كامل واحترافي

أنت كاتب محتوى محترف متخصص في أوصاف منتجات التجارة الإلكترونية. اكتب وصفاً (Listing) كاملاً للمنتج الموضّح في «بيانات المنتج» أدناه، باللغة العربية الفصحى المبسّطة وبأسلوب تسويقي راقٍ.

## ⚠️ قواعد إلزامية صارمة — يجب الالتزام بها بدقة تامة:
1. استخدم **فقط** المعلومات الموجودة في قسم «بيانات المنتج» أدناه.
2. **يُمنع منعاً باتاً** إضافة أو اختراع أي ميزة أو مواصفة أو مادة أو مقاس أو رقم أو ضمان غير مذكور صراحةً.
3. إذا كانت معلومة غير متوفرة («غير متوفر») فتجاهلها تماماً ولا تفترضها ولا تخمّنها.
4. لا تبالغ ولا تَعِد بأي شيء غير وارد في البيانات.
5. أي مخالفة لهذه القواعد تُعدّ خطأً جسيماً — التزم بها حرفياً.

## المطلوب إخراجه:
- **عنوان المنتج:** جذّاب وواضح (لا يتجاوز 200 حرف).
- **أهم المميزات:** من 3 إلى 5 نقاط (bullet points) مستخرجة من البيانات فقط.
- **الوصف التسويقي:** فقرة إلى فقرتين تعتمد على البيانات المتوفرة فقط.
- **كلمات مفتاحية مقترحة:** مستخرجة من اسم المنتج ومواصفاته الواردة فقط.

---

## بيانات المنتج
${row("اسم المنتج", p.name)}
${row("الوصف المتوفر", p.description)}
${row("المميزات", p.features)}
${row("المقاسات", p.sizes)}
${row("الألوان", p.colors)}
${row("البراند", p.brand)}
${row("السعر", p.price ? `${p.price} ر.س` : null)}
${row("رابط المنتج على الموقع", p.productUrl)}
${row("رابط صور المنتج", p.galleryUrl)}

---
> تعليمات للموظف: انسخ هذا النص بالكامل وألصقه في أي منصة ذكاء اصطناعي (ChatGPT / Claude / Gemini) للحصول على الـ listing الكامل. لا تعدّل البيانات.
`;
}
