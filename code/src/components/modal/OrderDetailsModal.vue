<template>
  <div v-if="isOpen" class="modal-overlay" @click="close">
    <div class="modal-content order-details-modal" @click.stop>
      <div class="modal-header">
        <h2>Bestelldetails #{{ getOrderNumber(order) }}</h2>
        <button @click="close" class="btn-close">
          <X :size="24" />
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Order Info -->
        <div class="info-section">
          <h3>Bestellinformationen</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Bestell-Nr.:</span>
              <span class="value">#{{ getOrderNumber(order) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Datum:</span>
              <span class="value">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Status:</span>
              <span class="status-badge" :class="order.status">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Gesamt:</span>
              <span class="value price">{{ formatPrice(order.totalAmount || order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="info-section">
          <h3>Kundendaten</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Name:</span>
              <span class="value">{{ order.shippingAddress?.name || order.shippingAddress?.firstName + ' ' + order.shippingAddress?.lastName || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">E-Mail:</span>
              <span class="value">{{ order.userEmail || 'N/A' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">Adresse:</span>
              <span class="value">
                {{ order.shippingAddress?.street || 'N/A' }}<br>
                {{ order.shippingAddress?.zip || order.shippingAddress?.postalCode || 'N/A' }} 
                {{ order.shippingAddress?.city || 'N/A' }}
                <span v-if="order.shippingAddress?.country"><br>{{ order.shippingAddress.country }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="info-section">
          <h3>Bestellte Artikel</h3>
          <div class="order-items">
            <div v-for="item in order.items" :key="item.productId || item.id" class="order-item">
              <img :src="item.image || item.imageUrl" :alt="item.name" class="item-image">
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p v-if="item.size">Größe: {{ item.size }}</p>
                <p>Menge: {{ item.quantity }}</p>
              </div>
              <div class="item-price">
                {{ formatPrice(item.price * item.quantity) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="close" class="btn-secondary">Schließen</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  order: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

// Utility functions
const getOrderNumber = (order) => {
  if (!order) return 'N/A'
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
</script>

<style scoped>
/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.order-details-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.btn-close {
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--gray-600);
  transition: all 0.2s ease;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.modal-body {
  padding: 1.5rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h3 {
  font-size: 1.125rem;
  color: #333;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 500;
}

.info-item .value {
  font-size: 1rem;
  color: #333;
}

.info-item .value.price {
  font-weight: 600;
  color: var(--primary-green);
  font-size: 1.125rem;
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

.status-badge.pending {
  background: #FEF3C7;
  color: #92400E;
}

.status-badge.processing {
  background: #DBEAFE;
  color: #1E40AF;
}

.status-badge.shipped {
  background: #E0E7FF;
  color: #4338CA;
}

.status-badge.delivered {
  background: #D1FAE5;
  color: #065F46;
}

.status-badge.cancelled {
  background: #FEE2E2;
  color: #991B1B;
}

/* Order Items */
.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
  align-items: center;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
}

.item-details p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.item-price {
  font-weight: 600;
  color: var(--primary-green);
  font-size: 1.125rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--gray-200);
  justify-content: flex-end;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: var(--gray-100);
  color: var(--gray-700);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--gray-200);
}

/* Responsive */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .order-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
