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
    console.error(`Error creating document in ${collectionName}:`, error)
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
    console.error(`Error getting document from ${collectionName}:`, error)
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
    console.error(`Error getting all documents from ${collectionName}:`, error)
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
    console.error(`Error updating document in ${collectionName}:`, error)
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
    console.error(`Error deleting document from ${collectionName}:`, error)
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
    console.error(`Error querying documents from ${collectionName}:`, error)
    return { success: false, error: error.message }
  }
}

// ==================== USER OPERATIONS ====================

/**
 * Create user document
 */
export const createUserDocument = async (userId, userData) => {
  return await createDocument('users', userData, userId)
}

/**
 * Get user document
 */
export const getUserDocument = async (userId) => {
  return await getDocument('users', userId)
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
  return await getAllDocuments('users')
}

// ==================== PRODUCT OPERATIONS ====================

/**
 * Create product
 */
export const createProduct = async (productData) => {
  return await createDocument('products', productData)
}

/**
 * Get product
 */
export const getProduct = async (productId) => {
  return await getDocument('products', productId)
}

/**
 * Get all products
 */
export const getAllProducts = async () => {
  return await getAllDocuments('products')
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
  return await queryDocuments('products', [['category', '==', category]])
}

// ==================== ORDER OPERATIONS ====================

/**
 * Create order
 */
export const createOrder = async (orderData) => {
  return await createDocument('orders', orderData)
}

/**
 * Get order
 */
export const getOrder = async (orderId) => {
  return await getDocument('orders', orderId)
}

/**
 * Get all orders
 */
export const getAllOrders = async () => {
  return await getAllDocuments('orders')
}

/**
 * Get user orders
 */
export const getUserOrders = async (userId) => {
  return await queryDocuments('orders', [['userId', '==', userId]], 'createdAt')
}

/**
 * Update order
 */
export const updateOrder = async (orderId, orderData) => {
  return await updateDocument('orders', orderId, orderData)
}
