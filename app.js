/* ==================================================================
   Suncast — The Property Tour
   Scroll-driven frame scrubber. Everything on screen is a pure function
   of scroll position: frame index, overlay opacity, hotspot position,
   detail reveals. No playback timers.
================================================================== */
(() => {
  "use strict";
  const M = window.SUNCAST_MANIFEST;
  if (!M) { document.getElementById("loader-meta").textContent = "manifest.js is missing."; return; }

  /* ---------- timeline layout (in viewport heights) ---------- */
  const INTRO_VH = 1.0;                        // aerial + invitation
  const CH_VH = 3.6;                           // per chapter
  const A = 0.34, S = 0.84;                    // approach ends / departure starts (local progress)
  const TAIL_VH = 0.4;                         // settle at aerial before the closing section
  const chapters = M.chapters;
  const N = chapters.length;

  /* ---------- DOM ---------- */
  const $ = (id) => document.getElementById(id);
  const scroller = $("scroller"), stage = $("stage"), canvas = $("film"), poster = $("poster");
  const ctx = canvas.getContext("2d", { alpha: false });
  const intro = $("intro"), overlay = $("overlay"), hotspot = $("hotspot"), hsLabel = $("hotspot-label");
  const missing = $("missing"), railList = $("rail-list"), railFill = $("rail-fill"), topNav = $("top-nav-list");
  const ovNum = $("ov-num"), ovKicker = $("ov-kicker"), ovName = $("ov-name"), ovModel = $("ov-model"), ovBenefit = $("ov-benefit"), ovDetails = $("ov-details"), ovCta = $("ov-cta");
  const panel = $("panel");
  const loader = $("loader"), loaderFill = $("loader-fill"), loaderMeta = $("loader-meta");
  const motionToggle = $("motion-toggle");

  /* ---------- frames ---------- */
  const frames = chapters.map(() => []);        // Image objects (sparse until loaded)
  const loaded = chapters.map(() => 0);
  const frameSrc = (c, i) => `assets/chapters/${chapters[c].id}/frames/f_${String(i + 1).padStart(4, "0")}.${chapters[c].frameExt || "webp"}`;

  function loadFrame(c, i) {
    return new Promise((res) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => { frames[c][i] = img; loaded[c]++; res(true); };
      img.onerror = () => { frames[c][i] = null; loaded[c]++; res(false); };
      img.src = frameSrc(c, i);
    });
  }
  async function loadChapter(c, onProgress, concurrency = 8) {
    const total = chapters[c].frames; let next = 0;
    const worker = async () => { while (next < total) { const i = next++; await loadFrame(c, i); onProgress && onProgress(loaded[c], total); } };
    await Promise.all(Array.from({ length: concurrency }, worker));
  }
  // nearest available frame at or below the target, else above, else null
  function pickFrame(c, i) {
    const arr = frames[c]; if (!arr.length) return null;
    for (let k = i; k >= 0; k--) if (arr[k]) return arr[k];
    for (let k = i + 1; k < chapters[c].frames; k++) if (arr[k]) return arr[k];
    return null;
  }

  /* ---------- canvas ---------- */
  let vw = 0, vh = 0, dpr = 1;
  const posterImg = new Image(); posterImg.src = M.poster;
  function resize() {
    vw = stage.clientWidth; vh = stage.clientHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    canvas.style.width = vw + "px"; canvas.style.height = vh + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lastDraw = null; render(true);
  }
  // cover-fit with a focus point (fx, fy in %) — returns the drawn rect
  function coverRect(iw, ih, fx, fy) {
    const s = Math.max(vw / iw, vh / ih);
    const dw = iw * s, dh = ih * s;
    let ox = (vw - dw) * (fx / 100), oy = (vh - dh) * (fy / 100);
    // (vw - dw) is ≤ 0, so fx shifts the crop toward the focus point
    return { ox, oy, dw, dh };
  }
  let lastDraw = null;
  function draw(img, fx, fy) {
    if (!img) return;
    const r = coverRect(img.naturalWidth, img.naturalHeight, fx, fy);
    const key = img.src + "|" + r.ox.toFixed(1) + "|" + r.oy.toFixed(1) + "|" + vw + "x" + vh;
    if (key === lastDraw) return r;
    ctx.drawImage(img, r.ox, r.oy, r.dw, r.dh);
    lastDraw = key;
    return r;
  }

  /* ---------- easing ---------- */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeInOut = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  function trackAt(track, t) {
    if (!track || !track.length) return [50, 50];
    if (t <= track[0][0]) return [track[0][1], track[0][2]];
    for (let i = 1; i < track.length; i++) {
      if (t <= track[i][0]) {
        const [t0, x0, y0] = track[i - 1], [t1, x1, y1] = track[i];
        const k = (t - t0) / Math.max(1e-6, t1 - t0);
        return [lerp(x0, x1, k), lerp(y0, y1, k)];
      }
    }
    const l = track[track.length - 1]; return [l[1], l[2]];
  }

  /* ---------- scroll → state ---------- */
  function layout() {
    // +1: the stage stays pinned until the scroller's bottom meets the viewport bottom, so the
    // timeline needs one extra viewport of travel to finish (chapter 5's return + the tail) while pinned.
    const total = INTRO_VH + N * CH_VH + TAIL_VH + 1;
    scroller.style.height = `calc(${total} * 100vh)`;
    scroller.style.height = `calc(${total} * 100svh)`;
  }
  // progress in vh units from the top of the scroller
  function scrollUnits() {
    const rect = scroller.getBoundingClientRect();
    return clamp(-rect.top / vh, 0, INTRO_VH + N * CH_VH + TAIL_VH);
  }
  function stateFor(u) {
    if (u < INTRO_VH) return { phase: "intro", t: u / INTRO_VH, c: -1 };
    const x = u - INTRO_VH;
    const c = Math.min(N - 1, Math.floor(x / CH_VH));
    const local = clamp((x - c * CH_VH) / CH_VH);
    if (x >= N * CH_VH) return { phase: "tail", c: N - 1, local: 1, t: (x - N * CH_VH) / TAIL_VH };
    return { phase: "chapter", c, local };
  }
  function chapterScrollTop(c, atLocal = A + 0.02) {
    const top = scroller.offsetTop;
    return top + (INTRO_VH + c * CH_VH + atLocal * CH_VH) * vh;
  }

  /* ---------- render ---------- */
  let currentC = -1, detailCount = -1, lastRailC = -1;
  function setOverlayChapter(c) {
    if (c === currentC) return; currentC = c;
    const ch = chapters[c];
    ovNum.textContent = String(ch.index).padStart(2, "0");
    ovKicker.textContent = ch.kicker; ovName.textContent = ch.name; ovModel.textContent = ch.model; ovBenefit.textContent = ch.benefit;
    ovDetails.innerHTML = ch.features.slice(0, 3).map((f) => `<li>${f}</li>`).join("");
    hsLabel.textContent = ch.hotspotLabel || ch.name;
    stage.dataset.side = ch.overlaySide === "right" ? "right" : "left";
    detailCount = -1;
    missing.hidden = ch.frames > 0;
  }
  function setRail(c) {
    if (c === lastRailC) return; lastRailC = c;
    railList.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-current", i === c ? "true" : "false"));
    topNav.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-current", i === c ? "true" : "false"));
  }

  function render(force) {
    if (document.body.dataset.motion === "static" || !vh) return;
    const u = scrollUnits();
    const st = stateFor(u);
    const total = INTRO_VH + N * CH_VH + TAIL_VH;
    stage.style.setProperty("--prog", clamp((u - INTRO_VH) / (N * CH_VH)).toFixed(4));

    if (st.phase === "intro") {
      const img = pickFrame(0, 0) || posterImg;
      draw(img, 50, 50);
      stage.style.setProperty("--intro-o", (1 - easeInOut(clamp(st.t * 1.6))).toFixed(3));
      overlay.style.setProperty("--ov-o", 0);
      hotspot.hidden = true; missing.hidden = true;
      stage.style.setProperty("--vig", 1);
      setRail(-1);
      return;
    }

    const c = st.c, ch = chapters[c];
    const local = st.phase === "tail" ? 1 : st.local;
    stage.style.setProperty("--intro-o", 0);
    setOverlayChapter(c); setRail(c);

    // --- frame index from local progress: approach → hold → reverse
    let fi = 0, tf = 0;             // tf: 0 aerial … 1 hero (for hotspot track)
    if (local < A) { tf = easeInOut(local / A); }
    else if (local < S) { tf = 1; }
    else { tf = 1 - easeInOut((local - S) / (1 - S)); }
    if (st.phase === "tail") tf = 0;
    fi = Math.round(tf * Math.max(0, ch.frames - 1));

    // focus point eases from centre to the chapter's focus and back (portrait crops)
    const fx = lerp(50, ch.focus[0], tf), fy = lerp(50, ch.focus[1], tf);
    const img = ch.frames ? pickFrame(c, fi) : (pickFrame(0, 0) || posterImg);
    const r = draw(img, fx, fy) || coverRect(img.naturalWidth, img.naturalHeight, fx, fy);

    // --- overlay opacity: in at arrival, out at departure
    let ov = 0;
    if (local >= A - 0.03 && local < S + 0.04) {
      ov = Math.min(clamp((local - (A - 0.03)) / 0.06), 1 - clamp((local - S) / 0.04));
    }
    overlay.style.setProperty("--ov-o", ov.toFixed(3));
    stage.style.setProperty("--vig", (0.55 + 0.45 * ov).toFixed(3));
    const showcaseT = clamp((local - A) / (S - A));
    // details reveal progressively through the showcase
    const want = ov > 0 ? Math.min(3, Math.floor(showcaseT * 4.2)) : 0;
    if (want !== detailCount) { detailCount = want; [...ovDetails.children].forEach((li, i) => li.classList.toggle("is-in", i < want)); }

    // --- hotspot follows the product; visible once it's close enough
    const [px, py] = trackAt(ch.track, tf);
    const sx = r.ox + (px / 100) * r.dw, sy = r.oy + (py / 100) * r.dh;
    const visible = ch.frames > 0 && tf > 0.62 && sx > 0 && sx < vw && sy > 0 && sy < vh;
    if (visible) {
      hotspot.hidden = false;
      hotspot.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
      hotspot.style.setProperty("--hs-o", clamp((tf - 0.62) / 0.3).toFixed(3));
      hotspot.classList.toggle("flip", sy > vh - 90);
    } else { hotspot.hidden = true; }
    ovCta.tabIndex = ov > 0.5 ? 0 : -1;
    hotspot.tabIndex = visible && ov > 0.5 ? 0 : -1;
  }

  let ticking = false;
  // header goes solid navy once the pinned scene has scrolled away (closing section / static version)
  function headerMode() {
    const past = document.body.dataset.motion === "static" || scroller.getBoundingClientRect().bottom < 140;
    document.body.classList.toggle("past-tour", past);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; headerMode(); render(); }); } }

  /* ---------- navigation ---------- */
  function buildNav() {
    chapters.forEach((ch, i) => {
      const num = String(ch.index).padStart(2, "0");
      const li = document.createElement("li");
      li.innerHTML = `<button type="button" aria-label="Chapter ${ch.index}: ${ch.name}">${num}<span class="rail__name">${ch.name}</span></button>`;
      li.querySelector("button").addEventListener("click", () => goTo(i));
      railList.appendChild(li);
      const li2 = document.createElement("li");
      li2.innerHTML = `<button type="button"><i>${num}</i>${ch.kicker === "Patio" && ch.index === 5 ? "Trash Stow-Away" : shortName(ch)}</button>`;
      li2.querySelector("button").addEventListener("click", () => goTo(i));
      topNav.appendChild(li2);
    });
  }
  const shortName = (ch) => ({ 1: "Vista Shed", 2: "Deck Box", 3: "Hosemobile", 4: "Garage Cabinets", 5: "Trash Stow-Away" })[ch.index] || ch.name;
  function goTo(i) {
    if (document.body.dataset.motion === "static") { document.getElementById("static-" + chapters[i].id)?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: chapterScrollTop(i), behavior: reduce ? "auto" : "smooth" });
  }
  document.addEventListener("keydown", (e) => {
    if (panel.open || e.altKey || e.metaKey || e.ctrlKey) return;
    if (e.key >= "1" && e.key <= "5") goTo(Number(e.key) - 1);
  });

  /* ---------- product panel ---------- */
  function openPanel(c) {
    const ch = chapters[c];
    $("panel-num").textContent = String(ch.index).padStart(2, "0");
    $("panel-kicker").textContent = ch.kicker; $("panel-title").textContent = ch.name; $("panel-model").textContent = ch.model;
    const img = $("panel-img"); img.src = ch.hero || M.poster; img.alt = `${ch.name} in its location on the property`;
    $("panel-features").innerHTML = ch.features.map((f) => `<li>${f}</li>`).join("");
    const links = [`<a class="btn btn--solid" href="${ch.link}" target="_blank" rel="noopener">${ch.linkLabel || "View product"} ↗</a>`];
    (ch.links || []).forEach(([label, href]) => links.push(`<a class="link-sm" href="${href}" target="_blank" rel="noopener">${label} ↗</a>`));
    $("panel-links").innerHTML = links.join("");
    panel.showModal();
  }
  hotspot.addEventListener("click", () => openPanel(currentC));
  $("intro-cta").addEventListener("click", () => goTo(0));
  ovCta.addEventListener("click", () => openPanel(currentC));
  panel.addEventListener("click", (e) => { if (e.target === panel) panel.close(); });

  /* ---------- static (reduced motion) layout ---------- */
  function buildStatic() {
    const wrap = $("static-chapters");
    wrap.innerHTML = chapters.map((ch) => `
      <article class="static-ch" id="static-${ch.id}" aria-labelledby="st-${ch.id}">
        <img src="${ch.hero || M.poster}" alt="${ch.name} shown in its location: ${ch.kicker.toLowerCase()}." loading="lazy">
        <div>
          <p class="overlay__kicker"><span class="overlay__num">${String(ch.index).padStart(2, "0")}</span>${ch.kicker}</p>
          <h2 id="st-${ch.id}">${ch.name}</h2>
          <p class="panel__model">${ch.model}</p>
          <p>${ch.benefit}</p>
          <ul class="panel__features">${ch.features.map((f) => `<li>${f}</li>`).join("")}</ul>
          <p class="panel__links"><a class="btn btn--solid" href="${ch.link}" target="_blank" rel="noopener">${ch.linkLabel || "View product"} ↗</a></p>
        </div>
      </article>`).join("");
  }
  function setMotion(staticMode, persist = true) {
    document.body.dataset.motion = staticMode ? "static" : "auto";
    motionToggle.setAttribute("aria-pressed", String(staticMode));
    scroller.hidden = staticMode; $("static").hidden = !staticMode;
    if (persist) { try { localStorage.setItem("suncast-motion", staticMode ? "static" : "auto"); } catch (e) {} }
    headerMode();
    if (!staticMode) { lastDraw = null; render(true); }
  }
  motionToggle.addEventListener("click", () => setMotion(document.body.dataset.motion !== "static"));

  /* ---------- closing cards ---------- */
  function buildCards() {
    $("cards").innerHTML = chapters.map((ch, i) => `
      <li class="card">
        <img src="${ch.hero || M.poster}" alt="" loading="lazy">
        <div class="card__body">
          <span class="card__num">Chapter ${String(ch.index).padStart(2, "0")} · ${ch.kicker}</span>
          <h3>${ch.name}</h3>
          <span class="card__model">${ch.model}</span>
          <p>${ch.benefit}</p>
          <div class="card__actions">
            <button class="btn" type="button" data-open="${i}">Details</button>
            <a class="btn" href="${ch.link}" target="_blank" rel="noopener">Product page ↗</a>
          </div>
        </div>
      </li>`).join("");
    $("cards").querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openPanel(Number(b.dataset.open))));
  }

  /* ---------- boot ---------- */
  async function boot() {
    buildNav(); buildStatic(); buildCards(); layout(); resize();
    let pref = null; try { pref = localStorage.getItem("suncast-motion"); } catch (e) {}
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMotion(pref ? pref === "static" : prefersReduce, false);

    window.addEventListener("resize", () => { layout(); resize(); }, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    resize();

    // Preload chapter 1 fully (with progress), then the rest in the background.
    const first = chapters.findIndex((ch) => ch.frames > 0);
    if (first >= 0) {
      await loadChapter(first, (n, t) => { loaderFill.style.width = (n / t * 100).toFixed(1) + "%"; loaderMeta.textContent = `Loading chapter ${chapters[first].index} · ${n}/${t} frames`; });
    } else {
      loaderMeta.textContent = "No footage found — showing the reference viewpoint.";
    }
    poster.classList.add("is-hidden");
    loader.classList.add("is-done"); setTimeout(() => { loader.hidden = true; }, 600);
    lastDraw = null; render(true);
    for (let c = 0; c < N; c++) if (c !== first && chapters[c].frames > 0) { await loadChapter(c, null, 6); lastDraw = null; render(true); }
  }
  boot();
})();
