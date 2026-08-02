// Post-build step for the Capacitor (native) bundle.
//
// TanStack Start's SPA mode emits the client shell as `dist/client/_shell.html`.
// Capacitor's WebView boots from `index.html`, so we alias the shell to that
// name. All in-app navigation is client-side (TanStack Router), so a single
// index.html entry is all the native shell needs.
import { copyFile, access } from "node:fs/promises";
import { join } from "node:path";

const clientDir = join(process.cwd(), "dist", "client");
const shell = join(clientDir, "_shell.html");
const indexHtml = join(clientDir, "index.html");

try {
  await access(shell);
} catch {
  console.error(
    `[cap-postbuild] Expected ${shell} to exist. Did you run with CAP_BUILD=1 (SPA mode)?`,
  );
  process.exit(1);
}

await copyFile(shell, indexHtml);
console.log("[cap-postbuild] Wrote dist/client/index.html from _shell.html");
