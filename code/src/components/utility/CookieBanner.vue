<template>
  <Teleport to="body">
    <Transition name="cookie-slide">
      <div v-if="showBanner" class="cookie-banner">
        <div class="cookie-banner-content">
          <div class="cookie-banner-icon">
            <Cookie :size="32" />
          </div>
          
          <div class="cookie-banner-text">
            <h3>Cookie-Einstellungen</h3>
            <p>
              Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern. 
              Notwendige Cookies sind für die Grundfunktionen erforderlich. 
              Sie können auch optionale Cookies für Analyse und Marketing akzeptieren.
              <router-link to="/cookies" class="cookie-link">Mehr erfahren</router-link>
            </p>
          </div>
          
          <div class="cookie-banner-actions">
            <button 
              @click="handleCustomize" 
              class="cookie-btn cookie-btn-secondary"
            >
              <Settings :size="18" />
              Einstellungen
            </button>
            <button 
              @click="handleReject" 
              class="cookie-btn cookie-btn-tertiary"
            >
              Nur Notwendige
            </button>
            <button 
              @click="handleAcceptAll" 
              class="cookie-btn cookie-btn-primary"
            >
              <Check :size="18" />
              Alle Akzeptieren
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Cookie, Settings, Check } from 'lucide-vue-next'
import { hasConsent, acceptAllCookies, acceptNecessaryCookies } from '@/services/cookies'

const emit = defineEmits(['customize', 'accepted'])
const showBanner = ref(false)

onMounted(() => {
  // Show banner if user hasn't given consent
  if (!hasConsent()) {
    showBanner.value = true
  }
})

const handleAcceptAll = () => {
  const result = acceptAllCookies()
  if (result.success) {
    showBanner.value = false
    emit('accepted', result.preferences)
  }
}

const handleReject = () => {
  const result = acceptNecessaryCookies()
  if (result.success) {
    showBanner.value = false
    emit('accepted', result.preferences)
  }
}

const handleCustomize = () => {
  emit('customize')
}

// Expose method to show banner again (e.g., from settings)
const show = () => {
  showBanner.value = true
}

const hide = () => {
  showBanner.value = false
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: var(--white);
  border-top: 3px solid var(--primary-green);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
  padding: 1.5rem;
  animation: slideUp 0.3s ease-out;
}

.cookie-banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cookie-banner-icon {
  color: var(--primary-green);
  flex-shrink: 0;
}

.cookie-banner-text {
  flex: 1;
  min-width: 300px;
}

.cookie-banner-text h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--gray-900);
}

.cookie-banner-text p {
  color: var(--gray-600);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.cookie-link {
  color: var(--primary-green);
  text-decoration: underline;
  margin-left: 0.25rem;
}

.cookie-banner-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.cookie-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
}

.cookie-btn-primary {
  background-color: var(--primary-green);
  color: var(--white);
}

.cookie-btn-primary:hover {
  background-color: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.cookie-btn-secondary {
  background-color: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.cookie-btn-secondary:hover {
  background-color: var(--gray-200);
  border-color: var(--gray-400);
}

.cookie-btn-tertiary {
  background-color: transparent;
  color: var(--gray-600);
  border: 1px solid var(--gray-300);
}

.cookie-btn-tertiary:hover {
  background-color: var(--gray-50);
  color: var(--gray-700);
}

/* Animations */
.cookie-slide-enter-active,
.cookie-slide-leave-active {
  transition: all 0.3s ease;
}

.cookie-slide-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.cookie-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .cookie-banner {
    padding: 1rem;
  }
  
  .cookie-banner-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .cookie-banner-icon {
    display: none;
  }
  
  .cookie-banner-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .cookie-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
