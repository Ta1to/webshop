<template>
  <div class="checkout-view">
    <div class="checkout-container">
      <h1 class="checkout-title">Zur Kasse</h1>

      <!-- Progress Steps -->
      <div class="checkout-progress">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="progress-step"
          :class="{ 
            active: currentStep === index + 1, 
            completed: currentStep > index + 1 
          }"
        >
          <div class="step-number">
            <Check v-if="currentStep > index + 1" :size="20" />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="step-label">{{ step }}</div>
        </div>
      </div>

      <!-- Checkout Content -->
      <div class="checkout-content">
        <!-- Left Column: Forms -->
        <div class="checkout-main">
          <!-- Step 1: Shipping Address -->
          <div v-if="currentStep === 1" class="checkout-step">
            <div class="step-header">
              <MapPin :size="24" />
              <h2>Lieferadresse</h2>
            </div>

            <div v-if="profileDataLoaded" class="profile-loaded-notice">
              <Check :size="18" />
              <span>Deine Adressdaten wurden aus deinem Profil geladen</span>
            </div>

            <form class="checkout-form" @submit.prevent="nextStep">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">Vorname *</label>
                  <input 
                    id="firstName"
                    v-model="shippingAddress.firstName" 
                    type="text" 
                    required
                    placeholder="Max"
                  />
                </div>
                <div class="form-group">
                  <label for="lastName">Nachname *</label>
                  <input 
                    id="lastName"
                    v-model="shippingAddress.lastName" 
                    type="text" 
                    required
                    placeholder="Mustermann"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="email">E-Mail *</label>
                <input 
                  id="email"
                  v-model="shippingAddress.email" 
                  type="email" 
                  required
                  placeholder="max@beispiel.de"
                />
              </div>

              <div class="form-group">
                <label for="phone">Telefon *</label>
                <input 
                  id="phone"
                  v-model="shippingAddress.phone" 
                  type="tel" 
                  required
                  placeholder="+49 123 456789"
                />
              </div>

              <div class="form-group">
                <label for="street">Straße und Hausnummer *</label>
                <input 
                  id="street"
                  v-model="shippingAddress.street" 
                  type="text" 
                  required
                  placeholder="Musterstraße 123"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="postalCode">PLZ *</label>
                  <input 
                    id="postalCode"
                    v-model="shippingAddress.postalCode" 
                    type="text" 
                    required
                    placeholder="12345"
                  />
                </div>
                <div class="form-group">
                  <label for="city">Stadt *</label>
                  <input 
                    id="city"
                    v-model="shippingAddress.city" 
                    type="text" 
                    required
                    placeholder="Berlin"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="country">Land *</label>
                <select id="country" v-model="shippingAddress.country" required>
                  <option value="DE">Deutschland</option>
                  <option value="AT">Österreich</option>
                  <option value="CH">Schweiz</option>
                </select>
              </div>

              <div class="form-actions">
                <button type="button" @click="backToCart" class="btn-secondary">
                  <ArrowLeft :size="20" />
                  Zurück zum Warenkorb
                </button>
                <button type="submit" class="btn-primary">
                  Weiter zur Versandart
                  <ArrowRight :size="20" />
                </button>
              </div>
            </form>
          </div>

          <!-- Step 2: Shipping Method -->
          <div v-if="currentStep === 2" class="checkout-step">
            <div class="step-header">
              <Truck :size="24" />
              <h2>Versandart wählen</h2>
            </div>

            <div class="shipping-options">
              <label 
                v-for="method in shippingMethods" 
                :key="method.id"
                class="shipping-option"
                :class="{ selected: selectedShipping === method.id }"
              >
                <input 
                  type="radio" 
                  :value="method.id" 
                  v-model="selectedShipping"
                  name="shipping"
                />
                <div class="option-content">
                  <div class="option-header">
                    <component :is="method.icon" :size="24" />
                    <div class="option-info">
                      <h3>{{ method.name }}</h3>
                      <p>{{ method.description }}</p>
                    </div>
                  </div>
                  <div class="option-price">
                    {{ method.price === 0 ? 'Kostenlos' : formatPrice(method.price) }}
                  </div>
                </div>
              </label>
            </div>

            <div class="form-actions">
              <button type="button" @click="prevStep" class="btn-secondary">
                <ArrowLeft :size="20" />
                Zurück
              </button>
              <button type="button" @click="nextStep" class="btn-primary">
                Weiter zur Zahlung
                <ArrowRight :size="20" />
              </button>
            </div>
          </div>

          <!-- Step 3: Payment -->
          <div v-if="currentStep === 3" class="checkout-step">
            <div class="step-header">
              <CreditCard :size="24" />
              <h2>Zahlungsmethode</h2>
            </div>

            <div class="payment-options">
              <label 
                v-for="method in paymentMethods" 
                :key="method.id"
                class="payment-option"
                :class="{ selected: selectedPayment === method.id }"
              >
                <input 
                  type="radio" 
                  :value="method.id" 
                  v-model="selectedPayment"
                  name="payment"
                />
                <div class="option-content">
                  <component :is="method.icon" :size="24" />
                  <div class="option-info">
                    <h3>{{ method.name }}</h3>
                    <p>{{ method.description }}</p>
                  </div>
                </div>
              </label>
            </div>

            <div class="form-actions">
              <button type="button" @click="prevStep" class="btn-secondary">
                <ArrowLeft :size="20" />
                Zurück
              </button>
              <button type="button" @click="nextStep" class="btn-primary">
                Weiter zur Übersicht
                <ArrowRight :size="20" />
              </button>
            </div>
          </div>

          <!-- Step 4: Review & Confirm -->
          <div v-if="currentStep === 4" class="checkout-step">
            <div class="step-header">
              <FileCheck :size="24" />
              <h2>Bestellung überprüfen</h2>
            </div>

            <div class="review-section">
              <h3>Lieferadresse</h3>
              <div class="review-card">
                <p><strong>{{ shippingAddress.firstName }} {{ shippingAddress.lastName }}</strong></p>
                <p>{{ shippingAddress.street }}</p>
                <p>{{ shippingAddress.postalCode }} {{ shippingAddress.city }}</p>
                <p>{{ shippingAddress.email }}</p>
                <p>{{ shippingAddress.phone }}</p>
              </div>
            </div>

            <div class="review-section">
              <h3>Versandart</h3>
              <div class="review-card">
                <p>{{ selectedShippingMethod?.name }}</p>
                <p class="text-muted">{{ selectedShippingMethod?.description }}</p>
              </div>
            </div>

            <div class="review-section">
              <h3>Zahlungsmethode</h3>
              <div class="review-card">
                <p>{{ selectedPaymentMethod?.name }}</p>
              </div>
            </div>

            <div class="terms-checkbox">
              <label>
                <input type="checkbox" v-model="termsAccepted" />
                <span>
                  Ich habe die <router-link to="/terms">AGB</router-link> und 
                  <router-link to="/privacy">Datenschutzerklärung</router-link> gelesen und akzeptiere diese.
                </span>
              </label>
            </div>

            <div class="form-actions">
              <button type="button" @click="prevStep" class="btn-secondary">
                <ArrowLeft :size="20" />
                Zurück
              </button>
              <button 
                type="button" 
                @click="placeOrder" 
                class="btn-primary"
                :disabled="!termsAccepted || isProcessing"
              >
                <ShoppingBag :size="20" />
                {{ isProcessing ? 'Wird bearbeitet...' : 'Jetzt kaufen' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Summary -->
        <div class="checkout-sidebar">
          <div class="order-summary">
            <h3>Bestellübersicht</h3>

            <div class="summary-items">
              <div v-for="item in cart" :key="item.productId" class="summary-item">
                <div class="item-image">
                  <img :src="item.imageUrl" :alt="item.name" />
                  <span v-if="item.offer" class="item-offer-badge">-{{ item.offer.discountPercentage }}%</span>
                </div>
                <div class="item-info">
                  <p class="item-name">{{ item.name }}</p>
                  <p class="item-quantity">Menge: {{ item.quantity }}</p>
                </div>
                <div class="item-price">
                  <span v-if="item.offer" class="original-price-small">{{ formatPrice(item.price * item.quantity) }}</span>
                  <span :class="{ 'offer-price': item.offer }">{{ formatPrice((item.finalPrice || item.price) * item.quantity) }}</span>
                </div>
              </div>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row">
              <span>Zwischensumme</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>

            <div class="summary-row">
              <span>Versandkosten</span>
              <span>{{ selectedShippingMethod ? (selectedShippingMethod.price === 0 ? 'Kostenlos' : formatPrice(selectedShippingMethod.price)) : '-' }}</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row summary-total">
              <span>Gesamt</span>
              <span class="total-amount">{{ formatPrice(total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { getCart, getCartTotal, clearCart } from '../../services/business/cart'
import { observeAuthState, getCurrentUser } from '../../services/firebase/auth'
import { getUserDocument } from '../../services/firebase/db'
import { createOrder } from '../../services/business/orders'
import { 
  Check,
  MapPin,
  Truck,
  CreditCard,
  FileCheck,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Package,
  Zap,
  Wallet,
  Landmark
} from 'lucide-vue-next'

export default {
  name: 'CheckoutView',
  components: {
    Check,
    MapPin,
    Truck,
    CreditCard,
    FileCheck,
    ArrowLeft,
    ArrowRight,
    ShoppingBag,
    Package,
    Zap,
    Wallet,
    Landmark
  },
  setup() {
    const router = useRouter()
    const currentStep = ref(1)
    const cart = ref([])
    const termsAccepted = ref(false)
    const isProcessing = ref(false)
    const profileDataLoaded = ref(false)
    let unsubscribeAuth = null

    const steps = ['Adresse', 'Versand', 'Zahlung', 'Überprüfen']

    // Shipping Address
    const shippingAddress = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      postalCode: '',
      city: '',
      country: 'DE'
    })

    // Shipping Methods
    const shippingMethods = [
      {
        id: 'standard',
        name: 'Standard Versand',
        description: '3-5 Werktage',
        price: 4.99,
        icon: 'Package'
      },
      {
        id: 'express',
        name: 'Express Versand',
        description: '1-2 Werktage',
        price: 9.99,
        icon: 'Zap'
      },
      {
        id: 'free',
        name: 'Kostenloser Versand',
        description: '5-7 Werktage',
        price: 0,
        icon: 'Truck'
      }
    ]

    const selectedShipping = ref('standard')

    // Payment Methods
    const paymentMethods = [
      {
        id: 'credit-card',
        name: 'Kreditkarte',
        description: 'Visa, Mastercard, American Express',
        icon: 'CreditCard'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Schnell und sicher bezahlen',
        icon: 'Wallet'
      },
      {
        id: 'bank-transfer',
        name: 'Überweisung',
        description: 'Zahlung per Banküberweisung',
        icon: 'Landmark'
      }
    ]

    const selectedPayment = ref('credit-card')

    onMounted(async () => {
      cart.value = await getCart()
      
      if (cart.value.length === 0) {
        router.push('/cart')
      }

      unsubscribeAuth = observeAuthState(async (user) => {
        if (user) {
          const result = await getUserDocument(user.uid)
          if (result.success && result.data) {
            const userData = result.data
            let hasData = false
            
            // Auto-fill address fields from user profile
            if (userData.displayName) {
              const nameParts = userData.displayName.trim().split(' ')
              if (nameParts.length === 1) {
                shippingAddress.value.firstName = nameParts[0]
              } else if (nameParts.length >= 2) {
                shippingAddress.value.firstName = nameParts[0]
                shippingAddress.value.lastName = nameParts.slice(1).join(' ')
              }
              hasData = true
            }

            if (userData.email) {
              shippingAddress.value.email = userData.email
              hasData = true
            }

            if (userData.phone) {
              shippingAddress.value.phone = userData.phone
              hasData = true
            }

            if (userData.street) {
              shippingAddress.value.street = userData.street
              hasData = true
            }

            if (userData.postalCode) {
              shippingAddress.value.postalCode = userData.postalCode
              hasData = true
            }

            if (userData.city) {
              shippingAddress.value.city = userData.city
              hasData = true
            }

            if (userData.country) {
              // Map country name to country code if needed
              const countryMap = {
                'Deutschland': 'DE',
                'Österreich': 'AT',
                'Schweiz': 'CH',
                'DE': 'DE',
                'AT': 'AT',
                'CH': 'CH'
              }
              shippingAddress.value.country = countryMap[userData.country] || 'DE'
              hasData = true
            }

            // Show notice if at least some data was loaded
            profileDataLoaded.value = hasData
          }
        }
      })
    })

    onBeforeUnmount(() => {
      if (unsubscribeAuth) {
        unsubscribeAuth()
      }
    })

    const subtotal = computed(() => {
      return cart.value.reduce((total, item) => total + ((item.finalPrice || item.price) * item.quantity), 0)
    })

    const selectedShippingMethod = computed(() => {
      return shippingMethods.find(m => m.id === selectedShipping.value)
    })

    const selectedPaymentMethod = computed(() => {
      return paymentMethods.find(m => m.id === selectedPayment.value)
    })

    const shippingCost = computed(() => {
      return selectedShippingMethod.value?.price || 0
    })

    const total = computed(() => {
      return subtotal.value + shippingCost.value
    })

    // Methods
    const formatPrice = (price) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    const nextStep = () => {
      if (currentStep.value < 4) {
        currentStep.value++
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    const backToCart = () => {
      router.push('/cart')
    }

    const placeOrder = async () => {
      if (!termsAccepted.value) {
        alert('Bitte akzeptieren Sie die AGB und Datenschutzerklärung.')
        return
      }

      isProcessing.value = true

      try {
        const currentUser = getCurrentUser()
        
        // Prepare order data
        const orderData = {
          userId: currentUser?.uid || null,
          userEmail: shippingAddress.value.email,
          items: cart.value.map(item => ({
            id: item.id,
            productId: item.id,
            name: item.name,
            price: item.price,
            finalPrice: item.finalPrice || item.price,
            quantity: item.quantity,
            image: item.image || null,
            category: item.category || null,
            offer: item.offer ? {
              discountPercentage: item.offer.discountPercentage,
              offerId: item.offer.id
            } : null
          })),
          shippingAddress: {
            firstName: shippingAddress.value.firstName,
            lastName: shippingAddress.value.lastName,
            email: shippingAddress.value.email,
            phone: shippingAddress.value.phone,
            street: shippingAddress.value.street,
            postalCode: shippingAddress.value.postalCode,
            city: shippingAddress.value.city,
            country: shippingAddress.value.country
          },
          shippingMethod: selectedShipping.value,
          shippingCost: shippingCost.value,
          paymentMethod: selectedPayment.value,
          subtotal: subtotal.value,
          total: total.value,
          status: 'pending'
        }

        // Create order in Firestore
        const result = await createOrder(orderData)

        if (result.success) {
          // Clear cart
          await clearCart()
          
          // Redirect to success page with order ID
          router.push({
            path: '/checkout/success',
            query: { orderId: result.orderId }
          })
        } else {
          throw new Error(result.error || 'Fehler beim Erstellen der Bestellung')
        }
      } catch (error) {
        console.error('Error placing order:', error)
        alert(`Fehler beim Aufgeben der Bestellung: ${error.message}`)
        isProcessing.value = false
      }
    }

    return {
      currentStep,
      steps,
      cart,
      shippingAddress,
      shippingMethods,
      selectedShipping,
      selectedShippingMethod,
      paymentMethods,
      selectedPayment,
      selectedPaymentMethod,
      termsAccepted,
      isProcessing,
      profileDataLoaded,
      subtotal,
      shippingCost,
      total,
      formatPrice,
      nextStep,
      prevStep,
      backToCart,
      placeOrder
    }
  }
}
</script>

<style scoped>
.checkout-view {
  min-height: calc(100vh - 200px);
  padding: 2rem 1rem;
  background: var(--gray-50);
}

.checkout-container {
  max-width: 1400px;
  margin: 0 auto;
}

.checkout-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 2rem;
  text-align: center;
}

/* Progress Steps */
.checkout-progress {
  display: flex;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto 3rem;
  padding: 0 2rem;
  position: relative;
}

.checkout-progress::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 2rem;
  right: 2rem;
  height: 2px;
  background: var(--gray-300);
  z-index: 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--white);
  border: 3px solid var(--gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--gray-500);
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background: var(--primary-green);
  border-color: var(--primary-green);
  color: var(--white);
  transform: scale(1.1);
}

.progress-step.completed .step-number {
  background: var(--primary-green);
  border-color: var(--primary-green);
  color: var(--white);
}

.step-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-600);
  text-align: center;
}

.progress-step.active .step-label {
  color: var(--primary-green);
}

/* Checkout Content */
.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}

.checkout-main {
  background: var(--white);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.checkout-step {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-200);
}

.step-header svg {
  color: var(--primary-green);
}

.step-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

/* Profile Loaded Notice */
.profile-loaded-notice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid var(--primary-green-lighter);
  border-radius: 10px;
  color: var(--primary-green-dark);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  animation: slideDown 0.3s ease;
}

.profile-loaded-notice svg {
  flex-shrink: 0;
  color: var(--primary-green);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Forms */
.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  padding: 0.875rem;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: var(--white);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px var(--primary-green-lighter);
}

/* Shipping & Payment Options */
.shipping-options,
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.shipping-option,
.payment-option {
  display: block;
  cursor: pointer;
}

.shipping-option input,
.payment-option input {
  display: none;
}

.option-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border: 2px solid var(--gray-300);
  border-radius: 12px;
  transition: all 0.2s ease;
  background: var(--white);
}

.shipping-option:hover .option-content,
.payment-option:hover .option-content {
  border-color: var(--primary-green);
  background: var(--primary-green-lighter);
}

.shipping-option.selected .option-content,
.payment-option.selected .option-content {
  border-color: var(--primary-green);
  background: var(--primary-green-lighter);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.option-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-header svg {
  color: var(--primary-green);
  flex-shrink: 0;
}

.option-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 0.25rem 0;
}

.option-info p {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0;
}

.option-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
}

/* Review Sections */
.review-section {
  margin-bottom: 2rem;
}

.review-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.75rem;
}

.review-card {
  padding: 1.25rem;
  background: var(--gray-50);
  border-radius: 8px;
  border: 1px solid var(--gray-200);
}

.review-card p {
  margin: 0.25rem 0;
  color: var(--gray-700);
}

.review-card .text-muted {
  color: var(--gray-500);
  font-size: 0.875rem;
}

.terms-checkbox {
  margin: 2rem 0;
  padding: 1.25rem;
  background: var(--gray-50);
  border-radius: 8px;
  border: 2px solid var(--gray-200);
}

.terms-checkbox label {
  display: flex;
  align-items: start;
  gap: 0.75rem;
  cursor: pointer;
}

.terms-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.terms-checkbox span {
  color: var(--gray-700);
  line-height: 1.6;
}

.terms-checkbox a {
  color: var(--primary-green);
  font-weight: 600;
  text-decoration: none;
}

.terms-checkbox a:hover {
  text-decoration: underline;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid var(--gray-200);
}

.btn-primary,
.btn-secondary {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background: var(--primary-green);
  color: var(--white);
  flex: 1;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-green-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:disabled {
  background: var(--gray-400);
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--white);
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
}

.btn-secondary:hover {
  background: var(--gray-100);
  border-color: var(--gray-400);
}

/* Order Summary Sidebar */
.checkout-sidebar {
  position: sticky;
  top: 2rem;
}

.order-summary {
  background: var(--white);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
}

.order-summary h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 1.5rem;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 1rem;
  align-items: center;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--gray-100);
  position: relative;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-offer-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  font-size: 0.625rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
  z-index: 10;
}

.item-info {
  min-width: 0;
}

.item-name {
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-quantity {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0;
}

.item-price {
  font-weight: 700;
  color: var(--gray-900);
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.original-price-small {
  font-size: 0.75rem;
  color: #999;
  text-decoration: line-through;
  font-weight: 500;
}

.item-price .offer-price {
  color: #ef4444;
}

.summary-divider {
  height: 1px;
  background: var(--gray-200);
  margin: 1rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  color: var(--gray-700);
}

.summary-row span:last-child {
  font-weight: 600;
  color: var(--gray-900);
}

.summary-total {
  font-size: 1.25rem;
  font-weight: 700;
  padding-top: 1rem;
  border-top: 2px solid var(--gray-200);
  color: var(--gray-900);
}

.total-amount {
  color: var(--primary-green);
  font-size: 1.5rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .checkout-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-view {
    padding: 1rem 0.5rem;
  }

  .checkout-title {
    font-size: 2rem;
  }

  .checkout-progress {
    padding: 0 1rem;
  }

  .checkout-progress::before {
    left: 1rem;
    right: 1rem;
  }

  .step-number {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .step-label {
    font-size: 0.75rem;
  }

  .checkout-main {
    padding: 1.5rem;
  }

  .step-header h2 {
    font-size: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .order-summary {
    padding: 1.5rem;
  }

  .summary-item {
    grid-template-columns: 50px 1fr auto;
    gap: 0.75rem;
  }

  .item-image {
    width: 50px;
    height: 50px;
  }
}
</style>
