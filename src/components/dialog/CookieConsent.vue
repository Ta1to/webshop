<template>
  <Transition name="cookie-slide">
    <div v-if="showBanner" class="cookie-consent">
      <div class="cookie-content">
        <div class="cookie-text">
          <h3>🍪 Wir verwenden Cookies</h3>
          <p>
            Wir verwenden Cookies, um Ihnen ein optimales Einkaufserlebnis zu bieten. 
            Dazu gehören Cookies für den Warenkorb, Ihre Wunschliste und die Anmeldung. 
            <router-link to="/cookies" class="cookie-link">Mehr erfahren</router-link>
          </p>
        </div>
        <div class="cookie-actions">
          <button @click="acceptEssential" class="btn-secondary">
            Nur notwendige
          </button>
          <button @click="acceptAll" class="btn-primary">
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, onMounted } from 'vue'
import Cookies from 'js-cookie'

const CONSENT_COOKIE_NAME = 'webshop_cookie_consent'
const CONSENT_COOKIE_DAYS = 365

export default {
  name: 'CookieConsent',
  setup() {
    const showBanner = ref(false)

    const acceptAll = () => {
      Cookies.set(CONSENT_COOKIE_NAME, 'all', { expires: CONSENT_COOKIE_DAYS })
      showBanner.value = false
    }

    const acceptEssential = () => {
      Cookies.set(CONSENT_COOKIE_NAME, 'essential', { expires: CONSENT_COOKIE_DAYS })
      showBanner.value = false
    }

    onMounted(() => {
      const consent = Cookies.get(CONSENT_COOKIE_NAME)
      if (!consent) {
        // Show banner after a short delay for better UX
        setTimeout(() => {
          showBanner.value = true
        }, 1000)
      }
    })

    return {
      showBanner,
      acceptAll,
      acceptEssential
    }
  }
}
</script>

<style scoped>
.cookie-consent {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 2px solid #e5e7eb;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  padding: 1.5rem;
}

.cookie-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.cookie-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.cookie-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.cookie-link {
  color: #2563eb;
  text-decoration: underline;
  transition: color 0.2s;
}

.cookie-link:hover {
  color: #1d4ed8;
}

.cookie-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
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
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

/* Responsive */
@media (max-width: 768px) {
  .cookie-content {
    flex-direction: column;
    align-items: stretch;
  }

  .cookie-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}

/* Transitions */
.cookie-slide-enter-active,
.cookie-slide-leave-active {
  transition: transform 0.3s ease-out;
}

.cookie-slide-enter-from,
.cookie-slide-leave-to {
  transform: translateY(100%);
}
</style>
