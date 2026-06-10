# Features – evaris Webshop

Übersicht aller implementierten Funktionalitäten.

---

## Authentifizierung

- **Registrierung** mit E-Mail und Passwort (Firebase Auth)
- **Login / Logout**
- **Profilverwaltung** – Name, E-Mail, Lieferadresse ändern
- **Route Guards** – geschützte Routen leiten nicht eingeloggte Nutzer zum Login weiter
- **Admin-Guard** – Admin-Bereich nur für Nutzer mit `role: 'admin'` in Firestore zugänglich
- **Gast-Checkout** – Bestellungen ohne Account möglich

---

## Produktkatalog

- **Kategorienübersicht** unter `/categories`
- **Kategorie-Seite** unter `/category/:slug` – gefilterte Produktliste
- **Produktdetailseite** unter `/product/:id` – Name, Beschreibung, Preis, Bilder, Verfügbarkeit
- **Suche** – Volltextsuche über Produktnamen und Tags
- **Featured Products** – Produkte können als "empfohlen" markiert werden (Anzeige auf der Startseite)
- **Lagerbestand** – `stock`-Feld pro Produkt; ausverkaufte Artikel werden entsprechend angezeigt

---

## Warenkorb

- Artikel hinzufügen, Menge ändern, Artikel entfernen
- Warenkorb-Icon zeigt aktuelle Artikelanzahl (reaktiver globaler State via `cartStore`)
- **Gastwarenkorb** – auch ohne Login nutzbar (gespeichert in Firestore unter `users/<uid>` oder lokal)
- Preisberechnung: Subtotal, Versandkosten, Gesamtbetrag

---

## Checkout

- **Schritt 1 – Lieferadresse:** Vorname, Nachname, Straße, PLZ, Stadt, Land
- **Schritt 2 – Versandmethode:** Standardversand / Express
- **Schritt 3 – Zahlungsart:** Auswahl (z. B. Vorkasse, Kreditkarte)
- **Bestellabschluss** – Bestellung wird in Firestore unter `orders/` gespeichert
- **Erfolgsseite** unter `/checkout/success` mit Bestellzusammenfassung

---

## Wunschliste

- Produkte zur Wunschliste hinzufügen / entfernen
- Wunschliste-Seite unter `/wishlist`
- Reaktiver globaler State via `wishlistStore`
- Wunschliste ist nutzerspezifisch und in Firestore gespeichert

---

## Angebote / Rabatte

- Zeitlich begrenzte Rabatte auf Produkte (Start- und Enddatum)
- Rabatt in Prozent pro Produkt
- Angebote werden auf der Startseite und in der Produktdetailansicht angezeigt
- Admin kann Angebote erstellen, bearbeiten und löschen

---

## Bestellverwaltung (Nutzer)

- Bestellhistorie unter `/orders`
- Detailansicht jeder Bestellung (Artikel, Preise, Lieferadresse, Status)
- Bestellstatus: `pending` → `processing` → `shipped` → `delivered` / `cancelled`

---

## Admin-Bereich (`/admin`)

Nur für Nutzer mit `role: 'admin'` in Firestore zugänglich.

| Bereich | Route | Funktion |
|---|---|---|
| Dashboard | `/admin` | Übersicht |
| Produkte | `/admin/products` | Produkte anlegen, bearbeiten, löschen, Bilder hochladen |
| Kategorien | `/admin/categories` | Kategorien verwalten |
| Benutzer | `/admin/users` | Benutzerübersicht, Rollen verwalten |
| Bestellungen | `/admin/orders` | Bestellstatus ändern, Bestelldetails einsehen |
| Angebote | `/admin/offers` | Rabattangebote anlegen und verwalten |

---

## Informationsseiten

- `/contact` – Kontaktformular / Kontaktdaten
- `/faq` – Häufig gestellte Fragen

## Rechtliche Seiten

- `/privacy` – Datenschutzerklärung
- `/terms` – Allgemeine Geschäftsbedingungen
- `/imprint` – Impressum
- `/cookies` – Cookie-Einstellungen
- `/shipping` – Versandinformationen
- `/returns` – Rückgabebedingungen
- `/size-guide` – Größentabelle

---

## Benachrichtigungen & Newsletter (Cloud Functions)

Siehe [CLOUD_FUNCTIONS.md](CLOUD_FUNCTIONS.md) für technische Details.

- **Bestellstatus-E-Mail** – Wird automatisch ausgelöst, wenn sich der Status einer Bestellung in Firestore ändert
- **Wöchentlicher Newsletter** – Scheduled Cloud Function, die jeden Sonntag aktive Angebote per E-Mail versendet
