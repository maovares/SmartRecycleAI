# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

---

# Firebase Config Files

`@react-native-firebase` reads config from native files — no `initializeApp()` call is needed in JS.

The files must exist in **both** locations:

| File | Native location (required by build) | Root copy (required by Expo) |
|---|---|---|
| Android | `android/app/google-services.json` | `google-services.json` |
| iOS | `ios/GoogleService-Info.plist` | `GoogleService-Info.plist` |

`app.json` must declare the path so the config plugin can find it:

```json
"android": {
  "googleServicesFile": "./google-services.json"
}
```

After adding or changing either file, do a clean build (see below).

---

# Clean Build (Android)

**When to run prebuild:**
- Added a new native package that has an Expo config plugin (e.g. `@react-native-firebase`, `expo-camera`, etc.)
- Changed `app.json` plugins, package name, or Firebase config paths
- Native files look out of sync with `app.json`

**When to skip prebuild (Gradle clean only):**
- No new native packages added, just code or asset changes
- Already ran prebuild recently and only need a fresh Gradle build

```powershell
# 1. Forward USB ports BEFORE building
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8082 tcp:8082

# 2a. If prebuild is needed — regenerates android/ from app.json plugins
cd C:\SmartRecycle\SmartRecycleAI
npx expo prebuild --platform android --clean

# 2b. If prebuild is NOT needed — just clean Gradle
cd C:\SmartRecycle\SmartRecycleAI\android
.\gradlew clean
cd ..

# 3. Build and install on device
npx expo run:android
```

---

# Running on Device via USB (local dev, no WiFi)

Use this when you want Metro to go through USB only (not WiFi/LAN).

```powershell
# 1. Forward USB ports
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8082 tcp:8082

# 2. Start Metro bound to localhost only
npx expo start --localhost --dev-client
```

On the device:
- Open the **SmartRecycleAI** dev client app
- If it does not connect automatically, shake the device → tap **Enter URL manually** → enter:
  ```
  http://localhost:8081
  ```

---

# Regenerar Assets (íconos y splash)

Los PNGs en `assets/` se generan desde `assets/icon.svg` usando el script `scripts/generate-assets.js`.

**Cuándo regenerar:**
- Se modificó `assets/icon.svg`
- Se necesita un nuevo tamaño o variante de ícono

```powershell
cd C:\SmartRecycle\SmartRecycleAI
node scripts/generate-assets.js
```

Esto sobreescribe los seis archivos:

| Archivo | Tamaño | Uso |
|---|---|---|
| `assets/icon.png` | 1024×1024 | iOS icon, Android fallback |
| `assets/splash-icon.png` | 1024×1024 | Pantalla de splash |
| `assets/favicon.png` | 48×48 | Web |
| `assets/android-icon-foreground.png` | 1024×1024 | Adaptive icon foreground |
| `assets/android-icon-background.png` | 1024×1024 | Adaptive icon fondo `#1B4332` |
| `assets/android-icon-monochrome.png` | 1024×1024 | Android 13+ theming |

**Dependencia:** `@resvg/resvg-js` (devDependency). Si no está instalada: `npm install`.

Después de regenerar, hacer un prebuild si cambió `icon.png` (Expo lo copia al bundle nativo).

---

# Verify Device is Connected

```powershell
adb devices
```

Expected output: one device listed with status `device` (not `unauthorized` or `offline`).
