/* Lógica de la web — normalmente no necesitas editar este archivo. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } }
  };

  /* ---------------- Idioma ---------------- */
  const LANGS = ["de", "en", "es", "fr", "it", "cs", "pl", "nl"];
  const detect = () => {
    const saved = store.get("zm-lang");
    if (LANGS.includes(saved)) return saved;
    const nav = (navigator.language || "en").slice(0, 2);
    return LANGS.includes(nav) ? nav : "en";
  };
  let lang = detect();
  const t = (k, vars) => {
    let s = (I18N[lang] && I18N[lang][k]) ?? I18N.en[k] ?? k;
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, b);
    return s;
  };
  const locale = () => ({ de: "de-DE", en: "en-GB", es: "es-ES", fr: "fr-FR", it: "it-IT", cs: "cs-CZ", pl: "pl-PL", nl: "nl-NL" }[lang]);
  const L = (obj) => (obj && (obj[lang] ?? obj.en ?? obj.es)) || "";
  const money = (n) => new Intl.NumberFormat(locale(), { style: "currency", currency: CONFIG.currency, maximumFractionDigits: 0 }).format(n);

  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$("[data-i18n-alt]").forEach((el) => { el.alt = t(el.dataset.i18nAlt); });
    $("#langSelect").value = lang; $("#langCode").textContent = lang.toUpperCase();
    renderAll();
  }
  $("#langSelect").addEventListener("change", (e) => {
    lang = e.target.value; store.set("zm-lang", lang); applyLang();
  });

  /* ---------------- Ilustraciones de cristales (SVG) ---------------- */
  const hexToRgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const mix = (hex, target, amt) => {
    const a = hexToRgb(hex), b = target === "w" ? [255, 255, 255] : [12, 10, 9];
    return "rgb(" + a.map((v, i) => Math.round(v + (b[i] - v) * amt)).join(",") + ")";
  };
  const pts = (arr) => arr.map((p) => p.join(",")).join(" ");
  const STROKE = 'stroke="#2a1530" stroke-width="1.3" stroke-linejoin="round"';

  function cube(cx, cy, s, c, skew = 0) {
    const k = 0.87 * s;
    const top = [[cx, cy - s], [cx + k, cy - s / 2], [cx, cy], [cx - k, cy - s / 2]];
    const left = [[cx - k, cy - s / 2], [cx, cy], [cx, cy + s], [cx - k, cy + s / 2]];
    const right = [[cx, cy], [cx + k, cy - s / 2], [cx + k, cy + s / 2], [cx, cy + s]];
    const tr = skew ? ` transform="skewX(${skew}) translate(${-skew * cy / 57},0)"` : "";
    return `<g${tr}><polygon points="${pts(top)}" fill="${mix(c, "w", .35)}" ${STROKE}/>` +
      `<polygon points="${pts(left)}" fill="${mix(c, "b", .05)}" ${STROKE}/>` +
      `<polygon points="${pts(right)}" fill="${mix(c, "b", .38)}" ${STROKE}/></g>`;
  }

  function prism(x, y, w, h, rot, c, op = 1) {
    const a = 0.35 * w, d = w * 0.25, tip = -h - w * 1.5;
    const f = (arr, fill) => `<polygon points="${pts(arr)}" fill="${fill}" ${STROKE}/>`;
    return `<g transform="translate(${x},${y}) rotate(${rot})" opacity="${op}">` +
      f([[-w, 0], [-a, d], [-a, -h + d], [-w, -h]], mix(c, "b", .18)) +
      f([[-a, d], [a, d], [a, -h + d], [-a, -h + d]], mix(c, "w", .12)) +
      f([[a, d], [w, 0], [w, -h], [a, -h + d]], mix(c, "b", .42)) +
      f([[-w, -h], [-a, -h + d], [0, tip]], mix(c, "w", .3)) +
      f([[-a, -h + d], [a, -h + d], [0, tip]], mix(c, "w", .5)) +
      f([[a, -h + d], [w, -h], [0, tip]], mix(c, "b", .2)) +
      `</g>`;
  }

  const matrix = (c = "#4a403a") =>
    `<path d="M22 168 C30 140 60 132 84 138 C104 128 132 130 150 140 C170 138 184 152 180 170 C150 182 60 184 22 168Z" fill="${mix(c, "b", .25)}" ${STROKE}/>` +
    `<path d="M22 168 C60 160 120 158 180 170 C150 182 60 184 22 168Z" fill="${mix(c, "b", .5)}"/>`;

  function crystalArt(p, uid) {
    const c = p.color;
    let body = "";
    switch (p.shape) {
      case "cube":
        body = matrix() + cube(72, 120, 30, c) + cube(124, 112, 36, c) + cube(98, 82, 26, c);
        break;
      case "rhombo":
        body = matrix("#6b6461") + cube(70, 124, 26, c, -12) + cube(118, 116, 34, c, -12) + cube(96, 86, 22, c, -12);
        break;
      case "prism":
        body = prism(100, 168, 22, 70, 0, c) + prism(70, 170, 13, 38, -24, c, .92) + prism(132, 170, 12, 34, 22, c, .92);
        break;
      case "cluster":
        body = matrix() + prism(64, 160, 13, 40, -30, c) + prism(140, 160, 12, 40, 28, c) +
          prism(84, 156, 15, 58, -10, c) + prism(120, 154, 14, 50, 12, c) + prism(102, 156, 18, 72, 0, c);
        break;
      default: // nodule
        body = `<ellipse cx="100" cy="112" rx="70" ry="52" fill="url(#g${uid})" stroke="#2a1530" stroke-width="2"/>` +
          `<path d="M42 104 C70 84 120 82 160 100" fill="none" stroke="${mix(c, "w", .45)}" stroke-width="3" opacity=".6"/>` +
          `<path d="M38 122 C78 104 128 108 164 124" fill="none" stroke="${mix(c, "b", .3)}" stroke-width="5" opacity=".45"/>` +
          `<ellipse cx="78" cy="88" rx="22" ry="9" fill="#fff" opacity=".22" transform="rotate(-14 78 88)"/>`;
    }
    return `<svg viewBox="0 0 200 200" role="img" aria-label="${esc(L(p.name))}">` +
      `<defs><radialGradient id="g${uid}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="${mix(c, "w", .3)}"/><stop offset="1" stop-color="${mix(c, "b", .35)}"/></radialGradient></defs>` +
      body + `</svg>`;
  }

  /* ---------------- Catálogo ---------------- */
  // Solo se muestran los productos que tienen foto (añade `photo` en data.js para que aparezca uno nuevo)
  const CATALOG = PRODUCTS.filter((p) => p.photo);
  const CATS = CATEGORIES.filter((c) => CATALOG.some((p) => p.category === c));
  const state = { cat: "all", q: "", sort: "featured" };
  let cart = store.get("zm-cart", []).filter((id) => CATALOG.some((p) => p.id === id));

  function renderChips() {
    $("#categoryChips").innerHTML = ["all", ...CATS].map((c) =>
      `<button type="button" class="chip" role="tab" aria-selected="${state.cat === c}" data-cat="${c}">${esc(t("cat." + c))}</button>`).join("");
  }
  $("#categoryChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    state.cat = b.dataset.cat; renderChips(); renderProducts();
  });
  $("#search").addEventListener("input", (e) => { state.q = e.target.value.trim().toLowerCase(); renderProducts(); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderProducts(); });

  const media = (p, uid) => p.photo
    ? `<img src="${esc(p.photo)}" alt="${esc(L(p.name))}" loading="lazy" decoding="async">`
    : crystalArt(p, uid);

  const priceLabel = (p) =>
    p.status === "sold" ? "—" :
    p.price ? money(p.price) + (p.unit === "kg" ? " / kg" : "") : t("card.onRequest");
  const priceClass = (p) => "price" + (p.price || p.status === "sold" ? "" : " price--ask");

  function statusBadge(p) {
    if (p.status === "sold") return `<span class="badge badge--sold">${t("card.sold")}</span>`;
    if (p.status === "reserved") return `<span class="badge badge--reserved">${t("card.reserved")}</span>`;
    return "";
  }

  function actionBtn(p) {
    if (p.status === "sold")
      return `<button type="button" class="btn btn--ghost btn--sm" data-similar="${p.id}">${t("card.askSimilar")}</button>`;
    const inCart = cart.includes(p.id);
    return `<button type="button" class="btn btn--sm ${inCart ? "btn--added" : "btn--primary"}" data-add="${p.id}" ${p.status === "reserved" ? "disabled" : ""}>${inCart ? t("card.added") : t("card.add")}</button>`;
  }

  function renderProducts() {
    let list = CATALOG.filter((p) =>
      (state.cat === "all" || p.category === state.cat) &&
      (!state.q || [...Object.values(p.name), p.locality, p.id, ...Object.values(p.formats)].join(" ").toLowerCase().includes(state.q)));
    const order = { available: 0, reserved: 1, sold: 2 };
    list.sort((a, b) =>
      state.sort === "priceAsc" ? (a.price ?? 1e9) - (b.price ?? 1e9) :
      state.sort === "priceDesc" ? (b.price ?? -1) - (a.price ?? -1) :
      (order[a.status] - order[b.status]) || (a.featured - b.featured));

    $("#products").innerHTML = list.map((p) => `
      <article class="card ${p.status === "sold" ? "card--sold" : ""}" style="--glow:${p.color}">
        <button type="button" class="card__media${p.photo ? " has-photo" : ""}" data-open="${p.id}" aria-label="${esc(L(p.name))}">
          ${media(p, p.id)}${statusBadge(p)}
        </button>
        <div class="card__body">
          <p class="card__loc">${esc(t("cat." + p.category))} · ${esc(p.locality)}</p>
          <h3 class="card__title"><button type="button" data-open="${p.id}">${esc(L(p.name))}</button></h3>
          <p class="card__meta">${esc(L(p.formats))}</p>
          <div class="card__foot">
            <span class="${priceClass(p)}">${priceLabel(p)}</span>
            ${actionBtn(p)}
          </div>
        </div>
      </article>`).join("");
    $("#productsEmpty").hidden = list.length > 0;
  }

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) { toggleCart(add.dataset.add); return; }
    const open = e.target.closest("[data-open]");
    if (open) { openModal(open.dataset.open); return; }
    const sim = e.target.closest("[data-similar]");
    if (sim) {
      const p = CATALOG.find((x) => x.id === sim.dataset.similar);
      closeModal();
      goContact("buy", `${t("card.askSimilar")}: ${L(p.name)} (${p.locality}, ${t("card.ref")} ${p.id})`);
    }
  });

  /* ---------------- Modal de producto ---------------- */
  const modal = $("#productModal");
  function openModal(id) {
    const p = CATALOG.find((x) => x.id === id); if (!p) return;
    $("#modalContent").innerHTML = `
      <div class="modal__media${p.photo ? " has-photo" : ""}" style="--glow:${p.color}">${media(p, "m" + p.id)}${statusBadge(p)}</div>
      <div class="modal__info">
        <p class="eyebrow">${esc(t("cat." + p.category))}</p>
        <h2>${esc(L(p.name))}</h2>
        <p>${esc(L(p.desc))}</p>
        <dl class="specs">
          <div><dt>${t("card.locality")}</dt><dd>${esc(p.locality)}</dd></div>
          <div><dt>${t("card.sale")}</dt><dd>${t("sale." + p.sale)}</dd></div>
          <div class="specs__wide"><dt>${t("card.formats")}</dt><dd>${esc(L(p.formats))}</dd></div>
        </dl>
        <div class="modal__foot">
          <span class="${priceClass(p)} price--lg">${priceLabel(p)}</span>
          ${actionBtn(p)}
        </div>
      </div>`;
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
  }
  function closeModal() { if (modal.open) modal.close ? modal.close() : modal.removeAttribute("open"); }
  $("#modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  /* ---------------- Lista de consulta (carrito) ---------------- */
  function toggleCart(id) {
    cart = cart.includes(id) ? cart.filter((x) => x !== id) : [...cart, id];
    store.set("zm-cart", cart);
    renderProducts(); renderCart();
    if (modal.open) openModal(id);
    const btn = $("#cartOpen"); btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
  }

  function cartMessage(items) {
    const lines = items.map((p) => `• ${L(p.name)} (${t("card.ref")} ${p.id})${p.price ? " — " + priceLabel(p) : ""}`);
    const total = cartTotal(items);
    return [t("cart.msgIntro"), "", ...lines, "", ...(total ? [`${t("cart.total")}: ${total}`, ""] : []), t("cart.msgOutro")].join("\n");
  }
  function cartTotal(items) {
    if (!items.length || items.some((p) => !p.price || p.unit)) return "";
    return money(items.reduce((s, p) => s + p.price, 0));
  }

  function renderCart() {
    const items = cart.map((id) => CATALOG.find((p) => p.id === id)).filter(Boolean);
    $("#cartCount").textContent = items.length;
    $("#cartCount").hidden = items.length === 0;
    $("#cartFoot").hidden = items.length === 0;
    $("#cartItems").innerHTML = items.length ? items.map((p) => `
      <div class="line">
        <div class="line__media${p.photo ? " has-photo" : ""}" style="--glow:${p.color}">${media(p, "c" + p.id)}</div>
        <div class="line__info"><strong>${esc(L(p.name))}</strong><span>${esc(L(p.formats))}</span><span class="${priceClass(p)}">${priceLabel(p)}</span></div>
        <button type="button" class="link-btn" data-add="${p.id}">${t("cart.remove")}</button>
      </div>`).join("") : `<p class="drawer__empty">${t("cart.empty")}</p>`;
    $("#cartTotal").textContent = cartTotal(items) || t("card.onRequest");
    const msg = cartMessage(items);
    $("#cartEmail").href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(t("cart.msgSubject") + " — " + CONFIG.brand)}&body=${encodeURIComponent(msg)}`;
    $("#cartWhatsapp").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  const drawer = $("#drawer"), overlay = $("#overlay");
  const setDrawer = (open) => {
    drawer.classList.toggle("is-open", open); drawer.setAttribute("aria-hidden", !open);
    overlay.hidden = !open; document.body.classList.toggle("no-scroll", open);
  };
  $("#cartOpen").addEventListener("click", () => setDrawer(true));
  $("#cartClose").addEventListener("click", () => setDrawer(false));
  overlay.addEventListener("click", () => setDrawer(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setDrawer(false); });
  $("#cartClear").addEventListener("click", () => { cart = []; store.set("zm-cart", cart); renderCart(); renderProducts(); });

  /* ---------------- Eventos ---------------- */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmtRange = (e) => {
    const a = parse(e.start), b = parse(e.end || e.start);
    const f = new Intl.DateTimeFormat(locale(), { day: "numeric", month: "long", year: "numeric" });
    return f.formatRange ? f.formatRange(a, b) : `${f.format(a)} – ${f.format(b)}`;
  };
  const upcoming = () => EVENTS.filter((e) => parse(e.end || e.start) >= today).sort((a, b) => parse(a.start) - parse(b.start));
  const past = () => EVENTS.filter((e) => parse(e.end || e.start) < today).sort((a, b) => parse(b.start) - parse(a.start));

  function countdown(e) {
    const days = Math.round((parse(e.start) - today) / 864e5);
    if (days < 0) return t("events.now");
    if (days === 0) return t("events.today");
    return t("events.daysLeft", { n: days });
  }

  function renderEvents() {
    const up = upcoming();
    $("#events").innerHTML = up.length ? up.map((e, i) => {
      const d = parse(e.start);
      return `
      <article class="event ${i === 0 ? "event--next" : ""}">
        <div class="event__date">
          <span class="event__day">${d.getDate()}</span>
          <span class="event__month">${new Intl.DateTimeFormat(locale(), { month: "short" }).format(d)}</span>
          <span class="event__year">${d.getFullYear()}</span>
        </div>
        <div class="event__info">
          <div class="event__tags">
            <span class="badge ${e.status === "confirmed" ? "badge--ok" : "badge--tbc"}">${t("events." + e.status)}</span>
            <span class="event__count">${countdown(e)}</span>
          </div>
          <h3>${esc(e.name)}</h3>
          <p class="event__where">${e.flag} ${esc(e.city)}${e.venue ? " · " + esc(e.venue) : ""}</p>
          <p class="event__when">${fmtRange(e)}${e.booth ? ` · ${t("events.booth")} <strong>${esc(e.booth)}</strong>` : ""}</p>
        </div>
        <div class="event__actions">
          <a class="btn btn--ghost btn--sm" href="${gcal(e)}" target="_blank" rel="noopener">${t("events.calendar")}</a>
          <button type="button" class="btn btn--primary btn--sm" data-reserve="${EVENTS.indexOf(e)}">${t("events.reserve")}</button>
          ${e.url ? `<a class="link-btn" href="${esc(e.url)}" target="_blank" rel="noopener">${t("events.web")} ↗</a>` : ""}
        </div>
      </article>`;
    }).join("") : `<p class="empty">${t("events.none")}</p>`;

    const ps = past();
    $("#pastWrap").hidden = ps.length === 0;
    $("#pastEvents").innerHTML = ps.map((e) => `<li>${e.flag} <strong>${esc(e.name)}</strong> — ${esc(e.city)}, ${fmtRange(e)}</li>`).join("");

    const next = up[0], el = $("#nextEvent");
    el.hidden = !next;
    if (next) el.innerHTML = `<span class="next-event__dot"></span><span>${t("hero.next")}: <strong>${esc(next.city)}</strong> · ${fmtRange(next)}</span><span class="next-event__count">${countdown(next)}</span>`;
  }

  function gcal(e) {
    const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const end = parse(e.end || e.start); end.setDate(end.getDate() + 1);
    const q = new URLSearchParams({
      action: "TEMPLATE", text: `${e.name} — ${CONFIG.brand}`,
      dates: `${ymd(parse(e.start))}/${ymd(end)}`,
      location: [e.venue, e.city].filter(Boolean).join(", "),
      details: `${e.booth ? t("events.booth") + " " + e.booth + " · " : ""}${CONFIG.brand} · ${CONFIG.mobile}`
    });
    return `https://calendar.google.com/calendar/render?${q}`;
  }

  document.addEventListener("click", (ev) => {
    const res = ev.target.closest("[data-reserve]");
    if (res) {
      const e = EVENTS[+res.dataset.reserve];
      goContact("event", t("events.reserveMsg", { event: e.name, date: fmtRange(e) }));
    }
    const topic = ev.target.closest("a[data-topic]");
    if (topic) { $("#topic").value = topic.dataset.topic; }
  });

  /* ---------------- Contacto ---------------- */
  function goContact(topic, message) {
    setDrawer(false);
    $("#topic").value = topic;
    if (message) $("#message").value = message;
    $("#contacto").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $("#contactForm [name=name]").focus({ preventScroll: true }), 600);
  }

  function renderContact() {
    $("#cEmail").textContent = CONFIG.email; $("#cEmail").href = `mailto:${CONFIG.email}`;
    $("#cMobile").textContent = CONFIG.mobile; $("#cMobile").href = `https://wa.me/${CONFIG.whatsapp}`;
    $("#cPhone").textContent = CONFIG.phone; $("#cPhone").href = `tel:${CONFIG.phone.replace(/\s/g, "")}`;
    $("#cAddress").textContent = CONFIG.address;
    $("#cOwner").textContent = CONFIG.owner;
    $("#cInstagram").closest("li").hidden = !CONFIG.instagram;
    $("#cInstagram").textContent = CONFIG.instagramHandle || CONFIG.instagram; $("#cInstagram").href = CONFIG.instagram || "#";
  }

  $("#contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target, status = $("#formStatus");
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const bad = f.type === "checkbox" ? !f.checked : !f.value.trim() || (f.type === "email" && !f.checkValidity());
      f.closest("label").classList.toggle("is-invalid", bad); if (bad) ok = false;
    });
    if (!ok) { status.textContent = t("form.errors"); status.className = "form__status is-error"; return; }

    const data = Object.fromEntries(new FormData(form));
    const topicLabel = $("#topic").selectedOptions[0].textContent;
    if (CONFIG.formEndpoint) {
      status.textContent = t("form.sending"); status.className = "form__status";
      try {
        const r = await fetch(CONFIG.formEndpoint, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...data, topic: topicLabel, language: lang })
        });
        if (!r.ok) throw new Error(r.status);
        form.reset(); status.textContent = t("form.ok"); status.className = "form__status is-ok";
      } catch {
        status.innerHTML = `${t("form.fail")} <a href="mailto:${CONFIG.email}">${CONFIG.email}</a>`; status.className = "form__status is-error";
      }
    } else {
      const subject = `[${topicLabel}] ${CONFIG.brand}`;
      const body = `${data.message}\n\n— ${data.name}${data.company ? " · " + data.company : ""}\n${data.email}`;
      status.className = "form__status is-ok";
      status.innerHTML = `${esc(t("form.mailOk"))}<span class="form__send">` +
        `<a class="btn btn--primary btn--sm" href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(subject + "\n\n" + body)}" target="_blank" rel="noopener">WhatsApp</a>` +
        `<a class="btn btn--ghost btn--sm" href="mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Email</a></span>`;
    }
  });
  $("#contactForm").addEventListener("input", (e) => e.target.closest("label")?.classList.remove("is-invalid"));

  /* ---------------- Menú móvil y cabecera ---------------- */
  const menuBtn = $("#menuBtn"), nav = $("#nav");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open"); menuBtn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", false); } });
  const header = $(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------------- Inicio ---------------- */
  function renderAll() {
    renderChips(); renderProducts(); renderCart(); renderEvents(); renderContact();
    $("#statMinerals").textContent = CONFIG.peruvianMinerals;
    const yr = today.getFullYear();
    $("#statFairs").textContent = Math.max(EVENTS.filter((e) => e.start.startsWith(String(yr + 1))).length, EVENTS.filter((e) => e.start.startsWith(String(yr))).length);
    $("#statCountries").textContent = new Set(EVENTS.map((e) => e.country)).size;
  }
  $("#year").textContent = new Date().getFullYear();
  applyLang();
})();
