// ─── Scroll choreography ────────────────────────────────────────────────
// Three scrubbed acts layered on top of the static page. All motion is tied
// to scroll position (no autoplay) and uses SVG stroke animation only.
//
// If prefers-reduced-motion is set, or anything here throws, the page falls
// back to the fully-readable static layout (no `.is-animated` class).

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export function initMotion() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const root = document.documentElement;
  root.classList.add('is-animated');

  try {
    gsap.registerPlugin(ScrollTrigger);

    // ─── Lenis smooth scroll, driven by GSAP's ticker ───────────────────
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis; // handy for debugging / e2e checks

    // Smooth in-page anchors (e.g. the skip link), keeping keyboard focus.
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = id.length > 1 && document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, {
          onComplete: () => {
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          },
        });
      });
    });

    buildHero();
    buildFigure();
    buildSignup();

    // Recalculate trigger positions once web fonts have settled.
    ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  } catch (err) {
    // Revert to the static page if motion can't initialise.
    root.classList.remove('is-animated');
    // eslint-disable-next-line no-console
    console.warn('[eighty°] motion disabled:', err);
  }
}

// ─── Act 1 — hero ───────────────────────────────────────────────────────
// Top row pins; the wordmark block and cue travel up. When the wordmark
// reaches the top row, the row releases and both leave the top together.
function buildHero() {
  const hero = document.querySelector('.act--hero');
  if (!hero) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: () => '+=' + window.innerHeight * 1.1,
      pin: true,
      scrub: true,
      anticipatePin: 1,
    },
  });

  const rise = () => -window.innerHeight * 0.34;
  const exit = () => -window.innerHeight * 0.72;

  // Cue drifts up and fades early
  tl.to('[data-hero-cue]', { y: -60, autoAlpha: 0, ease: 'none', duration: 0.3 }, 0);

  // Wordmark block rises toward the top row
  tl.to('[data-hero-center]', { y: rise, ease: 'none', duration: 0.55 }, 0);

  // They meet, then leave the top of the viewport together — finishing
  // before the pin ends, so the screen briefly clears before Act 2 draws.
  tl.to('[data-hero-center]', { y: exit, autoAlpha: 0, ease: 'none', duration: 0.25 }, 0.55);
  tl.to('[data-topbar]', { y: () => -window.innerHeight * 0.25, autoAlpha: 0, ease: 'none', duration: 0.25 }, 0.55);
}

// ─── Act 2 — the 80° draws itself, blurb rises to meet it ───────────────
function buildFigure() {
  const figure = document.querySelector('.act--figure');
  if (!figure) return;

  const strokes = gsap
    .utils
    .toArray('.figure__mark .stroke')
    .sort((a, b) => a.dataset.draw - b.dataset.draw);

  gsap.set('[data-blurb]', { y: 44 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: figure,
      // Draw begins as the figure rises into view and completes near centre,
      // so the line-draw fills the travel with no empty scrolling.
      start: 'top bottom',
      end: 'center 56%',
      scrub: true,
    },
  });

  // 8 → 0 → ° — finishes around 90% of the timeline (4 strokes, staggered)
  tl.to(strokes, {
    strokeDashoffset: 0,
    ease: 'none',
    duration: 0.45,
    stagger: 0.15,
  }, 0);

  // Blurb lands just as the draw nears completion (they finish together)
  tl.to('[data-blurb]', { y: 0, autoAlpha: 1, ease: 'power1.out', duration: 0.32 }, 0.5);
}

// ─── Act 3 — form + footer scroll into view ─────────────────────────────
function buildSignup() {
  const signup = document.querySelector('.act--signup');
  if (!signup) return;

  gsap.set('[data-signup]', { y: 48 });

  gsap.to('[data-signup]', {
    y: 0,
    autoAlpha: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: signup,
      start: 'top 72%',
      end: 'top 38%',
      scrub: true,
    },
  });

  gsap.from('.footer', {
    autoAlpha: 0,
    y: 24,
    ease: 'none',
    scrollTrigger: {
      trigger: '.footer',
      start: 'top 96%',
      end: 'top 70%',
      scrub: true,
    },
  });
}
