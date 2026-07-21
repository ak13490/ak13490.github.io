/* arch — the AI request-path diagram: one-shot reveal + F-marker ↔ ticket
   cross-highlight. Self-guarding IIFE; no-ops if the section is absent.
   NOTE: the reveal is a progressive enhancement — the diagram is visible by
   default and only hidden once JS commits to animating it (see arch.css),
   so a missed observer can never leave the diagram blank. */
/* ── QW-8 v2 · architecture reveal + cross-highlight wired to the ticket rows ── */
(function () {
  'use strict';
  var root = document.getElementById('ai');
  if (!root) return;
  /* two diagrams now: the wide one (desktop) and the vertical reflow (mobile).
     Observe both — only the one its media query shows will ever be seen. */
  var svgs = root.querySelectorAll('.arch-svg');
  var reducedMo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(svgs, function (svg) {
    /* Opt in to animating ONLY here, so if anything below fails the diagram is
       still fully visible (see the .anim CSS). Reveal is driven by plain scroll
       geometry — an IntersectionObserver on these SVGs proved unreliable and a
       silent miss would leave the diagram blank. */
    if (reducedMo) return;
    svg.classList.add('anim');
    var done = false;
    var reveal = function () {
      if (done) return;
      done = true;
      svg.classList.add('drawn');
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      /* Once the run is over, drop .anim so the FINAL state no longer depends on
         a CSS transition having actually run. If the tab was throttled and the
         transition never advanced, this still lands on the visible base state. */
      setTimeout(function () { svg.classList.remove('anim'); }, 2600);
    };
    function check() {
      var r = svg.getBoundingClientRect();
      if (r.height && r.top < window.innerHeight * 0.92 && r.bottom > 0) reveal();
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
    setTimeout(check, 400);           /* after fonts/layout settle */
    setTimeout(reveal, 8000);         /* hard failsafe: never stay hidden */
  });

  /* markers (F-03 has two) + ticket rows share data-fail; highlight ALL that match */
  function setHL(id, on) {
    var els = root.querySelectorAll('[data-fail="' + id + '"]');
    Array.prototype.forEach.call(els, function (el) { el.classList.toggle('hl', on); });
  }
  var interactive = root.querySelectorAll('.marker, .tix-row');
  Array.prototype.forEach.call(interactive, function (el) {
    var id = el.getAttribute('data-fail');
    if (!id) return;
    var on = function () { setHL(id, true); };
    var off = function () { setHL(id, false); };
    el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off);
    el.addEventListener('focus', on);      el.addEventListener('blur', off);
    /* Click a marker on the diagram → jump to the failure it points at (the
       tickets sit below the diagram, often off-screen). Clicking a ticket row
       just pins/unpins its highlight — you are already looking at it. Touch has
       no hover, so the pinned highlight is also how tapping reads there. */
    el.addEventListener('click', function () {
      var isMarker = el.classList.contains('marker');
      if (isMarker) {
        var row = root.querySelector('.tix-row[data-fail="' + id + '"]');
        ['F-01', 'F-02', 'F-03'].forEach(function (x) { setHL(x, false); });
        setHL(id, true);
        if (row) {
          var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: row.getBoundingClientRect().top + window.pageYOffset - 140,
                            behavior: reduce ? 'auto' : 'smooth' });
        }
        return;
      }
      var lit = el.classList.contains('hl');
      ['F-01', 'F-02', 'F-03'].forEach(function (x) { setHL(x, false); });
      if (!lit) setHL(id, true);
    });
  });
})();
