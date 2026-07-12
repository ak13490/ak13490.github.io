/* typetext — type-once typewriter effect (no delete, no loop). Loaded via its own
   <script defer>. For each [data-typetext] element: reads its text, clears it, then
   types it back one character at a time and stops, leaving the full text in place.
   Keeps an accessible label; respects reduced-motion (shows full text instantly).
   Safe no-op if the page has no [data-typetext]. */
(function () {
  'use strict';

  var els = document.querySelectorAll('[data-typetext]');
  if (!els.length) return;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  els.forEach(function (el) {
    var full = (el.getAttribute('data-typetext') || el.textContent).trim();
    if (!full) return;

    var speed = parseInt(el.getAttribute('data-type-speed'), 10) || 95;
    var delay = parseInt(el.getAttribute('data-type-delay'), 10);
    if (isNaN(delay)) delay = 300;
    var keepCursor = el.getAttribute('data-type-cursor') === 'keep';
    var char = el.getAttribute('data-type-char') || '|';

    el.setAttribute('aria-label', full);      // screen readers get the whole name

    var textSpan = document.createElement('span');
    textSpan.className = 'typetext-text';
    var cursor = document.createElement('span');
    cursor.className = 'typetext-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = char;

    el.textContent = '';
    el.appendChild(textSpan);
    el.appendChild(cursor);

    if (reduce) {                              // no motion: show it all, drop the cursor
      textSpan.textContent = full;
      if (!keepCursor) cursor.remove();
      return;
    }

    var i = 0;
    function step() {
      textSpan.textContent = full.slice(0, i);
      if (i < full.length) {
        i++;
        setTimeout(step, speed);
      } else if (!keepCursor) {
        cursor.classList.add('done');
        setTimeout(function () { cursor.remove(); }, 500);
      }
    }
    setTimeout(step, delay);
  });
})();
