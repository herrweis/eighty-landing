# eighty°

Pre-launch holding page for **eighty°** — a recovery and wellness space in central Bendigo. Opening August 2026.

A single scroll-driven sequence told in three acts. Built with [Vite](https://vitejs.dev/) and [Sass](https://sass-lang.com/), with [GSAP](https://gsap.com/) + ScrollTrigger and [Lenis](https://lenis.studio/) for the motion. No framework.

## Getting started

```bash
npm install
npm run dev      # dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## The three acts

1. **Hero** — the top row (`Find your ritual` · `Bendigo · Vic`) pins; the `eighty°` block and cue travel up. When the wordmark meets the top row, both leave the top together and the screen clears.
2. **The 80°** — line-draws itself (SVG `stroke-dashoffset`, scrubbed to scroll, drawing 8 → 0 → °) as it rises into view; the blurb lands as the draw nears completion.
3. **Keep me in the loop** — the stack scrolls up and the sign-up form + footer reveal, with at least half a viewport of breathing room above the form.

## Build approach

The **static, stacked page is the baseline** — it reads top-to-bottom and is fully usable with **no JS** or with **`prefers-reduced-motion: reduce`**. `motion.js` layers the scroll choreography on top only when motion is allowed (it adds `.is-animated` to `<html>`; if it can't initialise, the page silently stays static).

```
index.html              # markup for all three acts + footer (content lives here)
src/
  main.js               # entry — wires up signup + motion
  signup.js             # form validation, stubbed submit, success state
  motion.js             # GSAP + ScrollTrigger + Lenis, guarded by reduced-motion
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
- **Privacy line** — placeholder copy under the form; confirm wording with the client.
- **Social URLs** — Instagram/Facebook links point to `#`.
- **Share image** — `public/og.png` is a generated placeholder; swap in the final 1200×630.
