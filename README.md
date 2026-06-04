# eighty°

Landing page for **eighty°** — recovery, sauna and contrast therapy in central Bendigo. Opening August 2026.

Built with [Vite](https://vitejs.dev/) and [Sass](https://sass-lang.com/), no framework.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Structure

```
index.html              # markup (the full landing page lives here)
src/
  main.js               # artboard scaling + sign-up handler
  styles/
    _variables.scss     # design tokens (Cedar, Linen, fonts)
    _reset.scss
    main.scss           # layout, mapped 1:1 from the Figma artboard
  assets/
    eighty-logo.svg     # wordmark (also inlined in index.html)
```

## Design notes

- Implemented from the Figma file *"eighty° — exploration and playground"*.
- The page is a fixed **1512 × 4661** artboard scaled to the viewport width via `main.js`.
- Colours: **Cedar** `#766044`, **Linen** `#f4efe1`.
- Fonts: **Inria Sans** (Google Fonts) for display, and **Spline Sans Mono**
  as a stand-in for **Nitti** (a commercial font used in the design). Drop a
  licensed Nitti webfont into `_variables.scss` → `$font-mono` to match exactly.
