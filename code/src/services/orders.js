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
import { db } from './config'
import { Order } from '../models/Order'

/**
 * Create a new order
 * @param {object} orderData - Order data
 * @returns {Promise<object>} Result with order ID
 */
export const createOrder = async (orderData) => {
  try {
    if (!orderData.items || orderData.items.length === 0) {
      return { 
        success: false, 
        error: 'Order must contain at least one item' 
      }
    }

    if (!orderData.userEmail || !orderData.userEmail.includes('@')) {
      return { 
        success: false, 
        error: 'Valid email address is required' 
      }
    }

    const orderRef = collection(db, 'orders')
    
    const cleanedItems = (orderData.items || []).map(item => {
      if (!item.productId && !item.id) {
        throw new Error('Product ID is required for all items')
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
      status: orderData.status || 'pending',
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
    console.error('Error creating order:', error)
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
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
    const orderRef = doc(db, 'orders', orderId)
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
    console.error('Error getting order:', error)
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
    const ordersRef = collection(db, 'orders')
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
    console.error('Error getting user orders:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all orders (Admin only)
 * @returns {Promise<object>} Result with all orders
 */
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, 'orders')
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
    console.error('Error getting all orders:', error)
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
    const orderRef = doc(db, 'orders', orderId)
    
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
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
    const orderRef = doc(db, 'orders', orderId)
    
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error updating order:', error)
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
    const orderRef = doc(db, 'orders', orderId)
    
    await updateDoc(orderRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return { success: false, error: error.message }
  }
}
