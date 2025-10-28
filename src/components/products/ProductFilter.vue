<template>
  <div class="product-filter">
    <div class="filter-header">
      <h3>Filter</h3>
      <button v-if="hasActiveFilters" @click="clearFilters" class="clear-btn">
        Zurücksetzen
      </button>
    </div>

    <!-- Category Filter -->
    <div class="filter-section">
      <h4 class="filter-title">Kategorien</h4>
      <div class="filter-options">
        <label 
          v-for="category in categories" 
          :key="category"
          class="filter-option"
        >
          <input 
            type="checkbox" 
            :value="category"
            v-model="selectedCategories"
            @change="updateFilters"
          />
          <span>{{ category }}</span>
        </label>
      </div>
    </div>

    <!-- Price Filter -->
    <div class="filter-section">
      <h4 class="filter-title">Preis</h4>
      <div class="price-range">
        <input 
          type="text" 
          v-model="priceRange.min"
          @blur="validatePrice('min')"
          placeholder="Min €"
          class="price-input"
        />
        <input 
          type="text" 
          v-model="priceRange.max"
          @blur="validatePrice('max')"
          placeholder="Max €"
          class="price-input"
        />
      </div>
    </div>

    <!-- Stock Filter -->
    <div class="filter-section">
      <h4 class="filter-title">Verfügbarkeit</h4>
      <div class="filter-options">
        <label class="filter-option">
          <input 
            type="checkbox" 
            v-model="inStockOnly"
            @change="updateFilters"
          />
          <span>Nur verfügbare Artikel</span>
        </label>
        <label class="filter-option">
          <input 
            type="checkbox" 
            v-model="showNewOnly"
            @change="updateFilters"
          />
          <span>Nur neue Produkte</span>
        </label>
      </div>
    </div>

    <!-- Sort -->
    <div class="filter-section">
      <h4 class="filter-title">Sortierung</h4>
      <select v-model="sortBy" @change="updateFilters" class="sort-select">
        <option value="">Standard</option>
        <option value="price-asc">Preis aufsteigend</option>
        <option value="price-desc">Preis absteigend</option>
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
        <option value="stock-desc">Lagerbestand</option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'ProductFilter',
  props: {
    categories: {
      type: Array,
      default: () => []
    }
  },
  emits: ['filter-change'],
  setup(props, { emit }) {
    const selectedCategories = ref([])
    const priceRange = ref({ min: '', max: '' })
    const inStockOnly = ref(false)
    const showNewOnly = ref(false)
    const sortBy = ref('')

    const hasActiveFilters = computed(() => {
      return selectedCategories.value.length > 0 ||
             priceRange.value.min !== '' ||
             priceRange.value.max !== '' ||
             inStockOnly.value ||
             showNewOnly.value ||
             sortBy.value !== ''
    })

    const validatePrice = (type) => {
      const value = priceRange.value[type]
      if (value === '') return
      
      // Entferne alles außer Zahlen und Punkt/Komma
      let cleanValue = value.toString().replace(/[^\d.,]/g, '')
      
      // Ersetze Komma durch Punkt
      cleanValue = cleanValue.replace(',', '.')
      
      // Parse zu Number
      const numValue = parseFloat(cleanValue)
      
      if (isNaN(numValue) || numValue < 0) {
        priceRange.value[type] = ''
      } else {
        priceRange.value[type] = numValue.toFixed(2)
      }
      
      updateFilters()
    }

    const updateFilters = () => {
      const minPrice = priceRange.value.min === '' ? null : parseFloat(priceRange.value.min)
      const maxPrice = priceRange.value.max === '' ? null : parseFloat(priceRange.value.max)
      
      emit('filter-change', {
        categories: selectedCategories.value,
        priceRange: { min: minPrice, max: maxPrice },
        inStockOnly: inStockOnly.value,
        showNewOnly: showNewOnly.value,
        sortBy: sortBy.value
      })
    }

    const clearFilters = () => {
      selectedCategories.value = []
      priceRange.value = { min: '', max: '' }
      inStockOnly.value = false
      showNewOnly.value = false
      sortBy.value = ''
      updateFilters()
    }

    return {
      selectedCategories,
      priceRange,
      inStockOnly,
      showNewOnly,
      sortBy,
      hasActiveFilters,
      validatePrice,
      updateFilters,
      clearFilters
    }
  }
}
</script>

<style scoped>
.product-filter {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 1rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #10b981;
}

.filter-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.clear-btn {
  background: none;
  border: none;
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: color 0.2s ease;
}

.clear-btn:hover {
  color: #059669;
  text-decoration: underline;
}

.filter-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.filter-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.filter-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4b5563;
  transition: color 0.2s ease;
}

.filter-option:hover {
  color: #1a1a1a;
}

.filter-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #10b981;
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.price-input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

/* Entferne die Pfeile bei Number-Inputs */
.price-input::-webkit-outer-spin-button,
.price-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.price-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.price-input:focus {
  outline: none;
  border-color: #10b981;
}

.sort-select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #10b981;
}

@media (max-width: 968px) {
  .product-filter {
    position: static;
    margin-bottom: 1.5rem;
  }
}
</style>
