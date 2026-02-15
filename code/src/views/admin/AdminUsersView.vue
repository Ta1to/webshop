<template>
  <div class="admin-users-view">
    <AdminPageHeader
      title="Benutzerverwaltung"
      subtitle="Alle Benutzer durchsuchen und verwalten"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Benutzer werden geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadUsers" class="btn-retry">Erneut versuchen</button>
    </div>

    <!-- Content -->
    <div v-else class="users-content">
      <!-- Filters & Search -->
      <AdminFilters
        v-model:search-query="searchQuery"
        search-placeholder="Benutzer durchsuchen (Name, E-Mail)..."
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <template #filters>
          <select v-model="selectedRole" @change="applyFilters" class="filter-select">
            <option value="">Alle Rollen</option>
            <option value="admin">Admin</option>
            <option value="user">Benutzer</option>
          </select>

          <select v-model="selectedVerificationStatus" @change="applyFilters" class="filter-select">
            <option value="">Alle E-Mail-Status</option>
            <option value="verified">Verifiziert</option>
            <option value="unverified">Nicht verifiziert</option>
          </select>

          <select v-model="sortBy" @change="applySort" class="filter-select">
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="email-asc">E-Mail (A-Z)</option>
            <option value="email-desc">E-Mail (Z-A)</option>
            <option value="date-desc">Neueste zuerst</option>
            <option value="date-asc">Älteste zuerst</option>
          </select>
        </template>
      </AdminFilters>

      <!-- Results Info -->
      <div class="results-info">
        <p>
          <strong>{{ filteredUsers.length }}</strong> von <strong>{{ users.length }}</strong> Benutzern
          <span v-if="searchQuery"> für "{{ searchQuery }}"</span>
        </p>
      </div>

      <!-- Users Table -->
      <div class="table-card">
        <div class="table-container">
          <table v-if="paginatedUsers.length > 0" class="data-table">
            <thead>
              <tr>
                <th>Benutzer</th>
                <th>E-Mail</th>
                <th>E-Mail-Status</th>
                <th>Rolle</th>
                <th>Registriert</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">
                      {{ getUserInitials(user) }}
                    </div>
                    <span>{{ user.displayName || 'Unbenannt' }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="verification-badge" :class="user.emailVerified ? 'verified' : 'unverified'">
                    {{ user.emailVerified ? 'Verifiziert' : 'Nicht verifiziert' }}
                  </span>
                </td>
                <td>
                  <span class="role-badge" :class="user.role">
                    {{ user.role === 'admin' ? 'Admin' : 'Benutzer' }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      @click="confirmToggleRole(user)" 
                      class="btn-action btn-role"
                      :title="user.role === 'admin' ? 'Zu Benutzer ändern' : 'Zu Admin ändern'"
                    >
                      <Shield :size="16" />
                    </button>
                    <button 
                      @click="confirmDeleteUser(user)" 
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
            <Users :size="48" />
            <h3>Keine Benutzer gefunden</h3>
            <p v-if="hasActiveFilters">Versuchen Sie, Ihre Filter anzupassen</p>
            <p v-else>Keine Benutzer vorhanden</p>
            <button v-if="hasActiveFilters" @click="resetFilters" class="btn-primary">
              Filter zurücksetzen
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
import { getAllDocuments, updateDocument, deleteDocument } from '../../services/firebase/db'
import AlertDialog from '../../components/dialog/AlertDialog.vue'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'
import AdminFilters from '../../components/admin/AdminFilters.vue'
import AdminTablePagination from '../../components/admin/AdminTablePagination.vue'
import { Users, Shield, Trash2 } from 'lucide-vue-next'

// ============================================================================
// State Management
// ============================================================================

const loading = ref(true)
const error = ref(null)
const users = ref([])

// ============================================================================
// Filter & Search State
// ============================================================================

const searchQuery = ref('')
const selectedRole = ref('')
const selectedVerificationStatus = ref('')
const sortBy = ref('name-asc')

// ============================================================================
// Pagination State
// ============================================================================

const currentPage = ref(1)
const itemsPerPage = ref(25)

// ============================================================================
// Dialog References
// ============================================================================

const confirmDialog = ref(null)
const successDialog = ref(null)
const errorDialog = ref(null)

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

// ============================================================================
// Computed Properties
// ============================================================================

const filteredUsers = computed(() => {
  let result = [...users.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => {
      const name = (user.displayName || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }

  // Apply role filter
  if (selectedRole.value) {
    result = result.filter(user => user.role === selectedRole.value)
  }

  // Apply verification status filter
  if (selectedVerificationStatus.value) {
    const isVerified = selectedVerificationStatus.value === 'verified'
    result = result.filter(user => user.emailVerified === isVerified)
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name-asc':
        return (a.displayName || '').localeCompare(b.displayName || '')
      case 'name-desc':
        return (b.displayName || '').localeCompare(a.displayName || '')
      case 'email-asc':
        return (a.email || '').localeCompare(b.email || '')
      case 'email-desc':
        return (b.email || '').localeCompare(a.email || '')
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

const totalPages = computed(() => 
  Math.ceil(filteredUsers.value.length / itemsPerPage.value)
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredUsers.value.slice(start, end)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || 
         selectedRole.value || 
         selectedVerificationStatus.value || 
         sortBy.value !== 'name-asc'
})

// ============================================================================
// Data Loading
// ============================================================================

const loadUsers = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await getAllDocuments('users')
    
    if (result.success) {
      users.value = result.data
    } else {
      throw new Error(result.error)
    }
  } catch (err) {
    console.error('Failed to load users:', err)
    error.value = 'Fehler beim Laden der Benutzer'
  } finally {
    loading.value = false
  }
}

// ============================================================================
// Filter Management
// ============================================================================

const applyFilters = () => {
  currentPage.value = 1
}

const applySort = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedRole.value = ''
  selectedVerificationStatus.value = ''
  sortBy.value = 'name-asc'
  currentPage.value = 1
}

// ============================================================================
// User Actions
// ============================================================================

const confirmToggleRole = (user) => {
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  const roleName = newRole === 'admin' ? 'Admin' : 'Benutzer'
  
  dialogConfig.value = {
    title: 'Rolle ändern',
    message: `Möchten Sie die Rolle von "${user.displayName || user.email}" zu "${roleName}" ändern?`,
    confirmText: 'Rolle ändern',
    onConfirm: () => handleToggleRole(user, newRole, roleName)
  }
  
  confirmDialog.value.open()
}

const handleToggleRole = async (user, newRole, roleName) => {
  try {
    const result = await updateDocument('users', user.id, { role: newRole })
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    await loadUsers()
    
    successConfig.value = {
      title: 'Rolle geändert',
      message: `Die Rolle wurde erfolgreich zu "${roleName}" geändert.`
    }
    successDialog.value.open()
  } catch (err) {
    console.error('Failed to update user role:', err)
    errorConfig.value = {
      title: 'Fehler',
      message: `Fehler beim Ändern der Rolle:\n${err.message}`
    }
    errorDialog.value.open()
  }
}

const confirmDeleteUser = (user) => {
  dialogConfig.value = {
    title: 'Benutzer löschen',
    message: `Möchten Sie den Benutzer "${user.displayName || user.email}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!`,
    confirmText: 'Löschen',
    onConfirm: () => handleDeleteUser(user)
  }
  
  confirmDialog.value.open()
}

const handleDeleteUser = async (user) => {
  try {
    const result = await deleteDocument('users', user.id)
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    await loadUsers()
    
    successConfig.value = {
      title: 'Benutzer gelöscht',
      message: `Der Benutzer "${user.displayName || user.email}" wurde erfolgreich gelöscht.`
    }
    successDialog.value.open()
  } catch (err) {
    console.error('Failed to delete user:', err)
    errorConfig.value = {
      title: 'Fehler',
      message: `Fehler beim Löschen des Benutzers:\n${err.message}`
    }
    errorDialog.value.open()
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

const getUserInitials = (user) => {
  if (user.displayName) {
    return user.displayName.substring(0, 2).toUpperCase()
  }
  
  if (user.email) {
    return user.email.substring(0, 2).toUpperCase()
  }
  
  return 'U'
}

const formatDate = (timestamp) => {
  if (!timestamp) {
    return 'N/A'
  }
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// ============================================================================
// Lifecycle Hooks
// ============================================================================

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
/* ============================================================================
   Layout
   ============================================================================ */

.admin-users-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

/* ============================================================================
   Loading State
   ============================================================================ */

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

/* ============================================================================
   Error State
   ============================================================================ */

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

/* ============================================================================
   Filter Controls
   ============================================================================ */

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

/* ============================================================================
   Results Info
   ============================================================================ */

.results-info {
  margin-bottom: 1rem;
  color: var(--gray-600);
  font-size: 0.95rem;
}

.results-info strong {
  color: var(--primary-green);
  font-weight: 600;
}

/* ============================================================================
   Table Card
   ============================================================================ */

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

/* ============================================================================
   User Cell
   ============================================================================ */

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-green) 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

/* ============================================================================
   Badges
   ============================================================================ */

.role-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.role-badge.admin {
  background: #D1FAE5;
  color: #065F46;
}

.role-badge.user {
  background: var(--primary-green-lighter);
  color: var(--primary-green);
}

.verification-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.verification-badge.verified {
  background: #D1FAE5;
  color: #065F46;
}

.verification-badge.unverified {
  background: #FEE2E2;
  color: #991B1B;
}

/* ============================================================================
   Action Buttons
   ============================================================================ */

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

.btn-role {
  color: var(--primary-green);
  background: var(--primary-green-lighter);
}

.btn-role:hover {
  background: var(--primary-green);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
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

/* ============================================================================
   Empty State
   ============================================================================ */

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

/* ============================================================================
   Responsive Design
   ============================================================================ */

@media (max-width: 768px) {
  .admin-users-view {
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
