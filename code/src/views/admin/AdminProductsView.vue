<template>
  <div class="admin-products-view">
    <AdminPageHeader
      title="Produktverwaltung"
      subtitle="Alle Produkte durchsuchen und verwalten"
    >
      <template #actions>
        <button @click="openCreateProductModal" class="btn-add">
          <Plus :size="20" />
          Neues Produkt
        </button>
      </template>
    </AdminPageHeader>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Produkte werden geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadProducts" class="btn-retry">Erneut versuchen</button>
    </div>

    <!-- Content -->
    <div v-else class="products-content">
      <!-- Filters & Search -->
      <AdminFilters
        v-model:search-query="searchQuery"
        search-placeholder="Produkte durchsuchen (Name, Beschreibung, SKU)..."
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <template #filters>
          <select v-model="selectedCategory" @change="applyFilters" class="filter-select">
            <option value="">Alle Kategorien</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>

          <select v-model="selectedStock" @change="applyFilters" class="filter-select">
            <option value="">Alle Lagerbestände</option>
            <option value="available">Verfügbar</option>
            <option value="low">Niedrig (&lt; 10)</option>
            <option value="out">Nicht vorrätig</option>
          </select>

          <select v-model="sortBy" @change="applySort" class="filter-select">
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Preis (niedrig-hoch)</option>
            <option value="price-desc">Preis (hoch-niedrig)</option>
            <option value="stock-asc">Lager (niedrig-hoch)</option>
            <option value="stock-desc">Lager (hoch-niedrig)</option>
            <option value="date-desc">Neueste zuerst</option>
            <option value="date-asc">Älteste zuerst</option>
          </select>
        </template>
      </AdminFilters>

      <!-- Results Info -->
      <div class="results-info">
        <p>
          <strong>{{ filteredProducts.length }}</strong> von <strong>{{ products.length }}</strong> Produkten
          <span v-if="searchQuery"> für "{{ searchQuery }}"</span>
        </p>
      </div>

      <!-- Products Table -->
      <div class="table-card">
        <div class="table-container">
          <table v-if="paginatedProducts.length > 0" class="data-table">
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Kategorie</th>
                <th>SKU</th>
                <th>Preis</th>
                <th>Lagerbestand</th>
                <th>Status</th>
                <th>Erstellt</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in paginatedProducts" :key="product.id">
                <td>
                  <div class="product-cell">
                    <img v-if="product.imageUrl" 
                         :src="product.imageUrl" 
                         :alt="product.name"
                         class="product-thumbnail">
                    <div class="product-placeholder" v-else>
                      <Package :size="20" />
                    </div>
                    <div class="product-info">
                      <strong>{{ product.name }}</strong>
                      <span class="product-desc" v-if="product.description">
                        {{ truncateText(product.description, 60) }}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <span v-if="product.categoryId || product.category">
                    {{ product.categoryId ? getCategoryName(product.categoryId) : product.category }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <code v-if="product.sku">{{ product.sku }}</code>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="price">{{ formatPrice(product.price || 0) }}</td>
                <td>
                  <span :class="getStockClass(product.stock)">
                    {{ product.stock || 0 }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="(product.stock || 0) > 0 ? 'available' : 'out-of-stock'">
                    {{ getStockStatus(product.stock) }}
                  </span>
                </td>
                <td>{{ formatDate(product.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      @click="openEditProductModal(product)" 
                      class="btn-action btn-edit"
                      title="Bearbeiten"
                    >
                      <Edit2 :size="16" />
                    </button>
                    <button 
                      @click="openEditOfferProductModal(product)" 
                      class="btn-action btn-offer"
                      title="Bearbeiten"
                    >
                      <BadgePercent :size="16" />
                    </button>
                    <button 
                      @click="confirmDeleteProduct(product)" 
                      class="btn-action btn-delete"
                      title="Löschen"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-state">
            <Package :size="48" />
            <h3>Keine Produkte gefunden</h3>
            <p v-if="hasActiveFilters">Versuchen Sie, Ihre Filter anzupassen</p>
            <p v-else>Erstellen Sie Ihr erstes Produkt</p>
            <button v-if="hasActiveFilters" @click="resetFilters" class="btn-primary">
              Filter zurücksetzen
            </button>
            <button v-else @click="openCreateProductModal" class="btn-primary">
              <Plus :size="18" />
              Produkt erstellen
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <AdminTablePagination
          v-model:current-page="currentPage"
          v-model:items-per-page="itemsPerPage"
          :total-pages="totalPages"
        />
      </div>
    </div>
  </div>

  <!-- Product Modal -->
  <ProductModal
    :is-open="productModal.isOpen"
    :mode="productModal.mode"
    :product="productModal.product"
    :categories="categories"
    @close="closeProductModal"
    @submit="handleProductSubmit"
  />

  <!-- Alert Dialogs -->
  <AlertDialog
    ref="confirmDialog"
    type="confirm"
    :title="dialogConfig.title"
    :message="dialogConfig.message"
    :confirm-text="dialogConfig.confirmText"
    cancel-text="Abbrechen"
    :show-cancel="true"
    @confirm="dialogConfig.onConfirm"
  />

  <AlertDialog
    ref="successDialog"
    type="success"
    :title="successConfig.title"
    :message="successConfig.message"
    confirm-text="OK"
  />

  <AlertDialog
    ref="errorDialog"
    type="error"
    :title="errorConfig.title"
    :message="errorConfig.message"
    confirm-text="OK"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '../../services/firebase/db'
import AlertDialog from '../../components/dialog/AlertDialog.vue'
import ProductModal from '../../components/modal/ProductModal.vue'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'
import AdminFilters from '../../components/admin/AdminFilters.vue'
import AdminTablePagination from '../../components/admin/AdminTablePagination.vue'
import { Package, Edit2, Trash2, Plus, BadgePercent } from 'lucide-vue-next'

// State
const loading = ref(true)
const error = ref(null)
const products = ref([])
const categories = ref([])

// Search & Filter
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStock = ref('')
const sortBy = ref('name-asc')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(25)

// Modal
const productModal = ref({ isOpen: false, mode: 'create', product: null })

// Dialog refs
const confirmDialog = ref(null)
const successDialog = ref(null)
const errorDialog = ref(null)

// Dialog configurations
const dialogConfig = ref({
  title: '',
  message: '',
  confirmText: 'Bestätigen',
  onConfirm: () => {}
})

const successConfig = ref({
  title: 'Erfolg',
  message: ''
})

const errorConfig = ref({
  title: 'Fehler',
  message: ''
})

// Computed
const filteredProducts = computed(() => {
  let result = [...products.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => {
      const name = (p.name || '').toLowerCase()
      const description = (p.description || '').toLowerCase()
      const sku = (p.sku || '').toLowerCase()
      const category = (p.category || '').toLowerCase()
      
      return name.includes(query) || 
             description.includes(query) || 
             sku.includes(query) || 
             category.includes(query)
    })
  }

  // Category filter
  if (selectedCategory.value) {
    result = result.filter(p => {
      // Check both categoryId and category name
      return p.categoryId === selectedCategory.value || 
             p.category === getCategoryName(selectedCategory.value)
    })
  }

  // Stock filter
  if (selectedStock.value) {
    if (selectedStock.value === 'available') {
      result = result.filter(p => (p.stock || 0) > 10)
    } else if (selectedStock.value === 'low') {
      result = result.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10)
    } else if (selectedStock.value === 'out') {
      result = result.filter(p => (p.stock || 0) === 0)
    }
  }

  // Sort
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'stock-asc':
        return a.stock - b.stock
      case 'stock-desc':
        return b.stock - a.stock
      case 'date-desc':
        return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
      case 'date-asc':
        return (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0)
      default:
        return 0
    }
  })

  return result
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || selectedStock.value || sortBy.value !== 'name-asc'
})

// Methods
const loadProducts = async () => {
  loading.value = true
  error.value = null

  try {
    // Load products
    const productsResult = await getAllDocuments('products')
    if (productsResult.success) {
      products.value = productsResult.data
    } else {
      throw new Error(productsResult.error)
    }

    // Load categories
    const categoriesResult = await getAllDocuments('categories')
    if (categoriesResult.success) {
      categories.value = categoriesResult.data
    }

  } catch (err) {
    console.error('Error loading products:', err)
    error.value = 'Fehler beim Laden der Produkte'
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  currentPage.value = 1
}

const applySort = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStock.value = ''
  sortBy.value = 'name-asc'
  currentPage.value = 1
}

// Product CRUD
const openCreateProductModal = () => {
  productModal.value = { isOpen: true, mode: 'create', product: null }
}

const openEditProductModal = (product) => {
  productModal.value = { isOpen: true, mode: 'edit', product }
}

const openEditOfferProductModal = (product) => {
  productModal.value = { isOpen: true, mode: 'edit-offer', product }
}

const closeProductModal = () => {
  productModal.value = { isOpen: false, mode: 'create', product: null }
}

const handleProductSubmit = async (formData) => {
  try {
    if (productModal.value.mode === 'create') {
      const result = await createDocument('products', formData)
      
      if (result.success) {
        await loadProducts()
        closeProductModal()
        successConfig.value = {
          title: 'Produkt erstellt',
          message: `Das Produkt "${formData.name}" wurde erfolgreich erstellt.`
        }
        successDialog.value.open()
      } else {
        throw new Error(result.error)
      }
    } else {
      const result = await updateDocument('products', productModal.value.product.id, formData)
      
      if (result.success) {
        await loadProducts()
        closeProductModal()
        successConfig.value = {
          title: 'Produkt aktualisiert',
          message: `Das Produkt "${formData.name}" wurde erfolgreich aktualisiert.`
        }
        successDialog.value.open()
      } else {
        throw new Error(result.error)
      }
    }
  } catch (err) {
    console.error('Error saving product:', err)
    errorConfig.value = {
      title: 'Fehler',
      message: `Fehler beim Speichern des Produkts:\n${err.message}`
    }
    errorDialog.value.open()
  }
}

const confirmDeleteProduct = (product) => {
  dialogConfig.value = {
    title: 'Produkt löschen',
    message: `Möchten Sie das Produkt "${product.name}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!`,
    confirmText: 'Löschen',
    onConfirm: async () => {
      try {
        const result = await deleteDocument('products', product.id)
        
        if (result.success) {
          await loadProducts()
          successConfig.value = {
            title: 'Produkt gelöscht',
            message: `Das Produkt "${product.name}" wurde erfolgreich gelöscht.`
          }
          successDialog.value.open()
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        console.error('Error deleting product:', err)
        errorConfig.value = {
          title: 'Fehler',
          message: `Fehler beim Löschen des Produkts:\n${err.message}`
        }
        errorDialog.value.open()
      }
    }
  }
  
  confirmDialog.value.open()
}

// Utility functions
const getCategoryName = (categoryId) => {
  if (!categoryId) return 'Unbekannt'
  const category = categories.value.find(c => c.id === categoryId)
  if (category) {
    return category.name
  }
  return 'Unbekannt'
}

const getStockClass = (stock) => {
  const stockValue = stock || 0
  if (stockValue === 0) return 'stock-out'
  if (stockValue <= 10) return 'stock-low'
  return 'stock-ok'
}

const getStockStatus = (stock) => {
  const stockValue = stock || 0
  if (stockValue === 0) return 'Nicht vorrätig'
  if (stockValue <= 10) return 'Niedrig'
  return 'Verfügbar'
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.admin-products-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: var(--primary-green);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-add:hover {
  background: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Loading */
.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--primary-green);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error */
.error-message {
  background: var(--error-light);
  border: 1px solid var(--error);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: var(--error);
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-green);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.filter-select {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  background: white;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Results Info */
.results-info {
  margin-bottom: 1rem;
  color: var(--gray-600);
  font-size: 0.95rem;
}

.results-info strong {
  color: var(--primary-green);
  font-weight: 600;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  border: 1px solid var(--gray-200);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f8f9fa;
}

.data-table th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.data-table td {
  padding: 1rem 1.25rem;
  border-top: 1px solid #eee;
  color: #333;
}

.data-table tbody tr {
  transition: all 0.2s ease;
}

.data-table tbody tr:hover {
  background: var(--primary-green-lighter);
}

/* Product Cell */
.product-cell {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.product-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--gray-200);
}

.product-placeholder {
  width: 60px;
  height: 60px;
  background: var(--gray-100);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  border: 2px solid var(--gray-200);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 200px;
}

.product-info strong {
  color: var(--gray-800);
  font-size: 0.95rem;
}

.product-desc {
  color: var(--gray-600);
  font-size: 0.85rem;
}

/* Stock Classes */
.stock-ok {
  color: var(--primary-green);
  font-weight: 600;
}

.stock-low {
  color: #F59E0B;
  font-weight: 600;
}

.stock-out {
  color: var(--error);
  font-weight: 600;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.available {
  background: var(--primary-green-lighter);
  color: var(--primary-green);
}

.status-badge.out-of-stock {
  background: var(--error-light);
  color: var(--error);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: transparent;
}

.btn-action:hover {
  transform: translateY(-2px);
}

.btn-edit {
  color: #3B82F6;
  background: #DBEAFE;
}

.btn-edit:hover {
  background: #3B82F6;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-offer {
  color: #F59E0B;
  background: #FEF3C7;
}

.btn-offer:hover {
  background: #F59E0B;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-delete {
  color: var(--error);
  background: var(--error-light);
}

.btn-delete:hover {
  background: var(--error);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--gray-500);
}

.empty-state svg {
  color: var(--gray-300);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--gray-700);
  margin: 1rem 0 0.5rem 0;
}

.empty-state p {
  color: var(--gray-500);
  margin-bottom: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--primary-green);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Misc */
.price {
  font-weight: 600;
  color: var(--primary-green);
  white-space: nowrap;
}

code {
  background: var(--gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--primary-green);
}

.text-muted {
  color: var(--gray-400);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-products-view {
    padding: 1rem;
  }

  .filter-select {
    min-width: auto;
  }

  .data-table {
    font-size: 0.875rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
