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

// ─── Act 2 choreography, in units of the figure's pinned scroll (p: 0 → 1) ──
//  The sauna video stays fixed and carries the figure in; the 80° draws over it.
//  LEAD ........... DRAW_END : the 80° line-draws in (linen) over the video
//  DRAW_END ....... FILL_END : strokes fade out as the water fills the shapes
//  FILL_END ...... VIDEO_END : the video drains to carbon around the filled 80°
//  VIDEO_END ... REVEAL_START: carbon holds full while the blurb settles under
//                              the ° (the clean water-on-carbon composition)
//  REVEAL_START . REVEAL_END : the full picture is revealed (the mask "opens")
//  REVEAL_END ......... 1.0  : the masked fill bows out (the full photo has it)
const SPAN = 2.5; // pinned viewports the whole sequence spans
const LEAD = 0.06; // begin the draw a touch before the figure fully pins
const DRAW_END = 0.24;
const FILL_END = 0.38;
const VIDEO_END = 0.52; // carbon fully opaque — just before the blurb reaches the °
const REVEAL_START = 0.6;
const REVEAL_END = 0.86;

function setupFigureDraw() {
  const cue = document.querySelector('.hero__cue');
  const wordmark = document.querySelector('.wordmark');
  const section = document.querySelector('.act--figure');
  const signup = document.querySelector('.act--signup');
  const mark = document.querySelector('.figure__mark');
  const fill = document.querySelector('.figure__fill');
  const water = document.querySelector('.bg-water');
  const video = document.querySelector('.bg-video');
  const scrim = document.querySelector('.bg-scrim');
  const strokes = [...document.querySelectorAll('.figure__mark .stroke')].sort(
    (a, b) => a.dataset.draw - b.dataset.draw
  );
  if (!section || !strokes.length) return;

  const N = strokes.length;
  const SEG = 0.34; // each stroke's slice of the draw (overlapping)
  const STEP = (1 - SEG) / (N - 1); // stagger between strokes → reads 8 → 0 → °

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

    // 2) Global progress over the figure's pinned scroll. The LEAD nudges the
    //    start a little before the section fully pins, so the draw is already
    //    underway as it arrives. Saturates at 1.
    const top = section.getBoundingClientRect().top;
    const p = clamp((-top + LEAD * vh) / (vh * SPAN), 0, 1);

    // Draw: stagger each stroke across [0, DRAW_END].
    const drawP = clamp(p / DRAW_END, 0, 1);
    for (let i = 0; i < N; i++) {
      const local = clamp((drawP - i * STEP) / SEG, 0, 1);
      strokes[i].style.strokeDashoffset = String(1 - local);
    }

    // Fill: strokes fade out / masked water fades in across [DRAW_END, FILL_END].
    const fillIn = clamp((p - DRAW_END) / (FILL_END - DRAW_END), 0, 1);
    // Video drains to carbon around the filled shapes across [FILL_END, VIDEO_END].
    const videoOut = clamp((p - FILL_END) / (VIDEO_END - FILL_END), 0, 1);
    // Reveal: the full picture fades in across [REVEAL_START, REVEAL_END] — after
    // a hold on [VIDEO_END, REVEAL_START] so the carbon composition reads first.
    const revealIn = clamp((p - REVEAL_START) / (REVEAL_END - REVEAL_START), 0, 1);
    // Hand-off: once revealed, the masked fill retires (the full photo covers
    // the shapes), so nothing lingers as the figure unpins into Act 3.
    const fillOut = clamp((p - REVEAL_END) / (1 - REVEAL_END), 0, 1);

    if (mark) mark.style.opacity = String(1 - fillIn);
    if (fill) fill.style.opacity = String(fillIn * (1 - fillOut));
    if (video) video.style.opacity = String(1 - videoOut);
    if (water) water.style.opacity = String(revealIn);

    // Act 3 wash: a fixed dark layer that fades in as the sign-up scrolls up
    // (the content still scrolls; only the overlay stays put and washes in).
    if (signup && scrim) {
      const sTop = signup.getBoundingClientRect().top;
      scrim.style.opacity = String(clamp((vh - sTop) / (vh * 0.85), 0, 1));
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
