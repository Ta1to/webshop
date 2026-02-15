<template>
  <div class="category-view">
    <div class="category-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Kategorie wird geladen...</p>
      </div>

      <template v-else>
        <!-- Category Header -->
        <div v-if="category" class="category-header">
        <div class="category-icon-large">
          <component :is="getIcon(category.icon)" :size="64" />
        </div>
        <div class="category-info">
          <h1 class="category-title">{{ category.name }}</h1>
          <p class="category-description">{{ category.description }}</p>
          <p class="product-count">{{ categoryProducts.length }} Produkte verfügbar</p>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="categoryProducts.length > 0" class="products-grid">
        <div 
          v-for="product in categoryProducts" 
          :key="product.id"
          class="product-card"
          @click="goToProduct(product)"
        >
          <div class="product-image">
            <img :src="product.imageUrl || product.image" :alt="product.name" />
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-footer">
              <span class="product-price">{{ formatPrice(product.price) }}</span>
              <span class="product-stock" :class="{ 'low-stock': product.stock < 10 }">
                {{ product.stock }} auf Lager
              </span>
            </div>
            <button class="add-to-cart-btn">
              <ShoppingCart :size="18" />
              In den Warenkorb
            </button>
          </div>
        </div>
      </div>

        <div v-else class="empty-state">
          <Package :size="64" />
          <p>Keine Produkte in dieser Kategorie gefunden.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAllDocuments } from '../../services/firebase/db'
import { Laptop, Shirt, BookOpen, Dumbbell, Home, ShoppingCart, Package } from 'lucide-vue-next'

export default {
  name: 'CategoryView',
  components: {
    Laptop,
    Shirt,
    BookOpen,
    Dumbbell,
    Home,
    ShoppingCart,
    Package
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const categories = ref([])
    const products = ref([])
    const loading = ref(true)

    onMounted(async () => {
      loading.value = true
      try {
        const [categoriesResult, productsResult] = await Promise.all([
          getAllDocuments('categories'),
          getAllDocuments('products')
        ])
        
        if (categoriesResult.success) {
          categories.value = categoriesResult.data
        }
        if (productsResult.success) {
          // Import offers service and apply offers to products
          const { getProductsWithOffers } = await import('../../services/offers')
          products.value = await getProductsWithOffers(productsResult.data)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        loading.value = false
      }
    })

    const category = computed(() => {
      const slug = route.params.slug
      return categories.value.find(c => c.slug === slug)
    })

    const categoryProducts = computed(() => {
      if (!category.value) return []
      return products.value.filter(p => p.category === category.value.name)
    })

    const getIcon = (iconName) => {
      const icons = {
        'Laptop': Laptop,
        'Shirt': Shirt,
        'BookOpen': BookOpen,
        'Dumbbell': Dumbbell,
        'Home': Home
      }
      return icons[iconName] || Home
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    const goToProduct = (product) => {
      router.push(`/product/${product.id}`)
    }

    return {
      category,
      categoryProducts,
      loading,
      getIcon,
      formatPrice,
      goToProduct
    }
  }
}
</script>

<style scoped>
.category-view {
  min-height: calc(100vh - 180px);
  padding: 2rem 0;
}

.category-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
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

.category-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.category-icon-large {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 20px;
  color: white;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
}

.category-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.category-description {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.product-count {
  color: #10b981;
  font-weight: 500;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f0f0f0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 1.25rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
}

.product-stock {
  font-size: 0.85rem;
  color: #28a745;
}

.product-stock.low-stock {
  color: #ff6b6b;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-state svg {
  margin-bottom: 1rem;
  color: #ccc;
}

@media (max-width: 768px) {
  .category-header {
    flex-direction: column;
    text-align: center;
  }

  .category-title {
    font-size: 1.5rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>
