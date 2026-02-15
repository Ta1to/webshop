import { getCurrentUser } from '../firebase/auth'
import { getDocument, getUserDocument, updateUserDocument } from '../firebase/db'
import { CookieManager } from '../utils/cookies'
import { errorHandler } from '../utils/errorHandler'
import { STORAGE, COLLECTIONS } from '../../constants'

// Import the store update function (will be set to avoid circular dependency)
let updateStoreCallback = null

/**
 * Register callback to update wishlist store
 */
export const registerWishlistUpdateCallback = (callback) => {
  updateStoreCallback = callback
}

/**
 * Wishlist Service
 * Manages wishlist storage in cookies (guest) or Firestore (logged in users)
 * Wishlist items are stored as an array of product IDs
 */

// ==================== WISHLIST OPERATIONS ====================

/**
 * Get raw wishlist items (just IDs)
 * Returns wishlist from Firestore if user is logged in, otherwise from cookies
 */
const getRawWishlist = async () => {
  const user = getCurrentUser()

  if (user) {
    const result = await getUserDocument(user.uid)
    if (result.success && result.data.wishlist) {
      return result.data.wishlist
    }
    return []
  } else {
    return CookieManager.get(STORAGE.WISHLIST_COOKIE_NAME) || []
  }
}

/**
 * Get wishlist items with full product details
 * Fetches product data from Firestore based on IDs in wishlist
 */
export const getWishlistItems = async () => {
  try {
    const rawWishlist = await getRawWishlist()
    const wishlistWithDetails = []
    const invalidProductIds = []

    for (const item of rawWishlist) {
      try {
        const productResult = await getDocument(COLLECTIONS.PRODUCTS, item.productId)

        if (productResult.success && productResult.data) {
          wishlistWithDetails.push({
            productId: item.productId,
            addedAt: item.addedAt,
            // Product details
            name: productResult.data.name,
            price: productResult.data.price,
            imageUrl: productResult.data.imageUrl || productResult.data.image,
            stock: productResult.data.stock
          })
        } else {
          invalidProductIds.push(item.productId)
        }
      } catch (error) {
        errorHandler.warn(`Produkt ${item.productId} nicht gefunden, wird übersprungen`, error)
        invalidProductIds.push(item.productId)
      }
    }

    // Remove invalid products from wishlist
    if (invalidProductIds.length > 0) {
      for (const productId of invalidProductIds) {
        await removeFromWishlist(productId)
      }
    }

    return wishlistWithDetails
  } catch (error) {
    errorHandler.error('Wunschliste konnte nicht geladen werden', error)
    return []
  }
}

/**
 * Save wishlist items
 */
const saveWishlist = async (wishlist) => {
  const user = getCurrentUser()
  
  if (user) {
    // Save to Firestore
    await updateUserDocument(user.uid, { wishlist })
  } else {
    // Save to cookies
    CookieManager.set(STORAGE.WISHLIST_COOKIE_NAME, wishlist, STORAGE.COOKIE_EXPIRY_DAYS)
  }

  // Notify store of wishlist update
  if (updateStoreCallback) {
    await updateStoreCallback()
  }
}

/**
 * Add item to wishlist
 * @param {string} productId - Product ID
 */
export const addToWishlist = async (productId) => {
  try {
    // Input validation
    if (!productId || typeof productId !== 'string') {
      throw new Error('Invalid product ID')
    }
    
    const rawWishlist = await getRawWishlist()
    
    // Check if product already exists in wishlist
    const existingItem = rawWishlist.find(item => item.productId === productId)
    
    if (existingItem) {
      return { success: false, error: 'Item is already in the wishlist' }
    }
    
    // Add new item
    rawWishlist.push({
      productId,
      addedAt: new Date().toISOString()
    })
    
    await saveWishlist(rawWishlist)
    return { success: true }
  } catch (error) {
    errorHandler.error('Product could not be added to wishlist', error)
    return { success: false, error: error.message }
  }
}

/**
 * Remove item from wishlist
 * @param {string} productId - Product ID
 */
export const removeFromWishlist = async (productId) => {
  try {
    if (!productId || typeof productId !== 'string') {
      throw new Error('Invalid product ID')
    }
    
    const rawWishlist = await getRawWishlist()
    const filteredWishlist = rawWishlist.filter(item => item.productId !== productId)
    
    await saveWishlist(filteredWishlist)
    return { success: true }
  } catch (error) {
    errorHandler.error('Item could not be removed from wishlist', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if item is in wishlist
 * @param {string} productId - Product ID
 */
export const isInWishlist = async (productId) => {
  if (!productId) return false
  
  const rawWishlist = await getRawWishlist()
  return rawWishlist.some(item => item.productId === productId)
}

/**
 * Clear entire wishlist
 */
export const clearWishlist = async () => {
  try {
    await saveWishlist([])
    return { success: true }
  } catch (error) {
    errorHandler.error('Wishlist could not be cleared', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get wishlist item count
 */
export const getWishlistItemCount = async () => {
  const wishlist = await getRawWishlist()
  return wishlist.length
}

/**
 * Merge guest wishlist into user wishlist after login
 * Should be called after successful login
 */
export const mergeGuestWishlist = async () => {
  const user = getCurrentUser()
  if (!user) return
  
  const guestWishlist = CookieManager.get(STORAGE.WISHLIST_COOKIE_NAME) || []
  if (guestWishlist.length === 0) return
  
  const userResult = await getUserDocument(user.uid)
  const userWishlist = (userResult.success && userResult.data.wishlist) ? userResult.data.wishlist : []
  
  // Merge wishlists (avoid duplicates)
  guestWishlist.forEach(guestItem => {
    const existingItem = userWishlist.find(item => item.productId === guestItem.productId)
    
    if (!existingItem) {
      // Add new item
      userWishlist.push(guestItem)
    }
  })
  
  // Save merged wishlist to Firestore
  await updateUserDocument(user.uid, { wishlist: userWishlist })
  
  // Clear guest wishlist cookie
  CookieManager.delete(STORAGE.WISHLIST_COOKIE_NAME)
  
  // Notify store of wishlist update
  if (updateStoreCallback) {
    await updateStoreCallback()
  }
}
