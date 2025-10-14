<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1>Admin Dashboard</h1>
      <p class="subtitle">Verwaltungsübersicht</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Daten werden geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadDashboardData" class="btn-retry">Erneut versuchen</button>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Statistics Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon users">
            <Users :size="28" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalUsers }}</h3>
            <p>Benutzer</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon categories">
            <LayoutGrid :size="28" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalCategories }}</h3>
            <p>Kategorien</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon products">
            <Package :size="28" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalProducts }}</h3>
            <p>Produkte</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orders">
            <ShoppingCart :size="28" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalOrders }}</h3>
            <p>Bestellungen</p>
          </div>
        </div>
      </div>

      <!-- Data Tables -->
      <div class="data-section">
        <!-- Users Table -->
        <div class="data-card">
          <div class="card-header">
            <h2>Benutzer</h2>
            <span class="badge">{{ users.length }}</span>
          </div>
          <div class="table-container">
            <table v-if="users.length > 0" class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>E-Mail</th>
                  <th>Rolle</th>
                  <th>Erstellt</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">{{ user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U' }}</div>
                      <span>{{ user.displayName || 'Kein Name' }}</span>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="['role-badge', user.role]">
                      {{ user.role === 'admin' ? 'Admin' : 'Benutzer' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button 
                        @click="toggleUserRole(user)" 
                        class="btn-action btn-role"
                        :title="user.role === 'admin' ? 'Zu Benutzer ändern' : 'Zu Admin ändern'"
                      >
                        <Shield :size="16" />
                      </button>
                      <button 
                        @click="confirmDeleteUser(user)" 
                        class="btn-action btn-delete"
                        title="Benutzer löschen"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-state">Keine Benutzer gefunden</p>
          </div>
        </div>

        <!-- Categories Table -->
        <div class="data-card">
          <div class="card-header">
            <h2>Kategorien</h2>
            <span class="badge">{{ categories.length }}</span>
          </div>
          <div class="table-container">
            <table v-if="categories.length > 0" class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Beschreibung</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="category in categories" :key="category.id">
                  <td>
                    <div class="category-cell">
                      <span class="category-icon">{{ category.icon }}</span>
                      <strong>{{ category.name }}</strong>
                    </div>
                  </td>
                  <td><code>{{ category.slug }}</code></td>
                  <td class="description">{{ category.description }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-state">Keine Kategorien gefunden</p>
          </div>
        </div>

        <!-- Products Table -->
        <div class="data-card">
          <div class="card-header">
            <h2>Produkte</h2>
            <span class="badge">{{ products.length }}</span>
          </div>
          <div class="table-container">
            <table v-if="products.length > 0" class="data-table">
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th>Kategorie</th>
                  <th>Preis</th>
                  <th>Lager</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products" :key="product.id">
                  <td>
                    <div class="product-cell">
                      <img v-if="product.images && product.images.length > 0" 
                           :src="product.images[0]" 
                           :alt="product.name"
                           class="product-thumbnail">
                      <div class="product-placeholder" v-else>📦</div>
                      <span>{{ product.name }}</span>
                    </div>
                  </td>
                  <td>{{ product.category }}</td>
                  <td class="price">{{ formatPrice(product.price) }}</td>
                  <td>{{ product.stock }}</td>
                  <td>
                    <span :class="['status-badge', product.stock > 0 ? 'available' : 'out-of-stock']">
                      {{ product.stock > 0 ? 'Verfügbar' : 'Nicht vorrätig' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-state">Keine Produkte gefunden</p>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="data-card">
          <div class="card-header">
            <h2>Letzte Bestellungen</h2>
            <span class="badge">{{ orders.length }}</span>
          </div>
          <div class="table-container">
            <table v-if="orders.length > 0" class="data-table">
              <thead>
                <tr>
                  <th>Bestell-ID</th>
                  <th>Kunde</th>
                  <th>Betrag</th>
                  <th>Status</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders" :key="order.id">
                  <td><code>{{ order.id.substring(0, 8) }}</code></td>
                  <td>{{ order.userEmail || 'N/A' }}</td>
                  <td class="price">{{ formatPrice(order.total) }}</td>
                  <td>
                    <span :class="['status-badge', order.status]">
                      {{ getOrderStatusText(order.status) }}
                    </span>
                  </td>
                  <td>{{ formatDate(order.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-state">Keine Bestellungen gefunden</p>
          </div>
        </div>
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
import { ref, onMounted } from 'vue'
import { getAllDocuments, updateDocument, deleteDocument } from '../services/db'
import { categories as categoriesData } from '../data/Categories'
import { products as productsData } from '../data/Products'
import AlertDialog from '../components/AlertDialog.vue'
import { Users, LayoutGrid, Package, ShoppingCart, Shield, Trash2 } from 'lucide-vue-next'

const loading = ref(true)
const error = ref(null)

// Alert refs
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

// Data
const users = ref([])
const categories = ref([])
const products = ref([])
const orders = ref([])

// Statistics
const stats = ref({
  totalUsers: 0,
  totalCategories: 0,
  totalProducts: 0,
  totalOrders: 0
})

// Load all dashboard data
const loadDashboardData = async () => {
  loading.value = true
  error.value = null

  try {
    // Load users from Firestore
    const usersResult = await getAllDocuments('users')
    if (usersResult.success) {
      users.value = usersResult.data
      stats.value.totalUsers = users.value.length
    }

    // Load categories from static data
    categories.value = categoriesData
    stats.value.totalCategories = categories.value.length

    // Load products from static data
    products.value = productsData
    stats.value.totalProducts = products.value.length

    // Load orders from Firestore
    const ordersResult = await getAllDocuments('orders')
    if (ordersResult.success) {
      orders.value = ordersResult.data.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB - dateA
      }).slice(0, 10) // Show only last 10 orders
      stats.value.totalOrders = ordersResult.data.length
    }

  } catch (err) {
    console.error('Error loading dashboard data:', err)
    error.value = 'Fehler beim Laden der Dashboard-Daten'
  } finally {
    loading.value = false
  }
}

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Get order status text
const getOrderStatusText = (status) => {
  const statusMap = {
    pending: 'Ausstehend',
    processing: 'In Bearbeitung',
    shipped: 'Versandt',
    delivered: 'Geliefert',
    cancelled: 'Storniert'
  }
  return statusMap[status] || status
}

// Toggle user role between admin and user
const toggleUserRole = async (user) => {
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  const roleName = newRole === 'admin' ? 'Admin' : 'Benutzer'
  
  dialogConfig.value = {
    title: 'Rolle ändern',
    message: `Möchten Sie die Rolle von "${user.displayName || user.email}" zu "${roleName}" ändern?`,
    confirmText: 'Rolle ändern',
    onConfirm: async () => {
      try {
        const result = await updateDocument('users', user.id, { role: newRole })
        
        if (result.success) {
          // Update local state
          const userIndex = users.value.findIndex(u => u.id === user.id)
          if (userIndex !== -1) {
            users.value[userIndex].role = newRole
          }
          
          successConfig.value = {
            title: 'Erfolg',
            message: `Rolle erfolgreich zu "${roleName}" geändert!`
          }
          successDialog.value.open()
        } else {
          errorConfig.value = {
            title: 'Fehler',
            message: `Fehler beim Ändern der Rolle:\n${result.error}`
          }
          errorDialog.value.open()
        }
      } catch (err) {
        console.error('Error updating user role:', err)
        errorConfig.value = {
          title: 'Fehler',
          message: 'Ein unerwarteter Fehler ist aufgetreten.'
        }
        errorDialog.value.open()
      }
    }
  }
  
  confirmDialog.value.open()
}

// Confirm and delete user
const confirmDeleteUser = async (user) => {
  dialogConfig.value = {
    title: 'Benutzer löschen',
    message: `Möchten Sie den Benutzer "${user.displayName || user.email}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!`,
    confirmText: 'Löschen',
    onConfirm: async () => {
      try {
        const result = await deleteDocument('users', user.id)
        
        if (result.success) {
          // Remove from local state
          users.value = users.value.filter(u => u.id !== user.id)
          stats.value.totalUsers = users.value.length
          
          successConfig.value = {
            title: 'Erfolg',
            message: 'Benutzer erfolgreich gelöscht!'
          }
          successDialog.value.open()
        } else {
          errorConfig.value = {
            title: 'Fehler',
            message: `Fehler beim Löschen des Benutzers:\n${result.error}`
          }
          errorDialog.value.open()
        }
      } catch (err) {
        console.error('Error deleting user:', err)
        errorConfig.value = {
          title: 'Fehler',
          message: 'Ein unerwarteter Fehler ist aufgetreten.'
        }
        errorDialog.value.open()
      }
    }
  }
  
  confirmDialog.value.open()
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  margin-bottom: 2rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--primary-green);
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
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
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--gray-200);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
  border-color: var(--primary-green);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.users { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }
.stat-icon.categories { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
.stat-icon.products { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); }
.stat-icon.orders { background: linear-gradient(135deg, #34D399 0%, #10B981 100%); }

.stat-info h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

/* Data Section */
.data-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.data-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  border: 1px solid var(--gray-200);
  transition: all 0.3s ease;
}

.data-card:hover {
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
  border-color: var(--primary-green-lighter);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--gray-800);
}

.badge {
  background: var(--primary-green-lighter);
  color: var(--primary-green);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Tables */
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
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  color: #333;
}

.data-table tbody tr:hover {
  background: var(--primary-green-lighter);
  background: linear-gradient(90deg, var(--primary-green-lighter) 0%, transparent 100%);
}

/* User Cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-green) 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Product Cell */
.product-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-thumbnail {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
}

.product-placeholder {
  width: 48px;
  height: 48px;
  background: #f0f0f0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
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

/* Badges */
.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.role-badge.admin {
  background: #D1FAE5;
  color: #065F46;
}

.role-badge.user {
  background: var(--primary-green-lighter);
  color: var(--primary-green);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.available {
  background: var(--primary-green-lighter);
  color: var(--primary-green);
}

.status-badge.out-of-stock {
  background: var(--error-light);
  color: var(--error);
}

.status-badge.pending {
  background: #FEF3C7;
  color: #D97706;
}

.status-badge.processing {
  background: #D1FAE5;
  color: #059669;
}

.status-badge.shipped {
  background: #A7F3D0;
  color: #047857;
}

.status-badge.delivered {
  background: var(--primary-green-lighter);
  color: var(--primary-green);
}

.status-badge.cancelled {
  background: var(--error-light);
  color: var(--error);
}

/* Misc */
.price {
  font-weight: 600;
  color: var(--primary-green);
}

.description {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666;
}

code {
  background: var(--gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--primary-green);
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }

  .admin-header h1 {
    font-size: 1.75rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .data-table {
    font-size: 0.875rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem;
  }
}
</style>
