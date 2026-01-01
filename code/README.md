# evaris Webshop

Ein moderner E-Commerce Webshop mit Vue.js und Firebase.

## 🚀 Features

- ✅ Firebase Authentication (Login & Registrierung)
- ✅ Firestore Datenbank
- ✅ Modernes, responsives Design
- ✅ User Profile Management
- ✅ Protected Routes

## 🛠️ Setup

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Firebase Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Erstelle ein neues Projekt
3. Aktiviere **Authentication** > Email/Password
4. Erstelle eine **Firestore Database**
5. Gehe zu **Project Settings** > **General** > **Your apps**
6. Kopiere die Firebase Configuration

### 3. Environment Variables einrichten

Erstelle eine `.env` Datei im Root-Verzeichnis:

```bash
cp .env.example .env
```

Füge deine Firebase-Konfiguration in die `.env` Datei ein:

```env
VITE_FIREBASE_API_KEY=dein-api-key
VITE_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dein-projekt-id
VITE_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=deine-sender-id
VITE_FIREBASE_APP_ID=deine-app-id
VITE_FIREBASE_MEASUREMENT_ID=deine-measurement-id
```

### 4. Firestore Security Rules

Füge diese Rules in Firebase Console ein:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🏃‍♂️ Development

```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 📦 Deploy

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

**Wichtig für Deployment:**
- Stelle sicher, dass alle Environment Variables auch in deinem Hosting-Provider gesetzt sind
- Für Firebase Hosting: Nutze `.env.production` oder setze die Variablen in der Firebase Console

## 🗂️ Projektstruktur

```
src/
├── components/      # Vue Komponenten
├── views/          # Seiten-Komponenten
├── router/         # Vue Router Config
├── services/       # Firebase & API Services
│   ├── auth.js    # Authentication
│   ├── config.js  # Firebase Config
│   └── db.js      # Firestore Operations
├── App.vue        # Root Component
└── main.js        # Entry Point
```

## 🎨 Design System

- **Primärfarbe**: Emerald Green (#10b981)
- **Hintergrund**: Light Gray (#f9fafb)
- **Typography**: Inter Font Family

## 📝 Lizenz

MIT
