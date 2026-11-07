/* ============================================================
   Enhancements — motion + Excel → Power BI transition
   Runs after script.js (defer order).
   ============================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- click ripple on the worksheet ---------- */
  const sheet = $("#sheet");
  if (sheet && !reduce) {
    sheet.addEventListener("pointerdown", (e) => {
      const rect = sheet.getBoundingClientRect();
      const rip = document.createElement("span");
      rip.className = "ripple";
      rip.style.left = e.clientX - rect.left + "px";
      rip.style.top = e.clientY - rect.top + "px";
      sheet.appendChild(rip);
      rip.addEventListener("animationend", () => rip.remove());
    });
  }

  /* ---------- cursor-follow tilt ---------- */
  function initTilt() {
    if (reduce || coarse) return;
    $$(".project, .habit, .toolcol, .ccard").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-py * 3).toFixed(2)}deg) rotateY(${(px * 3).toFixed(2)}deg) translateY(-2px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- magnetic buttons ---------- */
  function initMagnetic() {
    if (reduce || coarse) return;
    $$(".btn").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.transform = `translate(${(dx * 5).toFixed(1)}px,${(dy * 5).toFixed(1)}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* ============================================================
     EXCEL → POWER BI MODE
     The workbook flips to a .pbix report once you pass the
     transition band before the Power BI project.
     ============================================================ */
  const transition = $("#x2p");
  let pbiOn = false;

  function setMode(on) {
    if (on === pbiOn) return;
    pbiOn = on;
    document.body.classList.toggle("pbi-mode", on);
    const ft = document.getElementById("formulaText");
    const nb = document.getElementById("namebox");
    if (ft) {
      if (on) {
        ft.textContent = "Total Revenue = SUM('TCS'[FY25A])";
        if (nb) nb.textContent = "Revenue";
      } else {
        ft.textContent = "";
        if (nb) nb.textContent = "B2";
      }
    }
  }

  function updateMode() {
    if (!transition) return;
    const r = transition.getBoundingClientRect();
    setMode(r.bottom < window.innerHeight * 0.55);
  }
  window.addEventListener("scroll", updateMode, { passive: true });

  /* ---------- motion ---------- */
  function initFX() {
    if (!hasGSAP || reduce) {
      const fill = $(".x2p-fill");
      if (fill) fill.style.width = "100%";
      const spark = $(".x2p-spark");
      if (spark) spark.style.opacity = "0";
      const rm = $("#rmFill");
      if (rm) rm.style.height = "100%";
      return;
    }
    gsap.registerPlugin(window.ScrollTrigger);

    // floating hero KPI card
    gsap.to(".minitable", { y: -8, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.2 });

    // Power BI logo bars pulse like a live chart
    gsap.to(".pbi-logo i", {
      scaleY: () => 0.55 + Math.random() * 0.6,
      transformOrigin: "bottom center",
      duration: 0.85, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: 0.12,
    });

    // gentle parallax accents
    if (!coarse) {
      [".hero-note", ".chart-wrap"].forEach((sel) => {
        $$(sel).forEach((el) => {
          gsap.fromTo(el, { y: 10 }, {
            y: -12, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.1 },
          });
        });
      });
    }

    // transition band: nodes pop, the line fills, the spark crosses
    if (transition) {
      const st = { trigger: transition, start: "top 80%", once: true };
      gsap.from(".x2p-node", { scale: 0.75, opacity: 0, duration: 0.55, stagger: 0.18, ease: "back.out(1.7)", scrollTrigger: st });
      gsap.fromTo(".x2p-fill", { width: "0%" }, { width: "100%", duration: 1.15, ease: "power2.inOut", scrollTrigger: st });
      gsap.fromTo(".x2p-spark", { left: "0%", opacity: 1 }, { left: "100%", opacity: 0, duration: 1.15, ease: "power2.inOut", scrollTrigger: st });
      gsap.from(".x2p-cap", { y: 12, opacity: 0, duration: 0.6, delay: 0.5, ease: "power2.out", scrollTrigger: st });
    }

    // roadmap rail fills from start to now
    const roadmap = $(".roadmap");
    if (roadmap) {
      const rst = { trigger: roadmap, start: "top 72%", once: true };
      gsap.fromTo("#rmFill", { height: "0%" }, { height: "100%", duration: 1.3, ease: "power2.out", scrollTrigger: rst });
      gsap.from(".rm-item", { x: -16, opacity: 0, duration: 0.5, stagger: 0.12, ease: "power2.out", scrollTrigger: rst });
      gsap.from(".rm-summary", { y: 14, opacity: 0, duration: 0.6, ease: "power2.out", scrollTrigger: rst });
    }
  }

  function boot() {
    initTilt();
    initMagnetic();
    initFX();
    updateMode();
  }

  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
})();
