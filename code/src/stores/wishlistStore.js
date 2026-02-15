import { ref } from 'vue'
import { getWishlistItems, getWishlistItemCount as getCount } from '../services/business/wishlist'

// Reactive wishlist state
const wishlistItemCount = ref(0)
const wishlistItems = ref([])

/**
 * Update wishlist count
 */
export const updateWishlistCount = async () => {
  wishlistItemCount.value = await getCount()
}

/**
 * Update wishlist items
 */
export const updateWishlistItems = async () => {
  wishlistItems.value = await getWishlistItems()
  await updateWishlistCount()
}

/**
 * Get reactive wishlist item count
 */
export const useWishlistItemCount = () => wishlistItemCount

/**
 * Get reactive wishlist items
 */
export const useWishlistItems = () => wishlistItems

/**
 * Initialize wishlist store
 */
export const initWishlistStore = async () => {
  await updateWishlistItems()
}
