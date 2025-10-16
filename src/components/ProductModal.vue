<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <div class="modal-header">
            <h2>{{ mode === 'create' ? 'Neues Produkt' : 'Produkt bearbeiten' }}</h2>
            <button @click="close" class="btn-close">
              <X :size="24" />
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label for="name">Produktname *</label>
                <input 
                  id="name"
                  v-model="formData.name" 
                  type="text" 
                  required
                  placeholder="z.B. Smartphone Pro X"
                />
              </div>

              <div class="form-group">
                <label for="description">Beschreibung *</label>
                <textarea 
                  id="description"
                  v-model="formData.description" 
                  required
                  rows="4"
                  placeholder="Produktbeschreibung eingeben..."
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="price">Preis (€) *</label>
                  <input 
                    id="price"
                    v-model.number="formData.price" 
                    type="number" 
                    step="0.01"
                    min="0"
                    required
                    placeholder="99.99"
                  />
                </div>

                <div class="form-group">
                  <label for="stock">Lagerbestand *</label>
                  <input 
                    id="stock"
                    v-model.number="formData.stock" 
                    type="number" 
                    min="0"
                    required
                    placeholder="10"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="category">Kategorie *</label>
                <select id="category" v-model="formData.category" required>
                  <option value="">Kategorie wählen</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="imageUrl">Bild-URL</label>
                <input 
                  id="imageUrl"
                  v-model="formData.imageUrl" 
                  type="url" 
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div class="form-group">
                <label>
                  <input type="checkbox" v-model="formData.featured" />
                  Als Featured-Produkt markieren
                </label>
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
    default: 'create' // 'create' or 'edit'
  },
  product: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'submit'])

const saving = ref(false)
const formData = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  imageUrl: '',
  featured: false
})

// Define resetForm first
const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    imageUrl: '',
    featured: false
  }
}

// Watch for product changes to populate form
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    formData.value = {
      name: newProduct.name || '',
      description: newProduct.description || '',
      price: newProduct.price || 0,
      stock: newProduct.stock || 0,
      category: newProduct.category || '',
      imageUrl: newProduct.imageUrl || '',
      featured: newProduct.featured || false
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
  max-width: 600px;
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
.form-group input[type="url"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
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

/* Modal transitions */
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

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-container {
    max-height: 95vh;
  }
}
</style>
