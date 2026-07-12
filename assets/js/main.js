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

  /* ---- Mobile menu ---- */
  var burger = document.getElementById('burger');
  var mmenu = document.getElementById('mmenu');
  if (burger && mmenu) {
    burger.addEventListener('click', function () {
      var open = mmenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mmenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mmenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
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
