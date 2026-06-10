# Testing – evaris Webshop

Das Projekt nutzt zwei Test-Ebenen:

- **Unit-Tests** mit [Vitest](https://vitest.dev/) – schnelle, isolierte Tests für Services und Utilities
- **E2E-Tests** mit [Cypress](https://www.cypress.io/) – vollständige Browser-Tests aller User-Flows

---

## Unit-Tests (Vitest)

### Tests ausführen

```bash
cd code

# Watch-Modus (während der Entwicklung)
npm run test

# Einmalig ausführen
npm run test:run

# Mit Coverage-Report
npm run test:coverage

# Vitest UI im Browser
npm run test:ui
```

### Wo liegen die Tests?

```
code/tests/unit/
├── utils.test.js         # Tests für allgemeine Hilfsfunktionen
└── services/             # Tests für Business-Services
    stores/               # Tests für Stores
```

### Konfiguration

Datei: `code/vitest.config.js`

- Test-Umgebung: **happy-dom** (DOM-Simulation ohne echten Browser)
- Globals aktiviert (`describe`, `it`, `expect` ohne Import)
- Path-Alias `@` → `src/`
- Coverage-Provider: `v8`

### Coverage-Report

Nach `npm run test:coverage` wird der Report in folgende Formate ausgegeben:

- **Terminal** – direkte Ausgabe in der Konsole
- **JSON** – `coverage/coverage-final.json`
- **HTML** – `coverage/index.html` (im Browser öffnen)

---

## E2E-Tests (Cypress)

### Voraussetzung

Der Entwicklungsserver muss laufen:

```bash
npm run dev
```

### Tests ausführen

```bash
# Cypress UI öffnen (interaktiv)
npm run e2e

# Headless (für CI/CD oder schnelle Ausführung)
npm run e2e:headless
```

### Test-Dateien

```
code/tests/e2e/
├── auth.cy.js         # Login, Registrierung, Logout
├── cart.cy.js         # Warenkorb – hinzufügen, entfernen, Menge ändern
├── checkout.cy.js     # Kompletter Checkout-Flow
├── navigation.cy.js   # Navigation, Header, Links
├── offers.cy.js       # Angebote anzeigen
├── products.cy.js     # Produktkatalog, Suche, Produktdetails
├── search.cy.js       # Suchfunktion
└── wishlist.cy.js     # Wunschliste
```

### Konfiguration

Datei: `code/cypress.config.js`

- `baseUrl`: `http://localhost:5173`
- Viewport: 1280 × 720
- Screenshots: `tests/screenshots/`
- Videos: `tests/videos/`
- Support-Datei: `tests/support/e2e.js`
- Custom Commands: `tests/support/commands.js`

### Custom Commands

In `tests/support/commands.js` können eigene Cypress-Commands definiert werden, z. B. Login-Shortcuts:

```javascript
// Beispiel: Cypress.Commands.add('login', (email, password) => { ... })
cy.login('test@example.com', 'passwort123')
```

---

## CI/CD – Alle Tests kombiniert

```bash
npm run test:ci
```

Führt aus:
1. `vitest run` – Unit-Tests
2. `cypress run --e2e` – E2E-Tests headless

Eignet sich für GitHub Actions oder andere CI-Pipelines.

### Beispiel GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        working-directory: code
        run: npm ci

      - name: Run unit tests
        working-directory: code
        run: npm run test:run

      - name: Start dev server & run E2E tests
        working-directory: code
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          # ... weitere Variablen
        run: |
          npm run dev &
          npx wait-on http://localhost:5173
          npm run e2e:headless
```

> `wait-on` ist bereits als Dev-Dependency eingetragen und wartet, bis der Server erreichbar ist.
