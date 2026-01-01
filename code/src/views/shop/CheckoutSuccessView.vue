<template>
  <div class="success-view">
    <div class="success-container">
      <div class="success-card">
        <div class="success-icon">
          <CheckCircle :size="80" />
        </div>
        
        <h1>Bestellung erfolgreich!</h1>
        <p class="success-message">
          Vielen Dank für Ihre Bestellung. Wir haben Ihre Bestellung erhalten und werden sie schnellstmöglich bearbeiten.
        </p>

        <div v-if="orderId" class="order-info">
          <p class="order-number">
            Bestellnummer: <strong>#{{ orderId.slice(0, 8).toUpperCase() }}</strong>
          </p>
          <p class="confirmation-text">
            Eine Bestätigungsemail wurde an Ihre E-Mail-Adresse gesendet.
          </p>
        </div>

        <div class="action-buttons">
          <router-link to="/orders" class="btn-orders">
            <Package :size="20" />
            Meine Bestellungen
          </router-link>
          <router-link to="/categories" class="btn-continue">
            Weiter einkaufen
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle, Package } from 'lucide-vue-next'

export default {
  name: 'CheckoutSuccessView',
  components: {
    CheckCircle,
    Package
  },
  setup() {
    const route = useRoute()
    const orderId = ref(null)

    onMounted(() => {
      orderId.value = route.query.orderId
    })

    return {
      orderId
    }
  }
}
</script>

<style scoped>
.success-view {
  min-height: calc(100vh - 200px);
  padding: 4rem 1rem;
  background: var(--gray-50);
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-container {
  max-width: 600px;
  width: 100%;
}

.success-card {
  background: var(--white);
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.15);
  text-align: center;
}

.success-icon {
  color: var(--primary-green);
  margin-bottom: 1.5rem;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-card h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 1rem 0;
}

.success-message {
  color: var(--gray-600);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.order-info {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid var(--primary-green-lighter);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.order-number {
  font-size: 1.25rem;
  color: var(--gray-800);
  margin: 0 0 0.5rem 0;
}

.order-number strong {
  color: var(--primary-green);
}

.confirmation-text {
  color: var(--gray-600);
  font-size: 0.95rem;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-orders,
.btn-continue {
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-orders {
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: var(--white);
}

.btn-orders:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.btn-continue {
  background: var(--white);
  color: var(--primary-green);
  border: 2px solid var(--primary-green);
}

.btn-continue:hover {
  background: var(--primary-green-lighter);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .success-card {
    padding: 2rem 1.5rem;
  }

  .success-card h1 {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-orders,
  .btn-continue {
    width: 100%;
    justify-content: center;
  }
}
</style>
