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
            <div class="product-price-large">{{ formatPrice(product.price) }}</div>
            <div class="product-stock" :class="stockClass">
              <Package :size="18" />
              {{ stockText }}
            </div>
          </div>

          <p class="product-description-full">{{ product.description }}</p>

          <div class="product-actions">
            <div class="quantity-selector">
              <label for="quantity">Menge:</label>
              <input 
                id="quantity"
                type="number" 
                v-model.number="quantity" 
                min="1" 
                :max="product.stock" 
              />
            </div>

            <button class="add-to-cart-btn-large" @click="addToCart" :disabled="product.stock === 0">
              <ShoppingCart :size="20" />
              {{ product.stock === 0 ? 'Nicht verfügbar' : 'In den Warenkorb' }}
            </button>
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
      @close="closeCartDialog"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAllDocuments } from '../../services/db'
import { addToCart as addToCartService, getCartItemCount, getCartTotal } from '../../services/cart'
import CartDialog from '../../components/CartDialog.vue'
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  RotateCcw, 
  Shield,
  AlertCircle 
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
    CartDialog
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

    const stockClass = computed(() => {
      if (!product.value) return ''
      if (product.value.stock === 0) return 'out-of-stock'
      if (product.value.stock < 10) return 'low-stock'
      return 'in-stock'
    })

    const stockText = computed(() => {
      if (!product.value) return ''
      if (product.value.stock === 0) return 'Nicht auf Lager'
      if (product.value.stock < 10) return `Nur noch ${product.value.stock} auf Lager`
      return `${product.value.stock} auf Lager`
    })

    const relatedProducts = computed(() => {
      if (!product.value) return []
      return products.value
        .filter(p => p.category === product.value.category && p.id !== product.value.id)
        .slice(0, 4)
    })

    const formatPrice = (price) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    const addToCart = async () => {
      if (product.value && product.value.stock > 0) {
        const result = await addToCartService(
          product.value.id, 
          quantity.value,
          {
            name: product.value.name,
            price: product.value.price,
            imageUrl: product.value.imageUrl || product.value.image
          }
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

    // Reset quantity when product changes
    watch(() => route.params.id, () => {
      quantity.value = 1
    })

    return {
      product,
      category,
      categoryName,
      categorySlug,
      quantity,
      stockClass,
      stockText,
      relatedProducts,
      loading,
      showCartDialog,
      cartItemCount,
      cartTotal,
      formatPrice,
      addToCart,
      closeCartDialog,
      goToProduct
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
  align-items: center;
  gap: 2rem;
}

.product-price-large {
  font-size: 2rem;
  font-weight: 700;
  color: #10b981;
}

.product-stock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.product-stock.in-stock {
  color: #28a745;
}

.product-stock.low-stock {
  color: #ff9800;
}

.product-stock.out-of-stock {
  color: #dc3545;
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
  gap: 0.75rem;
}

.quantity-selector label {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.quantity-selector input {
  width: 80px;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  background: white;
  transition: border-color 0.2s;
}

.quantity-selector input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.quantity-selector input::-webkit-inner-spin-button,
.quantity-selector input::-webkit-outer-spin-button {
  opacity: 1;
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

  .add-to-cart-btn-large {
    width: 100%;
  }
}
</style>
