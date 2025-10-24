<template>
  <div class="admin-categories-view">
    <AdminPageHeader
      title="Kategorieverwaltung"
      subtitle="Alle Kategorien durchsuchen und verwalten"
    >
      <template #actions>
        <button @click="openCreateCategoryModal" class="btn-add">
          <Plus :size="20" />
          Neue Kategorie
        </button>
      </template>
    </AdminPageHeader>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Kategorien werden geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadCategories" class="btn-retry">Erneut versuchen</button>
    </div>

    <!-- Content -->
    <div v-else class="categories-content">
      <!-- Filters & Search -->
      <AdminFilters
        v-model:search-query="searchQuery"
        search-placeholder="Kategorien durchsuchen (Name, Beschreibung, Slug)..."
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <template #filters>
          <select v-model="sortBy" @change="applySort" class="filter-select">
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="date-desc">Neueste zuerst</option>
            <option value="date-asc">Älteste zuerst</option>
          </select>
        </template>
      </AdminFilters>

      <!-- Results Info -->
      <div class="results-info">
        <p>
          <strong>{{ filteredCategories.length }}</strong> von <strong>{{ categories.length }}</strong> Kategorien
          <span v-if="searchQuery"> für "{{ searchQuery }}"</span>
        </p>
      </div>

      <!-- Categories Table -->
      <div class="table-card">
        <div class="table-container">
          <table v-if="paginatedCategories.length > 0" class="data-table">
            <thead>
              <tr>
                <th>Kategorie</th>
                <th>Slug</th>
                <th>Beschreibung</th>
                <th>Erstellt</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in paginatedCategories" :key="category.id">
                <td>
                  <div class="category-cell">
                    <span class="category-icon" v-if="category.icon">{{ category.icon }}</span>
                    <strong>{{ category.name }}</strong>
                  </div>
                </td>
                <td>
                  <code>{{ category.slug }}</code>
                </td>
                <td>
                  <span class="description">{{ category.description || '-' }}</span>
                </td>
                <td>{{ formatDate(category.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      @click="openEditCategoryModal(category)" 
                      class="btn-action btn-edit"
                      title="Bearbeiten"
                    >
                      <Edit2 :size="16" />
                    </button>
                    <button 
                      @click="confirmDeleteCategory(category)" 
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
            <LayoutGrid :size="48" />
            <h3>Keine Kategorien gefunden</h3>
            <p v-if="hasActiveFilters">Versuchen Sie, Ihre Filter anzupassen</p>
            <p v-else>Erstellen Sie Ihre erste Kategorie</p>
            <button v-if="hasActiveFilters" @click="resetFilters" class="btn-primary">
              Filter zurücksetzen
            </button>
            <button v-else @click="openCreateCategoryModal" class="btn-primary">
              <Plus :size="18" />
              Kategorie erstellen
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

  <!-- Category Modal -->
  <CategoryModal
    :is-open="categoryModal.isOpen"
    :mode="categoryModal.mode"
    :category="categoryModal.category"
    @close="closeCategoryModal"
    @submit="handleCategorySubmit"
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
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '../../services/db'
import AlertDialog from '../../components/dialog/AlertDialog.vue'
import CategoryModal from '../../components/modal/CategoryModal.vue'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'
import AdminFilters from '../../components/admin/AdminFilters.vue'
import AdminTablePagination from '../../components/admin/AdminTablePagination.vue'
import { Edit2, Trash2, Plus, LayoutGrid } from 'lucide-vue-next'

// State
const loading = ref(true)
const error = ref(null)
const categories = ref([])

// Search & Filter
const searchQuery = ref('')
const sortBy = ref('name-asc')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(25)

// Modal
const categoryModal = ref({ isOpen: false, mode: 'create', category: null })

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
const filteredCategories = computed(() => {
  let result = [...categories.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => {
      const name = (c.name || '').toLowerCase()
      const description = (c.description || '').toLowerCase()
      const slug = (c.slug || '').toLowerCase()
      
      return name.includes(query) || 
             description.includes(query) || 
             slug.includes(query)
    })
  }

  // Sort
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
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

const totalPages = computed(() => Math.ceil(filteredCategories.value.length / itemsPerPage.value))

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCategories.value.slice(start, end)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || sortBy.value !== 'name-asc'
})

// Methods
const loadCategories = async () => {
  loading.value = true
  error.value = null

  try {
    const categoriesResult = await getAllDocuments('categories')
    if (categoriesResult.success) {
      categories.value = categoriesResult.data
    } else {
      throw new Error(categoriesResult.error)
    }
  } catch (err) {
    console.error('Error loading categories:', err)
    error.value = 'Fehler beim Laden der Kategorien'
  } finally {
    loading.value = false
  }
}

const applySort = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  sortBy.value = 'name-asc'
  currentPage.value = 1
}

// Category CRUD
const openCreateCategoryModal = () => {
  categoryModal.value = { isOpen: true, mode: 'create', category: null }
}

const openEditCategoryModal = (category) => {
  categoryModal.value = { isOpen: true, mode: 'edit', category }
}

const closeCategoryModal = () => {
  categoryModal.value = { isOpen: false, mode: 'create', category: null }
}

const handleCategorySubmit = async (formData) => {
  try {
    if (categoryModal.value.mode === 'create') {
      const result = await createDocument('categories', formData)
      
      if (result.success) {
        await loadCategories()
        closeCategoryModal()
        successConfig.value = {
          title: 'Kategorie erstellt',
          message: `Die Kategorie "${formData.name}" wurde erfolgreich erstellt.`
        }
        successDialog.value.open()
      } else {
        throw new Error(result.error)
      }
    } else {
      const result = await updateDocument('categories', categoryModal.value.category.id, formData)
      
      if (result.success) {
        await loadCategories()
        closeCategoryModal()
        successConfig.value = {
          title: 'Kategorie aktualisiert',
          message: `Die Kategorie "${formData.name}" wurde erfolgreich aktualisiert.`
        }
        successDialog.value.open()
      } else {
        throw new Error(result.error)
      }
    }
  } catch (err) {
    console.error('Error saving category:', err)
    errorConfig.value = {
      title: 'Fehler',
      message: `Fehler beim Speichern der Kategorie:\n${err.message}`
    }
    errorDialog.value.open()
  }
}

const confirmDeleteCategory = (category) => {
  dialogConfig.value = {
    title: 'Kategorie löschen',
    message: `Möchten Sie die Kategorie "${category.name}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!`,
    confirmText: 'Löschen',
    onConfirm: async () => {
      try {
        const result = await deleteDocument('categories', category.id)
        
        if (result.success) {
          await loadCategories()
          successConfig.value = {
            title: 'Kategorie gelöscht',
            message: `Die Kategorie "${category.name}" wurde erfolgreich gelöscht.`
          }
          successDialog.value.open()
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        console.error('Error deleting category:', err)
        errorConfig.value = {
          title: 'Fehler',
          message: `Fehler beim Löschen der Kategorie:\n${err.message}`
        }
        errorDialog.value.open()
      }
    }
  }
  
  confirmDialog.value.open()
}

// Utility functions
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.admin-categories-view {
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

/* Category Cell */
.category-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-icon {
  font-size: 1.5rem;
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
code {
  background: var(--gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--primary-green);
}

.description {
  max-width: 400px;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-categories-view {
    padding: 1rem;
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
