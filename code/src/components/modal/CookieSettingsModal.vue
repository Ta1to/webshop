<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-dialog cookie-settings-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-header-content">
              <div class="modal-icon">
                <Settings :size="28" />
              </div>
              <div>
                <h2 class="modal-title">Cookie-Einstellungen</h2>
                <p class="modal-subtitle">Verwalten Sie Ihre Cookie-Präferenzen</p>
              </div>
            </div>
            <button @click="close" class="modal-close" aria-label="Schließen">
              <X :size="24" />
            </button>
          </div>
          
          <div class="modal-body">
            <div class="cookie-intro">
              <p>
                Wir verwenden Cookies, um Ihnen ein optimales Einkaufserlebnis zu bieten. 
                Sie können selbst entscheiden, welche Kategorien Sie zulassen möchten. 
                Notwendige Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
              </p>
            </div>

            <div class="cookie-categories">
              <div 
                v-for="category in categories" 
                :key="category.id"
                class="cookie-category"
              >
                <div class="category-header">
                  <div class="category-title-section">
                    <h3 class="category-title">{{ category.title }}</h3>
                    <span 
                      v-if="category.required" 
                      class="category-badge"
                    >
                      Erforderlich
                    </span>
                  </div>
                  
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      v-model="preferences[category.id]"
                      :disabled="category.required"
                    />
                    <span class="toggle-slider" :class="{ disabled: category.required }"></span>
                  </label>
                </div>
                
                <div class="category-description">
                  <p>{{ category.description }}</p>
                  
                  <div v-if="category.examples.length" class="category-examples">
                    <strong>Beispiele:</strong>
                    <ul>
                      <li v-for="(example, idx) in category.examples" :key="idx">
                        {{ example }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <div class="footer-actions">
              <button 
                @click="handleRejectAll" 
                class="modal-btn modal-btn-secondary"
              >
                Nur Notwendige
              </button>
              <button 
                @click="handleAcceptAll" 
                class="modal-btn modal-btn-tertiary"
              >
                Alle Akzeptieren
              </button>
              <button 
                @click="handleSave" 
                class="modal-btn modal-btn-primary"
              >
                <Check :size="18" />
                Auswahl Speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Settings, X, Check } from 'lucide-vue-next'
import { 
  getPreferences, 
  savePreferences, 
  acceptAllCookies, 
  acceptNecessaryCookies,
  COOKIE_CATEGORIES,
  COOKIE_DESCRIPTIONS 
} from '@/services/utils/cookies'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const preferences = ref({
  [COOKIE_CATEGORIES.NECESSARY]: true,
  [COOKIE_CATEGORIES.FUNCTIONAL]: false,
  [COOKIE_CATEGORIES.ANALYTICS]: false,
  [COOKIE_CATEGORIES.MARKETING]: false
})

// Load current preferences when modal opens
watch(isOpen, (newValue) => {
  if (newValue) {
    preferences.value = getPreferences()
  }
})

const categories = computed(() => [
  {
    id: COOKIE_CATEGORIES.NECESSARY,
    title: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.NECESSARY].title,
    description: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.NECESSARY].description,
    examples: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.NECESSARY].examples,
    required: true
  },
  {
    id: COOKIE_CATEGORIES.FUNCTIONAL,
    title: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.FUNCTIONAL].title,
    description: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.FUNCTIONAL].description,
    examples: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.FUNCTIONAL].examples,
    required: false
  },
  {
    id: COOKIE_CATEGORIES.ANALYTICS,
    title: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.ANALYTICS].title,
    description: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.ANALYTICS].description,
    examples: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.ANALYTICS].examples,
    required: false
  },
  {
    id: COOKIE_CATEGORIES.MARKETING,
    title: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.MARKETING].title,
    description: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.MARKETING].description,
    examples: COOKIE_DESCRIPTIONS[COOKIE_CATEGORIES.MARKETING].examples,
    required: false
  }
])

const close = () => {
  isOpen.value = false
}

const handleOverlayClick = () => {
  close()
}

const handleSave = () => {
  const result = savePreferences(preferences.value)
  if (result.success) {
    emit('saved', result.preferences)
    close()
  }
}

const handleAcceptAll = () => {
  const result = acceptAllCookies()
  if (result.success) {
    emit('saved', result.preferences)
    close()
  }
}

const handleRejectAll = () => {
  const result = acceptNecessaryCookies()
  if (result.success) {
    emit('saved', result.preferences)
    close()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.modal-dialog {
  background: var(--white);
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--gray-200);
}

.modal-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-green-lighter);
  color: var(--primary-green);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.5rem;
  margin: 0;
  color: var(--gray-900);
}

.modal-subtitle {
  font-size: 0.9rem;
  color: var(--gray-600);
  margin: 0.25rem 0 0 0;
}

.modal-close {
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--gray-100);
  color: var(--gray-600);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.cookie-intro {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--gray-50);
  border-left: 4px solid var(--primary-green);
  border-radius: 6px;
}

.cookie-intro p {
  margin: 0;
  color: var(--gray-700);
  line-height: 1.6;
}

.cookie-categories {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cookie-category {
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.cookie-category:hover {
  border-color: var(--primary-green-light);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.category-title {
  font-size: 1.1rem;
  margin: 0;
  color: var(--gray-900);
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-green-lighter);
  color: var(--primary-green-dark);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-description {
  color: var(--gray-600);
  font-size: 0.95rem;
  line-height: 1.6;
}

.category-description p {
  margin: 0 0 1rem 0;
}

.category-examples {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 6px;
}

.category-examples strong {
  color: var(--gray-700);
  font-size: 0.9rem;
}

.category-examples ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.category-examples li {
  color: var(--gray-600);
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--gray-300);
  transition: 0.3s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--primary-green);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-slider.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.modal-btn-primary {
  background-color: var(--primary-green);
  color: var(--white);
}

.modal-btn-primary:hover {
  background-color: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.modal-btn-secondary {
  background-color: var(--white);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.modal-btn-secondary:hover {
  background-color: var(--gray-50);
  border-color: var(--gray-400);
}

.modal-btn-tertiary {
  background-color: var(--gray-100);
  color: var(--gray-700);
}

.modal-btn-tertiary:hover {
  background-color: var(--gray-200);
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .modal-dialog,
.modal-fade-leave-active .modal-dialog {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-dialog,
.modal-fade-leave-to .modal-dialog {
  transform: scale(0.95);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-dialog {
    max-height: 95vh;
    margin: 0.5rem;
  }
  
  .modal-header {
    padding: 1rem 1.5rem;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .footer-actions {
    flex-direction: column;
  }
  
  .modal-btn {
    width: 100%;
    justify-content: center;
  }
  
  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
