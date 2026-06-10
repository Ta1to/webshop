# Cloud Functions – evaris Webshop

Firebase Cloud Functions stellen server-seitige Logik bereit, die nicht im Browser ausgeführt werden kann (z. B. E-Mail-Versand).

---

## Übersicht

| Function | Typ | Trigger | Beschreibung |
|---|---|---|---|
| `onOrderStatusChange` | Firestore Trigger | `orders/{orderId}` onUpdate | E-Mail bei Bestellstatusänderung |
| `onUserCreate` | Auth Trigger | Neuer Nutzer | Nutzer-Dokument in Firestore anlegen |
| `sendWeeklyNewsletter` | Scheduled | Jeden Sonntag | Newsletter mit aktuellen Angeboten |

---

## Verzeichnisstruktur

```
functions/
├── index.js                     # Einstiegspunkt – exportiert alle Functions
├── package.json
└── src/
    ├── newsletter/
    │   └── weeklyOffers.js      # Scheduled Newsletter Function
    ├── notifications/
    │   └── orderStatusChanged.js # Bestellstatus-Trigger + Nutzer-Anlegen
    └── utils/
        ├── emailService.js      # Nodemailer-Wrapper
        └── emailTemplates.js    # Handlebars E-Mail-Templates
```

---

## 1. `onOrderStatusChange`

**Typ:** Firestore `onUpdate` Trigger  
**Region:** `europe-west1`  
**Collection:** `orders/{orderId}`

Löst aus, sobald ein Dokument in der `orders`-Collection geändert wird. Prüft ob sich das `status`-Feld geändert hat und sendet dem Besteller eine E-Mail mit dem neuen Status.

**Ablauf:**
1. Vor- und Nachzustand der Bestellung vergleichen
2. Bei Statusänderung: Nutzerdaten aus `users/{userId}` abrufen
3. Status-E-Mail über `emailService.sendOrderStatusEmail()` versenden
4. Ergebnis (sent/failed) in `notificationLogs` Collection speichern

**Bestellstatus-Werte:**
- `pending` – Bestellung eingegangen
- `processing` – In Bearbeitung
- `shipped` – Versandt
- `delivered` – Zugestellt
- `cancelled` – Storniert

---

## 2. `onUserCreate`

**Typ:** Firebase Auth Trigger (`onCreate`)  
**Beschreibung:** Legt beim Erstellen eines neuen Firebase-Auth-Nutzers automatisch ein entsprechendes Dokument in der `users`-Collection an.

**Standardwerte beim Erstellen:**
```json
{
  "email": "...",
  "displayName": "...",
  "role": "user",
  "cart": [],
  "wishlist": [],
  "createdAt": "<serverTimestamp>"
}
```

---

## 3. `sendWeeklyNewsletter`

**Typ:** Scheduled Function (Cron)  
**Region:** `europe-west1`  
**Zeitplan:** Jeden Sonntag (konfigurierbar)

**Ablauf:**
1. Alle aktiven Angebote aus `offers`-Collection abrufen (Start ≤ jetzt ≤ Ende)
2. Für jedes Angebot die zugehörigen Produktdetails aus `products` laden
3. Alle Newsletter-Abonnenten aus `users` abrufen (Feld `newsletter: true`)
4. Pro Abonnent eine formatierte HTML-E-Mail mit den Angeboten versenden
5. Versandlog speichern

---

## Lokale Entwicklung mit dem Emulator

```bash
cd functions

# Emulator starten
npm run serve

# oder über Firebase CLI
firebase emulators:start --only functions
```

Für den Emulator können Umgebungsvariablen in `functions/.env` gesetzt werden:

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=geheimes-passwort
```

---

## Deployment

```bash
# Nur Functions deployen
firebase deploy --only functions

# oder aus dem functions/-Verzeichnis
cd functions
npm run deploy
```

> **Wichtig:** Firebase Functions benötigen den **Blaze-Plan**. Der kostenlose Spark-Plan erlaubt keine ausgehenden HTTP-Requests (z. B. SMTP für E-Mails).

---

## E-Mail-Konfiguration

E-Mails werden über **Nodemailer** mit einem beliebigen SMTP-Server gesendet. Die Zugangsdaten werden als Firebase Functions Config gesetzt:

```bash
firebase functions:config:set \
  email.host="smtp.example.com" \
  email.port="587" \
  email.user="noreply@example.com" \
  email.password="geheimes-passwort" \
  email.from="evaris Shop <noreply@example.com>"
```

Config-Werte abrufen:

```bash
firebase functions:config:get
```

---

## Notification Logs

Jede gesendete (oder fehlgeschlagene) Bestellbenachrichtigung wird in der `notificationLogs`-Collection gespeichert:

```json
{
  "sentAt": "<timestamp>",
  "type": "order_status",
  "recipientEmail": "user@example.com",
  "orderId": "...",
  "orderStatus": "shipped",
  "status": "sent",        // "sent" | "failed"
  "error": null
}
```

Dies ermöglicht ein Audit-Trail für alle versendeten E-Mails.
