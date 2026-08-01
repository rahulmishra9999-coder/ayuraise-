import type { CapacitorConfig } from "@capacitor/cli";

// AyuRaise is a TanStack Start (server-rendered) app, so the APK is a native
// shell that loads the running app over the network. During development it
// points at the Vite dev server on your PC's LAN IP.
//
//  • Phone and PC must be on the SAME Wi-Fi.
//  • The dev server must be running:  npm run dev   (listens on 0.0.0.0:8080)
//  • If your PC's IP changes, update `server.url` below and run `npx cap sync`.
//
// To ship a standalone app later (no PC needed), deploy the site to an https URL
// and set server.url to that — or switch to a fully static build.
const config: CapacitorConfig = {
  appId: "com.ayuraise.app",
  appName: "AyuRaise",
  webDir: "capacitor-www",
  server: {
    url: "http://192.168.1.2:8080",
    cleartext: true,
  },
};

export default config;
