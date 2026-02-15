import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { Order } from '../../models/Order'
import { errorHandler } from '../utils/errorHandler'
import { COLLECTIONS, ORDER_STATUS, ERROR_MESSAGES } from '../../constants'
import { isValidEmail } from '../../utils'

/**
 * Create a new order
 * @param {object} orderData - Order data
 * @returns {Promise<object>} Result with order ID
 */
export const createOrder = async (orderData) => {
  try {
    // Input validation
    if (!orderData || typeof orderData !== 'object') {
      throw new Error('Invalid order data')
    }
    
    if (!orderData.items || orderData.items.length === 0) {
      return { 
        success: false, 
        error: 'Order must contain at least one item' 
      }
    }

    if (!orderData.userEmail || !isValidEmail(orderData.userEmail)) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.INVALID_EMAIL 
      }
    }

    const orderRef = collection(db, COLLECTIONS.ORDERS)
    
    const cleanedItems = (orderData.items || []).map(item => {
      if (!item.productId && !item.id) {
        throw new Error('Invalid item in order: missing productId or id')
      }

      const cleanItem = {
        id: item.id || '',
        productId: item.productId || item.id || '',
        name: item.name || 'Unknown Product',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      }
      
      if (item.image) cleanItem.image = item.image
      if (item.category) cleanItem.category = item.category
      if (item.finalPrice) cleanItem.finalPrice = Number(item.finalPrice)
      if (item.offer) cleanItem.offer = item.offer
      
      return cleanItem
    })
    
    // Clean shipping address - remove undefined values
    const cleanedAddress = {}
    if (orderData.shippingAddress) {
      const addr = orderData.shippingAddress
      if (addr.firstName) cleanedAddress.firstName = addr.firstName
      if (addr.lastName) cleanedAddress.lastName = addr.lastName
      if (addr.email) cleanedAddress.email = addr.email
      if (addr.phone) cleanedAddress.phone = addr.phone
      if (addr.street) cleanedAddress.street = addr.street
      if (addr.postalCode) cleanedAddress.postalCode = addr.postalCode
      if (addr.city) cleanedAddress.city = addr.city
      if (addr.country) cleanedAddress.country = addr.country
    }
    
    const cleanedData = {
      userId: orderData.userId || null,
      userEmail: orderData.userEmail || '',
      items: cleanedItems,
      shippingAddress: cleanedAddress,
      shippingMethod: orderData.shippingMethod || '',
      shippingCost: Number(orderData.shippingCost) || 0,
      paymentMethod: orderData.paymentMethod || '',
      subtotal: Number(orderData.subtotal) || 0,
      total: Number(orderData.total) || 0,
      status: orderData.status || ORDER_STATUS.PENDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(orderRef, cleanedData)
    
    return { 
      success: true, 
      orderId: docRef.id,
      order: { ...cleanedData, id: docRef.id }
    }
  } catch (error) {
    errorHandler.error('Order could not be created', error)
    return { 
      success: false, 
      error: error.message || ERROR_MESSAGES.ORDER_CREATION_FAILED 
    }
  }
}

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<object>} Result with order data
 */
export const getOrder = async (orderId) => {
  try {
    // Input validation
    if (!orderId || typeof orderId !== 'string') {
      throw new Error('Invalid order ID')
    }
    
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId)
    const orderSnap = await getDoc(orderRef)
    
    if (orderSnap.exists()) {
      const orderData = { id: orderSnap.id, ...orderSnap.data() }
      return { 
        success: true, 
        order: new Order(orderData)
      }
    } else {
      return { success: false, error: 'Order not found' }
    }
  } catch (error) {
    errorHandler.error('Order could not be loaded', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all orders for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Result with orders array
 */
export const getUserOrders = async (userId) => {
  try {
    // Input validation
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID')
    }
    
    const ordersRef = collection(db, COLLECTIONS.ORDERS)
    const q = query(
      ordersRef, 
      where('userId', '==', userId)
    )
    
    const querySnapshot = await getDocs(q)
    const orders = []
    
    querySnapshot.forEach((doc) => {
      orders.push(new Order({ id: doc.id, ...doc.data() }))
    })
    
    // Sort by createdAt on client side
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0)
      const dateB = b.createdAt?.toDate?.() || new Date(0)
      return dateB - dateA
    })
    
    return { success: true, orders }
  } catch (error) {
    errorHandler.error('User orders could not be loaded', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all orders (Admin only)
 * @returns {Promise<object>} Result with all orders
 */
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS)
    const querySnapshot = await getDocs(ordersRef)
    const orders = []
    
    querySnapshot.forEach((doc) => {
      orders.push(new Order({ id: doc.id, ...doc.data() }))
    })
    
    // Sort by createdAt on client side
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0)
      const dateB = b.createdAt?.toDate?.() || new Date(0)
      return dateB - dateA
    })
    
    return { success: true, orders }
  } catch (error) {
    errorHandler.error('All orders could not be loaded', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New status
 * @returns {Promise<object>} Result
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    // Input validation
    if (!orderId || typeof orderId !== 'string') {
      throw new Error('Invalid order ID')
    }
    
    if (!newStatus || typeof newStatus !== 'string') {
      throw new Error('Invalid status')
    }
    
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId)
    
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    })
    
    return { success: true }
  } catch (error) {
    errorHandler.error('Order status could not be updated', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update order
 * @param {string} orderId - Order ID
 * @param {object} updates - Updates to apply
 * @returns {Promise<object>} Result
 */
export const updateOrder = async (orderId, updates) => {
  try {
    // Input validation
    if (!orderId || typeof orderId !== 'string') {
      throw new Error('Invalid order ID')
    }
    
    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid update data')
    }
    
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId)
    
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    
    return { success: true }
  } catch (error) {
    errorHandler.error('Order could not be updated', error)
    return { success: false, error: error.message }
  }
}

/**
 * Cancel order
 * @param {string} orderId - Order ID
 * @returns {Promise<object>} Result
 */
export const cancelOrder = async (orderId) => {
  try {
    // Input validation
    if (!orderId || typeof orderId !== 'string') {
      throw new Error('Invalid order ID')
    }
    
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId)
    
    await updateDoc(orderRef, {
      status: ORDER_STATUS.CANCELLED,
      updatedAt: serverTimestamp()
    })
    
    return { success: true }
  } catch (error) {
    errorHandler.error('Order could not be cancelled', error)
    return { success: false, error: error.message }
  }
}
