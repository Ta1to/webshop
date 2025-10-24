<template>
  <div v-if="totalPages > 1" class="pagination">
    <button 
      @click="goToFirstPage" 
      :disabled="currentPage === 1"
      class="btn-page"
      title="Erste Seite"
    >
      <ChevronsLeft :size="16" />
    </button>
    
    <button 
      @click="goToPreviousPage" 
      :disabled="currentPage === 1"
      class="btn-page"
      title="Vorherige Seite"
    >
      <ChevronLeft :size="16" />
    </button>

    <div class="page-numbers">
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        :class="['btn-page-number', { active: page === currentPage }]"
      >
        {{ page }}
      </button>
    </div>

    <button 
      @click="goToNextPage" 
      :disabled="currentPage === totalPages"
      class="btn-page"
      title="Nächste Seite"
    >
      <ChevronRight :size="16" />
    </button>

    <button 
      @click="goToLastPage" 
      :disabled="currentPage === totalPages"
      class="btn-page"
      title="Letzte Seite"
    >
      <ChevronsRight :size="16" />
    </button>

    <div class="page-info">
      Seite {{ currentPage }} von {{ totalPages }}
    </div>

    <select v-model.number="itemsPerPageModel" class="items-per-page">
      <option :value="10">10 pro Seite</option>
      <option :value="25">25 pro Seite</option>
      <option :value="50">50 pro Seite</option>
      <option :value="100">100 pro Seite</option>
    </select>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 25
  }
})

const emit = defineEmits(['update:currentPage', 'update:itemsPerPage'])

const itemsPerPageModel = computed({
  get: () => props.itemsPerPage,
  set: (value) => emit('update:itemsPerPage', value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(props.totalPages, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goToFirstPage = () => goToPage(1)
const goToPreviousPage = () => goToPage(props.currentPage - 1)
const goToNextPage = () => goToPage(props.currentPage + 1)
const goToLastPage = () => goToPage(props.totalPages)
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid var(--gray-200);
  flex-wrap: wrap;
}

.btn-page {
  padding: 0.5rem;
  background: white;
  border: 2px solid var(--gray-300);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--gray-700);
}

.btn-page:hover:not(:disabled) {
  background: var(--primary-green);
  border-color: var(--primary-green);
  color: white;
  transform: translateY(-2px);
}

.btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.btn-page-number {
  min-width: 40px;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 2px solid var(--gray-300);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  color: var(--gray-700);
}

.btn-page-number:hover {
  background: var(--primary-green-lighter);
  border-color: var(--primary-green);
  color: var(--primary-green);
}

.btn-page-number.active {
  background: var(--primary-green);
  border-color: var(--primary-green);
  color: white;
}

.page-info {
  color: var(--gray-600);
  font-size: 0.9rem;
  padding: 0 1rem;
  white-space: nowrap;
}

.items-per-page {
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--gray-300);
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  background: white;
}

.items-per-page:focus {
  outline: none;
  border-color: var(--primary-green);
}

@media (max-width: 768px) {
  .pagination {
    gap: 0.25rem;
    padding: 1rem;
  }

  .page-info {
    width: 100%;
    text-align: center;
    padding: 0.5rem 0;
  }
}
</style>
