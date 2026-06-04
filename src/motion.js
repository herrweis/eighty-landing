// ─── Progressive enhancement (native scroll only) ───────────────────────
// No smooth-scroll, no pinning, no scroll-scrubbing — the page scrolls
// natively. We only:
//   1. line-draw the 80° once, when it first enters the viewport, and
//   2. fade sections up as they arrive.
// The 80° "sits in place" via CSS position:sticky, not JS.
//
// All of this is gated behind prefers-reduced-motion and is purely additive:
// with no JS (or reduced motion) the static page is shown in full.

export function initMotion() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Focus-preserving in-page anchors (skip link) — useful regardless of motion.
  setupAnchors(prefersReduced);

  if (prefersReduced) return;
  document.documentElement.classList.add('is-animated');

  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        el.classList.add(el.classList.contains('figure') ? 'is-drawn' : 'is-in');
        obs.unobserve(el);
      }
    },
    { threshold: 0.3, rootMargin: '0px 0px -8% 0px' }
  );

  document.querySelectorAll('.figure, [data-reveal]').forEach((el) => io.observe(el));
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
