<template>
  <div v-if="isOpen" class="cart-dialog-overlay" @click.self="closeDialog">
    <div class="cart-dialog">
      <div class="dialog-header">
        <div class="success-icon">
          <CheckCircle :size="48" />
        </div>
        <h2>Zum Warenkorb hinzugefügt!</h2>
      </div>

      <div class="dialog-content">
        <div class="product-info">
          <div class="product-image">
            <img :src="product.imageUrl" :alt="product.name" />
          </div>
          <div class="product-details">
            <h3>{{ product.name }}</h3>
            <p class="product-quantity">Menge: {{ quantity }}</p>
            <p class="product-price">{{ formatPrice(product.price * quantity) }}</p>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>Artikel im Warenkorb:</span>
            <span class="summary-value">{{ cartItemCount }}</span>
          </div>
          <div class="summary-row">
            <span>Gesamtsumme:</span>
            <span class="summary-value">{{ formatPrice(cartTotal) }}</span>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="continue-shopping-btn" @click="continueShopping">
          <ArrowLeft :size="20" />
          Weiter einkaufen
        </button>
        <button class="go-to-cart-btn" @click="goToCart">
          <ShoppingCart :size="20" />
          Zum Warenkorb
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle, ShoppingCart, ArrowLeft } from 'lucide-vue-next'

export default {
  name: 'CartDialog',
  components: {
    CheckCircle,
    ShoppingCart,
    ArrowLeft
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: () => ({})
    },
    quantity: {
      type: Number,
      default: 1
    },
    cartItemCount: {
      type: Number,
      default: 0
    },
    cartTotal: {
      type: Number,
      default: 0
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const router = useRouter()

    // Format price
    const formatPrice = (price) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    // Close dialog
    const closeDialog = () => {
      emit('close')
    }

    // Continue shopping
    const continueShopping = () => {
      closeDialog()
    }

    // Go to cart
    const goToCart = () => {
      closeDialog()
      router.push('/cart')
    }

    // Close on Escape key
    watch(() => props.isOpen, (newValue) => {
      if (newValue) {
        const handleEscape = (e) => {
          if (e.key === 'Escape') {
            closeDialog()
            document.removeEventListener('keydown', handleEscape)
          }
        }
        document.addEventListener('keydown', handleEscape)
      }
    })

    return {
      formatPrice,
      closeDialog,
      continueShopping,
      goToCart
    }
  }
}
</script>

<style scoped>
.cart-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.cart-dialog {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dialog-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #eee;
}

.success-icon {
  color: var(--primary-green);
  margin-bottom: 1rem;
  animation: scaleIn 0.4s ease-out 0.2s both;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.dialog-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.dialog-content {
  padding: 2rem;
}

.product-info {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-details h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.product-quantity {
  font-size: 0.875rem;
  color: #666;
  margin: 0.25rem 0;
}

.product-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary-green);
  margin: 0.5rem 0 0 0;
}

.cart-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: #333;
}

.summary-value {
  font-weight: 700;
  color: #1a1a1a;
}

.dialog-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1.5rem 2rem 2rem;
}

.continue-shopping-btn,
.go-to-cart-btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.continue-shopping-btn {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #ddd;
}

.continue-shopping-btn:hover {
  background: #e9ecef;
  border-color: #ccc;
}

.go-to-cart-btn {
  background: var(--primary-green);
  color: white;
}

.go-to-cart-btn:hover {
  background: var(--primary-green-dark);
}

/* Responsive Design */
@media (max-width: 480px) {
  .cart-dialog {
    max-width: 100%;
    margin: 1rem;
  }

  .dialog-actions {
    grid-template-columns: 1fr;
  }

  .product-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .product-image {
    width: 120px;
    height: 120px;
  }
}
</style>
