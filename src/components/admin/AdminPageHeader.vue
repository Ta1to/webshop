<template>
  <div class="admin-page-header">
    <div class="header-left">
      <router-link to="/admin" class="btn-back">
        <ArrowLeft :size="20" />
        Zurück
      </router-link>
      <div>
        <h1>{{ title }}</h1>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <slot name="actions"></slot>
  </div>
</template>

<script setup>
import { ArrowLeft } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.admin-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}
 
.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: var(--gray-50);
  border-color: var(--primary-green);
  color: var(--primary-green);
  transform: translateX(-4px);
}

.admin-page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: var(--primary-green);
}

.subtitle {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .admin-page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
