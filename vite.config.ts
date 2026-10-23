// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// PAGES_BUILD=1 produces a static SPA build for GitHub Pages hosting at a
// repo subpath (no server / API routes). Normal dev & builds are unaffected.
const isPagesBuild = process.env.PAGES_BUILD === "1";
const pagesBase = process.env.PAGES_BASE || "/ayuraise-/";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(isPagesBuild ? { spa: { enabled: true } } : {}),
  },
  // For the static Pages build, disable nitro so TanStack Start emits a plain
  // SPA (dist/client) with its prerendered shell instead of a Cloudflare worker.
  ...(isPagesBuild ? { nitro: false, vite: { base: pagesBase } } : {}),
});
