/* chapters — scroll progress bar + "You are in" section label.
   Sections opt in via data-secname/data-secidx; total comes from the count,
   so adding a section never needs a JS change. Loaded via its own <script defer>. */
(function () {
  'use strict';
  var bar = document.getElementById('pbar');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var nameEl = document.getElementById('secName');
  var numEl = document.getElementById('secNum');
  var secs = document.querySelectorAll('[data-secname]');
  if (!nameEl || !numEl || !secs.length || !('IntersectionObserver' in window)) return;
  var total = secs.length;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        nameEl.textContent = en.target.getAttribute('data-secname');
        numEl.textContent = pad(+en.target.getAttribute('data-secidx')) + '/' + pad(total);
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  secs.forEach(function (s) { io.observe(s); });
})();
