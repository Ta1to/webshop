<template>
  <div class="quantity-control">
    <button 
      class="quantity-btn" 
      @click="decrease"
      :disabled="disabled || modelValue <= min"
      aria-label="Menge verringern"
    >
      <Minus :size="16" />
    </button>
    <span class="quantity-display">{{ modelValue }}</span>
    <button 
      class="quantity-btn" 
      @click="increase"
      :disabled="disabled || (max && modelValue >= max)"
      aria-label="Menge erhöhen"
    >
      <Plus :size="16" />
    </button>
  </div>
</template>

<script>
import { Minus, Plus } from 'lucide-vue-next'

export default {
  name: 'QuantityControl',
  components: {
    Minus,
    Plus
  },
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const increase = () => {
      if (!props.max || props.modelValue < props.max) {
        emit('update:modelValue', props.modelValue + 1)
      }
    }

    const decrease = () => {
      if (props.modelValue > props.min) {
        emit('update:modelValue', props.modelValue - 1)
      }
    }

    return {
      increase,
      decrease
    }
  }
}
</script>

<style scoped>
.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--gray-100);
  border-radius: 8px;
  padding: 0.25rem;
  width: fit-content;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--gray-700);
  padding: 0;
}

.quantity-btn svg {
  display: block;
  stroke-width: 2;
}

.quantity-btn:hover:not(:disabled) {
  background: var(--primary-green);
  color: var(--white);
  border-color: var(--primary-green);
  transform: translateY(-1px);
}

.quantity-btn:active:not(:disabled) {
  transform: translateY(0);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-display {
  min-width: 40px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--gray-900);
  padding: 0 0.75rem;
  user-select: none;
}
</style>
