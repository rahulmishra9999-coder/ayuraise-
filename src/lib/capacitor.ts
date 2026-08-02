// Native (Capacitor) runtime setup. This is a no-op on the web build:
// every call is guarded by Capacitor.isNativePlatform(), and the plugin
// imports are dynamic so they never run during SSR / on the web bundle.
//
// Wired up from the root component (see src/routes/__root.tsx).
import { Capacitor } from "@capacitor/core";

let initialized = false;

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export async function initNativeApp(): Promise<void> {
  if (initialized || !Capacitor.isNativePlatform()) return;
  initialized = true;

  // Marker class so CSS can target the native shell (safe areas, scroll, etc.).
  document.documentElement.classList.add("capacitor-native");
  document.documentElement.classList.add(`platform-${Capacitor.getPlatform()}`);

  const [{ StatusBar, Style }, { SplashScreen }, { App }, { Keyboard }] = await Promise.all([
    import("@capacitor/status-bar"),
    import("@capacitor/splash-screen"),
    import("@capacitor/app"),
    import("@capacitor/keyboard"),
  ]);

  // Let the WebView draw under the status bar so our own header handles the
  // safe-area inset (paired with env(safe-area-inset-top) in styles.css).
  try {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    // StatusBar is iOS/Android only; ignore where unsupported.
  }

  // Android hardware back button: navigate back in the SPA history, or exit
  // the app when there's nowhere to go.
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack || window.history.length > 1) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });

  // Add a class while the keyboard is open so fixed bars can lift if needed.
  Keyboard.addListener("keyboardWillShow", () => {
    document.documentElement.classList.add("keyboard-open");
  });
  Keyboard.addListener("keyboardWillHide", () => {
    document.documentElement.classList.remove("keyboard-open");
  });

  // Hide the splash once the app shell is interactive.
  try {
    await SplashScreen.hide();
  } catch {
    // ignore
  }
}
