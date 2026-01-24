import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  addDoc
} from 'firebase/firestore'
import { db } from './config'
import { User } from '../models/User'
import { Product } from '../models/Product'
import { Order } from '../models/Order'
import { errorHandler } from './errorHandler'

// ==================== GENERIC CRUD OPERATIONS ====================

/**
 * Create a document
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID (optional, auto-generated if not provided)
 * @param {object} data - Data to save
 */
export const createDocument = async (collectionName, data, docId = null) => {
  try {
    if (docId) {
      const docRef = doc(db, collectionName, docId)
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { success: true, id: docId }
    } else {
      const collectionRef = collection(db, collectionName)
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    }
  } catch (error) {
    errorHandler.error(`Document in ${collectionName} could not be created`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Get a document
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } }
    } else {
      return { success: false, error: 'Document not found' }
    }
  } catch (error) {
    errorHandler.error(`Document from ${collectionName} could not be loaded`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all documents from a collection
 * @param {string} collectionName - Collection name
 */
export const getAllDocuments = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName)
    const querySnapshot = await getDocs(collectionRef)
    
    const documents = []
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() })
    })
    
    return { success: true, data: documents }
  } catch (error) {
    errorHandler.error(`Documents from ${collectionName} could not be loaded`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Update a document
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @param {object} data - Data to update
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    errorHandler.error(`Document in ${collectionName} could not be updated`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a document
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId)
    await deleteDoc(docRef)
    return { success: true }
  } catch (error) {
    errorHandler.error(`Document from ${collectionName} could not be deleted`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Query documents with conditions
 * @param {string} collectionName - Collection name
 * @param {array} conditions - Array of conditions [field, operator, value]
 * @param {string} orderByField - Field to sort by (optional)
 * @param {number} limitCount - Maximum number of results (optional)
 */
export const queryDocuments = async (collectionName, conditions = [], orderByField = null, limitCount = null) => {
  try {
    let q = collection(db, collectionName)
    
    // Add conditions
    const constraints = []
    conditions.forEach(([field, operator, value]) => {
      constraints.push(where(field, operator, value))
    })
    
    // Add sorting
    if (orderByField) {
      constraints.push(orderBy(orderByField))
    }
    
    // Add limit
    if (limitCount) {
      constraints.push(limit(limitCount))
    }
    
    if (constraints.length > 0) {
      q = query(q, ...constraints)
    }
    
    const querySnapshot = await getDocs(q)
    const documents = []
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() })
    })
    
    return { success: true, data: documents }
  } catch (error) {
    errorHandler.error(`Documents from ${collectionName} could not be queried`, error)
    return { success: false, error: error.message }
  }
}

// ==================== USER OPERATIONS ====================

/**
 * Create user document
 */
export const createUserDocument = async (userId, userData) => {
  const user = new User({ ...userData, id: userId })
  return await createDocument('users', user.toFirestore(), userId)
}

/**
 * Get user document
 */
export const getUserDocument = async (userId) => {
  const result = await getDocument('users', userId)
  if (result.success) {
    result.data = new User(result.data)
  }
  return result
}

/**
 * Update user document
 */
export const updateUserDocument = async (userId, userData) => {
  return await updateDocument('users', userId, userData)
}

/**
 * Get all users
 */
export const getAllUsers = async () => {
  const result = await getAllDocuments('users')
  if (result.success) {
    result.data = result.data.map(data => new User(data))
  }
  return result
}

// ==================== PRODUCT OPERATIONS ====================

/**
 * Create product
 */
export const createProduct = async (productData) => {
  const product = new Product(productData)
  const validation = product.validate()
  
  if (!validation.isValid) {
    return { success: false, error: validation.errors.join(', ') }
  }
  
  return await createDocument('products', product.toFirestore())
}

/**
 * Get product
 */
export const getProduct = async (productId) => {
  const result = await getDocument('products', productId)
  if (result.success) {
    result.data = new Product(result.data)
  }
  return result
}

/**
 * Get all products
 */
export const getAllProducts = async () => {
  const result = await getAllDocuments('products')
  if (result.success) {
    result.data = result.data.map(data => new Product(data))
  }
  return result
}

/**
 * Update product
 */
export const updateProduct = async (productId, productData) => {
  return await updateDocument('products', productId, productData)
}

/**
 * Delete product
 */
export const deleteProduct = async (productId) => {
  return await deleteDocument('products', productId)
}

/**
 * Get products by category
 */
export const getProductsByCategory = async (category) => {
  const result = await queryDocuments('products', [['category', '==', category]])
  if (result.success) {
    result.data = result.data.map(data => new Product(data))
  }
  return result
}

// ==================== ORDER OPERATIONS ====================

/**
 * Create order
 */
export const createOrder = async (orderData) => {
  const order = new Order(orderData)
  const validation = order.validate()
  
  if (!validation.isValid) {
    return { success: false, error: validation.errors.join(', ') }
  }
  
  return await createDocument('orders', order.toFirestore())
}

/**
 * Get order
 */
export const getOrder = async (orderId) => {
  const result = await getDocument('orders', orderId)
  if (result.success) {
    result.data = new Order(result.data)
  }
  return result
}

/**
 * Get all orders
 */
export const getAllOrders = async () => {
  const result = await getAllDocuments('orders')
  if (result.success) {
    result.data = result.data.map(data => new Order(data))
  }
  return result
}

/**
 * Get user orders
 */
export const getUserOrders = async (userId) => {
  const result = await queryDocuments('orders', [['userId', '==', userId]], 'createdAt')
  if (result.success) {
    result.data = result.data.map(data => new Order(data))
  }
  return result
}

/**
 * Update order
 */
export const updateOrder = async (orderId, orderData) => {
  return await updateDocument('orders', orderId, orderData)
}
