# Running AyuRaise on an Android device (APK)

The app is a TanStack Start (server-rendered) web app wrapped with **Capacitor**.
The Android app is a native shell that loads the running app over your Wi-Fi.
So two things must be true while you use it:

1. Your **PC dev server is running** — `npm run dev` (it listens on `0.0.0.0:8080`).
2. Your **phone and PC are on the same Wi-Fi**.

The PC's LAN IP is set in `capacitor.config.ts` → `server.url` (currently
`http://192.168.1.2:8080`). If your PC's IP changes, update it there and run
`npm run cap:sync`.

---

## One-time setup on your PC

### 1. Install Android Studio
Download and install from https://developer.android.com/studio
It includes the **Android SDK** and a bundled **JDK** — you don't need to install
Java separately.

On first launch, let the setup wizard install the default SDK. Then open
**Settings → Languages & Frameworks → Android SDK** and make sure these are checked:
- Android SDK Platform (latest, e.g. API 34/35)
- Android SDK Build-Tools
- Android SDK Platform-Tools  (this provides `adb`)
- Android SDK Command-line Tools

### 2. Point tools at the SDK (so command line works too)
Android Studio usually installs the SDK at:
`C:\Users\admin\AppData\Local\Android\Sdk`

Set these Windows environment variables (System → Environment Variables), then
reopen your terminal:
- `ANDROID_HOME = C:\Users\admin\AppData\Local\Android\Sdk`
- Add to `Path`: `%ANDROID_HOME%\platform-tools`

---

## Build & run on your phone

### Option A — open in Android Studio (easiest first time)
```
npm run dev          # keep this running in one terminal
npm run cap:open     # opens the android/ project in Android Studio
```
In Android Studio:
1. Plug in your phone via USB with **Developer options → USB debugging** enabled
   (Settings → About phone → tap "Build number" 7×, then Settings → System →
   Developer options → USB debugging).
2. Pick your device in the top toolbar and press **▶ Run**.
   The app installs and launches on the phone.

To get a shareable file instead: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
The APK lands in `android/app/build/outputs/apk/debug/app-debug.apk`.

### Option B — command line
```
npm run dev
npx cap run android         # builds, installs and launches on the connected device
```
Or build the APK directly:
```
cd android
./gradlew assembleDebug     # Windows: gradlew.bat assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk` — copy it to the phone
and tap to install (allow "install from unknown sources").

---

## After you change app code
Your UI changes are served by the dev server, so they show up on the phone on
**reload** — no rebuild needed. You only need to rebuild/re-sync the APK when you
change `capacitor.config.ts`, add a Capacitor plugin, or change the LAN IP:
```
npm run cap:sync
```

---

## Making it a standalone app (no PC required) — later
The current APK depends on your PC's dev server. To ship an app that works
anywhere, host the site on an **https** URL (Vercel / Netlify / Lovable), set
`server.url` to that URL, `npm run cap:sync`, and rebuild. (A fully offline
bundle would need a static build and moving the chat API to a hosted endpoint.)
