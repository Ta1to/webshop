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

              <!-- Image Upload Section -->
              <div class="form-group">
                <label>Produktbild</label>
                
                <!-- Image Preview -->
                <div v-if="imagePreview || formData.imageUrl" class="image-preview-container">
                  <img :src="imagePreview || formData.imageUrl" alt="Produktbild" class="image-preview" />
                  <button 
                    type="button" 
                    @click="removeImage" 
                    class="btn-remove-image"
                    title="Bild entfernen"
                  >
                    <X :size="20" />
                  </button>
                </div>

                <!-- Upload Methods Tabs -->
                <div class="upload-tabs">
                  <button
                    type="button"
                    :class="['tab-button', { active: uploadMethod === 'file' }]"
                    @click="uploadMethod = 'file'"
                  >
                    Datei hochladen
                  </button>
                  <button
                    type="button"
                    :class="['tab-button', { active: uploadMethod === 'url' }]"
                    @click="uploadMethod = 'url'"
                  >
                    URL eingeben
                  </button>
                </div>

                <!-- File Upload (Drag & Drop) -->
                <div v-if="uploadMethod === 'file'" class="upload-area-wrapper">
                  <div
                    class="upload-area"
                    :class="{ 'dragging': isDragging, 'uploading': uploading }"
                    @drop.prevent="handleDrop"
                    @dragover.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false"
                    @click="triggerFileInput"
                  >
                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      @change="handleFileSelect"
                      style="display: none"
                    />
                    
                    <div v-if="uploading" class="upload-progress">
                      <Loader class="spinner" :size="32" />
                      <p>Bild wird hochgeladen...</p>
                    </div>
                    
                    <div v-else class="upload-content">
                      <Upload :size="48" />
                      <p class="upload-text">
                        Bild hierher ziehen oder <span class="upload-link">durchsuchen</span>
                      </p>
                      <p class="upload-hint">JPEG, PNG, WebP, GIF · Max. 5MB</p>
                    </div>
                  </div>
                  
                  <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
                </div>

                <!-- URL Input -->
                <div v-if="uploadMethod === 'url'" class="url-input-wrapper">
                  <input 
                    v-model="urlInput"
                    type="url" 
                    placeholder="https://example.com/image.jpg"
                    class="url-input"
                    @blur="handleUrlInput"
                  />
                  <button 
                    type="button" 
                    @click="handleUrlInput" 
                    class="btn-url-submit"
                    :disabled="!urlInput || uploading"
                  >
                    <Check :size="20" />
                  </button>
                </div>
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
import { X, Loader, Upload, Check } from 'lucide-vue-next'
import { uploadImage, validateImageUrl, compressImage } from '@/services/storage'

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
const uploading = ref(false)
const isDragging = ref(false)
const uploadError = ref('')
const uploadMethod = ref('file') // 'file' or 'url'
const urlInput = ref('')
const imagePreview = ref('')
const fileInput = ref(null)

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
  imagePreview.value = ''
  urlInput.value = ''
  uploadError.value = ''
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
    imagePreview.value = ''
    urlInput.value = ''
  } else {
    resetForm()
  }
}, { immediate: true })

// Handle file selection from input
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (file) {
    await processFile(file)
  }
  // Reset input to allow selecting the same file again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Handle drag and drop
const handleDrop = async (event) => {
  isDragging.value = false
  uploadError.value = ''
  
  const file = event.dataTransfer.files?.[0]
  if (file) {
    await processFile(file)
  }
}

// Process and upload file
const processFile = async (file) => {
  uploadError.value = ''
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    uploadError.value = 'Ungültiger Dateityp. Nur JPEG, PNG, WebP und GIF sind erlaubt.'
    return
  }
  
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    uploadError.value = 'Datei ist zu groß. Maximum: 5MB'
    return
  }
  
  try {
    uploading.value = true
    
    // Compress image if needed
    let fileToUpload = file
    if (file.size > 1024 * 1024) { // Compress if > 1MB
      fileToUpload = await compressImage(file, 1200, 0.85)
    }
    
    // Upload to Firebase Storage
    const downloadURL = await uploadImage(fileToUpload, 'products')
    
    // Update form data and preview
    formData.value.imageUrl = downloadURL
    imagePreview.value = downloadURL
    
  } catch (error) {
    console.error('Upload error:', error)
    uploadError.value = error.message || 'Fehler beim Hochladen des Bildes'
  } finally {
    uploading.value = false
  }
}

// Handle URL input
const handleUrlInput = async () => {
  if (!urlInput.value) return
  
  uploadError.value = ''
  uploading.value = true
  
  try {
    // Validate URL format
    const url = new URL(urlInput.value)
    if (!url.protocol.startsWith('http')) {
      throw new Error('Ungültige URL')
    }
    
    // Validate if it's a valid image
    const isValid = await validateImageUrl(urlInput.value)
    if (!isValid) {
      throw new Error('URL führt nicht zu einem gültigen Bild')
    }
    
    // Update form data and preview
    formData.value.imageUrl = urlInput.value
    imagePreview.value = urlInput.value
    
  } catch (error) {
    console.error('URL validation error:', error)
    uploadError.value = error.message || 'Ungültige Bild-URL'
  } finally {
    uploading.value = false
  }
}

// Remove image
const removeImage = () => {
  formData.value.imageUrl = ''
  imagePreview.value = ''
  urlInput.value = ''
  uploadError.value = ''
}

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

/* Image Upload Styles */
.image-preview-container {
  position: relative;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  max-width: 400px;
}

.image-preview {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.btn-remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(239, 68, 68, 0.95);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-remove-image:hover {
  background: rgb(220, 38, 38);
  transform: scale(1.1);
}

.upload-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-button {
  flex: 1;
  padding: 0.625rem 1rem;
  background: var(--gray-100);
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: var(--gray-600);
  transition: all 0.2s;
}

.tab-button:hover {
  background: var(--gray-200);
  color: var(--gray-800);
}

.tab-button.active {
  background: white;
  border-color: var(--primary-green);
  color: var(--primary-green);
}

.upload-area-wrapper {
  margin-bottom: 1rem;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--gray-50);
}

.upload-area:hover {
  border-color: var(--primary-green);
  background: rgba(16, 185, 129, 0.05);
}

.upload-area.dragging {
  border-color: var(--primary-green);
  background: rgba(16, 185, 129, 0.1);
  transform: scale(1.02);
}

.upload-area.uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
}

.upload-content svg {
  color: var(--gray-400);
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 1rem;
  margin: 0;
}

.upload-link {
  color: var(--primary-green);
  text-decoration: underline;
  font-weight: 500;
}

.upload-hint {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin: 0;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--primary-green);
}

.upload-progress p {
  margin: 0;
  font-weight: 500;
}

.upload-error {
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.url-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.url-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
}

.url-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.btn-url-submit {
  padding: 0.75rem;
  background: var(--primary-green);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-width: 48px;
}

.btn-url-submit:hover:not(:disabled) {
  background: var(--primary-green-dark);
}

.btn-url-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
