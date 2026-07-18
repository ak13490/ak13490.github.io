/* philosophy.js — "How I think" behaviors. Loaded via its own <script defer>.
   1) Sticky-rail highlight: the .hrail link whose .hstep is nearest the top
      of the viewport gets .on (rail is desktop-only; observer is cheap).
   2) Mobile receipt collapse (audit V-8): every receipt after the first in
      each .hev is marked .extra and a "+N more receipts" toggle is injected.
      CSS hides .extra (and shows the toggle) only ≤700px, so desktop always
      shows all receipts. Progressive enhancement — no JS, no collapse.
   Self-guarding IIFE; no-ops if the section is absent. */
(function () {
  'use strict';

  /* ---- 1. rail highlight ---- */
  var rail = document.querySelector('.hrail');
  var steps = document.querySelectorAll('.hstep[id]');
  if (rail && steps.length && 'IntersectionObserver' in window) {
    var links = {};
    rail.querySelectorAll('a[href^="#"]').forEach(function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });
    var setOn = function (id) {
      rail.querySelectorAll('a.on').forEach(function (a) { a.classList.remove('on'); });
      if (links[id]) links[id].classList.add('on');
    };
    // the step crossing the upper-middle band of the viewport wins
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setOn(e.target.id); });
    }, { rootMargin: '-20% 0px -65% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ---- 2. mobile receipt collapse ---- */
  document.querySelectorAll('.hev').forEach(function (ev) {
    var receipts = ev.querySelectorAll('.hln');
    if (receipts.length < 2) return;
    var extra = receipts.length - 1;
    for (var i = 1; i < receipts.length; i++) receipts[i].classList.add('extra');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hmore';
    btn.setAttribute('aria-expanded', 'false');
    var label = function (open) {
      btn.innerHTML = open
        ? '<span class="pm">−</span> show fewer'
        : '<span class="pm">+</span> ' + extra + ' more receipt' + (extra > 1 ? 's' : '');
    };
    label(false);
    btn.addEventListener('click', function () {
      var open = ev.classList.toggle('exp');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      label(open);
    });
    ev.appendChild(btn);
  });
})();
