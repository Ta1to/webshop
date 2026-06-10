# Architektur – evaris Webshop

---

## Überblick

```
Browser
  └── Vue 3 SPA (Vite)
        ├── Vue Router         – Client-seitiges Routing mit Guards
        ├── Stores             – Reaktiver globaler State (Warenkorb, Wunschliste)
        ├── Services
        │     ├── firebase/    – Direkter Firebase SDK Zugriff
        │     └── business/    – Business-Logik, unabhängig vom UI
        └── Views / Components – Seiten & UI-Bausteine
              │
              ▼ (Firebase SDK)
        Firebase
          ├── Authentication   – Nutzerverwaltung
          ├── Firestore        – Datenbank
          ├── Storage          – Produktbilder
          ├── Hosting          – SPA-Hosting
          └── Functions        – Server-seitige Logik (E-Mails)
```

---

## Schichtenmodell

### 1. Views (`src/views/`)

Seiten-Komponenten, die direkt Routen zugeordnet sind. Sie kombinieren mehrere UI-Komponenten und rufen Services auf.

### 2. Components (`src/components/`)

Wiederverwendbare UI-Bausteine. Unterteilt nach Domäne:

- `admin/` – Tabellen-Header, Pagination, Status-Select für den Admin-Bereich
- `dialog/` – Warenkorb-Dialog, Alert-Dialog
- `layout/` – `AppHeader.vue`, `AppFooter.vue`
- `modal/` – Modale für Kategorien, Angebote, Bestelldetails, Cookie-Einstellungen
- `products/` – Produkt-Karte, Produktliste
- `utility/` – Allgemeine Hilfskomponenten

### 3. Services (`src/services/`)

Keine Vue-Abhängigkeiten – reine JavaScript-Module.

| Datei | Verantwortung |
|---|---|
| `firebase/config.js` | Firebase App initialisieren, Exports: `auth`, `db`, `storage` |
| `firebase/auth.js` | Registrieren, Einloggen, Ausloggen, aktuellen User abrufen |
| `firebase/db.js` | Generische Firestore CRUD-Operationen |
| `firebase/storage.js` | Bilder hochladen / löschen in Firebase Storage |
| `business/cart.js` | Warenkorb-Operationen (hinzufügen, entfernen, abrufen) |
| `business/orders.js` | Bestellungen erstellen, abrufen, Status ändern |
| `business/offers.js` | Angebote abrufen, erstellen, löschen |
| `business/search.js` | Volltextsuche über Produktnamen/Tags |
| `business/wishlist.js` | Wunschliste verwalten |
| `utils/errorHandler.js` | Zentrale Fehlerbehandlung |
| `utils/cookies/` | Cookie-Consent-Management |

### 4. Stores (`src/stores/`)

Leichtgewichtiger reaktiver State mit `ref()` – kein Pinia/Vuex.

- `cartStore.js` – `cartItems`, `cartItemCount`, `updateCartItems()`, `initCartStore()`
- `wishlistStore.js` – `wishlistItems`, `updateWishlist()`

### 5. Models (`src/models/`)

Datenklassen mit Hilfsmethoden:

- `Product` – `fromFirestore()`, `toFirestore()`, `getFormattedPrice()`
- `Order` – `fromFirestore()`, `toFirestore()`, `canBeCancelled()`, `getStatusColor()`
- `User` – Nutzerdaten-Modell
- `Offers` – Angebots-Modell

---

## Datenmodell (Firestore)

### Collection: `users/{userId}`

```json
{
  "email": "user@example.com",
  "displayName": "Max Mustermann",
  "role": "user",           // "user" | "admin"
  "cart": [],               // Array von { productId, quantity }
  "wishlist": [],           // Array von productIds
  "createdAt": "<timestamp>"
}
```

### Collection: `products/{productId}`

```json
{
  "name": "T-Shirt Basic",
  "description": "...",
  "price": 19.99,
  "category": "shirts",
  "imageUrl": "https://...",
  "stock": 50,
  "featured": true,
  "tags": ["basic", "shirt"],
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

### Collection: `orders/{orderId}`

```json
{
  "userId": "uid123",          // null bei Gastbestellung
  "userEmail": "user@example.com",
  "items": [
    { "productId": "...", "name": "...", "price": 19.99, "quantity": 2 }
  ],
  "subtotal": 39.98,
  "shippingCost": 4.99,
  "total": 44.97,
  "status": "pending",         // pending | processing | shipped | delivered | cancelled
  "shippingAddress": {
    "firstName": "Max",
    "lastName": "Mustermann",
    "street": "Musterstraße 1",
    "zip": "12345",
    "city": "Musterstadt",
    "country": "DE"
  },
  "shippingMethod": "standard",
  "paymentMethod": "prepayment",
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

### Collection: `offers/{offerId}`

```json
{
  "productId": "...",
  "discountPercentage": 20,
  "startDate": "<timestamp>",
  "endDate": "<timestamp>"
}
```

---

## Routing & Guards

Datei: `src/router/index.js`

### Öffentliche Routen (kein Login erforderlich)

| Route | Beschreibung |
|---|---|
| `/` | Startseite |
| `/categories` | Kategorienübersicht |
| `/category/:slug` | Kategorie mit Produktliste |
| `/product/:id` | Produktdetails |
| `/login`, `/register` | Auth-Seiten |
| `/contact`, `/faq` | Informationsseiten |
| `/privacy`, `/terms`, `/imprint`, `/cookies`, `/shipping`, `/returns`, `/size-guide` | Rechtliche Seiten |

### Authentifizierungsgeschützte Routen

| Route | Beschreibung |
|---|---|
| `/cart` | Warenkorb |
| `/checkout` | Checkout |
| `/checkout/success` | Bestellabschluss |
| `/profile` | Nutzerprofil |
| `/orders` | Bestellhistorie |
| `/wishlist` | Wunschliste |

### Admin-geschützte Routen (`role === 'admin'`)

| Route | Beschreibung |
|---|---|
| `/admin` | Admin-Dashboard |
| `/admin/products` | Produktverwaltung |
| `/admin/categories` | Kategorieverwaltung |
| `/admin/users` | Nutzerverwaltung |
| `/admin/orders` | Bestellverwaltung |
| `/admin/offers` | Angebotsverwaltung |

---

## Build & Chunking

Vite teilt den Build in separate Chunks auf:

- `firebase` – Firebase SDK (auth, firestore, storage)
- `vue-vendor` – Vue + Vue Router
- App-Code – restliche Module

Dies verbessert das Caching und reduziert die initiale Ladezeit.
