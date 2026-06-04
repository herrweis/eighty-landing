# eighty°

Pre-launch holding page for **eighty°** — a recovery and wellness space in central Bendigo. Opening August 2026.

A three-act holding page. Built with [Vite](https://vitejs.dev/) and [Sass](https://sass-lang.com/). **No framework and no scroll libraries** — native scroll only (no smooth-scroll, pinning, or scroll-scrubbing). The only enhancement JS is a small IntersectionObserver.

## Getting started

```bash
npm install
npm run dev      # dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## The three acts

1. **Hero** — `Find your ritual` · `Bendigo · Vic`, the `eighty°` block and `a place to recover.` cue. Settles in on load, then scrolls away naturally.
2. **The 80°** — fills the viewport (full width or height, whichever fits) and **sits fixed** via `position: sticky`. It line-draws (8 → 0 → °) tied to scroll position — drawing **in** as you scroll down and **out** as you scroll up — all while staying put.
3. **Keep me in the loop** — a full-height screen with the sign-up form centred; footer at the foot.

## Build approach

The **static, stacked page is the baseline** — it reads top-to-bottom and is fully usable with **no JS** or with **`prefers-reduced-motion: reduce`**. `motion.js` adds only two things, and only when motion is allowed (it adds `.is-animated` to `<html>`):

- maps the 80°'s line-draw to the scroll position (read in a throttled rAF, never `preventDefault`-ed), so it draws in/out reversibly, and
- fades the blurb in with the draw.

The 80° "sitting in place" is plain CSS `position: sticky`. There is no smooth-scroll, pinning-that-traps, or scrubbing — the browser scrolls natively; we only read the position.

```
index.html              # markup for all three acts + footer (content lives here)
src/
  main.js               # entry — wires up signup + motion
  signup.js             # form validation, stubbed submit, success state
  motion.js             # IntersectionObserver line-draw + reveals (no libraries)
  styles/
    _variables.scss     # tokens (Cedar, Linen, fonts, breakpoint)
    _reset.scss
    main.scss           # static layout (desktop + iPhone) then the motion layer
public/
  wordmark.svg          # eighty° wordmark (Figma vector)
  instagram.svg facebook.svg
  og.png                # placeholder share image (see TODO below)
```

## Design notes

- Implemented from the Figma file *"eighty° — exploration and playground"* (desktop **and** iPhone frames). Mobile follows the iPhone frames — the 80° bleeds past both screen edges and the footer drops the centred wordmark.
- Colours: **Cedar** `#766044`, **Linen** `#f4efe1`.
- Type: the Figma uses **Nitti** (commercial) and Inria Sans. Per the brief we use the brand fallback system — **Space Mono** for the spaced labels + form, **Space Grotesk** for the blurb — and keep the `eighty°` wordmark as the original Figma vector.
- The 80° is real Figma geometry rebuilt as inline SVG (two circles + a stadium + the degree circle, 5px stroke).

## Still stubbed (search `TODO`)

- **Sign-up endpoint** — `submitSignup()` in `src/signup.js` is a stub; no provider is wired and no secrets are committed. Point it at a serverless proxy (Mailchimp/Klaviyo/etc).
- **Social URLs** — Instagram/Facebook links point to `#`.
- **Share image** — `public/og.png` is a generated placeholder; swap in the final 1200×630.
