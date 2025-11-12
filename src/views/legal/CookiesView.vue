<template>
  <div class="cookies-page">
    <div class="container">
      <h1>Cookie-Einstellungen</h1>
      
      <div class="cookie-info">
        <h2>Was sind Cookies?</h2>
        <p>
          Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere Website besuchen. 
          Sie helfen uns, Ihre Präferenzen zu speichern und Ihnen ein besseres Einkaufserlebnis zu bieten.
        </p>
      </div>

      <div class="cookie-categories">
        <div class="cookie-category">
          <div class="category-header">
            <div class="category-info">
              <h3>🔒 Notwendige Cookies</h3>
              <span class="badge-required">Immer aktiv</span>
            </div>
          </div>
          <p class="category-description">
            Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
          </p>
          <div class="cookie-list">
            <div class="cookie-item">
              <strong>webshop_cart</strong>
              <span>Speichert Ihre Warenkorbdaten für 30 Tage</span>
            </div>
            <div class="cookie-item">
              <strong>webshop_wishlist</strong>
              <span>Speichert Ihre Wunschlistendaten für 30 Tage</span>
            </div>
            <div class="cookie-item">
              <strong>webshop_cookie_consent</strong>
              <span>Speichert Ihre Cookie-Präferenzen für 365 Tage</span>
            </div>
          </div>
        </div>

        <div class="cookie-category">
          <div class="category-header">
            <div class="category-info">
              <h3>📊 Analyse-Cookies</h3>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  v-model="analyticsEnabled"
                  @change="updatePreferences"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <p class="category-description">
            Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, 
            indem Informationen anonym gesammelt und gemeldet werden.
          </p>
          <div class="cookie-list">
            <div class="cookie-item">
              <strong>_ga</strong>
              <span>Google Analytics - Registriert eine eindeutige ID für 2 Jahre</span>
            </div>
            <div class="cookie-item">
              <strong>_gid</strong>
              <span>Google Analytics - Registriert eine eindeutige ID für 24 Stunden</span>
            </div>
          </div>
        </div>

        <div class="cookie-category">
          <div class="category-header">
            <div class="category-info">
              <h3>🎯 Marketing-Cookies</h3>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  v-model="marketingEnabled"
                  @change="updatePreferences"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <p class="category-description">
            Diese Cookies werden verwendet, um Besuchern auf Webseiten zu folgen und personalisierte 
            Werbung anzuzeigen.
          </p>
          <div class="cookie-list">
            <div class="cookie-item">
              <strong>_fbp</strong>
              <span>Facebook Pixel - Tracking für 90 Tage</span>
            </div>
          </div>
        </div>
      </div>

      <div class="cookie-actions">
        <button @click="saveAndAcceptAll" class="btn-primary">
          Alle akzeptieren
        </button>
        <button @click="saveEssentialOnly" class="btn-secondary">
          Nur notwendige Cookies
        </button>
      </div>

      <div v-if="savedMessage" class="saved-message">
        ✓ Ihre Einstellungen wurden gespeichert
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Cookies from 'js-cookie'

const CONSENT_COOKIE_NAME = 'webshop_cookie_consent'
const PREFERENCES_COOKIE_NAME = 'webshop_cookie_preferences'
const CONSENT_COOKIE_DAYS = 365

export default {
  name: 'CookiesView',
  setup() {
    const analyticsEnabled = ref(false)
    const marketingEnabled = ref(false)
    const savedMessage = ref(false)

    const loadPreferences = () => {
      const preferences = Cookies.get(PREFERENCES_COOKIE_NAME)
      if (preferences) {
        const parsed = JSON.parse(preferences)
        analyticsEnabled.value = parsed.analytics || false
        marketingEnabled.value = parsed.marketing || false
      } else {
        const consent = Cookies.get(CONSENT_COOKIE_NAME)
        if (consent === 'all') {
          analyticsEnabled.value = true
          marketingEnabled.value = true
        }
      }
    }

    const updatePreferences = () => {
      const preferences = {
        analytics: analyticsEnabled.value,
        marketing: marketingEnabled.value
      }
      Cookies.set(PREFERENCES_COOKIE_NAME, JSON.stringify(preferences), { expires: CONSENT_COOKIE_DAYS })
      Cookies.set(CONSENT_COOKIE_NAME, 'custom', { expires: CONSENT_COOKIE_DAYS })
      showSavedMessage()
    }

    const saveAndAcceptAll = () => {
      analyticsEnabled.value = true
      marketingEnabled.value = true
      const preferences = {
        analytics: true,
        marketing: true
      }
      Cookies.set(PREFERENCES_COOKIE_NAME, JSON.stringify(preferences), { expires: CONSENT_COOKIE_DAYS })
      Cookies.set(CONSENT_COOKIE_NAME, 'all', { expires: CONSENT_COOKIE_DAYS })
      showSavedMessage()
    }

    const saveEssentialOnly = () => {
      analyticsEnabled.value = false
      marketingEnabled.value = false
      const preferences = {
        analytics: false,
        marketing: false
      }
      Cookies.set(PREFERENCES_COOKIE_NAME, JSON.stringify(preferences), { expires: CONSENT_COOKIE_DAYS })
      Cookies.set(CONSENT_COOKIE_NAME, 'essential', { expires: CONSENT_COOKIE_DAYS })
      showSavedMessage()
    }

    const showSavedMessage = () => {
      savedMessage.value = true
      setTimeout(() => {
        savedMessage.value = false
      }, 3000)
    }

    onMounted(() => {
      loadPreferences()
    })

    return {
      analyticsEnabled,
      marketingEnabled,
      savedMessage,
      updatePreferences,
      saveAndAcceptAll,
      saveEssentialOnly
    }
  }
}
</script>

<style scoped>
.cookies-page {
  min-height: 100vh;
  padding: 2rem 1rem;
  background-color: #f9fafb;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2rem;
}

.cookie-info {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.cookie-info h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.cookie-info p {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.cookie-categories {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.cookie-category {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
}

.category-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.badge-required {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.category-description {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.cookie-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cookie-item {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cookie-item strong {
  color: #111827;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.cookie-item span {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2563eb;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Action Buttons */
.cookie-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  flex: 1;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 2px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.saved-message {
  background-color: #d1fae5;
  color: #065f46;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  .cookie-actions {
    flex-direction: column;
  }

  .cookie-category {
    padding: 1.5rem;
  }
}
</style>
