const $ = (id) => document.getElementById(id);

function toast(msg, kind = "ok") {
  const t = $("toast");
  t.textContent = msg;
  t.className = `toast ${kind}`;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 4000);
}

function readForm() {
  return {
    apiBase: $("apiBase").value.trim().replace(/\/$/, ""),
    token: $("token").value.trim(),
    workspaceId: $("workspaceId").value.trim(),
    workspaceName: $("workspaceName").value.trim(),
  };
}

async function restore() {
  const c = await chrome.storage.local.get(["apiBase", "token", "workspaceId", "workspaceName"]);
  if (c.apiBase) $("apiBase").value = c.apiBase;
  if (c.token) $("token").value = c.token;
  if (c.workspaceId) $("workspaceId").value = c.workspaceId;
  if (c.workspaceName) $("workspaceName").value = c.workspaceName;
}

$("save").onclick = async () => {
  const cfg = readForm();
  if (!cfg.apiBase || !cfg.token || !cfg.workspaceId) {
    toast("املأ رابط المنصة والرمز ومعرّف مساحة العمل.", "err");
    return;
  }
  await chrome.storage.local.set(cfg);
  toast("حُفظت الإعدادات ✓");
};

$("test").onclick = async () => {
  const cfg = readForm();
  if (!cfg.apiBase || !cfg.token || !cfg.workspaceId) {
    toast("املأ الحقول أولاً.", "err");
    return;
  }
  try {
    const res = await fetch(`${cfg.apiBase}/api/scrape/draft-products?workspaceId=${cfg.workspaceId}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
    });
    if (res.ok) {
      const data = await res.json();
      toast(`الاتصال ناجح ✓ — ${data.products?.length ?? 0} منتج مسودة بلينك.`);
    } else if (res.status === 401) {
      toast("الرمز غير صحيح (401).", "err");
    } else {
      toast(`فشل الاختبار (${res.status}).`, "err");
    }
  } catch {
    toast("تعذّر الوصول للمنصة. تحقق من الرابط.", "err");
  }
};

restore();
