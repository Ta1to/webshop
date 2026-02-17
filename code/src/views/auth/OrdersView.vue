<template>
  <div class="orders-view">
    <div class="orders-container">
      <h1 class="orders-title">Meine Bestellungen</h1>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Bestellungen werden geladen...</p>
      </div>

      <!-- Guest State -->
      <div v-else-if="!user" class="guest-card">
        <h2>Bitte melde dich an</h2>
        <p>Um deine Bestellungen zu sehen, melde dich mit deinem Konto an.</p>
        <router-link to="/login" class="btn-primary">Zur Anmeldung</router-link>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="empty-state">
        <Package :size="64" />
        <h2>Noch keine Bestellungen</h2>
        <p>Du hast noch keine Bestellungen aufgegeben.</p>
        <router-link to="/categories" class="btn-primary">Jetzt einkaufen</router-link>
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h3>Bestellung #{{ order?.id?.slice(0, 8).toUpperCase() || 'N/A' }}</h3>
              <p class="order-date">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="order-status">
              <span class="status-badge" :class="order.status">
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>

          <div class="order-body">
            <div class="order-items">
              <h4>Artikel ({{ order.items?.length || 0 }})</h4>
              <div class="items-list">
                <div v-for="item in order.items" :key="item.id" class="order-item">
                  <router-link 
                    v-if="item.productId" 
                    :to="`/product/${item.productId}`"
                    class="item-image-link"
                  >
                    <img 
                      v-if="item.image" 
                      :src="item.image" 
                      :alt="item.name"
                      class="item-image"
                    />
                    <div v-else class="item-placeholder">
                      <Package :size="18" />
                    </div>
                    <span v-if="item.offer" class="order-item-badge">-{{ item.offer.discountPercentage }}%</span>
                  </router-link>
                  <div v-else class="item-image-container">
                    <img 
                      v-if="item.image" 
                      :src="item.image" 
                      :alt="item.name"
                      class="item-image"
                    />
                    <div v-else class="item-placeholder">
                      <Package :size="18" />
                    </div>
                    <span v-if="item.offer" class="order-item-badge">-{{ item.offer.discountPercentage }}%</span>
                  </div>
                  <div class="item-details">
                    <router-link 
                      v-if="item.productId" 
                      :to="`/product/${item.productId}`"
                      class="item-name-link"
                    >
                      <p class="item-name">{{ item.name }}</p>
                    </router-link>
                    <p v-else class="item-name">{{ item.name }}</p>
                    <div class="item-price-info">
                      <span v-if="item.offer" class="original-price-small">{{ item.quantity }}x {{ formatPrice(item.price) }}</span>
                      <p class="item-quantity" :class="{ 'offer-price-text': item.offer }">{{ item.quantity }}x {{ formatPrice(item.finalPrice || item.price) }}</p>
                    </div>
                  </div>
                  <div class="item-total-section">
                    <span v-if="item.offer" class="total-original-small">{{ formatPrice(item.price * item.quantity) }}</span>
                    <div class="item-total" :class="{ 'item-total-offer': item.offer }">
                      {{ formatPrice((item.finalPrice || item.price) * item.quantity) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="order-details">
              <div class="detail-section">
                <h4>Lieferadresse</h4>
                <p>{{ order.shippingAddress?.firstName }} {{ order.shippingAddress?.lastName }}</p>
                <p>{{ order.shippingAddress?.street }}</p>
                <p>{{ order.shippingAddress?.postalCode }} {{ order.shippingAddress?.city }}</p>
                <p>{{ getCountryName(order.shippingAddress?.country) }}</p>
              </div>

              <div class="detail-section">
                <h4>Zahlungsmethode</h4>
                <p>{{ getPaymentMethodName(order.paymentMethod) }}</p>
              </div>

              <div class="detail-section">
                <h4>Versandart</h4>
                <p>{{ getShippingMethodName(order.shippingMethod) }}</p>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span>Gesamt:</span>
              <span class="total-amount">{{ formatPrice(order.total) }}</span>
            </div>
            <div class="order-actions">
              <button 
                v-if="order.status === 'pending'" 
                @click="confirmCancelOrder(order)"
                class="btn-cancel"
              >
                Stornieren
              </button>
              <router-link 
                :to="`/orders/${order.id}`" 
                class="btn-details"
              >
                Details
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Cancel Confirmation Dialog -->
  <AlertDialog
    ref="cancelDialog"
    type="confirm"
    title="Bestellung stornieren"
    :message="cancelMessage"
    confirm-text="Stornieren"
    cancel-text="Abbrechen"
    :show-cancel="true"
    @confirm="handleCancelOrder"
  />
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Package } from 'lucide-vue-next'
import { observeAuthState } from '../../services/firebase/auth'
import { getUserOrders, cancelOrder } from '../../services/business/orders'
import AlertDialog from '../../components/dialog/AlertDialog.vue'

export default {
  name: 'OrdersView',
  components: {
    Package,
    AlertDialog
  },
  setup() {
    const user = ref(null)
    const orders = ref([])
    const loading = ref(true)
    const cancelDialog = ref(null)
    const cancelMessage = ref('')
    const orderToCancel = ref(null)

    let unsubscribeAuth = null

    const loadOrders = async (authUser) => {
      if (!authUser) {
        loading.value = false
        return
      }

      loading.value = true
      const result = await getUserOrders(authUser.uid)

      if (result.success) {
        orders.value = result.orders
      } else {
        console.error('Error loading orders:', result.error)
      }

      loading.value = false
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    const getStatusText = (status) => {
      const statusMap = {
        pending: 'Ausstehend',
        processing: 'In Bearbeitung',
        shipped: 'Versandt',
        delivered: 'Zugestellt',
        cancelled: 'Storniert'
      }
      return statusMap[status] || status
    }

    const getCountryName = (code) => {
      const countryMap = {
        DE: 'Deutschland',
        AT: 'Österreich',
        CH: 'Schweiz'
      }
      return countryMap[code] || code
    }

    const getPaymentMethodName = (method) => {
      const methodMap = {
        'credit-card': 'Kreditkarte',
        'paypal': 'PayPal',
        'bank-transfer': 'Überweisung'
      }
      return methodMap[method] || method
    }

    const getShippingMethodName = (method) => {
      const methodMap = {
        standard: 'Standard Versand',
        express: 'Express Versand',
        free: 'Kostenloser Versand'
      }
      return methodMap[method] || method
    }

    const confirmCancelOrder = (order) => {
      if (!order || !order.id) {
        console.error('Invalid order')
        return
      }
      
      orderToCancel.value = order
      cancelMessage.value = `Möchten Sie die Bestellung #${order.id.slice(0, 8).toUpperCase()} wirklich stornieren?`
      cancelDialog.value.open()
    }

    const handleCancelOrder = async () => {
      if (!orderToCancel.value) return

      const result = await cancelOrder(orderToCancel.value.id)

      if (result.success) {
        // Reload orders
        await loadOrders(user.value)
        orderToCancel.value = null
      } else {
        console.error('Error cancelling order:', result.error)
        alert('Fehler beim Stornieren der Bestellung')
      }
    }

    onMounted(() => {
      unsubscribeAuth = observeAuthState(async (authUser) => {
        user.value = authUser
        await loadOrders(authUser)
      })
    })

    onBeforeUnmount(() => {
      if (unsubscribeAuth) {
        unsubscribeAuth()
      }
    })

    return {
      user,
      orders,
      loading,
      cancelDialog,
      cancelMessage,
      formatDate,
      formatPrice,
      getStatusText,
      getCountryName,
      getPaymentMethodName,
      getShippingMethodName,
      confirmCancelOrder,
      handleCancelOrder
    }
  }
}
</script>

<style scoped>
.orders-view {
  min-height: calc(100vh - 200px);
  padding: 2rem 1rem;
  background: var(--gray-50);
}

.orders-container {
  max-width: 1200px;
  margin: 0 auto;
}

.orders-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 2rem;
  text-align: left;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
  color: var(--gray-600);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--primary-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.guest-card,
.empty-state {
  text-align: center;
  background: var(--white);
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 118, 110, 0.1);
}

.guest-card h2,
.empty-state h2 {
  margin-bottom: 0.5rem;
  color: var(--gray-900);
}

.guest-card p,
.empty-state p {
  color: var(--gray-600);
  margin-bottom: 1.5rem;
}

.empty-state svg {
  color: var(--gray-400);
  margin-bottom: 1rem;
}

.btn-primary {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: var(--white);
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: var(--white);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
}

.order-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--gray-900);
}

.order-date {
  color: var(--gray-600);
  font-size: 0.9rem;
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: #FEF3C7;
  color: #D97706;
}

.status-badge.processing {
  background: #DBEAFE;
  color: #3B82F6;
}

.status-badge.shipped {
  background: #A7F3D0;
  color: #047857;
}

.status-badge.delivered {
  background: var(--primary-green-lighter);
  color: var(--primary-green-dark);
}

.status-badge.cancelled {
  background: var(--error-light);
  color: var(--error);
}

.order-body {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.order-items h4,
.detail-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--gray-700);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.item-image-link {
  position: relative;
  flex-shrink: 0;
}

.order-item-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  font-size: 0.625rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
  z-index: 10;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  transition: transform 0.2s ease;
}

.item-image-link {
  display: block;
  flex-shrink: 0;
  position: relative;
}

.item-image-container {
  position: relative;
  flex-shrink: 0;
}

.order-item-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  font-size: 0.625rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
  z-index: 10;
}

.item-image-link:hover .item-image {
  transform: scale(1.05);
}

.item-placeholder {
  width: 60px;
  height: 60px;
  background: var(--gray-200);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
}

.item-name-link {
  text-decoration: none;
  color: inherit;
}

.item-name {
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--gray-900);
  transition: color 0.2s ease;
}

.item-name-link:hover .item-name {
  color: var(--primary-green);
}

.item-price-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.original-price-small {
  font-size: 0.75rem;
  color: #999;
  text-decoration: line-through;
  margin: 0;
}

.item-quantity {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0;
}

.offer-price-text {
  color: #ef4444;
  font-weight: 600;
}

.item-total-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.total-original-small {
  font-size: 0.75rem;
  color: #999;
  text-decoration: line-through;
}

.item-total {
  font-weight: 600;
  color: var(--primary-green);
}

.item-total-offer {
  color: #ef4444;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section p {
  margin: 0.25rem 0;
  color: var(--gray-700);
  font-size: 0.9rem;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.order-total {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.total-amount {
  color: var(--primary-green);
  font-size: 1.5rem;
}

.order-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-cancel,
.btn-details {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  border: none;
  cursor: pointer;
}

.btn-cancel {
  background: var(--error-light);
  color: var(--error);
}

.btn-cancel:hover {
  background: var(--error);
  color: white;
  transform: translateY(-2px);
}

.btn-details {
  background: var(--primary-green);
  color: white;
}

.btn-details:hover {
  background: var(--primary-green-dark);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .order-body {
    grid-template-columns: 1fr;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .order-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .order-actions {
    justify-content: stretch;
  }

  .btn-cancel,
  .btn-details {
    flex: 1;
    text-align: center;
  }
}
</style>
