import { updateUserDocument, getUserDocument, getDocument } from './db'
import { getCurrentUser } from './auth'

const CART_COOKIE_NAME = 'webshop_cart'
const CART_COOKIE_DAYS = 30

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

// ==================== COOKIE HELPERS ====================

/**
 * Set a cookie
 */
const setCookie = (name, value, days) => {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${JSON.stringify(value)};${expires};path=/`
}

/**
 * Get a cookie
 */
const getCookie = (name) => {
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim()
    if (cookie.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(cookie.substring(nameEQ.length))
      } catch (e) {
        return null
      }
    }
  }
  return null
}

/**
 * Delete a cookie
 */
const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

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
    return getCookie(CART_COOKIE_NAME) || []
  }
}

/**
 * Get cart items with full product details
 * Fetches product data from Firestore and filters out deleted products
 */
export const getCart = async () => {
  const rawCart = await getRawCart()
  const cartWithDetails = []

  for (const item of rawCart) {
    try {
      const productResult = await getDocument('products', item.productId)
      
      // Only add item if product still exists
      if (productResult.success && productResult.data) {
        cartWithDetails.push({
          productId: item.productId,
          quantity: item.quantity,
          addedAt: item.addedAt,
          updatedAt: item.updatedAt,
          // Product details
          name: productResult.data.name,
          price: productResult.data.price,
          imageUrl: productResult.data.imageUrl || productResult.data.image,
          stock: productResult.data.stock
        })
      }
    } catch (error) {
      console.warn(`Product ${item.productId} not found, skipping...`)
    }
  }

  return cartWithDetails
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
    setCookie(CART_COOKIE_NAME, cart, CART_COOKIE_DAYS)
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
    const rawCart = await getRawCart()
    
    // Check if product already exists in cart
    const existingItemIndex = rawCart.findIndex(item => item.productId === productId)
    
    if (existingItemIndex > -1) {
      // Update quantity
      rawCart[existingItemIndex].quantity += quantity
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
    console.error('Error adding to cart:', error)
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
    console.error('Error updating cart item:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 */
export const removeFromCart = async (productId) => {
  try {
    const rawCart = await getRawCart()
    const filteredCart = rawCart.filter(item => item.productId !== productId)
    
    await saveCart(filteredCart)
    return { success: true }
  } catch (error) {
    console.error('Error removing from cart:', error)
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
    console.error('Error clearing cart:', error)
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
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
}

/**
 * Merge guest cart into user cart after login
 * Should be called after successful login
 */
export const mergeGuestCart = async () => {
  const user = getCurrentUser()
  if (!user) return
  
  const guestCart = getCookie(CART_COOKIE_NAME) || []
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
  deleteCookie(CART_COOKIE_NAME)
  
  // Notify store of cart update
  if (updateStoreCallback) {
    await updateStoreCallback()
  }
}
