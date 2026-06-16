/* Side panel controller for the SellerCtrl scrape extension. */

const FIELDS = [
  { key: "name", labelAr: "اسم المنتج" },
  { key: "brand", labelAr: "البراند" },
  { key: "price", labelAr: "السعر" },
  { key: "imageUrl", labelAr: "صورة العرض" },
  { key: "description", labelAr: "الوصف" },
  { key: "features", labelAr: "المميزات" },
  { key: "sizes", labelAr: "المقاسات" },
  { key: "colors", labelAr: "الألوان" },
];
const ATTRS = ["text", "src", "href", "content"];

const state = {
  config: null, // { apiBase, token, workspaceId, workspaceName }
  drafts: [], // [{id, name, url}]
  pickTabId: null,
  recipe: {}, // { key: {selector, attr, value} }
};

const $ = (id) => document.getElementById(id);

function toast(msg, kind = "ok") {
  const t = $("toast");
  t.textContent = msg;
  t.className = `toast ${kind}`;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 4000);
}

async function loadConfig() {
  const c = await chrome.storage.local.get(["apiBase", "token", "workspaceId", "workspaceName"]);
  if (c.apiBase && c.token && c.workspaceId) {
    state.config = c;
    return true;
  }
  return false;
}

function api(path, opts = {}) {
  const { apiBase, token } = state.config;
  return fetch(`${apiBase.replace(/\/$/, "")}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
}

function renderFields() {
  const wrap = $("fields");
  wrap.innerHTML = "";
  for (const f of FIELDS) {
    const captured = state.recipe[f.key];
    const div = document.createElement("div");
    div.className = "field" + (captured ? " captured" : "");

    const top = document.createElement("div");
    top.className = "row between";
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = f.labelAr + (captured ? " ✓" : "");
    const btn = document.createElement("button");
    btn.className = "btn-ghost btn-sm";
    btn.textContent = "حدّد";
    btn.onclick = () => armPick(f);
    top.appendChild(label);
    top.appendChild(btn);
    div.appendChild(top);

    if (captured) {
      const val = document.createElement("div");
      val.className = "value";
      val.textContent = captured.value || "(فارغ)";
      div.appendChild(val);

      const ctl = document.createElement("div");
      ctl.className = "row";
      ctl.style.marginTop = "6px";
      const sel = document.createElement("select");
      for (const a of ATTRS) {
        const o = document.createElement("option");
        o.value = a;
        o.textContent = a;
        if (a === captured.attr) o.selected = true;
        sel.appendChild(o);
      }
      sel.onchange = () => {
        state.recipe[f.key].attr = sel.value;
      };
      const attrLabel = document.createElement("span");
      attrLabel.className = "muted";
      attrLabel.textContent = "نوع القيمة:";
      ctl.appendChild(attrLabel);
      ctl.appendChild(sel);
      div.appendChild(ctl);
    }
    wrap.appendChild(div);
  }
  // Reveal save/run once at least one field captured.
  if (Object.keys(state.recipe).length > 0) $("step4").classList.remove("hidden");
}

async function armPick(field) {
  if (!state.pickTabId) {
    toast("افتح صفحة المنتج أولاً.", "err");
    return;
  }
  try {
    await chrome.tabs.sendMessage(state.pickTabId, {
      type: "armPick",
      field: field.key,
      labelAr: field.labelAr,
    });
    toast(`اضغط على «${field.labelAr}» في الصفحة.`);
  } catch {
    // Content script not present (navigation). Re-inject then retry.
    await chrome.runtime.sendMessage({ type: "injectPicker", tabId: state.pickTabId });
    try {
      await chrome.tabs.sendMessage(state.pickTabId, {
        type: "armPick",
        field: field.key,
        labelAr: field.labelAr,
      });
    } catch {
      toast("تعذّر الاتصال بالصفحة. أعد فتح المنتج.", "err");
    }
  }
}

// Receive picked elements from the content script.
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "picked") {
    state.recipe[msg.field] = { selector: msg.selector, attr: msg.attr, value: msg.value };
    renderFields();
  }
});

function recipeFields() {
  const out = {};
  for (const [k, v] of Object.entries(state.recipe)) {
    out[k] = { selector: v.selector, attr: v.attr };
  }
  return out;
}

async function saveRecipe() {
  const fields = recipeFields();
  if (Object.keys(fields).length === 0) return null;
  let originHost = "";
  try {
    originHost = state.drafts[0] ? new URL(state.drafts[0].url).host : "";
  } catch {}
  const res = await api("/api/scrape/recipes", {
    method: "POST",
    body: JSON.stringify({
      workspaceId: state.config.workspaceId,
      name: `وصفة ${originHost || "سحب"}`,
      originHost,
      fields,
    }),
  });
  if (!res.ok) {
    toast("تعذّر حفظ الوصفة: " + (await res.text()), "err");
    return null;
  }
  const data = await res.json();
  return data.id;
}

async function pollJob(jobId) {
  $("jobBox").classList.remove("hidden");
  const tick = async () => {
    const res = await api(`/api/scrape/jobs/${jobId}`);
    if (!res.ok) return;
    const j = await res.json();
    const pct = j.total ? Math.round((j.done / j.total) * 100) : 0;
    $("jobBar").style.width = pct + "%";
    $("jobStat").textContent = `${j.done} / ${j.total}`;
    $("jobMsg").textContent =
      j.status === "done"
        ? `اكتمل — حُدّثت بيانات ${j.updatedCount} منتج.`
        : j.status === "error"
        ? `خطأ: ${j.lastError || ""}`
        : `قيد التشغيل… (${j.updatedCount} محدّث)`;
    if (j.status === "done" || j.status === "error") return;
    setTimeout(tick, 2500);
  };
  tick();
}

async function init() {
  if (!(await loadConfig())) {
    $("needsConfig").classList.remove("hidden");
    return;
  }
  $("step1").classList.remove("hidden");
  $("step2").classList.remove("hidden");
  $("step3").classList.remove("hidden");
  $("wsLabel").textContent = state.config.workspaceName || state.config.workspaceId;
  renderFields();

  $("loadDrafts").onclick = async () => {
    try {
      const res = await api(`/api/scrape/draft-products?workspaceId=${state.config.workspaceId}`);
      if (!res.ok) {
        toast("تعذّر التحميل: " + (await res.text()), "err");
        return;
      }
      const data = await res.json();
      state.drafts = data.products || [];
      $("draftsInfo").textContent = state.drafts.length
        ? `${state.drafts.length} منتج مسودة بلينك جاهز للسحب.`
        : "لا توجد منتجات مسودة بلينك.";
    } catch (e) {
      toast("خطأ في الشبكة.", "err");
    }
  };

  $("openPick").onclick = async () => {
    if (!state.drafts.length) {
      toast("حمّل المنتجات المسودة أولاً.", "err");
      return;
    }
    const resp = await chrome.runtime.sendMessage({ type: "openPickTab", url: state.drafts[0].url });
    if (resp?.ok) {
      state.pickTabId = resp.tabId;
      toast("فُتحت صفحة المنتج. اضغط «حدّد» بجوار حقل.");
    } else {
      toast("تعذّر فتح الصفحة.", "err");
    }
  };

  $("saveRecipe").onclick = async () => {
    const id = await saveRecipe();
    if (id) toast("حُفظت الوصفة ✓");
  };

  $("saveRun").onclick = async () => {
    const recipeId = await saveRecipe();
    if (!recipeId) return;
    const res = await api("/api/scrape/jobs", {
      method: "POST",
      body: JSON.stringify({ workspaceId: state.config.workspaceId, recipeId }),
    });
    if (!res.ok) {
      toast("تعذّر إنشاء المهمة: " + (await res.text()), "err");
      return;
    }
    const data = await res.json();
    toast(`بدأ السحب على ${data.total} منتج.`);
    pollJob(data.jobId);
  };
}

$("openOptions").onclick = () => chrome.runtime.openOptionsPage();
init();
