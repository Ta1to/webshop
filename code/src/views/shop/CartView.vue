<template>
  <div class="cart-view">
    <div class="cart-container">
      <h1 class="cart-title">Warenkorb</h1>

      <!-- Empty Cart State -->
      <div v-if="cart.length === 0 && !loading" class="empty-cart">
        <ShoppingCart :size="64" class="empty-icon" />
        <h2>Ihr Warenkorb ist leer</h2>
        <p>Fügen Sie Produkte hinzu, um mit dem Einkauf zu beginnen.</p>
        <router-link to="/categories" class="continue-shopping-btn">
          Weiter einkaufen
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Warenkorb wird geladen...</p>
      </div>

      <!-- Cart Items -->
      <div v-if="cart.length > 0 && !loading" class="cart-content">
        <div class="cart-items">
          <div v-for="item in cart" :key="item.productId" class="cart-item">
            <div class="item-image">
              <img :src="item.imageUrl" :alt="item.name" />
              <span v-if="item.offer" class="cart-offer-badge">-{{ item.offer.discountPercentage }}%</span>
            </div>
            
            <div class="item-details">
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-price-section">
                <div v-if="item.offer" class="original-price-strike">{{ formatPrice(item.price) }}</div>
                <div class="item-price" :class="{ 'offer-price': item.offer }">{{ formatPrice(item.finalPrice || item.price) }}</div>
              </div>
            </div>

            <div class="item-actions">
              <QuantityControl
                v-model="item.quantity"
                :min="1"
                :disabled="updating"
                @update:modelValue="updateQuantity(item)"
              />

              <div class="item-total">
                <span v-if="item.offer" class="total-original-price">{{ formatPrice(item.price * item.quantity) }}</span>
                <span :class="{ 'total-offer-price': item.offer }">{{ formatPrice((item.finalPrice || item.price) * item.quantity) }}</span>
              </div>

              <button 
                class="remove-btn" 
                @click="removeItem(item)"
                :disabled="updating"
                title="Entfernen"
              >
                <Trash2 :size="20" />
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary">
          <h2 class="summary-title">Zusammenfassung</h2>
          
          <div class="summary-row">
            <span>Zwischensumme</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>

          <div class="summary-row">
            <span>Versand</span>
            <span>{{ shippingCost === 0 ? 'Kostenlos' : formatPrice(shippingCost) }}</span>
          </div>

          <div v-if="subtotal < 50 && subtotal > 0" class="shipping-note">
            <Truck :size="16" />
            <span>Noch {{ formatPrice(50 - subtotal) }} bis zum kostenlosen Versand</span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row summary-total">
            <span>Gesamt</span>
            <span class="total-amount">{{ formatPrice(total) }}</span>
          </div>

          <button class="checkout-btn" @click="proceedToCheckout">
            <CreditCard :size="20" />
            Zur Kasse
          </button>

          <router-link to="/categories" class="continue-shopping-link">
            <ArrowLeft :size="16" />
            Weiter einkaufen
          </router-link>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog
      ref="deleteDialog"
      type="confirm"
      :title="deleteDialogTitle"
      :message="deleteDialogMessage"
      confirm-text="Entfernen"
      cancel-text="Abbrechen"
      :show-cancel="true"
      @confirm="confirmRemoveItem"
      @cancel="cancelRemoveItem"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getCart, 
  updateCartItem, 
  removeFromCart, 
  getCartTotal 
} from '../../services/business/cart'
import { 
  ShoppingCart, 
  Trash2, 
  Truck, 
  CreditCard,
  ArrowLeft 
} from 'lucide-vue-next'
import QuantityControl from '../../components/utility/QuantityControl.vue'
import AlertDialog from '../../components/dialog/AlertDialog.vue'

export default {
  name: 'CartView',
  components: {
    ShoppingCart,
    Trash2,
    Truck,
    CreditCard,
    ArrowLeft,
    QuantityControl,
    AlertDialog
  },
  setup() {
    const router = useRouter()
    const cart = ref([])
    const loading = ref(true)
    const updating = ref(false)
    const deleteDialog = ref(null)
    const itemToDelete = ref(null)
    const deleteDialogTitle = ref('')
    const deleteDialogMessage = ref('')

    // Load cart
    const loadCart = async () => {
      loading.value = true
      try {
        cart.value = await getCart()
      } catch (error) {
        console.error('Error loading cart:', error)
      } finally {
        loading.value = false
      }
    }

    // Format price
    const formatPrice = (price) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    // Computed values
    const subtotal = computed(() => {
      return cart.value.reduce((total, item) => total + ((item.finalPrice || item.price) * item.quantity), 0)
    })

    const shippingCost = computed(() => {
      return subtotal.value >= 50 ? 0 : 4.99
    })

    const total = computed(() => {
      return subtotal.value + shippingCost.value
    })

    // Update quantity
    const updateQuantity = async (item) => {
      if (item.quantity < 1) {
        item.quantity = 1
        return
      }

      updating.value = true
      try {
        await updateCartItem(item.productId, item.quantity)
        // Reload cart to get updated data
        await loadCart()
      } catch (error) {
        console.error('Error updating quantity:', error)
      } finally {
        updating.value = false
      }
    }

    // Remove item - show confirmation dialog
    const removeItem = (item) => {
      itemToDelete.value = item
      deleteDialogTitle.value = 'Artikel entfernen?'
      deleteDialogMessage.value = `Möchten Sie "${item.name}" wirklich aus dem Warenkorb entfernen?`
      deleteDialog.value.open()
    }

    // Confirm remove item
    const confirmRemoveItem = async () => {
      if (!itemToDelete.value) return

      updating.value = true
      try {
        await removeFromCart(itemToDelete.value.productId)
        // Reload cart to get updated data
        await loadCart()
      } catch (error) {
        console.error('Error removing item:', error)
      } finally {
        updating.value = false
        itemToDelete.value = null
      }
    }

    // Cancel remove item
    const cancelRemoveItem = () => {
      itemToDelete.value = null
    }

    // Proceed to checkout
    const proceedToCheckout = () => {
      router.push('/checkout')
    }

    // Load cart on mount
    onMounted(() => {
      loadCart()
    })

    return {
      cart,
      loading,
      updating,
      subtotal,
      shippingCost,
      total,
      formatPrice,
      updateQuantity,
      removeItem,
      confirmRemoveItem,
      cancelRemoveItem,
      proceedToCheckout,
      deleteDialog,
      deleteDialogTitle,
      deleteDialogMessage
    }
  }
}
</script>

<style scoped>
.cart-view {
  min-height: calc(100vh - 200px);
  padding: 2rem 1rem;
  background: var(--gray-50);
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.cart-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 2rem;
}

/* Empty Cart State */
.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  color: var(--gray-300);
  margin-bottom: 1.5rem;
}

.empty-cart h2 {
  font-size: 1.75rem;
  color: var(--gray-900);
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.empty-cart p {
  color: var(--gray-600);
  margin-bottom: 2rem;
  font-size: 1.125rem;
}

.continue-shopping-btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--primary-green);
  color: var(--white);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.continue-shopping-btn:hover {
  background: var(--primary-green-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-container p {
  color: var(--gray-600);
  font-size: 1.125rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--primary-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Cart Content */
.cart-content {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 2rem;
  align-items: start;
}

/* Cart Items */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.cart-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--gray-100);
  position: relative;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cart-item:hover .item-image img {
  transform: scale(1.05);
}

.cart-offer-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.375rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
  z-index: 10;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}

.item-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.4;
}

.item-price-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.original-price-strike {
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
  font-weight: 400;
}

.item-price {
  font-size: 1rem;
  color: var(--gray-600);
  font-weight: 500;
}

.item-price.offer-price {
  color: #ef4444;
  font-weight: 700;
  font-size: 1.125rem;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 150px;
}

.item-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.total-original-price {
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
  font-weight: 500;
}

.item-total > span {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--gray-900);
}

.total-offer-price {
  color: #ef4444 !important;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--gray-300);
  color: var(--error);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.remove-btn svg {
  display: block;
  stroke-width: 2;
}

.remove-btn:hover:not(:disabled) {
  background: var(--error-light);
  border-color: var(--error);
  transform: translateY(-1px);
}

.remove-btn:active:not(:disabled) {
  transform: translateY(0);
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Cart Summary */
.cart-summary {
  background: var(--white);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
  border: 1px solid var(--gray-200);
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 0;
  font-size: 1rem;
  color: var(--gray-700);
}

.summary-row span:first-child {
  font-weight: 500;
}

.summary-row span:last-child {
  font-weight: 600;
  color: var(--gray-900);
}

.shipping-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--primary-green-lighter);
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.875rem;
  color: var(--primary-green-dark);
  font-weight: 500;
  border: 1px solid var(--primary-green-light);
}

.shipping-note svg {
  flex-shrink: 0;
}

.summary-divider {
  height: 1px;
  background: var(--gray-200);
  margin: 1.25rem 0;
}

.summary-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  padding-top: 0.25rem;
}

.total-amount {
  color: var(--primary-green);
  font-size: 1.75rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--primary-green);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.checkout-btn:hover {
  background: var(--primary-green-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.checkout-btn:active {
  transform: translateY(0);
}

.continue-shopping-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  color: var(--primary-green);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.continue-shopping-link:hover {
  color: var(--primary-green-dark);
  background: var(--primary-green-lighter);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-view {
    padding: 1rem 0.5rem;
  }

  .cart-container {
    padding: 0;
  }

  .cart-title {
    font-size: 2rem;
    padding: 0 0.5rem;
  }

  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .item-image {
    width: 80px;
    height: 80px;
  }

  .item-name {
    font-size: 1rem;
  }

  .item-price {
    font-size: 0.875rem;
  }

  .item-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: auto;
    width: 100%;
  }

  .quantity-control {
    order: 2;
  }

  .item-total {
    order: 1;
    font-size: 1.125rem;
  }

  .remove-btn {
    order: 3;
  }

  .cart-summary {
    padding: 1.5rem;
  }

  .summary-title {
    font-size: 1.25rem;
  }

  .checkout-btn {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .cart-title {
    font-size: 1.75rem;
  }

  .empty-cart {
    padding: 3rem 1.5rem;
  }

  .empty-cart h2 {
    font-size: 1.5rem;
  }

  .empty-cart p {
    font-size: 1rem;
  }

  .quantity-btn {
    width: 32px;
    height: 32px;
  }

  .quantity-input {
    width: 50px;
    height: 32px;
  }

  .item-total {
    font-size: 1rem;
  }
}
</style>
