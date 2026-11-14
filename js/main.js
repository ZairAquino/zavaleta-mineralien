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

  /* ---------------- Galería de minerales ---------------- */
  // Solo se muestran las piezas con foto (añade `photo` en data.js para que aparezca una nueva)
  const CATALOG = PRODUCTS.filter((p) => p.photo).sort((a, b) => a.featured - b.featured);
  const CATS = CATEGORIES.filter((c) => CATALOG.some((p) => p.category === c));
  const state = { cat: "all" };
  const visible = () => CATALOG.filter((p) => state.cat === "all" || p.category === state.cat);

  function renderChips() {
    $("#categoryChips").innerHTML = ["all", ...CATS].map((c) =>
      `<button type="button" class="chip" role="tab" aria-selected="${state.cat === c}" data-cat="${c}">${esc(t("cat." + c))}</button>`).join("");
  }
  $("#categoryChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    state.cat = b.dataset.cat; renderChips(); renderGallery();
  });

  function renderGallery() {
    $("#gallery").innerHTML = visible().map((p) => `
      <figure class="gitem">
        <button type="button" class="gitem__photo" data-open="${p.id}" aria-label="${esc(L(p.name))}">
          <img src="${esc(p.photo)}" alt="${esc(L(p.name))}" loading="lazy" decoding="async">
        </button>
        <figcaption>
          <span class="gitem__tag">${esc(t("cat." + p.category))} · ${esc(p.locality)}</span>
          <strong>${esc(L(p.name))}</strong>
        </figcaption>
      </figure>`).join("");
  }

  /* ---------------- Visor de fotos ---------------- */
  const modal = $("#productModal");
  let current = null;
  function openModal(id) {
    const list = visible();
    const idx = list.findIndex((x) => x.id === id); if (idx < 0) return;
    const p = list[idx]; current = id;
    const nav = list.length > 1
      ? `<button type="button" class="lb-nav lb-nav--prev" data-step="-1" aria-label="${t("gallery.prev")}">‹</button>
         <button type="button" class="lb-nav lb-nav--next" data-step="1" aria-label="${t("gallery.next")}">›</button>
         <span class="lb-count">${idx + 1} / ${list.length}</span>` : "";
    $("#modalContent").innerHTML = `
      <div class="modal__media has-photo" style="--glow:${p.color}">
        <img src="${esc(p.photo)}" alt="${esc(L(p.name))}">${nav}
      </div>
      <div class="modal__info">
        <p class="eyebrow">${esc(t("cat." + p.category))}</p>
        <h2>${esc(L(p.name))}</h2>
        <p>${esc(L(p.desc))}</p>
        <dl class="specs">
          <div><dt>${t("card.locality")}</dt><dd>${esc(p.locality)}</dd></div>
          <div><dt>${t("card.formats")}</dt><dd>${esc(L(p.formats))}</dd></div>
        </dl>
        <button type="button" class="btn btn--primary" data-ask="${p.id}">${t("gallery.ask")}</button>
      </div>`;
    if (!modal.open) { if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", ""); }
  }
  function step(n) {
    const list = visible(); if (!current || list.length < 2) return;
    const idx = list.findIndex((x) => x.id === current);
    openModal(list[(idx + n + list.length) % list.length].id);
  }
  function closeModal() { current = null; if (modal.open) modal.close ? modal.close() : modal.removeAttribute("open"); }
  $("#modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  modal.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    if (open) { openModal(open.dataset.open); return; }
    const st = e.target.closest("[data-step]");
    if (st) { step(+st.dataset.step); return; }
    const ask = e.target.closest("[data-ask]");
    if (ask) {
      const p = CATALOG.find((x) => x.id === ask.dataset.ask);
      closeModal();
      goContact("buy", t("gallery.askMsg", { name: L(p.name) }));
    }
  });

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
    renderChips(); renderGallery(); renderEvents(); renderContact();
    $("#statMinerals").textContent = CONFIG.peruvianMinerals;
    const yr = today.getFullYear();
    $("#statFairs").textContent = Math.max(EVENTS.filter((e) => e.start.startsWith(String(yr + 1))).length, EVENTS.filter((e) => e.start.startsWith(String(yr))).length);
    $("#statCountries").textContent = new Set(EVENTS.map((e) => e.country)).size;
  }
  $("#year").textContent = new Date().getFullYear();
  applyLang();
})();
