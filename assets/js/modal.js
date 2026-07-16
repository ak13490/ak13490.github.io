/* modal — project-preview dialog. Loaded via its own <script defer>.
   A trigger with [data-modal="key"] opens a dialog whose reading column is
   cloned from <template id="tmpl-key"> (which supplies data-eyebrow + data-title).
   Builds its own shell DOM once, so a page only needs triggers + templates.
   Dims and scroll-locks the page; closes on ×, Esc, or backdrop click. Focus is
   moved into the dialog, trapped while open, and restored on close.
   Safe no-op if the page has no [data-modal] triggers. */
(function () {
  'use strict';

  var triggers = document.querySelectorAll('[data-modal]');
  if (!triggers.length) return;

  /* ---- build the shell once ---- */
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<div class="modal-window" role="dialog" aria-modal="true" aria-labelledby="modalTitle">' +
      '<div class="modal-bar">' +
        '<div><div class="modal-eyebrow"></div><div class="modal-title" id="modalTitle"></div></div>' +
        '<button class="modal-close" type="button" aria-label="Close preview">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="modal-scroll"><article class="modal-doc"></article></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var win      = overlay.querySelector('.modal-window');
  var scroll   = overlay.querySelector('.modal-scroll');
  var doc      = overlay.querySelector('.modal-doc');
  var eyebrow  = overlay.querySelector('.modal-eyebrow');
  var title    = overlay.querySelector('.modal-title');
  var closeBtn = overlay.querySelector('.modal-close');
  var lastFocused = null;

  /* scroll the dialog to a [data-anchor] proof line and flash it.
     Re-corrects once after images above the anchor finish laying out. */
  function goToAnchor(anchor) {
    var el = doc.querySelector('[data-anchor="' + anchor + '"]');
    if (!el) return;
    var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function place(behavior) {
      var top = el.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop - 28;
      scroll.scrollTo({ top: Math.max(0, top), behavior: behavior });
    }
    requestAnimationFrame(function () {
      place(smooth ? 'smooth' : 'auto');
      el.classList.add('m-hit');
      setTimeout(function () { el.classList.remove('m-hit'); }, 2600);
      setTimeout(function () {                       // image-load layout correction
        if (!overlay.classList.contains('open')) return;
        var off = el.getBoundingClientRect().top - scroll.getBoundingClientRect().top;
        if (off < 0 || off > 120) place('auto');
      }, 500);
    });
  }

  function open(key, anchor) {
    var tmpl = document.getElementById('tmpl-' + key);
    if (!tmpl) return;
    eyebrow.textContent = tmpl.getAttribute('data-eyebrow') || '';
    title.textContent   = tmpl.getAttribute('data-title') || '';
    doc.innerHTML = '';
    doc.appendChild(tmpl.content.cloneNode(true));
    scroll.scrollTop = 0;
    lastFocused = document.activeElement;

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';           // scroll-lock the page behind
    closeBtn.focus({ preventScroll: true });
    if (anchor) goToAnchor(anchor);
    // deep link: every open modal has a shareable URL (…/#cs-key, or
    // …/#cs-key--anchor for a specific proof line).
    // replaceState = no history pollution, no scroll jump.
    history.replaceState(null, '', '#cs-' + key + (anchor ? '--' + anchor : ''));
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    history.replaceState(null, '', location.pathname + location.search);
  }

  triggers.forEach(function (t) {
    var go = function () { open(t.getAttribute('data-modal'), t.getAttribute('data-target')); };
    t.addEventListener('click', go);
    t.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); }); // click the dim area

  // arriving via a deep link (…/#cs-key or …/#cs-key--anchor) opens that
  // case study directly, scrolled to the anchored proof line if given
  var m = location.hash.match(/^#cs-([a-z]+)(?:--([\w-]+))?$/);
  if (m && document.getElementById('tmpl-' + m[1])) open(m[1], m[2]);

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {                              // trap focus inside the dialog
      var f = win.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
