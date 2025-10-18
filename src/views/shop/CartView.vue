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
            </div>
            
            <div class="item-details">
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-price">{{ formatPrice(item.price) }}</div>
            </div>

            <div class="item-actions">
              <div class="quantity-control">
                <button 
                  class="quantity-btn" 
                  @click="decreaseQuantity(item)"
                  :disabled="updating"
                >
                  <Minus :size="16" />
                </button>
                <input 
                  type="number" 
                  class="quantity-input" 
                  v-model.number="item.quantity"
                  @change="updateQuantity(item)"
                  min="1"
                  :disabled="updating"
                />
                <button 
                  class="quantity-btn" 
                  @click="increaseQuantity(item)"
                  :disabled="updating"
                >
                  <Plus :size="16" />
                </button>
              </div>

              <div class="item-total">
                {{ formatPrice(item.price * item.quantity) }}
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
} from '../../services/cart'
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  Truck, 
  CreditCard,
  ArrowLeft 
} from 'lucide-vue-next'

export default {
  name: 'CartView',
  components: {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    Truck,
    CreditCard,
    ArrowLeft
  },
  setup() {
    const router = useRouter()
    const cart = ref([])
    const loading = ref(true)
    const updating = ref(false)

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
      return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
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
        const result = await updateCartItem(item.productId, item.quantity)
        if (result.success) {
          cart.value = result.cart
        }
      } catch (error) {
        console.error('Error updating quantity:', error)
      } finally {
        updating.value = false
      }
    }

    // Increase quantity
    const increaseQuantity = async (item) => {
      item.quantity++
      await updateQuantity(item)
    }

    // Decrease quantity
    const decreaseQuantity = async (item) => {
      if (item.quantity > 1) {
        item.quantity--
        await updateQuantity(item)
      }
    }

    // Remove item
    const removeItem = async (item) => {
      if (!confirm(`${item.name} aus dem Warenkorb entfernen?`)) {
        return
      }

      updating.value = true
      try {
        const result = await removeFromCart(item.productId)
        if (result.success) {
          cart.value = result.cart
        }
      } catch (error) {
        console.error('Error removing item:', error)
      } finally {
        updating.value = false
      }
    }

    // Proceed to checkout
    const proceedToCheckout = () => {
      // TODO: Implement checkout
      alert('Checkout-Funktionalität wird in Kürze implementiert!')
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
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      proceedToCheckout
    }
  }
}
</script>

<style scoped>
.cart-view {
  min-height: calc(100vh - 200px);
  padding: 2rem 1rem;
  background: #f8f9fa;
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
}

.cart-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

/* Empty Cart State */
.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  color: #ccc;
  margin-bottom: 1rem;
}

.empty-cart h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-cart p {
  color: #666;
  margin-bottom: 2rem;
}

.continue-shopping-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--primary-green);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.3s;
}

.continue-shopping-btn:hover {
  background: var(--primary-green-dark);
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
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
  grid-template-columns: 1fr 400px;
  gap: 2rem;
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.item-price {
  font-size: 1rem;
  color: #666;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.25rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.quantity-btn:hover:not(:disabled) {
  background: var(--primary-green);
  color: white;
  border-color: var(--primary-green);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 50px;
  height: 32px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 600;
}

.item-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.remove-btn:hover:not(:disabled) {
  background: #ffebee;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Cart Summary */
.cart-summary {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 1rem;
  color: #333;
}

.shipping-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--primary-green-lighter);
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.875rem;
  color: var(--primary-green-dark);
}

.summary-divider {
  height: 1px;
  background: #eee;
  margin: 1rem 0;
}

.summary-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  padding-top: 1rem;
}

.total-amount {
  color: var(--primary-green);
  font-size: 1.5rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.checkout-btn:hover {
  background: #218838;
}

.continue-shopping-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: var(--primary-green);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.continue-shopping-link:hover {
  color: var(--primary-green-dark);
}

/* Responsive Design */
@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }

  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }

  .item-image {
    width: 80px;
    height: 80px;
  }

  .item-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .item-total {
    order: -1;
  }
}
</style>
