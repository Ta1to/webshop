<template>
  <Teleport to="body">
    <Transition name="alert-fade">
      <div v-if="isOpen" class="alert-overlay" @click="handleOverlayClick">
        <div class="alert-dialog" @click.stop>
          <div class="alert-header" :class="typeClass">
            <div class="alert-icon">
              <CheckCircle2 v-if="type === 'success'" :size="32" />
              <XCircle v-else-if="type === 'error'" :size="32" />
              <AlertTriangle v-else-if="type === 'warning'" :size="32" />
              <HelpCircle v-else-if="type === 'confirm'" :size="32" />
              <Info v-else :size="32" />
            </div>
            
            <h3 class="alert-title">{{ title }}</h3>
          </div>
          
          <div class="alert-body">
            <p class="alert-message">{{ message }}</p>
          </div>
          
          <div class="alert-footer">
            <button 
              v-if="showCancel" 
              @click="handleCancel" 
              class="alert-btn alert-btn-cancel"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="handleConfirm" 
              class="alert-btn alert-btn-confirm"
              :class="typeClass"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Info } from 'lucide-vue-next'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'confirm', 'info'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'OK'
  },
  cancelText: {
    type: String,
    default: 'Abbrechen'
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const isOpen = ref(false)

const typeClass = computed(() => `alert-${props.type}`)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
  close()
}

const handleCancel = () => {
  emit('cancel')
  close()
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    if (props.showCancel) {
      handleCancel()
    } else {
      close()
    }
  }
}

defineExpose({ open, close })
</script>

<style scoped>
.alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.alert-dialog {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 100%;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-header {
  padding: 2rem 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.alert-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.alert-success .alert-icon {
  background: linear-gradient(135deg, var(--primary-green) 0%, #059669 100%);
}

.alert-error .alert-icon {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
}

.alert-warning .alert-icon {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.alert-confirm .alert-icon {
  background: linear-gradient(135deg, var(--primary-green) 0%, #059669 100%);
}

.alert-info .alert-icon {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.alert-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--gray-800);
  text-align: center;
}

.alert-body {
  padding: 0 2rem 2rem;
}

.alert-message {
  margin: 0;
  color: var(--gray-600);
  text-align: center;
  line-height: 1.6;
  font-size: 1rem;
  white-space: pre-line;
}

.alert-footer {
  padding: 1.5rem 2rem;
  background: var(--gray-50);
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.alert-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.alert-btn-cancel {
  background: white;
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
}

.alert-btn-cancel:hover {
  background: var(--gray-100);
  border-color: var(--gray-400);
}

.alert-btn-confirm {
  color: white;
}

.alert-btn-confirm.alert-success {
  background: var(--primary-green);
}

.alert-btn-confirm.alert-success:hover {
  background: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.alert-btn-confirm.alert-error {
  background: #EF4444;
}

.alert-btn-confirm.alert-error:hover {
  background: #DC2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.alert-btn-confirm.alert-warning {
  background: #F59E0B;
}

.alert-btn-confirm.alert-warning:hover {
  background: #D97706;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.alert-btn-confirm.alert-confirm {
  background: var(--primary-green);
}

.alert-btn-confirm.alert-confirm:hover {
  background: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.alert-btn-confirm.alert-info {
  background: var(--primary-green);
}

.alert-btn-confirm.alert-info:hover {
  background: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Transitions */
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.3s ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .alert-dialog {
    max-width: 100%;
    margin: 1rem;
  }

  .alert-header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .alert-body {
    padding: 0 1.5rem 1.5rem;
  }

  .alert-footer {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
  }

  .alert-btn {
    width: 100%;
  }

  .alert-icon {
    width: 56px;
    height: 56px;
  }

  .alert-title {
    font-size: 1.25rem;
  }

  .alert-message {
    font-size: 0.95rem;
  }
}
</style>
