import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ayuraise.app",
  appName: "AyuRaise",
  // The static SPA produced by `CAP_BUILD=1 vite build` lands in dist/client.
  // `npm run build:cap` also aliases _shell.html -> index.html so the WebView
  // has an entry point.
  webDir: "dist/client",
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#f3eedd",
      showSpinner: false,
    },
    Keyboard: {
      // Resize the WebView (not just the layout) when the keyboard opens so
      // inputs in onboarding/login/chat stay visible.
      resize: "native",
    },
  },
};

export default config;
