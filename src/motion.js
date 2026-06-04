// ─── Progressive enhancement (native scroll only) ───────────────────────
// No smooth-scroll, no pinning, no preventDefault — the browser scrolls
// exactly as it normally would. We only READ the scroll position (throttled
// to one rAF) and map it to the 80°'s line-draw, so it draws IN on the way
// down and OUT on the way up while the figure sits fixed (CSS sticky).
//
// Gated behind prefers-reduced-motion and purely additive: with no JS (or
// reduced motion) the static page shows the 80° already drawn.

export function initMotion() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setupAnchors(prefersReduced);
  if (prefersReduced) return;

  document.documentElement.classList.add('is-animated');
  setupFigureDraw();
}

function setupFigureDraw() {
  const cue = document.querySelector('.hero__cue');
  const wordmark = document.querySelector('.wordmark');
  const section = document.querySelector('.act--figure');
  const spacer = document.querySelector('.figure-spacer');
  const art = document.querySelector('.figure__art');
  const strokes = [...document.querySelectorAll('.figure__mark .stroke')].sort(
    (a, b) => a.dataset.draw - b.dataset.draw
  );
  if (!section || !art || !strokes.length) return;

  const N = strokes.length;
  const SEG = 0.34; // each stroke's slice of the global progress (overlapping)
  const STEP = (1 - SEG) / (N - 1); // stagger between strokes → reads 8 → 0 → °
  const desktop = window.matchMedia('(min-width: 901px)');

  let queued = false;

  const render = () => {
    queued = false;
    const vh = window.innerHeight;

    // 1) Hero cue fades out as the eighty° wordmark rises to the top —
    //    fully gone by the time the wordmark reaches the viewport top.
    if (cue && wordmark) {
      const wt = wordmark.getBoundingClientRect().top;
      cue.style.opacity = String(clamp(wt / (vh * 0.4), 0, 1));
    }

    // 2) The 80° draw. On desktop the figure is pinned, so we map the draw
    //    to scroll through the pinned zone — it only begins once the hero
    //    has scrolled away (section reaches the top) and the page is clear.
    let p;
    if (desktop.matches) {
      const dist = (spacer && spacer.offsetHeight) || vh;
      p = clamp(-section.getBoundingClientRect().top / dist, 0, 1);
    } else {
      const r = art.getBoundingClientRect();
      p = clamp((vh - (r.top + r.height / 2)) / (vh * 0.5), 0, 1);
    }

    for (let i = 0; i < N; i++) {
      const local = clamp((p - i * STEP) / SEG, 0, 1);
      strokes[i].style.strokeDashoffset = String(1 - local);
    }
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  render();
}

function clamp(n, min, max) {
  return n < min ? min : n > max ? max : n;
}

function setupAnchors(reduced) {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}
