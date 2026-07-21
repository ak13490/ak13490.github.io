/* philosophy-loop — drives the process dial(s) in #philosophy.

   Two static dial instances exist: a large sticky one in the desktop column
   (.phi-dial-desk) and one shown at the top on mobile (.phi-dial-mobile), plus
   a sticky phase bar (#loopBar). All are lit from the SAME scroll position, so
   the section's seven real steps — and the quote-receipt buttons that deep-link
   into case studies — stay completely untouched.

   Reveal is a progressive enhancement (dials are visible by default, hidden
   only once we commit to animating), and position is read from scroll geometry
   rather than an IntersectionObserver, both of which proved unreliable here. */
(function () {
  'use strict';
  var sec = document.getElementById('philosophy');
  if (!sec) return;

  var steps = [].slice.call(sec.querySelectorAll('[id^="hs-0"]'));
  if (!steps.length) return;

  /* Only now do we let the CSS dim the inactive steps. Gating on this class
     means that before JS runs — or if it never does — every step stays at full
     opacity, so the dimming can never hide content on its own. */
  var hloop = sec.querySelector('.hloop');
  if (hloop) hloop.classList.add('spy-ready');

  var svgs   = [].slice.call(sec.querySelectorAll('.phi-dial .fl-svg'));
  var nodes  = [], arcs = [], labels = [];
  svgs.forEach(function (svg) {
    nodes  = nodes.concat([].slice.call(svg.querySelectorAll('.node')));
    arcs   = arcs.concat([].slice.call(svg.querySelectorAll('.arc')));
    labels = labels.concat([].slice.call(svg.querySelectorAll('.arc-label')));
  });

  var bar    = document.getElementById('loopBar');
  var ticks  = bar ? [].slice.call(bar.querySelectorAll('.lbar-tk')) : [];
  var phaseEl= bar ? bar.querySelector('.lbar-phase') : null;

  var NAME  = { discover:'Discover', define:'Define', experiment:'Experiment', ship:'Ship & scale' };
  var PHASE = { 1:'discover', 2:'discover', 3:'discover', 4:'define',
                5:'experiment', 6:'experiment', 7:'ship' };
  var ORDER = ['discover','define','experiment','ship'];
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rank(p) { return ORDER.indexOf(p); }

  function paint(active) {
    var phase = PHASE[active];
    nodes.forEach(function (n) {
      var s = +n.getAttribute('data-step');
      n.classList.toggle('active', s === active);
      n.classList.toggle('visited', s < active);
    });
    arcs.concat(labels).forEach(function (el) {
      var p = el.getAttribute('data-phase');
      el.classList.toggle('active', p === phase);
      el.classList.toggle('visited', rank(p) < rank(phase));
    });
    if (phaseEl) phaseEl.textContent = NAME[phase] || '';
    ticks.forEach(function (t) {
      var n = +t.getAttribute('data-tick');
      t.classList.toggle('active', n === active);
      t.classList.toggle('visited', n < active);
    });
    /* the step you're reading lights up; the rest recede (see .spy-ready CSS) */
    steps.forEach(function (el, i) {
      el.classList.toggle('active', (i + 1) === active);
    });
  }

  /* the step whose top has most recently crossed the reading line */
  function currentStep() {
    var line = window.innerHeight * 0.42, best = 1;
    steps.forEach(function (el, i) {
      if (el.getBoundingClientRect().top <= line) best = i + 1;
    });
    return best;
  }
  var last = 0;
  function update() {
    var n = currentStep();
    if (n !== last) { last = n; paint(n); }
  }

  /* click any node (either dial) → jump to its step */
  nodes.forEach(function (n) {
    var target = document.getElementById('hs-0' + n.getAttribute('data-step'));
    if (!target) return;
    n.style.cursor = 'pointer';
    n.setAttribute('tabindex', '0');
    n.setAttribute('role', 'button');
    var go = function () {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 110,
                        behavior: reduce ? 'auto' : 'smooth' });
    };
    n.addEventListener('click', go);
    n.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });

  /* tap the sticky bar → back to the top of the section */
  if (bar) {
    var goTop = function () {
      window.scrollTo({ top: sec.getBoundingClientRect().top + window.pageYOffset - 70,
                        behavior: reduce ? 'auto' : 'smooth' });
    };
    bar.addEventListener('click', goTop);
    bar.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTop(); }
    });
  }

  /* one-shot draw when each dial first comes into view; never leaves it blank */
  if (!reduce) {
    svgs.forEach(function (svg) {
      svg.classList.add('anim');
      var drawn = false;
      var draw = function () {
        if (drawn) return;
        var r = svg.getBoundingClientRect();
        if (!r.height || r.top > window.innerHeight * 0.95 || r.bottom < 0) return;
        drawn = true;
        svg.classList.add('drawn');
        setTimeout(function () { svg.classList.remove('anim'); }, 2600);
      };
      window.addEventListener('scroll', draw, { passive: true });
      window.addEventListener('resize', draw);
      draw();
      setTimeout(draw, 400);
      setTimeout(function () { drawn = true; svg.classList.add('drawn'); svg.classList.remove('anim'); }, 8000);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
