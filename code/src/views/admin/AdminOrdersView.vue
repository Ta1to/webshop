<template>
  <div class="admin-orders-view">
    <AdminPageHeader
      title="Bestellverwaltung"
      subtitle="Alle Bestellungen durchsuchen und verwalten"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Bestellungen werden geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadOrders" class="btn-retry">Erneut versuchen</button>
    </div>

    <!-- Content -->
    <div v-else class="orders-content">
      <!-- Filters & Search -->
      <AdminFilters
        v-model:search-query="searchQuery"
        search-placeholder="Bestellungen durchsuchen (Bestell-Nr., Kunde)..."
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <template #filters>
          <select v-model="selectedStatus" @change="applyFilters" class="filter-select">
            <option value="">Alle Status</option>
            <option value="pending">Ausstehend</option>
            <option value="processing">In Bearbeitung</option>
            <option value="shipped">Versandt</option>
            <option value="delivered">Zugestellt</option>
            <option value="cancelled">Storniert</option>
          </select>

          <select v-model="sortBy" @change="applySort" class="filter-select">
            <option value="date-desc">Neueste zuerst</option>
            <option value="date-asc">Älteste zuerst</option>
            <option value="total-desc">Höchster Betrag</option>
            <option value="total-asc">Niedrigster Betrag</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="status-desc">Status (Z-A)</option>
          </select>
        </template>
      </AdminFilters>

      <!-- Results Info -->
      <div class="results-info">
        <p>
          <strong>{{ filteredOrders.length }}</strong> von <strong>{{ orders.length }}</strong> Bestellungen
          <span v-if="searchQuery"> für "{{ searchQuery }}"</span>
        </p>
      </div>

      <!-- Orders Table -->
      <div class="table-card">
        <div class="table-container">
          <table v-if="paginatedOrders.length > 0" class="data-table">
            <thead>
              <tr>
                <th>Bestell-Nr.</th>
                <th>Kunde</th>
                <th>Datum</th>
                <th>Artikel</th>
                <th>Gesamt</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in paginatedOrders" :key="order.id">
                <td>
                  <span class="order-number">#{{ getOrderNumber(order) }}</span>
                </td>
                <td>
                  <div class="customer-cell">
                    <div class="customer-info">
                      <span class="customer-name">{{ order.shippingAddress?.name || 'N/A' }}</span>
                      <span class="customer-email">{{ order.userEmail || 'N/A' }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ formatDate(order.createdAt) }}</td>
                <td>{{ order.items?.length || 0 }} Artikel</td>
                <td class="price-cell">{{ formatPrice(order.totalAmount) }}</td>
                <td>
                  <OrderStatusSelect
                    :status="order.status"
                    @change="(newStatus) => updateOrderStatus(order, newStatus)"
                  />
                </td>
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
          <div v-else class="empty-state">
            <Package :size="48" />
            <h3>Keine Bestellungen gefunden</h3>
            <p v-if="hasActiveFilters">Versuchen Sie, Ihre Filter anzupassen</p>
            <p v-else>Keine Bestellungen vorhanden</p>
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

  <!-- Order Details Modal -->
  <OrderDetailsModal
    :is-open="showDetailsModal"
    :order="selectedOrder"
    @close="closeDetailsModal"
  />

  <!-- Alert Dialogs -->
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
import { getAllOrders, updateOrderStatus as updateStatus } from '../../services/business/orders'
import AlertDialog from '../../components/dialog/AlertDialog.vue'
import OrderDetailsModal from '../../components/modal/OrderDetailsModal.vue'
import OrderStatusSelect from '../../components/admin/OrderStatusSelect.vue'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'
import AdminFilters from '../../components/admin/AdminFilters.vue'
import AdminTablePagination from '../../components/admin/AdminTablePagination.vue'
import { Package, Eye } from 'lucide-vue-next'

// State
const loading = ref(true)
const error = ref(null)
const orders = ref([])

// Search & Filter
const searchQuery = ref('')
const selectedStatus = ref('')
const sortBy = ref('date-desc')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(25)

// Modals
const showDetailsModal = ref(false)
const selectedOrder = ref(null)

// Dialog refs
const successDialog = ref(null)
const errorDialog = ref(null)

// Dialog configurations
const successConfig = ref({
  title: 'Erfolg',
  message: ''
})

const errorConfig = ref({
  title: 'Fehler',
  message: ''
})

// Computed
const filteredOrders = computed(() => {
  let result = [...orders.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(o => {
      const orderNumber = (o.orderNumber || o.id?.substring(0, 8) || '').toString().toLowerCase()
      const orderId = (o.id || '').toLowerCase()
      const customerName = (o.shippingAddress?.name || '').toLowerCase()
      const email = (o.userEmail || '').toLowerCase()
      
      return orderNumber.includes(query) || 
             orderId.includes(query) ||
             customerName.includes(query) || 
             email.includes(query)
    })
  }

  // Status filter
  if (selectedStatus.value) {
    result = result.filter(o => o.status === selectedStatus.value)
  }

  // Sort
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
      case 'date-asc':
        return (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0)
      case 'total-desc':
        return (b.totalAmount || 0) - (a.totalAmount || 0)
      case 'total-asc':
        return (a.totalAmount || 0) - (b.totalAmount || 0)
      case 'status-asc':
        return (a.status || '').localeCompare(b.status || '')
      case 'status-desc':
        return (b.status || '').localeCompare(a.status || '')
      default:
        return 0
    }
  })

  return result
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage.value))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredOrders.value.slice(start, end)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedStatus.value || sortBy.value !== 'date-desc'
})

// Methods
const loadOrders = async () => {
  loading.value = true
  error.value = null

  try {
    const ordersResult = await getAllOrders()
    if (ordersResult.success) {
      orders.value = ordersResult.orders || []
    } else {
      throw new Error(ordersResult.error)
    }
  } catch (err) {
    console.error('Error loading orders:', err)
    error.value = 'Fehler beim Laden der Bestellungen'
    orders.value = []
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
  selectedStatus.value = ''
  sortBy.value = 'date-desc'
  currentPage.value = 1
}

// Order actions
const viewOrderDetails = (order) => {
  selectedOrder.value = order
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedOrder.value = null
}

const updateOrderStatus = async (order, newStatus) => {
  if (order.status === newStatus) return

  try {
    const result = await updateStatus(order.id, newStatus)
    
    if (result.success) {
      // Update local order status
      order.status = newStatus
      
      successConfig.value = {
        title: 'Status aktualisiert',
        message: `Der Bestellstatus wurde erfolgreich zu "${getStatusLabel(newStatus)}" geändert.`
      }
      successDialog.value.open()
    } else {
      throw new Error(result.error)
    }
  } catch (err) {
    console.error('Error updating order status:', err)
    errorConfig.value = {
      title: 'Fehler',
      message: `Fehler beim Aktualisieren des Status:\n${err.message}`
    }
    errorDialog.value.open()
  }
}

// Utility functions
const getOrderNumber = (order) => {
  if (!order) return 'N/A'
  // Use orderNumber if exists, otherwise use first 8 chars of ID
  return order.orderNumber || order.id?.substring(0, 8).toUpperCase() || 'N/A'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Ausstehend',
    processing: 'In Bearbeitung',
    shipped: 'Versandt',
    delivered: 'Zugestellt',
    cancelled: 'Storniert'
  }
  return labels[status] || status
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price || 0)
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.admin-orders-view {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
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

/* Order Number */
.order-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--primary-green);
}

/* Customer Cell */
.customer-cell {
  display: flex;
  align-items: center;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer-name {
  font-weight: 600;
  color: #333;
}

.customer-email {
  font-size: 0.85rem;
  color: var(--gray-600);
}

/* Price Cell */
.price-cell {
  font-weight: 600;
  color: var(--primary-green);
  white-space: nowrap;
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

.btn-view {
  color: #6366F1;
  background: #EEF2FF;
}

.btn-view:hover {
  background: #6366F1;
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
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

/* Responsive */
@media (max-width: 768px) {
  .admin-orders-view {
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
