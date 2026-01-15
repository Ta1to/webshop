<template>
  <span class="stock-indicator" :class="stockClass">
    <slot name="icon"></slot>
    {{ stockText }}
  </span>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'StockIndicator',
  props: {
    stock: {
      type: Number,
      required: true
    },
    showIcon: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const stockClass = computed(() => {
      if (props.stock === 0) return 'out-of-stock'
      if (props.stock < 10) return 'low-stock'
      return 'in-stock'
    })

    const stockText = computed(() => {
      if (props.stock === 0) return 'Nicht auf Lager'
      if (props.stock < 10) return `Nur noch ${props.stock} auf Lager`
      return `${props.stock} auf Lager`
    })

    return {
      stockClass,
      stockText
    }
  }
}
</script>

<style scoped>
.stock-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.85rem;
}

.stock-indicator.in-stock {
  color: #10b981;
}

.stock-indicator.low-stock {
  color: #ef4444;
}

.stock-indicator.out-of-stock {
  color: #dc3545;
}
</style>
