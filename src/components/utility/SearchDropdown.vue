<template>
  <div class="search-dropdown" v-if="isOpen && hasResults">
    <!-- Product Suggestions -->
    <div v-if="suggestions.products.length > 0" class="suggestion-section">
      <div class="section-title">Produkte</div>
      <router-link
        v-for="product in suggestions.products"
        :key="product.id"
        :to="`/product/${product.id}`"
        class="suggestion-item product-item"
        @click="handleSelect"
      >
        <img 
          v-if="product.imageUrl" 
          :src="product.imageUrl" 
          :alt="product.text"
          class="product-image"
        />
        <div class="product-info">
          <span class="product-name">{{ product.text }}</span>
          <span class="product-price">{{ formatPrice(product.price) }}</span>
        </div>
        <TrendingUp :size="16" class="suggestion-icon" />
      </router-link>
    </div>

    <!-- Category Suggestions -->
    <div v-if="suggestions.categories.length > 0" class="suggestion-section">
      <div class="section-title">Kategorien</div>
      <router-link
        v-for="category in suggestions.categories"
        :key="category.slug"
        :to="`/category/${category.slug}`"
        class="suggestion-item category-item"
        @click="handleSelect"
      >
        <component :is="getIcon(category.icon)" :size="18" class="category-icon" />
        <span class="suggestion-text">{{ category.text }}</span>
        <LayoutGrid :size="16" class="suggestion-icon" />
      </router-link>
    </div>

    <!-- Tag Suggestions -->
    <div v-if="suggestions.tags.length > 0" class="suggestion-section">
      <div class="section-title">Suchbegriffe</div>
      <button
        v-for="(tag, index) in suggestions.tags"
        :key="index"
        class="suggestion-item tag-item"
        @click="handleTagSelect(tag.text)"
      >
        <Hash :size="18" class="tag-icon" />
        <span class="suggestion-text">{{ tag.text }}</span>
        <Search :size="16" class="suggestion-icon" />
      </button>
    </div>

    <!-- View All Results -->
    <div v-if="searchQuery.length > 0" class="suggestion-section">
      <button class="suggestion-item view-all" @click="handleViewAll">
        <Search :size="18" />
        <span>Alle Ergebnisse für "<strong>{{ searchQuery }}</strong>" anzeigen</span>
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { Search, TrendingUp, Hash, LayoutGrid, Laptop, Shirt, BookOpen, Dumbbell, Home } from 'lucide-vue-next'

export default {
  name: 'SearchDropdown',
  components: {
    Search,
    TrendingUp,
    Hash,
    LayoutGrid,
    Laptop,
    Shirt,
    BookOpen,
    Dumbbell,
    Home
  },
  props: {
    suggestions: {
      type: Object,
      default: () => ({
        products: [],
        categories: [],
        tags: []
      })
    },
    isOpen: {
      type: Boolean,
      default: false
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['select', 'tag-select', 'view-all', 'close'],
  setup(props, { emit }) {
    const hasResults = computed(() => {
      return props.suggestions.products.length > 0 || 
             props.suggestions.categories.length > 0 || 
             props.suggestions.tags.length > 0
    })

    const formatPrice = (price) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

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

    const handleSelect = () => {
      emit('select')
      emit('close')
    }

    const handleTagSelect = (tag) => {
      emit('tag-select', tag)
    }

    const handleViewAll = () => {
      emit('view-all')
      emit('close')
    }

    return {
      hasResults,
      formatPrice,
      getIcon,
      handleSelect,
      handleTagSelect,
      handleViewAll
    }
  }
}
</script>

<style scoped>
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin-top: 0.5rem;
  max-height: 70vh;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-section {
  border-bottom: 1px solid var(--gray-200);
  padding: 0.5rem 0;
}

.suggestion-section:last-child {
  border-bottom: none;
}

.section-title {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--gray-500);
  letter-spacing: 0.05em;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--gray-700);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 0.95rem;
}

.suggestion-item:hover {
  background-color: var(--primary-green-lighter);
  color: var(--primary-green);
}

/* Product Items */
.product-item {
  gap: 1rem;
}

.product-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--gray-200);
  flex-shrink: 0;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 500;
  color: var(--gray-800);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 0.85rem;
  color: var(--gray-600);
  font-weight: 600;
}

.suggestion-item:hover .product-name {
  color: var(--primary-green);
}

/* Category Items */
.category-item {
  font-weight: 500;
}

.category-icon {
  color: var(--primary-green);
}

/* Tag Items */
.tag-item {
  font-weight: 400;
}

.tag-icon {
  color: var(--gray-500);
}

.suggestion-text {
  flex: 1;
}

.suggestion-icon {
  color: var(--gray-400);
  flex-shrink: 0;
}

.suggestion-item:hover .suggestion-icon {
  color: var(--primary-green);
}

/* View All Button */
.view-all {
  background-color: var(--gray-50);
  font-weight: 600;
  color: var(--primary-green);
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0 0 8px 8px;
}

.view-all:hover {
  background-color: var(--primary-green);
  color: var(--white);
}

.view-all strong {
  font-weight: 700;
}

/* Scrollbar Styling */
.search-dropdown::-webkit-scrollbar {
  width: 8px;
}

.search-dropdown::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 0 8px 8px 0;
}

.search-dropdown::-webkit-scrollbar-thumb {
  background: var(--gray-400);
  border-radius: 4px;
}

.search-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-dropdown {
    max-height: 60vh;
  }

  .suggestion-item {
    padding: 0.625rem 0.75rem;
  }

  .product-image {
    width: 40px;
    height: 40px;
  }
}
</style>
