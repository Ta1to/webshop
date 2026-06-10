# evaris Webshop

Ein vollständiger E-Commerce Webshop auf Basis von **Vue 3**, **Firebase** und **Vite** – inklusive Admin-Panel, Warenkorb, Wunschliste, Angebote, Cloud Functions und umfassenden Tests.

## Live-Test

Die produktive Version ist unter **https://evaris.eu** erreichbar.

Wenn du die Anwendung schnell testen willst:

- **Shop allgemein:** Startseite, Kategorien, Produktsuche, Produktdetails und Navigation sind direkt ohne Login testbar.
- **User-Login:** Mit einem normalen Benutzerkonto lassen sich Profil, Wunschliste, Warenkorb und Bestellungen testen.
- **Admin-Login:** Mit einem Admin-Konto lässt sich zusätzlich der komplette Admin-Bereich testen.

Für das Testen auf **https://evaris.eu** können folgende bereits angelegte Konten verwendet werden:

| Typ | E-Mail | Passwort | Hinweis |
|---|---|---|---|
| Demo User | `tester@gmail.com` | `123456` | Standardnutzer für Shop, Wunschliste, Warenkorb und Bestellungen |
| Demo Admin | `admin@gmail.com` | `123456` | Admin-Zugang mit Zugriff auf den Admin-Bereich |

---

## Inhaltsverzeichnis

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Voraussetzungen](#voraussetzungen)
- [Lokales Setup](#lokales-setup)
- [Live-Test](#live-test)
- [Projektstruktur](#projektstruktur)
- [Verfügbare Scripts](#verfügbare-scripts)
- [Dokumentation](#dokumentation)
- [Deployment](#deployment)

---

## Features

| Bereich | Funktionalität |
|---|---|
| Auth | Registrierung, Login, Profilverwaltung |
| Shop | Produktkatalog, Kategorien, Suche, Produktdetails |
| Warenkorb | Artikel hinzufügen/entfernen, Menge ändern, Gastwarenkorb |
| Checkout | Lieferadresse, Versandmethode, Zahlungsart, Bestellabschluss |
| Wunschliste | Produkte merken, Wunschliste verwalten |
| Angebote | Zeitlich begrenzte Rabatte auf Produkte |
| Bestellungen | Bestellhistorie, Statusverfolgung |
| Admin | Produkte, Kategorien, Benutzer, Bestellungen, Angebote verwalten |
| Newsletter | Wöchentliche E-Mail mit aktuellen Angeboten via Cloud Function |
| Benachrichtigungen | E-Mail bei Bestellstatusänderungen via Cloud Function |

---

## Tech Stack

- **Frontend:** Vue 3 (Composition API), Vue Router 4, Vite 7
- **Backend/DB:** Firebase (Auth, Firestore, Storage, Hosting)
- **Cloud Functions:** Firebase Functions v5, Node.js 20, Nodemailer
- **Icons:** Lucide Vue Next
- **Testing:** Vitest (Unit), Cypress (E2E)

---

## Voraussetzungen

Folgendes muss lokal installiert sein:

- [Node.js](https://nodejs.org/) **v20+**
- [npm](https://www.npmjs.com/) **v9+**
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)
- Ein Firebase-Projekt (kostenloser Spark-Plan reicht für die Entwicklung)

---

## Lokales Setup

### 1. Repository klonen

```bash
git clone https://github.com/Ta1to/webshop.git
cd webshop/code
```

### 2. Abhängigkeiten installieren

```bash
# Frontend
npm install

# Cloud Functions
cd functions
npm install
cd ..
```

### 3. Firebase-Projekt einrichten

1. Öffne die [Firebase Console](https://console.firebase.google.com/)
2. Erstelle ein neues Projekt (oder nutze ein bestehendes)
3. Aktiviere folgende Dienste:
   - **Authentication** → Sign-in-Methode → E-Mail/Passwort aktivieren
   - **Firestore Database** → Datenbank erstellen (Region: `eur3` / Europe)
   - **Storage** → Standard-Bucket erstellen
   - **Hosting** → aktivieren

### 4. Environment Variables setzen

Erstelle die Datei `code/.env` (sie wird nicht ins Git eingecheckt):

```env
VITE_FIREBASE_API_KEY=dein-api-key
VITE_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dein-projekt-id
VITE_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=deine-sender-id
VITE_FIREBASE_APP_ID=deine-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

Die Werte findest du in der Firebase Console unter **Projekteinstellungen → Allgemein → Deine Apps → Web-App**.

### 5. Firebase CLI einloggen & Projekt verknüpfen

```bash
firebase login
firebase use --add   # Projekt auswählen und Alias "default" vergeben
```

### 6. Firestore Rules & Indexes deployen

```bash
firebase deploy --only firestore
```

### 7. Entwicklungsserver starten

```bash
npm run dev
```

Die App ist erreichbar unter: **http://localhost:5173**

---

## Projektstruktur

```
webshop/
├── code/                        # Haupt-Applikation
│   ├── src/
│   │   ├── components/          # Wiederverwendbare UI-Komponenten
│   │   │   ├── admin/           # Admin-spezifische Komponenten
│   │   │   ├── dialog/          # Dialoge (Warenkorb, Alerts)
│   │   │   ├── layout/          # Header & Footer
│   │   │   ├── modal/           # Modale Dialoge
│   │   │   ├── products/        # Produkt-Komponenten
│   │   │   └── utility/         # Hilfkomponenten
│   │   ├── views/               # Seiten-Komponenten (1:1 mit Routen)
│   │   │   ├── admin/           # Admin-Bereich
│   │   │   ├── auth/            # Login, Register, Profil, Bestellungen, Wunschliste
│   │   │   ├── info/            # Kontakt, FAQ
│   │   │   ├── legal/           # Impressum, Datenschutz, AGB, ...
│   │   │   └── shop/            # Kategorien, Produkte, Warenkorb, Checkout
│   │   ├── router/              # Vue Router – alle Routen & Guards
│   │   ├── services/
│   │   │   ├── firebase/        # Direkte Firebase-Wrapper (auth, db, storage, config)
│   │   │   ├── business/        # Business-Logik (cart, orders, offers, search, wishlist)
│   │   │   └── utils/           # Fehlerbehandlung, Cookie-Management
│   │   ├── stores/              # Reaktiver globaler State (cartStore, wishlistStore)
│   │   ├── models/              # Datenklassen (Product, Order, User, Offers)
│   │   ├── constants/           # App-weite Konstanten
│   │   ├── data/                # Statische Datendefinitionen
│   │   └── utils/               # Allgemeine Hilfsfunktionen
│   ├── functions/               # Firebase Cloud Functions
│   │   └── src/
│   │       ├── newsletter/      # Wöchentlicher Newsletter
│   │       ├── notifications/   # Bestellstatus-E-Mails
│   │       └── utils/           # E-Mail-Service & Templates
│   ├── tests/
│   │   ├── unit/                # Vitest Unit-Tests
│   │   └── e2e/                 # Cypress E2E-Tests
│   ├── .env                     # Lokale Umgebungsvariablen (nicht im Git!)
│   ├── firebase.json            # Firebase-Konfiguration
│   ├── firestore.rules          # Firestore Security Rules
│   └── vite.config.js           # Vite Build-Konfiguration
├── documentation/               # LaTeX-Projektdokumentation
└── docs/                        # Technische Entwickler-Dokumentation
```

---

## Verfügbare Scripts

Alle Commands werden im Verzeichnis `code/` ausgeführt.

| Script | Beschreibung |
|---|---|
| `npm run dev` | Lokaler Entwicklungsserver starten (http://localhost:5173) |
| `npm run build` | Produktions-Build erstellen (`dist/`) |
| `npm run preview` | Produktions-Build lokal vorschauen |
| `npm run deploy` | Build erstellen **und** auf Firebase Hosting deployen |
| `npm run test` | Vitest Unit-Tests im Watch-Modus starten |
| `npm run test:run` | Vitest Unit-Tests einmalig ausführen |
| `npm run test:coverage` | Unit-Tests mit Coverage-Report ausführen |
| `npm run test:ui` | Vitest UI im Browser öffnen |
| `npm run e2e` | Cypress E2E-Tests interaktiv öffnen (App muss laufen) |
| `npm run e2e:headless` | Cypress E2E-Tests headless ausführen |
| `npm run test:ci` | Unit-Tests + E2E headless (für CI/CD) |

---

## Dokumentation

Detaillierte Dokumentation zu einzelnen Themen:

| Dokument | Inhalt |
|---|---|
| [docs/FEATURES.md](docs/FEATURES.md) | Alle Features im Detail |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architektur, Datenmodell, Routing |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Firebase-Deployment Schritt für Schritt |
| [docs/TESTING.md](docs/TESTING.md) | Unit-Tests und E2E-Tests |
| [docs/CLOUD_FUNCTIONS.md](docs/CLOUD_FUNCTIONS.md) | Cloud Functions – Newsletter & Benachrichtigungen |

---

## Deployment

Schnell-Deployment auf Firebase Hosting:

```bash
cd code
npm run deploy
```

Dieser Befehl führt `vite build` aus und deployt anschließend automatisch auf Firebase Hosting.

> Für das vollständige Deployment-Verfahren (inkl. Cloud Functions, Environment Variables in CI/CD, etc.) siehe [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
