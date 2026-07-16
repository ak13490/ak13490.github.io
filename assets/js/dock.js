/* dock — shows the mobile quick-contact bar once the hero leaves the
   viewport, and hides it again if the reader scrolls back to the top
   (the hero's own CTAs take over there). Loaded via its own <script defer>. */
(function () {
  'use strict';
  var dock = document.getElementById('dock');
  var hero = document.querySelector('.hero');
  if (!dock) return;
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var away = !entries[0].isIntersecting;
      dock.classList.toggle('show', away);
      document.body.classList.toggle('past-hero', away);
    }, { threshold: 0.05 }).observe(hero);
  } else {
    dock.classList.add('show');
    document.body.classList.add('past-hero');
  }
})();
