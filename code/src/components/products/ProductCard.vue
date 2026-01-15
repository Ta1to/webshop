<template>
  <router-link
    :to="`/product/${product.id}`"
    class="product-card"
  >
    <div class="product-image">
      <img :src="product.imageUrl" :alt="product.name" />
      <span v-if="isNew" class="new-badge">Neu</span>
      <span v-if="product.offer" class="offer-badge">-{{ product.offer.discountPercentage }}%</span>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-description">{{ truncateText(product.description, 80) }}</p>
      <div class="product-footer">
        <div class="price-container">
          <span v-if="product.offer" class="original-price">{{ formatPrice(product.originalPrice) }}</span>
          <span class="product-price" :class="{ 'offer-price': product.offer }">{{ formatPrice(product.price) }}</span>
        </div>
        <StockIndicator :stock="product.stock" />
      </div>
    </div>
  </router-link>
</template>

<script>
import { computed } from 'vue'
import StockIndicator from '../utility/StockIndicator.vue'

export default {
  name: 'ProductCard',
  components: {
    StockIndicator
  },
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const formatPrice = (price) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    const truncateText = (text, maxLength) => {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    const isNew = computed(() => {
      if (!props.product.createdAt) return false
      
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      // Handle Firestore Timestamp
      const createdDate = props.product.createdAt.toDate 
        ? props.product.createdAt.toDate() 
        : new Date(props.product.createdAt)
      
      return createdDate >= sevenDaysAgo
    })

    return {
      formatPrice,
      truncateText,
      isNew
    }
  }
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 240px;
  overflow: hidden;
  background-color: #f3f4f6;
  position: relative;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.new-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  z-index: 10;
  letter-spacing: 0.5px;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  flex: 1;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.price-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.original-price {
  font-size: 0.875rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
}

.product-price.offer-price {
  color: #ef4444;
}

.offer-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  z-index: 10;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .product-image {
    height: 200px;
  }
}
</style>
