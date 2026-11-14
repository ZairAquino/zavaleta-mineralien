/* Carga lo que el administrador guardó en el panel (/admin) y lo aplica sobre
   los datos de js/data.js. Si no hay nada guardado, o la web se abre sin servidor
   (GitHub Pages, archivo local), se usan los datos de data.js tal cual. */
const flagOf = (cc) => /^[A-Z]{2}$/.test(cc || "") ? String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "";

function applySiteContent(c) {
  if (!c || typeof c !== "object") return;
  if (c.config) Object.assign(CONFIG, c.config);
  if (Array.isArray(c.gallery)) {
    PRODUCTS.length = 0;
    c.gallery.forEach((g, i) => PRODUCTS.push({
      id: g.id || `G-${i}`, featured: i, category: g.category || "specimen", color: g.color || "#1f56d6",
      photo: g.photo, locality: g.locality || "", name: g.name || {}, formats: g.formats || {}, desc: g.desc || {}
    }));
  }
  if (Array.isArray(c.events)) {
    EVENTS.length = 0;
    c.events.filter((e) => e && e.start).forEach((e) => EVENTS.push({ ...e, flag: flagOf(e.country) }));
  }
  if (c.texts) for (const [lang, map] of Object.entries(c.texts)) {
    I18N[lang] = I18N[lang] || {};
    for (const [k, v] of Object.entries(map || {})) if (typeof v === "string" && v.trim()) I18N[lang][k] = v;
  }
  if (c.photos) for (const [slot, url] of Object.entries(c.photos)) {
    if (url) document.querySelectorAll(`[data-slot="${slot}"]`).forEach((img) => { img.src = url; });
  }
}

window.SITE_CONTENT = (async () => {
  if (!/^https?:$/.test(location.protocol)) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const r = await fetch("/api/content", { signal: ctrl.signal, headers: { accept: "application/json" } });
    if (!r.ok || !(r.headers.get("content-type") || "").includes("json")) return null;
    const c = await r.json();
    applySiteContent(c);
    return c;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
})();
