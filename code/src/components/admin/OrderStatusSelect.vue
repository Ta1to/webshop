<template>
  <select
    :value="status"
    @change="handleChange"
    class="status-select"
    :class="status"
    :disabled="disabled"
  >
    <option value="pending">Ausstehend</option>
    <option value="processing">In Bearbeitung</option>
    <option value="shipped">Versandt</option>
    <option value="delivered">Zugestellt</option>
    <option value="cancelled">Storniert</option>
  </select>
</template>

<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:status', 'change'])

const handleChange = (event) => {
  const newStatus = event.target.value
  emit('update:status', newStatus)
  emit('change', newStatus)
}
</script>

<style scoped>
.status-select {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 2px solid transparent;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  min-width: 140px;
}

.status-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-select.pending {
  background: #FEF3C7;
  color: #D97706;
  border-color: #FDE68A;
}

.status-select.processing {
  background: #DBEAFE;
  color: #3B82F6;
  border-color: #93C5FD;
}

.status-select.shipped {
  background: #A7F3D0;
  color: #047857;
  border-color: #6EE7B7;
}

.status-select.delivered {
  background: var(--primary-green-lighter);
  color: var(--primary-green-dark);
  border-color: var(--primary-green);
}

.status-select.cancelled {
  background: var(--error-light);
  color: var(--error);
  border-color: #FCA5A5;
}

.status-select:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-select:not(:disabled):focus {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}
</style>
