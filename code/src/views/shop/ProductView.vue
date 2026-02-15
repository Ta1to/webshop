<template>
  <div class="product-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Produkt wird geladen...</p>
    </div>

    <!-- Product Content -->
    <div class="product-container" v-else-if="product">
      <div class="product-layout">
        <!-- Product Image -->
        <div class="product-image-section">
          <div class="product-image-main">
            <img :src="product.imageUrl || product.image" :alt="product.name" />
            <span v-if="activeOffer" class="offer-badge">-{{ activeOffer.discountPercentage }}%</span>
          </div>
        </div>

        <!-- Product Details -->
        <div class="product-details-section">
          <div class="breadcrumb">
            <router-link to="/categories">Kategorien</router-link>
            <span class="separator">/</span>
            <router-link :to="`/category/${categorySlug}`">{{ categoryName }}</router-link>
            <span class="separator">/</span>
            <span>{{ product.name }}</span>
          </div>

          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-meta">
            <div class="price-section">
              <div v-if="activeOffer" class="original-price-large">{{ formatPrice(product.price) }}</div>
              <div class="product-price-large" :class="{ 'offer-price': activeOffer }">{{ formatPrice(finalPrice) }}</div>
            </div>
            <StockIndicator :stock="product.stock">
              <template #icon>
                <Package :size="18" />
              </template>
            </StockIndicator>
          </div>

          <!-- Offer Info -->
          <div v-if="activeOffer && offerEndDate" class="offer-info">
            <div class="offer-validity">
              Angebot gültig bis {{ formatDate(offerEndDate) }}
            </div>
          </div>

          <p class="product-description-full">{{ product.description }}</p>

          <div class="product-actions">
            <div class="quantity-selector">
              <label for="quantity">Menge:</label>
              <QuantityControl
                v-model="quantity"
                :min="1"
                :max="product.stock"
                :disabled="product.stock === 0"
              />
            </div>

            <div class="action-buttons">
              <button 
                class="wishlist-btn-secondary" 
                @click="toggleWishlist"
                :class="{ 'is-wishlisted': isProductInWishlist }"
                :title="isProductInWishlist ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'"
              > 
                <Heart :size="20" :fill="isProductInWishlist ? 'currentColor' : 'none'" />
              </button>
              
              <button class="add-to-cart-btn-large" @click="addToCart" :disabled="product.stock === 0">
                <ShoppingCart :size="20" />
                {{ product.stock === 0 ? 'Nicht verfügbar' : 'In den Warenkorb' }}
              </button>
            </div>
          </div>

          <div class="product-info-grid">
            <div class="info-item">
              <Truck :size="24" />
              <div>
                <div class="info-title">Kostenloser Versand</div>
                <div class="info-text">Ab 50€ Bestellwert</div>
              </div>
            </div>
            <div class="info-item">
              <RotateCcw :size="24" />
              <div>
                <div class="info-title">30 Tage Rückgabe</div>
                <div class="info-text">Kostenlose Rücksendung</div>
              </div>
            </div>
            <div class="info-item">
              <Shield :size="24" />
              <div>
                <div class="info-title">Sichere Zahlung</div>
                <div class="info-text">SSL verschlüsselt</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length > 0" class="related-section">
        <h2 class="related-title">Ähnliche Produkte</h2>
        <div class="related-grid">
          <div 
            v-for="relatedProduct in relatedProducts" 
            :key="relatedProduct.id"
            class="related-card"
            @click="goToProduct(relatedProduct)"
          >
            <div class="related-image">
              <img :src="relatedProduct.imageUrl || relatedProduct.image" :alt="relatedProduct.name" />
            </div>
            <div class="related-info">
              <h4 class="related-name">{{ relatedProduct.name }}</h4>
              <div class="related-price">{{ formatPrice(relatedProduct.price) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <AlertCircle :size="64" />
      <h2>Produkt nicht gefunden</h2>
      <router-link to="/categories" class="back-link">Zurück zu den Kategorien</router-link>
    </div>

    <!-- Cart Dialog -->
    <CartDialog
      :is-open="showCartDialog"
      :product="product || {}"
      :quantity="quantity"
      :cart-item-count="cartItemCount"
      :cart-total="cartTotal"
      :final-price="finalPrice"
      :active-offer="activeOffer"
      @close="closeCartDialog"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAllDocuments } from '../../services/firebase/db'
import { addToCart as addToCartService, getCartItemCount, getCartTotal } from '../../services/business/cart'
import { addToWishlist, removeFromWishlist, isInWishlist } from '../../services/business/wishlist'
import { getOfferByProductId } from '../../services/business/offers'
import CartDialog from '../../components/dialog/CartDialog.vue'
import QuantityControl from '../../components/utility/QuantityControl.vue'
import StockIndicator from '../../components/utility/StockIndicator.vue'
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  RotateCcw, 
  Shield,
  AlertCircle,
  Heart
} from 'lucide-vue-next'

export default {
  name: 'ProductView',
  components: {
    ShoppingCart,
    Package,
    Truck,
    RotateCcw,
    Shield,
    AlertCircle,
    Heart,
    CartDialog,
    QuantityControl,
    StockIndicator
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const quantity = ref(1)
    const products = ref([])
    const categories = ref([])
    const loading = ref(true)
    const showCartDialog = ref(false)
    const cartItemCount = ref(0)
    const cartTotal = ref(0)
    const isProductInWishlist = ref(false)
    const activeOffer = ref(null)

    // Check if product is in wishlist
    const checkWishlistStatus = async () => {
      if (product.value) {
        isProductInWishlist.value = await isInWishlist(product.value.id)
      }
    }

    // Load offer for product
    const loadProductOffer = async () => {
      if (product.value) {
        try {
          const offer = await getOfferByProductId(product.value.id)
          activeOffer.value = offer
        } catch (error) {
          console.error('Error loading product offer:', error)
          activeOffer.value = null
        }
      }
    }

    // Load data from Firestore
    onMounted(async () => {
      loading.value = true
      try {
        const [productsResult, categoriesResult] = await Promise.all([
          getAllDocuments('products'),
          getAllDocuments('categories')
        ])
        
        if (productsResult.success) {
          products.value = productsResult.data
        }
        if (categoriesResult.success) {
          categories.value = categoriesResult.data
        }
      } catch (error) {
        console.error('Error loading product data:', error)
      } finally {
        loading.value = false
        await checkWishlistStatus()
        await loadProductOffer()
      }
    })

    const product = computed(() => {
      const id = route.params.id
      return products.value.find(p => p.id === id)
    })

    const category = computed(() => {
      if (!product.value) return null
      return categories.value.find(c => c.name === product.value.category)
    })

    const categoryName = computed(() => {
      return category.value?.name || ''
    })

    const categorySlug = computed(() => {
      return category.value?.slug || ''
    })

    const relatedProducts = computed(() => {
      if (!product.value) return []
      return products.value
        .filter(p => p.category === product.value.category && p.id !== product.value.id)
        .slice(0, 4)
    })

    const finalPrice = computed(() => {
      if (!product.value) return 0
      if (!activeOffer.value) return product.value.price
      
      const discount = product.value.price * (activeOffer.value.discountPercentage / 100)
      return product.value.price - discount
    })

    const savings = computed(() => {
      if (!product.value || !activeOffer.value) return 0
      return product.value.price - finalPrice.value
    })

    const offerEndDate = computed(() => {
      if (!activeOffer.value || !activeOffer.value.endDate) return null
      return new Date(activeOffer.value.endDate)
    })

    const formatPrice = (price) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date)
    }

    const addToCart = async () => {
      if (product.value && product.value.stock > 0) {
        const result = await addToCartService(
          product.value.id, 
          quantity.value
        )
        
        if (result.success) {
          // Update cart info
          cartItemCount.value = await getCartItemCount()
          cartTotal.value = await getCartTotal()
          
          // Show dialog
          showCartDialog.value = true
          
          // Reset quantity
          quantity.value = 1
        } else {
          alert('Fehler beim Hinzufügen zum Warenkorb')
        }
      }
    }

    const closeCartDialog = () => {
      showCartDialog.value = false
    }

    const goToProduct = (newProduct) => {
      router.push(`/product/${newProduct.id}`)
    }

    const toggleWishlist = async () => {
      if (!product.value) return
      
      if (isProductInWishlist.value) {
        const result = await removeFromWishlist(product.value.id)
        if (result.success) {
          isProductInWishlist.value = false
        }
      } else {
        const result = await addToWishlist(product.value.id)
        if (result.success) {
          isProductInWishlist.value = true
        }
      }
    }

    // Reset quantity and check wishlist status when product changes
    watch(() => route.params.id, async () => {
      quantity.value = 1
      await checkWishlistStatus()
      await loadProductOffer()
    })

    return {
      product,
      category,
      categoryName,
      categorySlug,
      quantity,
      relatedProducts,
      loading,
      showCartDialog,
      cartItemCount,
      cartTotal,
      isProductInWishlist,
      activeOffer,
      finalPrice,
      savings,
      offerEndDate,
      formatPrice,
      formatDate,
      addToCart,
      closeCartDialog,
      goToProduct,
      toggleWishlist
    }
  }
}
</script>

<style scoped>
.product-view {
  min-height: calc(100vh - 180px);
  padding: 2rem 0;
  background: #f8f9fa;
}

.product-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.loading-container {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #10b981;
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

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-image-section {
  position: relative;
}

.product-image-main {
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f0f0;
}

.product-image-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.offer-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  z-index: 10;
  letter-spacing: 0.5px;
}

.product-details-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.breadcrumb {
  font-size: 0.9rem;
  color: #666;
}

.breadcrumb a {
  color: #10b981;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 0.5rem;
}

.product-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.product-meta {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.original-price-large {
  font-size: 1.25rem;
  color: #999;
  text-decoration: line-through;
  font-weight: 500;
}

.product-price-large {
  font-size: 2rem;
  font-weight: 700;
  color: #10b981;
}

.product-price-large.offer-price {
  color: #ef4444;
}

.savings-badge {
  display: inline-block;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  align-self: flex-start;
}

.offer-info {
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-left: 4px solid #ef4444;
  border-radius: 8px;
}

.offer-validity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #991b1b;
  font-weight: 600;
  font-size: 0.95rem;
}

.offer-icon {
  font-size: 1.25rem;
}

.product-description-full {
  color: #666;
  line-height: 1.6;
  font-size: 1.05rem;
}

.product-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-selector label {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
}

.action-buttons {
  flex: 1;
  display: flex;
  gap: 0.75rem;
}

.wishlist-btn-secondary {
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.wishlist-btn-secondary:hover {
  border-color: #ef4444;
  color: #ef4444;
  background-color: var(--error-light);
}

.wishlist-btn-secondary:active {
  transform: scale(0.95);
}

.wishlist-btn-secondary.is-wishlisted {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
  animation: heartBeat 0.3s ease;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.add-to-cart-btn-large {
  flex: 1;
  padding: 1rem 2rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.add-to-cart-btn-large:hover:not(:disabled) {
  background: #059669;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.add-to-cart-btn-large:active:not(:disabled) {
  transform: scale(0.98);
}

.add-to-cart-btn-large:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.product-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #666;
}

.info-item svg {
  color: #10b981;
}

.info-title {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.info-text {
  font-size: 0.9rem;
}

.related-section {
  margin-top: 3rem;
}

.related-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.related-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.related-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.related-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f0f0f0;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-info {
  padding: 1rem;
}

.related-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.related-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #10b981;
}

.not-found {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  color: #666;
}

.not-found svg {
  margin-bottom: 1rem;
  color: #ccc;
}

.not-found h2 {
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.back-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
}

@media (max-width: 968px) {
  .product-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .product-image-main {
    height: 400px;
  }

  .product-title {
    font-size: 1.5rem;
  }

  .product-actions {
    flex-direction: column;
  }

  .quantity-selector {
    width: 100%;
  }

  .action-buttons {
    width: 100%;
  }

  .add-to-cart-btn-large {
    width: 100%;
  }
}
</style>
