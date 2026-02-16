import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createDocument,
  getDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  queryDocuments,
  createUserDocument,
  getUserDocument,
  updateUserDocument,
  getAllUsers,
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  createOrder,
  getOrder,
  getAllOrders,
  getUserOrders,
  updateOrder
} from '@/services/firebase/db'

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => 'TIMESTAMP'),
  addDoc: vi.fn()
}))

// Mock Firebase Config
vi.mock('@/services/firebase/config', () => ({
  db: {}
}))

// Mock Models
vi.mock('@/models/User', () => ({
  User: class User {
    constructor(data) {
      Object.assign(this, data)
    }
    toFirestore() {
      return { ...this }
    }
  }
}))

vi.mock('@/models/Product', () => ({
  Product: class Product {
    constructor(data) {
      Object.assign(this, data)
      this._isValid = true
    }
    validate() {
      return { isValid: this._isValid, errors: this._isValid ? [] : ['Invalid data'] }
    }
    toFirestore() {
      return { ...this }
    }
  }
}))

vi.mock('@/models/Order', () => ({
  Order: class Order {
    constructor(data) {
      Object.assign(this, data)
    }
    validate() {
      return { isValid: true, errors: [] }
    }
    toFirestore() {
      return { ...this }
    }
  }
}))

// Mock Error Handler
vi.mock('@/services/utils/errorHandler', () => ({
  errorHandler: {
    error: vi.fn(),
    warn: vi.fn()
  }
}))

import * as firestore from 'firebase/firestore'

describe('createDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a document with provided ID', async () => {
    // Arrange
    const collectionName = 'users'
    const docId = 'user123'
    const data = { name: 'Test User', email: 'test@example.com' }

    firestore.doc.mockReturnValue({ id: docId })
    firestore.setDoc.mockResolvedValue()

    // Act
    const result = await createDocument(collectionName, data, docId)

    // Assert
    expect(result.success).toBe(true)
    expect(result.id).toBe(docId)
    expect(firestore.setDoc).toHaveBeenCalled()
  })

  it('should create a document with auto-generated ID', async () => {
    // Arrange
    const collectionName = 'products'
    const data = { name: 'Test Product', price: 99.99 }
    const generatedId = 'auto-generated-id'

    firestore.collection.mockReturnValue({})
    firestore.addDoc.mockResolvedValue({ id: generatedId })

    // Act
    const result = await createDocument(collectionName, data)

    // Assert
    expect(result.success).toBe(true)
    expect(result.id).toBe(generatedId)
    expect(firestore.addDoc).toHaveBeenCalled()
  })

  it('should handle creation errors', async () => {
    // Arrange
    const collectionName = 'users'
    const data = { name: 'Test User' }
    const errorMessage = 'Permission denied'

    firestore.doc.mockReturnValue({ id: 'user123' })
    firestore.setDoc.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await createDocument(collectionName, data, 'user123')

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })
})

describe('getDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully get an existing document', async () => {
    // Arrange
    const collectionName = 'users'
    const docId = 'user123'
    const docData = { name: 'Test User', email: 'test@example.com' }

    firestore.doc.mockReturnValue({ id: docId })
    firestore.getDoc.mockResolvedValue({
      exists: () => true,
      id: docId,
      data: () => docData
    })

    // Act
    const result = await getDocument(collectionName, docId)

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ id: docId, ...docData })
  })

  it('should return error when document does not exist', async () => {
    // Arrange
    const collectionName = 'users'
    const docId = 'nonexistent'

    firestore.doc.mockReturnValue({ id: docId })
    firestore.getDoc.mockResolvedValue({
      exists: () => false
    })

    // Act
    const result = await getDocument(collectionName, docId)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe('Document not found')
  })

  it('should handle get errors', async () => {
    // Arrange
    const collectionName = 'users'
    const docId = 'user123'
    const errorMessage = 'Network error'

    firestore.doc.mockReturnValue({ id: docId })
    firestore.getDoc.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await getDocument(collectionName, docId)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })
})

describe('getAllDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get all documents from a collection', async () => {
    // Arrange
    const collectionName = 'products'
    const mockDocs = [
      { id: 'prod1', data: () => ({ name: 'Product 1' }) },
      { id: 'prod2', data: () => ({ name: 'Product 2' }) }
    ]

    firestore.collection.mockReturnValue({})
    firestore.getDocs.mockResolvedValue({
      forEach: (callback) => mockDocs.forEach(callback)
    })

    // Act
    const result = await getAllDocuments(collectionName)

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(result.data[0]).toEqual({ id: 'prod1', name: 'Product 1' })
  })

  it('should handle get all errors', async () => {
    // Arrange
    const collectionName = 'products'
    const errorMessage = 'Permission denied'

    firestore.collection.mockReturnValue({})
    firestore.getDocs.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await getAllDocuments(collectionName)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })
})

describe('updateDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully update a document', async () => {
    // Arrange
    const collectionName = 'users'
    const docId = 'user123'
    const updateData = { name: 'Updated Name' }

    firestore.doc.mockReturnValue({ id: docId })
    firestore.updateDoc.mockResolvedValue()

    // Act
    const result = await updateDocument(collectionName, docId, updateData)

    // Assert
    expect(result.success).toBe(true)
    expect(firestore.updateDoc).toHaveBeenCalled()
  })

  it('should handle update errors', async () => {
    // Arrange
    const collectionName = 'users'
    const docId = 'user123'
    const updateData = { name: 'Updated Name' }
    const errorMessage = 'Document not found'

    firestore.doc.mockReturnValue({ id: docId })
    firestore.updateDoc.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await updateDocument(collectionName, docId, updateData)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })
})

describe('deleteDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully delete a document', async () => {
    // Arrange
    const collectionName = 'products'
    const docId = 'prod123'

    firestore.doc.mockReturnValue({ id: docId })
    firestore.deleteDoc.mockResolvedValue()

    // Act
    const result = await deleteDocument(collectionName, docId)

    // Assert
    expect(result.success).toBe(true)
    expect(firestore.deleteDoc).toHaveBeenCalled()
  })

  it('should handle delete errors', async () => {
    // Arrange
    const collectionName = 'products'
    const docId = 'prod123'
    const errorMessage = 'Permission denied'

    firestore.doc.mockReturnValue({ id: docId })
    firestore.deleteDoc.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await deleteDocument(collectionName, docId)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })
})

describe('queryDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should query documents with conditions', async () => {
    // Arrange
    const collectionName = 'products'
    const conditions = [['category', '==', 'electronics']]
    const mockDocs = [
      { id: 'prod1', data: () => ({ name: 'Product 1', category: 'electronics' }) }
    ]

    firestore.collection.mockReturnValue({})
    firestore.where.mockReturnValue({})
    firestore.query.mockReturnValue({})
    firestore.getDocs.mockResolvedValue({
      forEach: (callback) => mockDocs.forEach(callback)
    })

    // Act
    const result = await queryDocuments(collectionName, conditions)

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(firestore.where).toHaveBeenCalledWith('category', '==', 'electronics')
  })

  it('should query with orderBy and limit', async () => {
    // Arrange
    const collectionName = 'orders'
    const conditions = []
    const orderByField = 'createdAt'
    const limitCount = 10
    const mockDocs = []

    firestore.collection.mockReturnValue({})
    firestore.orderBy.mockReturnValue({})
    firestore.limit.mockReturnValue({})
    firestore.query.mockReturnValue({})
    firestore.getDocs.mockResolvedValue({
      forEach: (callback) => mockDocs.forEach(callback)
    })

    // Act
    const result = await queryDocuments(collectionName, conditions, orderByField, limitCount)

    // Assert
    expect(result.success).toBe(true)
    expect(firestore.orderBy).toHaveBeenCalledWith(orderByField)
    expect(firestore.limit).toHaveBeenCalledWith(limitCount)
  })

  it('should handle query errors', async () => {
    // Arrange
    const collectionName = 'products'
    const errorMessage = 'Query failed'

    firestore.collection.mockReturnValue({})
    firestore.getDocs.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await queryDocuments(collectionName)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })
})

describe('User Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create user document', async () => {
    // Arrange
    const userId = 'user123'
    const userData = { email: 'test@example.com', displayName: 'Test User' }

    firestore.doc.mockReturnValue({ id: userId })
    firestore.setDoc.mockResolvedValue()

    // Act
    const result = await createUserDocument(userId, userData)

    // Assert
    expect(result.success).toBe(true)
    expect(result.id).toBe(userId)
  })

  it('should get user document', async () => {
    // Arrange
    const userId = 'user123'
    const userData = { email: 'test@example.com', displayName: 'Test User' }

    firestore.doc.mockReturnValue({ id: userId })
    firestore.getDoc.mockResolvedValue({
      exists: () => true,
      id: userId,
      data: () => userData
    })

    // Act
    const result = await getUserDocument(userId)

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('should update user document', async () => {
    // Arrange
    const userId = 'user123'
    const updateData = { displayName: 'Updated Name' }

    firestore.doc.mockReturnValue({ id: userId })
    firestore.updateDoc.mockResolvedValue()

    // Act
    const result = await updateUserDocument(userId, updateData)

    // Assert
    expect(result.success).toBe(true)
  })

  it('should get all users', async () => {
    // Arrange
    const mockDocs = [
      { id: 'user1', data: () => ({ email: 'user1@example.com' }) },
      { id: 'user2', data: () => ({ email: 'user2@example.com' }) }
    ]

    firestore.collection.mockReturnValue({})
    firestore.getDocs.mockResolvedValue({
      forEach: (callback) => mockDocs.forEach(callback)
    })

    // Act
    const result = await getAllUsers()

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
  })
})

describe('Product Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create product', async () => {
    // Arrange
    const productData = { name: 'Test Product', price: 99.99, category: 'electronics' }

    firestore.collection.mockReturnValue({})
    firestore.addDoc.mockResolvedValue({ id: 'prod123' })

    // Act
    const result = await createProduct(productData)

    // Assert
    expect(result.success).toBe(true)
    expect(result.id).toBe('prod123')
  })

  it('should reject invalid product', async () => {
    // Arrange
    vi.doMock('@/models/Product', () => ({
      Product: class Product {
        constructor(data) {
          Object.assign(this, data)
        }
        validate() {
          return { isValid: false, errors: ['Invalid price'] }
        }
        toFirestore() {
          return { ...this }
        }
      }
    }))

    // Re-import to get mocked version
    const { createProduct: createProductMocked } = await import('@/services/firebase/db?import=' + Date.now())
    const productData = { name: 'Test Product', price: -10 }

    // Act
    const result = await createProductMocked(productData)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid')
  })

  it('should get product', async () => {
    // Arrange
    const productId = 'prod123'
    const productData = { name: 'Test Product', price: 99.99 }

    firestore.doc.mockReturnValue({ id: productId })
    firestore.getDoc.mockResolvedValue({
      exists: () => true,
      id: productId,
      data: () => productData
    })

    // Act
    const result = await getProduct(productId)

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('should get all products', async () => {
    // Arrange
    const mockDocs = [
      { id: 'prod1', data: () => ({ name: 'Product 1' }) },
      { id: 'prod2', data: () => ({ name: 'Product 2' }) }
    ]

    firestore.collection.mockReturnValue({})
    firestore.getDocs.mockResolvedValue({
      forEach: (callback) => mockDocs.forEach(callback)
    })

    // Act
    const result = await getAllProducts()

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
  })

  it('should get products by category', async () => {
    // Arrange
    const category = 'electronics'
    const mockDocs = [
      { id: 'prod1', data: () => ({ name: 'Product 1', category }) }
    ]

    firestore.collection.mockReturnValue({})
    firestore.where.mockReturnValue({})
    firestore.query.mockReturnValue({})
    firestore.getDocs.mockResolvedValue({
      forEach: (callback) => mockDocs.forEach(callback)
    })

    // Act
    const result = await getProductsByCategory(category)

    // Assert
    expect(result.success).toBe(true)
    expect(firestore.where).toHaveBeenCalledWith('category', '==', category)
  })
})

describe('Order Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create order', async () => {
    // Arrange
    const orderData = {
      userId: 'user123',
      items: [{ productId: 'prod1', quantity: 2 }],
      total: 199.98
    }

    firestore.collection.mockReturnValue({})
    firestore.addDoc.mockResolvedValue({ id: 'order123' })

    // Act
    const result = await createOrder(orderData)

    // Assert
    expect(result.success).toBe(true)
    expect(result.id).toBe('order123')
  })

  it('should get order', async () => {
    // Arrange
    const orderId = 'order123'
    const orderData = { userId: 'user123', total: 199.98 }

    firestore.doc.mockReturnValue({ id: orderId })
    firestore.getDoc.mockResolvedValue({
      exists: () => true,
      id: orderId,
      data: () => orderData
    })

    // Act
    const result = await getOrder(orderId)

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('should get all orders', async () => {
    // Arrange
    const mockDocs = [
      { id: 'order1', data: () => ({ userId: 'user1' }) },
      { id: 'order2', data: () => ({ userId: 'user2' }) }
    ]

    firestore.collection.mockReturnValue({})
    firestore.getDocs.mockResolvedValue({
      forEach: (callback) => mockDocs.forEach(callback)
    })

    // Act
    const result = await getAllOrders()

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
  })

  it('should get user orders', async () => {
    // Arrange
    const userId = 'user123'
    const mockDocs = [
      { id: 'order1', data: () => ({ userId, total: 99.99 }) }
    ]

    firestore.collection.mockReturnValue({})
    firestore.where.mockReturnValue({})
    firestore.orderBy.mockReturnValue({})
    firestore.query.mockReturnValue({})
    firestore.getDocs.mockResolvedValue({
      forEach: (callback) => mockDocs.forEach(callback)
    })

    // Act
    const result = await getUserOrders(userId)

    // Assert
    expect(result.success).toBe(true)
    expect(firestore.where).toHaveBeenCalledWith('userId', '==', userId)
  })

  it('should update order', async () => {
    // Arrange
    const orderId = 'order123'
    const updateData = { status: 'shipped' }

    firestore.doc.mockReturnValue({ id: orderId })
    firestore.updateDoc.mockResolvedValue()

    // Act
    const result = await updateOrder(orderId, updateData)

    // Assert
    expect(result.success).toBe(true)
  })
})
