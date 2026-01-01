<template>
  <div class="categories-view">
    <div class="categories-container">
      <!-- Search Results -->
      <div v-if="searchQuery">
        <div class="search-header">
          <h1 class="page-title">Suchergebnisse</h1>
          <p class="page-subtitle">
            Ergebnisse für "<strong>{{ searchQuery }}</strong>"
            <span v-if="!loading"> - {{ searchResults.length }} {{ searchResults.length === 1 ? 'Produkt' : 'Produkte' }} gefunden</span>
          </p>
          <button @click="clearSearch" class="clear-search-btn">
            <X :size="18" />
            Suche zurücksetzen
          </button>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Suche läuft...</p>
        </div>

        <div v-else-if="searchResults.length === 0" class="empty-state">
          <Search :size="64" class="empty-icon" />
          <h3>Keine Produkte gefunden</h3>
          <p>Versuchen Sie eine andere Suchanfrage oder durchstöbern Sie unsere Kategorien.</p>
          <button @click="clearSearch" class="btn-primary">Alle Kategorien anzeigen</button>
        </div>

        <div v-else class="search-results-grid">
          <router-link
            v-for="product in searchResults"
            :key="product.id"
            :to="`/product/${product.id}`"
            class="product-card"
          >
            <div class="product-image">
              <img :src="product.imageUrl" :alt="product.name" />
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ truncateText(product.description, 80) }}</p>
              <div class="product-footer">
                <span class="product-price">{{ formatPrice(product.price) }}</span>
                <span class="product-category">{{ product.category }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Categories Overview -->
      <div v-else>
        <h1 class="page-title">Kategorien</h1>
        <p class="page-subtitle">Entdecken Sie unsere Produktkategorien</p>
        
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Kategorien werden geladen...</p>
        </div>

        <div v-else-if="categories.length === 0" class="empty-state">
          <p>Keine Kategorien verfügbar</p>
        </div>
        
        <div v-else class="categories-grid">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-card"
            @click="goToCategory(category)"
          >
            <div class="category-icon">
              <component :is="getIcon(category.icon)" :size="48" />
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-description">{{ category.description }}</p>
            <div class="category-count">
              {{ getProductCount(category.id) }} Produkte
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAllDocuments } from '../../services/db'
import { searchProducts } from '../../services/search'
import { Laptop, Shirt, BookOpen, Dumbbell, Home, Search, X } from 'lucide-vue-next'

export default {
  name: 'CategoriesView',
  components: {
    Laptop,
    Shirt,
    BookOpen,
    Dumbbell,
    Home,
    Search,
    X
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const categories = ref([])
    const products = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const searchResults = ref([])

    const loadData = async () => {
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
          products.value = productsResult.data
        }

        // Check for search query
        if (route.query.search) {
          searchQuery.value = route.query.search
          await performSearch(route.query.search)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        loading.value = false
      }
    }

    const performSearch = async (query) => {
      loading.value = true
      try {
        const results = await searchProducts(query, { maxResults: 50 })
        searchResults.value = results
      } catch (error) {
        console.error('Error searching products:', error)
        searchResults.value = []
      } finally {
        loading.value = false
      }
    }

    // Watch for route query changes
    watch(() => route.query.search, (newSearch) => {
      if (newSearch) {
        searchQuery.value = newSearch
        performSearch(newSearch)
      } else {
        searchQuery.value = ''
        searchResults.value = []
      }
    })

    onMounted(loadData)

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

    const getProductCount = (categoryId) => {
      // Match by category name since products store category name, not ID
      const category = categories.value.find(c => c.id === categoryId)
      if (!category) return 0
      return products.value.filter(p => p.category === category.name).length
    }

    const goToCategory = (category) => {
      router.push(`/category/${category.slug}`)
    }

    const clearSearch = () => {
      searchQuery.value = ''
      searchResults.value = []
      router.push('/categories')
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    const truncateText = (text, maxLength) => {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    return {
      categories,
      loading,
      searchQuery,
      searchResults,
      getIcon,
      getProductCount,
      goToCategory,
      clearSearch,
      formatPrice,
      truncateText
    }
  }
}
</script>

<style scoped>
.categories-view {
  min-height: calc(100vh - 180px);
  padding: 2rem 0;
}

.categories-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.page-subtitle {
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 3rem;
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.category-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  color: white;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.category-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.category-count {
  color: #10b981;
  font-weight: 500;
  font-size: 0.95rem;
}

@media (max-width: 968px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Search Results Styles */
.search-header {
  text-align: center;
  margin-bottom: 2rem;
}

.search-header .page-title {
  margin-bottom: 0.75rem;
}

.search-header .page-subtitle {
  margin-bottom: 1rem;
}

.search-header .page-subtitle strong {
  color: #10b981;
  font-weight: 600;
}

.clear-search-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background-color: #e5e7eb;
  border-color: #d1d5db;
  color: #1f2937;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Search Results Grid */
.search-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 240px;
  overflow: hidden;
  background-color: #f3f4f6;
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
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  flex: 1;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
}

.product-category {
  font-size: 0.85rem;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .search-results-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .product-image {
    height: 200px;
  }
}
</style>
