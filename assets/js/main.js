/* ============================================================
   main.js — Shared page behavior (loaded with `defer` on every page)
   - Mobile menu toggle
   - Reveal-on-scroll (IntersectionObserver)
   Add future shared behavior here (theme toggle, active-nav-on-scroll).
   ============================================================ */
(function () {
  'use strict';

  /* ---- Theme toggle (dark mode) ----
     Initial theme is set flash-free by the inline <head> script; this only
     handles clicks and persistence. */
  var root = document.documentElement;
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    var sync = function () {
      themeBtn.setAttribute('aria-pressed', root.classList.contains('dark') ? 'true' : 'false');
    };
    sync();
    themeBtn.addEventListener('click', function () {
      var dark = !root.classList.contains('dark');
      root.classList.toggle('dark', dark);
      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
      sync();
    });
  }

  /* ---- Mobile menu (burger morphs to ✕ via CSS; scrim closes on tap) ---- */
  var burger = document.getElementById('burger');
  var mmenu = document.getElementById('mmenu');
  if (burger && mmenu) {
    var scrim = document.getElementById('mscrim');
    var setMenu = function (open) {
      mmenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.addEventListener('click', function () {
      setMenu(!mmenu.classList.contains('open'));
    });
    if (scrim) scrim.addEventListener('click', function () { setMenu(false); });
    mmenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* ---- Reveal-on-scroll ---- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.rv:not(.in)');
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }
})();


/* ── stats count-up (added 20 Jul 2026) ──
   Numbers tick up once when the stats row first enters view. The final value
   is in the HTML, so no-JS and reduced-motion readers get it immediately. */
/* ── QW-2 · stats count-up (self-guarding IIFE; exposes run/finish for the switch) ── */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.getElementById('statsCount');
  if (!root) return;
  var nums = [].slice.call(root.querySelectorAll('.snum'));
  var played = false;

  function render(el, v) {
    var d = parseInt(el.dataset.decimals || '0', 10);
    el.innerHTML = (el.dataset.prefix || '') + v.toFixed(d) + (el.dataset.suffix || '');
  }
  function finishStats() {
    nums.forEach(function (el) {
      if (el.dataset.steps) { el.textContent = JSON.parse(el.dataset.steps).slice(-1)[0]; return; }
      render(el, parseFloat(el.dataset.count));
    });
  }
  function runStats() {
    if (reduced || false) { finishStats(); return; }
    var DUR = 700, t0 = null;
    nums.forEach(function (el) { el._steps = el.dataset.steps ? JSON.parse(el.dataset.steps) : null; });
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / DUR, 1), e = 1 - Math.pow(1 - p, 3);
      nums.forEach(function (el) {
        if (el._steps) { el.textContent = el._steps[Math.min(Math.floor(p * el._steps.length), el._steps.length - 1)]; return; }
        render(el, parseFloat(el.dataset.count) * e);
      });
      if (p < 1) requestAnimationFrame(frame); else finishStats();
    }
    requestAnimationFrame(frame);
  }

  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !played && true) { played = true; runStats(); io.unobserve(e.target); }
      });
    }, { threshold: .4 });
    io.observe(root);
  } else { finishStats(); }

  })();
