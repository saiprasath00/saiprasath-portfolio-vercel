/* ============================================================
   Sai Prasath D P — Portfolio.xlsx
   Interactivity + auto-running animation.
   ============================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";

  /* ---------------- helpers ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rowH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--row")) || 34;

  /* ---------------- build spreadsheet chrome ---------------- */
  const colhead = $("#colhead");
  const LETTERS = "ABCDEFGHIJKL".split("");
  const corner = document.createElement("div");
  corner.className = "corner";
  colhead.appendChild(corner);
  LETTERS.forEach((l) => {
    const c = document.createElement("div");
    c.className = "ch";
    c.textContent = l;
    c.dataset.col = l;
    colhead.appendChild(c);
  });

  const gutter = $("#gutter");
  const sheet = $("#sheet");
  let gutterCount = 0;
  function buildGutter() {
    const rh = rowH();
    const n = Math.ceil(sheet.offsetHeight / rh);
    if (n === gutterCount) return;
    gutterCount = n;
    gutter.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const g = document.createElement("div");
      g.className = "gn";
      g.textContent = i + 1;
      g.dataset.row = i;
      frag.appendChild(g);
    }
    gutter.appendChild(frag);
  }

  /* ---------------- formula bar ---------------- */
  const namebox = $("#namebox");
  const formulaText = $("#formulaText");
  let lockCell = null; // clicked/active element
  let typeToken = 0;

  function setFormula(cell, formula, instant) {
    namebox.textContent = cell || "B2";
    const txt = formula || "";
    if (instant || reduce) {
      formulaText.textContent = txt;
      return;
    }
    const token = ++typeToken;
    formulaText.textContent = "";
    let i = 0;
    (function step() {
      if (token !== typeToken) return;
      formulaText.textContent = txt.slice(0, ++i);
      if (i < txt.length) setTimeout(step, 12 + Math.random() * 14);
    })();
  }

  // hover to preview, click to lock
  $$("[data-formula]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (lockCell) return;
      setFormula(el.dataset.cell, el.dataset.formula, true);
    });
    el.addEventListener("click", (e) => {
      lockCell = el;
      setFormula(el.dataset.cell, el.dataset.formula, true);
      // don't hijack actual links/buttons
    });
  });

  /* ---------------- cell cursor ---------------- */
  const cursor = $("#cursorcell");
  const sel = $("#selcell");
  let raf = null;
  let lastEvt = null;

  function markHeaders(col, row) {
    $$("#colhead .ch").forEach((c) => c.classList.toggle("active", +c.dataset.col === col));
    const gns = gutter.children;
    if (gns.length) {
      const idx = Math.min(row, gns.length - 1);
      for (let i = 0; i < gns.length; i++) gns[i].classList.toggle("active", i === idx);
    }
  }
  function clearHeaders() {
    $$("#colhead .ch").forEach((c) => c.classList.remove("active"));
    Array.from(gutter.children).forEach((g) => g.classList.remove("active"));
  }

  function moveCursor() {
    raf = null;
    if (!lastEvt) return;
    const e = lastEvt;
    const rect = sheet.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cw = rect.width / 12;
    const rh = rowH();
    const col = clamp(Math.floor(x / cw), 0, 11);
    const row = Math.max(0, Math.floor(y / rh));
    cursor.style.left = col * cw + "px";
    cursor.style.top = row * rh + "px";
    cursor.style.width = cw + "px";
    cursor.style.height = rh + "px";
    cursor.classList.add("on");
    markHeaders(col, row);
  }

  if (!reduce) {
    sheet.addEventListener("mousemove", (e) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      lastEvt = e;
      if (!raf) raf = requestAnimationFrame(moveCursor);
    });
    sheet.addEventListener("mouseleave", () => {
      cursor.classList.remove("on");
      if (!lockCell) clearHeaders();
    });
  }

  /* ---------------- sheet tabs + scroll spy ---------------- */
  const tabs = $$(".tab[data-jump]");
  const sections = ["about", "work", "toolkit", "journey", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActiveTab(id) {
    tabs.forEach((t) => {
      const on = t.dataset.jump === id;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
  }
  function goto(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = $(".chrome").offsetHeight + 8;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    setActiveTab(id);
  }
  $$("[data-jump]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.preventDefault();
      goto(b.dataset.jump);
    });
  });

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) setActiveTab(en.target.dataset.sheet || en.target.id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------------- typing headline ---------------- */
  const typeLine = $(".type-line");
  function typeHeadline() {
    if (!typeLine) return;
    const full = typeLine.dataset.type || typeLine.textContent;
    if (reduce) { typeLine.textContent = full; return; }
    typeLine.textContent = "";
    let i = 0;
    (function step() {
      typeLine.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(step, 55 + Math.random() * 70);
    })();
  }

  /* ---------------- counters ---------------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || "0", 10);
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    const start = performance.now();
    const dur = 1400;
    function tick(now) {
      const t = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(tick);
  }
  const counters = $$(".num[data-count]");
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { animateCount(en.target); countObs.unobserve(en.target); }
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => countObs.observe(c));

  /* ---------------- skill bars ---------------- */
  const bars = $$(".bar i");
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.style.width = en.target.style.getPropertyValue("--lvl") || "80%";
        barObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach((b) => barObs.observe(b));

  /* ---------------- sparkline ---------------- */
  (function spark() {
    const path = $(".sparkline");
    if (!path) return;
    const pts = [18, 16, 19, 13, 15, 10, 12, 6, 8, 3];
    const W = 120, H = 28, step = W / (pts.length - 1);
    const d = pts.map((y, i) => `${i ? "L" : "M"}${(i * step).toFixed(1)} ${y}`).join(" ");
    path.setAttribute("d", d);
    if (hasGSAP && !reduce) {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, { strokeDashoffset: 0, duration: 1.6, ease: "power2.out", delay: 0.6 });
    }
  })();

  /* ---------------- revenue chart ---------------- */
  const YEARS = ["FY18","FY19","FY20","FY21","FY22","FY23","FY24","FY25","FY26","FY27","FY28"];
  const ACTUAL = [100,110,116,125,145,168,187,207];
  const SCEN = {
    bear: [215,226,237],
    base: [226,246,265],
    bull: [240,268,299],
  };
  const CAGR = { bear: "4.5%", base: "8.5%", bull: "13.0%" };
  const NAMES = ["bear", "base", "bull"];

  const svg = $("#revChart");
  const gridG = svg ? $(".chart-grid", svg) : null;
  const pathsG = svg ? $(".chart-paths", svg) : null;
  const pointsG = svg ? $(".chart-points", svg) : null;
  const dotG = svg ? $(".chart-dot", svg) : null;

  const W = 640, H = 300, padL = 48, padR = 22, padT = 24, padB = 38;
  const vmin = 90, vmax = 315;
  const x = (i) => padL + (i / 10) * (W - padL - padR);
  const y = (v) => H - padB - ((v - vmin) / (vmax - vmin)) * (H - padT - padB);
  const toPath = (vals, startIdx) =>
    vals.map((v, i) => `${i ? "L" : "M"}${x(startIdx + i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  let pathRefs = {};
  function buildChart() {
    if (!svg) return;
    // gridlines + labels
    let g = "";
    [100, 150, 200, 250, 300].forEach((v) => {
      g += `<line x1="${padL}" y1="${y(v)}" x2="${W - padR}" y2="${y(v)}"/>`;
      g += `<text x="${padL - 8}" y="${y(v) + 3}" text-anchor="end">${v}</text>`;
    });
    gridG.innerHTML = g;

    const actualD = toPath(ACTUAL, 0);
    const baseD = toPath([207, ...SCEN.base], 7);
    const bullD = toPath([207, ...SCEN.bull], 7);
    const bearD = toPath([207, ...SCEN.bear], 7);

    pathsG.innerHTML = `
      <path class="p-bull" d="${bullD}"/>
      <path class="p-bear" d="${bearD}"/>
      <path class="p-base" d="${baseD}"/>
      <path class="p-actual" d="${actualD}"/>`;

    pathRefs = {
      actual: $(".p-actual", svg),
      base: $(".p-base", svg),
      bull: $(".p-bull", svg),
      bear: $(".p-bear", svg),
    };

    dotG.innerHTML = `<circle r="7" cx="${x(10)}" cy="${y(265)}"/>`;

    // axis labels
    const axis = $("#chartAxis");
    if (axis) axis.innerHTML = YEARS.map((yr) => `<span>${yr}</span>`).join("");

    // draw animation
    if (hasGSAP && !reduce) {
      Object.values(pathRefs).forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.to(pathRefs.actual, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" });
      gsap.to([pathRefs.base, pathRefs.bull, pathRefs.bear], {
        strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", stagger: 0.15, delay: 0.6,
      });
    }
  }

  const dotCircle = () => $(".chart-dot circle", svg);
  function setScenario(name, animate = true) {
    if (!svg) return;
    const idx = NAMES.indexOf(name);
    // emphasis
    const glow = { base: "rgba(33,115,70,.45)", bull: "rgba(47,111,235,.45)", bear: "rgba(192,57,43,.45)" };
    ["bear", "base", "bull"].forEach((n) => {
      const p = pathRefs[n];
      if (!p) return;
      p.style.opacity = n === name ? "1" : ".28";
      p.style.strokeWidth = n === name ? "3.2" : "2";
      p.style.filter = n === name ? `drop-shadow(0 0 6px ${glow[n]})` : "none";
    });
    const c = dotCircle();
    const val = SCEN[name][2];
    if (c) {
      const cx = x(10), cy = y(val);
      if (hasGSAP && animate && !reduce) {
        gsap.to(c, { attr: { cx, cy }, duration: 0.6, ease: "power2.out" });
      } else {
        c.setAttribute("cx", cx);
        c.setAttribute("cy", cy);
      }
    }
    const fy = $("#fy28b");
    const cagrEl = $("#cagr");
    const pill = $("#fy28Index");
    if (fy) fy.textContent = val;
    if (cagrEl) cagrEl.textContent = CAGR[name];
    if (pill) pill.textContent = val;
    $$(".scenario-btn").forEach((button) => {
      const active = button.dataset.scenario === name;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const allValues = [...ACTUAL, ...SCEN[name]];
    pointsG.innerHTML = allValues.map((value, i) =>
      `<circle class="chart-point ${i > 7 ? "is-forecast" : ""}" cx="${x(i)}" cy="${y(value)}" r="5" tabindex="0" data-year="${YEARS[i]}" data-value="${value}"/>`
    ).join("");
    bindChartPoints();
    // recalc flash
    const recalc = $("#recalc");
    if (recalc && !reduce) {
      recalc.textContent = "0%";
      let n = 0;
      const iv = setInterval(() => {
        n += 20;
        if (n >= 100) { n = 100; clearInterval(iv); }
        recalc.textContent = n + "%";
      }, 45);
    }
  }

  let autoTimer = null;
  let autoIdx = 1;
  let userHeld = false;
  function startAuto() {
    if (reduce) return;
    stopAuto();
    autoTimer = setInterval(() => {
      if (userHeld) return;
      autoIdx = (autoIdx + 1) % 3;
      setScenario(NAMES[autoIdx]);
    }, 3200);
  }
  function stopAuto() { if (autoTimer) clearInterval(autoTimer); autoTimer = null; }

  function bindChartPoints() {
    const tooltip = $("#chartTooltip");
    if (!tooltip) return;
    $$(".chart-point", svg).forEach((point) => {
      const show = () => {
        tooltip.textContent = `${point.dataset.year} · Revenue index ${point.dataset.value}`;
        tooltip.classList.add("is-visible");
        const surface = svg.closest(".chart-surface");
        const svgBox = svg.getBoundingClientRect();
        const surfaceBox = surface.getBoundingClientRect();
        tooltip.style.left = `${surfaceBox.width * (+point.getAttribute("cx") / W)}px`;
        tooltip.style.top = `${(svgBox.height * (+point.getAttribute("cy") / H)) + (svgBox.top - surfaceBox.top)}px`;
      };
      const hide = () => tooltip.classList.remove("is-visible");
      point.addEventListener("pointerenter", show);
      point.addEventListener("pointerleave", hide);
      point.addEventListener("focus", show);
      point.addEventListener("blur", hide);
      point.addEventListener("click", show);
    });
  }

  if (svg) {
    buildChart();
    $$(".scenario-btn").forEach((button) => {
      button.addEventListener("click", () => {
        userHeld = true;
        stopAuto();
        setScenario(button.dataset.scenario);
      });
    });
    const chartObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !userHeld) { startAuto(); }
        else { stopAuto(); }
      });
    }, { threshold: 0.25 });
    chartObs.observe(svg);
    setScenario("base", false);
  }

  /* ---------------- Power BI pane tabs ---------------- */
  $$(".pbi-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const page = tab.dataset.page;
      const root = tab.closest(".pbi");
      $$(".pbi-tab", root).forEach((t) => {
        const on = t === tab;
        t.classList.toggle("on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      $$(".pbi-pane", root).forEach((p) => p.classList.toggle("on", p.dataset.page === page));
    });
  });

  /* ---------------- copy email ---------------- */
  const copy = $("#copyEmail");
  if (copy) {
    copy.addEventListener("click", async () => {
      const email = copy.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
      } catch (e) { /* clipboard may be blocked */ }
      const old = copy.textContent;
      copy.textContent = "Copied ✓";
      copy.classList.add("btn--primary");
      setTimeout(() => {
        copy.textContent = old;
        copy.classList.remove("btn--primary");
      }, 1600);
    });
  }

  /* ---------------- GSAP entrance + scroll reveals ---------------- */
  function initMotion() {
    if (!hasGSAP || reduce) {
      // ensure final visible state
      setScenario("base", false);
      $$(".bar i").forEach((b) => (b.style.width = b.style.getPropertyValue("--lvl") || "80%"));
      return;
    }
    gsap.registerPlugin(window.ScrollTrigger);

    // hero orchestration
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-sub", { y: 14, opacity: 0, duration: 0.6 }, 0.1)
      .from(".hero-copy", { y: 16, opacity: 0, duration: 0.7 }, 0.25)
      .from(".hero-actions > *", { y: 14, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.4)
      .from(".minitable", { y: 22, opacity: 0, duration: 0.7 }, 0.3)
      .from(".mt-row", { opacity: 0, x: 12, duration: 0.4, stagger: 0.07 }, 0.55)
      .from(".hero-note", { opacity: 0, duration: 0.5 }, 0.9);

    // section reveals
    $$(".block").forEach((block) => {
      const items = block.querySelectorAll(
        ".h2, .lead, .bio-copy > p, .facts, .habit, .project-head, .chart-wrap, .project-foot, .toolcol, .learning, .certs, .langs, .contact-main, .contact-cards"
      );
      if (!items.length) return;
      gsap.from(items, {
        y: 22, opacity: 0, duration: 0.7, stagger: 0.05, ease: "power2.out",
        scrollTrigger: { trigger: block, start: "top 78%", once: true },
      });
    });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    buildGutter();
    initMotion();
    typeHeadline();
    // kick the formula typewriter for the hero after a beat
    setTimeout(() => {
      const hero = $("#about");
      if (hero) setFormula(hero.dataset.cell, hero.dataset.formula);
    }, 500);
    // recalculation ticker ambience
    if (!reduce) {
      const recalc = $("#recalc");
      let v = 100;
      setInterval(() => {
        if (!recalc) return;
        v = 96 + Math.round(Math.random() * 4);
        recalc.textContent = v + "%";
      }, 3600);
    }
  }

  // rebuild gutter on resize
  let rz;
  window.addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(buildGutter, 150);
  });

  if (document.readyState === "complete") {
    boot();
  } else {
    window.addEventListener("load", boot);
  }
})();
