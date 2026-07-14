/* lanyard.js — rope physics for the hero badge (see lanyard/lanyard.css).
   The badge attachment point is a 2D particle on a band: gravity pulls it,
   the band springs back only when taut (slack = free fall), drag follows the
   pointer and carries throw velocity on release.

   All positions are PAGE coordinates (pageX/pageY), never viewport — so
   scrolling can't desync the particle from the anchor. Self-guarding IIFE;
   no-ops without #lanRig; honors prefers-reduced-motion; sim runs only while
   the rig is on screen. */
(function () {
  var rig = document.getElementById('lanRig');
  if (!rig) return;
  var band = document.getElementById('lanBand');
  var card = document.getElementById('lanCard');

  var L = 220;                        // band rest length (px) — pivot is at page top, 60px higher
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    rig.style.transform = 'rotate(0.05rad)';
    return;
  }

  // ---- anchor: the rig's rotation origin (top center), PAGE coords ----
  var A = null;
  function measureAnchor() {
    var t = rig.style.transform;
    rig.style.transform = 'rotate(0rad)';
    var r = rig.getBoundingClientRect();
    A = { x: r.left + r.width / 2 + window.scrollX, y: r.top + window.scrollY };
    rig.style.transform = t;
  }
  measureAnchor();
  addEventListener('resize', measureAnchor);   // layout changes only — scroll can't move a page-coord anchor

  var P = { x: A.x, y: A.y + L };     // particle: badge attachment point (page coords)
  var V = { x: 0, y: 0 };

  // ---- constants ----
  var G = 2300;                       // gravity px/s²
  var K_ROPE = 130, C_ROPE = 10;      // band stiffness / damping (taut only)
  var DRAG = 1.1;                     // air drag
  var MAXLEN = 460, MINLEN = 60;      // visual band clamps
  var MAXTHROW = 1600;                // release speed cap px/s

  // ---- drag ----
  var dragging = false, grab = { x: 0, y: 0 }, hist = [];
  card.addEventListener('pointerdown', function (e) {
    measureAnchor();
    dragging = true;
    V.x = 0; V.y = 0;                 // kill stale momentum the moment you grab
    grab.x = e.pageX - P.x; grab.y = e.pageY - P.y;
    hist = [{ x: P.x, y: P.y, t: performance.now() }];
    card.setPointerCapture(e.pointerId); e.preventDefault();
  });
  card.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    P.x = e.pageX - grab.x; P.y = e.pageY - grab.y;
    hist.push({ x: P.x, y: P.y, t: performance.now() });
    if (hist.length > 6) hist.shift();
    render();
  });
  function release() {
    if (!dragging) return;
    dragging = false;
    // throw velocity from RECENT pointer history only (a pause = no throw)
    var now = performance.now();
    var recent = hist.filter(function (h) { return now - h.t < 120; });
    if (recent.length >= 2) {
      var a = recent[0], b = recent[recent.length - 1];
      var dt = Math.max(0.016, (b.t - a.t) / 1000);
      var vx = (b.x - a.x) / dt * 0.9, vy = (b.y - a.y) / dt * 0.9;
      var s = Math.sqrt(vx * vx + vy * vy);
      if (s > MAXTHROW) { vx *= MAXTHROW / s; vy *= MAXTHROW / s; }
      V.x = vx; V.y = vy;
    }
  }
  card.addEventListener('pointerup', release);
  card.addEventListener('pointercancel', release);
  card.addEventListener('lostpointercapture', release);
  addEventListener('blur', release);

  // ---- physics (fixed substeps) ----
  function physics(dt) {
    var ax = Math.sin(performance.now() / 1500) * 6;   // idle breeze
    var ay = G;
    var dx = P.x - A.x, dy = P.y - A.y;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    if (dist > L) {                                    // taut → spring back
      var dirx = dx / dist, diry = dy / dist;
      var relV = V.x * dirx + V.y * diry;
      var f = -K_ROPE * (dist - L) - C_ROPE * relV;
      ax += f * dirx; ay += f * diry;
    }
    ax -= DRAG * V.x; ay -= DRAG * V.y;
    V.x += ax * dt; V.y += ay * dt;
    P.x += V.x * dt; P.y += V.y * dt;
  }

  // ---- render ----
  var lag = 0, lagV = 0, prevTheta = 0;
  function render() {
    var dx = P.x - A.x, dy = P.y - A.y;
    var dist = Math.max(MINLEN, Math.min(MAXLEN, Math.sqrt(dx * dx + dy * dy) || 1));
    var theta = Math.atan2(A.x - P.x, P.y - A.y);      // CSS rotate(+) swings left
    band.style.height = dist + 'px';
    rig.style.transform = 'rotate(' + theta + 'rad)';
    card.style.transform = 'rotate(' + lag + 'rad)';
    return theta;
  }

  // ---- loop: only while the rig is on screen ----
  var visible = true;
  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
  }).observe(rig);

  var last = performance.now(), acc = 0, STEP = 1 / 120;
  (function tick(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (visible) {
      if (!dragging) { acc += dt; while (acc > STEP) { physics(STEP); acc -= STEP; } }
      var theta = render();
      var w = (theta - prevTheta) / Math.max(dt, 0.008); prevTheta = theta;
      var lagT = Math.max(-0.09, Math.min(0.09, -w * 0.22));
      lagV += (-70 * (lag - lagT) - 13 * lagV) * dt;
      lag += lagV * dt;
    }
    requestAnimationFrame(tick);
  })(last);
})();
