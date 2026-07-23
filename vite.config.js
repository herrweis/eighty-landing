import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Two entry points: the landing page and the /brand supplier asset sheet.
// Everything under /public (including /public/brand/*) is still copied to
// dist verbatim — dist/brand/index.html and the asset files sit side by side.
const entry = (path) => fileURLToPath(new URL(path, import.meta.url));

// The /brand *page* and the /public/brand/ *asset folder* share a path, which
// the dev server can't disambiguate: a bare /brand is claimed by the public-dir
// handler, while /brand/ resolves the page correctly. Normalising the URL up
// front — before any Vite middleware sees it — makes dev match the built site,
// where a static host resolves the directory to its index.html either way.
const brandTrailingSlash = {
  name: 'brand-trailing-slash',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/brand' || req.url.startsWith('/brand?')) {
        req.url = req.url.replace('/brand', '/brand/');
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [brandTrailingSlash],
  build: {
    rollupOptions: {
      input: {
        main: entry('index.html'),
        brand: entry('brand/index.html'),
      },
    },
  },
});
