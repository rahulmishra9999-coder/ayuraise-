// Self-contained static build for Cloudflare Pages (and any static host).
//
//   npm run build:pages
//
// Produces a client-only SPA in dist/client, ready to deploy:
//   - index.html / 404.html  (SPA shell, with noindex meta)
//   - _redirects             (SPA fallback: every path -> index.html)
//   - robots.txt             (keep it off search engines)
//
// It sets PAGES_BUILD/PAGES_BASE itself and runs `vite build`, so it works
// the same on your machine and in Cloudflare's CI with no extra env vars.
// Served at the domain root, so the base path defaults to "/".
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const base = process.env.PAGES_BASE || "/";
const outDir = join("dist", "client");

const env = { ...process.env, PAGES_BUILD: "1", PAGES_BASE: base };
console.log(`[build:pages] building static SPA (base="${base}") ...`);
execSync("node node_modules/vite/bin/vite.js build", { stdio: "inherit", env });

const shellPath = join(outDir, "_shell.html");
if (!existsSync(shellPath)) {
  console.error(`[build:pages] expected SPA shell at ${shellPath} but it was not produced.`);
  process.exit(1);
}

// Inject a robots noindex meta into the shell, then publish it as the
// index.html and the 404 fallback (GitHub/Cloudflare serve 404.html for
// unknown paths; Cloudflare also honours _redirects below).
let shell = readFileSync(shellPath, "latin1"); // byte-safe: the shell holds non-UTF8 bytes
if (!shell.includes('name="robots"')) {
  shell = shell.replace("<head>", '<head><meta name="robots" content="noindex, nofollow"/>');
}
writeFileSync(join(outDir, "index.html"), shell, "latin1");
writeFileSync(join(outDir, "404.html"), shell, "latin1");
writeFileSync(join(outDir, "_redirects"), "/*    /index.html    200\n");
writeFileSync(join(outDir, "robots.txt"), "User-agent: *\nDisallow: /\n");

console.log(`[build:pages] done -> ${outDir} (index.html, 404.html, _redirects, robots.txt)`);
