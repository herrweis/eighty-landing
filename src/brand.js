import './styles/brand.scss';

// Scroll-spy for the pinned section nav: marks the link for the section
// under the bar, and keeps it in view when the nav scrolls sideways (mobile).
const nav = document.querySelector('.toc');

if (nav) {
  const list = nav.querySelector('.toc__list');
  const links = [...list.querySelectorAll('a[href^="#"]')];
  const sections = links.map((a) => document.getElementById(a.hash.slice(1)));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = -1;

  const update = () => {
    const line = nav.offsetHeight + 8;
    let i = sections.findLastIndex((s) => s.getBoundingClientRect().top <= line);
    // The last sections are too short to reach the bar; at the bottom, pick the last.
    const root = document.documentElement;
    if (innerHeight + scrollY >= root.scrollHeight - 2) i = sections.length - 1;
    // Above the first section (top of the page) the first link stays marked.
    i = Math.max(i, 0);
    if (i === current) return;

    links[current]?.removeAttribute('aria-current');
    current = i;

    const link = links[i];
    link.setAttribute('aria-current', 'location');
    list.scrollTo({
      left: link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2,
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
    });
  };

  let queued = false;
  addEventListener(
    'scroll',
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    },
    { passive: true },
  );
  addEventListener('resize', update);
  update();
}
