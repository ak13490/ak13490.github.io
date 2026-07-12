/* cursor-image — floating project preview pinned (bottom-left corner) to the cursor
   while hovering any .hover-card. Loaded via its own <script defer> on pages that use it.
   Each card supplies EITHER data-img="path/to/image.jpg" (real image) OR data-title="…"
   (a generated placeholder). Desktop / fine-pointer only. Safe no-op if no .hover-card. */
(function () {
  'use strict';

  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var cards = document.querySelectorAll('.hover-card');
  if (!fine || !cards.length) return;

  var preview = document.createElement('div');
  preview.className = 'cursor-img';
  var img = document.createElement('img');
  img.alt = '';
  preview.appendChild(img);
  document.body.appendChild(preview);

  var mx = 0, my = 0, raf = null;
  function render() {
    // move to the cursor, then lift by own height -> bottom-left corner sits on the pointer
    preview.style.transform = 'translate(' + mx + 'px,' + my + 'px) translateY(-100%)';
    raf = null;
  }
  function move(e) { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(render); }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function placeholder(title, tint) {
    tint = tint || '#D9482B';
    var t = esc(title);
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>"
      + "<rect width='320' height='320' fill='#FAFAF8'/>"
      + "<rect x='22' y='22' width='276' height='196' fill='" + tint + "' opacity='0.12'/>"
      + "<circle cx='92' cy='118' r='34' fill='" + tint + "'/>"
      + "<rect x='150' y='150' width='120' height='16' fill='#141412' opacity='0.72'/>"
      + "<rect x='150' y='176' width='84' height='12' fill='#141412' opacity='0.38'/>"
      + "<text x='22' y='268' font-family='monospace' font-size='16' fill='#141412'>" + t + "</text>"
      + "<text x='22' y='292' font-family='monospace' font-size='11' fill='#6E6E66'>PROJECT &#183; PREVIEW</text>"
      + "</svg>";
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function (e) {
      mx = e.clientX; my = e.clientY; render();
      var src = card.getAttribute('data-img');
      img.src = src ? src : placeholder(card.getAttribute('data-title') || 'Project', card.getAttribute('data-accent'));
      preview.classList.add('show');
    });
    card.addEventListener('mousemove', move);
    card.addEventListener('mouseleave', function () { preview.classList.remove('show'); });
  });
})();
