import { ref } from 'vue'
import { getCart, getCartItemCount as getCount } from '../services/business/cart'

// Reactive cart state
const cartItemCount = ref(0)
const cartItems = ref([])

/**
 * Update cart count
 */
export const updateCartCount = async () => {
  cartItemCount.value = await getCount()
}

/**
 * Update cart items
 */
export const updateCartItems = async () => {
  cartItems.value = await getCart()
  await updateCartCount()
}

/**
 * Get reactive cart item count
 */
export const useCartItemCount = () => cartItemCount

/**
 * Get reactive cart items
 */
export const useCartItems = () => cartItems

/**
 * Initialize cart store
 */
export const initCartStore = async () => {
  await updateCartItems()
}
