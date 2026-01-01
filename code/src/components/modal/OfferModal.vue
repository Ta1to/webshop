<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <div class="modal-header">
            <h2>{{ mode === 'create' ? 'Angebot erstellen' : 'Angebot bearbeiten' }}</h2>
            <button @click="close" class="btn-close">
              <X :size="24" />
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <!-- Product Selection -->
              <div class="form-group">
                <div class="label-with-action">
                  <label for="product">Produkt auswählen *</label>
                  <button 
                    v-if="mode === 'create'" 
                    type="button" 
                    @click="openProductModal" 
                    class="btn-link"
                  >
                    <Plus :size="16" />
                    Neues Produkt erstellen
                  </button>
                </div>
                <select 
                  id="product" 
                  v-model="formData.productId" 
                  required
                  :disabled="mode === 'edit'"
                >
                  <option value="">Produkt wählen</option>
                  <option 
                    v-for="product in products" 
                    :key="product.id" 
                    :value="product.id"
                  >
                    {{ product.name }} ({{ formatPrice(product.price) }})
                  </option>
                </select>
                <p v-if="mode === 'edit'" class="field-note">
                  Produkt kann bei bestehenden Angeboten nicht geändert werden
                </p>
                <p v-if="mode === 'create' && products.length === 0" class="field-note warning">
                  Keine Produkte vorhanden. Bitte erstellen Sie zuerst ein Produkt.
                </p>
              </div>

              <!-- Product Preview -->
              <div v-if="selectedProduct" class="product-preview">
                <img 
                  v-if="selectedProduct.imageUrl" 
                  :src="selectedProduct.imageUrl" 
                  :alt="selectedProduct.name"
                  class="product-image"
                />
                <div class="product-info">
                  <h3>{{ selectedProduct.name }}</h3>
                  <p class="product-category">{{ selectedProduct.category }}</p>
                  <p class="original-price">Originalpreis: {{ formatPrice(selectedProduct.price) }}</p>
                </div>
              </div>

              <!-- Discount Percentage -->
              <div class="form-group">
                <label for="discount">Rabatt (%) *</label>
                <input 
                  id="discount"
                  v-model.number="formData.discountPercentage" 
                  type="number" 
                  step="1"
                  min="1"
                  max="99"
                  required
                  placeholder="z.B. 20"
                />
                <p v-if="selectedProduct && formData.discountPercentage" class="discount-preview">
                  Neuer Preis: 
                  <span class="new-price">{{ formatPrice(calculateDiscountedPrice()) }}</span>
                  <span class="savings">(Ersparnis: {{ formatPrice(selectedProduct.price - calculateDiscountedPrice()) }})</span>
                </p>
              </div>

              <!-- Date Range -->
              <div class="form-row">
                <div class="form-group">
                  <label for="startDate">Startdatum</label>
                  <input 
                    id="startDate"
                    v-model="formData.startDate" 
                    type="datetime-local"
                  />
                  <p class="field-note">Optional - Leer lassen für sofortigen Start</p>
                </div>

                <div class="form-group">
                  <label for="endDate">Enddatum</label>
                  <input 
                    id="endDate"
                    v-model="formData.endDate" 
                    type="datetime-local"
                    :min="formData.startDate"
                  />
                  <p class="field-note">Optional - Leer lassen für unbegrenzt</p>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" @click="close" class="btn-secondary">
                  Abbrechen
                </button>
                <button type="submit" class="btn-primary" :disabled="saving || !formData.productId">
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
import { ref, watch, computed } from 'vue'
import { X, Loader, Plus } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  mode: {
    type: String,
    default: 'create' // 'create' or 'edit'
  },
  offer: {
    type: Object,
    default: null
  },
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'submit', 'openProductModal'])

const saving = ref(false)

const formData = ref({
  productId: '',
  discountPercentage: 0,
  startDate: '',
  endDate: ''
})

// Computed property for selected product
const selectedProduct = computed(() => {
  if (!formData.value.productId) return null
  return props.products.find(p => p.id === formData.value.productId)
})

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Calculate discounted price
const calculateDiscountedPrice = () => {
  if (!selectedProduct.value || !formData.value.discountPercentage) return 0
  
  const discount = (selectedProduct.value.price * formData.value.discountPercentage) / 100
  return Math.max(0, selectedProduct.value.price - discount)
}

// Define resetForm first
const resetForm = () => {
  formData.value = {
    productId: '',
    discountPercentage: 0,
    startDate: '',
    endDate: ''
  }
}

// Watch for offer changes to populate form
watch(() => props.offer, (newOffer) => {
  if (newOffer) {
    formData.value = {
      productId: newOffer.productId || '',
      discountPercentage: newOffer.discountPercentage || 0,
      startDate: newOffer.startDate || '',
      endDate: newOffer.endDate || ''
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

const openProductModal = () => {
  emit('openProductModal')
}

const handleSubmit = async () => {
  if (!formData.value.productId) {
    return
  }
  
  saving.value = true
  try {
    await emit('submit', {
      ...formData.value,
      // Convert datetime-local to ISO string if dates are set
      startDate: formData.value.startDate ? new Date(formData.value.startDate).toISOString() : null,
      endDate: formData.value.endDate ? new Date(formData.value.endDate).toISOString() : null
    })
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
  color: var(--primary-green);
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
.form-group input[type="datetime-local"],
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

.field-note {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: var(--gray-500);
}

.field-note.warning {
  color: #f59e0b;
  font-weight: 500;
}

.label-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.label-with-action label {
  margin-bottom: 0;
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary-green);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.btn-link:hover {
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-green-dark);
}

/* Product Preview */
.product-preview {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
  margin-bottom: 1.25rem;
  border: 1px solid #ddd;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: var(--gray-800);
}

.product-category {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.original-price {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

/* Discount Preview */
.discount-preview {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.new-price {
  font-weight: 700;
  font-size: 1rem;
  color: var(--primary-green);
  margin-left: 0.25rem;
}

.savings {
  color: var(--success);
  margin-left: 0.5rem;
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
  
  .product-preview {
    flex-direction: column;
  }
  
  .product-image {
    width: 100%;
    height: 200px;
  }
}
</style>
