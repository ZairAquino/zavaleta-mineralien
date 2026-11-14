/* Panel de administración de Zavaleta Mineralien.
   Lee y guarda todo en /api/content (Vercel Blob). Las fotos se suben a /api/upload. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const src = (p) => !p ? "" : /^(https?:|data:|blob:|\/)/.test(p) ? p : "/" + p;
  const flagOf = (cc) => /^[A-Z]{2}$/.test(cc || "") ? String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "";

  const LANGS = ["es", "de", "en", "fr", "it", "cs", "pl", "nl"];
  const LANG_NAMES = { es: "Español", de: "Deutsch", en: "English", fr: "Français", it: "Italiano", cs: "Čeština", pl: "Polski", nl: "Nederlands" };
  const CAT_LABEL = { specimen: "Piezas de colección", polished: "Pulidos y placas", carving: "Tallas y esferas", rough: "En bruto / por kilo" };
  const COUNTRIES = {
    DE: "Alemania", AT: "Austria", CZ: "Chequia", FR: "Francia", IT: "Italia", PL: "Polonia", NL: "Países Bajos",
    BE: "Bélgica", CH: "Suiza", LU: "Luxemburgo", HU: "Hungría", SK: "Eslovaquia", SI: "Eslovenia", DK: "Dinamarca",
    SE: "Suecia", ES: "España", PT: "Portugal", GB: "Reino Unido", US: "Estados Unidos", PE: "Perú"
  };
  const STATUS = { confirmed: "Confirmada", tbc: "Por confirmar" };
  const SLOTS = [
    { id: "hero", title: "Portada", desc: "La foto grande al abrir la web.", def: "img/stand-feria.webp" },
    { id: "events", title: "Ferias", desc: "Junto a «Así es nuestro stand», en la sección de ferias.", def: "img/stand-visitantes.webp" },
    { id: "wholesale", title: "Mayoristas", desc: "En el bloque de color para tiendas y distribuidores.", def: "img/stand-bandejas.webp" },
    { id: "about", title: "Nosotros", desc: "La foto de la sección «De los Andes a Baviera».", def: "img/victor-pirita.webp" }
  ];
  const CONFIG_FIELDS = [
    ["owner", "Nombre del responsable"],
    ["email", "Email", "email"],
    ["mobile", "Móvil (como se muestra)", "tel"],
    ["whatsapp", "WhatsApp: solo números con prefijo (ej. 4916097967431)", "tel"],
    ["phone", "Teléfono fijo", "tel"],
    ["address", "Dirección"],
    ["instagram", "Instagram: enlace completo (vacío = no se muestra)", "url"],
    ["instagramHandle", "Instagram: nombre a mostrar (ej. @zavaleta)"],
    ["peruvianMinerals", "Cifra «minerales peruanos» de la portada", "number"],
    ["formEndpoint", "Formspree (opcional): enlace para recibir el formulario por email", "url"]
  ];
  const GROUPS = {
    nav: "Menú", hero: "Portada", stats: "Cifras de la portada", collection: "Galería", gallery: "Galería", cat: "Galería",
    events: "Ferias", dist: "Mayoristas", wholesale: "Mayoristas", about: "Nosotros", contact: "Contacto", form: "Formulario de contacto", footer: "Pie de página"
  };

  let state = null, saved = "", tab = "gallery", lang = "es", openItem = null, textKeys = null;

  /* ---------------- Utilidades ---------------- */
  let toastTimer;
  function toast(msg, ms = 2600) {
    let el = $(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.append(el); }
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); if (ms) toastTimer = setTimeout(() => { el.hidden = true; }, ms);
  }

  async function api(url, opts = {}) {
    const r = await fetch(url, { cache: "no-store", credentials: "same-origin", ...opts });
    if (r.status === 401) { showLogin("Tu sesión ha caducado. Entra de nuevo: tus cambios siguen aquí."); throw new Error("401"); }
    let data = null; try { data = await r.json(); } catch { /* sin cuerpo */ }
    if (!r.ok) throw new Error((data && data.error) || `HTTP ${r.status}`);
    return data;
  }

  const show = (view) => {
    $("#bootMsg").hidden = view !== "boot";
    $("#loginView").hidden = view !== "login";
    $("#appView").hidden = view !== "app";
  };

  /* ---------------- Acceso ---------------- */
  function showLogin(msg = "", disabled = false) {
    show("login");
    $("#loginMsg").textContent = msg;
    $("#loginForm").querySelectorAll("input, button").forEach((el) => { el.disabled = disabled; });
    if (!disabled) setTimeout(() => $("#loginForm [name=user]").focus(), 50);
  }

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = e.target.user.value.trim(), pw = e.target.password.value;
    if (!user || !pw) { $("#loginMsg").textContent = "Escribe el usuario y la contraseña."; return; }
    const btn = e.target.querySelector("button"); btn.disabled = true; $("#loginMsg").textContent = "";
    try {
      const r = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user, password: pw }) });
      if (r.ok) { e.target.reset(); state ? showApp() : await startApp(); }
      else $("#loginMsg").textContent = r.status === 503 ? "Falta configurar la contraseña en Vercel (ADMIN_PASSWORD)." : "Usuario o contraseña incorrectos.";
    } catch { $("#loginMsg").textContent = "Sin conexión. Inténtalo de nuevo."; }
    btn.disabled = false;
  });

  $("#logoutBtn").addEventListener("click", async () => {
    if (isDirty() && !$("#logoutBtn").dataset.sure) {
      $("#logoutBtn").dataset.sure = "1"; $("#logoutBtn").textContent = "¿Salir sin guardar?";
      setTimeout(() => { delete $("#logoutBtn").dataset.sure; $("#logoutBtn").textContent = "Salir"; }, 4000);
      return;
    }
    saved = JSON.stringify(state); // no preguntar al salir
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    location.reload();
  });

  /* ---------------- Datos ---------------- */
  function defaults() {
    return {
      config: Object.fromEntries(CONFIG_FIELDS.map(([k]) => [k, CONFIG[k] ?? ""])),
      gallery: PRODUCTS.filter((p) => p.photo).sort((a, b) => a.featured - b.featured).map((p) => ({
        id: p.id, category: p.category, color: p.color, photo: p.photo, locality: p.locality,
        name: { ...p.name }, formats: { ...p.formats }, desc: { ...p.desc }
      })),
      events: EVENTS.map(({ flag, ...e }) => ({ ...e })),
      photos: {}, texts: {}
    };
  }
  function normalize(c) {
    const d = defaults();
    return {
      config: { ...d.config, ...(c.config || {}) },
      gallery: (c.gallery || []).map((g) => ({ name: {}, formats: {}, desc: {}, ...g })),
      events: (c.events || []).map(({ flag, ...e }) => e),
      photos: c.photos || {}, texts: c.texts || {}
    };
  }
  const byDate = (a, b) => String(a.start || "9999").localeCompare(String(b.start || "9999"));

  function clean() {
    state.events.sort(byDate);
    state.events.forEach((e) => { if (e.end && e.start && e.end < e.start) e.end = e.start; });
    for (const g of state.gallery) for (const f of ["name", "formats", "desc"]) {
      for (const l of Object.keys(g[f] || {})) if (!String(g[f][l]).trim()) delete g[f][l];
    }
    for (const l of Object.keys(state.texts)) if (!Object.keys(state.texts[l]).length) delete state.texts[l];
    for (const k of Object.keys(state.photos)) if (!state.photos[k]) delete state.photos[k];
  }

  const isDirty = () => state && JSON.stringify(state) !== saved;
  function markDirty() {
    const st = $("#saveStatus"), dirty = isDirty();
    $("#saveBtn").disabled = !dirty;
    st.className = "savebar__status" + (dirty ? " is-dirty" : "");
    st.textContent = dirty ? "Tienes cambios sin guardar" : "Todo guardado";
  }
  addEventListener("beforeunload", (e) => { if (isDirty()) { e.preventDefault(); e.returnValue = ""; } });

  async function startApp() {
    show("boot"); $("#bootMsg").textContent = "Cargando contenido…";
    try {
      const c = await api("/api/content?fresh=1");
      state = c && Array.isArray(c.gallery) ? normalize(c) : defaults();
    } catch (e) {
      if (e.message === "401") return;
      $("#bootMsg").textContent = "No se pudo cargar el contenido. Recarga la página en un momento."; return;
    }
    state.events.sort(byDate);
    saved = JSON.stringify(state);
    showApp();
  }
  function showApp() { show("app"); render(); markDirty(); }

  /* ---------------- Guardar ---------------- */
  $("#saveBtn").addEventListener("click", async () => {
    const btn = $("#saveBtn"), st = $("#saveStatus");
    btn.disabled = true; st.className = "savebar__status"; st.textContent = "Guardando…";
    clean();
    try {
      await api("/api/content", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(state) });
      saved = JSON.stringify(state);
      st.className = "savebar__status is-ok"; st.textContent = "Guardado ✓ La web se actualiza en unos segundos.";
      render();
    } catch (e) {
      if (e.message === "401") return;
      st.className = "savebar__status is-error"; st.textContent = "No se pudo guardar. Inténtalo de nuevo.";
      btn.disabled = false;
    }
  });

  /* ---------------- Fotos ---------------- */
  function pickFile() {
    return new Promise((resolve) => {
      const inp = $("#filePick"); inp.value = "";
      inp.onchange = () => resolve(inp.files[0] || null);
      inp.click();
    });
  }
  async function shrink(file) {
    let bmp;
    try { bmp = await createImageBitmap(file, { imageOrientation: "from-image" }); }
    catch { throw new Error("No se pudo leer la imagen. Usa una foto JPG, PNG o WebP."); }
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const toBlob = (type, q) => new Promise((r) => c.toBlob(r, type, q));
    let b = await toBlob("image/webp", 0.82);
    if (!b || b.type !== "image/webp") b = await toBlob("image/jpeg", 0.86);
    return b;
  }
  async function uploadPhoto(name) {
    const file = await pickFile();
    if (!file) return null;
    toast("Subiendo foto…", 0);
    try {
      const blob = await shrink(file);
      const r = await api(`/api/upload?name=${encodeURIComponent(name || "foto")}`, { method: "POST", headers: { "content-type": blob.type }, body: blob });
      toast("Foto subida ✓ Recuerda guardar los cambios.");
      return r.url;
    } catch (e) {
      if (e.message !== "401") toast(e.message.startsWith("No se pudo") ? e.message : "No se pudo subir la foto. Inténtalo de nuevo.", 4000);
      return null;
    }
  }

  /* ---------------- Campos ---------------- */
  const fallbackText = (obj) => {
    if (!obj) return "";
    const l = ["es", "de", "en", ...LANGS].find((x) => x !== lang && obj[x]);
    return l ? `Sin traducir. En ${l.toUpperCase()}: ${obj[l]}` : "";
  };
  function field(label, path, value, type = "text", ph = "") {
    return `<label class="field"><span>${esc(label)}</span>
      <input type="${type}" data-bind="${path}" value="${esc(value ?? "")}" placeholder="${esc(ph)}"${type === "number" ? ' inputmode="numeric" min="0"' : ""}></label>`;
  }
  function trField(label, path, obj, area = false) {
    const v = esc((obj && obj[lang]) || ""), ph = esc(fallbackText(obj));
    return `<label class="field"><span>${esc(label)} <i class="lang-tag">${lang.toUpperCase()}</i></span>
      ${area ? `<textarea data-bind="${path}" data-tr placeholder="${ph}">${v}</textarea>` : `<input type="text" data-bind="${path}" data-tr value="${v}" placeholder="${ph}">`}</label>`;
  }
  function select(label, path, value, options) {
    return `<label class="field"><span>${esc(label)}</span><select data-bind="${path}">
      ${Object.entries(options).map(([k, v]) => `<option value="${k}"${k === value ? " selected" : ""}>${esc(v)}</option>`).join("")}</select></label>`;
  }
  const askBtn = (act, i, label) => `<button type="button" class="btn btn--sm btn--ghost" data-ask="${act}" data-i="${i}">${label}</button>`;

  /* ---------------- Pestañas ---------------- */
  const view = {
    gallery() {
      const items = state.gallery;
      return `<div class="panel__head"><div><h2>Galería</h2>
          <p>Las fotos de «Nuestros minerales». El orden de esta lista es el orden en la web.</p></div>
          <button type="button" class="btn btn--primary" data-act="add-item">+ Añadir pieza</button></div>
        ${items.length ? `<div class="items">${items.map((p, i) => itemCard(p, i, items.length)).join("")}</div>`
          : `<p class="empty">Aún no hay piezas. Pulsa «Añadir pieza» y elige una foto.</p>`}`;
    },
    events() {
      const today = new Date().toISOString().slice(0, 10);
      return `<div class="panel__head"><div><h2>Ferias</h2>
          <p>Las próximas ferias salen en la web ordenadas por fecha; las pasadas pasan solas a «Ferias anteriores».</p></div>
          <button type="button" class="btn btn--primary" data-act="add-event">+ Añadir feria</button></div>
        ${state.events.length ? state.events.map((e, i) => eventCard(e, i, today)).join("") : `<p class="empty">No hay ferias. Pulsa «Añadir feria».</p>`}`;
    },
    photos() {
      return `<div class="panel__head"><div><h2>Fotos de la web</h2><p>Las fotos grandes de cada sección. Las de la galería se cambian en «Galería».</p></div></div>
        <div class="slots">${SLOTS.map((s) => {
          const custom = state.photos[s.id];
          return `<article class="card slot"><img src="${esc(src(custom || s.def))}" alt="" loading="lazy">
            <h3>${s.title}</h3><p>${s.desc}</p>
            <div class="slot__actions"><button type="button" class="btn btn--sm btn--primary" data-act="photo-slot" data-slot="${s.id}">Cambiar foto</button>
            ${custom ? `<button type="button" class="btn btn--sm btn--ghost" data-act="reset-slot" data-slot="${s.id}">Volver a la original</button>` : ""}</div></article>`;
        }).join("")}</div>`;
    },
    texts() {
      if (!textKeys) { loadTextKeys(); return `<p class="empty">Cargando textos…</p>`; }
      const groups = {};
      for (const k of textKeys) (groups[GROUPS[k.split(".")[0]] || "Otros"] ||= []).push(k);
      const over = state.texts[lang] || {};
      return `<div class="panel__head"><div><h2>Textos de la web</h2>
          <p>Cambia cualquier texto fijo de la web. Elige arriba el idioma que estás editando: cada idioma se cambia por separado.</p></div></div>
        ${Object.entries(groups).map(([g, keys], gi) => `<details class="card group"${gi === 0 ? " open" : ""}><summary><h3 style="display:inline">${esc(g)}</h3>
          <span class="muted small"> · ${keys.length} textos</span></summary><div class="group" style="margin-top:14px">
          ${keys.map((k) => {
            const def = defText(k), val = over[k] ?? def, long = def.length > 70;
            return `<label class="field text-field"><span>${esc(k)}${over[k] != null ? ' <i class="changed">● cambiado</i>' : ""}
              <button type="button" class="reset" data-act="reset-text" data-key="${esc(k)}"${over[k] == null ? " hidden" : ""}>Restaurar</button></span>
              ${long ? `<textarea data-text="${esc(k)}" rows="3">${esc(val)}</textarea>` : `<input type="text" data-text="${esc(k)}" value="${esc(val)}">`}</label>`;
          }).join("")}</div></details>`).join("")}`;
    },
    contact() {
      return `<div class="panel__head"><div><h2>Contacto</h2><p>Datos que aparecen en la sección de contacto y en los botones de WhatsApp y email.</p></div></div>
        <div class="card grid2">${CONFIG_FIELDS.map(([k, label, type]) => field(label, `config.${k}`, state.config[k], type || "text")).join("")}</div>`;
    }
  };

  function itemCard(p, i, n) {
    const open = openItem === p.id;
    const name = (p.name && (p.name[lang] || p.name.es || p.name.de || p.name.en)) || "(sin nombre)";
    const miss = !(p.name && p.name[lang]) ? ` · <span class="missing">falta ${lang.toUpperCase()}</span>` : "";
    return `<article class="card item" data-id="${esc(p.id)}">
      <div class="item__row">
        <img class="thumb" src="${esc(src(p.photo))}" alt="" loading="lazy">
        <div style="min-width:0"><p class="item__title" data-title="${i}">${esc(name)}</p>
          <p class="item__meta">${esc(CAT_LABEL[p.category] || "")}${p.locality ? " · " + esc(p.locality) : ""}${miss}</p></div>
        <div class="item__tools">
          <button type="button" class="btn icon-btn" data-act="up" data-i="${i}" aria-label="Subir"${i === 0 ? " disabled" : ""}>↑</button>
          <button type="button" class="btn icon-btn" data-act="down" data-i="${i}" aria-label="Bajar"${i === n - 1 ? " disabled" : ""}>↓</button>
          <button type="button" class="btn btn--sm${open ? " btn--primary" : ""}" data-act="toggle" data-i="${i}">${open ? "Cerrar" : "Editar"}</button>
          ${askBtn("del-item", i, "Eliminar")}
        </div>
      </div>
      ${open ? `<div class="item__edit">
        <div class="photo-edit"><img src="${esc(src(p.photo))}" alt="">
          <div class="photo-edit__actions"><button type="button" class="btn btn--sm btn--primary" data-act="photo-item" data-i="${i}">Cambiar foto</button>
          <p class="muted small" style="margin:0">Se ve completa, sin recortes. Se reduce sola para que cargue rápido.</p></div></div>
        <div class="grid2">
          ${trField("Nombre", `gallery.${i}.name`, p.name)}
          ${field("Origen", `gallery.${i}.locality`, p.locality, "text", "Perú")}
          ${select("Categoría", `gallery.${i}.category`, p.category, CAT_LABEL)}
          ${trField("Formatos", `gallery.${i}.formats`, p.formats)}
        </div>
        ${trField("Descripción", `gallery.${i}.desc`, p.desc, true)}
      </div>` : ""}
    </article>`;
  }

  function eventCard(e, i, today) {
    const past = (e.end || e.start) && (e.end || e.start) < today;
    return `<article class="card event-card">
      <div class="event-card__head"><h3 data-etitle="${i}">${flagOf(e.country)} ${esc(e.name || "Nueva feria")}</h3>
        <div class="confirm">${past ? '<span class="pill pill--past">Pasada</span>' : e.status === "confirmed" ? '<span class="pill pill--ok">Confirmada</span>' : '<span class="pill">Por confirmar</span>'}
        ${askBtn("del-event", i, "Eliminar")}</div></div>
      <div class="grid2">
        ${field("Nombre de la feria", `events.${i}.name`, e.name, "text", "Ej. Mineralientage München")}
        ${field("Ciudad", `events.${i}.city`, e.city)}
        ${select("País", `events.${i}.country`, e.country, COUNTRIES)}
        ${field("Lugar / recinto", `events.${i}.venue`, e.venue, "text", "Ej. Messe München")}
        ${field("Empieza", `events.${i}.start`, e.start, "date")}
        ${field("Termina", `events.${i}.end`, e.end, "date")}
        ${field("Stand", `events.${i}.booth`, e.booth, "text", "Ej. B6 · 214")}
        ${select("Estado", `events.${i}.status`, e.status, STATUS)}
        ${field("Web de la feria", `events.${i}.url`, e.url, "url", "https://…")}
      </div>
    </article>`;
  }

  const defText = (k) => (I18N[lang] && I18N[lang][k]) ?? I18N.en[k] ?? I18N.es[k] ?? "";
  async function loadTextKeys() {
    try {
      const html = await (await fetch("/", { cache: "no-store" })).text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const keys = [...doc.querySelectorAll("[data-i18n],[data-i18n-alt],[data-i18n-ph]")]
        .map((el) => el.dataset.i18n || el.dataset.i18nAlt || el.dataset.i18nPh);
      textKeys = [...new Set(keys)].filter((k) => I18N.es[k] != null || I18N.en[k] != null);
    } catch { textKeys = Object.keys(I18N.es); }
    if (tab === "texts") render();
  }

  /* ---------------- Pintar ---------------- */
  function render() {
    document.querySelectorAll("#tabs [data-tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === tab));
    $("#langBar").hidden = !["gallery", "texts"].includes(tab);
    $("#langList").innerHTML = LANGS.map((l) => `<button type="button" data-lang="${l}" aria-pressed="${l === lang}" title="${LANG_NAMES[l]}">${l.toUpperCase()}</button>`).join("");
    $("#panel").innerHTML = view[tab]();
  }

  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    tab = b.dataset.tab; render(); scrollTo({ top: 0 });
  });
  $("#langList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-lang]"); if (!b) return;
    lang = b.dataset.lang; render();
  });

  /* Escribir en un campo actualiza los datos al momento */
  $("#panel").addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.bind) {
      const parts = el.dataset.bind.split("."), last = parts.pop();
      let obj = state; for (const k of parts) obj = obj[k];
      if (el.hasAttribute("data-tr")) {
        obj[last] = obj[last] || {};
        if (el.value.trim()) obj[last][lang] = el.value; else delete obj[last][lang];
      } else obj[last] = el.type === "number" ? (el.value === "" ? "" : Number(el.value)) : el.value;
      if (/^gallery\.\d+\.name$/.test(el.dataset.bind)) $(`[data-title="${parts[1]}"]`).textContent = el.value || "(sin nombre)";
      if (/^events\.\d+\.(name|country)$/.test(el.dataset.bind)) {
        const ev = state.events[parts[1]]; $(`[data-etitle="${parts[1]}"]`).textContent = `${flagOf(ev.country)} ${ev.name || "Nueva feria"}`;
      }
    }
    if (el.dataset.text) {
      const k = el.dataset.text, def = defText(k);
      state.texts[lang] = state.texts[lang] || {};
      if (!el.value.trim() || el.value === def) delete state.texts[lang][k]; else state.texts[lang][k] = el.value;
      const reset = el.closest("label").querySelector(".reset"); reset.hidden = state.texts[lang][k] == null;
    }
    markDirty();
  });

  /* Botones */
  $("#panel").addEventListener("click", async (e) => {
    const ask = e.target.closest("[data-ask]");
    if (ask) {
      ask.outerHTML = `<span class="confirm">¿Seguro? <button type="button" class="btn btn--sm btn--danger" data-act="${ask.dataset.ask}" data-i="${ask.dataset.i}">Sí, eliminar</button>
        <button type="button" class="btn btn--sm" data-act="cancel">No</button></span>`;
      return;
    }
    const b = e.target.closest("[data-act]"); if (!b) return;
    const i = +b.dataset.i, g = state.gallery;
    switch (b.dataset.act) {
      case "cancel": break;
      case "up": [g[i - 1], g[i]] = [g[i], g[i - 1]]; break;
      case "down": [g[i + 1], g[i]] = [g[i], g[i + 1]]; break;
      case "toggle": openItem = openItem === g[i].id ? null : g[i].id; break;
      case "del-item": g.splice(i, 1); break;
      case "add-item": {
        const url = await uploadPhoto("pieza"); if (!url) return;
        const id = "G-" + Date.now().toString(36);
        g.unshift({ id, category: "specimen", color: "#1f56d6", photo: url, locality: "Perú", name: {}, formats: {}, desc: {} });
        openItem = id; render(); markDirty();
        setTimeout(() => $(`[data-id="${id}"] [data-tr]`)?.focus(), 50);
        return;
      }
      case "photo-item": {
        const url = await uploadPhoto(g[i].name?.es || g[i].name?.de || "pieza"); if (!url) return;
        g[i].photo = url; break;
      }
      case "add-event": {
        const d = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
        state.events.unshift({ name: "", city: "", country: "DE", venue: "", start: d, end: d, booth: "", status: "tbc", url: "" });
        render(); markDirty(); setTimeout(() => $("[data-bind='events.0.name']")?.focus(), 50);
        return;
      }
      case "del-event": state.events.splice(i, 1); break;
      case "photo-slot": {
        const url = await uploadPhoto(b.dataset.slot); if (!url) return;
        state.photos[b.dataset.slot] = url; break;
      }
      case "reset-slot": delete state.photos[b.dataset.slot]; break;
      case "reset-text": if (state.texts[lang]) delete state.texts[lang][b.dataset.key]; break;
      default: return;
    }
    render(); markDirty();
  });

  /* ---------------- Inicio ---------------- */
  (async () => {
    show("boot");
    let s;
    try {
      const r = await fetch("/api/session", { cache: "no-store" });
      s = await r.json();
    } catch {
      $("#bootMsg").innerHTML = `El panel solo funciona en la web publicada: <a href="https://zavaletamineralien.de/admin/">zavaletamineralien.de/admin</a>`;
      return;
    }
    if (!s.configured) return showLogin("Falta configurar la contraseña del panel en Vercel (variable ADMIN_PASSWORD, mínimo 8 caracteres).", true);
    if (!s.storage) return showLogin("Falta conectar el almacenamiento (Vercel Blob) al proyecto.", true);
    s.admin ? startApp() : showLogin();
  })();
})();
