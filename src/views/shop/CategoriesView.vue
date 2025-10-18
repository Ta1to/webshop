<template>
  <div class="categories-view">
    <div class="categories-container">
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
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllDocuments } from '../../services/db'
import { Laptop, Shirt, BookOpen, Dumbbell, Home } from 'lucide-vue-next'

export default {
  name: 'CategoriesView',
  components: {
    Laptop,
    Shirt,
    BookOpen,
    Dumbbell,
    Home
  },
  setup() {
    const router = useRouter()
    
    const categories = ref([])
    const products = ref([])
    const loading = ref(true)

    onMounted(async () => {
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
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        loading.value = false
      }
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

    const getProductCount = (categoryId) => {
      // Match by category name since products store category name, not ID
      const category = categories.value.find(c => c.id === categoryId)
      if (!category) return 0
      return products.value.filter(p => p.category === category.name).length
    }

    const goToCategory = (category) => {
      router.push(`/category/${category.slug}`)
    }

    return {
      categories,
      loading,
      getIcon,
      getProductCount,
      goToCategory
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

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
