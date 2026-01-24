import { updateUserDocument, getUserDocument, getDocument } from './db'
import { getCurrentUser } from './auth'
import { getOfferByProductId } from './offers'
import { CookieManager } from './cookieHelper'
import { errorHandler } from './errorHandler'
import { STORAGE, PRODUCT, COLLECTIONS } from '../constants'

// Import the store update function (will be set to avoid circular dependency)
let updateStoreCallback = null

/**
 * Register callback to update cart store
 */
export const registerCartUpdateCallback = (callback) => {
  updateStoreCallback = callback
}

/**
 * Cart Service
 * Manages cart storage in cookies (guest) or Firestore (logged in users)
 * Cart items are stored as: { productId: string, quantity: number, addedAt: timestamp }
 * Product details are fetched separately when displaying the cart
 */

// ==================== CART OPERATIONS ====================

/**
 * Get raw cart items (just IDs and quantities)
 * Returns cart from Firestore if user is logged in, otherwise from cookies
 */
const getRawCart = async () => {
  const user = getCurrentUser()
  
  if (user) {
    // Get cart from Firestore
    const result = await getUserDocument(user.uid)
    if (result.success && result.data.cart) {
      return result.data.cart
    }
    return []
  } else {
    // Get cart from cookies
    return CookieManager.get(STORAGE.CART_COOKIE_NAME) || []
  }
}

/**
 * Get cart items with full product details
 * Fetches product data from Firestore and filters out deleted products
 */
export const getCart = async () => {
  try {
    const rawCart = await getRawCart()
    const cartWithDetails = []
    const invalidProductIds = []

    for (const item of rawCart) {
      try {
        const productResult = await getDocument('products', item.productId)
        
        if (productResult.success && productResult.data) {
          // Check for active offer
          let offer = null
          let finalPrice = productResult.data.price
          
          try {
            offer = await getOfferByProductId(item.productId)
            if (offer) {
              const discount = productResult.data.price * (offer.discountPercentage / 100)
              finalPrice = productResult.data.price - discount
            }
          } catch (error) {
            errorHandler.warn(`Error loading offer for product ${item.productId}:`, error)
          }
          
          cartWithDetails.push({
            id: item.productId,
            productId: item.productId,
            quantity: item.quantity,
            addedAt: item.addedAt,
            updatedAt: item.updatedAt,
            name: productResult.data.name,
            price: productResult.data.price,
            finalPrice: finalPrice,
            offer: offer,
            image: productResult.data.imageUrl || productResult.data.image,
            imageUrl: productResult.data.imageUrl || productResult.data.image,
            category: productResult.data.category,
            stock: productResult.data.stock
          })
        } else {
          invalidProductIds.push(item.productId)
        }
      } catch (error) {
        errorHandler.warn(`Product ${item.productId} not found, skipping...`)
        invalidProductIds.push(item.productId)
      }
    }

    if (invalidProductIds.length > 0) {
      for (const productId of invalidProductIds) {
        await removeFromCart(productId)
      }
    }

    return cartWithDetails
  } catch (error) {
    errorHandler.error('Error getting cart:', error)
    return []
  }
}

/**
 * Save cart items
 */
const saveCart = async (cart) => {
  const user = getCurrentUser()
  
  if (user) {
    // Save to Firestore
    await updateUserDocument(user.uid, { cart })
  } else {
    // Save to cookies
    CookieManager.set(STORAGE.CART_COOKIE_NAME, cart, STORAGE.COOKIE_EXPIRY_DAYS)
  }
  
  // Notify store of cart update
  if (updateStoreCallback) {
    await updateStoreCallback()
  }
}

/**
 * Add item to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    // Input validation
    if (!productId || typeof productId !== 'string') {
      throw new Error('Invalid product ID')
    }
    
    if (quantity < PRODUCT.MIN_QUANTITY || quantity > PRODUCT.MAX_QUANTITY) {
      throw new Error(`Quantity must be between ${PRODUCT.MIN_QUANTITY} and ${PRODUCT.MAX_QUANTITY}`)
    }
    
    const rawCart = await getRawCart()
    
    // Check if product already exists in cart
    const existingItemIndex = rawCart.findIndex(item => item.productId === productId)
    
    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = rawCart[existingItemIndex].quantity + quantity
      if (newQuantity > PRODUCT.MAX_QUANTITY) {
        throw new Error(`Maximum quantity (${PRODUCT.MAX_QUANTITY}) exceeded`)
      }
      rawCart[existingItemIndex].quantity = newQuantity
      rawCart[existingItemIndex].updatedAt = new Date().toISOString()
    } else {
      // Add new item (only ID and quantity)
      rawCart.push({
        productId,
        quantity,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    
    await saveCart(rawCart)
    return { success: true }
  } catch (error) {
    errorHandler.error('Product could not be added to cart', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update cart item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity (will be removed if 0 or negative)
 */
export const updateCartItem = async (productId, quantity) => {
  try {
    // Input validation
    if (!productId || typeof productId !== 'string') {
      throw new Error('Invalid product ID')
    }
    
    if (quantity > PRODUCT.MAX_QUANTITY) {
      throw new Error(`Maximum quantity (${PRODUCT.MAX_QUANTITY}) exceeded`)
    }
    
    const rawCart = await getRawCart()
    const itemIndex = rawCart.findIndex(item => item.productId === productId)
    
    if (itemIndex === -1) {
      return { success: false, error: 'Item not found in cart' }
    }
    
    if (quantity <= 0) {
      // Remove item
      rawCart.splice(itemIndex, 1)
    } else {
      // Update quantity
      rawCart[itemIndex].quantity = quantity
      rawCart[itemIndex].updatedAt = new Date().toISOString()
    }
    
    await saveCart(rawCart)
    return { success: true }
  } catch (error) {
    errorHandler.error('Cart item could not be updated', error)
    return { success: false, error: error.message }
  }
}

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 */
export const removeFromCart = async (productId) => {
  try {
    if (!productId || typeof productId !== 'string') {
      throw new Error('Invalid product ID')
    }
    
    const rawCart = await getRawCart()
    const filteredCart = rawCart.filter(item => item.productId !== productId)
    
    await saveCart(filteredCart)
    return { success: true }
  } catch (error) {
    errorHandler.error('Item could not be removed from cart', error)
    return { success: false, error: error.message }
  }
}

/**
 * Clear entire cart
 */
export const clearCart = async () => {
  try {
    await saveCart([])
    return { success: true }
  } catch (error) {
    errorHandler.error('Cart could not be cleared', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get cart item count
 */
export const getCartItemCount = async () => {
  const cart = await getCart()
  return cart.reduce((total, item) => total + item.quantity, 0)
}

/**
 * Get cart total price
 */
export const getCartTotal = async () => {
  const cart = await getCart()
  return cart.reduce((total, item) => total + ((item.finalPrice || item.price) * item.quantity), 0)
}

/**
 * Merge guest cart into user cart after login
 * Should be called after successful login
 */
export const mergeGuestCart = async () => {
  const user = getCurrentUser()
  if (!user) return
  
  const guestCart = CookieManager.get(STORAGE.CART_COOKIE_NAME) || []
  if (guestCart.length === 0) return
  
  const userResult = await getUserDocument(user.uid)
  const userCart = (userResult.success && userResult.data.cart) ? userResult.data.cart : []
  
  // Merge carts
  guestCart.forEach(guestItem => {
    const existingItemIndex = userCart.findIndex(item => item.productId === guestItem.productId)
    
    if (existingItemIndex > -1) {
      // Add quantities
      userCart[existingItemIndex].quantity += guestItem.quantity
      userCart[existingItemIndex].updatedAt = new Date().toISOString()
    } else {
      // Add new item
      userCart.push(guestItem)
    }
  })
  
  // Save merged cart to Firestore
  await updateUserDocument(user.uid, { cart: userCart })
  
  // Clear guest cart cookie
  CookieManager.delete(STORAGE.CART_COOKIE_NAME)
  
  // Notify store of cart update
  if (updateStoreCallback) {
    await updateStoreCallback()
  }
}
