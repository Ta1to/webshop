<template>
  <div class="admin-filters">
    <div class="search-box">
      <Search :size="20" />
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        type="text"
        :placeholder="searchPlaceholder"
      />
      <button v-if="searchQuery" @click="$emit('update:searchQuery', '')" class="btn-clear">
        <X :size="16" />
      </button>
    </div>

    <div class="filter-controls">
      <slot name="filters"></slot>

      <button v-if="hasActiveFilters" @click="$emit('reset')" class="btn-reset">
        <X :size="16" />
        Filter zurücksetzen
      </button>
    </div>
  </div>
</template>

<script setup>
import { Search, X } from 'lucide-vue-next'

defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: 'Suchen...'
  },
  hasActiveFilters: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:searchQuery', 'reset'])
</script>

<style scoped>
.admin-filters {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid var(--gray-200);
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
}

.search-box input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.btn-clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  background: var(--gray-100);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--gray-600);
  transition: all 0.2s ease;
}

.btn-clear:hover {
  background: var(--gray-200);
  color: var(--gray-800);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-reset {
  padding: 0.75rem 1.25rem;
  background: var(--gray-100);
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-reset:hover {
  background: var(--gray-200);
  border-color: var(--gray-400);
}

@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
  }
}
</style>
