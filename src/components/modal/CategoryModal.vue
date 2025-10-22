<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <div class="modal-header">
            <h2>{{ mode === 'create' ? 'Neue Kategorie' : 'Kategorie bearbeiten' }}</h2>
            <button @click="close" class="btn-close">
              <X :size="24" />
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label for="name">Name *</label>
                <input 
                  id="name"
                  v-model="formData.name" 
                  type="text" 
                  required
                  placeholder="z.B. Elektronik"
                />
              </div>

              <div class="form-group">
                <label for="slug">Slug *</label>
                <input 
                  id="slug"
                  v-model="formData.slug" 
                  type="text" 
                  required
                  placeholder="z.B. elektronik"
                  @input="formData.slug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')"
                />
                <small>Nur Kleinbuchstaben, Zahlen und Bindestriche</small>
              </div>

              <div class="form-group">
                <label for="description">Beschreibung *</label>
                <textarea 
                  id="description"
                  v-model="formData.description" 
                  required
                  rows="3"
                  placeholder="Kategoriebeschreibung eingeben..."
                ></textarea>
              </div>

              <div class="form-group">
                <label for="icon">Icon Name (Lucide)</label>
                <input 
                  id="icon"
                  v-model="formData.icon" 
                  type="text" 
                  placeholder="Package"
                />
              </div>

              <div class="modal-actions">
                <button type="button" @click="close" class="btn-secondary">
                  Abbrechen
                </button>
                <button type="submit" class="btn-primary" :disabled="saving">
                  <Loader v-if="saving" class="spinner" :size="18" />
                  {{ saving ? 'Wird gespeichert...' : (mode === 'create' ? 'Erstellen' : 'Speichern') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, Loader } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  mode: {
    type: String,
    default: 'create'
  },
  category: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])

const saving = ref(false)
const formData = ref({
  name: '',
  slug: '',
  description: '',
  icon: 'Package'
})

const resetForm = () => {
  formData.value = {
    name: '',
    slug: '',
    description: '',
    icon: 'Package'
  }
}

// Watch for category changes
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    formData.value = {
      name: newCategory.name || '',
      slug: newCategory.slug || '',
      description: newCategory.description || '',
      icon: newCategory.icon || '📦'
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const close = () => {
  if (!saving.value) {
    resetForm()
    emit('close')
  }
}

const handleSubmit = async () => {
  saving.value = true
  try {
    await emit('submit', formData.value)
    resetForm()
  } finally {
    saving.value = false
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gray-800);
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--gray-100);
  color: var(--error);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary-green);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn-secondary:hover {
  background: var(--gray-200);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
