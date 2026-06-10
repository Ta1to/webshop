# Deployment – evaris Webshop

---

## Voraussetzungen

- [Firebase CLI](https://firebase.google.com/docs/cli) installiert: `npm install -g firebase-tools`
- Firebase-Projekt erstellt und lokal verknüpft (`firebase use --add`)
- Alle Environment Variables gesetzt (`.env` Datei vorhanden)

---

## 1. Frontend deployen (Firebase Hosting)

```bash
cd code

# Einmaliger Login (falls noch nicht eingeloggt)
firebase login

# Build erstellen und deployen
npm run deploy
```

`npm run deploy` ist ein Alias für:

```bash
npm run build && firebase deploy
```

Der Build landet in `code/dist/` und wird auf Firebase Hosting hochgeladen.
Alle Routen werden auf `/index.html` umgeschrieben (SPA-Konfiguration in `firebase.json`).

---

## 2. Nur Hosting deployen (ohne Functions)

```bash
firebase deploy --only hosting
```

---

## 3. Cloud Functions deployen

```bash
# Nur Functions deployen
firebase deploy --only functions

# oder aus dem functions/-Verzeichnis heraus
cd functions
npm run deploy
```

> **Hinweis:** Cloud Functions benötigen den Firebase **Blaze-Plan** (Pay-as-you-go). Der Spark-Plan (kostenlos) unterstützt keine ausgehenden Netzwerkanfragen aus Functions.

---

## 4. Firestore Rules & Indexes deployen

```bash
firebase deploy --only firestore
```

Deployt:
- `firestore.rules` – Security Rules
- `firestore.indexes.json` – Zusammengesetzte Indizes

---

## 5. Storage Rules deployen

```bash
firebase deploy --only storage
```

---

## 6. Alles auf einmal deployen

```bash
firebase deploy
```

Deployt Hosting, Functions, Firestore-Rules, Firestore-Indizes und Storage-Rules.

---

## Environment Variables für Produktions-Builds

Die `.env`-Datei wird **nicht** in das Repository eingecheckt. Für CI/CD-Pipelines oder manuelle Deployments müssen die Variablen explizit gesetzt werden.

### Option A: `.env.production` Datei (lokal)

Erstelle `code/.env.production`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

### Option B: GitHub Actions Secrets

In den Repository-Einstellungen unter **Settings → Secrets and variables → Actions** die Variablen als Secrets anlegen und in der Workflow-Datei verwenden:

```yaml
- name: Build
  env:
    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
    # ... weitere Variablen
  run: npm run build
```

---

## Cloud Functions – E-Mail-Konfiguration

Die Cloud Functions nutzen **Nodemailer** zum E-Mail-Versand. Die SMTP-Zugangsdaten müssen als Firebase Functions Config oder als Umgebungsvariablen gesetzt werden.

```bash
# Firebase Functions Config setzen (vor dem Deploy)
firebase functions:config:set \
  email.host="smtp.example.com" \
  email.port="587" \
  email.user="noreply@example.com" \
  email.password="geheimes-passwort"
```

Alternativ können `.env`-Dateien in `functions/` für den lokalen Emulator genutzt werden.

---

## Emulator (lokale Entwicklung ohne echtes Firebase)

```bash
# Alle Emulatoren starten
firebase emulators:start

# Nur Functions-Emulator
firebase emulators:start --only functions
```

Der Emulator läuft standardmäßig auf:
- Firestore: http://localhost:8080
- Auth: http://localhost:9099
- Functions: http://localhost:5001
- Hosting: http://localhost:5000
- Emulator UI: http://localhost:4000

---

## Deployment-Checkliste

Vor jedem Produktions-Deployment prüfen:

- [ ] `.env.production` vorhanden oder CI-Secrets gesetzt
- [ ] `firestore.rules` auf dem neuesten Stand
- [ ] `firestore.indexes.json` auf dem neuesten Stand
- [ ] `storage.rules` auf dem neuesten Stand
- [ ] `npm run test:ci` lokal erfolgreich
- [ ] Firebase Projekt auf Blaze-Plan (wenn Functions genutzt werden)
- [ ] E-Mail-Config für Functions gesetzt
