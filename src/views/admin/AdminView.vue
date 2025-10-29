<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1>Admin Dashboard</h1>
      <p class="subtitle">Verwaltungsübersicht</p>
    </div>

    <!-- Test Data Actions -->
    <div class="test-data-section">
      <div class="test-data-card">
        <h3>Testdaten Generieren</h3>
        <p>Erstelle Mock-Daten für Produkte und Kategorien aus dem Nachhaltigkeits-Sortiment</p>
        <div class="test-data-buttons">
          <button @click="loadMockCategories" class="btn-mock" :disabled="loadingMock">
            <LayoutGrid :size="18" />
            {{ loadingMock ? 'Lädt...' : 'Kategorien laden' }}
          </button>
          <button @click="loadMockProducts" class="btn-mock" :disabled="loadingMock">
            <Package :size="18" />
            {{ loadingMock ? 'Lädt...' : 'Produkte laden' }}
          </button>
          <button @click="loadAllMockData" class="btn-mock btn-mock-primary" :disabled="loadingMock">
            <Plus :size="18" />
            {{ loadingMock ? 'Lädt...' : 'Alle Testdaten laden' }}
          </button>
        </div>
      </div>
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
        <router-link to="/admin/users" class="stat-card stat-card-link">
          <div class="stat-icon users">
            <Users :size="28" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalUsers }}</h3>
            <p>Benutzer</p>
          </div>
        </router-link>

        <router-link to="/admin/categories" class="stat-card stat-card-link">
          <div class="stat-icon categories">
            <LayoutGrid :size="28" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalCategories }}</h3>
            <p>Kategorien</p>
          </div>
        </router-link>

        <router-link to="/admin/products" class="stat-card stat-card-link">
          <div class="stat-icon products">
            <Package :size="28" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalProducts }}</h3>
            <p>Produkte</p>
          </div>
        </router-link>

        <router-link to="/admin/orders" class="stat-card stat-card-link">
          <div class="stat-icon orders">
            <ShoppingCart :size="28" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalOrders }}</h3>
            <p>Bestellungen</p>
          </div>
        </router-link>
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
                <tr v-for="user in users.slice(0, 5)" :key="user.id">
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
          <div v-if="users.length > 5" class="card-footer">
            <router-link to="/admin/users" class="btn-view-all">
              Alle {{ users.length }} Benutzer anzeigen
              <ChevronRight :size="16" />
            </router-link>
          </div>
        </div>

        <!-- Categories Table -->
        <div class="data-card">
          <div class="card-header">
            <h2>Kategorien</h2>
            <div class="header-actions">
              <span class="badge">{{ categories.length }}</span>
              <button @click="openCreateCategoryModal" class="btn-add">
                <Plus :size="18" />
                Neu
              </button>
            </div>
          </div>
          <div class="table-container">
            <table v-if="categories.length > 0" class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Beschreibung</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="category in categories.slice(0, 5)" :key="category.id">
                  <td>
                    <div class="category-cell">
                      <span class="category-icon">{{ category.icon }}</span>
                      <strong>{{ category.name }}</strong>
                    </div>
                  </td>
                  <td><code>{{ category.slug }}</code></td>
                  <td class="description">{{ category.description }}</td>
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
            <p v-else class="empty-state">Keine Kategorien gefunden</p>
          </div>
          <div v-if="categories.length > 5" class="card-footer">
            <router-link to="/admin/categories" class="btn-view-all">
              Alle {{ categories.length }} Kategorien anzeigen
              <ChevronRight :size="16" />
            </router-link>
          </div>
        </div>

        <!-- Products Table -->
        <div class="data-card">
          <div class="card-header">
            <h2>Produkte</h2>
            <div class="header-actions">
              <span class="badge">{{ products.length }}</span>
              <button @click="openCreateProductModal" class="btn-add">
                <Plus :size="18" />
                Neu
              </button>
            </div>
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
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products.slice(0, 5)" :key="product.id">
                  <td>
                    <div class="product-cell">
                      <img v-if="product.imageUrl" 
                           :src="product.imageUrl" 
                           :alt="product.name"
                           class="product-thumbnail">
                      <div class="product-placeholder" v-else>
                        <Package :size="18" />
                      </div>
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
            <p v-else class="empty-state">Keine Produkte gefunden</p>
          </div>
          <div v-if="products.length > 5" class="card-footer">
            <router-link to="/admin/products" class="btn-view-all">
              Alle {{ products.length }} Produkte anzeigen
              <ChevronRight :size="16" />
            </router-link>
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
                  <th>Artikel</th>
                  <th>Betrag</th>
                  <th>Status</th>
                  <th>Datum</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders.slice(0, 5)" :key="order.id">
                  <td><code>{{ order.id.substring(0, 8) }}</code></td>
                  <td>{{ order.userEmail || 'N/A' }}</td>
                  <td>{{ order.items?.length || 0 }} Artikel</td>
                  <td class="price">{{ formatPrice(order.total) }}</td>
                  <td>
                    <OrderStatusSelect
                      :status="order.status"
                      @change="(newStatus) => updateStatus(order, newStatus)"
                    />
                  </td>
                  <td>{{ formatDate(order.createdAt) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button
                        @click="viewOrderDetails(order)"
                        class="btn-action btn-view"
                        title="Details anzeigen"
                      >
                        <Eye :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-state">Keine Bestellungen gefunden</p>
          </div>
          <div v-if="stats.totalOrders > 5" class="card-footer">
            <router-link to="/admin/orders" class="btn-view-all">
              Alle {{ stats.totalOrders }} Bestellungen anzeigen
              <ChevronRight :size="16" />
            </router-link>
          </div>
        </div>

        <div class="data-card">
          <div class="card-header">
            <h2>Letzte Angebote</h2>
            <div class="header-actions">
              <span class="badge">{{ offers.length }}</span>
              <button @click="openCreateProductModal" class="btn-add">
                <Plus :size="18" />
                Neu
              </button>
            </div>
          </div>
          <div class="table-container">
            <table v-if="offers.length > 0" class="data-table">
              <thead>
                <tr>
                  <th>Angebot-ID</th>
                  <th>Produkt-ID</th>
                  <th>Rabatt</th>
                  <th>Start Datum</th>
                  <th>End Datum</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="offer in offers.slice(0, 5)" :key="offer.id">
                  <td><code>{{ offer.id.substring(0, 8) }}</code></td>
                  <td>{{ offer.productId || 'N/A' }}</td>
                  <td>{{ offer.discount || 0 }}%</td>
                  <td>{{ formatDate(offer.startDate) }}</td>
                  <td>{{ formatDate(offer.endDate) }}</td>
                  <td>
                    <OrderStatusSelect
                      :status="offer.status"
                      @change="(newStatus) => updateStatus(offer, newStatus)"
                    />
                  </td>
                  <td>{{ formatDate(offer.createdAt) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button
                        @click="viewOfferDetails(offer)"
                        class="btn-action btn-view"
                        title="Details anzeigen"
                      >
                        <Eye :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-state">Keine Bestellungen gefunden</p>
          </div>
          <div v-if="stats.totalOrders > 5" class="card-footer">
            <router-link to="/admin/orders" class="btn-view-all">
              Alle {{ stats.totalOrders }} Bestellungen anzeigen
              <ChevronRight :size="16" />
            </router-link>
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

  <!-- Product Modal -->
  <ProductModal
    :is-open="productModal.isOpen"
    :mode="productModal.mode"
    :product="productModal.product"
    :categories="categories"
    @close="closeProductModal"
    @submit="handleProductSubmit"
  />

  <!-- Category Modal -->
  <CategoryModal
    :is-open="categoryModal.isOpen"
    :mode="categoryModal.mode"
    :category="categoryModal.category"
    @close="closeCategoryModal"
    @submit="handleCategorySubmit"
  />

  <!-- Order Details Modal -->
  <OrderDetailsModal
    :is-open="orderDetailsModal.isOpen"
    :order="orderDetailsModal.order"
    @close="closeOrderDetailsModal"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllDocuments, updateDocument, deleteDocument, createDocument } from '../../services/db'
import { getAllOrders, updateOrderStatus } from '../../services/orders'
import AlertDialog from '../../components/dialog/AlertDialog.vue'
import ProductModal from '../../components/modal/ProductModal.vue'
import CategoryModal from '../../components/modal/CategoryModal.vue'
import OrderDetailsModal from '../../components/modal/OrderDetailsModal.vue'
import OrderStatusSelect from '../../components/admin/OrderStatusSelect.vue'
import { Users, LayoutGrid, Package, ShoppingCart, Shield, Trash2, Plus, Edit2, ChevronRight, Eye } from 'lucide-vue-next'
import { mockCategories, mockProducts } from '../../data'

const loading = ref(true)
const error = ref(null)
const loadingMock = ref(false)

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
const offers = ref([])

// Modal states
const productModal = ref({ isOpen: false, mode: 'create', product: null })
const categoryModal = ref({ isOpen: false, mode: 'create', category: null })
const orderDetailsModal = ref({ isOpen: false, order: null })
const offerDetailsModal = ref({ isOpen: false, offer: null })

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

    // Load categories from Firestore
    const categoriesResult = await getAllDocuments('categories')
    if (categoriesResult.success) {
      categories.value = categoriesResult.data
      stats.value.totalCategories = categories.value.length
    }

    // Load products from Firestore
    const productsResult = await getAllDocuments('products')
    if (productsResult.success) {
      products.value = productsResult.data
      stats.value.totalProducts = products.value.length
    }

    // Load orders from Firestore
    const ordersResult = await getAllOrders()
    if (ordersResult.success) {
      orders.value = ordersResult.orders.slice(0, 10) // Show only last 10 orders
      stats.value.totalOrders = ordersResult.orders.length
    }

  } catch (err) {
    console.error('Error loading dashboard data:', err)
    error.value = 'Fehler beim Laden der Dashboard-Daten'
  } finally {
    loading.value = false
  }
}

// ==================== MOCK DATA LOADING ====================

// Load mock categories
const loadMockCategories = async () => {
  loadingMock.value = true
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const category of mockCategories) {
      // Create slug from name
      const slug = category.name.toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      
      const categoryData = {
        ...category,
        slug,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await createDocument('categories', categoryData)
      if (result.success) {
        successCount++
      } else {
        errorCount++
      }
    }
    
    // Reload data
    await loadDashboardData()
    
    successConfig.value = {
      title: 'Kategorien geladen',
      message: `${successCount} Kategorien erfolgreich erstellt!${errorCount > 0 ? `\n${errorCount} Fehler aufgetreten.` : ''}`
    }
    successDialog.value.open()
    
  } catch (err) {
    console.error('Error loading mock categories:', err)
    errorConfig.value = {
      title: 'Fehler',
      message: `Fehler beim Laden der Mock-Kategorien:\n${err.message}`
    }
    errorDialog.value.open()
  } finally {
    loadingMock.value = false
  }
}

// Load mock products
const loadMockProducts = async () => {
  loadingMock.value = true
  
  try {
    // Check if categories exist
    if (categories.value.length === 0) {
      errorConfig.value = {
        title: 'Keine Kategorien',
        message: 'Bitte erstellen Sie zuerst Kategorien, bevor Sie Produkte laden.'
      }
      errorDialog.value.open()
      loadingMock.value = false
      return
    }
    
    let successCount = 0
    let errorCount = 0
    
    for (const product of mockProducts) {
      const productData = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await createDocument('products', productData)
      if (result.success) {
        successCount++
      } else {
        errorCount++
      }
    }
    
    // Reload data
    await loadDashboardData()
    
    successConfig.value = {
      title: 'Produkte geladen',
      message: `${successCount} Produkte erfolgreich erstellt!${errorCount > 0 ? `\n${errorCount} Fehler aufgetreten.` : ''}`
    }
    successDialog.value.open()
    
  } catch (err) {
    console.error('Error loading mock products:', err)
    errorConfig.value = {
      title: 'Fehler',
      message: `Fehler beim Laden der Mock-Produkte:\n${err.message}`
    }
    errorDialog.value.open()
  } finally {
    loadingMock.value = false
  }
}

// Load all mock data (categories first, then products)
const loadAllMockData = async () => {
  loadingMock.value = true
  
  try {
    // First load categories
    let categorySuccessCount = 0
    let categoryErrorCount = 0
    
    for (const category of mockCategories) {
      const slug = category.name.toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      
      const categoryData = {
        ...category,
        slug,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await createDocument('categories', categoryData)
      if (result.success) {
        categorySuccessCount++
      } else {
        categoryErrorCount++
      }
    }
    
    // Reload to get category IDs
    await loadDashboardData()
    
    // Then load products
    let productSuccessCount = 0
    let productErrorCount = 0
    
    for (const product of mockProducts) {
      const productData = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await createDocument('products', productData)
      if (result.success) {
        productSuccessCount++
      } else {
        productErrorCount++
      }
    }
    
    await loadDashboardData()
    
    successConfig.value = {
      title: 'Testdaten geladen',
      message: `${categorySuccessCount} Kategorien erstellt\n${productSuccessCount} Produkte erstellt${categoryErrorCount + productErrorCount > 0 ? `\n\n${categoryErrorCount + productErrorCount} Fehler aufgetreten` : ''}`
    }
    successDialog.value.open()
    
  } catch (err) {
    console.error('Error loading all mock data:', err)
    errorConfig.value = {
      title: 'Fehler',
      message: `Fehler beim Laden der Testdaten:\n${err.message}`
    }
    errorDialog.value.open()
  } finally {
    loadingMock.value = false
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
    delivered: 'Zugestellt',
    cancelled: 'Storniert'
  }
  return statusMap[status] || status
}

// Update order status
const updateStatus = async (order, newStatus) => {
  if (order.status === newStatus) return

  try {
    const result = await updateOrderStatus(order.id, newStatus)

    if (result.success) {
      // Update local order status
      order.status = newStatus
      
      successConfig.value = {
        title: 'Status aktualisiert',
        message: `Der Bestellstatus wurde erfolgreich zu "${getOrderStatusText(newStatus)}" geändert.`
      }
      successDialog.value.open()
    } else {
      throw new Error(result.error)
    }
  } catch (err) {
    console.error('Error updating order status:', err)
    errorConfig.value = {
      title: 'Fehler',
      message: `Fehler beim Aktualisieren des Bestellstatus:\n${err.message}`
    }
    errorDialog.value.open()
  }
}

// View order details
const viewOrderDetails = (order) => {
  orderDetailsModal.value = {
    isOpen: true,
    order: order
  }
}

const closeOrderDetailsModal = () => {
  orderDetailsModal.value = {
    isOpen: false,
    order: null
  }
}

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

// ==================== PRODUCT CRUD ====================

const openCreateProductModal = () => {
  productModal.value = { isOpen: true, mode: 'create', product: null }
}

const openEditProductModal = (product) => {
  productModal.value = { isOpen: true, mode: 'edit', product }
}

const closeProductModal = () => {
  productModal.value = { isOpen: false, mode: 'create', product: null }
}

const handleProductSubmit = async (formData) => {
  try {
    if (productModal.value.mode === 'create') {
      const result = await createDocument('products', formData)
      
      if (result.success) {
        await loadDashboardData() // Reload data
        closeProductModal()
        successConfig.value = {
          title: 'Erfolg',
          message: 'Produkt erfolgreich erstellt!'
        }
        successDialog.value.open()
      } else {
        throw new Error(result.error)
      }
    } else {
      const result = await updateDocument('products', productModal.value.product.id, formData)
      
      if (result.success) {
        await loadDashboardData() // Reload data
        closeProductModal()
        successConfig.value = {
          title: 'Erfolg',
          message: 'Produkt erfolgreich aktualisiert!'
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
          await loadDashboardData()
          successConfig.value = {
            title: 'Erfolg',
            message: 'Produkt erfolgreich gelöscht!'
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

// ==================== CATEGORY CRUD ====================

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
        await loadDashboardData()
        closeCategoryModal()
        successConfig.value = {
          title: 'Erfolg',
          message: 'Kategorie erfolgreich erstellt!'
        }
        successDialog.value.open()
      } else {
        throw new Error(result.error)
      }
    } else {
      const result = await updateDocument('categories', categoryModal.value.category.id, formData)
      
      if (result.success) {
        await loadDashboardData()
        closeCategoryModal()
        successConfig.value = {
          title: 'Erfolg',
          message: 'Kategorie erfolgreich aktualisiert!'
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
          await loadDashboardData()
          successConfig.value = {
            title: 'Erfolg',
            message: 'Kategorie erfolgreich gelöscht!'
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

/* Test Data Section */
.test-data-section {
  margin-bottom: 2rem;
}

.test-data-card {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid var(--primary-green-lighter);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.test-data-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-green);
  margin: 0 0 0.5rem 0;
}

.test-data-card p {
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
}

.test-data-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-mock {
  padding: 0.75rem 1.5rem;
  background: white;
  color: var(--primary-green);
  border: 2px solid var(--primary-green);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-mock:hover:not(:disabled) {
  background: var(--primary-green);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-mock:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-mock-primary {
  background: var(--primary-green);
  color: white;
}

.btn-mock-primary:hover:not(:disabled) {
  background: var(--primary-green-dark);
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

.stat-card-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  position: relative;
}

.stat-card-link::after {
  content: '→';
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  color: var(--primary-green);
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(-10px);
}

.stat-card-link:hover::after {
  opacity: 1;
  transform: translateX(0);
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-add {
  padding: 0.5rem 1rem;
  background: var(--primary-green);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-add:hover {
  background: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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

.btn-view {
  color: #6366F1;
  background: #EEF2FF;
}

.btn-view:hover {
  background: #6366F1;
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
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

/* Card Footer */
.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
}

.btn-view-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: var(--primary-green);
  border: 2px solid var(--primary-green);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.btn-view-all:hover {
  background: var(--primary-green);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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
