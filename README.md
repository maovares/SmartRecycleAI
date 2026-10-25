# SmartRecycleAI — Aplicación Móvil

> Aplicación móvil multiplataforma de clasificación inteligente de residuos asistida por inteligencia artificial, orientada a la gestión sostenible de desechos en Costa Rica.

---

## Tabla de Contenidos

1. [Descripción General](#1-descripción-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Sistema de Diseño](#4-sistema-de-diseño)
5. [Requisitos del Entorno](#5-requisitos-del-entorno)
6. [Estructura del Proyecto](#6-estructura-del-proyecto)
7. [Módulos y Componentes](#7-módulos-y-componentes)
8. [Flujos de Datos](#8-flujos-de-datos)
9. [Base de Datos (Firestore)](#9-base-de-datos-firestore)
10. [Autenticación](#10-autenticación)
11. [Gamificación y Métricas Ambientales](#11-gamificación-y-métricas-ambientales)
12. [Configuración e Instalación](#12-configuración-e-instalación)
13. [Variables de Entorno](#13-variables-de-entorno)
14. [Construcción y Despliegue](#14-construcción-y-despliegue)
15. [Compatibilidad y Polyfills](#15-compatibilidad-y-polyfills)
16. [Capturas de Pantalla](#16-capturas-de-pantalla)

---

## 1. Descripción General

**SmartRecycleAI** es una aplicación móvil desarrollada con React Native y Expo que permite a los usuarios fotografiar residuos y recibir, en tiempo real, una clasificación automática del material, instrucciones de reciclaje adaptadas al contexto costarricense, métricas de impacto ambiental y la ubicación de los centros de acopio más cercanos.

El sistema combina tres servicios externos principales:

| Servicio | Rol |
|---|---|
| **Firebase Authentication** | Autenticación de usuarios por correo electrónico |
| **Firebase Firestore** | Persistencia de perfiles, historial y estadísticas |
| **SmartRecycleBackend** | API REST propia: clasificación con Gemini 2.5 Flash y búsqueda de centros de acopio |

La aplicación sigue un modelo cliente–servidor donde el procesamiento de imágenes y la lógica de inteligencia artificial residen completamente en el backend, manteniendo la aplicación ligera y la API key de Gemini fuera del cliente.

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura General

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENTE MÓVIL                             │
│                    (React Native + Expo)                          │
│                                                                  │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────────┐  │
│  │  Navigation │   │   Screens    │   │      Contexts        │  │
│  │  (Stack +   │──▶│  (8 vistas) │──▶│  AuthContext         │  │
│  │  BottomTab) │   │              │   │  LocationContext      │  │
│  └─────────────┘   └──────┬───────┘   └──────────────────────┘  │
│                           │                                      │
│                    ┌──────▼───────┐                              │
│                    │   Services   │                              │
│                    │ apiService   │                              │
│                    │ authService  │                              │
│                    │storageService│                              │
│                    └──────┬───────┘                              │
└───────────────────────────┼──────────────────────────────────────┘
                            │ HTTPS
          ┌─────────────────┼─────────────────────┐
          │                 │                     │
          ▼                 ▼                     ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Firebase   │  │ SmartRecycle     │  │  Google Places   │
│     Auth     │  │    Backend       │  │      API         │
│  (ID Token)  │  │  (FastAPI)       │  │  (centros de     │
└──────────────┘  │                  │  │   acopio)        │
                  │  /ai/analyze     │  └──────────────────┘
┌──────────────┐  │  /centers/nearby │
│  Firestore   │  │                  │  ┌──────────────────┐
│  (NoSQL DB)  │  │  Gemini 2.5 Flash│  │  Google Gemini   │
│  - users     │  │  (clasificación) │──▶│     2.5 Flash    │
│  - history   │  └──────────────────┘  │   (Vision AI)    │
└──────────────┘                        └──────────────────┘
```

### 2.2 Arquitectura de Capas (Frontend)

```
┌────────────────────────────────────────────────┐
│          CAPA DE PRESENTACIÓN                  │
│   Screens: Login, Verify, Home, Scan,          │
│   Result, Centers, History, Profile            │
├────────────────────────────────────────────────┤
│          CAPA DE DISEÑO (Design System)        │
│   src/theme/index.js — colores MD3, tipografía │
│   DM Sans · escala de espaciado · sombras      │
├────────────────────────────────────────────────┤
│          CAPA DE NAVEGACIÓN                    │
│   NativeStack Navigator (Auth) + BottomTab     │
├────────────────────────────────────────────────┤
│          CAPA DE ESTADO GLOBAL                 │
│   AuthContext + LocationContext (React Context)│
├────────────────────────────────────────────────┤
│          CAPA DE SERVICIOS                     │
│   apiService / authService / storageService    │
├────────────────────────────────────────────────┤
│          CAPA DE ACCESO A DATOS                │
│   Firebase SDK · Axios HTTP · Expo APIs        │
└────────────────────────────────────────────────┘
```

### 2.3 Navegación

```
AppNavigator (Stack)
│
├── LoginScreen           ← No autenticado
├── VerifyScreen          ← Autenticado, email no verificado
│
└── Main (BottomTabNavigator)
    ├── Tab: Home         ← Dashboard con estadísticas y historial reciente
    ├── Tab: Scan         ← Cámara + análisis de imagen
    ├── Tab: Centers      ← Mapa de centros de acopio cercanos
    ├── Tab: Profile      ← Perfil, nivel, materiales, configuración
    │
    ├── Modal: Result     ← Resultado del análisis de IA
    └── Modal: History    ← Historial completo de escaneos
```

---

## 3. Stack Tecnológico

### 3.1 Framework y Runtime

| Tecnología | Versión | Rol |
|---|---|---|
| **React Native** | 0.85.3 | Framework de UI nativa multiplataforma |
| **Expo SDK** | ~56.0.8 | Plataforma de desarrollo y build nativo |
| **React** | 19.2.3 | Librería de componentes UI |
| **Node.js** | ≥ 18 | Entorno de ejecución para herramientas |
| **Hermes** | bundled | Motor JavaScript optimizado para móvil |

### 3.2 Navegación

| Paquete | Versión | Rol |
|---|---|---|
| `@react-navigation/native` | 7.2.5 | Core de navegación |
| `@react-navigation/native-stack` | 7.17.1 | Navegador de pila nativo (JSI, sin puente JS) |
| `@react-navigation/stack` | 7.9.3 | Navegador de pila JS (mantenido como dependencia) |
| `@react-navigation/bottom-tabs` | 7.16.2 | Barra de pestañas inferior |
| `react-native-screens` | 4.25.2 | Optimización de pantallas nativas |
| `react-native-safe-area-context` | ~5.7.0 | Áreas seguras e insets (edge-to-edge Android) |
| `react-native-gesture-handler` | ~2.24.0 | Gestos táctiles nativos |

### 3.3 Firebase

| Paquete | Versión | Rol |
|---|---|---|
| `@react-native-firebase/app` | 24.0.0 | Core Firebase SDK nativo |
| `@react-native-firebase/auth` | 24.0.0 | Autenticación Firebase |
| `@react-native-firebase/firestore` | 24.0.0 | Base de datos NoSQL en tiempo real |

### 3.4 Funcionalidades de Dispositivo (Expo)

| Paquete | Versión | Rol |
|---|---|---|
| `expo-camera` | ~56.0.7 | Acceso a cámara nativa |
| `expo-image-picker` | ~56.0.15 | Selección desde galería |
| `expo-image-manipulator` | ~56.0.17 | Compresión y redimensionado de imagen |
| `expo-location` | ~56.0.15 | Coordenadas GPS del dispositivo |
| `expo-secure-store` | ~56.0.4 | Almacenamiento cifrado de credenciales |
| `expo-splash-screen` | ~56.0.10 | Pantalla de carga nativa (cargada hasta que las fuentes estén listas) |
| `expo-status-bar` | ~56.0.4 | Control de barra de estado |
| `expo-font` | ^56.0.5 | Carga de fuentes personalizadas en runtime |

### 3.5 Comunicación HTTP y UI

| Paquete | Versión | Rol |
|---|---|---|
| `axios` | 1.17.0 | Cliente HTTP con interceptores |
| `@expo/vector-icons` | 15.0.2 | Iconografía (Ionicons) |
| `@expo-google-fonts/dm-sans` | ^0.4.2 | Familia tipográfica DM Sans (400/500/600/700/800) |
| `@expo-google-fonts/dm-serif-display` | ^0.4.2 | Fuente display DM Serif Display (headers de alto impacto) |

### 3.6 Herramientas de Build

| Herramienta | Versión | Rol |
|---|---|---|
| **Gradle** | 9.3.1 | Build system Android |
| **AGP** (Android Gradle Plugin) | via RN | Compilación APK/AAB |
| **CMake** | 3.22.1 | Build de código nativo C++ |
| **NDK** | 27.1.12297006 | Compilación de código nativo |
| **EAS Build** | CLI | Servicio cloud de compilación Expo |

---

## 4. Sistema de Diseño

La aplicación implementa un sistema de diseño propio alineado con **Material Design 3** (M3), definido en `src/theme/index.js`. Todos los componentes y pantallas importan tokens desde este módulo en lugar de usar valores literales.

### 4.1 Paleta de Colores (Roles M3)

| Token | Hex | Rol M3 | Uso |
|---|---|---|---|
| `forest` | `#1B4332` | primary | Headers, botones rellenos, textos de marca |
| `canopy` | `#2A7850` | secondary | Etiquetas activas, acentos de soporte |
| `sage` | `#62B88E` | decorative | Íconos, ilustraciones |
| `sageFaint` | `#D0EDDF` | primaryContainer | Indicadores de selección en tab bar, badges |
| `amber` | `#F07058` | tertiary | Acento coral — EcoPoints, botones primarios de acción |
| `amberDark` | `#D35640` | tertiary pressed | Estado pulsado del acento |
| `amberLight` | `#FDE8E2` | tertiaryContainer | Fondos suaves de acento |
| `bark` | `#F5FBF4` | background | Fondo general de la app (tono 98, tinte verde) |
| `surface` | `#FFFFFF` | surface | Tarjetas y contenedores |
| `stone100` | `#DCE9E4` | outlineVariant | Divisores y bordes sutiles |
| `outline` | `#6B7C74` | outline | Bordes de componentes interactivos |
| `ink` | `#111D1A` | onSurface | Texto principal |

### 4.2 Tipografía

| Token | Fuente | Uso |
|---|---|---|
| `font.display` | DMSans_700Bold | Títulos de pantalla |
| `font.regular` | DMSans_400Regular | Cuerpo de texto |
| `font.medium` | DMSans_500Medium | Etiquetas y subtítulos |
| `font.semibold` | DMSans_600SemiBold | Datos numéricos destacados |
| `font.bold` | DMSans_700Bold | Encabezados de sección |
| `font.extrabold` | DMSans_800ExtraBold | Cifras de impacto, EcoPoints |

La carga de fuentes ocurre en `App.js` mediante `useFonts()` de `expo-font`. La splash screen permanece visible hasta que las fuentes estén disponibles.

### 4.3 Escala de Espaciado y Formas

```
Espaciado (space): xs=4 · sm=8 · md=12 · lg=16 · xl=24 · xxl=32 · xxxl=48
Tamaño de fuente (size): xs=11 · sm=13 · base=15 · md=17 · lg=20 · xl=24 · xxl=32
Radio (radius — M3 shape scale): xs=4 · sm=8 · md=12 · lg=16 · pill=100
```

### 4.4 Sombras

Las sombras usan `shadowColor: '#1B4332'` (primario) en lugar del negro genérico, para coherencia con la paleta:

| Token | elevation | Uso |
|---|---|---|
| `shadow.sm` | 2 | Tarjetas secundarias, tab bar |
| `shadow.md` | 4 | Tarjetas principales, modales |
| `shadow.lg` | 8 | Sheets, overlays flotantes |

### 4.5 Tab Bar con Indicador de Selección

El tab bar implementa el patrón M3 de **pill indicator**: el ítem activo muestra un fondo `sageFaint` redondeado detrás del ícono, y usa la variante rellena del ícono Ionicons. Los insets de la barra de navegación de Android (edge-to-edge) se gestionan con `useSafeAreaInsets()`.

---

## 5. Requisitos del Entorno

### 4.1 Requisitos de Desarrollo

| Requisito | Versión mínima | Notas |
|---|---|---|
| **Node.js** | 18 LTS | Recomendado: 20 LTS |
| **npm** | 9+ | O Yarn 3+ |
| **Expo CLI** | latest | `npm install -g expo-cli` |
| **Android Studio** | Hedgehog+ | Solo para build nativo local |
| **JDK** | 17 | Requerido por Gradle 9 |
| **ADB** | platform-tools | Para debug en dispositivo físico |

### 4.2 Cuentas y Servicios Externos

| Servicio | Propósito | URL |
|---|---|---|
| **Firebase Project** | Auth + Firestore | console.firebase.google.com |
| **Google AI Studio** | Gemini API Key | aistudio.google.com |
| **Google Cloud Console** | Places API Key | console.cloud.google.com |
| **Expo EAS** | Build y distribución | expo.dev |

### 4.3 Dispositivo / Emulador

| Plataforma | Versión mínima |
|---|---|
| **Android** | API 24 (Android 7.0 Nougat) |
| **iOS** | 16.0 |

---

## 6. Estructura del Proyecto

```
SmartRecycleAI/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js        # Autenticación (login + registro)
│   │   ├── VerifyScreen.js       # Verificación de correo electrónico
│   │   ├── HomeScreen.js         # Dashboard principal con estadísticas
│   │   ├── ScanScreen.js         # Cámara + captura + análisis
│   │   ├── ResultScreen.js       # Resultado del análisis de IA
│   │   ├── CentersScreen.js      # Lista de centros de acopio cercanos
│   │   ├── HistoryScreen.js      # Historial completo de escaneos
│   │   └── ProfileScreen.js      # Perfil enriquecido: nivel, agua, tasa de reciclaje
│   ├── services/
│   │   ├── apiService.js         # Llamadas al backend (análisis + centros con caché)
│   │   ├── authService.js        # Firebase Auth (login, registro, verificación)
│   │   └── storageService.js     # Firestore (perfil, historial, foto, estadísticas)
│   ├── context/
│   │   ├── AuthContext.js        # Estado global de autenticación + refreshUser
│   │   └── LocationContext.js    # Estado global de ubicación GPS
│   ├── navigation/
│   │   └── AppNavigator.js       # NativeStack + BottomTab con pill indicator MD3
│   ├── theme/
│   │   └── index.js              # Design system: colores MD3, tipografía, espaciado
│   └── components/
│       ├── EcoPointsBadge.js     # Badge de EcoPoints (compacto/grande)
│       └── LoadingOverlay.js     # Overlay de carga con mensaje
├── android/                      # Código nativo Android (generado por Expo)
│   ├── app/
│   │   ├── build.gradle          # Config de build Android
│   │   └── google-services.json  # Config Firebase Android
│   ├── build.gradle              # Config root Gradle
│   ├── settings.gradle           # Módulos del proyecto
│   └── gradle/wrapper/
│       └── gradle-wrapper.properties  # Gradle 9.3.1
├── assets/
│   ├── icon.png                        # Ícono principal (hoja verde + acento amber)
│   ├── splash-icon.png                 # Ícono de splash screen
│   ├── android-icon-background.png     # Fondo del ícono adaptable Android
│   ├── android-icon-foreground.png     # Primer plano del ícono adaptable
│   └── android-icon-monochrome.png     # Variante monocromática (Android 13+)
├── scripts/
│   └── gen_icons.py              # Script Python para generar variantes de íconos
├── plugins/
│   └── withAndroidApkName.js     # Plugin Expo: renombra el APK de salida
├── App.js                        # Componente raíz + carga de fuentes DM Sans
├── index.js                      # Entry point con polyfills
├── polyfills.js                  # Polyfills de APIs del navegador
├── app.json                      # Configuración Expo (metadata, plugins)
├── package.json                  # Dependencias npm
├── google-services.json          # Config Firebase (requerida por Expo)
└── .env                          # Variables de entorno (no commitear)
```

---

## 7. Módulos y Componentes

### 7.1 Pantallas (Screens)

| Pantalla | Descripción | Características Principales |
|---|---|---|
| **LoginScreen** | Entrada al sistema | Email/contraseña, toggle visibilidad, errores Firebase |
| **VerifyScreen** | Puerta de verificación | Reenvío de correo, verificación en tiempo real, logout |
| **HomeScreen** | Dashboard | Tarjetas de estadísticas (scans, CO2, puntos), historial reciente (3 items), pull-to-refresh, paleta MD3 |
| **ScanScreen** | Interfaz de cámara | Cámara en vivo, zoom por tap, captura, galería, mensajes de carga secuenciales, envío al backend |
| **ResultScreen** | Resultado IA | Badge reciclable/no reciclable, instrucciones (3 pasos), impacto ambiental, centros cercanos |
| **CentersScreen** | Mapa de centros | Lista de centros de acopio, distancia, dirección, estado (abierto/cerrado), apertura en Maps |
| **HistoryScreen** | Historial | Lista paginada (máx. 50), fecha, material, puntos; tap para ver detalle |
| **ProfileScreen** | Perfil enriquecido | Avatar editable, nivel gamificado con barra de progreso, agua ahorrada, tasa de reciclaje, desglose por material, logout, eliminar datos |

### 7.2 Servicios

#### `apiService.js`
Gestiona toda la comunicación con el backend propio.

```
analyzeImage(imageUri, idToken)
  1. Redimensiona imagen a 600px de ancho
  2. Comprime a calidad 0.45 (JPEG)
  3. Empaqueta en FormData multipart
  4. POST /ai/analyze-image con Bearer token
  5. Retorna: { material, object, recyclable, instructions, impact, points }

fetchNearbyCenters(lat, lng)
  Caché en memoria (TTL 5 min, delta ~100m):
    └── Hit: retorna datos cacheados sin llamada de red
    └── Miss: GET /centers/nearby?lat={lat}&lng={lng} → guarda en caché
  Retorna: centers[]
```

#### `authService.js`
Abstrae Firebase Authentication.

```
login(email, password)         → signInWithEmailAndPassword
register(email, password)      → createUserWithEmailAndPassword + sendEmailVerification
resendVerification()           → sendEmailVerification
checkEmailVerified()           → reload() + currentUser.emailVerified
logout()                       → signOut
getIdToken()                   → currentUser.getIdToken(true)
```

#### `storageService.js`
Abstrae Firestore para perfil e historial.

```
getUserProfile(uid)              → getDoc(users/{uid}), crea perfil por defecto si no existe
saveRecycleHistory(uid, result)  → addDoc(history) + updateDoc(users) en paralelo
                                    incrementa: ecoPoints, totalScans, totalCo2,
                                               totalWater, recyclableCount, materials
getRecentHistory(uid, count)     → query(history, orderBy desc, limit count)
getFullHistory(uid)              → query(history, orderBy desc, limit 50)
updateEcoPoints(uid, points)     → updateDoc con increment(points)
updateUserPhoto(uid, photoBase64)→ updateDoc users/{uid} con campo photoBase64
updateUserProfileFields(uid, f)  → updateDoc users/{uid} con campos arbitrarios
resetUserData(uid)               → deleteDoc en history + setDoc en users (campos a 0)
```

### 7.3 Contextos

| Contexto | Estado | Métodos |
|---|---|---|
| **AuthContext** | `user`, `loading`, `ecoPoints` | `setEcoPoints()`, `refreshUser()` |
| **LocationContext** | `coords`, `placeName`, `permissionGranted` | `refresh()` |

> `refreshUser()` fuerza un re-render de todos los consumidores del contexto tras actualizar `displayName` o `photoURL` en Firebase Auth, sin necesidad de cerrar sesión.

### 7.4 Componentes Reutilizables

| Componente | Descripción |
|---|---|
| **EcoPointsBadge** | Muestra puntos acumulados con ícono de hoja; variantes compacto y grande |
| **LoadingOverlay** | Overlay de pantalla completa con spinner y mensaje "Analizando con IA..." |

---

## 8. Flujos de Datos

### 8.1 Flujo de Análisis de Imagen

```
Usuario captura foto (cámara / galería)
          │
          ▼
  expo-image-manipulator
  Redimensiona: 600px ancho  ← optimizado
  Comprime: calidad 0.45 (JPEG)
          │
          ▼
  apiService.analyzeImage()
  FormData multipart + Bearer Token
  POST → /ai/analyze-image
          │
          ▼
  SmartRecycleBackend
  Verifica token Firebase
  Gemini 2.5 Flash analiza imagen
  Retorna JSON estructurado
          │
          ▼
  ResultScreen renderiza:
  ├── Material y tipo de objeto
  ├── Badge reciclable / no reciclable
  ├── 3 instrucciones de disposición
  ├── Impacto: CO2 (kg) y agua (L)
  ├── EcoPoints ganados
  └── Centros de acopio cercanos
          │
          ▼
  storageService.saveRecycleHistory()
  ├── Guarda en users/{uid}/history
  └── Actualiza users/{uid}:
      ecoPoints, totalScans, totalCo2,
      totalWater, recyclableCount, materials
```

### 8.2 Flujo de Autenticación

```
LoginScreen
├── login()  → Firebase Auth → verifica emailVerified
│   ├── emailVerified = true  → navega a Main
│   └── emailVerified = false → navega a VerifyScreen
│
└── register() → Firebase Auth → sendEmailVerification → VerifyScreen

VerifyScreen
├── checkEmailVerified() cada vez que el usuario regresa
│   ├── verificado → navega a Main
│   └── no verificado → mantiene pantalla
└── resendVerification() → nuevo correo de verificación
```

### 8.3 Flujo de Ubicación

```
LocationContext (carga al iniciar)
  │
  ├── requestForegroundPermissionsAsync()
  │   └── permiso denegado → permissionGranted = false
  │
  └── getCurrentPositionAsync({ accuracy: Balanced })
      ├── coords = { latitude, longitude }
      └── reverseGeocodeAsync() → placeName (ciudad, país)

CentersScreen / ResultScreen
  └── apiService.fetchNearbyCenters(coords.latitude, coords.longitude)
      ├── Verifica caché en memoria (TTL 5 min, delta ~100 m)
      │   └── Hit: retorna sin llamada de red
      └── Miss: GET /centers/nearby → guarda en caché → Lista por distancia (Haversine)
```

---

## 9. Base de Datos (Firestore)

### 9.1 Colección `users`

Documento por usuario (ID = Firebase UID).

```json
{
  "uid": "string",
  "ecoPoints": 150,
  "totalScans": 23,
  "totalCo2": 4.75,
  "totalWater": 187.5,
  "recyclableCount": 19,
  "photoBase64": "data:image/jpeg;base64,...",
  "materials": {
    "PET": 8,
    "Aluminio": 5,
    "Vidrio": 3,
    "Papel": 4,
    "Cartón": 3
  },
  "createdAt": "Timestamp"
}
```

> `totalWater` acumula el agua ahorrada (litros) por cada ítem reciclado.  
> `recyclableCount` permite calcular la tasa de reciclaje (`recyclableCount / totalScans`).  
> `photoBase64` almacena la foto de perfil del usuario directamente en Firestore.

### 9.2 Subcolección `users/{uid}/history`

Un documento por escaneo.

```json
{
  "object": "Botella de refresco",
  "material": "PET",
  "recyclable": true,
  "instructions": [
    "Enjuaga la botella con agua.",
    "Retira la etiqueta y aplástala.",
    "Deposítala en el contenedor amarillo o llévala al centro de acopio."
  ],
  "impact": {
    "co2_kg": 0.35,
    "water_l": 12.5
  },
  "points": 7,
  "timestamp": "Timestamp"
}
```

### 9.3 Reglas de Seguridad (Firestore)

```
Lectura/escritura permitida únicamente al usuario propietario del UID.
Autenticación requerida para cualquier operación.
```

---

## 10. Autenticación

El sistema usa **Firebase Authentication** con proveedor de **correo electrónico y contraseña**. El flujo incluye verificación de email como requisito previo al acceso a la aplicación.

### Token de Sesión

Cada llamada al backend incluye el **Firebase ID Token** en el header `Authorization: Bearer {idToken}`. El token tiene validez de **1 hora** y se renueva automáticamente.

```
Cliente                     Firebase Auth               Backend
  │─── getIdToken() ──────────────▶│                      │
  │◀── ID Token (JWT) ────────────│                      │
  │─── POST /ai/analyze-image ─────────────────────────▶ │
  │    Authorization: Bearer {token}                      │
  │                                          verifyIdToken│
  │                                         (Firebase SDK)│
  │◀── Respuesta JSON ──────────────────────────────────── │
```

---

## 11. Gamificación y Métricas Ambientales

### 11.1 Sistema de Niveles (EcoPoints)

| Nivel | Rango de Puntos | Insignia |
|---|---|---|
| Semilla | 0 – 49 | Principiante |
| Brote | 50 – 149 | En crecimiento |
| Árbol | 150 – 349 | Reciclador activo |
| Bosque | 350 – 699 | Experto ambiental |
| Guardián | 700+ | Máximo nivel |

### 11.2 Asignación de Puntos por Material

Los puntos (1–10) son asignados por el modelo Gemini 2.5 Flash según el tipo de material y la dificultad de reciclaje.

### 11.3 Impacto Ambiental

El backend calcula y retorna métricas estimadas por ítem reciclado:

| Métrica | Unidad | Descripción | Campo en Firestore |
|---|---|---|---|
| `co2_kg` | kg CO₂ | Emisiones evitadas al no enviar al relleno sanitario | `totalCo2` |
| `water_l` | litros | Agua ahorrada en la producción de material virgen | `totalWater` |

Ambas métricas se acumulan en el perfil del usuario y se muestran en la pantalla de perfil.

### 11.4 Tasa de Reciclaje

La pantalla de perfil calcula y muestra la tasa de reciclaje del usuario:

```
tasa = (recyclableCount / totalScans) × 100 %
```

Este indicador refleja qué porcentaje de los ítems escaneados resultaron ser reciclables, y se presenta junto a la barra de progreso de nivel.

### 11.5 Colores por Material

```javascript
PET        → #2196F3  (azul)
Aluminio   → #9E9E9E  (gris)
Vidrio     → #4CAF50  (verde claro)
Papel      → #FF9800  (naranja)
Cartón     → #795548  (marrón)
Electrónico→ #F44336  (rojo)
```

---

## 12. Configuración e Instalación

### 12.1 Clonar el Repositorio

```bash
git clone <repo-url>
cd SmartRecycle/SmartRecycleAI
```

### 12.2 Instalar Dependencias

```bash
npm install
```

### 12.3 Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Habilitar **Authentication** → Proveedor: Correo electrónico/contraseña.
3. Crear base de datos **Firestore** en modo producción.
4. Descargar `google-services.json` (Android) y colocarlo en:
   - `SmartRecycleAI/google-services.json` (raíz del proyecto)
   - `SmartRecycleAI/android/app/google-services.json` (build nativo)

### 12.4 Configurar Variables de Entorno

Crear archivo `.env` en la raíz:

```env
EXPO_PUBLIC_API_URL=https://your-backend.onrender.com
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

### 12.5 Ejecutar en Desarrollo

```bash
# Iniciar Metro Bundler
npx expo start

# En dispositivo físico (USB) - recomendado
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8082 tcp:8082
npx expo start --localhost --dev-client

# Build y ejecución directa en Android
npx expo run:android
```

---

## 13. Variables de Entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Sí | URL base del backend SmartRecycleBackend |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Sí | API Key del proyecto Firebase |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Sí | Dominio de autenticación Firebase |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Sí | ID del proyecto Firebase |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Sí | Bucket de Storage Firebase |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sí | Sender ID para notificaciones |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Sí | App ID de Firebase |

> Las variables prefijadas con `EXPO_PUBLIC_` son accesibles en el bundle del cliente. No incluir secretos en estas variables.

---

## 14. Construcción y Despliegue

### 14.1 Build Local (Android Debug)

```powershell
# 1. Reenviar puertos USB
adb reverse tcp:8081 tcp:8081

# 2. Si hay cambios en plugins nativos: regenerar android/
npx expo prebuild --platform android --clean

# 3. Limpiar caché de Gradle
cd android
.\gradlew clean
cd ..

# 4. Compilar e instalar
npx expo run:android
```

### 14.2 Build en la Nube (EAS Build)

```bash
# Build de desarrollo (APK)
eas build --profile development --platform android

# Build de producción (AAB)
eas build --profile production --platform android
```

### 14.3 Configuración EAS (`eas.json`)

```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "production": { "android": { "buildType": "apk" } }
  }
}
```

### 14.4 Plugin Personalizado: Renombre de APK

El plugin `plugins/withAndroidApkName.js` modifica automáticamente `android/app/build.gradle` para nombrar el APK de salida como:

```
SmartRecycleAI-v{versionName}-{buildType}.apk
```

---

## 15. Compatibilidad y Polyfills

React Native carece de algunas APIs del navegador. El archivo `polyfills.js` las inyecta al inicio de la aplicación:

| API | Razón |
|---|---|
| `FormData` | Envío de imágenes multipart al backend |
| `AbortSignal` / `AbortController` | Cancelación de peticiones HTTP |
| `Headers` | Manejo de cabeceras HTTP |
| `WebSocket` | Implementación nativa de RN |
| `URL` / `URLSearchParams` | Parsing de URLs en servicios |
| `window` | Referencia al entorno global |
| `performance` | API de temporización |
| `setImmediate` / `clearImmediate` | Compatibilidad con librerías Node |

---

## 16. Capturas de Pantalla

| Pantalla | Descripción |
|---|---|
| Home | Dashboard con EcoPoints, total de escaneos, CO2 evitado e historial reciente |
| Scan | Visor de cámara en tiempo real, zoom por tap, botones de captura y galería |
| Result | Tarjeta con clasificación IA, instrucciones, impacto ambiental y centros cercanos |
| Centers | Lista de centros de acopio con nombre, distancia, dirección y estado |
| Profile | Perfil con avatar editable, nivel + barra de progreso, agua ahorrada, tasa de reciclaje y desglose por material |

---

## Descarga y uso

La versión más reciente de la aplicación (APK para Android) y el código fuente se descargan desde la sección **Releases**:

**[Descargar la última versión](https://github.com/maovares/SmartRecycleAI/releases/latest)**

| Archivo | Contenido |
|---|---|
| `SmartRecycle-v*.apk` | Aplicación instalable en Android (habilite la instalación desde orígenes desconocidos) |
| `Source code (zip / tar.gz)` | Código fuente de esa versión |

La aplicación requiere el servicio [SmartRecycleBackend](https://github.com/maovares/SmartRecycleBackend) para clasificar residuos y localizar centros de acopio.

---

## Licencia y política de uso

Este proyecto es **software libre** bajo la [licencia MIT](LICENSE). Usted puede usar, copiar, modificar, fusionar, publicar, distribuir y sublicenciar el software, incluso con fines comerciales, **siempre que conserve el aviso de copyright y la mención a los autores** en todas las copias o partes sustanciales del software.

---

## Créditos

Desarrollado como proyecto de investigación aplicada para la gestión de residuos sólidos en Costa Rica, integrando técnicas de visión por computadora e inteligencia artificial generativa para el fomento de hábitos de reciclaje.

- **Autores:** Marcos Antonio Rodríguez Ovares (ma.rodriguez@itcr.ac.cr) y Kevin Said Reyes Quesada (k.reyes.1@estudiantec.cr)
- **Institución:** Instituto Tecnológico de Costa Rica
- **Año:** 2025–2026

### Cómo citar

M. Rodríguez Ovares y K. S. Reyes Quesada, "SmartRecycle AI: Plataforma Móvil de Reciclaje Inteligente Basada en Visión Computacional e Inteligencia Artificial Generativa," en *Actas de COMPDES 2026*, 2026.
